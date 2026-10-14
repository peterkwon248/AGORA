package app.agora.inference.demo

import app.agora.inference.GenerateEvent
import app.agora.inference.GenerateRequest
import app.agora.inference.InferenceProvider
import app.agora.inference.ProviderCapabilities
import app.agora.inference.ProviderType
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.util.concurrent.ConcurrentHashMap

/**
 * **테스트 전용** 가짜 생성기. 미리 정한 문장을 토큰처럼 잘라 내보낸다.
 * providerType = DEMO 이므로 화면·저장 계층이 실제 AI로 오인할 수 없다.
 *
 * @param script 화자 ID → 그 화자가 차례로 말할 문장들. 다 쓰면 마지막 문장을 반복한다.
 */
class DemoInferenceProvider(
    private val script: Map<String?, List<String>>,
    private val tokenDelayMs: Long = 0,
    private val chunkChars: Int = 4,
) : InferenceProvider {
    override val id: String = "demo"

    private val cursor = ConcurrentHashMap<String?, Int>()
    private val cancelled = ConcurrentHashMap.newKeySet<String>()

    override fun capabilities() = ProviderCapabilities(
        providerType = ProviderType.DEMO,
        streaming = true,
        supportsCancellation = true,
        maxContextTokens = null,
        supportedLocales = setOf("ko", "en"),
    )

    override fun generate(request: GenerateRequest): Flow<GenerateEvent> = flow {
        emit(GenerateEvent.Started(request.generationId))
        val lines = script[request.speakerId] ?: script[null] ?: listOf("")
        val i = cursor.merge(request.speakerId, 1, Int::plus)!! - 1
        val text = lines[minOf(i, lines.lastIndex)]
        for (chunk in text.chunked(chunkChars)) {
            if (request.generationId in cancelled) {
                emit(GenerateEvent.Cancelled)
                return@flow
            }
            if (tokenDelayMs > 0) delay(tokenDelayMs)
            emit(GenerateEvent.Token(chunk))
        }
        emit(GenerateEvent.Completed(text))
    }

    override suspend fun cancel(generationId: String) {
        cancelled += generationId
    }
}
