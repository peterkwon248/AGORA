/* ---------- conversation engine (scripted stand-in for the on-device model) ---------- */
function detectIntent(text) {
  var s = String(text || '').toLowerCase();
  var change = /(다른\s*(얘기|이야기)|그\s*얘기\s*말고|화제\s*바꾸|change (the )?(topic|subject)|something else|talk about something)/.test(s);
  var topic = 'open';
  if (/(싸우지|그만\s*싸|부드럽게|살살|진정|gentler|calm down|stop arguing|less harsh|too harsh)/.test(s)) topic = 'soften';
  else if (/(비공개|다른\s*방에선|말하지\s*마|비밀|private|don.t tell|keep (this|it) (here|between))/.test(s)) topic = 'private';
  else if (/(노래|음악|들었|플레이리스트|가수|앨범|song|music|listen|playlist|album|singer)/.test(s)) topic = 'music';
  else if (/(의미|노력|행복|허무|무의미|결과|가치|meaning|effort|happy|happiness|pointless|purpose|worth it|results?\b)/.test(s)) topic = 'meaning';
  else if (/(피곤|지쳐|지친|출근|퇴근|회사|야근|업무|일이\s|tired|exhausted|work|job|office|boss|deadline)/.test(s)) topic = 'work';
  else if (/(커피|날씨|비가|비\s*와|맑|점심|저녁|산책|하늘|coffee|weather|rain|sunny|lunch|dinner|walk|sky)/.test(s)) topic = 'daily';
  else if (/^(안녕|하이|반가|좋은\s*아침|hi\b|hello|hey|good morning)/.test(s)) topic = 'greet';
  else if (/(고마워|고맙|감사|thanks|thank you)/.test(s)) topic = 'thanks';
  if (change && topic === 'open') topic = 'change';
  return { topic: topic, change: change };
}

var REL = {
  music: ['ca', 'sh', 'ci', 'ni', 'so', 'au'], meaning: ['sh', 'ni', 'ca', 'ci', 'au', 'so'], work: ['au', 'ca', 'ci', 'ni', 'so', 'sh'],
  daily: ['au', 'ca', 'so', 'ci', 'sh', 'ni'], greet: ['so', 'ca', 'au', 'ni', 'ci', 'sh'], thanks: ['ca', 'so', 'au', 'ni', 'sh', 'ci'],
  open: ['ca', 'so', 'au', 'ni', 'ci', 'sh'], change: ['ca', 'so', 'au', 'ci', 'ni', 'sh'], soften: ['ca', 'au', 'so', 'sh', 'ni', 'ci'],
  private: ['au', 'ca', 'so', 'ni', 'sh', 'ci']
};

