package app.agora.orchestration

import app.agora.philosophers.KoRegister

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

/** 문장은 모두 PC 시험(qwen2.5:7b)에서 실제로 나온 답이다 — qa/pc-runs/20261014-1835·20261015-1152·1158. */
class ReplyGuardTest {
    private val schoKo = listOf(
        "좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.",
        "음악은 듣는 동안만큼은 바라는 것을 잊게 해 주지요. 그 노래를 듣는 동안 무엇이 조용해졌습니까?",
    )
    private val nieEn = listOf("The song didn't change. You did. In which direction?")

    @Test
    fun `한국어 답에서 중국어가 시작되면 그 앞 완결 문장까지만 남긴다`() {
        val g = guardReply("니체의 질문이 참 깊네요. 주관적 경험은 감정과 기대를, 관조적 시각은 거리를 두고 바라보는 것처럼요. 이 두者的视角，您似乎是在提出", "ko", schoKo)
        assertEquals("니체의 질문이 참 깊네요. 주관적 경험은 감정과 기대를, 관조적 시각은 거리를 두고 바라보는 것처럼요.", g.text)
        assertNull(g.issue, "완결 문장이 남으면 다시 생성할 필요 없다")
    }

    @Test
    fun `첫 문장부터 중국어로 무너지면 남는 게 없어 다시 생성한다`() {
        val g = guardReply("감정의 만족과理智的满足与理智的洞察在平衡生活中确实扮演着重要角色.", "ko", schoKo)
        assertEquals("", g.text)
        assertEquals(GuardIssue.CONTAMINATED, g.issue)
    }

    @Test
    fun `남의 이름표가 나오면 그 앞에서 자른다`() {
        val raw = "결과 없이 고통만 남기지 않는다면, 그 고통 또한 자신에게 무언가를 가르쳐줄 거요. 고통 속에서\n[尼采] 每一次痛苦\n[ SHOPHACHAWE ] 你说得对"
        assertEquals("결과 없이 고통만 남기지 않는다면, 그 고통 또한 자신에게 무언가를 가르쳐줄 거요.", guardReply(raw, "ko", emptyList()).text)
        assertEquals("좋소.", guardReply("좋소.\n쇼펜하우어: 나는 반대요.", "ko", emptyList()).text)
        assertEquals("좋소.", guardReply("좋소. [쇼펜하우어] 나는 반대요.", "ko", emptyList()).text)
    }

    @Test
    fun `한국어 답에 낀 영어 구절은 자르고 낱말 하나는 둔다`() {
        assertEquals("그 노래의 선율이 마음을 끌게 하는 것 같아요.",
            guardReply("그 노래의 선율이 마음을 끌게 하는 것 같아요. 선율은often speaks to us more than lyrics do.", "ko", emptyList()).text)
        val ok = "Yesterday라는 노래였군요. AI가 골라 준 노래요?"
        assertEquals(ok, guardReply(ok, "ko", emptyList()).text)
        assertNull(guardReply(ok, "ko", emptyList()).issue)
    }

    @Test
    fun `영어 답에 한글이 섞이면 자른다`() {
        assertEquals("That is resignation.", guardReply("That is resignation. 나는 그 고통이", "en", emptyList()).text)
    }

    @Test
    fun `깨진 글자가 든 문장은 빼고 남는 게 없으면 다시 생성한다`() {
        val broken = "showc�포하우어의 견해가 당신에게 어떤 영향을 미쳤는지 궁금하오."
        val g = guardReply(broken, "ko", emptyList())
        assertEquals("", g.text)
        assertEquals(GuardIssue.BROKEN_TEXT, g.issue)
        assertEquals("어느 쪽이오?", guardReply("$broken 어느 쪽이오?", "ko", emptyList()).text)
    }

    @Test
    fun `예시를 그대로 베낀 문장은 빼고 어느 예시인지 알려 준다`() {
        val g = guardReply("좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.", "ko", schoKo)
        assertEquals("", g.text)
        assertEquals(GuardIssue.COPIED_EXAMPLE, g.issue)
        assertEquals(listOf(schoKo[0]), g.copied)
        assertEquals("좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.", g.withCopies)

        val part = guardReply("그 노래를 듣는 동안 무엇이 조용해졌습니까? 저는 빗소리가 먼저 떠오릅니다.", "ko", schoKo)
        assertEquals("저는 빗소리가 먼저 떠오릅니다.", part.text)
        assertEquals(listOf(schoKo[1]), part.copied)

        assertEquals("", guardReply("The song didn't change. You did. In which direction?", "en", nieEn).text)
    }

