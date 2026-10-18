package app.agora.dev

import android.content.Context
import android.os.SystemClock
import android.util.Log
import app.agora.eval.runEval
import app.agora.inference.InferenceProvider
import app.agora.inference.ollama.OllamaProvider
import app.agora.orchestration.ConversationEngine
import app.agora.philosophers.PhilosopherRegistry
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 디버그 빌드 전용:
 * - 휴대폰에 모델이 없으면 에뮬레이터에서 개발 PC의 Ollama(10.0.2.2)에 붙는다. 화면에 '개발용 PC 연결' 띠가 붙는다.
 * - [runEval]: 평가 문장을 기기에서 돌려 `files/eval/`에 기록한다(adb `--ez dev_eval true`).
 */
object DevProviders {
    const val IS_DEV_BRIDGE = true
    fun create(): InferenceProvider = OllamaProvider(model = "qwen2.5:7b", baseUrl = "http://10.0.2.2:11434")

    suspend fun runEval(context: Context, registry: PhilosopherRegistry, provider: InferenceProvider) {
        val stamp = SimpleDateFormat("yyyyMMdd-HHmm", Locale.ROOT).format(Date())
        val model = provider.id.substringAfter(':').removeSuffix(".gguf")
        Log.i("AGORA-eval", "start $model")
        val text = runEval(
            ConversationEngine(registry, provider), registry,
            title = "실기기 평가 대화 — $model (${android.os.Build.MODEL}, $stamp)",
            note = "**이 기기(${android.os.Build.MODEL})의 기기 안 AI로 돌린 결과다.** provider=${provider.id}",
            clock = { SystemClock.elapsedRealtime() },
            onCaseDone = { Log.i("AGORA-eval", "case done $it") },
        )
        val file = File(File(context.filesDir, "eval").apply { mkdirs() }, "$stamp-$model.md")
        file.writeText(text)
        Log.i("AGORA-eval", "saved ${file.absolutePath}")
    }
}