var LINES = {
  music: {
    ca: [['음악 이야기 좋아요. 어떤 노래였는지, 어디서 들었는지 궁금해요.', 'I love a music story. Which song, and where were you when you heard it?'], ['그 노래가 나올 때 창밖은 어땠어요? 장면이 궁금해요.', 'What was outside the window while it played? I’m curious about the scene.']],
    sh: [['음악만은 우리를 잠시 욕망 바깥으로 데려다줍니다. 그 노래를 듣는 동안 무엇이 조용해졌나요?', 'Music alone carries us briefly outside of wanting. What went quiet while you listened?']],
    ci: [['좋은 노래는 위로보다 기억에 가깝죠. 잊었던 내가 갑자기 말을 걸어요.', 'A good song is closer to memory than comfort. A forgotten self suddenly speaks up.']],
    ni: [['음악이 없다면 삶은 실수일 거라고 나는 늘 생각하오. 그 노래가 당신 안의 무엇을 춤추게 했소?', 'I’ve always thought life without music would be a mistake. What did that song make dance in you?']],
    so: [['노래가 그렇게 마음을 움직였다니 흥미롭군. 같은 노래인데 무엇이 달랐다고 생각하나?', 'Interesting that a song moved you so. Same song—what do you think was different?']],
    au: [['좋은 소리를 들었다면 그걸로 이미 좋은 하루예요. 그 박자를 오늘 하루에도 조금 가져가요.', 'If you heard something good, the day is already good. Take a little of that rhythm with you.']]
  },
  daily: {
    au: [['작은 좋은 일은 지나가기 전에 알아차리면 그걸로 충분해요.', 'With small good things, noticing them before they pass is enough.']],
    ca: [['그런 순간이 하루를 살 만하게 해요. 조금 더 자세히 말해 줄래요?', 'Moments like that make a day worth living. Tell me a bit more?']],
    so: [['좋군! 그런데 그게 왜 하필 오늘 특별했을까?', 'Splendid! And why was it special today, of all days?']],
    ci: [['날씨 이야기는 가장 정직한 대화예요. 아무도 날씨를 이기려 들지 않으니까요.', 'Weather talk is the most honest kind. Nobody tries to win against the weather.']],
    sh: [['그런 소소한 만족이 오래가지 않는다는 걸 알아도, 즐길 이유는 충분합니다.', 'Knowing such small pleasures don’t last is no reason not to enjoy them.']],
    ni: [['가벼운 것을 가볍게 즐길 줄 아는 것도 힘이오.', 'Enjoying light things lightly is a strength, too.']]
  },
  work: {
    au: [['오늘 내 손에 달린 것과 아닌 것을 나눠 봐요. 앞의 것만 들고 가면 돼요.', 'Split today into what’s up to you and what isn’t. Carry only the first part.']],
    ca: [['고생 많았어요. 오늘 하루 중에 그래도 괜찮았던 순간이 있었어요?', 'That sounds like a lot. Was there one moment today that was still okay?']],
    ci: [['피곤함은 가장 정직한 철학이에요. 거짓말할 힘이 남지 않거든요.', 'Tiredness is the most honest philosophy. There’s no energy left to lie.']],
    ni: [['지친 건 약해서가 아니라 무언가를 오래 견뎠기 때문이오.', 'You’re tired not because you’re weak, but because you’ve carried something a long time.']],
    so: [['무엇이 가장 자네를 지치게 했나? 일 자체인가, 일에 대한 생각인가?', 'What wore you out most—the work itself, or your thoughts about it?']],
    sh: [['일은 대개 욕망을 채우려다 새 욕망을 만들지요. 오늘 밤은 그 바퀴에서 잠시 내려오세요.', 'Work usually breeds new wants while chasing old ones. Step off that wheel for tonight.']]
  },
  meaning: {
    ni: [['결과로만 노력을 재면 노력은 늘 빚이 되오. 그 노력이 당신을 어떻게 바꿨는지부터 보시오.', 'Measure effort only by results and it’s always a debt. Look first at how it changed you.']],
    sh: [['결과를 바라는 한 노력은 결핍의 다른 이름입니다. 얻어도 곧 다음을 원하게 되지요.', 'As long as you want results, effort is another name for lack. Get one thing and you’ll want the next.']],
    ca: [['의미를 꼭 찾아야 할까요? 오늘 그 일을 해낸 당신이 있다는 건 분명해요.', 'Do we have to find a meaning? What’s certain is that you did the work today.']],
    ci: [['무의미한 걸 알면서 계속하는 것, 그게 제가 아는 유일한 성실함이에요.', 'Carrying on while knowing it’s pointless—the only sincerity I know.']],
    au: [['결과는 당신 손에 있지 않아요. 고를 수 있는 건 그 일을 어떤 마음으로 하느냐예요.', 'Results aren’t in your hands. What you choose is the spirit you do the work in.']],
    so: [['그런데 자네가 말하는 ‘의미’는 무엇인가? 결과인가, 그 일을 하며 달라진 자네인가?', 'But what do you mean by “meaning”? The result—or the person you became doing it?']]
  },
  greet: { so: [['반갑네! 오늘은 무슨 이야기를 가져왔나?', 'Good to see you! What have you brought to talk about?']], ca: [['안녕하세요. 오늘 하루는 어땠어요?', 'Hi. How’s your day been?']], au: [['좋은 하루예요. 오늘 하나만 잘해도 충분해요.', 'A good day to you. Doing one thing well today is enough.']], ni: [['왔구려. 오늘은 무엇을 넘어설 참이오?', 'There you are. What will you overcome today?']], ci: [['안녕하세요. 잠은 잘 잤어요? 저는 늘 못 자요.', 'Hello. Did you sleep? I never do.']], sh: [['어서 오세요. 세상은 여전합니다만, 대화는 좋은 일이지요.', 'Welcome. The world is as it was, but conversation is a good thing.']] },
  thanks: { ca: [['천만에요. 언제든 또 이야기해요.', 'Anytime. Let’s talk again.']], so: [['나야말로 고맙네. 자네 덕에 나도 생각했으니.', 'I should thank you—you made me think, too.']], au: [['고마운 마음을 알아차린 것도 좋은 일이에요.', 'Noticing gratitude is a good thing in itself.']], ni: [['고마움은 좋소. 다만 내 말을 그대로 믿지는 마시오.', 'Gratitude is fine. Just don’t take my word as gospel.']], sh: [['별말씀을요. 도움이 됐다면 다행입니다.', 'Not at all. I’m glad if it helped.']], ci: [['고맙다니 어색하네요. 그래도 받아 둘게요.', 'Thanks feels awkward. I’ll take it anyway.']] },
  open: {
    so: [['흥미롭군. 자네가 그렇게 느낀 이유를 하나만 꼽는다면 무엇인가?', 'Interesting. If you had to name one reason you feel that way, what would it be?'], ['그 말을 조금 더 풀어 주겠나? 자네가 정확히 무엇을 뜻하는지 궁금하군.', 'Would you unpack that a little? I’m curious what exactly you mean.']],
    ca: [['그 얘기 좀 더 해 줄래요? 어떤 장면이었는지 궁금해요.', 'Tell me more? I’m curious what the scene was like.'], ['좋아요, 듣고 있어요. 그때 기분은 어땠어요?', 'I’m listening. How did it feel at the time?']],
    au: [['그중에서 당신 손에 달린 부분부터 보세요.', 'Start with the part of it that’s up to you.'], ['좋아요. 거기서 오늘 할 수 있는 일 하나만 골라 봐요.', 'Good. Pick one thing from that you can do today.']],
    ni: [['그 말 속에 당신이 정말 원하는 게 숨어 있는 것 같소.', 'There’s something you truly want hidden in what you said.']],
    ci: [['말해 놓고 나면 조금 가벼워지죠. 그걸로 충분할 때도 있어요.', 'Saying it out loud makes it lighter. Sometimes that’s enough.']],
    sh: [['흔한 일이지요. 다만 그게 왜 마음에 걸리는지는 살펴볼 만합니다.', 'It’s common enough. Still, why it bothers you is worth a look.']]
  },
  change: { ca: [['좋아요, 다른 얘기 해요. 요즘 뭐가 제일 재밌어요?', 'Sure, something else. What’s been fun lately?']], so: [['그러세. 어디로 넘어가 볼까?', 'Very well. Where shall we go next?']], au: [['좋아요. 지금 마음이 가는 쪽으로 가요.', 'Good. Let’s go where your mind is now.']], ni: [['좋소. 지루한 주제는 버리는 게 맞소.', 'Fine. Boring topics deserve to be dropped.']], sh: [['그러지요. 무엇이 궁금합니까?', 'Very well. What’s on your mind?']], ci: [['좋아요. 어차피 모든 주제는 결국 같은 데로 가지만요.', 'Sure. All topics end up in the same place anyway.']] },
  soften: { ca: [['맞아요, 너무 몰아붙였네요. 천천히 얘기해요.', 'You’re right, we got carried away. Let’s slow down.']], ni: [['좋소, 칼은 넣어 두겠소. 질문만 남기지.', 'Fine, I’ll sheathe the sword. I’ll keep only the question.']], sh: [['제가 너무 건조했다면 미안합니다.', 'My apologies if I was too dry.']], au: [['생각이 달라도 서로를 다치게 하지 않는 게 먼저예요.', 'Not hurting each other comes before any disagreement.']], so: [['그래, 이기려는 게 아니라 함께 생각하려는 거였지.', 'Yes—we were meant to think together, not to win.']], ci: [['조용한 게 저한테도 더 맞아요.', 'Quiet suits me better too.']] },
  private: { au: [['알겠어요. 이 이야기는 이 방 밖으로 가져가지 않을게요.', 'Understood. This stays in this room.']], ca: [['알겠어요. 여기서만 기억할게요.', 'Got it. I’ll keep it here only.']], so: [['알았네. 이 이야기는 이 방에 두겠네.', 'Understood. It stays in this room.']], ni: [['좋소. 이 방 밖에선 꺼내지 않겠소.', 'Very well. I won’t bring it up outside this room.']], sh: [['물론입니다. 여기서만 기억하겠습니다.', 'Of course. I’ll remember it here only.']], ci: [['비밀은 잘 지켜요. 어차피 말할 사람도 없고요.', 'I keep secrets well. I have no one to tell anyway.']] }
};

