package app.agora.orchestration

import app.agora.inference.PromptRole
import app.agora.philosophers.LocalizedList
import app.agora.philosophers.PhilosopherRegistry
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PromptComposerTest {
    private val registry = PhilosopherRegistry.load(
        File(System.getProperty("agora.packsDir")).listFiles()!!.map { File(it, "pack.yaml") }.filter { it.exists() }.map { it.path to it.readText() },
    )
    private val composer = PromptComposer(registry)
    private val transcript = listOf(TranscriptLine(null, "오늘 커피가 유난히 맛있어."), TranscriptLine("nietzsche", "맛있었다면 그걸로 됐소."))

    private fun compose(id: String, locale: String = "ko", respondTo: String? = null, mayPass: Boolean = false) =
        composer.compose(registry.require(id), locale, transcript, RoomKind.GROUP, listOf("nietzsche", "schopenhauer").filter { it != id },
            respondTo, debateAllowed = true, intensity = DebateIntensity.BALANCED, mayPass = mayPass)

    private fun all(messages: List<app.agora.inference.PromptMessage>) = messages.joinToString("\n") { it.content }

    @Test
    fun `이어 말하기 차례에서 침묵 신호는 한 번만 말한다`() {
        // PC 시험: SYSTEM과 USER에서 두 번 말하자 두 번째 화자가 6번 중 6번 침묵했다
        val m = compose("schopenhauer", respondTo = "nietzsche", mayPass = true)
        assertEquals(1, Regex(Regex.escape(PASS_TOKEN)).findAll(all(m)).count())
        assertFalse(PASS_TOKEN in m.first { it.role == PromptRole.USER }.content)
    }

    @Test
    fun `직접 답하는 차례에는 침묵 신호가 없다`() {
        assertFalse(PASS_TOKEN in all(compose("nietzsche")))
    }

    @Test
    fun `이어 말하기는 앞사람의 말을 받되 자기 관점을 보태라고 묻는다`() {
        val user = compose("schopenhauer", respondTo = "nietzsche", mayPass = true).first { it.role == PromptRole.USER }.content
        assertTrue("니체의 바로 앞 말" in user)
        assertTrue("당신의 관점" in user)
    }

    @Test
    fun `팩의 말투 예시가 그 언어로만 들어간다`() {
        val ni = registry.require("nietzsche")
        val ko = compose("nietzsche").first { it.role == PromptRole.SYSTEM }.content
        val en = compose("nietzsche", locale = "en").first { it.role == PromptRole.SYSTEM }.content
        assertTrue(ni.persona.examples.ko.isNotEmpty() && ni.persona.examples.en.isNotEmpty())
        assertTrue(ni.persona.examples.ko.all { it in ko })
        assertTrue(ni.persona.examples.en.none { it in ko })
        assertTrue(ni.persona.examples.en.all { it in en })
    }

    @Test
    fun `예시가 없는 팩은 예시 칸 없이 그대로 동작한다`() {
        val bare = registry.require("nietzsche").let { it.copy(persona = it.persona.copy(examples = LocalizedList())) }
        val sys = composer.compose(bare, "ko", transcript, RoomKind.DM, emptyList(), null, true, DebateIntensity.BALANCED, false)
            .first { it.role == PromptRole.SYSTEM }.content
        assertFalse("말투 예시" in sys)
        assertTrue("규칙:" in sys)
    }
}
