package app.agora.inference

import kotlinx.coroutines.flow.Flow

/**
 * 모든 AI 생성(채팅·대화 노트·댓글·사유 노트·선제 메시지)이 지나가는 단 하나의 계약.
 * 설계서 20.3 / 지시서 5.3.
 *
 * - 권한·과금은 이 계층이 결정하지 않는다. 호출자는 이미 권한 검사를 통과한 문맥만 넣는다.
 * - 모델이 없거나 실패하면 [GenerateEvent.Failed]로 알린다. **시연 문장으로 몰래 대체하지 않는다.**
 */
interface InferenceProvider {
    val id: String

    fun capabilities(): ProviderCapabilities

    /**
     * 생성 결과를 흐름으로 내보낸다.
     * 순서: [GenerateEvent.Started] → [GenerateEvent.Token]* → 끝 이벤트 하나
     * ([GenerateEvent.Completed] / [GenerateEvent.Cancelled] / [GenerateEvent.Failed]).
     * 수집을 취소하면 생성도 멈춰야 한다.
     */
    fun generate(request: GenerateRequest): Flow<GenerateEvent>

    /** 다른 곳에서 진행 중인 생성을 멈춘다. 이미 끝났으면 아무 일도 하지 않는다. */
    suspend fun cancel(generationId: String)
}

enum class ProviderType { LOCAL, CLOUD, DEMO }

data class ProviderCapabilities(
    val providerType: ProviderType,
    val streaming: Boolean,
    val supportsCancellation: Boolean,
    val maxContextTokens: Int?,
    val supportedLocales: Set<String>,
)

enum class GenerationTask { CHAT, NOTE_SUMMARY, PHILOSOPHER_NOTE, COMMENT, PROACTIVE_MESSAGE, MEMORY }

enum class ScopeType { ROOM, DM, NOTE, COMMENT }

data class GenerationScope(val type: ScopeType, val id: String)

enum class PromptRole { SYSTEM, USER, ASSISTANT }

/** 모델에 그대로 들어가는 한 덩어리. 사용자·외부 텍스트는 SYSTEM 역할로 올리지 않는다(설계서 23.4). */
data class PromptMessage(val role: PromptRole, val content: String)

data class GenerationBudget(
    val maxTurns: Int? = null,
    val maxCostUsd: Double? = null,
)

data class GenerateRequest(
    val generationId: String,
    val scope: GenerationScope,
    /** 말하는 철학자의 Registry ID. 요약처럼 화자가 없으면 null. */
    val speakerId: String?,
    val task: GenerationTask,
    val locale: String,
    /** 팩 버전 — 생성물 추적용 */
    val personaVersion: String?,
    /** 권한 필터를 통과한 출처 ID들만 */
    val contextRefs: List<String>,
    val messages: List<PromptMessage>,
    val maxOutputTokens: Int,
    val deadlineMs: Long,
    val budget: GenerationBudget = GenerationBudget(),
)

data class TokenUsage(val inputTokens: Int, val outputTokens: Int)

sealed interface GenerateEvent {
    data class Started(val generationId: String) : GenerateEvent
    data class Token(val text: String) : GenerateEvent
    data class Completed(val text: String, val usage: TokenUsage? = null) : GenerateEvent
    data object Cancelled : GenerateEvent
    data class Failed(val code: FailureCode, val retryable: Boolean, val detail: String? = null) : GenerateEvent
}

enum class FailureCode {
    /** 기기 안 모델이 설치되지 않음 — 화면에 '모델 없음'을 보여야 한다 */
    MODEL_NOT_INSTALLED,
    /** 이 기기에서 돌릴 수 없는 모델 */
    MODEL_UNSUPPORTED,
    OUT_OF_MEMORY,
    DEADLINE_EXCEEDED,
    /** 클라우드 동의·구독이 없음 */
    NOT_ENTITLED,
    NETWORK,
    INTERNAL,
}
