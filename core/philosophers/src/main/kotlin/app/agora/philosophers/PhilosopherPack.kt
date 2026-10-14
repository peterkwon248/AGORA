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
)

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