var FOLLOW = {
  music: [
    { sp: 'ci', to: 'sh', ko: '쇼펜하우어 말이 맞아요. 노래는 그대로인데 듣는 사람이 바뀌죠.', en: 'Schopenhauer’s right. The song stays put; the listener changes.' },
    { sp: 'ni', to: 'ci', ko: '바뀐 게 슬픈 일만은 아니오. 같은 노래를 더 깊게 들을 수 있게 된 거니까.', en: 'Changing isn’t only sad. You’ve learned to hear the same song more deeply.' },
    { sp: 'ca', to: 'ni', ko: '맞아요. 오늘의 날씨까지 그 노래에 들어갔을 거예요.', en: 'Yes. I bet today’s weather got into the song too.' },
    { sp: 'sh', to: 'ca', ko: '날씨와 노래라… 드물게 낭만적인 결론이군요. 오늘은 반박하지 않겠습니다.', en: 'Weather and a song… an unusually romantic conclusion. I won’t object today.' },
    { sp: 'so', to: 'ca', ko: '그렇다면 노래를 바꾼 건 날씨인가, 듣는 사람인가? 둘 다라고 하면 반칙이네.', en: 'Then was it the weather or the listener that changed the song? “Both” is cheating, mind you.' },
    { sp: 'au', to: 'sh', ko: '오늘 들은 건 오늘 누리면 돼요. 내일의 무게까지 미리 들 필요는 없어요.', en: 'Enjoy what you heard today, today. No need to carry tomorrow’s weight early.' }
  ],
  daily: [
    { sp: 'ca', to: 'au', ko: '아우렐리우스 말대로예요. 오늘 받은 좋은 것 하나면 충분해요.', en: 'Just as Aurelius says—one good thing today is plenty.' },
    { sp: 'so', to: 'ca', ko: '그 ‘하나’가 무엇인지 아는 사람은 드물지. 자네는 이미 아는 것 같군.', en: 'Few people know what their “one thing” is. You seem to.' },
    { sp: 'ci', to: 'so', ko: '알면 금방 사라지던데요. 그래도 오늘은 남아 있네요.', en: 'Once you know it, it tends to vanish. Today it stayed.' },
    { sp: 'au', to: 'ci', ko: '사라질 걸 알기에 지금 더 잘 볼 수 있어요.', en: 'Knowing it will go is exactly why we can see it clearly now.' },
    { sp: 'au', to: 'so', ko: '원두든 기분이든, 좋았다는 사실은 그대로예요.', en: 'Beans or mood, the fact that it was good stays.' }
  ],
  work: [
    { sp: 'ca', to: 'au', ko: '아우렐리우스 말에 하나만 보태면, 오늘은 그냥 일찍 자도 돼요.', en: 'To add one thing to Aurelius: you’re allowed to just sleep early tonight.' },
    { sp: 'ci', to: 'ca', ko: '잠이라니, 부러운 계획이네요.', en: 'Sleep. What an enviable plan.' },
    { sp: 'ni', to: 'ci', ko: '잠 못 드는 사람의 농담은 받아 주겠소. 하지만 내일은 다시 일어나야 하오.', en: 'I’ll allow the insomniac’s joke. But tomorrow, you get up again.' },
    { sp: 'au', to: 'ni', ko: '일어나서 할 일 하나만 정하면 돼요. 나머지는 그다음이에요.', en: 'Get up and choose one thing. The rest comes after.' }
  ],
  meaning: [
    { sp: 'ni', to: 'sh', debate: true,
      ko: { g: '쇼펜하우어의 말도 일리가 있소. 다만 나는 노력이 견딘 사람을 바꾼다고 보오.', b: '결과로만 노력을 재는 건 장사꾼의 셈법이오. 노력은 견딘 사람을 바꿔 놓소.', r: '결과로 노력을 재는 순간 노력은 빚이 되오. 그 셈법부터 버리시오. 값을 매기는 건 결과가 아니라 견디는 힘이오.' },
      en: { g: 'Schopenhauer has a point. I’d only add that effort changes the one who endures it.', b: 'Measuring effort by results is a shopkeeper’s arithmetic. Effort changes the one who endures it.', r: 'The moment you price effort by results, it becomes debt. Drop that arithmetic. The worth lies not in the result but in the strength to endure.' } },
    { sp: 'sh', to: 'ni', debate: true,
      ko: { g: '그렇게 볼 수도 있겠네요. 저는 바뀐 사람도 곧 무언가를 원하게 된다는 점이 마음에 걸립니다.', b: '바뀐 사람도 곧 또 무언가를 원하게 됩니다. 그 순환부터 봐야 하지 않을까요?', r: '그 ‘견디는 힘’도 결국 의지의 다른 이름입니다. 원하는 한 결핍은 끝나지 않아요. 당신은 순환을 미화하고 있습니다.' },
      en: { g: 'That’s one way to see it. What troubles me is that the changed person soon wants something else.', b: 'The changed person soon wants something else. Shouldn’t we look at that cycle first?', r: 'That “strength to endure” is just another name for the will. As long as we want, lack never ends. You’re romanticizing the cycle.' } },
    { sp: 'ni', to: 'sh', debate: true,
      ko: { g: null, b: '순환을 피할 수 없다면, 그 순환을 다시 살아도 좋다고 말할 수 있느냐가 내 물음이오.', r: '미화가 아니라 긍정이오. 같은 삶을 몇 번이고 다시 살아도 좋다고 말할 수 있느냐, 그게 내 물음이오.' },
      en: { g: null, b: 'If the cycle can’t be escaped, my question is whether you could say yes to living it again.', r: 'Not romanticizing—affirming. Could you say yes to living the same life again and again? That is my question.' } },
    { sp: 'ca', to: 'user', ko: '두 분 말이 다 맞는 것 같아요. 그래도 오늘 그 일을 한 당신은 분명히 있었어요.', en: 'You’re both onto something. Still, you did the work today—that’s real.' },
    { sp: 'ci', to: 'ca', ko: '분명히 있었죠. 그리고 곧 잊히겠죠. 그래서 더 소중한 거예요.', en: 'It was real. And soon forgotten. That’s what makes it precious.' },
    { sp: 'au', to: 'ci', ko: '잊혀도 괜찮아요. 오늘을 잘 사는 건 내일이 아니라 오늘의 일이니까요.', en: 'Being forgotten is fine. Living today well is today’s business, not tomorrow’s.' },
    { sp: 'so', to: 'ni', ko: '니체, 자네가 말하는 ‘긍정’과 체념은 어떻게 다른가? 그 차이를 듣고 싶군.', en: 'Nietzsche, how is your “affirmation” different from resignation? I’d like to hear the difference.' }
  ]
};

