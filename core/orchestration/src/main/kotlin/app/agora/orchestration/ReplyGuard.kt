package app.agora.orchestration

import app.agora.philosophers.KoRegister

/**
 * 생성 후 검사. 모델이 낸 답에서 저장하면 안 되는 부분을 찾는다.
 * PC 시험(qwen2.5:7b, 2026-10-14~15)에서 실제로 나온 것만 다룬다:
 * - 한국어 답 중간에 중국어로 넘어감(「고통 속에서我们也继续对话」), 영어 구절이 끼어듦(「선율은often speaks to us」)
 * - 남의 이름표를 붙여 다른 사람 대사를 대신 씀(「[ SHOPHACHAWE ] 你说得对」)
 * - 깨진 글자(U+FFFD, 「showc�포하우어」)
 * - 팩의 말투 예시를 그대로 베낌(「좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.」)
 * - 자기를 3인칭으로 부름(니체가 「니체는 이런 질문에 … 답변했을지도」), 앱 내부 말(「@니체」, 「사용자에게」)
 * 노트북 Gemma 4 E2B(기기 안 모델, 2026-10-20)에서 더 나온 것:
 * - 앞사람 문장을 거의 그대로 되풀이(「날씨가 좋으니 잠시라도 그 기분을 음미하는 것도 나쁘지 않지요」 세 사람 연속)
 * - 「그렇소.」「그렇지요.」 같은 맞장구 한 마디로 시작(깊은 대화 답 60개 중 12개)
 * - 엉터리 어미(「~에 지나지하지요」 — 답 60개 중 2개)
 */

internal enum class GuardIssue { CONTAMINATED, BROKEN_TEXT, SELF_THIRD_PERSON, COPIED_EXAMPLE, ECHOED_PREVIOUS }

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

/**
 * 앞 대화 줄을 되풀이했다고 보는 기준: 겹친 연속 조각이 [ECHO_MIN_CHARS]글자 이상이면서 그 문장의 [ECHO_MIN_SHARE] 이상.
 * 노트북 E2B 기록(2026-10-20)으로 정했다 — 되풀이 답은 문장의 70~96%가 앞 줄과 같았고,
 * 앞말의 한 구절을 받아 반박한 답(「그저 맛있는 것을 먹는 것에서 오는 만족감은 일시적인 것뿐이지요」 63%,
 * 「It confirms the cage because…」 21%)은 길이만 보면 15글자를 넘겨 잘못 빠졌다.
 */
private const val ECHO_MIN_CHARS = 12
private const val ECHO_MIN_SHARE = 0.7

/** 두 글이 공유하는 가장 긴 연속 조각의 길이(공백·부호 뺀 글자). */
internal fun longestCommonRun(a: String, b: String): Int {
    val x = norm(a); val y = norm(b)
    if (x.isEmpty() || y.isEmpty()) return 0
    var prev = IntArray(y.length + 1)
    var best = 0
    for (i in 1..x.length) {
        val cur = IntArray(y.length + 1)
        for (j in 1..y.length) if (x[i - 1] == y[j - 1]) { cur[j] = prev[j - 1] + 1; if (cur[j] > best) best = cur[j] }
        prev = cur
    }
    return best
}

/** 바로 앞 대화 줄들을 거의 그대로 옮긴 문장들. */
internal fun echoedSentences(text: String, recent: List<String>): List<String> =
    if (recent.isEmpty()) emptyList()
    else splitSentences(text).filter { s ->
        val len = norm(s).length
        recent.any { val run = longestCommonRun(s, it); run >= ECHO_MIN_CHARS && run >= len * ECHO_MIN_SHARE }
    }

/** 답 첫머리의 맞장구 한 마디(「그렇소.」「그렇지요.」「Indeed.」). 뒤에 할 말이 있을 때만 뗀다. */
private val BARE_AGREE = Regex("^(?:그렇소|그렇지요|그렇군요|그렇습니다|그렇지|맞소|맞습니다|맞아|옳소|Indeed|Yes|True)[.!,…]*$", RegexOption.IGNORE_CASE)

internal fun stripBareAgreement(text: String): String {
    val s = splitSentences(text)
    return if (s.size >= 2 && BARE_AGREE.matches(s.first())) s.drop(1).joinToString(" ") else text
}

/**
 * 작은 모델이 자주 틀리는 어미를 바로잡는다. 뜻이 분명한 것만 — 「~에 지나지 않다」를 「지나지하다」로 쓴 것.
 * 말투 판단(하오체·존댓말)은 하지 않는다. 그건 팩의 몫이다.
 */
private val BROKEN_ENDINGS_KO = listOf(
    Regex("지나지\\s?하지요") to "지나지 않지요",
    Regex("지나지\\s?합니다") to "지나지 않습니다",
    Regex("지나지\\s?하오") to "지나지 않소",
    Regex("지나지\\s?한다") to "지나지 않는다",
)

internal fun fixBrokenEndings(text: String, locale: String): String =
    if (locale == "en") text else BROKEN_ENDINGS_KO.fold(text) { t, (r, w) -> t.replace(r, w) }

