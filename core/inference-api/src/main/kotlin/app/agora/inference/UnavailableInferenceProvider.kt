package app.agora.inference

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf

/**
 * 기기 안 모델이 아직 없을 때 쓰는 자리 지킴이.
 * 항상 [FailureCode.MODEL_NOT_INSTALLED]로 실패한다 — 데모 문장으로 대신 답하지 않는다(지시서 9.3).
 */
class UnavailableInferenceProvider(
    private val code: FailureCode = FailureCode.MODEL_NOT_INSTALLED,
) : InferenceProvider {
    override val id: String = "unavailable"

    override fun capabilities() = ProviderCapabilities(
        providerType = ProviderType.LOCAL,
        streaming = false,
        supportsCancellation = false,
        maxContextTokens = null,
        supportedLocales = emptySet(),
    )

    override fun generate(request: GenerateRequest): Flow<GenerateEvent> =
        flowOf(GenerateEvent.Failed(code, retryable = false))

    override suspend fun cancel(generationId: String) = Unit
}