    @Test
    fun `짧은 맞장구나 예시와 다른 문장은 베끼기가 아니다`() {
        for (s in listOf("그렇소.", "커피가 좋으면 그만이오.", "좋은 커피는 흔하지 않소. 오늘 운이 따랐구려.")) {
            val g = guardReply(s, "ko", schoKo)
            assertEquals(s, g.text, s)
            assertNull(g.issue, s)
        }
    }

    @Test
    fun `스트리밍 화면은 오염이 시작되기 전까지만 보여 준다`() {
        assertEquals("좋아요, 오늘 들으신 노래가 무엇이었는지 궁금합니다. 선율이나 가사",
            displayablePartial("좋아요, 오늘 들으신 노래가 무엇이었는지 궁금합니다. 선율이나 가사中有几处错误", "ko"))
        assertTrue(displayablePartial("고통 속에서我们也继续对话", "ko")!!.none { it.code in 0x4E00..0x9FFF })
    }

    @Test
    fun `자기 이름을 3인칭으로 쓴 문장은 뺀다`() {
        val names = listOf("니체", "Nietzsche")
        val raw = "노력 자체가 값지다고 보오. 니체는 이런 질문에 종종 다르게 답변했을지도 모르겠소."
        assertEquals("노력 자체가 값지다고 보오.", guardReply(raw, "ko", emptyList(), names).text)
        val only = guardReply("니체의 말이 인상적이네요.", "ko", emptyList(), names)
        assertEquals("", only.text)
        assertEquals(GuardIssue.SELF_THIRD_PERSON, only.issue)
        assertEquals("Perhaps.", guardReply("Perhaps. Nietzsche would say otherwise.", "en", emptyList(), names).text)
        // 남의 이름은 그대로 — 니체가 쇼펜하우어를 말하는 건 정상
        val other = "쇼펜하우어의 비관은 너무 이르오."
        assertEquals(other, guardReply(other, "ko", emptyList(), names).text)
    }

    @Test
    fun `문장 첫머리의 말씀대로 맞장구는 떼고 내용은 둔다`() {
        assertEquals("행복은 과정과 결과 모두에서 발견될 수 있을 것 같습니다. 그렇다면 무엇이 남을까요?",
            guardReply("니체님 말씀대로, 행복은 과정과 결과 모두에서 발견될 수 있을 것 같습니다. 그렇다면 무엇이 남을까요?", "ko", emptyList()).text)
        assertEquals("노력 자체는 가치가 있지요.", guardReply("그렇습니다, 니체의 말씀대로 노력 자체는 가치가 있지요.", "ko", emptyList()).text)
        assertEquals("Effort has its own worth.", guardReply("As Nietzsche said, effort has its own worth.", "en", emptyList()).text)
        val keep = "말씀대로 하겠소."
        assertEquals(keep, guardReply(keep, "ko", emptyList()).text, "맞장구 뒤에 내용이 없으면 건드리지 않는다")
    }

    @Test
    fun `멘션 표시와 사용자라는 말은 사람 말로 고친다`() {
        assertEquals("니체 선생님 생각이 흥미롭습니다.", guardReply("@니체 니체 선생님 생각이 흥미롭습니다.", "ko", emptyList()).text)
        assertEquals("오늘의 노래가 당신에게 어떤 의미를 가지는지 궁금합니다. 당신이 고른 노래인가요?",
            guardReply("오늘의 노래가 사용자에게 어떤 의미를 가지는지 궁금합니다. 사용자가 고른 노래인가요?", "ko", emptyList()).text)
        assertEquals("What did you hear in your song?", guardReply("What did the user hear in the user's song?", "en", emptyList()).text)
    }

    // 아래는 노트북 Gemma 4 E2B(기기 안 모델) 기록 qa/pc-runs/20261020-0616~0621에서 나온 답이다.

    @Test
    fun `앞사람 문장을 거의 그대로 되풀이한 답은 남기지 않고 다시 생성한다`() {
        val before = "날씨가 좋으니 잠시라도 그 기분을 음미하는 것도 나쁘지 않은 일이지요."
        val g = guardReply("날씨가 좋으니 잠시라도 그 기분을 음미하는 것도 나쁘지 않지.", "ko", emptyList(), recent = listOf("오늘 날씨 진짜 좋다.", before))
        assertEquals("", g.text)
        assertEquals(GuardIssue.ECHOED_PREVIOUS, g.issue)
    }

    @Test
    fun `앞말을 짧게 받아 짚는 것은 되풀이가 아니다`() {
        val reply = "그 고통을 잠시 잊는 도피처라... 나는 그 도피를 통해 오히려 삶의 강한 의지를 확인하는 것이라 보오."
        val g = guardReply(reply, "ko", emptyList(), recent = listOf("음악이란 결국 영혼의 고통을 잠시 잊게 하는 도피처와 같습니다."))
        assertEquals(reply, g.text)
        assertNull(g.issue)
    }

