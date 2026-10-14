package app.agora.philosophers

import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class PhilosopherRegistryTest {
    private val packsDir = File(System.getProperty("agora.packsDir") ?: error("agora.packsDir 미설정"))

    private fun realSources(): List<Pair<String, String>> =
        packsDir.listFiles()!!.filter { it.isDirectory }.map { d -> File(d, "pack.yaml") }
            .filter { it.exists() }.map { it.path to it.readText() }

    private fun fixture(name: String) = name to javaClass.getResource("/fixtures/$name")!!.readText()

    @Test
    fun `저장소의 실제 팩은 모두 검사를 통과한다`() {
        val reg = PhilosopherRegistry.load(realSources())
        assertEquals(emptyList(), reg.rejected, "거부된 팩: ${reg.rejected}")
        assertEquals(listOf("nietzsche", "schopenhauer"), reg.all().map { it.id })
    }

    @Test
    fun `시안 단축 ID를 안정 ID로 옮길 수 있다`() {
        val reg = PhilosopherRegistry.load(realSources())
        assertEquals("nietzsche", reg.idForLegacy("ni"))
        assertEquals("schopenhauer", reg.idForLegacy("sh"))
    }

    @Test
    fun `표시 문구는 시안 원문과 같다`() {
        val ni = PhilosopherRegistry.load(realSources()).require("nietzsche")
        assertEquals("짧고 단단하게 말해요. 도발적이지만 장광설은 피해요.", ni.display.styleSummary.ko)
        assertEquals("#B0353F", ni.display.colors.light.hue)
    }

    @Test
    fun `멘션 자동완성은 한글·영문 앞부분으로 찾는다`() {
        val reg = PhilosopherRegistry.load(realSources())
        assertEquals(listOf("nietzsche"), reg.suggest("니").map { it.id })
        assertEquals(listOf("schopenhauer"), reg.suggest("Scho").map { it.id })
        assertEquals(2, reg.suggest("").size)
    }

    @Test
    fun `직접 친 1글자 별칭은 자동으로 묶지 않는다`() {
        val reg = PhilosopherRegistry.load(realSources())
        assertEquals(AliasBinding.None, reg.bindTyped("니"))
        assertEquals(AliasBinding.Bound("nietzsche"), reg.bindTyped("니체"))
        assertEquals(AliasBinding.Bound("schopenhauer"), reg.bindTyped("Schopenhauer"))
    }

    @Test
    fun `새 철학자는 팩 파일 하나만 더하면 등록된다`() {
        val reg = PhilosopherRegistry.load(realSources() + fixture("test_philosopher.yaml"))
        val t = assertNotNull(reg.get("test_philosopher"))
        assertEquals(PackStatus.BETA, t.status)
        assertEquals(listOf("test_philosopher"), reg.suggest("시험").map { it.id })
        assertEquals(AliasBinding.Bound("test_philosopher"), reg.bindTyped("testphilosopher"))
    }

    @Test
    fun `비활성 철학자는 고를 수 없지만 기록 표시용으로는 남는다`() {
        val disabled = fixture("test_philosopher.yaml").let { (n, t) -> n to t.replace("status: beta", "status: disabled") }
        val reg = PhilosopherRegistry.load(realSources() + disabled)
        assertNotNull(reg.get("test_philosopher"))
        assertTrue(reg.selectable().none { it.id == "test_philosopher" })
        assertTrue(reg.suggest("시험").isEmpty())
        assertEquals(AliasBinding.None, reg.bindTyped("testphilosopher"))
    }

    @Test
    fun `같은 별칭을 두 명이 쓰면 자동 바인딩하지 않는다`() {
        val clash = fixture("test_philosopher.yaml").let { (n, t) -> n to t.replace("[\"시험철학자\", \"시험\"]", "[\"시험철학자\", \"니체\"]") }
        val reg = PhilosopherRegistry.load(realSources() + clash)
        val b = assertIs<AliasBinding.Ambiguous>(reg.bindTyped("니체"))
        assertEquals(setOf("nietzsche", "test_philosopher"), b.candidates.toSet())
    }

    @Test
    fun `대비가 부족한 이름색은 그 팩만 거부한다`() {
        val pale = fixture("test_philosopher.yaml").let { (n, t) -> n to t.replace("#2E5E2E", "#C8D8C8") }
        val reg = PhilosopherRegistry.load(realSources() + pale)
        assertEquals(listOf("test_philosopher"), reg.rejected.map { it.id })
        assertTrue(reg.rejected.single().reasons.any { "대비" in it })
        assertEquals(2, reg.all().size, "다른 팩은 영향받지 않아야 한다")
    }

    @Test
    fun `화제 관련도와 말투 예시는 선택 항목이고 잘못 쓰면 그 팩만 거부한다`() {
        val base = fixture("test_philosopher.yaml")
        // 없어도 된다
        assertTrue(PhilosopherRegistry.load(listOf(base)).rejected.isEmpty())
        fun withPersona(extra: String) = base.first to base.second.replace(
            "  conversation_traits: { ko: [\"짧게 답한다.\"], en: [\"Answers briefly.\"] }",
            "  conversation_traits: { ko: [\"짧게 답한다.\"], en: [\"Answers briefly.\"] }\n$extra",
        )
        val ok = PhilosopherRegistry.load(listOf(withPersona("  topic_affinity: { music: 0.5, open: 1.0 }\n  examples: { ko: [\"좋아요.\"], en: [\"Good.\"] }")))
        assertTrue(ok.rejected.isEmpty(), "${ok.rejected}")
        assertEquals(0.5, ok.require("test_philosopher").persona.topicAffinity["music"])
        assertEquals(listOf("좋아요."), ok.require("test_philosopher").persona.examples.ko)

        val typo = PhilosopherRegistry.load(listOf(withPersona("  topic_affinity: { musc: 0.5 }")))
        assertTrue(typo.rejected.single().reasons.any { "musc" in it })
        val range = PhilosopherRegistry.load(listOf(withPersona("  topic_affinity: { music: 1.5 }")))
        assertTrue(range.rejected.single().reasons.any { "범위" in it })
        val long = PhilosopherRegistry.load(listOf(withPersona("  examples: { ko: [\"${"가".repeat(MAX_EXAMPLE_CHARS + 1)}\"] }")))
        assertTrue(long.rejected.single().reasons.any { "최대" in it })
    }

    @Test
    fun `같은 ID 팩이 둘이면 둘 다 거부한다`() {
        val f = fixture("test_philosopher.yaml")
        val reg = PhilosopherRegistry.load(realSources() + f + ("copy.yaml" to f.second))
        assertTrue(reg.get("test_philosopher") == null)
        assertEquals(2, reg.rejected.count { it.id == "test_philosopher" })
    }

    @Test
    fun `깨진 YAML은 앱을 멈추지 않고 거부 목록에 남는다`() {
        val reg = PhilosopherRegistry.load(realSources() + ("broken.yaml" to "id: [unclosed"))
        assertEquals(1, reg.rejected.size)
        assertEquals(2, reg.all().size)
    }

    @Test
    fun `시안 6명 철학자 색은 모두 4점5대1 이상이다`() {
        // agora.css 원본값. 나머지 4명 팩을 만들 때 이 값을 그대로 쓴다.
        val hues = mapOf(
            "so" to ("#56691A" to "#C5D47E"), "ni" to ("#B0353F" to "#FF9DA8"), "sh" to ("#3D5A93" to "#A8C0F4"),
            "ca" to ("#8A580B" to "#F0C373"), "ci" to ("#7A4284" to "#E3A9EB"), "au" to ("#1E6D66" to "#84D3C8"),
        )
        for ((id, lightDark) in hues) {
            for (bg in ThemeBackgrounds.light) assertTrue(contrastRatio(lightDark.first, bg) >= MIN_TEXT_CONTRAST, "$id light on $bg")
            for (bg in ThemeBackgrounds.dark) assertTrue(contrastRatio(lightDark.second, bg) >= MIN_TEXT_CONTRAST, "$id dark on $bg")
        }
    }
}