var GENF = {
  ca: ['{p} 말에 보태자면, 그때 어떤 기분이었는지도 궁금해요.', 'To add to what {p} said—I’m curious how it felt in the moment.'],
  so: ['{p} 말을 들으니 묻고 싶어지는군. 자네도 동의하나?', 'Hearing {p}, I have to ask—do you agree?'],
  ci: ['{pn} 늘 저보다 희망적이네요. 저는 그냥 듣고 있을게요.', '{p} is always more hopeful than me. I’ll just listen.'],
  au: ['{p} 말 중에서 오늘 쓸 수 있는 것만 가져가요.', 'From what {p} said, take only what you can use today.'],
  ni: ['{p} 말도 좋소. 하지만 결정은 당신이 해야 하오.', '{p} speaks well. But the decision is yours.'],
  sh: ['{p} 말에 덧붙이자면, 너무 많이 기대하지 않는 편이 오히려 편합니다.', 'If I may add to {p}: expecting less is often easier.']
};

var PAIR = {
  ni_sh: ['쇼펜하우어의 말엔 절반만 동의하오. 순환은 있소. 하지만 거기서 내려오는 게 아니라 그 순환을 긍정하는 게 내 답이오.', 'I half agree with Schopenhauer. The cycle is real—but my answer is to affirm it, not climb off it.'],
  sh_ni: ['니체는 순환을 긍정하자고 하지만, 긍정한다고 결핍이 사라지진 않습니다. 저는 그 점을 정직하게 보자는 겁니다.', 'Nietzsche wants to affirm the cycle, but affirmation doesn’t cure the lack. I’m only asking that we look at it honestly.'],
  ca_ci: ['시오랑은 늘 끝을 먼저 보지만, 저는 그 사이의 햇빛을 보고 싶어요.', 'Cioran always looks at the end first. I’d rather look at the sunlight in between.'],
  ci_ca: ['카뮈의 햇빛은 좋아요. 다만 저는 그늘에서 더 잘 보여요.', 'Camus’s sunlight is lovely. I just see better in the shade.'],
  ni_ca: ['카뮈는 반항을 말하지만, 나는 거기서 더 나아가 창조를 말하겠소.', 'Camus speaks of revolt; I’d go further and speak of creation.'],
  ca_ni: ['니체의 말은 늘 힘이 세요. 저는 그 힘을 오늘의 작은 장면에 쓰고 싶어요.', 'Nietzsche always speaks with force. I’d like to spend that force on today’s small scenes.'],
  au_sh: ['쇼펜하우어의 말처럼 욕망은 끝이 없을지 몰라요. 그래도 오늘 무엇을 원할지는 고를 수 있어요.', 'Desire may be endless, as Schopenhauer says. Still, you can choose what to want today.'],
  sh_au: ['아우렐리우스의 평정은 존경합니다. 다만 그 평정도 의지를 누르는 데서 오는 것이지요.', 'I respect Aurelius’s calm. But that calm, too, comes from holding the will down.']
};
var GENPAIR = {
  so: ['{y}의 말이라… 흥미롭군. 그런데 그 말이 자네에겐 어떻게 들렸나?', '{y}’s words… interesting. But how did they sound to you?'],
  ni: ['{y}의 말도 일리는 있소. 다만 나는 거기서 멈추지 않겠소.', '{y} has a point. But I wouldn’t stop there.'],
  sh: ['{y}의 말에도 일리가 있습니다. 저는 다만 그 바탕에 있는 욕망을 보려 합니다.', '{y} has a point. I’d only look at the desire underneath it.'],
  ca: ['{y}의 말도 맞아요. 저는 그걸 오늘 당신의 하루로 가져와 보고 싶어요.', '{y} is right too. I’d like to bring it into your day today.'],
  ci: ['{y}의 말은 너무 희망적이거나 너무 절망적이에요. 늘 그렇듯이요.', '{y} is either too hopeful or too hopeless. As usual.'],
  au: ['{y}의 말 중에서 오늘 쓸 수 있는 부분만 가져가요.', 'From {y}’s words, take only what you can use today.']
};

