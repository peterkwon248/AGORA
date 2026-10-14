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
import kotlinx.serialization.json.add
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap

/**
 * **개발 전용** — 개발 PC의 Ollama에 붙는다. PC 시험 도구와 디버그 앱(에뮬레이터→10.0.2.2)에서만 쓴다.
 * 휴대폰 '기기 안 AI'가 아니므로 측정 결과를 실기기 수치로 보고하지 않는다.
 * java.net.http 대신 HttpURLConnection — Android에서도 돈다.
 */
class OllamaProvider(
    private val model: String,
    private val baseUrl: String = "http://127.0.0.1:11434",
    private val temperature: Double = 0.8,
) : InferenceProvider {
    override val id = "ollama-dev:$model"
    private val cancelled = ConcurrentHashMap.newKeySet<String>()

    override fun capabilities() = ProviderCapabilities(ProviderType.LOCAL, streaming = true, supportsCancellation = true, maxContextTokens = 8192, supportedLocales = setOf("ko", "en"))

    override fun generate(request: GenerateRequest): Flow<GenerateEvent> = flow {
        emit(GenerateEvent.Started(request.generationId))
        val body = buildJsonObject {
            put("model", model)
            put("stream", true)
            putJsonObject("options") {
                put("temperature", temperature)
                put("num_predict", request.maxOutputTokens)
            }
            putJsonArray("messages") {
                for (m in request.messages) add(buildJsonObject {
                    put("role", when (m.role) { PromptRole.SYSTEM -> "system"; PromptRole.USER -> "user"; PromptRole.ASSISTANT -> "assistant" })
                    put("content", m.content)
                })
            }
        }
        val conn = try {
            (URL("$baseUrl/api/chat").openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                doOutput = true
                connectTimeout = 5_000
                readTimeout = request.deadlineMs.toInt()
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            }
        } catch (e: Exception) {
            emit(GenerateEvent.Failed(FailureCode.MODEL_NOT_INSTALLED, retryable = true, detail = "Ollama 연결 실패: ${e.message}"))
            return@flow
        }
        try {
            val code = try { conn.responseCode } catch (e: Exception) {
                emit(GenerateEvent.Failed(FailureCode.MODEL_NOT_INSTALLED, retryable = true, detail = "Ollama 연결 실패: ${e.message}"))
                return@flow
            }
            if (code != 200) {
                emit(GenerateEvent.Failed(FailureCode.INTERNAL, retryable = false, detail = "HTTP $code"))
                return@flow
            }
            val buf = StringBuilder()
            conn.inputStream.bufferedReader(Charsets.UTF_8).useLines { lines ->
                for (line in lines) {
                    if (request.generationId in cancelled || !currentCoroutineContext().isActive) { emit(GenerateEvent.Cancelled); return@flow }
                    if (line.isBlank()) continue
                    val o = Json.parseToJsonElement(line).jsonObject
                    val piece = o["message"]?.jsonObject?.get("content")?.jsonPrimitive?.content.orEmpty()
                    if (piece.isNotEmpty()) { buf.append(piece); emit(GenerateEvent.Token(piece)) }
                    if (o["done"]?.jsonPrimitive?.boolean == true) {
                        val usage = runCatching { TokenUsage(o["prompt_eval_count"]!!.jsonPrimitive.int, o["eval_count"]!!.jsonPrimitive.int) }.getOrNull()
                        emit(GenerateEvent.Completed(buf.toString(), usage))
                        return@flow
                    }
                }
            }
            emit(GenerateEvent.Failed(FailureCode.INTERNAL, retryable = true, detail = "stream closed early"))
        } finally {
            conn.disconnect()
        }
    }.flowOn(Dispatchers.IO)

    override suspend fun cancel(generationId: String) { cancelled += generationId }
}
