package app.agora.orchestration

import app.agora.philosophers.KoRegister
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class ReplyTextTest {
    @Test
    fun `침묵 신호가 될 수 있는 앞부분은 보여 주지 않는다`() {
        for (p in listOf("[", "[P", "[PA", "[PASS", "[PASS]", "P", "PA", "PASS", "PASS.", "(pass", " (PASS).")) {
            assertNull(displayablePartial(p, "ko"), "'$p'")
        }
    }

    @Test
    fun `이름표가 될 수 있는 첫 어절은 끝날 때까지 보류하고 붙으면 떼어 낸다`() {
        assertNull(displayablePartial("니체", "ko"))
        assertNull(displayablePartial("니체:", "ko"))
        assertEquals("짧게", displayablePartial("니체: 짧게", "ko"))
        assertNull(displayablePartial("[니체", "ko"))
        assertEquals("좋소", displayablePartial("[니체] 좋소", "ko"))
    }

    @Test
    fun `보통 문장은 그대로 쌓여 보이고 끝에 붙기 시작한 PASS 조각은 잘린다`() {
        assertEquals("커피가 맛있었다면", displayablePartial("커피가 맛있었다면", "ko"))
        assertEquals("Passing thoughts", displayablePartial("Passing thoughts", "ko"))
        assertEquals("그걸로 됐소.", displayablePartial("그걸로 됐소. [PA", "ko"))
        assertNull(displayablePartial("그걸로 됐소. [PASS]", "ko"), "완성되면 침묵으로 처리될 답은 보여 주지 않는다")
    }

    @Test
    fun `완성된 답 정리 규칙은 그대로다`() {
        assertEquals("짧게 말하겠소.", cleanReply("니체: 짧게 말하겠소."))
        assertEquals("좋소", cleanReply("[니체] \"좋소\""))
        assertEquals(true, isPassReply("[PASS]"))
        assertEquals(false, isPassReply("I'll pass on the cake, thanks."))
    }

    /** 한 글자씩 흘려보냈을 때 화면에 보인 모든 모습 */
    private fun views(raw: String, register: KoRegister = KoRegister.FREE) =
        (1..raw.length).mapNotNull { displayablePartial(raw.substring(0, it), "ko", register) }

    @Test
    fun `흘러나오는 동안에도 반말 끝맺음과 맞장구 한 마디와 앱 내부 말은 한 번도 보이지 않는다`() {
        // 세션 6: 「~겠지」가 흘러나오다 저장 때 「~겠소」로, 「그렇소.」가 보였다가 사라졌다
        val raw = "그렇소. 그건 체념이겠지. 나는 사용자가 무엇을 원하는지 보고 싶군. 그건 착각에 지나지하오."
        val seen = views(raw, KoRegister.HAO)
        val bad = listOf("겠지", "그렇소", "사용", "싶군", "지나지하")
        assertTrue(seen.none { v -> bad.any { it in v } }, seen.filter { v -> bad.any { it in v } }.joinToString(" | "))
        assertEquals("그건 체념이겠소. 나는 당신이 무엇을 원하는지 보고 싶구려. 그건 착각에 지나지 않소.", seen.last())
    }

    @Test
    fun `하오체가 아닌 팩과 이어지는 말은 그대로 흘러나온다`() {
        assertEquals("그건 체념이겠지.", displayablePartial("그건 체념이겠지.", "ko"))
        val cont = views("그렇게 보이겠지만 아니오.", KoRegister.HAO)
        assertEquals("그렇게 보이겠지만 아니오.", cont.last())
        assertTrue(cont.none { "겠소" in it }, "「겠지만」으로 이어질 말이 「겠소」로 잠깐 바뀌어 보이면 안 된다: $cont")
        assertTrue(views("그렇소.", KoRegister.HAO).isEmpty(), "맞장구 한 마디뿐인 답은 흘러나오지 않고 저장 때 그대로 나타난다")
        assertNull(displayablePartial("그렇소. ", "ko"), "다음 문장이 오기 전까지는 보류")
        assertEquals("나는 다르게 보오", displayablePartial("그렇소. 나는 다르게 보오", "ko"))
    }
}
