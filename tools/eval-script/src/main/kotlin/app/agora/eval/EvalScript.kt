package app.agora.eval

import app.agora.orchestration.Autonomy
import app.agora.orchestration.ConversationEngine
import app.agora.orchestration.DebateFrequency
import app.agora.orchestration.DebateIntensity
import app.agora.orchestration.FlowEvent
import app.agora.orchestration.GuardNote
import app.agora.orchestration.IntentSignal
import app.agora.orchestration.Member
import app.agora.orchestration.RoomKind
import app.agora.orchestration.RoomPolicy
import app.agora.orchestration.TranscriptLine
import app.agora.orchestration.TurnInput
import app.agora.philosophers.PhilosopherRegistry

/** 평가 문장(설계서 22.3) 중 두 철학자 방에 맞는 것. 멘션은 자동완성으로 고른 것처럼 ID로 넣는다. */
data class EvalCase(
    val id: String,
    val locale: String,
    val text: String,
    val mentions: List<String> = emptyList(),
    val signals: Set<IntentSignal> = emptySet(),
    val policy: RoomPolicy = RoomPolicy(),
)

/**
 * 시험할 수 없는 문장: 4(복수 멘션 — 카뮈·시오랑 팩 없음), 7(방 간 격리), 8·9·11·12·13(노트·댓글 — Sprint 1 이후).
 * 3번은 이 방에 없는 카뮈 대신 니체 멘션으로 바꿨다.
 */
val EVAL_CASES = listOf(
    EvalCase("01-yoojaeha", "ko", "빗속의 출근길에서 오랜만에 유재하를 만났다. 오랜만에 듣는 그의 목소리가 더 깊고 묵직하다."),
    EvalCase("02-coffee", "ko", "오늘 커피가 유난히 맛있어."),
    EvalCase("03-mention", "ko", "@니체 쇼펜하우어 말에 대해 넌 어떻게 생각해?", mentions = listOf("nietzsche")),
    EvalCase("05-effort", "ko", "노력해도 결과가 없다면 노력은 무의미할까?",
        policy = RoomPolicy(Autonomy.ACTIVE, DebateFrequency.NORMAL, DebateIntensity.BALANCED)),
    EvalCase("06-change", "ko", "잠깐, 그 얘기 말고 오늘 들은 노래 이야기하자.", signals = setOf(IntentSignal.CHANGE_TOPIC)),
    EvalCase("10-en-song", "en", "I heard an old song on my rainy commute, and it felt different this time."),
)

/**
 * 가벼운 일상 말 묶음 — '가벼운 말에도 철학을 꺼내는' 문제(EVAL-CHAT-01) 손질용. 설계서 22.3 2번의 변형.
 * 철학 낱말 세기는 [PHILOSOPHY_WORDS]로 대략 잰다 — 판정은 사람이 읽고 한다.
 */
val LIGHT_CASES = listOf(
    EvalCase("L1-coffee", "ko", "오늘 커피가 유난히 맛있어."),
    EvalCase("L2-weather", "ko", "오늘 날씨 진짜 좋다."),
    EvalCase("L3-lunch", "ko", "점심에 김치찌개 먹었는데 완전 맛있었어."),
    EvalCase("L4-walk", "ko", "퇴근하고 동네 한 바퀴 산책했어."),
    EvalCase("L5-movie", "ko", "주말에 친구랑 영화 봤는데 재밌더라."),
)

/** 가벼운 말에 나오면 '철학화' 신호로 보는 낱말(대략적인 자동 표시 — 최종 판정은 사람) */
val PHILOSOPHY_WORDS = listOf("의지", "고통", "쾌락", "욕망", "본질", "허무", "덧없", "존재", "환상", "현상", "충동", "초월", "체념", "실존", "영원")

/**
 * 평가 문장을 차례로 돌려 마크다운 기록을 만든다. 각 문장은 빈 방에서 시작한다.
 * [clock]은 밀리초(기기마다 다른 시계를 쓰게). 첫 글자까지 시간은 차례 시작('쓰는 중') → 첫 조각.
 * [takeGuardNotes]는 엔진의 `onGuard`가 모은 기록을 꺼내고 비운다 — 문장마다 '검사가 손댄 답'을 함께 적는다.
 */
