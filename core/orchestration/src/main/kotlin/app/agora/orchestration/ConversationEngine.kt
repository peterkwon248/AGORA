package app.agora.orchestration

import app.agora.inference.GenerateEvent
import app.agora.inference.GenerateRequest
import app.agora.inference.GenerationScope
import app.agora.inference.GenerationTask
import app.agora.inference.InferenceProvider
import app.agora.inference.ScopeType
import app.agora.inference.collectOutcome
import app.agora.philosophers.Level
import app.agora.philosophers.PhilosopherRegistry
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.util.UUID

/** 화면·저장 계층이 받는 사건. 저장은 [Committed]에서만 한다. */
sealed interface FlowEvent {
    data class Typing(val speakerId: String) : FlowEvent
    data class Token(val speakerId: String, val text: String) : FlowEvent
    data class Committed(val speakerId: String, val text: String, val respondTo: String?, val autonomous: Boolean, val generationId: String) : FlowEvent
    data class Silent(val speakerId: String) : FlowEvent
    data class GuestLeft(val speakerId: String) : FlowEvent
    data class Failed(val speakerId: String, val event: GenerateEvent) : FlowEvent
    /** 새 사용자 메시지 등으로 문맥 리비전이 바뀌어 남은 차례를 버림 */
    data object Superseded : FlowEvent
    data class Finished(val autonomousTurnsUsed: Int, val softenedAfter: Boolean) : FlowEvent
}

/**
 * Sprint 0 최소 대화 엔진: 사용자 메시지 하나에 대한 한 흐름(직접 답 → 자율 이어 말하기).
 * - 각 차례 전에 [currentRevision]이 시작 때와 같은지 확인한다(설계서 20.5: 최신 사용자 메시지 우선).
 * - 완성된 생성만 [FlowEvent.Committed]로 내보낸다. 취소·실패한 부분 문장은 저장하지 않는다.
 * 영구 저장·방 전환·일시정지 상태는 Sprint 1에서 이 위에 얹는다.
 */
class ConversationEngine(
    private val registry: PhilosopherRegistry,
    private val provider: InferenceProvider,
    private val composer: PromptComposer = PromptComposer(registry),
    private val maxOutputTokens: Int = 200,
    private val deadlineMs: Long = 60_000,
) {
    fun run(
        roomId: String,
        roomKind: RoomKind,
        locale: String,
        input: TurnInput,
        transcript: List<TranscriptLine>,
        startRevision: Long,
        currentRevision: () -> Long,
    ): Flow<FlowEvent> = flow {
        val plan = SpeakerSelector.plan(input.copy(debateAffinity = input.debateAffinity.ifEmpty { affinityOf(input.members) }))
        val log = transcript.toMutableList()
        val spoken = mutableListOf<String>()
        /** 이번 흐름에서 차례를 받은 사람(침묵 포함) */
        val attempted = mutableListOf<String>()
        /** 직전 발언 이후 침묵한 사람 — 새 발언이 나오면 비운다 */
        val silentSinceLast = mutableSetOf<String>()
        val members = input.members.toMutableList()
        var debateTurnsLeft = plan.maxDebateTurns
        var autoUsed = 0
        var last: String? = null

        suspend fun turn(speakerId: String, respondTo: String?, autonomous: Boolean): Boolean {
            if (currentRevision() != startRevision) { emit(FlowEvent.Superseded); return false }
            val pack = registry.get(speakerId) ?: return true
            val debateAllowed = debateTurnsLeft > 0
            val others = members.map { it.philosopherId }.filter { it != speakerId }
            val messages = composer.compose(pack, locale, log, roomKind, others, respondTo, debateAllowed, plan.intensity, mayPass = autonomous)
            val gid = UUID.randomUUID().toString()
            emit(FlowEvent.Typing(speakerId))
            val req = GenerateRequest(
                generationId = gid,
                scope = GenerationScope(if (roomKind == RoomKind.DM) ScopeType.DM else ScopeType.ROOM, roomId),
                speakerId = speakerId,
                task = GenerationTask.CHAT,
                locale = locale,
                personaVersion = pack.packVersion,
                contextRefs = emptyList(),
                messages = messages,
                maxOutputTokens = maxOutputTokens,
                deadlineMs = deadlineMs,
            )
            val outcome = provider.generate(req).collectOutcome { /* 토큰은 아래에서 한 번에 */ }
            if (currentRevision() != startRevision) { emit(FlowEvent.Superseded); return false }
            val raw = outcome.text
            val text = raw?.let(::clean)
            attempted += speakerId
            when {
                raw == null || text == null -> { emit(FlowEvent.Failed(speakerId, outcome.terminal)); return false }
                isPass(raw) || text.isEmpty() -> emit(FlowEvent.Silent(speakerId))
                else -> {
                    emit(FlowEvent.Committed(speakerId, text, respondTo, autonomous, gid))
                    log += TranscriptLine(speakerId, text)
                    spoken += speakerId
                    last = speakerId
                    if (autonomous && respondTo != null && debateAllowed) debateTurnsLeft--
                }
            }
            return true
        }

        for (id in plan.direct) if (!turn(id, respondTo = null, autonomous = false)) return@flow

        var budget = plan.autonomyBudget
        while (budget > 0) {
            // 직전 발언 뒤에 이미 침묵한 사람은 다시 부르지 않는다. 모두 침묵했으면 대화가 잠잠해진 것.
            val eligible = members.filter { it.philosopherId !in silentSinceLast }
            val next = SpeakerSelector.nextAutonomous(eligible, attempted, last, budget, input.relevance) ?: break
            budget--
            autoUsed++
            val before = last
            if (!turn(next, respondTo = last, autonomous = true)) return@flow
            if (last == before) silentSinceLast += next else silentSinceLast.clear()
        }

        // 임시 손님: 이번 흐름에서 말했으면 퇴장
        for (m in members.filter { it.temporary && it.philosopherId in spoken }) emit(FlowEvent.GuestLeft(m.philosopherId))

        emit(FlowEvent.Finished(autoUsed, plan.softenedAfter))
    }

    private fun affinityOf(members: List<Member>): Map<String, Int> = members.associate { m ->
        m.philosopherId to when (registry.get(m.philosopherId)?.persona?.debateAffinity) { Level.HIGH -> 2; Level.MEDIUM -> 1; else -> 0 }
    }

    /** `[PASS]`, `PASS`, `(PASS)`, `PASS.` 처럼 침묵 신호만 있는 답. 문장 속 단어 'pass'는 침묵이 아니다. */
    private fun isPass(raw: String): Boolean =
        raw.contains(PASS_TOKEN) || raw.trim().matches(Regex("^[\\[(]?\\s*PASS\\s*[\\])]?[.!]?$", RegexOption.IGNORE_CASE))

    /** 모델이 붙이는 이름표·따옴표를 떼어 낸다. 내용은 바꾸지 않는다. */
    private fun clean(raw: String): String {
        var t = raw.trim()
        t = t.replace(Regex("^\\[[^\\]]{1,20}]\\s*"), "")
        t = t.replace(Regex("^[^\\s:：]{1,12}[:：]\\s*"), "")
        if (t.length >= 2 && t.first() in "\"“'" && t.last() in "\"”'") t = t.substring(1, t.length - 1).trim()
        return t
    }
}