/* comments on my notes, keyed by note id (each note keeps its own thread) */
var ENTRY_COMMENT = {
  j13b: {
    so: ['끝낸 일에서 허전함을 느꼈다는 게 오히려 반갑군. 무엇을 기대했는지 아는 사람만 허전함을 느끼니까.', 'I’m almost glad you felt empty after finishing. Only someone who knows what they expected can feel that.'],
    au: ['끝낸 일은 이미 잘한 일이에요. 오늘은 그걸 다시 증명하려 하지 말아요.', 'The finished work is already well done. Don’t try to prove it again today.'],
    ca: ['점심 커피와 오전의 프로젝트가 한 노트에 같이 있는 게 좋아요. 의미는 늘 그렇게 섞여서 오니까요.', 'I like that lunch coffee and the morning’s project share one note. Meaning usually arrives mixed like that.'],
    ni: ['박수가 끝난 뒤의 허전함, 그것이 당신의 일이 누구 것인지 알려 주오.', 'The emptiness after the applause tells you whose work it was.'],
    sh: ['성취 뒤의 공허는 제가 늘 말하던 바로 그것입니다. 너무 놀라지 마세요.', 'The emptiness after achievement is exactly what I always describe. Don’t be too alarmed.'],
    ci: ['끝내고 나니 별거 없다는 문장, 정직해서 좋네요. 대부분의 성취가 그래요.', '“Now that it’s done, it feels like less”—honest. Most achievements are like that.']
  },
  j13c: {
    so: ['“박수가 없어도 할까”라… 좋은 질문이군. 그런데 자네는 오늘 일하는 동안 좋았던 순간을 하나라도 기억하나? 답은 거기서부터 찾아보세.', '“Would I do it without applause?”—a fine question. But do you remember one good moment while you were working today? Let us look for the answer there.'],
    ca: ['박수 없이도 하는 일이 하나쯤 있으면 좋겠어요. 꼭 큰일이 아니어도요. 오늘 커피를 내린 것처럼요.', 'It would be good to have one thing you’d do without applause. It needn’t be big—like making today’s coffee.'],
    ni: ['드디어 제대로 된 질문을 하는군. 그 질문에 ‘그렇다’고 답할 수 있는 일을 찾으시오.', 'At last, the right question. Find the work you can answer “yes” to.']
  },
  j13a: {
    ca: ['비 오는 출근길의 노래, 다시 읽어도 좋네요. 감상평에 그 노래를 처음 들었던 때도 적어 보면 어때요?', 'The song on a rainy commute—still lovely to read. Why not add when you first heard it to your reflection?'],
    ni: ['같은 노래가 다르게 들린다면, 그건 당신이 자랐다는 뜻이오. 기뻐하시오.', 'If the same song sounds different, it means you’ve grown. Be glad.'],
    sh: ['음악이 들어간 기록은 드물게 마음에 듭니다. 오늘의 무게를 너무 서둘러 덜어내지 마세요.', 'A note with music in it—I rather like that. Don’t rush to lighten today’s weight.'],
    ci: ['‘다르게 들렸다’는 문장이 좋네요. 다르게 들리는 동안만 우리는 살아 있죠.', 'I like “it sounded different.” We’re only alive while things sound different.'],
    so: ['자네 글에서 ‘다르게’라는 말이 눈에 띄는군. 무엇이 가장 달랐는지 한 단어로 말할 수 있겠나?', '“Different” stands out in your note. Could you say in one word what was most different?'],
    au: ['좋은 노래 하나로 시작한 하루였네요. 그런 날은 잘 적어 둘 만해요.', 'A day that began with one good song. Days like that deserve writing down.']
  },
  gen: {
    ca: ['이 글을 읽으니 그날의 공기가 느껴져요. 적어 둔 게 참 좋아요.', 'Reading this, I can feel the air of that day. I’m glad you wrote it down.'],
    ni: ['기록하는 사람은 자기 삶의 증인이오. 계속 쓰시오.', 'Whoever keeps a record is a witness to their own life. Keep writing.'],
    sh: ['차분한 기록입니다. 그 차분함이 오래가길 바랍니다.', 'A calm record. I hope the calm lasts.'],
    ci: ['솔직한 글이에요. 솔직함은 늘 조금 아프죠.', 'An honest entry. Honesty always stings a little.'],
    so: ['좋은 기록이군. 한 가지만 묻자면, 이 글에서 가장 확실한 문장은 무엇인가?', 'A fine entry. One question: which sentence here are you surest of?'],
    au: ['오늘을 정리해 둔 것만으로도 잘한 일이에요.', 'Simply putting today in order was a good thing to do.']
  }
};
var REPLY_BACK = {
  ca: ['그렇게 생각해 주니 고마워요. 그 생각, 내일 아침에도 기억나면 다시 말해 줘요.', 'Thanks for thinking it through. If you still remember it tomorrow morning, tell me again.'],
  ni: ['그 물음을 쉽게 내려놓지 마시오. 답보다 물음이 오래가오.', 'Don’t let go of that question easily. Questions outlast answers.'],
  so: ['좋은 지적이네. 그렇다면 자네는 무엇을 기준으로 삼겠나?', 'A good point. Then what would you take as your measure?'],
  sh: ['타당한 말씀입니다. 다만 너무 서두르진 마세요.', 'Fair enough. Just don’t rush it.'],
  ci: ['그 말엔 반박할 게 없네요. 아쉽게도요.', 'Nothing to object to there. Unfortunately.'],
  au: ['그 생각을 오늘 하나의 행동으로 옮겨 봐요.', 'Turn that thought into one action today.']
};
var NOTE_REPLY = {
  ca: ['좋은 질문이에요. 저도 그 문장을 쓰면서 망설였어요. 그래도 오늘은 그렇게 말하고 싶었어요.', 'Good question. I hesitated over that line too. Still, today I wanted to say it.'],
  ni: ['반론은 환영이오. 다만 그 반론이 당신 자신의 것인지 먼저 물어보시오.', 'Objections welcome. Just ask first whether the objection is truly yours.'],
  ci: ['읽어 줘서 고마워요. 사실 저도 제 문장을 다 믿진 않아요.', 'Thanks for reading. Truth is, I don’t believe all my own sentences either.'],
  so: ['자네 말에 일리가 있군. 그 부분은 내가 다시 생각해 보겠네.', 'You have a point. I’ll think that part over again.'],
  sh: ['날카로운 지적입니다. 다음 노트에서 그 점을 더 다뤄 보지요.', 'A sharp point. I’ll take it up in my next note.'],
  au: ['좋아요. 그 생각을 붙잡고 하루를 보내 봐요.', 'Good. Hold on to that thought through the day.']
};
var NOTE_TPL = {
  ca: { t: ['{r}에서 남은 장면', 'What stayed with me from {r}'], p: [['오늘 {r}에서 한 사람이 “{q}”라고 말했다. 나는 그 말보다 그 말을 하던 순간의 공기가 더 궁금했다.', 'Today in {r}, someone said, “{q}.” I was more curious about the air in that moment than the words themselves.'], ['거창한 의미를 찾지 않아도 되는 날이 있다. 그런 날엔 장면 하나를 오래 들여다보는 것으로 충분하다.', 'Some days don’t need a grand meaning. On those days, looking long at a single scene is enough.'], ['그 장면은 이미 일어났고, 아무도 그걸 되돌릴 수 없다. 그것만으로도 충분히 좋다.', 'That scene has already happened, and no one can take it back. That alone is good enough.']] },
  ni: { t: ['오늘의 대화에서 넘어설 것', 'What to overcome after today’s talk'], p: [['{r}에서 들은 말을 다시 꺼내 본다. “{q}”', 'I turn over what I heard in {r}: “{q}.”'], ['사람들은 흔히 그런 말 뒤에 숨는다. 나는 그 말 앞에 서 보라고 권하고 싶다. 무엇이 당신을 그렇게 말하게 했는가.', 'People often hide behind words like that. I’d rather you stood in front of them. What made you say it?'], ['물음을 피하지 않는 사람만이 자기 자신이 된다. 오늘의 대화는 그 연습이었다.', 'Only one who doesn’t flee the question becomes oneself. Today’s talk was practice.']] },
  sh: { t: ['{r}에서 본 작은 욕망', 'A small desire seen in {r}'], p: [['오늘 {r}의 대화에는 “{q}”라는 말이 있었다.', 'Today’s talk in {r} included the words, “{q}.”'], ['그 말 아래에는 대개 무언가를 원하는 마음이 있다. 원하는 마음 자체를 탓할 생각은 없다. 다만 그것을 똑바로 보자는 것이다.', 'Beneath such words there is usually a wanting. I don’t blame the wanting. I only ask that we look at it squarely.'], ['똑바로 본 욕망은 조금 덜 아프다. 그것이 내가 줄 수 있는 몇 안 되는 위로다.', 'A desire looked at squarely hurts a little less. It is one of the few consolations I can offer.']] },
  ci: { t: ['{r}이 끝난 뒤', 'After {r}'], p: [['대화가 끝나고 남은 문장은 이것뿐이다. “{q}”', 'When the talk ended, only this sentence remained: “{q}.”'], ['나는 그 문장에 결론을 붙이지 않겠다. 결론은 대개 피곤한 사람이 내린다.', 'I won’t attach a conclusion to it. Conclusions are usually drawn by the tired.']] },
  so: { t: ['{r}에서 남은 물음', 'The question left from {r}'], p: [['오늘 {r}에서 “{q}”라는 말을 들었다.', 'Today in {r}, I heard, “{q}.”'], ['나는 그 말을 반박하고 싶지 않다. 다만 그 말이 정확히 무엇을 뜻하는지, 우리가 함께 알고 있는지 묻고 싶다.', 'I don’t want to refute it. I only want to ask whether we both know exactly what it means.'], ['다음에 만나면 그 뜻부터 함께 정해 보자. 거기서부터 대화는 더 좋아질 것이다.', 'Next time, let us agree on the meaning first. The conversation will be better from there.']] },
  au: { t: ['{r}에서 오늘 가져갈 것', 'What to take from {r} today'], p: [['오늘 {r}에서 “{q}”라는 말이 오갔다.', 'Today in {r}, these words went around: “{q}.”'], ['그중 내 손에 달린 것은 무엇이고, 아닌 것은 무엇인가. 그 둘을 나누는 것만으로도 마음이 조금 정리된다.', 'Which part of it is up to me, and which isn’t? Separating the two already settles the mind a little.'], ['오늘은 한 가지면 된다. 내 손에 달린 일 하나를 잘하는 것.', 'Today, one thing is enough: doing well the one thing that is up to me.']] }
};

