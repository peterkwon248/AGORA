package app.agora.orchestration

/**
 * 생성 후 검사. 모델이 낸 답에서 저장하면 안 되는 부분을 찾는다.
 * PC 시험(qwen2.5:7b, 2026-10-14~15)에서 실제로 나온 것만 다룬다:
 * - 한국어 답 중간에 중국어로 넘어감(「고통 속에서我们也继续对话」), 영어 구절이 끼어듦(「선율은often speaks to us」)
 * - 남의 이름표를 붙여 다른 사람 대사를 대신 씀(「[ SHOPHACHAWE ] 你说得对」)
 * - 깨진 글자(U+FFFD, 「showc�포하우어」)
 * - 팩의 말투 예시를 그대로 베낌(「좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.」)
 * - 자기를 3인칭으로 부름(니체가 「니체는 이런 질문에 … 답변했을지도」), 앱 내부 말(「@니체」, 「사용자에게」)
 */

internal enum class GuardIssue { CONTAMINATED, BROKEN_TEXT, SELF_THIRD_PERSON, COPIED_EXAMPLE }

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

/** 답 속 `@니체` 같은 멘션 표시. 앱 입력창의 문법이라 철학자 말에 나오면 안 된다. */
private val AT_MENTION = Regex("@[\\p{L}\\p{N}_]+\\s*")
/** 대화 기록 이름표 '사용자'를 받아 쓴 것 → '당신'. 받침이 달라 조사도 맞춘다. */
private val USER_WORD_KO = listOf("사용자가" to "당신이", "사용자는" to "당신은", "사용자를" to "당신을", "사용자와" to "당신과", "사용자님" to "당신", "사용자" to "당신")
private val USER_WORD_EN = listOf(Regex("\\bthe user's\\b", RegexOption.IGNORE_CASE) to "your", Regex("\\bthe user\\b", RegexOption.IGNORE_CASE) to "you")

/** 앱 내부 말(멘션 표시·'사용자')을 사람 말로 고친다. 문장은 빼지 않는다. */
internal fun replaceAppWords(text: String, locale: String): String {
    var t = text.replace(AT_MENTION, "")
    if (locale == "en") for ((r, w) in USER_WORD_EN) t = t.replace(r, w)
    else for ((a, b) in USER_WORD_KO) t = t.replace(a, b)
    return t
}

/**
 * 문장 첫머리의 되풀이 맞장구(「그렇습니다, 니체님 말씀대로」·「As Nietzsche said,」)를 떼어 낸다.
 * PC 시험: 프롬프트로 금지해도 6가지 대화마다 1~2번 남았다. 뒤의 내용은 그대로 둔다.
 */
private val ECHO_KO = Regex("^(?:(?:그렇습니다|맞습니다|네)[,\\s]*)?[\\p{L}]{1,12}?(?:님|선생님)?(?:의)?\\s*말씀(?:대로|처럼)[,\\s]*")
private val ECHO_EN = Regex("^(?:(?:Yes|Indeed)[,\\s]+)?[Aa]s \\p{L}+ (?:said|says|put it)[,\\s]*")

internal fun stripEchoOpeners(text: String, locale: String): String {
    val r = if (locale == "en") ECHO_EN else ECHO_KO
    return splitSentences(text).joinToString(" ") { s ->
        val m = r.find(s) ?: return@joinToString s
        val rest = s.substring(m.range.last + 1)
        if (rest.isBlank()) s else rest.replaceFirstChar { it.uppercaseChar() }
    }
}

/** 자기 이름을 3인칭으로 쓴 문장(「니체는 …라고 답했을지도」, 니체가 쓴 「니체의 말이 인상적이네요」). */
internal fun selfThirdPersonSentences(text: String, selfNames: List<String>): List<String> {
    val names = selfNames.filter { it.isNotBlank() }
    if (names.isEmpty()) return emptyList()
    return splitSentences(text).filter { s -> names.any { n -> s.contains(n, ignoreCase = true) } }
}

/**
 * 답 하나를 검사한다. 순서: 앱 내부 말 고치기 → 오염 지점에서 자르기 → 깨진 글자 → 자기 3인칭 → 예시 베끼기.
 * 잘라 낸 뒤 남는 것은 마지막 완결 문장까지만 둔다(문장이 중간에 끊긴 채 저장되지 않게).
 * @param selfNames 말하는 철학자 자신의 이름들 — 답에 나오면 자기를 남처럼 부른 것이다.
 */
internal fun guardReply(text: String, locale: String, examples: List<String>, selfNames: List<String> = emptyList()): Guarded {
    var t = replaceAppWords(text, locale).trim()
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
    val third = selfThirdPersonSentences(t, selfNames).toSet()
    if (third.isNotEmpty()) {
        t = splitSentences(t).filter { it !in third }.joinToString(" ")
        issue = issue ?: GuardIssue.SELF_THIRD_PERSON
    }
    t = stripEchoOpeners(t, locale)
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
