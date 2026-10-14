package app.agora.chat

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import app.agora.inference.FailureCode
import app.agora.inference.GenerateEvent
import app.agora.inference.InferenceProvider
import app.agora.dev.DevProviders
import app.agora.orchestration.ConversationEngine
import app.agora.orchestration.FlowEvent
import app.agora.orchestration.Member
import app.agora.orchestration.RoomKind
import app.agora.orchestration.RoomPolicy
import app.agora.orchestration.TranscriptLine
import app.agora.orchestration.TurnInput
import app.agora.philosophers.PhilosopherRegistry
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID

sealed interface UiMessage {
    val id: String
    data class User(override val id: String, val text: String) : UiMessage
    data class Philosopher(override val id: String, val speakerId: String, val text: String, val respondTo: String?) : UiMessage
    /** 시스템 줄. 문장은 화면에서 만든다(언어 전환 시 자연스럽게 바뀌도록 — 02 명세 3장) */
    data class System(override val id: String, val kind: SystemKind, val speakerId: String? = null) : UiMessage
}

enum class SystemKind { MODEL_MISSING, GENERATION_FAILED, INTERRUPTED }

/** 생성 중인 답 — 화면에만 있고 저장하지 않는다. 완성되면 [UiMessage.Philosopher]로 바뀐다. */
data class Streaming(val speakerId: String, val text: String)

data class RoomState(
    val members: List<String>,
    val messages: List<UiMessage> = emptyList(),
    val typing: String? = null,
    val streaming: Streaming? = null,
)

/**
 * Sprint 0 시제품용 방 하나. 영구 저장·여러 방은 Sprint 1.
 * 모델 어댑터가 붙기 전에는 [UnavailableInferenceProvider] — 데모 문장으로 대신 답하지 않는다.
 */
class RoomViewModel(app: Application) : AndroidViewModel(app) {
    val registry: PhilosopherRegistry = PhilosopherRegistry.load(
        app.assets.list("philosophers").orEmpty().mapNotNull { id ->
            runCatching { "philosophers/$id/pack.yaml" to app.assets.open("philosophers/$id/pack.yaml").bufferedReader().readText() }.getOrNull()
        },
    )

    // 디버그: 개발 PC 연결 / 릴리스: 모델 없음으로 정직하게 실패 (기기 안 AI 어댑터는 다음 단계)
    var provider: InferenceProvider = DevProviders.create()
    val devBridge: Boolean = DevProviders.IS_DEV_BRIDGE

    private val members = listOf(Member("nietzsche"), Member("schopenhauer"))
    private val _state = MutableStateFlow(RoomState(members.map { it.philosopherId }))
    val state: StateFlow<RoomState> = _state

    private var revision = 0L
    private var job: Job? = null

    fun send(text: String, locale: String) {
        val t = text.trim()
        if (t.isEmpty()) return
        revision++
        val rev = revision
        val interrupted = job?.isActive == true
        job?.cancel()
        _state.update {
            it.copy(
                messages = it.messages +
                    listOfNotNull(if (interrupted) UiMessage.System(newId(), SystemKind.INTERRUPTED) else null) +
                    UiMessage.User(newId(), t),
                typing = null,
                // 부분 문장은 완성 발언으로 저장하지 않는다(02 명세 4장 8). 시안의 '멈춘 답'(ag-stopped) 표시는 아직 — 지금은 지운다.
                streaming = null,
            )
        }
        val transcript = _state.value.messages.mapNotNull {
            when (it) {
                is UiMessage.User -> TranscriptLine(null, it.text)
                is UiMessage.Philosopher -> TranscriptLine(it.speakerId, it.text)
                is UiMessage.System -> null
            }
        }.takeLast(20)
        val engine = ConversationEngine(registry, provider)
        job = viewModelScope.launch {
            engine.run("sprint0-room", RoomKind.GROUP, locale,
                TurnInput(RoomKind.GROUP, members, policy = RoomPolicy()),
                transcript, rev, { revision },
            ).collect { e -> onEvent(e) }
            _state.update { it.copy(typing = null, streaming = null) }
        }
    }

    private fun onEvent(e: FlowEvent) {
        when (e) {
            is FlowEvent.Typing -> _state.update { it.copy(typing = e.speakerId, streaming = null) }
            // 첫 글자가 오면 '쓰는 중' 점 대신 실제로 써지는 말풍선을 보여 준다
            is FlowEvent.Token -> _state.update { it.copy(typing = null, streaming = Streaming(e.speakerId, e.text)) }
            is FlowEvent.Committed -> _state.update {
                it.copy(messages = it.messages + UiMessage.Philosopher(e.generationId, e.speakerId, e.text, e.respondTo), typing = null, streaming = null)
            }
            is FlowEvent.Silent -> _state.update { it.copy(typing = null, streaming = null) }
            is FlowEvent.Failed -> _state.update {
                android.util.Log.w("AGORA", "generation failed speaker=${e.speakerId} event=${e.event}")
                val code = (e.event as? GenerateEvent.Failed)?.code
                val kind = if (code == FailureCode.MODEL_NOT_INSTALLED) SystemKind.MODEL_MISSING else SystemKind.GENERATION_FAILED
                it.copy(messages = it.messages + UiMessage.System(newId(), kind, e.speakerId), typing = null, streaming = null)
            }
            is FlowEvent.Superseded -> _state.update { it.copy(typing = null, streaming = null) }
            else -> Unit
        }
    }

    private fun newId() = UUID.randomUUID().toString()
}
