package app.agora.eval

import app.agora.orchestration.Autonomy
import app.agora.orchestration.ConversationEngine
import app.agora.orchestration.DebateFrequency
import app.agora.orchestration.DebateIntensity
import app.agora.orchestration.FlowEvent
import app.agora.orchestration.IntentSignal
import app.agora.orchestration.Member
import app.agora.orchestration.RoomKind
import app.agora.orchestration.RoomPolicy
import app.agora.orchestration.TranscriptLine
import app.agora.orchestration.TurnInput
import app.agora.philosophers.PhilosopherRegistry

/** 평가 문장(설계서 22.3) 중 두 철학자 방에 맞는 것. 멘션은 자동완성으로 고른 것처럼 ID로 넣는다. */
data class EvalCase(
    val id: String,
    val locale: String,
    val text: String,
    val mentions: List<String> = emptyList(),
    val signals: Set<IntentSignal> = emptySet(),
    val policy: RoomPolicy = RoomPolicy(),
)

/**
 * 시험할 수 없는 문장: 4(복수 멘션 — 카뮈·시오랑 팩 없음), 7(방 간 격리), 8·9·11·12·13(노트·댓글 — Sprint 1 이후).
 * 3번은 이 방에 없는 카뮈 대신 니체 멘션으로 바꿨다.
 */
val EVAL_CASES = listOf(
    EvalCase("01-yoojaeha", "ko", "빗속의 출근길에서 오랜만에 유재하를 만났다. 오랜만에 듣는 그의 목소리가 더 깊고 묵직하다."),
    EvalCase("02-coffee", "ko", "오늘 커피가 유난히 맛있어."),
    EvalCase("03-mention", "ko", "@니체 쇼펜하우어 말에 대해 넌 어떻게 생각해?", mentions = listOf("nietzsche")),
    EvalCase("05-effort", "ko", "노력해도 결과가 없다면 노력은 무의미할까?",
        policy = RoomPolicy(Autonomy.ACTIVE, DebateFrequency.NORMAL, DebateIntensity.BALANCED)),
    EvalCase("06-change", "ko", "잠깐, 그 얘기 말고 오늘 들은 노래 이야기하자.", signals = setOf(IntentSignal.CHANGE_TOPIC)),
    EvalCase("10-en-song", "en", "I heard an old song on my rainy commute, and it felt different this time."),
)

/**
 * 평가 문장을 차례로 돌려 마크다운 기록을 만든다. 각 문장은 빈 방에서 시작한다.
 * [clock]은 밀리초(기기마다 다른 시계를 쓰게). 첫 글자까지 시간은 차례 시작('쓰는 중') → 첫 조각.
 */
suspend fun runEval(
    engine: ConversationEngine,
    registry: PhilosopherRegistry,
    title: String,
    note: String,
    clock: () -> Long,
    cases: List<EvalCase> = EVAL_CASES,
    onCaseDone: (String) -> Unit = {},
): String {
    val members = listOf(Member("nietzsche"), Member("schopenhauer"))
    val out = StringBuilder()
    out.appendLine("# $title")
    out.appendLine()
    out.appendLine("> $note")
    out.appendLine()
    val firstTokenMs = mutableListOf<Long>()
    for (c in cases) {
        val name = { id: String? -> if (id == null) (if (c.locale == "en") "User" else "나") else registry.require(id).display.name.get(c.locale) }
        out.appendLine("## ${c.id}")
        out.appendLine()
        out.appendLine("- 방 설정: 이어 말하기 ${c.policy.autonomy}, 논쟁 ${c.policy.debateFrequency}/${c.policy.debateIntensity}")
        out.appendLine()
        out.appendLine("**[${name(null)}]** ${c.text}")
        out.appendLine()
        val started = clock()
        var turnStart = started
        var gotToken = false
        engine.run("eval-room", RoomKind.GROUP, c.locale,
            TurnInput(RoomKind.GROUP, members, mentions = c.mentions, signals = c.signals, policy = c.policy),
            listOf(TranscriptLine(null, c.text)), 1, { 1 },
        ).collect { e ->
            when (e) {
                is FlowEvent.Typing -> { turnStart = clock(); gotToken = false }
                is FlowEvent.Token -> if (!gotToken) { gotToken = true; firstTokenMs += clock() - turnStart }
                is FlowEvent.Committed -> out.appendLine("**[${name(e.speakerId)}]**${if (e.autonomous) " ↪" else ""} ${e.text}\n")
                is FlowEvent.Silent -> out.appendLine("_(${name(e.speakerId)} 침묵)_\n")
                is FlowEvent.Failed -> out.appendLine("❌ ${name(e.speakerId)} 생성 실패: ${e.event}\n")
                is FlowEvent.Finished -> out.appendLine("_자율 차례 ${e.autonomousTurnsUsed}개 사용 · ${"%.1f".format((clock() - started) / 1e3)}초_\n")
                else -> Unit
            }
        }
        onCaseDone(c.id)
    }
    if (firstTokenMs.isNotEmpty()) {
        val sorted = firstTokenMs.sorted()
        out.appendLine("---")
        out.appendLine()
        out.appendLine("첫 글자까지(차례 ${sorted.size}번): 가운데값 ${"%.1f".format(sorted[sorted.size / 2] / 1e3)}초 · 가장 느림 ${"%.1f".format(sorted.last() / 1e3)}초")
    }
    return out.toString()
}
