package app.agora.philosophers

import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

/** 시안 agora.css의 배경 토큰. 철학자 이름색이 이 위에서 4.5:1 이상이어야 한다(시안 README 기준). */
internal object ThemeBackgrounds {
    val light = listOf("#F5F4F9" /* bg */, "#FFFFFF" /* surface */)
    val dark = listOf("#131315" /* bg */, "#1C1C1F" /* surface */)
}

const val SUPPORTED_SCHEMA_VERSION = 1
private val ID_RE = Regex("^[a-z][a-z0-9_]*$")
private val HEX_RE = Regex("^#[0-9A-Fa-f]{6}$")
private val SUPPORTED_LOCALES = setOf("ko", "en")
const val MIN_TEXT_CONTRAST = 4.5

fun validatePack(p: PhilosopherPack): List<String> = buildList {
    if (p.schemaVersion != SUPPORTED_SCHEMA_VERSION) add("schema_version ${p.schemaVersion} 미지원")
    if (!ID_RE.matches(p.id)) add("id '${p.id}' 형식 오류(소문자·숫자·밑줄)")
    if (p.packVersion.isBlank()) add("pack_version 비어 있음")

    fun req(label: String, l: Localized?) {
        if (l == null) return
        if (l.ko.isBlank()) add("$label.ko 비어 있음")
        if (l.en.isBlank()) add("$label.en 비어 있음")
    }
    req("display.name", p.display.name)
    req("display.years", p.display.years)
    req("display.one_line", p.display.oneLine)
    req("display.style_summary", p.display.styleSummary)
    req("persona.speech_level", p.persona.speechLevel)
    if (p.display.ideas.ko.isEmpty() || p.display.ideas.en.isEmpty()) add("display.ideas ko/en 필요")
    if (p.persona.conversationTraits.ko.isEmpty() || p.persona.conversationTraits.en.isEmpty()) add("persona.conversation_traits ko/en 필요")
    if (p.aliases.all().none { it.isNotBlank() }) add("aliases 비어 있음")
    if (p.knowledge.coreConcepts.isEmpty()) add("knowledge.core_concepts 비어 있음")
    if (p.locales.isEmpty() || !SUPPORTED_LOCALES.containsAll(p.locales)) add("locales ${p.locales} — ko/en만 지원")

    for ((mode, colors, bgs) in listOf(
        Triple("light", p.display.colors.light, ThemeBackgrounds.light),
        Triple("dark", p.display.colors.dark, ThemeBackgrounds.dark),
    )) {
        for ((k, v) in listOf("hue" to colors.hue, "hue_soft" to colors.hueSoft)) {
            if (!HEX_RE.matches(v)) add("colors.$mode.$k '$v' 형식 오류(#RRGGBB)")
        }
        if (HEX_RE.matches(colors.hue)) {
            for (bg in bgs) {
                val c = contrastRatio(colors.hue, bg)
                if (c < MIN_TEXT_CONTRAST) add("colors.$mode.hue ${colors.hue} 대비 ${"%.2f".format(c)}:1 < 4.5 (배경 $bg)")
            }
        }
    }
}

/** WCAG 2.x 상대 휘도 대비. */
fun contrastRatio(a: String, b: String): Double {
    val la = luminance(a)
    val lb = luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
}

private fun luminance(hex: String): Double {
    val v = hex.removePrefix("#").toInt(16)
    fun ch(shift: Int): Double {
        val c = ((v shr shift) and 0xFF) / 255.0
        return if (c <= 0.03928) c / 12.92 else ((c + 0.055) / 1.055).pow(2.4)
    }
    return 0.2126 * ch(16) + 0.7152 * ch(8) + 0.0722 * ch(0)
}
