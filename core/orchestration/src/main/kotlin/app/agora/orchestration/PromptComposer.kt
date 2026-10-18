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

/** 프롬프트에 넣는 말투 예시 수. 팩에는 언어마다 최대 12개까지 둘 수 있다. */
internal const val MAX_EXAMPLES = 4
/** 예시와의 겹침을 잴 때 보는 최근 대화 줄 수 */
private const val RECENT_LINES = 3

/**
 * 가벼운 말의 결을 지키라는 지시. 대화 상대의 마지막 말이 가벼운 일상([LightTalk])일 때만 마지막 요청 바로 옆에 넣는다.
 * - 기준을 '대화 상대가 꺼낸 이야기'로 잡는다 — '가벼운 이야기라면'만 쓰면, 앞 철학자가 이미 무겁게 받은 뒤에는
 *   모델이 「덧없음→고통의 순환」으로 더 무거워졌다(노트북 Gemma 4 E2B, 가벼운 말 15개 중 9~10개).
 * - 늘 넣고 '커피·날씨…' 같은 예를 들었더니 멘션 질문에 「오늘 날씨가 꽤 쌀쌀하오」라고 화제를 지어냈다 → 조건부, 예 없음.
 */
internal const val LIGHT_KO = "대화 상대는 가벼운 일상 이야기를 꺼냈습니다. 앞사람이 무겁게 받았더라도 그 가벼운 결로 돌아가세요. 고통·덧없음·의지·욕망·영원 같은 말을 쓰지 말고 친구처럼 짧게 맞장구치거나 하나만 물으세요."
internal const val LIGHT_EN = "Your chat partner brought up something light and everyday. Keep it light even if the previous speaker got heavy. Avoid words like suffering, futility, will, desire, eternity; respond briefly like a friend or ask one simple question."

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
        avoidExamples: Set<String> = emptySet(),
    ): List<PromptMessage> {
        // 기기 안 AI가 같은 철학자의 앞부분(SYSTEM + 지난 대화)을 다시 읽지 않고 재사용하려면 앞부분이 차례마다 같아야 한다.
        // - 말투 예시는 SYSTEM 맨 끝. 대화 상대의 **마지막 말만** 보고 고른다 → 한 흐름(이어 말하기 차례들) 안에서는 바뀌지 않는다.
        //   (예시를 대화 기록 바로 뒤에 두었더니 모델이 대화 줄로 여겨 앞사람 문장을 그대로 되풀이했다 — 노트북 E2B, 가벼운 말 30개 중 1 → 5)
        // - 논쟁 강도 규칙은 방 설정이라 SYSTEM에 둔다. 마지막 요청 근처로 옮겼더니 가벼운 말에도 따지며 무거워졌다
        //   (노트북 E2B, 가벼운 말 75개 중 철학 낱말 6 → 15).
        // - 차례마다 바뀌는 좁은 규칙(지금은 반박 말기·침묵 신호)만 대화 기록 뒤, 마지막 요청 앞에 둔다.
        val examples = pickExamples(speaker.persona.examples.get(locale) - avoidExamples, transcript.filter { it.authorId == null }.takeLast(1))
        return listOf(
            PromptMessage(PromptRole.SYSTEM, system(speaker, locale, roomKind, otherMembers, intensity, examples)),
            PromptMessage(PromptRole.USER, conversation(speaker, locale, transcript, respondTo, turnRules(locale, debateAllowed, mayPass))),
        )
    }

    /**
     * 대화 기록의 이름표. 사용자는 '사용자'가 아니라 '대화 상대' — PC 시험에서 모델이 이름표를 그대로 받아
     * 「오늘의 노래가 사용자에게…」처럼 앱 내부 말을 답에 썼다.
     */
    private fun name(id: String?, locale: String): String =
        if (id == null) (if (locale == "en") "Chat partner" else "대화 상대") else registry.get(id)?.display?.name?.get(locale) ?: id

    /** 함께 있는 철학자와의 관계(팩 relations). 맞장구만 오가지 않게 어디서 생각이 갈리는지 알려 준다. */
    private fun relationLines(p: PhilosopherPack, others: List<String>, locale: String): List<String> =
        p.relations.filter { it.philosopherId in others }.map { r ->
            val note = if (locale == "en") r.relationType.replace('_', ' ') else r.note ?: r.relationType.replace('_', ' ')
            "- ${name(r.philosopherId, locale)}: $note"
        }

    /** 방 설정(논쟁 강도)에 따른 규칙 — SYSTEM에 둔다. */
    private fun debateRule(ko: Boolean, intensity: DebateIntensity): String = when (intensity) {
        DebateIntensity.GENTLE -> if (ko) "생각이 다르면 부드럽게 다른 관점을 말한다." else "If you disagree, offer another view gently."
        DebateIntensity.BALANCED -> if (ko) "당신의 사상과 실제로 다르면 다르다고 분명히 말하고 근거를 든다. 억지로 반대하지는 않는다." else "If it truly differs from your thought, say so plainly and give a reason. Never disagree for its own sake."
        else -> if (ko) "생각이 실제로 다르면 논증을 끝까지 밀고 간다. 인신공격·모욕은 하지 않는다." else "If you truly disagree, press the argument rigorously. No insults or personal attacks."
    }

    /** 이번 차례에만 해당하는 좁은 지시 — 대화 기록 뒤, 마지막 요청 앞. 없으면 빈 문자열. */
    private fun turnRules(locale: String, debateAllowed: Boolean, mayPass: Boolean): String {
        val ko = locale != "en"
        val rules = buildList {
            if (!debateAllowed) add(if (ko) "지금은 반박하지 말고 받아 주거나 덧붙인다." else "Do not argue right now; acknowledge or add.")
            // 침묵 신호는 한 번만, 좁은 조건으로 말한다. PC 시험(qwen2.5:7b)에서 두 번 말하면 두 번째 화자가 거의 늘 침묵했다.
            if (mayPass) add(
                if (ko) "앞사람과 다른 관점·경험·질문이 있으면 짧게 덧붙인다. 앞의 말을 되풀이하는 것밖에 할 말이 없을 때만 정확히 $PASS_TOKEN 만 출력한다."
                else "If you have a different angle, experience or question, add it briefly. Only if all you could do is repeat what was said, output exactly $PASS_TOKEN.",
            )
        }
        return if (rules.isEmpty()) "" else (if (ko) "이번 차례:\n" else "This turn:\n") + rules.joinToString("\n") { "- $it" }
    }

    /** 철학자·방·대화 상대의 마지막 말에 따라서만 정해지는 앞부분. 한 흐름 안에서 같아야 기기 안 AI가 다시 읽지 않고 재사용한다. */
    private fun system(p: PhilosopherPack, locale: String, roomKind: RoomKind, others: List<String>, intensity: DebateIntensity, examples: List<String>): String =
        base(p, locale, roomKind, others, debateRule(locale != "en", intensity)) + (if (examples.isEmpty()) "" else "\n\n" + (
            (if (locale != "en") "말투 예시(상황이 달라도 이런 결로 말한다. 그대로 베끼지 않는다):\n" else "Voice examples (speak in this grain even when the situation differs; never copy them verbatim):\n") +
                examples.joinToString("\n") { "- $it" }))

    private fun base(p: PhilosopherPack, locale: String, roomKind: RoomKind, others: List<String>, debate: String): String {
        val ko = locale != "en"
        val nm = p.display.name.get(locale)
        val full = (p.display.fullName ?: p.display.name).get(locale)
        val traits = p.persona.conversationTraits.get(locale).joinToString("\n") { "- $it" }
        val avoid = p.persona.avoid.get(locale).joinToString("\n") { "- $it" }
        val othersText = others.joinToString(", ") { name(it, locale) }
        val relations = relationLines(p, others, locale)
        val quote = when (p.knowledge.quotePolicy) {
            QuotePolicy.PARAPHRASE_ONLY -> if (ko) "저작을 직접 인용하지 말고, 생각을 당신의 말로 풀어 말한다." else "Never quote your works; put ideas in your own words."
            QuotePolicy.VERIFIED_PUBLIC_DOMAIN_ONLY -> if (ko) "확실하지 않은 문장을 당신의 저작에서 인용한 것처럼 말하지 않는다." else "Never present an uncertain sentence as a quotation from your works."
        }
        return if (ko) """
            |당신은 메신저 앱 AGORA의 ${if (roomKind == RoomKind.DM) "1:1 대화" else "단톡방"} 속 '$nm'입니다. $full 의 사상을 바탕으로 한 AI 시뮬레이션이며, 실제 인물이 아닙니다.
            |${if (others.isNotEmpty()) "함께 있는 철학자: $othersText." else ""}
            |${if (relations.isNotEmpty()) "그들과의 관계(생각이 갈리는 곳):\n" + relations.joinToString("\n") else ""}
            |
            |말투: ${p.persona.speechLevel.ko}
            |성향:
            |$traits
            |피할 것:
            |$avoid
            |규칙:
            |- 메신저 대화처럼 말한다. 강의하지 않는다. 보통 1~3문장.
            |- 상대가 가벼운 이야기를 하면 가볍게 받는다. 철학 개념을 억지로 끼워 넣지 않는다.
            |- 모르는 사실(사람·노래·사건의 세부)은 지어내지 않는다. 모르면 묻는다.
            |- 상대의 감정을 진단하거나 훈계하지 않는다.
            |- 질문만 던지지 않는다. 먼저 당신의 생각이나 느낌을 한 가지 말하고, 물을 때는 한 번만 묻는다.
            |- $quote
            |- $debate
            |- 당신 한 사람의 말만 쓴다. 이름표나 따옴표를 붙이지 않는다. 다른 사람의 말을 대신 쓰지 않는다.
            |- 당신 자신을 '$nm' 이름으로 부르지 않는다(「${nm}는 …」 금지). 당신은 '나'다. 대화 기록의 [$nm(당신)] 줄이 당신이 한 말이다.
            |- 대화 상대는 '당신'이라고 부른다. '사용자'라고 부르지 않고 '@이름' 표시를 쓰지 않는다.
            |- 앞사람 말을 「~말씀대로」로 받아 되풀이하지 않는다. 동의하면 새 이유나 경험을 보탠다.
            |- 반드시 한국어로 답한다.
        """.trimMargin().trim() else """
            |You are '$nm' in the ${if (roomKind == RoomKind.DM) "one-on-one chat" else "group chat"} of the messenger app AGORA — an AI simulation based on the ideas of $full, not the real person.
            |${if (others.isNotEmpty()) "Other philosophers here: $othersText." else ""}
            |${if (relations.isNotEmpty()) "How you relate to them (where your thinking parts):\n" + relations.joinToString("\n") else ""}
            |
            |Voice: ${p.persona.speechLevel.en}
            |Traits:
            |$traits
            |Avoid:
            |$avoid
            |Rules:
            |- Talk like a messenger chat, not a lecture. Usually 1–3 sentences.
            |- Meet light talk lightly. Do not force philosophical concepts in.
            |- Never invent facts (details about people, songs, events). Ask if you don't know.
            |- Do not diagnose or lecture them about their feelings.
            |- Do not just ask questions. Say one thought or feeling of your own first; ask at most once.
            |- $quote
            |- $debate
            |- Write only your own single message. No name labels, no quotation marks, never speak for others.
            |- Never refer to yourself as '$nm' in the third person. You are "I". Lines marked [$nm (you)] are what you said.
            |- Address your chat partner as "you". Never call them "the user" and never write '@name' tags.
            |- Do not echo the previous speaker ("As X said…"). If you agree, add a new reason or experience.
            |- Always answer in English.
        """.trimMargin().trim()
    }

    /**
     * 말투 예시 중 지금 대화와 **상황이 가장 덜 겹치는** [MAX_EXAMPLES]개만 넣는다.
     * PC 시험(qwen2.5:7b): 사용자가 커피·노래 이야기를 하면 같은 상황의 예시를 정답처럼 그대로 베꼈다(6가지 대화 중 4번).
     * 겹침은 최근 대화와 예시가 공유하는 낱말 조각 수 — 한글은 두 글자 조각, 영문은 세 글자 이상 낱말.
     * 겹침이 같으면 대화 내용에 따라 도는 순서로 고른다 — 늘 앞쪽 예시만 들어가지 않게(같은 대화엔 같은 결과).
     */
    private fun pickExamples(examples: List<String>, transcript: List<TranscriptLine>): List<String> {
        if (examples.size <= MAX_EXAMPLES) return examples
        val recent = transcript.takeLast(RECENT_LINES).joinToString(" ") { it.text }
        val context = tokens(recent)
        val offset = Math.floorMod(recent.hashCode(), examples.size)
        return examples.withIndex()
            .sortedWith(compareBy({ (tokens(it.value) intersect context).size }, { Math.floorMod(it.index - offset, examples.size) }))
            .take(MAX_EXAMPLES).sortedBy { it.index }.map { it.value }
    }

    private fun tokens(s: String): Set<String> = buildSet {
        for (w in s.lowercase().split(Regex("[^\\p{L}\\p{N}]+"))) {
            if (w.isEmpty()) continue
            if (w.first() in 'a'..'z') { if (w.length >= 3) add(w) } else w.windowed(2).forEach(::add)
        }
    }

    private fun conversation(p: PhilosopherPack, locale: String, transcript: List<TranscriptLine>, respondTo: String?, rules: String): String {
        val ko = locale != "en"
        val nm = p.display.name.get(locale)
        // 자기 발언에 '(당신)'을 붙인다 — 이름표만 있으면 모델이 자기 말을 남의 말처럼 받아 「니체의 말이 인상적이네요」라고 했다.
        val log = transcript.joinToString("\n") {
            val tag = name(it.authorId, locale) + if (it.authorId == p.id) (if (ko) "(당신)" else " (you)") else ""
            "[$tag] ${it.text}"
        }
        // 침묵 신호는 [rules]에 한 번만 있다 — 여기서 다시 말하지 않는다.
        val light = LightTalk.isLight(transcript.lastOrNull { it.authorId == null }?.text.orEmpty())
        return if (ko) {
            val ask = when (respondTo) {
                null -> "이제 '$nm'로서 대화 상대의 마지막 말에 이어지는 다음 한 마디만 쓰세요."
                else -> "이제 '$nm'로서 ${name(respondTo, locale)}의 바로 앞 말을 듣고 다음 한 마디만 쓰세요. 동의하든, 다른 각도를 보태든, 묻든 당신의 관점이면 됩니다."
            }
            // 말투는 SYSTEM에도 있지만 긴 대화에서 해요체로 흘렀다 — 마지막 요청 바로 옆에 한 번 더.
            // 가벼운 말 지시도 SYSTEM에 있지만 기기 안 작은 모델(Gemma 4 E2B)이 커피 이야기에도 철학을 꺼냈다 — 끝에 한 번 더.
            "지금까지의 대화:\n$log\n\n${if (rules.isEmpty()) "" else "$rules\n\n"}$ask\n${if (light) "$LIGHT_KO\n" else ""}말투: ${p.persona.speechLevel.ko}"
        } else {
            val ask = when (respondTo) {
                null -> "Now, as '$nm', write only your next single message responding to your chat partner's last message."
                else -> "Now, as '$nm', having heard ${name(respondTo, locale)}'s last message, write only your next single message. Agree, add another angle, or ask—so long as it is your own view."
            }
            "Conversation so far:\n$log\n\n${if (rules.isEmpty()) "" else "$rules\n\n"}$ask\n${if (light) "$LIGHT_EN\n" else ""}Voice: ${p.persona.speechLevel.en}"
        }
    }
}