/** 문장 끝의 반말 「~지」「~군」(뒤에 문장부호). 「~지요」는 해요체라 건드리지 않는다. */
private val BANMAL_END = Regex("([\uAC00-\uD7A3])(지|군)(?=[.?!…]|$)")

/**
 * 하오체 철학자([KoRegister.HAO])의 반말 끝맺음을 하오체로 바꾼다. 문장 끝만 본다.
 * - 「~지」: 앞 글자에 받침이 있으면 「~소」(겠지→겠소, 않지→않소), 없으면 「~오」(이지→이오, 하지→하오)
 * - 「~군」: 「~구려」(하는군→하는구려, 오더군→오더구려)
 */
internal fun fixRegister(text: String, locale: String, register: KoRegister): String {
    if (locale == "en" || register != KoRegister.HAO) return text
    return splitSentences(text).joinToString(" ") { s ->
        // 뒤에 문장부호나 끝이 와야 맞는다 — 문장 중간의 「가지가」「군대」는 건드리지 않는다.
        val m = BANMAL_END.findAll(s).lastOrNull() ?: return@joinToString s
        val prev = m.groupValues[1][0]
        val ending = if (m.groupValues[2] == "군") "구려" else if ((prev.code - 0xAC00) % 28 != 0) "소" else "오"
        s.substring(0, m.range.first) + prev + ending + s.substring(m.range.last + 1)
    }
}

/** 자기 이름을 3인칭으로 쓴 문장(「니체는 …라고 답했을지도」, 니체가 쓴 「니체의 말이 인상적이네요」). */
internal fun selfThirdPersonSentences(text: String, selfNames: List<String>): List<String> {
    val names = selfNames.filter { it.isNotBlank() }
    if (names.isEmpty()) return emptyList()
    return splitSentences(text).filter { s -> names.any { n -> s.contains(n, ignoreCase = true) } }
}

/**
 * 답 하나를 검사한다. 순서: 앱 내부 말·어미 고치기 → 오염 지점에서 자르기 → 깨진 글자 → 자기 3인칭 → 앞말 되풀이 → 맞장구 떼기 → 예시 베끼기.
 * 잘라 낸 뒤 남는 것은 마지막 완결 문장까지만 둔다(문장이 중간에 끊긴 채 저장되지 않게).
 * @param selfNames 말하는 철학자 자신의 이름들 — 답에 나오면 자기를 남처럼 부른 것이다.
 * @param recent 바로 앞 대화 줄들 — 이것을 거의 그대로 옮긴 문장은 뺀다.
 * @param register 팩의 한국어 끝맺음 규칙([fixRegister])
 */
internal fun guardReply(
    text: String, locale: String, examples: List<String>, selfNames: List<String> = emptyList(),
    recent: List<String> = emptyList(), register: KoRegister = KoRegister.FREE,
): Guarded {
    var t = fixRegister(fixBrokenEndings(replaceAppWords(text, locale), locale), locale, register).trim()
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
    val echoed = echoedSentences(t, recent).toSet()
    if (echoed.isNotEmpty()) {
        t = splitSentences(t).filter { it !in echoed }.joinToString(" ")
        issue = issue ?: GuardIssue.ECHOED_PREVIOUS
    }
    t = stripBareAgreement(stripEchoOpeners(t, locale))
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

/** 다음 조각에 따라 고칠지가 갈리는 끝 — 다음 조각이 올 때까지 화면에 내지 않는다(「사용」→「사용자」, 「지나지하」→「지나지하지요」). */
private val PENDING_TAIL_KO = Regex("(?:사용|지나지 ?하?)$")
/** 하오체 팩에서 끝에 막 붙은 「지」「군」 — 「겠지」로 끝날지 「겠지만」으로 이어질지 아직 모른다. */
private val PENDING_BANMAL = Regex("(?<=[가-힣])[지군]$")

/**
 * 스트리밍 화면용: 저장할 때 [guardReply]가 고칠 것 중 **글자 단위로 고치는 것**을 화면에서도 미리 고친다.
 * 전에는 「~겠지」가 흘러나오다 저장 때 「~겠소」로, 「그렇소.」가 보였다가 사라졌다(세션 6 기록).
 * - 앱 내부 말·엉터리 어미·하오체 끝맺음: 같은 함수로 고친다. 갈림길에 선 끝 글자는 다음 조각까지 보류.
 * - 첫머리 맞장구 한 마디: 그 한 문장뿐이면 보류, 다음 문장이 시작되면 떼고 보여 준다.
 * 문장을 통째로 빼는 검사(베끼기·되풀이·자기 3인칭)는 답이 끝나야 판단할 수 있어 여기서 하지 않는다.
 * @return 보여 줄 글. 지금은 아무것도 보여 주면 안 되면 null.
 */
internal fun polishPartial(text: String, locale: String, register: KoRegister): String? {
    var t = text
    if (locale != "en") {
        t = t.replace(PENDING_TAIL_KO, "")
        if (register == KoRegister.HAO) t = t.replace(PENDING_BANMAL, "")
    }
    t = fixRegister(fixBrokenEndings(replaceAppWords(t, locale), locale), locale, register).trimEnd()
    val s = splitSentences(t)
    if (s.size == 1 && BARE_AGREE.matches(s[0])) return null
    return stripBareAgreement(t).ifEmpty { null }
}
