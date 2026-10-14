package app.agora.orchestration

/**
 * 모델 답 문자열을 다루는 규칙 모음. 완성된 답([isPassReply]·[cleanReply])과
 * 스트리밍 중인 부분 답([displayablePartial])이 **같은 규칙**을 쓰게 해서, 커밋될 때 화면이 튀지 않게 한다.
 */

private val PASS_ONLY = Regex("^[\\[(]?\\s*PASS\\s*[\\])]?[.!]?$", RegexOption.IGNORE_CASE)
private val NAME_TAG_BRACKET = Regex("^\\[[^\\]]{1,20}]\\s*")
private val NAME_TAG_COLON = Regex("^[^\\s:：]{1,12}[:：]\\s*")
private val PASS_SHAPES = listOf("[PASS]", "(PASS)", "PASS")

/** `[PASS]`, `PASS`, `(PASS)`, `PASS.` 처럼 침묵 신호만 있는 답. 문장 속 단어 'pass'는 침묵이 아니다. */
internal fun isPassReply(raw: String): Boolean =
    raw.contains(PASS_TOKEN) || raw.trim().matches(PASS_ONLY)

/** 모델이 붙이는 이름표·따옴표를 떼어 낸다. 내용은 바꾸지 않는다. */
internal fun cleanReply(raw: String): String {
    var t = raw.trim()
    t = t.replace(NAME_TAG_BRACKET, "")
    t = t.replace(NAME_TAG_COLON, "")
    if (t.length >= 2 && t.first() in "\"“'" && t.last() in "\"”'") t = t.substring(1, t.length - 1).trim()
    return t
}

/**
 * 스트리밍 중인 부분 답 → 지금 화면에 보여 줄 문장. 아직 보여 주면 안 되면 null.
 * - 침묵 신호(`[PASS]` 등)로 끝날 수 있는 앞부분은 보류한다 — 침묵인데 글자가 깜빡 보이면 안 된다.
 * - `[니체] `·`니체: ` 같은 이름표가 될 수 있는 첫 어절은 끝날 때까지 보류한다.
 * - 끝에 붙기 시작한 `[PASS]` 조각은 잘라 낸다.
 */
internal fun displayablePartial(raw: String): String? {
    val t = raw.trimStart()
    if (t.contains(PASS_TOKEN) || mayBecomePass(t)) return null
    if (t.startsWith("[") && !t.contains(']') && t.length <= 21) return null
    val firstRun = t.takeWhile { !it.isWhitespace() && it != ':' && it != '：' }
    if (firstRun.length == t.length && t.length <= 12) return null
    val cut = (PASS_TOKEN.length - 1 downTo 1).firstOrNull { k -> t.endsWith(PASS_TOKEN.substring(0, k)) } ?: 0
    return cleanReply(t.dropLast(cut)).ifEmpty { null }
}

private fun mayBecomePass(s: String): Boolean {
    val v = s.filterNot(Char::isWhitespace).uppercase()
    if (v.isEmpty()) return true
    return PASS_SHAPES.any { shape -> shape.startsWith(v) || (v.startsWith(shape) && v.length <= shape.length + 1) }
}
