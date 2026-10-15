package app.agora.orchestration

/**
 * 생성 후 검사. 모델이 낸 답에서 저장하면 안 되는 부분을 찾는다.
 * PC 시험(qwen2.5:7b, 2026-10-14~15)에서 실제로 나온 것만 다룬다:
 * - 한국어 답 중간에 중국어로 넘어감(「고통 속에서我们也继续对话」), 영어 구절이 끼어듦(「선율은often speaks to us」)
 * - 남의 이름표를 붙여 다른 사람 대사를 대신 씀(「[ SHOPHACHAWE ] 你说得对」)
 * - 깨진 글자(U+FFFD, 「showc�포하우어」)
 * - 팩의 말투 예시를 그대로 베낌(「좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.」)
 */

internal enum class GuardIssue { CONTAMINATED, BROKEN_TEXT, COPIED_EXAMPLE }

/**
 * @property text 저장해도 되는 부분(잘라 내고 남은 것). 비어 있을 수 있다.
 * @property issue 다시 생성할 이유. null이면 그대로 저장해도 된다.
 * @property copied 그대로 베낀 예시들 — 다시 생성할 때 프롬프트에서 뺀다.
 * @property withCopies 베낀 문장을 빼기 전 답(오염·깨진 글자는 이미 처리됨). 다시 생성해도 베끼기만 남았을 때 침묵보다 낫다.
 */
internal data class Guarded(val text: String, val issue: GuardIssue?, val copied: List<String> = emptyList(), val withCopies: String = text)

private val HAN = Regex("[\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF]")
private val HANGUL = Regex("[\\uAC00-\\uD7A3]")
/** 한국어 답 안의 영어 '구절'(세 낱말 이상). 'AI'·노래 제목 한 단어 같은 것은 건드리지 않는다. */
private val LATIN_PHRASE = Regex("[A-Za-z]+(?:[\\s,']+[A-Za-z]+){2,}")
/** 답 중간(첫 글자가 아닌 곳)에 나온 `[이름]` 이름표 — 다른 사람 대사의 시작 */
private val INNER_BRACKET_TAG = Regex("\\[[^\\]\\n]{1,20}]")
/** 둘째 줄 이후 줄 첫머리의 `이름:` 이름표 */
private val LINE_COLON_TAG = Regex("\\n\\s*[^\\s:：]{1,12}[:：]")
private const val BROKEN = '�'
private val SENTENCE_END = Regex("[.?!…~。]+[\"'”’)]?")
/** 베낀 것으로 볼 최소 길이(공백·문장부호 뺀 글자 수). 「그렇소.」 같은 짧은 맞장구는 우연히 겹칠 수 있다. */
private const val MIN_COPY_CHARS = 8

/** 이 답에서 저장하면 안 되는 부분이 시작되는 위치. 없으면 null. */
internal fun contaminationIndex(text: String, locale: String): Int? {
    val ko = locale != "en"
    val hits = buildList {
        HAN.find(text)?.let { add(it.range.first) }
        if (ko) LATIN_PHRASE.find(text)?.let { add(it.range.first) } else HANGUL.find(text)?.let { add(it.range.first) }
        INNER_BRACKET_TAG.findAll(text).firstOrNull { it.range.first > 0 }?.let { add(it.range.first) }
        LINE_COLON_TAG.find(text)?.let { add(it.range.first) }
    }
    return hits.minOrNull()
}

/** 문장 단위로 나눈다. 끝 부호가 없는 마지막 조각도 한 문장이다. */
internal fun splitSentences(text: String): List<String> {
    val out = mutableListOf<String>()
    var start = 0
    for (m in SENTENCE_END.findAll(text)) {
        out += text.substring(start, m.range.last + 1).trim()
        start = m.range.last + 1
    }
    if (start < text.length) out += text.substring(start).trim()
    return out.filter { it.isNotEmpty() }
}

private fun norm(s: String) = s.filter { it.isLetterOrDigit() }.lowercase()

/** 예시를 그대로 옮긴 문장들(답의 문장 기준). */
internal fun copiedSentences(text: String, examples: List<String>): List<Pair<String, String>> {
    val ex = examples.map { it to norm(it) }
    val sentences = splitSentences(text)
    val long = sentences.mapNotNull { s ->
        val n = norm(s)
        if (n.length < MIN_COPY_CHARS) return@mapNotNull null
        ex.firstOrNull { (_, e) -> n in e }?.let { s to it.first }
    }
    if (long.isEmpty()) return long
    // 긴 문장을 베낀 예시 안의 짧은 문장(「You did.」)도 함께 베낀 것이다.
    val hit = ex.filter { (orig, _) -> long.any { it.second == orig } }
    val short = sentences.mapNotNull { s ->
        val n = norm(s)
        if (n.isEmpty() || n.length >= MIN_COPY_CHARS) return@mapNotNull null
        hit.firstOrNull { (_, e) -> n in e }?.let { s to it.first }
    }
    return sentences.mapNotNull { s -> (long + short).firstOrNull { it.first == s } }
}

/**
 * 답 하나를 검사한다. 순서: 오염 지점에서 자르기 → 깨진 글자 → 예시 베끼기.
 * 잘라 낸 뒤 남는 것은 마지막 완결 문장까지만 둔다(문장이 중간에 끊긴 채 저장되지 않게).
 */
internal fun guardReply(text: String, locale: String, examples: List<String>): Guarded {
    var t = text
    var issue: GuardIssue? = null
    contaminationIndex(t, locale)?.let { idx ->
        val head = t.substring(0, idx)
        val lastEnd = SENTENCE_END.findAll(head).lastOrNull()?.range?.last
        t = if (lastEnd == null) "" else head.substring(0, lastEnd + 1).trim()
        // 완결 문장이 남으면 그대로 써도 된다. 아무것도 안 남으면 다시 생성.
        if (t.isEmpty()) issue = GuardIssue.CONTAMINATED
    }
    if (BROKEN in t) {
        t = splitSentences(t).filter { BROKEN !in it }.joinToString(" ")
        issue = issue ?: GuardIssue.BROKEN_TEXT
    }
    val withCopies = t
    val copied = copiedSentences(t, examples)
    if (copied.isNotEmpty()) {
        val drop = copied.map { it.first }.toSet()
        t = splitSentences(t).filter { it !in drop }.joinToString(" ")
        issue = issue ?: GuardIssue.COPIED_EXAMPLE
    }
    return Guarded(t, issue, copied.map { it.second }.distinct(), withCopies)
}

/** 스트리밍 화면용: 오염이 시작되면 그 앞까지만 보여 준다(중국어가 깜빡 보였다 사라지지 않게). */
internal fun visibleBeforeContamination(text: String, locale: String): String =
    contaminationIndex(text, locale)?.let { text.substring(0, it).trimEnd() } ?: text
