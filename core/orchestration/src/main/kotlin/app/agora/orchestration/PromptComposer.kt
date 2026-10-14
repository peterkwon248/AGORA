package app.agora.orchestration

import app.agora.inference.PromptMessage
import app.agora.inference.PromptRole
import app.agora.philosophers.PhilosopherPack
import app.agora.philosophers.PhilosopherRegistry
import app.agora.philosophers.QuotePolicy

/** 모델에 보여 줄 대화 한 줄. 이미 권한 검사를 통과한 것만 들어온다. */
data class TranscriptLine(
    val authorId: String?, // null = 사용자
    val text: String,
)

/** 할 말이 없을 때 모델이 내는 신호. 저장하지 않고 '침묵'으로 처리한다(설계서 7.2-3). */
const val PASS_TOKEN = "[PASS]"

/**
 * 팩 + 대화 기록 → 프롬프트. 철학자별 분기 없이 팩 내용만으로 만든다.
 * 사용자가 쓴 글은 SYSTEM이 아니라 USER 역할에만 들어간다(설계서 23.4 프롬프트 삽입 대응).
 */
class PromptComposer(private val registry: PhilosopherRegistry) {

    fun compose(
        speaker: PhilosopherPack,
        locale: String,
        transcript: List<TranscriptLine>,
        roomKind: RoomKind,
        otherMembers: List<String>,
        respondTo: String?,
        debateAllowed: Boolean,
        intensity: DebateIntensity,
        mayPass: Boolean,
    ): List<PromptMessage> = listOf(
        PromptMessage(PromptRole.SYSTEM, system(speaker, locale, roomKind, otherMembers, debateAllowed, intensity, mayPass)),
        PromptMessage(PromptRole.USER, conversation(speaker, locale, transcript, respondTo)),
    )

    private fun name(id: String?, locale: String): String =
        if (id == null) (if (locale == "en") "User" else "사용자") else registry.get(id)?.display?.name?.get(locale) ?: id