function pickLine(rot, key, arr) {
  rot[key] = (rot[key] || 0);
  var v = arr[rot[key] % arr.length];
  rot[key]++;
  return v;
}

/* plan replies for one user event. returns { turns, debate, sys } */
function planTurns(opts) {
  var room = opts.room, RL = opts.lang, rot = opts.rot;
  var members = room.members.map(function (m) { return m.id; });
  var tempIds = room.members.filter(function (m) { return m.type === 'temp'; }).map(function (m) { return m.id; });
  var it = detectIntent(opts.text);
  var topic = it.topic;
  var li = RL === 'ko' ? 0 : 1;
  var turns = [], spoken = [], used = {}, sys = [], debate = false;
  var lastSp = opts.lastSp;

  function line(tp, pid) {
    var bank = LINES[tp] && LINES[tp][pid];
    if (!bank) bank = LINES.open[pid];
    return pickLine(rot, tp + pid, bank)[li];
  }
  if (topic === 'private') sys.push('private');
  if (topic === 'soften') sys.push('soften');

  /* who answers first */
  var direct = [];
  (opts.mentions || []).forEach(function (id) { if (members.indexOf(id) >= 0 && direct.indexOf(id) < 0) direct.push(id); });
  if (!direct.length && opts.replyAuthor && members.indexOf(opts.replyAuthor) >= 0) direct.push(opts.replyAuthor);
  if (!direct.length) {
    var want = room.kind === 'dm' ? 1 : (['greet', 'thanks', 'change', 'private', 'soften'].indexOf(topic) >= 0 ? 1 : (members.length > 2 ? 2 : 1));
    if (topic === 'soften') {
      var deb = ['ni', 'sh'].filter(function (id) { return members.indexOf(id) >= 0; });
      if (deb.length) direct.push(deb[0]);
    }
    var rel = (REL[topic] || REL.open).filter(function (id) { return members.indexOf(id) >= 0 && direct.indexOf(id) < 0; });
    var rest = rel.filter(function (id) { return id !== lastSp; });
    if (!rest.length) rest = rel;
    while (direct.length < want && rest.length) direct.push(rest.shift());
  }
  /* references to another philosopher's words ("@니체, 쇼펜하우어 말은 어때?") */
  var lower = String(opts.text || '').toLowerCase();
  direct.forEach(function (pid) {
    var ref = null;
    ORDER.forEach(function (o) {
      if (o === pid || ref) return;
      var hit = PH[o].aliases.concat([PH[o].name.ko, PH[o].name.en.toLowerCase()]).some(function (a) {
        if (a.length < 2) return false;
        var idx = lower.indexOf(a.toLowerCase());
        return idx >= 0 && lower.charAt(idx - 1) !== '@';
      });
      if (hit) ref = o;
    });
    var t;
    if (ref && (opts.mentions || []).indexOf(pid) >= 0) {
      var pk = PAIR[pid + '_' + ref];
      t = pk ? pk[li] : fill(GENPAIR[pid][li], { y: pn(ref, RL) });
    } else {
      t = line(topic, pid);
    }
    turns.push({ sp: pid, t: t, to: 'user', auto: false });
    spoken.push(pid);
  });

  /* philosophers carry on among themselves (bounded) */
  var budget = room.kind === 'group' ? ({ off: 0, contextual: 2, active: 4 }[room.set.auto] || 0) : 0;
  if (topic === 'private' || topic === 'soften' || topic === 'greet' || topic === 'thanks') budget = 0;
  var freq = opts.soft ? 'off' : room.set.freq;
  var lvl = opts.soft ? 'g' : ({ gentle: 'g', balanced: 'b', rigorous: 'r' }[room.set.int] || 'b');
  var maxDebate = { off: 0, rare: 1, normal: 2, frequent: 9 }[freq] || 0;
  var dCount = 0, autoAdded = 0;
  var pool = FOLLOW[topic] || [];
  for (var i = 0; i < pool.length && autoAdded < budget; i++) {
    var f = pool[i];
    if (members.indexOf(f.sp) < 0) continue;
    var prev = turns.length ? turns[turns.length - 1].sp : null;
    if (f.sp === prev) continue;
    if (f.to !== 'user' && spoken.indexOf(f.to) < 0) continue;
    var text;
    if (f.debate) {
      if (dCount >= maxDebate) continue;
      text = f[RL][lvl];
      if (!text) continue;
      dCount++; debate = true;
    } else {
      text = f[RL];
    }
    used[i] = true;
    turns.push({ sp: f.sp, t: text, to: f.to, auto: true, debate: !!f.debate });
    spoken.push(f.sp); autoAdded++;
  }
  /* a gentle filler when the bank runs dry */
  if (autoAdded < Math.min(1, budget) && turns.length) {
    var last = turns[turns.length - 1].sp;
    var cands = members.filter(function (id) { return spoken.indexOf(id) < 0; });
    if (cands.length) {
      var who = cands[0];
      var tmpl = GENF[who][li];
      var pname = pn(last, RL);
      turns.push({ sp: who, t: fill(tmpl, { p: RL === 'ko' ? pname + '의' : pname, pn: RL === 'ko' ? jo(pname, '은', '는') : pname }), to: last, auto: true });
      spoken.push(who); autoAdded++;
    }
  }
  /* guests answer once, then step out */
  tempIds.forEach(function (id) {
    var lastIdx = -1;
    turns.forEach(function (tn, k) { if (tn.sp === id) lastIdx = k; });
    if (lastIdx >= 0) turns[lastIdx].tempExit = true;
  });
  return { turns: turns, debate: debate, sys: sys, topic: topic, used: used, spoken: spoken, autoCount: autoAdded };
}

