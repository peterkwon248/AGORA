package app.agora.tools

import app.agora.eval.EVAL_CASES
import app.agora.eval.LIGHT_CASES
import app.agora.eval.runEval
import app.agora.inference.InferenceProvider
import app.agora.inference.ollama.LlamaServerProvider
import app.agora.inference.ollama.OllamaProvider
import app.agora.orchestration.ConversationEngine
import app.agora.orchestration.GuardNote
import app.agora.philosophers.PhilosopherRegistry
import kotlinx.coroutines.runBlocking
import java.io.File
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * 사용법
 * - `run` (인자 없음 또는 Ollama 모델 이름): 이 PC의 Ollama
 * - `run --args="llama-server <이름표> [주소]"`: 노트북의 llama.cpp llama-server(휴대폰과 같은 GGUF로 품질만 본다). 끝에 `light`를 붙이면 가벼운 말 묶음만
 */
fun main(args: Array<String>) = runBlocking {
    val (provider: InferenceProvider, label: String, note: String) = if (args.firstOrNull() == "llama-server") {
        val name = args.getOrElse(1) { "model" }
        Triple(
            LlamaServerProvider(name, args.getOrNull(2)?.takeIf { it.startsWith("http") } ?: "http://127.0.0.1:8080"), name,
            "**이 기기(노트북, llama.cpp llama-server)에서 돌린 결과다. 휴대폰과 같은 모델 파일·같은 llama.cpp 버전이지만 속도는 휴대폰 수치가 아니다.** 품질 다듬기용.",
        )
    } else {
        val model = args.firstOrNull() ?: "qwen2.5:7b"
        Triple(OllamaProvider(model), model, "**이 기기(PC, Ollama)에서 돌린 결과다. 휴대폰 실기기 측정이 아니다.** 프롬프트·조율 규칙 점검용.")
    }
    val packs = File("resources/philosophers").listFiles()!!.map { File(it, "pack.yaml") }.filter { it.exists() }.map { it.path to it.readText() }
    val registry = PhilosopherRegistry.load(packs)
    check(registry.rejected.isEmpty()) { "팩 오류: ${registry.rejected}" }
    val stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
    val guardNotes = mutableListOf<GuardNote>()
    val text = runEval(
        ConversationEngine(registry, provider, onGuard = { guardNotes += it }), registry,
        title = "PC 시험 대화 — $label ($stamp)",
        note = note,
        clock = { System.nanoTime() / 1_000_000 },
        cases = if (args.lastOrNull() == "light") LIGHT_CASES else EVAL_CASES,
        onCaseDone = { print(".") },
        takeGuardNotes = { guardNotes.toList().also { guardNotes.clear() } },
    )
    val dir = File("qa/pc-runs").apply { mkdirs() }
    val file = File(dir, "${LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm"))}-${label.replace(Regex("[^A-Za-z0-9.]"), "_")}.md")
    file.writeText(text)
    println("\n저장: ${file.path}")
}