    @Test
    fun `앞말의 구절을 받아 반박한 답은 되풀이가 아니다`() {
        val ko = "그저 맛있는 것을 먹는 것에서 오는 만족감은 일시적인 것뿐이지요."
        assertEquals(ko, guardReply(ko, "ko", emptyList(), recent = listOf("그저 맛있는 것을 먹는 것에서 오는 만족감이라면 그것으로 족하지 않소.")).text)
        val en = "It confirms the cage because the desire remains, regardless of the momentary illusion."
        assertEquals(en, guardReply(en, "en", emptyList(), recent = listOf("It is a momentary reprieve from the will to live. But what use is a glimpse if it only confirms the cage?")).text)
    }

    @Test
    fun `되풀이 문장만 빼고 새 말은 남긴다`() {
        val g = guardReply("날씨가 좋으니 잠시라도 그 기분을 음미하는 것도 나쁘지 않지요. 오늘은 어디를 걸으셨습니까?", "ko", emptyList(),
            recent = listOf("날씨가 좋으니 잠시라도 그 기분을 음미하는 것도 나쁘지 않지."))
        assertEquals("오늘은 어디를 걸으셨습니까?", g.text)
    }

    @Test
    fun `맞장구 한 마디로 시작하면 떼고 뒤의 생각만 남긴다`() {
        assertEquals("고통을 직시하는 것만으로는 부족하오.", guardReply("그렇소. 고통을 직시하는 것만으로는 부족하오.", "ko", emptyList()).text)
        assertEquals("그 순간의 맛을 즐기는 것만으로도 충분합니다.", guardReply("그렇지요. 그 순간의 맛을 즐기는 것만으로도 충분합니다.", "ko", emptyList()).text)
        assertEquals("그렇소.", guardReply("그렇소.", "ko", emptyList()).text, "그 한 마디뿐이면 그대로 둔다")
        assertEquals("그렇소, 다만 이유는 다르오.", guardReply("그렇소, 다만 이유는 다르오.", "ko", emptyList()).text, "한 문장 안의 맞장구는 건드리지 않는다")
        assertEquals("But the song is not the world.", guardReply("Yes. But the song is not the world.", "en", emptyList()).text)
    }

    @Test
    fun `지나지하지요 같은 엉터리 어미를 바로잡는다`() {
        assertEquals("음악이란 결국 감각을 자극하는 것에 지나지 않지요.", guardReply("음악이란 결국 감각을 자극하는 것에 지나지하지요.", "ko", emptyList()).text)
        assertEquals("욕망이 표현되는 것에 지나지 않습니다.", guardReply("욕망이 표현되는 것에 지나지합니다.", "ko", emptyList()).text)
    }

    @Test
    fun `하오체 철학자의 반말 끝맺음을 하오체로 바꾼다`() {
        fun hao(t: String) = guardReply(t, "ko", emptyList(), register = KoRegister.HAO).text
        assertEquals("그런 작은 만족감이 하루를 버티게 하는 힘이 되는 것이겠소.", hao("그런 작은 만족감이 하루를 버티게 하는 힘이 되는 것이겠지."))
        assertEquals("그건 덧없는 저항일 뿐이오.", hao("그건 덧없는 저항일 뿐이지."))
        assertEquals("가끔은 그저 걷는 것도 나쁘지 않소.", hao("가끔은 그저 걷는 것도 나쁘지 않지."))
        assertEquals("커피 한 잔으로도 만족하는구려.", hao("커피 한 잔으로도 만족하는군."))
        assertEquals("그렇게 생각하오?", hao("그렇게 생각하지?"))
        assertEquals("지금 무엇을 원하오? 그게 제일이오.", hao("지금 무엇을 원하오? 그게 제일이지."))
    }

    @Test
    fun `끝맺음 규칙이 없거나 영어면 끝맺음을 건드리지 않는다`() {
        assertEquals("그 노래는 오래 남지요.", guardReply("그 노래는 오래 남지요.", "ko", emptyList(), register = KoRegister.HAO).text, "해요체 「~지요」는 반말이 아니다")
        assertEquals("그건 덧없는 저항일 뿐이지.", guardReply("그건 덧없는 저항일 뿐이지.", "ko", emptyList()).text)
        assertEquals("Then rest, and climb again.", guardReply("Then rest, and climb again.", "en", emptyList(), register = KoRegister.HAO).text)
        assertEquals("가지가 많은 나무는 바람 잘 날이 없다는 말을 아오.", guardReply("가지가 많은 나무는 바람 잘 날이 없다는 말을 아오.", "ko", emptyList(), register = KoRegister.HAO).text, "문장 중간의 「지」는 그대로")
    }
}