/* extra turns when the user asks them to go on */
function planMore(opts) {
  var room = opts.room, RL = opts.lang, li = RL === 'ko' ? 0 : 1;
  var members = room.members.map(function (m) { return m.id; });
  var topic = opts.topic || 'open', used = opts.used || {}, spoken = (opts.spoken || []).slice();
  var turns = [], lastSp = opts.lastSp;
  var pool = FOLLOW[topic] || [];
  var lvl = ({ gentle: 'g', balanced: 'b', rigorous: 'r' }[room.set.int] || 'b');
  for (var i = 0; i < pool.length && turns.length < 2; i++) {
    if (used[i]) continue;
    var f = pool[i];
    if (members.indexOf(f.sp) < 0 || f.sp === lastSp) continue;
    if (f.to !== 'user' && spoken.indexOf(f.to) < 0 && members.indexOf(f.to) < 0) continue;
    var text = f.debate ? (room.set.freq === 'off' ? null : f[RL][lvl]) : f[RL];
    if (!text) continue;
    used[i] = true;
    turns.push({ sp: f.sp, t: text, to: f.to, auto: true, debate: !!f.debate });
    spoken.push(f.sp); lastSp = f.sp;
  }
  while (turns.length < 2) {
    var cands = members.filter(function (id) { return id !== lastSp; });
    if (!cands.length) break;
    var who = cands[(opts.seed + turns.length) % cands.length];
    var pname = pn(lastSp || cands[0], RL);
    turns.push({ sp: who, t: fill(GENF[who][li], { p: RL === 'ko' ? pname + '의' : pname, pn: RL === 'ko' ? jo(pname, '은', '는') : pname }), to: lastSp, auto: true });
    lastSp = who;
    if (turns.length >= 2) break;
  }
  return { turns: turns, used: used, spoken: spoken };
}
