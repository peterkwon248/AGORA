package app.agora.orchestration

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class ReplyTextTest {
    @Test
    fun `침묵 신호가 될 수 있는 앞부분은 보여 주지 않는다`() {
        for (p in listOf("[", "[P", "[PA", "[PASS", "[PASS]", "P", "PA", "PASS", "PASS.", "(pass", " (PASS).")) {
            assertNull(displayablePartial(p), "'$p'")
        }
    }

    @Test
    fun `이름표가 될 수 있는 첫 어절은 끝날 때까지 보류하고 붙으면 떼어 낸다`() {
        assertNull(displayablePartial("니체"))
        assertNull(displayablePartial("니체:"))
        assertEquals("짧게", displayablePartial("니체: 짧게"))
        assertNull(displayablePartial("[니체"))
        assertEquals("좋소", displayablePartial("[니체] 좋소"))
    }

    @Test
    fun `보통 문장은 그대로 쌓여 보이고 끝에 붙기 시작한 PASS 조각은 잘린다`() {
        assertEquals("커피가 맛있었다면", displayablePartial("커피가 맛있었다면"))
        assertEquals("Passing thoughts", displayablePartial("Passing thoughts"))
        assertEquals("그걸로 됐소.", displayablePartial("그걸로 됐소. [PA"))
        assertNull(displayablePartial("그걸로 됐소. [PASS]"), "완성되면 침묵으로 처리될 답은 보여 주지 않는다")
    }

    @Test
    fun `완성된 답 정리 규칙은 그대로다`() {
        assertEquals("짧게 말하겠소.", cleanReply("니체: 짧게 말하겠소."))
        assertEquals("좋소", cleanReply("[니체] \"좋소\""))
        assertEquals(true, isPassReply("[PASS]"))
        assertEquals(false, isPassReply("I'll pass on the cake, thanks."))
    }
}
