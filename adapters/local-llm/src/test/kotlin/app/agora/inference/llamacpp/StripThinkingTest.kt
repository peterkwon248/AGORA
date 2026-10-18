package app.agora.inference.llamacpp

import kotlin.test.Test
import kotlin.test.assertEquals

class StripThinkingTest {
    @Test
    fun `생각 묶음이 있으면 그 뒤의 답만 남긴다`() {
        assertEquals("오늘은 맑소.", LlamaCppProvider.stripThinking("<think>\n날씨를 보자\n</think>\n\n오늘은 맑소."))
    }

    @Test
    fun `생각 묶음이 없으면 그대로 둔다`() {
        assertEquals("그대로요.", LlamaCppProvider.stripThinking("그대로요."))
    }
}
