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
        assertTrue(ni.persona.examples.ko.size > MAX_EXAMPLES && ni.persona.examples.en.size > MAX_EXAMPLES)
        assertEquals(MAX_EXAMPLES, ni.persona.examples.ko.count { it in ko })
        assertTrue(ni.persona.examples.en.none { it in ko })
        assertEquals(MAX_EXAMPLES, ni.persona.examples.en.count { it in en })
    }

    @Test
    fun `지금 대화와 상황이 겹치는 예시는 넣지 않는다`() {
        // PC 시험: 커피 이야기에 쇼펜하우어가 커피 예시를 그대로 베꼈다(두 번 모두)
        val coffee = registry.require("schopenhauer").persona.examples.ko.first { "커피" in it }
        assertFalse(coffee in all(compose("schopenhauer")), "대화에 '커피'가 있으면 커피 예시는 빠져야 한다")
        val song = listOf(TranscriptLine(null, "잠깐, 그 얘기 말고 오늘 들은 노래 이야기하자."))
        val sys = composer.compose(registry.require("schopenhauer"), "ko", song, RoomKind.GROUP, listOf("nietzsche"), null, true, DebateIntensity.BALANCED, false)
            .first { it.role == PromptRole.SYSTEM }.content
        assertTrue(registry.require("schopenhauer").persona.examples.ko.filter { "노래" in it }.none { it in sys })
    }

    @Test
    fun `다시 생성할 때 빼라고 한 예시는 넣지 않는다`() {
        val ex = registry.require("nietzsche").persona.examples.ko
        val first = composer.compose(registry.require("nietzsche"), "ko", transcript, RoomKind.GROUP, listOf("schopenhauer"), null, true, DebateIntensity.BALANCED, false)
            .first { it.role == PromptRole.SYSTEM }.content
        val used = ex.filter { it in first }
        val again = composer.compose(registry.require("nietzsche"), "ko", transcript, RoomKind.GROUP, listOf("schopenhauer"), null, true, DebateIntensity.BALANCED, false, avoidExamples = used.toSet())
            .first { it.role == PromptRole.SYSTEM }.content
        assertTrue(used.none { it in again })
        assertEquals(MAX_EXAMPLES, ex.count { it in again })
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
