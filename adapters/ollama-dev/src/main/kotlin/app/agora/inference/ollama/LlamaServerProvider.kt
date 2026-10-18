package app.agora.inference.ollama

import app.agora.inference.FailureCode
import app.agora.inference.GenerateEvent
import app.agora.inference.GenerateRequest
import app.agora.inference.InferenceProvider
import app.agora.inference.PromptRole
import app.agora.inference.ProviderCapabilities
import app.agora.inference.ProviderType
import app.agora.inference.TokenUsage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.isActive
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap

/**
 * **개발 전용** — 노트북에서 돌리는 llama.cpp `llama-server --jinja`(OpenAI 호환)에 붙는다.
 * 휴대폰 앱과 같은 llama.cpp 버전·같은 GGUF·같은 샘플링 값을 쓰면 답 내용은 휴대폰과 거의 같다 — **속도는 다르다.**
 * 품질 다듬기를 휴대폰 없이 하려는 도구다. 측정 결과를 실기기 수치로 보고하지 않는다.
 */
class LlamaServerProvider(
    private val label: String,
    private val baseUrl: String = "http://127.0.0.1:8080",
    private val temperature: Double = 0.8,
    private val topK: Int = 40,
    private val topP: Double = 0.95,
    private val minP: Double = 0.05,
) : InferenceProvider {
    override val id = "llama-server:$label"
    private val cancelled = ConcurrentHashMap.newKeySet<String>()

    override fun capabilities() = ProviderCapabilities(ProviderType.LOCAL, streaming = true, supportsCancellation = true, maxContextTokens = 4096, supportedLocales = setOf("ko", "en"))

    override fun generate(request: GenerateRequest): Flow<GenerateEvent> = flow {
        emit(GenerateEvent.Started(request.generationId))
        val body = buildJsonObject {
            put("stream", true)
            put("max_tokens", request.maxOutputTokens)
            put("temperature", temperature)
            put("top_k", topK)
            put("top_p", topP)
            put("min_p", minP)
            putJsonObject("chat_template_kwargs") { put("enable_thinking", false) }
            putJsonObject("stream_options") { put("include_usage", true) }
            putJsonArray("messages") {
                for (m in request.messages) add(buildJsonObject {
                    put("role", when (m.role) { PromptRole.SYSTEM -> "system"; PromptRole.USER -> "user"; PromptRole.ASSISTANT -> "assistant" })
                    put("content", m.content)
                })
            }
        }
        val conn = try {
            (URL("$baseUrl/v1/chat/completions").openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                doOutput = true
                connectTimeout = 5_000
                readTimeout = request.deadlineMs.toInt()
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            }
        } catch (e: Exception) {
            emit(GenerateEvent.Failed(FailureCode.MODEL_NOT_INSTALLED, retryable = true, detail = "llama-server 연결 실패: ${e.message}"))
            return@flow
        }
        try {
            val code = try { conn.responseCode } catch (e: Exception) {
                emit(GenerateEvent.Failed(FailureCode.MODEL_NOT_INSTALLED, retryable = true, detail = "llama-server 연결 실패: ${e.message}"))
                return@flow
            }
            if (code != 200) {
                emit(GenerateEvent.Failed(FailureCode.INTERNAL, retryable = false, detail = "HTTP $code"))
                return@flow
            }
            val buf = StringBuilder()
            var usage: TokenUsage? = null
            var finished = false
            conn.inputStream.bufferedReader(Charsets.UTF_8).useLines { lines ->
                for (line in lines) {
                    if (request.generationId in cancelled || !currentCoroutineContext().isActive) { emit(GenerateEvent.Cancelled); return@flow }
                    if (!line.startsWith("data:")) continue
                    val data = line.removePrefix("data:").trim()
                    if (data == "[DONE]") break
                    val o = Json.parseToJsonElement(data).jsonObject
                    (o["usage"] as? JsonObject)?.let { u ->
                        usage = runCatching { TokenUsage(u["prompt_tokens"]!!.jsonPrimitive.int, u["completion_tokens"]!!.jsonPrimitive.int) }.getOrNull()
                    }
                    val choice = o["choices"]?.jsonArray?.firstOrNull()?.jsonObject ?: continue
                    val piece = (choice["delta"] as? JsonObject)?.get("content")?.jsonPrimitive?.content.orEmpty()
                    if (piece.isNotEmpty() && piece != "null") { buf.append(piece); emit(GenerateEvent.Token(piece)) }
                    if (choice["finish_reason"]?.jsonPrimitive?.content.let { it != null && it != "null" }) finished = true
                }
            }
            if (finished) emit(GenerateEvent.Completed(buf.toString(), usage))
            else emit(GenerateEvent.Failed(FailureCode.INTERNAL, retryable = true, detail = "stream closed early"))
        } finally {
            conn.disconnect()
        }
    }.flowOn(Dispatchers.IO)

    override suspend fun cancel(generationId: String) { cancelled += generationId }
}
