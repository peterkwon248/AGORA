package app.agora.orchestration

/**
 * 누가 말할지 정하는 규칙. 시안 03_engine.js planTurns의 행동을 미리 쓴 문장 없이 옮긴 것.
 * 근거: docs/sprint0/02_prototype_behavior_spec.md 1장.
 * 철학자 이름을 코드에 쓰지 않는다 — 성향값(debateAffinity)과 관련도(relevance)만 본다.
 */
enum class RoomKind { GROUP, DM }

enum class Autonomy(val budget: Int) { OFF(0), CONTEXTUAL(2), ACTIVE(4) }

enum class DebateFrequency(val maxDebateTurns: Int) { OFF(0), RARE(1), NORMAL(2), FREQUENT(9) }

enum class DebateIntensity { GENTLE, BALANCED, RIGOROUS }

data class RoomPolicy(
    val autonomy: Autonomy = Autonomy.CONTEXTUAL,
    val debateFrequency: DebateFrequency = DebateFrequency.RARE,
    val debateIntensity: DebateIntensity = DebateIntensity.BALANCED,
    /** '좀 더 부드럽게' 이후 일상 화제가 나올 때까지 유지 */
    val softened: Boolean = false,
)

/** 동작을 바꾸는 사용자 의도. 판정은 규칙+모델 이중 확인(호출자 책임), 여기선 결과만 받는다. */
enum class IntentSignal { GREETING, THANKS, CHANGE_TOPIC, PRIVATE, SOFTEN }

data class Member(val philosopherId: String, val temporary: Boolean = false)

data class TurnInput(
    val roomKind: RoomKind,
    val members: List<Member>,
    /** 사용자가 자동완성으로 고른 멘션 — 순서 유지 */
    val mentions: List<String> = emptyList(),
    /** 사용자가 답장한 메시지의 작성자(철학자일 때만) */
    val replyToAuthor: String? = null,
    val signals: Set<IntentSignal> = emptySet(),
    /** 이번 메시지와 각 철학자의 관련도. 없으면 멤버 순서 */
    val relevance: Map<String, Double> = emptyMap(),
    /** 팩 persona.debate_affinity (LOW=0, MEDIUM=1, HIGH=2) */
    val debateAffinity: Map<String, Int> = emptyMap(),
    val lastPhilosopherSpeaker: String? = null,
    val policy: RoomPolicy = RoomPolicy(),
)

data class TurnPlan(
    /** 사용자에게 바로 답할 철학자들, 순서대로 */
    val direct: List<String>,
    /** 방 밖이라 초대 여부를 물어야 하는 멘션 */
    val needsInvite: List<String>,
    val autonomyBudget: Int,
    val maxDebateTurns: Int,
    val intensity: DebateIntensity,
    /** 이번 흐름 뒤 방에 남길 완화 상태 */
    val softenedAfter: Boolean,
)

object SpeakerSelector {
    private val SINGLE_REPLY = setOf(IntentSignal.GREETING, IntentSignal.THANKS, IntentSignal.CHANGE_TOPIC, IntentSignal.PRIVATE, IntentSignal.SOFTEN)
    private val NO_AUTONOMY = setOf(IntentSignal.PRIVATE, IntentSignal.SOFTEN, IntentSignal.GREETING, IntentSignal.THANKS)

    fun plan(input: TurnInput): TurnPlan {
        val memberIds = input.members.map { it.philosopherId }
        val signals = input.signals
        val direct = mutableListOf<String>()

        // 1) 멘션된 멤버 전원, 멘션 순서대로
        val mentioned = input.mentions.distinct()
        direct += mentioned.filter { it in memberIds }
        val needsInvite = mentioned.filter { it !in memberIds }

        // 2) 멘션이 없으면 답장 대상 1명
        if (direct.isEmpty() && input.replyToAuthor != null && input.replyToAuthor in memberIds) {
            direct += input.replyToAuthor
        }

        // 3) 둘 다 없으면 자동 선택
        if (direct.isEmpty() && needsInvite.isEmpty()) {
            val want = when {
                input.roomKind == RoomKind.DM -> 1
                signals.any { it in SINGLE_REPLY } -> 1
                memberIds.size > 2 -> 2
                else -> 1
            }
            if (IntentSignal.SOFTEN in signals) {
                // 논쟁 성향이 가장 높은 멤버가 먼저 부드럽게 받는다
                memberIds.maxByOrNull { input.debateAffinity[it] ?: 0 }?.let { direct += it }
            }
            val ranked = rank(memberIds, input.relevance).filter { it !in direct }
            val rest = ranked.filter { it != input.lastPhilosopherSpeaker }.ifEmpty { ranked }
            for (id in rest) {
                if (direct.size >= want) break
                direct += id
            }
        }

        val softened = when {
            IntentSignal.SOFTEN in signals -> true
            IntentSignal.CHANGE_TOPIC in signals -> false
            else -> input.policy.softened
        }
        val budget = when {
            input.roomKind == RoomKind.DM -> 0
            signals.any { it in NO_AUTONOMY } -> 0
            else -> input.policy.autonomy.budget
        }
        val maxDebate = if (softened) 0 else input.policy.debateFrequency.maxDebateTurns
        val intensity = if (softened) DebateIntensity.GENTLE else input.policy.debateIntensity

        return TurnPlan(direct, needsInvite, budget, maxDebate, intensity, softened)
    }

    /**
     * 자율 이어 말하기의 다음 화자.
     * - 직전 화자는 연속으로 말하지 않는다.
     * - 이번 흐름에서 아직 말하지 않은 멤버를 먼저.
     * - 예산이 없으면 null(대화 멈춤).
     */
    fun nextAutonomous(
        members: List<Member>,
        spokenThisFlow: List<String>,
        lastSpeaker: String?,
        remainingBudget: Int,
        relevance: Map<String, Double> = emptyMap(),
    ): String? {
        if (remainingBudget <= 0) return null
        val candidates = rank(members.map { it.philosopherId }, relevance).filter { it != lastSpeaker }
        return candidates.firstOrNull { it !in spokenThisFlow } ?: candidates.firstOrNull()
    }

    private fun rank(ids: List<String>, relevance: Map<String, Double>): List<String> =
        ids.withIndex().sortedWith(compareByDescending<IndexedValue<String>> { relevance[it.value] ?: 0.0 }.thenBy { it.index }).map { it.value }
}
