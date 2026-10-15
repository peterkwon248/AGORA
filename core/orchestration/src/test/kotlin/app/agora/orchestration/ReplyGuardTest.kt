package app.agora.orchestration

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

/** 문장은 모두 PC 시험(qwen2.5:7b)에서 실제로 나온 답이다 — qa/pc-runs/20261014-1835·20261015-1152·1158. */
class ReplyGuardTest {
    private val schoKo = listOf(
        "좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.",
        "음악은 듣는 동안만큼은 바라는 것을 잊게 해 주지요. 그 노래를 듣는 동안 무엇이 조용해졌습니까?",
    )
    private val nieEn = listOf("The song didn't change. You did. In which direction?")

    @Test
    fun `한국어 답에서 중국어가 시작되면 그 앞 완결 문장까지만 남긴다`() {
        val g = guardReply("니체의 질문이 참 깊네요. 주관적 경험은 감정과 기대를, 관조적 시각은 거리를 두고 바라보는 것처럼요. 이 두者的视角，您似乎是在提出", "ko", schoKo)
        assertEquals("니체의 질문이 참 깊네요. 주관적 경험은 감정과 기대를, 관조적 시각은 거리를 두고 바라보는 것처럼요.", g.text)
        assertNull(g.issue, "완결 문장이 남으면 다시 생성할 필요 없다")
    }

    @Test
    fun `첫 문장부터 중국어로 무너지면 남는 게 없어 다시 생성한다`() {
        val g = guardReply("감정의 만족과理智的满足与理智的洞察在平衡生活中确实扮演着重要角色.", "ko", schoKo)
        assertEquals("", g.text)
        assertEquals(GuardIssue.CONTAMINATED, g.issue)
    }

    @Test
    fun `남의 이름표가 나오면 그 앞에서 자른다`() {
        val raw = "결과 없이 고통만 남기지 않는다면, 그 고통 또한 자신에게 무언가를 가르쳐줄 거요. 고통 속에서\n[尼采] 每一次痛苦\n[ SHOPHACHAWE ] 你说得对"
        assertEquals("결과 없이 고통만 남기지 않는다면, 그 고통 또한 자신에게 무언가를 가르쳐줄 거요.", guardReply(raw, "ko", emptyList()).text)
        assertEquals("좋소.", guardReply("좋소.\n쇼펜하우어: 나는 반대요.", "ko", emptyList()).text)
        assertEquals("좋소.", guardReply("좋소. [쇼펜하우어] 나는 반대요.", "ko", emptyList()).text)
    }

    @Test
    fun `한국어 답에 낀 영어 구절은 자르고 낱말 하나는 둔다`() {
        assertEquals("그 노래의 선율이 마음을 끌게 하는 것 같아요.",
            guardReply("그 노래의 선율이 마음을 끌게 하는 것 같아요. 선율은often speaks to us more than lyrics do.", "ko", emptyList()).text)
        val ok = "Yesterday라는 노래였군요. AI가 골라 준 노래요?"
        assertEquals(ok, guardReply(ok, "ko", emptyList()).text)
        assertNull(guardReply(ok, "ko", emptyList()).issue)
    }

    @Test
    fun `영어 답에 한글이 섞이면 자른다`() {
        assertEquals("That is resignation.", guardReply("That is resignation. 나는 그 고통이", "en", emptyList()).text)
    }

    @Test
    fun `깨진 글자가 든 문장은 빼고 남는 게 없으면 다시 생성한다`() {
        val broken = "showc�포하우어의 견해가 당신에게 어떤 영향을 미쳤는지 궁금하오."
        val g = guardReply(broken, "ko", emptyList())
        assertEquals("", g.text)
        assertEquals(GuardIssue.BROKEN_TEXT, g.issue)
        assertEquals("어느 쪽이오?", guardReply("$broken 어느 쪽이오?", "ko", emptyList()).text)
    }

    @Test
    fun `예시를 그대로 베낀 문장은 빼고 어느 예시인지 알려 준다`() {
        val g = guardReply("좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.", "ko", schoKo)
        assertEquals("", g.text)
        assertEquals(GuardIssue.COPIED_EXAMPLE, g.issue)
        assertEquals(listOf(schoKo[0]), g.copied)
        assertEquals("좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.", g.withCopies)

        val part = guardReply("그 노래를 듣는 동안 무엇이 조용해졌습니까? 저는 빗소리가 먼저 떠오릅니다.", "ko", schoKo)
        assertEquals("저는 빗소리가 먼저 떠오릅니다.", part.text)
        assertEquals(listOf(schoKo[1]), part.copied)

        assertEquals("", guardReply("The song didn't change. You did. In which direction?", "en", nieEn).text)
    }

    @Test
    fun `짧은 맞장구나 예시와 다른 문장은 베끼기가 아니다`() {
        for (s in listOf("그렇소.", "커피가 좋으면 그만이오.", "좋은 커피는 흔하지 않소. 오늘 운이 따랐구려.")) {
            val g = guardReply(s, "ko", schoKo)
            assertEquals(s, g.text, s)
            assertNull(g.issue, s)
        }
    }

    @Test
    fun `스트리밍 화면은 오염이 시작되기 전까지만 보여 준다`() {
        assertEquals("좋아요, 오늘 들으신 노래가 무엇이었는지 궁금합니다. 선율이나 가사",
            displayablePartial("좋아요, 오늘 들으신 노래가 무엇이었는지 궁금합니다. 선율이나 가사中有几处错误", "ko"))
        assertTrue(displayablePartial("고통 속에서我们也继续对话", "ko")!!.none { it.code in 0x4E00..0x9FFF })
    }
}
