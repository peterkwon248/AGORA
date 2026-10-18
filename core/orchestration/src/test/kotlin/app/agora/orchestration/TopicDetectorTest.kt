package app.agora.orchestration

import app.agora.philosophers.PhilosopherRegistry
import app.agora.philosophers.TOPIC_KEYS
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TopicDetectorTest {
    private val registry = PhilosopherRegistry.load(
        File(System.getProperty("agora.packsDir")).listFiles()!!.map { File(it, "pack.yaml") }.filter { it.exists() }.map { it.path to it.readText() },
    )

    @Test
    fun `화제 키는 팩 검증기의 화제 목록과 같다`() {
        assertEquals(TOPIC_KEYS, Topic.entries.map { it.key }.toSet())
    }

    @Test
    fun `시안 detectIntent와 같은 화제를 고른다`() {
        // PC 시험 문장(qa/pc-runs)과 시안 규칙의 순서(완화 > 비공개 > 음악 > 의미 > 일 > 일상 > 인사 > 감사)
        val cases = mapOf(
            "빗속의 출근길에서 오랜만에 유재하를 만났다. 오랜만에 듣는 그의 목소리가 더 깊고 묵직하다." to Topic.WORK,
            "오늘 커피가 유난히 맛있어." to Topic.DAILY,
            "노력해도 결과가 없다면 노력은 무의미할까?" to Topic.MEANING,
            "잠깐, 그 얘기 말고 오늘 들은 노래 이야기하자." to Topic.MUSIC,
            "I heard an old song on my rainy commute, and it felt different this time." to Topic.MUSIC,
            "안녕!" to Topic.GREET,
            "고마워요" to Topic.THANKS,
            "이건 비밀인데" to Topic.PRIVATE,
            "둘 다 좀 부드럽게 말해 줘" to Topic.SOFTEN,
            "다른 얘기 하자" to Topic.CHANGE,
            "음..." to Topic.OPEN,
        )
        for ((text, want) in cases) assertEquals(want, TopicDetector.detect(text), text)
    }

    @Test
    fun `관련도는 팩의 topic_affinity에서만 온다`() {
        val two = listOf("nietzsche", "schopenhauer")
        val daily = relevanceFor(Topic.DAILY, two, registry)
        assertTrue(daily.getValue("schopenhauer") > daily.getValue("nietzsche"), "시안 REL.daily: 쇼펜하우어가 니체보다 앞")
        val work = relevanceFor(Topic.WORK, two, registry)
        assertTrue(work.getValue("nietzsche") > work.getValue("schopenhauer"), "시안 REL.work: 니체가 쇼펜하우어보다 앞")
        assertEquals(0.0, relevanceFor(Topic.MUSIC, listOf("unknown_id"), registry).getValue("unknown_id"))
    }
}

class LightTalkTest {
    @Test
    fun `일상 말은 가볍다`() {
        listOf("오늘 커피가 유난히 맛있어.", "오늘 날씨 진짜 좋다.", "점심에 김치찌개 먹었는데 완전 맛있었어.",
            "퇴근하고 동네 한 바퀴 산책했어.", "주말에 친구랑 영화 봤는데 재밌더라.", "The coffee was great today.")
            .forEach { assertTrue(LightTalk.isLight(it), it) }
    }

    @Test
    fun `깊게 받아야 할 평가 문장은 가볍지 않다`() {
        listOf("빗속의 출근길에서 오랜만에 유재하를 만났다. 오랜만에 듣는 그의 목소리가 더 깊고 묵직하다.",
            "노력해도 결과가 없다면 노력은 무의미할까?", "@니체 쇼펜하우어 말에 대해 넌 어떻게 생각해?",
            "I heard an old song on my rainy commute, and it felt different this time.",
            "밥 먹다가 갑자기 사는 게 무의미하게 느껴졌어.")
            .forEach { assertFalse(LightTalk.isLight(it), it) }
    }
}
