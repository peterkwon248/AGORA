package app.agora.tools

import app.agora.inference.FailureCode
import app.agora.inference.GenerateEvent
import app.agora.inference.GenerateRequest
import app.agora.inference.InferenceProvider
import app.agora.inference.PromptRole
import app.agora.inference.ProviderCapabilities
import app.agora.inference.ProviderType
import app.agora.inference.TokenUsage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.add
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

/** 이 PC의 Ollama(localhost)에 붙는 개발용 제공자. 휴대폰 앱에는 들어가지 않는다. */
class OllamaProvider(
    private val model: String,
    private val baseUrl: String = "http://127.0.0.1:11434",
    private val temperature: Double = 0.8,
) : InferenceProvider {
    override val id = "ollama-pc:$model"
    private val http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()
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
        val req = HttpRequest.newBuilder(URI("$baseUrl/api/chat"))
            .timeout(Duration.ofMillis(request.deadlineMs))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
            .build()
        val resp = try {
            http.send(req, HttpResponse.BodyHandlers.ofLines())
        } catch (e: Exception) {
            emit(GenerateEvent.Failed(FailureCode.MODEL_NOT_INSTALLED, retryable = true, detail = "Ollama 연결 실패: ${e.message}"))
            return@flow
        }
        if (resp.statusCode() != 200) {
            emit(GenerateEvent.Failed(FailureCode.INTERNAL, retryable = false, detail = "HTTP ${resp.statusCode()}"))
            return@flow
        }
        val buf = StringBuilder()
        for (line in resp.body().iterator()) {
            if (request.generationId in cancelled) { emit(GenerateEvent.Cancelled); return@flow }
            if (line.isBlank()) continue
            val o: JsonObject = Json.parseToJsonElement(line).jsonObject
            val piece = o["message"]?.jsonObject?.get("content")?.jsonPrimitive?.content.orEmpty()
            if (piece.isNotEmpty()) { buf.append(piece); emit(GenerateEvent.Token(piece)) }
            if (o["done"]?.jsonPrimitive?.boolean == true) {
                val usage = runCatching { TokenUsage(o["prompt_eval_count"]!!.jsonPrimitive.int, o["eval_count"]!!.jsonPrimitive.int) }.getOrNull()
                emit(GenerateEvent.Completed(buf.toString(), usage))
                return@flow
            }
        }
        emit(GenerateEvent.Failed(FailureCode.INTERNAL, retryable = true, detail = "stream closed early"))
    }.flowOn(Dispatchers.IO)

    override suspend fun cancel(generationId: String) { cancelled += generationId }
}
