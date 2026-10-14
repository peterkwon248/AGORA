package app.agora.orchestration

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class SpeakerSelectorTest {
    private val three = listOf(Member("nietzsche"), Member("schopenhauer"), Member("camus"))
    private val two = listOf(Member("nietzsche"), Member("schopenhauer"))

    @Test
    fun `멘션된 멤버가 멘션 순서대로 먼저 답한다`() {
        val p = SpeakerSelector.plan(TurnInput(RoomKind.GROUP, three, mentions = listOf("camus", "nietzsche")))
        assertEquals(listOf("camus", "nietzsche"), p.direct)
    }

    @Test
    fun `방 밖 철학자 멘션은 초대 확인으로 돌리고 대신 답하지 않는다`() {
        val p = SpeakerSelector.plan(TurnInput(RoomKind.GROUP, two, mentions = listOf("camus")))
        assertEquals(emptyList(), p.direct)
        assertEquals(listOf("camus"), p.needsInvite)
    }

    @Test
    fun `멘션이 없으면 답장한 철학자 한 명`() {
        val p = SpeakerSelector.plan(TurnInput(RoomKind.GROUP, three, replyToAuthor = "schopenhauer"))
        assertEquals(listOf("schopenhauer"), p.direct)
    }

    @Test
    fun `세 명 이상 단톡방의 일반 메시지에는 두 명, 전원이 답하지 않는다`() {
        val p = SpeakerSelector.plan(TurnInput(RoomKind.GROUP, three, relevance = mapOf("camus" to .9, "schopenhauer" to .5)))
        assertEquals(listOf("camus", "schopenhauer"), p.direct)
    }

    @Test
    fun `인사에는 한 명만`() {
        val p = SpeakerSelector.plan(TurnInput(RoomKind.GROUP, three, signals = setOf(IntentSignal.GREETING)))
        assertEquals(1, p.direct.size)
        assertEquals(0, p.autonomyBudget)
    }

    @Test
    fun `직전 화자는 가능하면 빼고 고른다`() {
        val p = SpeakerSelector.plan(TurnInput(RoomKind.GROUP, two, relevance = mapOf("nietzsche" to 1.0), lastPhilosopherSpeaker = "nietzsche"))
        assertEquals(listOf("schopenhauer"), p.direct)
    }

    @Test
    fun `완화 요청이면 논쟁 성향이 높은 쪽이 먼저 받고 논쟁이 꺼진다`() {
        val p = SpeakerSelector.plan(
            TurnInput(RoomKind.GROUP, three, signals = setOf(IntentSignal.SOFTEN), debateAffinity = mapOf("nietzsche" to 2, "schopenhauer" to 1),
                policy = RoomPolicy(debateFrequency = DebateFrequency.FREQUENT, debateIntensity = DebateIntensity.RIGOROUS)),
        )
        assertEquals(listOf("nietzsche"), p.direct)
        assertEquals(0, p.maxDebateTurns)
        assertEquals(DebateIntensity.GENTLE, p.intensity)
        assertEquals(true, p.softenedAfter)
    }

    @Test
    fun `완화 상태는 화제 전환에서 풀린다`() {
        val p = SpeakerSelector.plan(TurnInput(RoomKind.GROUP, two, signals = setOf(IntentSignal.CHANGE_TOPIC), policy = RoomPolicy(softened = true)))
        assertEquals(false, p.softenedAfter)
    }

    @Test
    fun `자율 예산은 방 설정 0 2 4, 개인톡과 비공개는 0`() {
        assertEquals(0, SpeakerSelector.plan(TurnInput(RoomKind.GROUP, two, policy = RoomPolicy(autonomy = Autonomy.OFF))).autonomyBudget)
        assertEquals(2, SpeakerSelector.plan(TurnInput(RoomKind.GROUP, two)).autonomyBudget)
        assertEquals(4, SpeakerSelector.plan(TurnInput(RoomKind.GROUP, two, policy = RoomPolicy(autonomy = Autonomy.ACTIVE))).autonomyBudget)
        assertEquals(0, SpeakerSelector.plan(TurnInput(RoomKind.DM, listOf(Member("nietzsche")))).autonomyBudget)
        assertEquals(0, SpeakerSelector.plan(TurnInput(RoomKind.GROUP, two, signals = setOf(IntentSignal.PRIVATE))).autonomyBudget)
    }

    @Test
    fun `자율 차례는 같은 사람이 연속으로 말하지 않고 예산이 없으면 멈춘다`() {
        assertEquals("schopenhauer", SpeakerSelector.nextAutonomous(two, listOf("nietzsche"), "nietzsche", 2))
        assertEquals("nietzsche", SpeakerSelector.nextAutonomous(two, listOf("nietzsche", "schopenhauer"), "schopenhauer", 1))
        assertNull(SpeakerSelector.nextAutonomous(two, emptyList(), null, 0))
    }
}
