package app.agora.dev

import app.agora.inference.InferenceProvider
import app.agora.inference.UnavailableInferenceProvider

/** 릴리스 빌드: 개발 연결 없음. 기기 안 AI 어댑터가 붙기 전에는 '모델 없음'으로 정직하게 실패한다. */
object DevProviders {
    const val IS_DEV_BRIDGE = false
    fun create(): InferenceProvider = UnavailableInferenceProvider()
}
