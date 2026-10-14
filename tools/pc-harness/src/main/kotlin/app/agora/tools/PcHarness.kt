package app.agora.tools

import app.agora.orchestration.Autonomy
import app.agora.orchestration.ConversationEngine
import app.agora.orchestration.DebateFrequency
import app.agora.orchestration.DebateIntensity
import app.agora.orchestration.FlowEvent
import app.agora.orchestration.IntentSignal
import app.agora.orchestration.Member
import app.agora.orchestration.RoomKind
import app.agora.orchestration.RoomPolicy
import app.agora.orchestration.TranscriptLine
import app.agora.orchestration.TurnInput
import app.agora.philosophers.PhilosopherRegistry
import kotlinx.coroutines.runBlocking
import java.io.File
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/** 평가 문장(설계서 22.3) 중 두 철학자 방에 맞는 것. 멘션은 자동완성으로 고른 것처럼 ID로 넣는다. */
private data class Case(
    val id: String,
    val locale: String,
    val text: String,
    val mentions: List<String> = emptyList(),
    val signals: Set<IntentSignal> = emptySet(),
    val policy: RoomPolicy = RoomPolicy(),
)

private val CASES = listOf(
    Case("01-yoojaeha", "ko", "빗속의 출근길에서 오랜만에 유재하를 만났다. 오랜만에 듣는 그의 목소리가 더 깊고 묵직하다."),
    Case("02-coffee", "ko", "오늘 커피가 유난히 맛있어."),
    Case("03-mention", "ko", "@니체 쇼펜하우어 말에 대해 넌 어떻게 생각해?", mentions = listOf("nietzsche")),
    Case("05-effort", "ko", "노력해도 결과가 없다면 노력은 무의미할까?",
        policy = RoomPolicy(Autonomy.ACTIVE, DebateFrequency.NORMAL, DebateIntensity.BALANCED)),
    Case("06-change", "ko", "잠깐, 그 얘기 말고 오늘 들은 노래 이야기하자.", signals = setOf(IntentSignal.CHANGE_TOPIC)),
    Case("10-en-song", "en", "I heard an old song on my rainy commute, and it felt different this time."),
)

fun main(args: Array<String>) = runBlocking {
    val model = args.firstOrNull() ?: "qwen2.5:7b"
    val packs = File("resources/philosophers").listFiles()!!.map { File(it, "pack.yaml") }.filter { it.exists() }.map { it.path to it.readText() }
    val registry = PhilosopherRegistry.load(packs)
    check(registry.rejected.isEmpty()) { "팩 오류: ${registry.rejected}" }
    val engine = ConversationEngine(registry, OllamaProvider(model))
    val members = listOf(Member("nietzsche"), Member("schopenhauer"))

    val out = StringBuilder()
    val stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
    out.appendLine("# PC 시험 대화 — $model ($stamp)")
    out.appendLine()
    out.appendLine("> **이 기기(PC, Ollama)에서 돌린 결과다. 휴대폰 실기기 측정이 아니다.** 프롬프트·조율 규칙 점검용.")
    out.appendLine()

    for (c in CASES) {
        val name = { id: String? -> if (id == null) (if (c.locale == "en") "User" else "나") else registry.require(id).display.name.get(c.locale) }
        out.appendLine("## ${c.id}")
        out.appendLine()
        out.appendLine("- 방 설정: 이어 말하기 ${c.policy.autonomy}, 논쟁 ${c.policy.debateFrequency}/${c.policy.debateIntensity}")
        out.appendLine()
        out.appendLine("**[${name(null)}]** ${c.text}")
        out.appendLine()
        val started = System.nanoTime()
        engine.run("pc-room", RoomKind.GROUP, c.locale,
            TurnInput(RoomKind.GROUP, members, mentions = c.mentions, signals = c.signals, policy = c.policy),
            listOf(TranscriptLine(null, c.text)), 1, { 1 },
        ).collect { e ->
            when (e) {
                is FlowEvent.Committed -> out.appendLine("**[${name(e.speakerId)}]**${if (e.autonomous) " ↪" else ""} ${e.text}\n")
                is FlowEvent.Silent -> out.appendLine("_(${name(e.speakerId)} 침묵)_\n")
                is FlowEvent.Failed -> out.appendLine("❌ ${name(e.speakerId)} 생성 실패: ${e.event}\n")
                is FlowEvent.Finished -> out.appendLine("_자율 차례 ${e.autonomousTurnsUsed}개 사용 · ${"%.1f".format((System.nanoTime() - started) / 1e9)}초_\n")
                else -> Unit
            }
        }
        print(".")
    }
    val dir = File("qa/pc-runs").apply { mkdirs() }
    val file = File(dir, "${LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm"))}-${model.replace(Regex("[^A-Za-z0-9.]"), "_")}.md")
    file.writeText(out.toString())
    println("\n저장: ${file.path}")
}
