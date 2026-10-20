package app.agora.philosophers

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** 계약 문서: docs/sprint0/04_philosopher_registry_contract.md */
@Serializable
data class PhilosopherPack(
    @SerialName("schema_version") val schemaVersion: Int,
    val id: String,
    @SerialName("legacy_ids") val legacyIds: List<String> = emptyList(),
    @SerialName("pack_version") val packVersion: String,
    val status: PackStatus,
    val order: Int = Int.MAX_VALUE,
    val display: Display,
    val aliases: LocalizedList,
    val persona: Persona,
    val relations: List<Relation> = emptyList(),
    val knowledge: Knowledge,
    val assets: Assets = Assets(),
    val locales: List<String>,
)

@Serializable
enum class PackStatus {
    @SerialName("active") ACTIVE,
    @SerialName("beta") BETA,
    @SerialName("disabled") DISABLED,
}

@Serializable
data class Localized(val ko: String, val en: String) {
    fun get(locale: String): String = if (locale == "en") en else ko
}

@Serializable
data class LocalizedList(val ko: List<String> = emptyList(), val en: List<String> = emptyList()) {
    fun get(locale: String): List<String> = if (locale == "en") en else ko
    fun all(): List<String> = ko + en
}

@Serializable
data class Display(
    val name: Localized,
    @SerialName("full_name") val fullName: Localized? = null,
    val years: Localized,
    @SerialName("one_line") val oneLine: Localized,
    val ideas: LocalizedList,
    @SerialName("style_summary") val styleSummary: Localized,
    val colors: ThemeColors,
    @SerialName("portrait_asset_id") val portraitAssetId: String? = null,
)

@Serializable
data class ThemeColors(val light: HueColors, val dark: HueColors)

@Serializable
data class HueColors(
    val hue: String,
    @SerialName("hue_soft") val hueSoft: String,
)

@Serializable
data class Persona(
    @SerialName("speech_level") val speechLevel: Localized,
    @SerialName("dm_greeting") val dmGreeting: Localized? = null,
    @SerialName("conversation_traits") val conversationTraits: LocalizedList,
    val avoid: LocalizedList = LocalizedList(),
    @SerialName("ask_question_tendency") val askQuestionTendency: Level = Level.MEDIUM,
    @SerialName("default_length_profile") val defaultLengthProfile: String = "adaptive",
    @SerialName("debate_affinity") val debateAffinity: Level = Level.MEDIUM,
    /**
     * 화제별 관련도(0~1). 키는 [TOPIC_KEYS]. 발언자 순위의 보조 신호로만 쓴다.
     * 없는 화제는 `open` 값, 그것도 없으면 0.
     */
    @SerialName("topic_affinity") val topicAffinity: Map<String, Double> = emptyMap(),
    /**
     * 말투 예시 문장. 작은 모델은 규칙보다 예시를 더 잘 따른다.
     * 화면에 보이지 않고 프롬프트에만 들어간다. 실제 저작 인용이 아니라 이 앱이 만든 문장이어야 한다.
     */
    val examples: LocalizedList = LocalizedList(),
    /**
     * 가벼운 일상 말([examples]와 같은 규칙)에만 쓰는 말투 예시. 비어 있으면 [examples]에서 고른다.
     * 가벼운 말에서도 [examples]에서 고르니, 커피 이야기에는 커피 예시가 빠지고 「기쁨은 생각보다 짧습니다」 같은
     * 무거운 예시만 남아 쇼펜하우어가 「덧없는 만족」으로 받았다(노트북 Gemma 4 E2B, 가벼운 말 75개 중 5).
     */
    @SerialName("light_examples") val lightExamples: LocalizedList = LocalizedList(),
    /**
     * 한국어 끝맺음 규칙. `hao`이면 생성 후 검사가 반말 끝맺음(「~겠지.」「~이지.」「~군.」)을 하오체로 바꾼다.
     * 프롬프트만으로는 작은 모델(Gemma 4 E2B)이 하오체를 지키지 못했다 — 니체 답 문장 약 330개 중 24개가 반말.
     */
    @SerialName("ko_register") val koRegister: KoRegister = KoRegister.FREE,
)

@Serializable
enum class KoRegister {
    /** 끝맺음을 고치지 않는다(존댓말이 섞이는 말투 등) */
    @SerialName("free") FREE,
    /** 하오체(~하오, ~이오, ~겠소) */
    @SerialName("hao") HAO,
}

@Serializable
enum class Level {
    @SerialName("low") LOW,
    @SerialName("medium") MEDIUM,
    @SerialName("high") HIGH,
}

@Serializable
data class Relation(
    @SerialName("philosopher_id") val philosopherId: String,
    @SerialName("relation_type") val relationType: String,
    val note: String? = null,
)

@Serializable
data class Knowledge(
    @SerialName("core_concepts") val coreConcepts: List<String>,
    val sources: List<Source> = emptyList(),
    @SerialName("quote_policy") val quotePolicy: QuotePolicy,
)

@Serializable
data class Source(
    val title: Localized,
    val rights: Rights,
    val translation: String? = null,
)

@Serializable
enum class Rights {
    @SerialName("public_domain") PUBLIC_DOMAIN,
    @SerialName("licensed") LICENSED,
    @SerialName("in_copyright") IN_COPYRIGHT,
}

@Serializable
enum class QuotePolicy {
    /** 검증한 공개 영역 원전만 '원전'으로 인용(자체 번역) */
    @SerialName("verified_public_domain_only") VERIFIED_PUBLIC_DOMAIN_ONLY,
    /** 인용 금지 — 요약·의역만 (카뮈·시오랑) */
    @SerialName("paraphrase_only") PARAPHRASE_ONLY,
}

@Serializable
data class Assets(val portrait: Portrait? = null)

@Serializable
data class Portrait(
    val file: String,
    @SerialName("rights_status") val rightsStatus: String,
)