    private fun system(
        p: PhilosopherPack, locale: String, roomKind: RoomKind, others: List<String>,
        debateAllowed: Boolean, intensity: DebateIntensity, mayPass: Boolean,
    ): String {
        val ko = locale != "en"
        val nm = p.display.name.get(locale)
        val full = (p.display.fullName ?: p.display.name).get(locale)
        val traits = p.persona.conversationTraits.get(locale).joinToString("\n") { "- $it" }
        val avoid = p.persona.avoid.get(locale).joinToString("\n") { "- $it" }
        val examples = p.persona.examples.get(locale)
        val examplesBlock = if (examples.isEmpty()) "" else (
            (if (ko) "말투 예시(상황이 달라도 이런 결로 말한다. 그대로 베끼지 않는다):\n" else "Voice examples (speak in this grain even when the situation differs; never copy them verbatim):\n") +
                examples.joinToString("\n") { "- $it" }
            )
        val othersText = others.joinToString(", ") { name(it, locale) }
        val quote = when (p.knowledge.quotePolicy) {
            QuotePolicy.PARAPHRASE_ONLY -> if (ko) "저작을 직접 인용하지 말고, 생각을 당신의 말로 풀어 말한다." else "Never quote your works; put ideas in your own words."
            QuotePolicy.VERIFIED_PUBLIC_DOMAIN_ONLY -> if (ko) "확실하지 않은 문장을 당신의 저작에서 인용한 것처럼 말하지 않는다." else "Never present an uncertain sentence as a quotation from your works."
        }
        val debate = when {
            !debateAllowed -> if (ko) "지금은 반박하지 말고 받아 주거나 덧붙인다." else "Do not argue right now; acknowledge or add."
            intensity == DebateIntensity.GENTLE -> if (ko) "생각이 다르면 부드럽게 다른 관점을 말한다." else "If you disagree, offer another view gently."
            intensity == DebateIntensity.BALANCED -> if (ko) "생각이 실제로 다르면 근거를 들어 반박해도 된다. 억지로 반대하지는 않는다." else "If you truly disagree, you may push back with reasons. Never disagree for its own sake."
            else -> if (ko) "생각이 실제로 다르면 논증을 끝까지 밀고 간다. 인신공격·모욕은 하지 않는다." else "If you truly disagree, press the argument rigorously. No insults or personal attacks."
        }
        // 침묵 신호는 한 번만, 좁은 조건으로 말한다. PC 시험(qwen2.5:7b)에서 두 번 말하면 두 번째 화자가 거의 늘 침묵했다.
        val pass = if (mayPass) (
            if (ko) "앞사람과 다른 관점·경험·질문이 있으면 짧게 덧붙인다. 앞의 말을 되풀이하는 것밖에 할 말이 없을 때만 정확히 $PASS_TOKEN 만 출력한다."
            else "If you have a different angle, experience or question, add it briefly. Only if all you could do is repeat what was said, output exactly $PASS_TOKEN."
        ) else ""
        return if (ko) """
            |당신은 메신저 앱 AGORA의 ${if (roomKind == RoomKind.DM) "1:1 대화" else "단톡방"} 속 '$nm'입니다. $full 의 사상을 바탕으로 한 AI 시뮬레이션이며, 실제 인물이 아닙니다.
            |${if (others.isNotEmpty()) "함께 있는 철학자: $othersText." else ""}
            |
            |말투: ${p.persona.speechLevel.ko}
            |성향:
            |$traits
            |피할 것:
            |$avoid
            |${if (examplesBlock.isNotEmpty()) "\n$examplesBlock\n" else ""}
            |규칙:
            |- 메신저 대화처럼 말한다. 강의하지 않는다. 보통 1~3문장.
            |- 상대가 가벼운 이야기를 하면 가볍게 받는다. 철학 개념을 억지로 끼워 넣지 않는다.
            |- 모르는 사실(사람·노래·사건의 세부)은 지어내지 않는다. 모르면 묻는다.
            |- 사용자의 감정을 진단하거나 훈계하지 않는다.
            |- $quote
            |- $debate
            |- 당신 한 사람의 말만 쓴다. 이름표나 따옴표를 붙이지 않는다. 다른 사람의 말을 대신 쓰지 않는다.
            |- 반드시 한국어로 답한다.
            |${if (pass.isNotEmpty()) "- $pass" else ""}
        """.trimMargin().trim() else """
            |You are '$nm' in the ${if (roomKind == RoomKind.DM) "one-on-one chat" else "group chat"} of the messenger app AGORA — an AI simulation based on the ideas of $full, not the real person.
            |${if (others.isNotEmpty()) "Other philosophers here: $othersText." else ""}
            |
            |Voice: ${p.persona.speechLevel.en}
            |Traits:
            |$traits
            |Avoid:
            |$avoid
            |${if (examplesBlock.isNotEmpty()) "\n$examplesBlock\n" else ""}
            |Rules:
            |- Talk like a messenger chat, not a lecture. Usually 1–3 sentences.
            |- Meet light talk lightly. Do not force philosophical concepts in.
            |- Never invent facts (details about people, songs, events). Ask if you don't know.
            |- Do not diagnose or lecture the user about their feelings.
            |- $quote
            |- $debate
            |- Write only your own single message. No name labels, no quotation marks, never speak for others.
            |- Always answer in English.
            |${if (pass.isNotEmpty()) "- $pass" else ""}
        """.trimMargin().trim()
    }

    private fun conversation(p: PhilosopherPack, locale: String, transcript: List<TranscriptLine>, respondTo: String?): String {
        val ko = locale != "en"
        val log = transcript.joinToString("\n") { "[${name(it.authorId, locale)}] ${it.text}" }
        val nm = p.display.name.get(locale)
        // 침묵 신호는 SYSTEM 규칙에만 있다 — 여기서 다시 말하지 않는다.
        return if (ko) {
            val ask = when (respondTo) {
                null -> "이제 '$nm'로서 사용자의 마지막 말에 이어지는 다음 한 마디만 쓰세요."
                else -> "이제 '$nm'로서 ${name(respondTo, locale)}의 바로 앞 말을 듣고 다음 한 마디만 쓰세요. 동의하든, 다른 각도를 보태든, 묻든 당신의 관점이면 됩니다."
            }
            "지금까지의 대화:\n$log\n\n$ask"
        } else {
            val ask = when (respondTo) {
                null -> "Now, as '$nm', write only your next single message responding to the user's last message."
                else -> "Now, as '$nm', having heard ${name(respondTo, locale)}'s last message, write only your next single message. Agree, add another angle, or ask—so long as it is your own view."
            }
            "Conversation so far:\n$log\n\n$ask"
        }
    }
}
