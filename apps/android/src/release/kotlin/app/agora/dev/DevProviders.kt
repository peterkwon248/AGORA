package app.agora.dev

import android.content.Context
import app.agora.inference.InferenceProvider
import app.agora.inference.UnavailableInferenceProvider
import app.agora.philosophers.PhilosopherRegistry

/** 릴리스 빌드: 개발 연결 없음. 휴대폰에 모델이 없으면 '모델 없음'으로 정직하게 실패한다. 평가 도구도 없다. */
object DevProviders {
    const val IS_DEV_BRIDGE = false
    fun create(): InferenceProvider = UnavailableInferenceProvider()

    @Suppress("UNUSED_PARAMETER")
    suspend fun runEval(context: Context, registry: PhilosopherRegistry, provider: InferenceProvider) = Unit
}
