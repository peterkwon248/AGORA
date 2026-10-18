package app.agora.orchestration

import app.agora.philosophers.PhilosopherRegistry

/**
 * 사용자 메시지의 대략적인 화제. 시안 03_engine.js `detectIntent`의 키워드 분류를 그대로 옮겼다.
 * 근거: docs/sprint0/02_prototype_behavior_spec.md 1장 — 실제 앱에서는 **보조 신호**다.
 *
 * - 여기서 나온 화제는 발언자 순위(관련도)에만 쓴다.
 * - 완화·비공개·인사처럼 *동작을 바꾸는* 의도를 확정하는 데는 쓰지 않는다
 *   (그건 규칙 + 모델 이중 확인, [IntentSignal]로 호출자가 넘긴다).
 */
enum class Topic(val key: String) {
    SOFTEN("soften"), PRIVATE("private"), MUSIC("music"), MEANING("meaning"), WORK("work"),
    DAILY("daily"), GREET("greet"), THANKS("thanks"), CHANGE("change"), OPEN("open"),
}

object TopicDetector {
    private val CHANGE = Regex("(다른\\s*(얘기|이야기)|그\\s*얘기\\s*말고|화제\\s*바꾸|change (the )?(topic|subject)|something else|talk about something)")

    /** 시안과 같은 순서로 검사한다 — 먼저 맞는 화제가 이긴다. */
    private val RULES = listOf(
        Topic.SOFTEN to Regex("(싸우지|그만\\s*싸|부드럽게|살살|진정|gentler|calm down|stop arguing|less harsh|too harsh)"),
        Topic.PRIVATE to Regex("(비공개|다른\\s*방에선|말하지\\s*마|비밀|private|don.t tell|keep (this|it) (here|between))"),
        Topic.MUSIC to Regex("(노래|음악|들었|플레이리스트|가수|앨범|song|music|listen|playlist|album|singer)"),
        Topic.MEANING to Regex("(의미|노력|행복|허무|무의미|결과|가치|meaning|effort|happy|happiness|pointless|purpose|worth it|results?\\b)"),
        Topic.WORK to Regex("(피곤|지쳐|지친|출근|퇴근|회사|야근|업무|일이\\s|tired|exhausted|work|job|office|boss|deadline)"),
        Topic.DAILY to Regex("(커피|날씨|비가|비\\s*와|맑|점심|저녁|산책|하늘|coffee|weather|rain|sunny|lunch|dinner|walk|sky)"),
        Topic.GREET to Regex("^(안녕|하이|반가|좋은\\s*아침|hi\\b|hello|hey|good morning)"),
        Topic.THANKS to Regex("(고마워|고맙|감사|thanks|thank you)"),
    )

    fun detect(text: String): Topic {
        val s = text.lowercase()
        val topic = RULES.firstOrNull { (_, re) -> re.containsMatchIn(s) }?.first ?: Topic.OPEN
        return if (topic == Topic.OPEN && CHANGE.containsMatchIn(s)) Topic.CHANGE else topic
    }
}

/**
 * 화제 → 멤버별 관련도. 값은 각 팩의 `persona.topic_affinity`에서만 읽는다(철학자별 분기 없음).
 * 그 화제 값이 없으면 `open` 값, 그것도 없으면 0 — 동점이면 [SpeakerSelector]가 멤버 순서로 고른다.
 */
fun relevanceFor(topic: Topic, memberIds: List<String>, registry: PhilosopherRegistry): Map<String, Double> =
    memberIds.associateWith { id ->
        val affinity = registry.get(id)?.persona?.topicAffinity.orEmpty()
        affinity[topic.key] ?: affinity[Topic.OPEN.key] ?: 0.0
    }

/**
 * 가벼운 일상 말인가 — **말투(결)를 맞추는 데만** 쓴다([PromptComposer]의 가벼운 말 지시). 발언 순서·완화·비공개 같은
 * 동작은 바꾸지 않는다. 틀려도 답이 조금 가벼워지거나 그대로일 뿐이다.
 * [TopicDetector]의 시안 정규식과 따로 둔다 — 시안 화제 분류(순위용)를 건드리지 않으려고.
 * - 노래·비는 넣지 않는다: '빗속에서 들은 노래'는 깊게 받아야 하는 평가 문장(설계서 22.3-1·10)이다.
 * - 의미·노력·허무 같은 말이 같이 있으면 가볍지 않다고 본다.
 */
object LightTalk {
    private val LIGHT = Regex("(커피|카페|날씨|맑|점심|저녁|아침|밥|먹었|맛있|맛집|산책|하늘|영화|드라마|주말|낮잠|운동|쇼핑|coffee|cafe|weather|sunny|lunch|dinner|breakfast|ate\b|tasty|delicious|a walk|movie|film|weekend|nap|workout|shopping)")
    private val HEAVY = Regex("(의미|노력|허무|무의미|가치|행복|죽음|외로|슬프|우울|불안|meaning|effort|pointless|purpose|worth|death|lonely|sad|depress|anxious)")

    fun isLight(text: String): Boolean {
        val s = text.lowercase()
        return LIGHT.containsMatchIn(s) && !HEAVY.containsMatchIn(s)
    }
}