suspend fun runEval(
    engine: ConversationEngine,
    registry: PhilosopherRegistry,
    title: String,
    note: String,
    clock: () -> Long,
    cases: List<EvalCase> = EVAL_CASES,
    onCaseDone: (String) -> Unit = {},
    takeGuardNotes: () -> List<GuardNote> = { emptyList() },
): String {
    val members = listOf(Member("nietzsche"), Member("schopenhauer"))
    val out = StringBuilder()
    out.appendLine("# $title")
    out.appendLine()
    out.appendLine("> $note")
    out.appendLine()
    val firstTokenMs = mutableListOf<Long>()
    var replies = 0
    var heavy = 0
    val guardTotals = mutableMapOf<String, Int>()
    var regenerated = 0
    // 흘러나오던 글이 저장 순간에 바뀐 답 — 화면에 보인 모습 중 저장된 답의 앞부분이 아니었던 것이 있으면 센다(글자·숫자만 비교).
    var flickered = 0
    val flickerLines = mutableListOf<String>()
    fun norm(t: String) = t.filter { it.isLetterOrDigit() }
    for (c in cases) {
        val name = { id: String? -> if (id == null) (if (c.locale == "en") "User" else "나") else registry.require(id).display.name.get(c.locale) }
        out.appendLine("## ${c.id}")
        out.appendLine()
        out.appendLine("- 방 설정: 이어 말하기 ${c.policy.autonomy}, 논쟁 ${c.policy.debateFrequency}/${c.policy.debateIntensity}")
        out.appendLine()
        out.appendLine("**[${name(null)}]** ${c.text}")
        out.appendLine()
        val started = clock()
        var turnStart = started
        var gotToken = false
        val views = mutableListOf<String>()
        engine.run("eval-room", RoomKind.GROUP, c.locale,
            TurnInput(RoomKind.GROUP, members, mentions = c.mentions, signals = c.signals, policy = c.policy),
            listOf(TranscriptLine(null, c.text)), 1, { 1 },
        ).collect { e ->
            when (e) {
                is FlowEvent.Typing -> { turnStart = clock(); gotToken = false; views.clear() }
                is FlowEvent.Token -> { views += e.text; if (!gotToken) { gotToken = true; firstTokenMs += clock() - turnStart } }
                is FlowEvent.Committed -> {
                    views.firstOrNull { !norm(e.text).startsWith(norm(it)) }?.let {
                        flickered++
                        flickerLines += "${c.id} · ${name(e.speakerId)}: 「$it」 → 「${e.text}」".replace('\n', ' ')
                    }
                    val hits = PHILOSOPHY_WORDS.filter { it in e.text }
                    replies++
                    if (hits.isNotEmpty()) heavy++
                    out.appendLine("**[${name(e.speakerId)}]**${if (e.autonomous) " ↪" else ""} ${e.text}${if (hits.isNotEmpty()) " `철학 낱말: ${hits.joinToString()}`" else ""}\n")
                }
                is FlowEvent.Silent -> {
                    if (views.isNotEmpty()) { flickered++; flickerLines += "${c.id} · ${name(e.speakerId)}: 「${views.last()}」 → (침묵)" }
                    out.appendLine("_(${name(e.speakerId)} 침묵)_\n")
                }
                is FlowEvent.Failed -> out.appendLine("❌ ${name(e.speakerId)} 생성 실패: ${e.event}\n")
                is FlowEvent.Finished -> out.appendLine("_자율 차례 ${e.autonomousTurnsUsed}개 사용 · ${"%.1f".format((clock() - started) / 1e3)}초_\n")
                else -> Unit
            }
        }
        val notes = takeGuardNotes()
        if (notes.isNotEmpty()) {
            out.appendLine("<details><summary>생성 후 검사가 손댄 답 ${notes.size}개</summary>")
            out.appendLine()
            for (n in notes) {
                val kind = n.issue ?: "고침"
                guardTotals[kind] = (guardTotals[kind] ?: 0) + 1
                if (n.regenerated) regenerated++
                out.appendLine("- ${name(n.speakerId)} · ${if (n.attempt == 0) "첫 생성" else "다시 생성"} · $kind${if (n.regenerated) " → 다시 생성" else ""}")
                out.appendLine("  - 전: ${n.before.replace("\n", " ")}")
                out.appendLine("  - 뒤: ${n.after.ifEmpty { "(남은 것 없음)" }.replace("\n", " ")}")
            }
            out.appendLine()
            out.appendLine("</details>")
            out.appendLine()
        }
        onCaseDone(c.id)
    }
    out.appendLine("---")
    out.appendLine()
    out.appendLine("철학 낱말이 든 답: ${replies}개 중 ${heavy}개")
    out.appendLine()
    val guardTotal = guardTotals.values.sum()
    out.appendLine("흘러나오던 글이 저장 순간에 바뀐 답: ${replies}개(+침묵) 중 ${flickered}개")
    for (l in flickerLines) out.appendLine("- $l")
    out.appendLine()
    out.appendLine("생성 후 검사가 손댄 답: ${guardTotal}개${if (guardTotal > 0) " (" + guardTotals.entries.joinToString { "${it.key} ${it.value}" } + ")" else ""} · 그 때문에 다시 생성: ${regenerated}번")
    out.appendLine()
    if (firstTokenMs.isNotEmpty()) {
        val sorted = firstTokenMs.sorted()
        out.appendLine("첫 글자까지(차례 ${sorted.size}번): 가운데값 ${"%.1f".format(sorted[sorted.size / 2] / 1e3)}초 · 가장 느림 ${"%.1f".format(sorted.last() / 1e3)}초")
    }
    return out.toString()
}
