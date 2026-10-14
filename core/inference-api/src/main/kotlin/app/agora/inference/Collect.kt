package app.agora.inference

import kotlinx.coroutines.flow.Flow

/** 생성 흐름의 최종 결과. 부분 생성문은 [text]가 null이어야 저장 단계에서 완성 발언으로 오인하지 않는다(설계서 7.3). */
data class GenerationOutcome(
    val text: String?,
    val terminal: GenerateEvent,
    val streamedText: String,
)

/**
 * 흐름을 끝까지 모아 결과 하나로 만든다.
 * - Completed일 때만 [GenerationOutcome.text]가 채워진다.
 * - Cancelled/Failed면 스트리밍된 조각이 있어도 text는 null.
 * - 끝 이벤트 없이 흐름이 닫히면 INTERNAL 실패로 본다(조용한 실패 금지).
 */
suspend fun Flow<GenerateEvent>.collectOutcome(onToken: (String) -> Unit = {}): GenerationOutcome {
    val buf = StringBuilder()
    var terminal: GenerateEvent? = null
    collect { e ->
        when (e) {
            is GenerateEvent.Started -> Unit
            is GenerateEvent.Token -> { buf.append(e.text); onToken(e.text) }
            is GenerateEvent.Completed, GenerateEvent.Cancelled, is GenerateEvent.Failed -> terminal = e
        }
    }
    val end = terminal ?: GenerateEvent.Failed(FailureCode.INTERNAL, retryable = true, detail = "stream ended without terminal event")
    val text = (end as? GenerateEvent.Completed)?.text
    return GenerationOutcome(text = text, terminal = end, streamedText = buf.toString())
}
