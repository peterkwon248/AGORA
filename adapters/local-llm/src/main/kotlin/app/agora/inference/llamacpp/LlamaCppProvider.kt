package app.agora.inference.llamacpp

import android.os.SystemClock
import android.util.Log
import app.agora.inference.FailureCode
import app.agora.inference.GenerateEvent
import app.agora.inference.GenerateRequest
import app.agora.inference.InferenceProvider
import app.agora.inference.PromptRole
import app.agora.inference.ProviderCapabilities
import app.agora.inference.ProviderType
import app.agora.inference.TokenUsage
import kotlinx.coroutines.Job
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.buffer
import kotlinx.coroutines.flow.channelFlow
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

/**
 * 기기 안 AI — llama.cpp로 GGUF 모델을 휴대폰에서 직접 돌린다(ADR-002).
 *
 * - 모델 파일이 없으면 [FailureCode.MODEL_NOT_INSTALLED]. 다른 문장으로 대신 답하지 않는다.
 * - 모델은 첫 생성 때 읽는다(읽는 시간은 로그 `AGORA-llama`에 남긴다).
 * - 생성은 전용 스레드 하나에서 차례로 돈다. 수집을 취소하거나 [cancel]하면 다음 토큰에서 멈춘다.
 */
class LlamaCppProvider(
    val modelFile: File,
    private val nCtx: Int = 4096,
    val nThreads: Int = defaultThreads(),
    private val temperature: Float = 0.8f,
) : InferenceProvider {
    override val id = "llamacpp:${modelFile.name}"

    private val thread = Executors.newSingleThreadExecutor { r -> Thread(r, "agora-llama").apply { isDaemon = true } }
    private val dispatcher = thread.asCoroutineDispatcher()
    private val cancelled = ConcurrentHashMap.newKeySet<String>()
    private var handle = 0L

    override fun capabilities() = ProviderCapabilities(
        providerType = ProviderType.LOCAL,
        streaming = true,
        supportsCancellation = true,
        maxContextTokens = nCtx,
        supportedLocales = setOf("ko", "en"),
    )

    override fun generate(request: GenerateRequest): Flow<GenerateEvent> = channelFlow {
        send(GenerateEvent.Started(request.generationId))
        val terminal = withContext(dispatcher) { run(request) { trySend(GenerateEvent.Token(it)) } }
        send(terminal)
    }.buffer(Channel.UNLIMITED)

    override suspend fun cancel(generationId: String) { cancelled += generationId }

    /** 모델을 내려놓는다. 이후 생성은 다시 읽는다. */
    fun close() {
        thread.execute { if (handle != 0L) { LlamaNative.nativeFree(handle); handle = 0L } }
        thread.shutdown()
    }

    private suspend fun run(request: GenerateRequest, emit: (String) -> Unit): GenerateEvent {
        if (!modelFile.isFile) {
            return GenerateEvent.Failed(FailureCode.MODEL_NOT_INSTALLED, retryable = false, detail = "모델 파일 없음: ${modelFile.name}")
        }
        if (handle == 0L) {
            val t0 = SystemClock.elapsedRealtime()
            handle = LlamaNative.nativeLoad(modelFile.absolutePath, nCtx, nThreads)
            if (handle == 0L) {
                return GenerateEvent.Failed(FailureCode.MODEL_UNSUPPORTED, retryable = false, detail = "모델을 읽지 못함: ${modelFile.name}")
            }
            Log.i(TAG, "model loaded ${modelFile.name} in ${SystemClock.elapsedRealtime() - t0}ms (${LlamaNative.nativeDescribe(handle)}, threads=$nThreads)")
        }

        val job = currentCoroutineContext()[Job]
        val started = SystemClock.elapsedRealtime()
        var deadlineHit = false
        val text = StringBuilder()
        val stats = LongArray(4)
        val status = LlamaNative.nativeGenerate(
            handle,
            IntArray(request.messages.size) { roleOf(request.messages[it].role) },
            Array(request.messages.size) { request.messages[it].content },
            request.maxOutputTokens,
            temperature,
            -1,
            { bytes ->
                val piece = String(bytes, Charsets.UTF_8)
                text.append(piece)
                emit(piece)
                deadlineHit = SystemClock.elapsedRealtime() - started > request.deadlineMs
                job?.isActive != false && request.generationId !in cancelled && !deadlineHit
            },
            stats,
        )
        cancelled -= request.generationId
        val usage = TokenUsage(inputTokens = stats[0].toInt(), outputTokens = stats[1].toInt())
        return when (status) {
            LlamaNative.STATUS_COMPLETED, LlamaNative.STATUS_MAX_TOKENS -> GenerateEvent.Completed(stripThinking(text.toString()), usage)
            LlamaNative.STATUS_CANCELLED ->
                if (deadlineHit) GenerateEvent.Failed(FailureCode.DEADLINE_EXCEEDED, retryable = true) else GenerateEvent.Cancelled
            LlamaNative.STATUS_PROMPT_TOO_LONG -> GenerateEvent.Failed(FailureCode.INTERNAL, retryable = false, detail = "대화가 문맥 한도($nCtx 토큰)를 넘음")
            else -> GenerateEvent.Failed(FailureCode.INTERNAL, retryable = true, detail = "llama.cpp status=$status")
        }
    }

    companion object {
        private const val TAG = "AGORA-llama"

        /** 큰 코어 위주로 쓰고 2개는 화면·시스템에 남긴다. 실측 후 조정(ADR-002). */
        fun defaultThreads(): Int = (Runtime.getRuntime().availableProcessors() - 2).coerceIn(2, 6)

        private fun roleOf(r: PromptRole) = when (r) {
            PromptRole.SYSTEM -> LlamaNative.ROLE_SYSTEM
            PromptRole.USER -> LlamaNative.ROLE_USER
            PromptRole.ASSISTANT -> LlamaNative.ROLE_ASSISTANT
        }

        /** 생각 단계를 껐어도 모델이 <think> 묶음을 내면 답에서 뺀다. */
        internal fun stripThinking(s: String): String {
            val end = s.lastIndexOf("</think>")
            return if (end >= 0) s.substring(end + "</think>".length).trimStart() else s
        }
    }
}
