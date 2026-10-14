package app.agora.dev

import app.agora.inference.InferenceProvider
import app.agora.inference.ollama.OllamaProvider

/**
 * 디버그 빌드 전용: 에뮬레이터에서 개발 PC의 Ollama(10.0.2.2)에 붙는다.
 * 화면에 '개발용 PC 연결' 띠가 붙고, 기기 안 AI 측정으로 보고하지 않는다.
 */
object DevProviders {
    const val IS_DEV_BRIDGE = true
    fun create(): InferenceProvider = OllamaProvider(model = "qwen2.5:7b", baseUrl = "http://10.0.2.2:11434")
}
