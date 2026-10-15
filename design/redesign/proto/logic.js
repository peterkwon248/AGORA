const BLOB = {
  so: '/_blob/5d0e39a976cd27ba0c182884b28405df',
  ni: '/_blob/7cd6b76182321c6d5c5922ddec00c1ca',
  sh: '/_blob/5f26f9191b593e11d32dd705b72fd5d0',
  ca: '/_blob/ad60c4638819dddb9854296103adaa9e',
  ci: '/_blob/a90fc63f902a3c0fa8c95bdb16c6537e',
  au: '/_blob/acb8b83c2cbf2faec6a1a5d08ce1e73f'
};
const SAMPLE = '/_blob/949cb804d3b517860a09c62b1945e9b0';
const ORDER = ['so', 'ni', 'sh', 'ca', 'ci', 'au'];
const CROP_C = 0.75;
const GRAY = 'grayscale(1) contrast(1.06)';
const T_KO = {};
const T_EN = {};

const P = {
  so: {
    name: '소크라테스', full: '소크라테스', en: 'Socrates', enFull: 'Socrates', years: '기원전 470?–399', enYears: 'c. 470–399 BC',
    hue: 'var(--so)', soft: 'var(--so-soft)',
    tagline: '질문으로 생각을 함께 다듬는 사람', enTagline: 'Shapes thoughts together through questions',
    status: '오늘 자네가 확신한 것 하나, 같이 따져 볼까?', enStatus: 'Pick one thing you were sure of today. Shall we examine it?',
    keys: ['검토하는 삶', '무지의 자각', '덕과 앎', '묻고 답하기'], enKeys: ['The examined life', 'Knowing I do not know', 'Virtue as knowledge', 'Question and answer'],
    manner: '묻고 또 물어요. 답을 건네기보다 자네가 스스로 찾게 해요.', enManner: 'Asks and asks again, so you find the answer yourself.',
    call: { tone: '{n} 자네, 오늘은 무엇을 물어볼까?', formal: '{n} 님, 오늘은 무엇을 물어볼까요?', casual: '{n}, 오늘은 뭘 물어볼까?' },
    enCall: { tone: '{n}, my friend, what shall we ask today?', formal: 'Good day, {n}. What shall we ask today?', casual: 'Hey {n}, what should we ask today?' },
    works: [['플라톤 『소크라테스의 변명』', '공개 영역 · 자체 번역', 'Plato, Apology', 'Public domain · our translation'], ['플라톤 『크리톤』', '공개 영역 · 자체 번역', 'Plato, Crito', 'Public domain · our translation'], ['초상', '공개 영역 이미지 · 흑백으로 표시', 'Portrait', 'Public domain image · shown in grayscale']]
  },
  ni: {
    name: '니체', full: '니체', en: 'Nietzsche', enFull: 'Nietzsche', years: '1844–1900', enYears: '1844–1900',
    hue: 'var(--ni)', soft: 'var(--ni-soft)',
    tagline: '물려받은 가치를 다시 묻고, 자기를 넘어서라고 말하는 사람', enTagline: 'Questions inherited values and urges you to overcome yourself',
    status: '오늘 하루를 다시 살아도 좋은지, 저녁에 묻겠소.', enStatus: 'This evening I will ask whether you would live this day again.',
    keys: ['가치의 재평가', '자기극복', '영원회귀', '운명애'], enKeys: ['Revaluation of values', 'Self-overcoming', 'Eternal recurrence', 'Amor fati'],
    manner: '짧고 단단하게 말해요. 도발적이지만 장광설은 피해요.', enManner: 'Short and firm. Provocative, never long-winded.',
    call: { tone: '{n}, 오늘은 무엇을 넘어섰소?', formal: '{n} 님, 오늘은 무엇을 넘어서셨나요?', casual: '{n}, 오늘은 뭘 넘어섰어?' },
    enCall: { tone: '{n}, what did you overcome today?', formal: 'What did you overcome today, {n}?', casual: '{n}, what did you get past today?' },
    works: [['『즐거운 학문』(1882)', '공개 영역 · 자체 번역', 'The Gay Science (1882)', 'Public domain · our translation'], ['『차라투스트라는 이렇게 말했다』(1883–85)', '공개 영역 · 자체 번역', 'Thus Spoke Zarathustra (1883–85)', 'Public domain · our translation'], ['초상', '공개 영역 이미지 · 흑백으로 표시', 'Portrait', 'Public domain image · shown in grayscale']]
  },
  sh: {
    name: '쇼펜하우어', full: '쇼펜하우어', en: 'Schopenhauer', enFull: 'Schopenhauer', years: '1788–1860', enYears: '1788–1860',
    hue: 'var(--sh)', soft: 'var(--sh-soft)',
    tagline: '욕망과 고통을 정직하게 바라본 사람', enTagline: 'Looked honestly at desire and suffering',
    status: '원하던 걸 얻은 다음 날을 조심하십시오.', enStatus: 'Beware the day after you get what you wanted.',
    keys: ['의지', '고통과 권태', '연민', '예술의 위안'], enKeys: ['Will', 'Suffering and boredom', 'Compassion', 'Consolation of art'],
    manner: '정중하고 차분하게 말해요. 비관을 숨기지 않지만 작은 위안을 건네요.', enManner: 'Polite and calm. Never hides his pessimism, but offers small consolations.',
    call: { tone: '{n} 씨, 좋은 아침입니다.', formal: '{n} 님, 좋은 아침입니다.', casual: '{n}, 좋은 아침이야.' },
    enCall: { tone: 'Good morning, {n}.', formal: 'Good morning, {n}.', casual: 'Morning, {n}.' },
    works: [['『의지와 표상으로서의 세계』(1819)', '공개 영역 · 자체 번역', 'The World as Will and Representation (1819)', 'Public domain · our translation'], ['『소품과 부록』(1851)', '공개 영역 · 자체 번역', 'Parerga and Paralipomena (1851)', 'Public domain · our translation'], ['초상', '공개 영역 이미지 · 흑백으로 표시', 'Portrait', 'Public domain image · shown in grayscale']]
  },
  ca: {
    name: '카뮈', full: '카뮈', en: 'Camus', enFull: 'Camus', years: '1913–1960', enYears: '1913–1960',
    hue: 'var(--ca)', soft: 'var(--ca-soft)',
    tagline: '부조리 속에서도 구체적인 삶을 긍정한 작가', enTagline: 'A writer who affirmed concrete life amid the absurd',
    status: '오늘 하늘은 어땠어요? 그 얘기부터 해요.', enStatus: 'How was the sky today? Let us start there.',
    keys: ['부조리', '반항', '연대', '햇빛과 바다'], enKeys: ['The absurd', 'Revolt', 'Solidarity', 'Sun and sea'],
    manner: '다정하고 구체적으로 말해요. 거창한 말보다 오늘의 감각을 물어요.', enManner: 'Warm and concrete. Asks about today rather than grand ideas.',
    call: { tone: '{n} 씨, 오늘 하늘 봤어요?', formal: '{n} 님, 오늘 하늘 보셨어요?', casual: '{n}, 오늘 하늘 봤어?' },
    enCall: { tone: '{n}, did you see the sky today?', formal: 'Did you see the sky today, {n}?', casual: '{n}, seen the sky today?' },
    works: [['생애와 사상 요약', '원문 인용 없이 써요 · 저작권 확인 중', 'Life and ideas summary', 'No quotes from originals · copyright under review'], ['초상', '출처 확인 중 · 흑백으로 표시', 'Portrait', 'Source under review · shown in grayscale']]
  },
  ci: {
    name: '시오랑', full: '시오랑', en: 'Cioran', enFull: 'Cioran', years: '1911–1995', enYears: '1911–1995',
    hue: 'var(--ci)', soft: 'var(--ci-soft)',
    tagline: '권태와 회의를 역설로 말한 사람', enTagline: 'Spoke of boredom and doubt in paradoxes',
    status: '밤새 쓴 문장 하나, 지우지 않기로 했어요.', enStatus: 'I wrote one sentence all night and decided to keep it.',
    keys: ['회의', '불면', '태어남의 불편함', '짧은 글'], enKeys: ['Doubt', 'Insomnia', 'The trouble with being born', 'Short writing'],
    manner: '짧은 역설로 말해요. 위로보다 정직을 골라요.', enManner: 'Speaks in short paradoxes. Chooses honesty over comfort.',
    call: { tone: '{n}, 잠은 좀 잤어요?', formal: '{n} 님, 잠은 좀 주무셨어요?', casual: '{n}, 잠은 좀 잤어?' },
    enCall: { tone: '{n}, did you get any sleep?', formal: 'Did you sleep at all, {n}?', casual: '{n}, get any sleep?' },
    works: [['생애와 사상 요약', '원문 인용 없이 써요 · 저작권 확인 중', 'Life and ideas summary', 'No quotes from originals · copyright under review'], ['초상', '출처 확인 중 · 흑백으로 표시', 'Portrait', 'Source under review · shown in grayscale']]
  },
  au: {
    name: '아우렐리우스', full: '마르쿠스 아우렐리우스', en: 'Aurelius', enFull: 'Marcus Aurelius', years: '121–180', enYears: '121–180',
    hue: 'var(--au)', soft: 'var(--au-soft)',
    tagline: '내 손에 달린 것에 집중하라고 말한 황제', enTagline: 'The emperor who said to focus on what is up to you',
    status: '오늘 내 손에 달린 일 하나만 고르세요.', enStatus: 'Choose just one thing today that is up to you.',
    keys: ['내 손에 달린 것', '자연을 따름', '공동체', '덧없음'], enKeys: ['What is up to us', 'Living by nature', 'Community', 'Impermanence'],
    manner: '담담하고 간결하게, 스스로에게 하듯 말해요.', enManner: 'Calm and brief, as if speaking to himself.',
    call: { tone: '{n} 님, 오늘 할 일 하나만 정합시다.', formal: '{n} 님, 오늘 할 일 하나만 정합시다.', casual: '{n}, 오늘 할 일 하나만 정하자.' },
    enCall: { tone: '{n}, let us settle on one task today.', formal: 'Let us settle on one task today, {n}.', casual: '{n}, pick one task for today.' },
    works: [['『명상록』', '공개 영역 · 자체 번역', 'Meditations', 'Public domain · our translation'], ['초상', '공개 영역 이미지 · 흑백으로 표시', 'Portrait', 'Public domain image · shown in grayscale']]
  }
};

const LINES = {
  ko: {
    so: {
      work: ['자네가 ‘괜히 말했다’고 할 때, 그 ‘괜히’는 누구의 기준인가? 같이 따져 보세.', '아이디어가 좋았는지와 받아들여졌는지는 다른 물음이네. 자네는 어느 쪽이 더 아픈가?'],
      meaning: ['의미가 없다고 느끼는 자네는, 의미가 무엇이어야 한다고 믿고 있었나?'],
      relation: ['자네는 그 사람에게서 무엇을 바라는가? 그걸 알면 서운함의 이름도 알게 될 걸세.'],
      tired: ['지친 이유를 하나만 꼽는다면 무엇인가? 하나씩 따져 보면 생각보다 가벼울 수도 있네.'],
      joy: ['좋았다니 반갑네. 그런데 그 좋음은 커피 덕인가, 자네가 천천히 마신 덕인가?'],
      default: ['흥미롭군. 자네는 왜 그렇게 생각하는가?', '그 말을 조금만 더 풀어 주겠나? 자네가 정말 묻고 싶은 게 뭔지 궁금하네.']
    },
    ni: {
      work: ['묻힌 것은 아이디어요, 그대가 아니오. 다시 꺼낼 배짱이 있다면 그것이 그대의 것이오.', '남의 박수로 재는 생각은 남의 것이 되오. 그대가 아직 그것을 믿는지만 보시오.'],
      meaning: ['의미는 발견하는 게 아니라 만들어 내는 것이오. 오늘 무엇을 만들겠소?'],
      relation: ['모두에게 이해받으려는 자는 아무에게도 깊어지지 못하오.'],
      tired: ['쉬는 것도 넘어서는 일의 일부요. 잘 쉬는 자만 다시 오르오.'],
      joy: ['그 기쁨을 의심하지 마시오. 다시 살아도 좋을 순간이란 바로 그런 것이오.'],
      default: ['좋소. 그 생각을 끝까지 밀어붙여 보시오.', '그 말 속에 그대가 원하는 것이 숨어 있소. 그것부터 꺼내 보시오.']
    },
    sh: {
      work: ['남의 반응에 기대를 거는 만큼 실망도 커집니다. 기대를 조금 낮추면 아이디어도 당신도 덜 다칩니다.'],
      meaning: ['삶이 의미로 가득해야 한다는 기대가 오히려 고통을 만듭니다. 작은 위안을 귀하게 여기십시오.'],
      relation: ['사람은 고슴도치와 같아서, 너무 가까우면 찔리고 멀면 춥지요. 알맞은 거리를 찾으십시오.'],
      tired: ['피로는 쉬라는 신호입니다. 오늘은 음악을 한 곡 들어 보십시오.'],
      joy: ['좋은 순간은 짧습니다. 그러니 지금 충분히 누리십시오.'],
      default: ['흥미로운 말씀입니다. 다만 너무 많은 것을 바라지는 마십시오.', '그 생각을 붙잡고 있는 이유가 있겠지요. 천천히 들려주십시오.']
    },
    ca: {
      work: ['묻혔다고 끝난 건 아니에요. 오늘은 그 생각을 한 번 더 굴려 봐요. 바위를 미는 것처럼요.'],
      meaning: ['의미가 없다는 걸 알고도 오늘을 사는 것, 그게 제가 아는 가장 멋진 반항이에요.'],
      relation: ['그 사람과 같이 걸어 보는 건 어때요? 말보다 걸음이 먼저 풀어 줄 때가 있어요.'],
      tired: ['오늘은 햇볕을 좀 쬐요. 생각은 그다음에 해도 늦지 않아요.'],
      joy: ['좋네요! 그런 순간을 모아 두면, 그게 삶이에요.'],
      default: ['그 얘기 더 해 줘요. 오늘 하늘은 어땠어요?', '좋아요. 거창하지 않아도 돼요, 오늘 있었던 일부터요.']
    },
    ci: {
      work: ['말하고 나서 후회하는 건, 말할 만한 걸 말했다는 뜻이기도 해요.'],
      meaning: ['의미가 없다는 걸 알면, 적어도 속을 일은 없지요.'],
      relation: ['가까운 사람일수록 침묵이 길어지죠. 그 침묵도 대화예요.'],
      tired: ['잠 못 드는 밤에 떠오른 생각은, 아침에 한 번 더 의심하세요.'],
      joy: ['기쁨을 의심하지 않는 날은 드물어요. 오늘은 의심하지 마세요.'],
      default: ['그 생각, 밤에 다시 해 봐요. 다르게 보일 거예요.', '확신이 없다는 건 아직 정직하다는 뜻이에요.']
    },
    au: {
      work: ['그들이 어떻게 받아들일지는 당신 손에 없습니다. 당신 손에 있는 건 다음 제안을 더 다듬는 일입니다.'],
      meaning: ['오늘 맡은 일을 성실히 하는 것, 그것으로 충분합니다.'],
      relation: ['남의 잘못을 마주하면 먼저 같은 잘못을 한 적이 없는지 돌아보세요.'],
      tired: ['지친 몸을 탓하지 마세요. 오늘 할 수 있는 만큼이 오늘의 몫입니다.'],
      joy: ['좋은 것을 알아보는 눈, 그것도 덕입니다.'],
      default: ['그 일에서 당신 손에 달린 것은 무엇입니까?', '하나만 고르세요. 나머지는 내려놓아도 됩니다.']
    }
  },
  en: {
    so: {
      work: ['When you say you spoke for nothing, by whose measure is it nothing? Let us examine it together.', 'Whether the idea was good and whether it was accepted are different questions. Which one stings more?'],
      meaning: ['You feel nothing has meaning. What did you believe meaning had to be?'],
      relation: ['What do you want from that person? Once you know, you will know the name of your disappointment.'],
      tired: ['If you had to name one reason you are tired, what would it be? Examined one by one, it may weigh less.'],
      joy: ['Glad to hear it. But was the good in the coffee, or in how slowly you drank it?'],
      default: ['Interesting. Why do you think so?', 'Could you say a little more? I wonder what you really want to ask.']
    },
    ni: {
      work: ['What got buried was the idea, not you. If you dare to raise it again, it is yours.', 'A thought measured by applause becomes theirs. See only whether you still believe in it.'],
      meaning: ['Meaning is not found; it is made. What will you make today?'],
      relation: ['Whoever wants to be understood by everyone grows deep with no one.'],
      tired: ['Rest is part of overcoming. Only those who rest well climb again.'],
      joy: ['Do not doubt that joy. A moment worth living again looks exactly like that.'],
      default: ['Good. Push that thought to its end.', 'What you want is hiding in those words. Draw it out first.']
    },
    sh: {
      work: ['The more you stake on others, the greater the disappointment. Expect a little less, and both you and the idea get hurt less.'],
      meaning: ['Expecting life to be full of meaning is what makes it painful. Treasure the small consolations.'],
      relation: ['People are like porcupines: too close and they prick, too far and they are cold. Find the right distance.'],
      tired: ['Fatigue is a signal to rest. Listen to one piece of music today.'],
      joy: ['Good moments are brief. So enjoy this one fully.'],
      default: ['An interesting remark. Only, do not hope for too much.', 'You must have reasons for holding on to that thought. Tell me slowly.']
    },
    ca: {
      work: ['Buried does not mean finished. Roll that thought once more today, like pushing the rock.'],
      meaning: ['To know there is no meaning and still live today: that is the finest revolt I know.'],
      relation: ['Why not take a walk together? Sometimes steps untangle things before words do.'],
      tired: ['Get some sun today. Thinking can wait.'],
      joy: ['Lovely! Collect moments like that. That is what a life is.'],
      default: ['Tell me more. How was the sky today?', 'Good. No need to be grand. Start with what happened today.']
    },
    ci: {
      work: ['Regretting what you said can also mean it was worth saying.'],
      meaning: ['Once you know there is no meaning, at least you cannot be fooled.'],
      relation: ['The closer someone is, the longer the silences. Silence is conversation too.'],
      tired: ['Thoughts that come on sleepless nights deserve one more doubt in the morning.'],
      joy: ['Days without doubting joy are rare. Do not doubt it today.'],
      default: ['Think it again at night. It will look different.', 'Being unsure means you are still honest.']
    },
    au: {
      work: ['How they receive it is not up to you. What is up to you is refining your next proposal.'],
      meaning: ['Doing today’s work faithfully is enough.'],
      relation: ['When you face someone’s fault, first ask whether you have never made the same one.'],
      tired: ['Do not blame a tired body. What you can do today is today’s share.'],
      joy: ['An eye that recognizes the good is a virtue too.'],
      default: ['In this matter, what is up to you?', 'Choose one thing. You may set down the rest.']
    }
  }
};

const CATS = [
  ['work', /회의|아이디어|회사|직장|상사|업무|프로젝트|야근|출근|퇴사|팀장|발표|일이|일을|일은|meeting|idea|work|job|boss|project|office/i],
  ['meaning', /의미|허무|공허|소용|무의미|헛되|왜 살|meaning|pointless|empty|nihil/i],
  ['relation', /친구|사랑|연애|가족|관계|사람들|엄마|아빠|동료|외로|friend|love|family|relationship|lonely/i],
  ['tired', /피곤|지쳐|지친|힘들|번아웃|잠이|못 자|불면|쉬고|tired|exhausted|burn|sleep|rest/i],
  ['joy', /좋았|맛있|행복|기뻐|기분 좋|설레|좋은 일|great|happy|delicious|glad|good day/i]
];
const SUGGEST = {
  work: ['ni', 'ca', 'au'], meaning: ['ci', 'ca', 'ni'], relation: ['sh', 'ca', 'so'],
  tired: ['au', 'ci', 'ca'], joy: ['ca', 'sh', 'ni'], default: ['so', 'ni', 'ca']
};
const HOMES = [
  ['B', '말 걸기 먼저', 'Talk first', '이야기를 쓰면 할 말이 있는 철학자를 골라 드려요. 아래에 하던 대화가 이어져요.', 'Write what is on your mind and the right philosophers are suggested. Ongoing chats follow below.'],
  ['G', '한 줄 말 걸기', 'One-line start', '맨 위 한 줄로 말을 걸고, 아래는 익숙한 대화 목록이에요.', 'Start with a single line at the top. A familiar chat list follows.'],
  ['D', '목록 먼저', 'List first', '검색, 거르기, 대화 목록이 먼저예요. 새 대화는 오른쪽 아래 버튼으로.', 'Search, filters and the chat list come first. New chats from the corner button.'],
  ['E', '한 마디 띠', 'Today strip', '위에 철학자들의 오늘의 한 마디가 떠 있고, 대화와 먼저 건넨 말을 나눠 봐요.', 'Today’s one-liners float on top, with chats and first messages in separate tabs.'],
  ['F', '묶음 목록', 'Grouped', '바로가기와 단톡방·개인톡 묶음으로 한눈에 봐요. 방이 많을수록 편해요.', 'Shortcuts plus grouped group chats and direct chats. Best when you have many rooms.']
];
// 내부 키(B·G·D·E·F)는 시안을 만든 순서대로 붙인 이름이고, 화면·보드 이름에는 A~E로 보인다.
const HOME_LETTER = { B: 'A', G: 'B', D: 'C', E: 'D', F: 'E' };
const COVERS = [
  ['lamp', '등불', 'Lamp', 'var(--lampsoft)'], ['dawn', '새벽', 'Dawn', 'var(--psoft)'],
  ['mist', '안개', 'Mist', 'var(--sunken)'], ['night', '밤', 'Night', 'var(--night)']
];
const INTERESTS = [['음악', 'Music'], ['일', 'Work'], ['삶의 의미', 'Meaning of life'], ['일상', 'Everyday life'], ['사람과 관계', 'People'], ['변화', 'Change']];
const DAYS = [['월', 'Mon', '12'], ['화', 'Tue', '13'], ['수', 'Wed', '14'], ['목', 'Thu', '15'], ['금', 'Fri', '16'], ['토', 'Sat', '17'], ['일', 'Sun', '18']];
const NOTE_DAY = { '14': ['오늘 · 10월 14일 수요일', 'Today · Wed, Oct 14'], '13': ['어제 · 10월 13일 화요일', 'Yesterday · Tue, Oct 13'], '12': ['10월 12일 월요일', 'Mon, Oct 12'] };
const MSG_DAY = { today: ['오늘', 'Today'], yday: ['어제', 'Yesterday'], '1012': ['10월 12일', 'Oct 12'], '1011': ['10월 11일', 'Oct 11'] };
const ARCH_DAY = { '1014': ['오늘 · 10월 14일 수요일', 'Today · Wed, Oct 14'], '1012': ['10월 12일 월요일', 'Mon, Oct 12'], '1002': ['10월 2일 금요일', 'Fri, Oct 2'] };

function hasJong(w) {
  if (!w) return false;
  const c = w.charCodeAt(w.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return false;
  return (c - 0xac00) % 28 !== 0;
}
function josa(w, a, b) { return w + (hasJong(w) ? a : b); }
function catOf(t) {
  for (const pair of CATS) if (pair[1].test(t)) return pair[0];
  return 'default';
}
function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}
function sw(on) {
  return on
    ? { on: true, track: 'background: var(--primary);', knob: 'left: 24px; background: var(--onprimary);' }
    : { on: false, track: 'background: var(--line2);', knob: 'left: 4px; background: var(--knoboff);' };
}
const CHIP_ON = 'background: var(--psoft); color: var(--pink); box-shadow: none; font-weight: 700;';
const CHIP_OFF = 'background: var(--surface); color: var(--ink2); box-shadow: inset 0 0 0 1px var(--line); font-weight: 600;';
const SEG_ON = 'background: var(--sel); color: var(--ink); box-shadow: 0 1px 2px var(--segshadow);';
const SEG_OFF = 'background: transparent; color: var(--ink2); box-shadow: none;';
const DARK_ON = 'background: var(--ink); color: var(--bg);';
const DARK_OFF = 'background: var(--sunken); color: var(--ink2);';
const RING_ON = 'box-shadow: inset 0 0 0 1.5px var(--primary);';
const RING_OFF = 'box-shadow: inset 0 0 0 1px var(--line);';

function initRooms() {
  return [
    {
      id: 'nihil', kind: 'group', title: '허무에 대하여', members: ['ci', 'ca', 'ni'], unread: 0, sort: 50, auto: 'context', notify: 'all', toFeed: true, debate: 'some', depth: 'balanced', aiLang: 'app', engine: 'device',
      msgs: [
        { id: 1, from: 'me', text: '열심히 하는데 왜 이렇게 공허하지?', day: '1012', min: 1385 },
        { id: 2, from: 'ni', text: '남이 정해 준 목표라면 이뤄도 공허하오.', day: '1012', min: 1400 },
        { id: 3, from: 'me', text: '요즘 다 의미 없게 느껴져. 열심히 해도 결과가 없으면 무슨 소용이지?', day: 'today', min: 500 },
        { id: 4, from: 'ni', text: '결과로 노력을 재는 순간, 노력은 남의 저울에 올라가오.', day: 'today', min: 502 },
        { id: 5, from: 'ca', text: '그래도 오늘 결과 없이 끝까지 한 당신이 있잖아요.', day: 'today', min: 504 }
      ]
    },
    {
      id: 'nish', kind: 'group', title: '', members: ['ni', 'sh'], unread: 2, sort: 49, auto: 'context', notify: 'all', toFeed: true, debate: 'some', depth: 'balanced', aiLang: 'app', engine: 'device',
      msgs: [
        { id: 6, from: 'me', text: '오늘 커피가 유난히 맛있어.', day: 'today', min: 520 },
        { id: 7, from: 'sh', text: '좋은 커피는 드물지요. 오늘은 운이 좋으셨습니다.', day: 'today', min: 523 },
        { id: 8, from: 'ni', to: 'sh', text: '운이 아니오. 오늘 당신에게 맛을 볼 여유가 있었던 거요.', day: 'today', min: 526 }
      ]
    },
    {
      id: 'dm-ca', kind: 'dm', title: '', members: ['ca'], unread: 0, sort: 48, firstContact: true, notify: 'all', toFeed: true, aiLang: 'app', engine: 'device',
      msgs: [{ id: 9, from: 'ca', text: '오늘 산책은 어땠어요? 아까 하늘 얘기가 생각나서요.', day: 'yday', min: 1150, first: true }]
    },
    {
      id: 'dm-au', kind: 'dm', title: '', members: ['au'], unread: 0, sort: 47, notify: 'all', toFeed: true, aiLang: 'app', engine: 'device',
      msgs: [
        { id: 10, from: 'me', text: '아침마다 할 일이 너무 많아서 정신이 없어.', day: 'yday', min: 460 },
        { id: 11, from: 'au', text: '그중 당신 손에 달린 것만 고르십시오. 나머지는 내려놓아도 됩니다.', day: 'yday', min: 461 },
        { id: 12, from: 'au', text: '아침에 정한 한 가지, 지켰나요?', day: 'yday', min: 1260 }
      ]
    },
    {
      id: 'dm-so', kind: 'dm', title: '', members: ['so'], unread: 0, sort: 46, notify: 'all', toFeed: true, aiLang: 'app', engine: 'device',
      msgs: [
        { id: 13, from: 'me', text: '그냥 좋은 삶을 살고 싶어.', day: '1012', min: 1321 },
        { id: 14, from: 'so', text: '그럼 자네가 말하는 ‘좋은 삶’이란 무엇인가?', day: '1012', min: 1322 }
      ]
    },
    {
      id: 'dm-ni', kind: 'dm', title: '', members: ['ni'], unread: 0, sort: 45, notify: 'all', toFeed: true, aiLang: 'app', engine: 'device',
      msgs: [
        { id: 15, from: 'me', text: '회사를 그만둘지 고민 중이야.', day: '1011', min: 1392 },
        { id: 16, from: 'ni', text: '‘해야 한다’와 ‘하고 싶다’, 오늘은 어느 쪽이 더 컸소?', day: '1011', min: 1393 }
      ]
    }
  ];
}
function initNotes() {
  return [
    {
      id: 'n1', title: '성취와 삶의 의미', kind: 'talk', day: '14', min: 511, access: [],
      paras: ['니체·쇼펜하우어와 나눈 대화에서 정리했어요.', '노력의 결과가 없을 때, 그 노력은 무엇으로 남는가. 결과로 노력을 재면 노력은 늘 빚이 된다는 말이 오래 남았다.'],
      memos: []
    },
    {
      id: 'n2', title: '오늘 떠오른 질문', kind: 'own', day: '13', min: 1300, access: ['ca'],
      paras: ['좋아하는 일을 하면서도 지루할 수 있을까?'], memos: [], scheduled: { pid: 'ca', min: 900 }
    },
    {
      id: 'n3', title: '빗속에서 만난 유재하', kind: 'own', day: '13', min: 492, access: ['ni', 'sh'], unseen: 2,
      paras: [
        [{ t: '출근길에 비가 내렸다. 버스 창에 맺힌 빗방울을 보다가, 이어폰에서 오랜만에 유재하가 흘러나왔다.' }],
        [{ t: '오랜만에 듣는 그의 목소리가 더 깊고 묵직하다.', mark: 'ni', num: 1 }, { t: ' 같은 노래인데 첫 소절에서 한참을 멈춰 있었다.' }],
        [{ t: '가사는 하나도 바뀌지 않았는데, ' }, { t: '스무 살에 듣던 것과 다르게 들린다.', mark: 'sh', num: 2 }],
        [{ t: '회사 앞에 내렸을 때 비는 그쳐 있었다. 노래가 조금 더 길었으면 했다.' }]
      ],
      memos: [
        { id: 'm1', pid: 'ni', num: 1, min: 130, quote: '오랜만에 듣는 그의 목소리가 더 깊고 묵직하다.', text: '목소리가 무거워진 게 아니라 당신이 무거워진 것이오. 그 무게가 싫지 않았다면 좋은 징조요.', replies: [] },
        { id: 'm2', pid: 'sh', num: 2, min: 220, quote: '스무 살에 듣던 것과 다르게 들린다.', text: '음악은 늙지 않습니다. 듣는 쪽이 늙을 뿐이지요. 스무 살의 당신은 선율을 들었고, 오늘의 당신은 그 아래에 흐르는 것을 들은 겁니다.', replies: [{ text: '스무 살의 나는 이 노래를 슬프게만 들었는데.', min: 520 }] }
      ]
    },
    {
      id: 'n4', title: '좋은 삶이란', kind: 'talk', day: '12', min: 1340, access: [],
      paras: ['소크라테스와 나눈 개인톡에서 정리했어요.', '좋은 삶이 뭔지 아직 모르겠다. 다만 남이 정해 준 답은 아닌 것 같다.'], memos: []
    }
  ];
}
function initMemories() {
  return [
    { id: 'mm1', kind: 'guess', src: ['단톡방 ‘니체 · 쇼펜하우어’ 대화에서 추정', 'Guessed from the group chat ‘Nietzsche · Schopenhauer’'], text: '스무 살 무렵을 자주 떠올리는 편일 수 있다', pids: ['ni', 'sh'], scope: ['확인 전엔 쓰지 않아요', 'Not used until you confirm'], active: true },
    { id: 'mm2', kind: 'said', src: ['니체 개인톡 · 10월 11일', 'Direct chat with Nietzsche · Oct 11'], text: '회사를 그만둘지 고민 중이다', pids: ['ni'], scope: ['니체 개인톡에서만 써요 · 니체만 알아요', 'Used only with Nietzsche · only he knows'], active: true, private: true },
    { id: 'mm3', kind: 'note', src: ['‘빗속에서 만난 유재하’ · 10월 13일', 'Note ‘빗속에서 만난 유재하’ · Oct 13'], text: '유재하의 노래를 좋아한다', pids: ['ni', 'sh'], scope: ['니체·쇼펜하우어만 써요 (읽기를 허락한 노트)', 'Only Nietzsche and Schopenhauer (allowed readers)'], active: true },
    { id: 'mm4', kind: 'said', src: ['단톡방 ‘니체 · 쇼펜하우어’ · 오늘', 'Group chat ‘Nietzsche · Schopenhauer’ · Today'], text: '아침 커피를 천천히 마신다', pids: ['ni', 'sh'], scope: ['이 방에서만 써요', 'Used only in that room'], active: true },
    { id: 'mm5', kind: 'said', src: ['소크라테스 개인톡 · 10월 12일', 'Direct chat with Socrates · Oct 12'], text: '좋은 삶이 뭔지 아직 모르겠다고 했다', pids: ['so'], scope: ['소크라테스 개인톡에서만 써요', 'Used only with Socrates'], active: false }
  ];
}
const ARCHIVE = [
  { id: 'a1', day: '1014', kind: 'reflection', pid: 'sh', min: 390, title: '권태에 대하여', text: '원하던 것을 얻은 다음 날 아침은 이상하게 조용합니다. 그 조용함을 견디는 법을 우리는 배운 적이 없지요.', origin: ['단톡방 ‘니체 · 쇼펜하우어’에서 시작', 'Started in ‘Nietzsche · Schopenhauer’'], comments: 0 },
  { id: 'a2', day: '1014', kind: 'memo', pids: ['ni', 'sh'], noteId: 'n3', text: ['니체·쇼펜하우어가 ‘빗속에서 만난 유재하’에 여백 메모를 남겼어요', 'Nietzsche and Schopenhauer left margin notes on ‘빗속에서 만난 유재하’'] },
  { id: 'a3', day: '1012', kind: 'reflection', pid: 'ni', min: 1420, title: '남이 준 목표는 이뤄도 남의 것이다', text: '결과로 노력을 재는 사람은 언제나 빚진 채로 산다. 결과가 오지 않으면 노력은 손해가 되고, 결과가 오면 곧 다음 결과가 그 자리를 차지한다.', origin: ['‘허무에 대하여’ 방에서 시작', 'Started in ‘허무에 대하여’'], quotes: 1, comments: 2 },
  { id: 'a4', day: '1002', kind: 'reflection', pid: 'ci', min: 130, title: '확신 없는 날의 정직함', text: '확신은 대개 피곤한 사람이 고르는 지름길이다. 모른다고 말할 힘이 남아 있는 날, 우리는 조금 더 정직하다.', origin: ['시오랑 개인톡에서 시작', 'Started in a direct chat with Cioran'], comments: 0 }
];

// ---------- 나에 대해: 내가 쓴 자기소개 파일(MD·TXT) ----------
// 넣을 때 한 번만 대목으로 나누고 꼬리표를 붙인다. 대화할 때는 이어지는 대목 하나만 꺼내 본다.
const ABOUT_MAX = 60000;
const SEC_CATS = [
  ['work', /회사|직장|직업|하는 일|업무|프로젝트|야근|출근|퇴사|팀장|상사|편집|마감|사업|창업|프리랜서|(?:^|[^가-힣])일(?:이|을|은|해|하)|\bwork|\bjobs?\b|career|office|\bboss\b|project|deadline|editor/i],
  ['meaning', /의미|허무|공허|소용|무의미|헛되|왜 사|meaning|pointless|empty|purpose/i],
  ['relation', /친구|사랑|연애|가족|관계|엄마|아빠|부모|동생|언니|누나|오빠|동료|외로|friend|\blove|family|relationship|lonely|sibling|parent/i],
  ['tired', /피곤|지쳐|지친|힘들|번아웃|잠이|못 자|불면|쉬고|쉬는|쉬었|쉼|tired|exhausted|burn ?out|sleep|\brest(?:ing|ed)?\b/i],
  ['joy', /좋았|맛있|행복|기뻐|기분 좋|설레|좋은 일|great|happy|delicious|glad|\bjoy/i]
];
const SEC_NOW = /요즘|최근|지금|현재|올해|these days|lately|currently|recently|right now|this year/i;
const SEC_BASIC = /태어|자랐|이름|부르|고향|born|grew up|call me|hometown|\bname\b/i;
const SEC_WISH = /바라는|바람|원하는|해 ?줬으면|hope|wish|would like|prefer/i;
const SEC_QUIET = /꺼내지 않|말하지 않|모른 척|비밀|don.t bring|do not bring|private|secret|please don/i;
const TAG_L = { work: ['일', 'Work'], meaning: ['의미', 'Meaning'], relation: ['관계', 'People'], tired: ['쉼', 'Rest'], joy: ['기쁨', 'Joy'], basic: ['기본', 'Basics'], now: ['요즘', 'Now'], wish: ['바람', 'Wishes'] };
const SCOPES = [
  ['all', '모두 참고', 'Everyone', '단톡방·개인톡 어디서든, 이어지는 이야기가 나오면 써요', 'Anywhere, whenever the talk connects to it'],
  ['pick', '고른 철학자만', 'Chosen philosophers', '고른 철학자만 이 대목을 알아요', 'Only the philosophers you pick know it'],
  ['dm', '개인톡에서만', 'Direct chats only', '단톡방에서는 꺼내지 않아요', 'Never brought up in group chats'],
  ['quiet', '알고만 있기', 'Know, don’t bring up', '먼저 꺼내지 않아요. 내가 말하면 알고 있는 채로 들어요', 'Never brought up first. They just know when you raise it'],
  ['off', '쓰지 않기', 'Don’t use', '어떤 철학자도 이 대목을 참고하지 않아요', 'No philosopher uses this section']
];
const ABOUT_STEP_L = [['대목 나누기', 'Split into sections'], ['꼬리표 붙이기', 'Tag the topics'], ['기억 후보 찾기', 'Find memory candidates']];
const ABOUT_STEP_ING = [['대목 나누는 중', 'splitting into sections'], ['꼬리표 붙이는 중', 'tagging topics'], ['기억 후보 찾는 중', 'finding memory candidates']];
const ABOUT_SAMPLE = {
  ko: {
    name: '나에 대해.md',
    text: [
      '# 나에 대해', '',
      '## 부르는 이름', '지우. 편하게 불러 줘.', '',
      '## 태어난 해·자란 곳', '1994년 3월 9일에 태어났다. 바다가 보이는 작은 도시에서 자랐고, 스무 살에 서울로 올라왔다.', '',
      '## 하는 일', '출판사에서 7년째 책을 만드는 편집자다. 남의 문장을 다듬는 일은 좋아하지만, 마감이 몰리면 내 생각을 할 틈이 없다.', '',
      '## 지나온 길', '대학에선 철학 수업을 몇 개 들었고, 대부분의 시간은 음악을 들으며 보냈다. 스물여섯에 첫 회사를 그만두고 반년을 쉬었는데, 그때가 가장 불안하고 가장 자유로웠다.', '',
      '## 요즘 고민', '회사를 나와 혼자 일해 볼지 고민하고 있다. 열심히 하는데도 공허할 때가 많다. 쉬는 법을 잘 모르겠다.', '',
      '## 소중한 사람', '동생과 자주 통화한다. 오래된 친구 둘과 한 달에 한 번 저녁을 먹는다.', '',
      '## 꺼내지 않았으면 하는 이야기', '가족 이야기는 내가 먼저 꺼낼 때만 해 줬으면 좋겠다.', '',
      '## 철학자들에게 바라는 것', '충고보다 질문을 해 줬으면. 말은 편하게 해도 괜찮다.'
    ].join('\n')
  },
  en: {
    name: 'about-me.md',
    text: [
      '# About me', '',
      '## What to call me', 'Jiwoo. Casual is fine.', '',
      '## Born and raised', 'Born on March 9, 1994. Grew up in a small town by the sea and moved to Seoul at twenty.', '',
      '## Work', 'I have been a book editor at a publisher for seven years. I like polishing other people’s sentences, but near deadlines I have no room for my own thoughts.', '',
      '## The road so far', 'I took a few philosophy classes in college and spent most of the time listening to music. At twenty-six I quit my first job and rested for half a year — the most anxious and the freest I have been.', '',
      '## These days', 'I am wondering whether to leave the company and work on my own. I often feel empty even when I work hard. I don’t really know how to rest.', '',
      '## People who matter', 'I call my younger sibling often. I have dinner with two old friends once a month.', '',
      '## Please don’t bring up', 'Family — only when I bring it up first.', '',
      '## What I hope for from the philosophers', 'Questions rather than advice. Casual speech is fine.'
    ].join('\n')
  }
};
const ABOUT_TEMPLATE = {
  ko: '## 부르는 이름\n\n\n## 태어난 해·자란 곳\n\n\n## 하는 일\n\n\n## 지나온 길\n\n\n## 요즘 고민\n\n\n## 소중한 사람\n\n\n## 꺼내지 않았으면 하는 이야기\n\n\n## 철학자들에게 바라는 것\n\n',
  en: '## What to call me\n\n\n## Born and raised\n\n\n## Work\n\n\n## The road so far\n\n\n## These days\n\n\n## People who matter\n\n\n## Please don’t bring up\n\n\n## What I hope for from the philosophers\n\n'
};
// 파일에 적힌 바람은 명령으로 따르지 않고, 설정을 바꿀지 먼저 묻는다.
const SET_COPY = {
  birthday: { field: 'birthday', val: '1994-03-09', text: ['생일 3월 9일', 'Birthday: March 9'], sub: ['내 프로필 생일에 넣으면 그날 철학자들이 먼저 축하를 건네요', 'Add it to your profile and they’ll greet you on the day'], done: ['생일을 3월 9일로 넣었어요', 'Birthday set to March 9'] },
  honor: { field: 'honor', val: 'casual', text: ['말 높이 ‘모두 편하게’', 'Formality: all casual'], sub: ['파일에 적은 바람은 그대로 따르지 않고, 설정으로 바꿀지 먼저 물어봐요', 'Wishes in the file are not taken as commands; you are asked first'], done: ['말 높이를 ‘모두 편하게’로 바꿨어요', 'Formality set to all casual'] }
};
const ABOUT_SAMPLE_CANDS = {
  ko: [
    { sec: '태어난 해·자란 곳', kind: 'set', copy: 'birthday' },
    { sec: '태어난 해·자란 곳', kind: 'fact', text: '1994년에 태어나 바닷가 작은 도시에서 자랐다', age: true },
    { sec: '하는 일', kind: 'fact', text: '출판사에서 7년째 편집자로 일한다' },
    { sec: '요즘 고민', kind: 'fact', text: '회사를 나와 혼자 일해 볼지 고민 중이다', dated: true },
    { sec: '요즘 고민', kind: 'fact', text: '쉬는 법을 잘 모르겠다고 했다', dated: true },
    { sec: '소중한 사람', kind: 'fact', text: '동생과 자주 통화한다' },
    { sec: '철학자들에게 바라는 것', kind: 'fact', text: '충고보다 질문을 좋아한다' },
    { sec: '철학자들에게 바라는 것', kind: 'set', copy: 'honor' }
  ],
  en: [
    { sec: 'Born and raised', kind: 'set', copy: 'birthday' },
    { sec: 'Born and raised', kind: 'fact', text: 'Born in 1994 and grew up in a small town by the sea', age: true },
    { sec: 'Work', kind: 'fact', text: 'Has worked as a book editor for seven years' },
    { sec: 'These days', kind: 'fact', text: 'Is thinking about leaving the company to work alone', dated: true },
    { sec: 'These days', kind: 'fact', text: 'Said they don’t really know how to rest', dated: true },
    { sec: 'People who matter', kind: 'fact', text: 'Calls their younger sibling often' },
    { sec: 'What I hope for from the philosophers', kind: 'fact', text: 'Prefers questions to advice' },
    { sec: 'What I hope for from the philosophers', kind: 'set', copy: 'honor' }
  ]
};
const ABOUT_LINES = {
  ko: {
    so: '자네가 ‘{s}’에 적어 둔 걸 기억하네. 그때의 자네와 지금의 자네는 무엇이 다른가?',
    ni: '‘{s}’에 적어 둔 걸 읽었소. 오늘 한 말과 이어져 있구려. 당신이 정말 원하는 쪽은 어느 쪽이오?',
    sh: '‘{s}’에 쓰신 대목이 생각납니다. 그때와 지금, 무엇이 달라졌습니까?',
    ca: '‘{s}’에 적어 둔 이야기, 기억하고 있어요. 그 일이 요즘도 무겁나요?',
    ci: '‘{s}’에 적어 둔 걸 보면, 당신은 오래전부터 이 질문을 들고 다녔군요.',
    au: '‘{s}’에 쓰신 것을 떠올립니다. 그중 오늘 당신 손에 달린 것은 무엇입니까?'
  },
  en: {
    so: 'I remember what you wrote under ‘{s}’. What differs between the you of then and the you of now?',
    ni: 'I read what you wrote under ‘{s}’. It is tied to what you said today. Which side do you truly want?',
    sh: 'I recall your section ‘{s}’. What has changed since you wrote it?',
    ca: 'I remember what you wrote under ‘{s}’. Does it still weigh on you these days?',
    ci: 'Judging by what you wrote under ‘{s}’, you have carried this question for a long time.',
    au: 'I recall what you wrote under ‘{s}’. Of all that, what is in your hands today?'
  }
};
function firstSentence(t) {
  const s = String(t || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const m = s.match(/^.+?[.!?。](?=\s|$)/);
  let f = (m ? m[0] : s).replace(/[.。]$/, '');
  if (f.length > 60) f = f.slice(0, 58).trim() + '…';
  return f;
}
function cleanLine(l) {
  return l.replace(/^\s{0,3}(?:[-*+]\s+|\d+[.)]\s+|>\s?)/, '').replace(/\*\*|__|`/g, '').trim();
}
function shortTitle(p) {
  const s = p.replace(/\s+/g, ' ').trim();
  const f = firstSentence(s);
  if (f && f.length <= 18) return f;
  if (s.length <= 16) return s;
  const cut = s.slice(0, 16);
  const sp = cut.lastIndexOf(' ');
  return (sp >= 6 ? cut.slice(0, sp) : cut.slice(0, 14)).trim() + '…';
}
// 제목(#)마다 대목이 된다. 제목이 없으면 문단마다 대목이 된다.
function parseAbout(text, fallbackTitle, leadTitle) {
  const lines = String(text || '').split('\n');
  let title = '';
  const secs = [];
  const lead = [];
  let cur = null;
  for (const raw of lines) {
    const h = raw.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (h) {
      const t = cleanLine(h[2]);
      if (h[1].length === 1 && !title && !secs.length) { title = t; continue; }
      cur = { title: t, lines: [] };
      secs.push(cur);
      continue;
    }
    if (cur) cur.lines.push(cleanLine(raw)); else lead.push(cleanLine(raw));
  }
  const join = (arr) => arr.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  let out;
  const leadText = join(lead);
  if (!secs.length) {
    const paras = leadText.split(/\n\s*\n/).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean);
    out = paras.slice(0, 12).map((p) => ({ title: shortTitle(p), text: p }));
    if (paras.length > 12) out[11].text += '\n' + paras.slice(12).join('\n');
  } else {
    out = secs.map((x) => ({ title: x.title, text: join(x.lines) })).filter((x) => x.text);
    if (leadText) out.unshift({ title: leadTitle || '…', text: leadText });
  }
  const seen = {};
  for (const x of out) {
    seen[x.title] = (seen[x.title] || 0) + 1;
    if (seen[x.title] > 1) x.title = x.title + ' (' + seen[x.title] + ')';
  }
  return { title: title || fallbackTitle, sections: out, headed: secs.length > 0 };
}
function tagSection(title, text) {
  const t = title + '\n' + text;
  const tags = SEC_CATS.filter((c) => c[1].test(t)).map((c) => c[0]);
  if (SEC_NOW.test(t)) tags.push('now');
  if (!tags.length && SEC_BASIC.test(t)) tags.push('basic');
  if (SEC_WISH.test(title)) tags.push('wish');
  return tags;
}
// 말 한 줄이 걸치는 갈래들(일·의미·관계·쉼·기쁨). 대목 꼬리표와 같은 기준으로 잰다.
function catsOf(t) { return SEC_CATS.filter((c) => c[1].test(t)).map((c) => c[0]); }

// ---------- 같이 읽기: 방에 보낸 자료 ----------
// 자료는 그 방 사람만 읽는다. 다른 방·피드에는 쓰지 않고, 부탁한 사유 노트만 피드로 간다.
const DOC_ASK = /이 글|그 글|이 자료|그 자료|자료|파일|읽어|읽었|대목|this (?:text|article|piece|file|essay)|the (?:text|article|piece|file|essay)|read it|you read/i;
const DOC_SAMPLE = {
  ko: {
    name: '쉼에 대한 메모.md',
    text: [
      '# 쉬는 것도 일처럼', '',
      '## 쉬는 날의 할 일 목록', '쉬는 날에도 목록을 만든다. 책 두 권, 산책 한 시간, 밀린 영화. 목록을 다 지우면 잘 쉰 것 같고, 못 지우면 쉬는 것마저 실패한 기분이 든다.', '',
      '## 쉼을 증명하고 싶은 마음', '잘 쉬었다는 걸 누군가에게 보여 주고 싶을 때가 있다. 사진을 찍고, 어디에 갔는지 적는다. 그러다 보면 쉼도 결과로 재는 일이 된다.', '',
      '## 아무것도 하지 않는 연습', '지난 일요일엔 일부러 아무 계획도 세우지 않았다. 처음 한 시간은 불안했는데, 오후쯤 창밖을 오래 보고 있는 나를 발견했다.', '',
      '## 다시 월요일', '월요일 아침, 쉬었는데도 피곤했다. 쉼이 모자랐던 걸까, 아니면 쉬는 동안에도 월요일을 걱정했던 걸까.'
    ].join('\n')
  },
  en: {
    name: 'notes-on-rest.md',
    text: [
      '# Resting like it is work', '',
      '## A to-do list for days off', 'Even on days off I make a list: two books, an hour’s walk, the films I missed. If I cross everything off I feel rested; if not, I feel I failed even at resting.', '',
      '## Wanting to prove I rested', 'Sometimes I want to show someone that I rested well. I take photos and note where I went. Then rest, too, becomes something measured by results.', '',
      '## Practising doing nothing', 'Last Sunday I made no plans on purpose. The first hour was uneasy, but by afternoon I caught myself staring out of the window for a long time.', '',
      '## Monday again', 'On Monday morning I was tired even after resting. Was the rest not enough, or was I worrying about Monday the whole time?'
    ].join('\n')
  }
};
const LANG_OF_PROP = { 한국어: 'ko', English: 'en' };
const THEME_OF_PROP = { 라이트: 'light', 다크: 'dark', 시스템: 'system' };
const TAB_OF_PROP = { 프로필: 'people', 채팅: 'chat', 피드: 'feed', 노트: 'notes' };
function homeOfProp(v) {
  if (!v) return 'B';
  const byName = HOMES.find((h) => v.indexOf(h[1]) >= 0);
  if (byName) return byName[0];
  const byLetter = Object.keys(HOME_LETTER).find((k) => HOME_LETTER[k] === v[0]);
  return byLetter || 'B';
}

class Component extends DCLogic {
  constructor(props) {
    super(props);
    const pr = props || {};
    this.seq = 1000;
    this.navSeq = 0;
    this.clock = 8 * 60 + 50;
    this.timers = new Set();
    this.lineIdx = {};
    this.drag = null;
    this.scrollEl = null;
    this.lastScrollSig = '';
    const startTab = TAB_OF_PROP[pr.startTab] || 'chat';
    this.state = {
      themePref: THEME_OF_PROP[pr.theme] || 'light', sysDark: false,
      tab: startTab, stack: [], sheet: null, toast: null,
      rooms: initRooms(), queue: [], stream: null,
      draft: '', picks: [], pickTouched: false, routeNew: false, gFocus: false,
      listQ: '', listFilter: 'all', eTab: 'talk', fOpen: { group: true, dm: true },
      roomDrafts: {}, addressTo: {}, whyOpen: {},
      me: { name: '지우', intro: '요즘 일과 쉼 사이에서 균형을 찾는 중', introShare: true, honor: 'tone', cover: 'lamp', interests: ['음악', '일', '삶의 의미'], birthday: '', photo: null },
      meDraft: null,
      hidden: [], firstOn: { so: true, ni: true, sh: true, ca: true, ci: true, au: true },
      custom: {}, gray: true, crop: null,
      memories: initMemories(), memFilter: 'all',
      notes: initNotes(), noteType: 'all', noteDay: null,
      feedSeen: startTab === 'feed', reflComments: [], requests: [], liked: false,
      archPid: 'all', archKind: 'all', archDay: null,
      set: {
        lang: LANG_OF_PROP[pr.lang] || 'ko', aiLang: 'app', home: homeOfProp(pr.home),
        feedMin: 420, feedNotify: true, chargeOnly: true, autoReflect: 'suggest', feedItems: { reactions: true, reflections: true, planned: true, chat: true },
        firstContact: true, maxPerDay: 1, quiet: 'q2', lockHide: true, scope: 'me', autoComment: 'some', appLock: false, crash: false, plus: false, wifiOnly: true
      },
      models: { active: 'base', lightPct: 42, lightPaused: false },
      reports: [],
      peopleSearch: false, peopleQ: '', searchQ: '',
      pickSel: [], noteEdit: null, memoReply: {}, memoReplyOpen: {}, memoWhy: {},
      sheetText: '', sheetPick: [], onboard: 0, exportStep: 0, scopeDraft: null
    };
    const fns = ['goBack', 'closeSheet', 'onDraft', 'onRoomDraft', 'onRoomKey', 'sendHome', 'sendRoom', 'stopHere', 'openRoute', 'openMention',
      'openPickCompose', 'openPickNew', 'pickConfirm', 'openSearch', 'onSearchQ', 'openSettings', 'openMyProfile', 'togglePeopleSearch', 'onPeopleQ',
      'onCropDown', 'onCropMove', 'onCropUp', 'onZoom', 'cropRotate', 'toggleGray', 'cropApply', 'onPickFile',
      'useSample', 'resetImage', 'recrop', 'onMeName', 'onMeIntro', 'onMeBirthday', 'onMePhoto', 'saveMe', 'cycleCover', 'toggleIntroShare',
      'openArchive', 'openAskNote', 'onSheetText', 'submitAskNote', 'submitComment', 'openComment', 'newNote', 'onEditTitle', 'onEditBody',
      'saveNote', 'setScrollEl', 'focusEl', 'toastAct', 'openMemory', 'openModels', 'openImages', 'clearNoteDay',
      'confirmOk', 'submitAccess', 'submitAskMemo', 'openRoomInfo', 'openNoteMore', 'onListQ', 'gFocusOn', 'openHomeStyle',
      'obNext', 'obSkip', 'openOnboarding', 'toggleLike', 'openArchDay', 'clearArchDay', 'submitReport', 'doExport', 'toggleMeDraftPhotoClear',
      'openAboutAdd', 'onAboutFile', 'onAboutReplace', 'useAboutSample', 'useAboutTemplate', 'saveAboutScope',
      'openDocAdd', 'onDocFile', 'useDocSample', 'submitAskDoc'];
    for (const f of fns) this[f] = this[f].bind(this);
  }

  // ---------- lifecycle ----------
  componentDidMount() {
    try {
      if (window.matchMedia) {
        this.mq = window.matchMedia('(prefers-color-scheme: dark)');
        this.setState({ sysDark: this.mq.matches });
        this.mqFn = (e) => this.setState({ sysDark: e.matches });
        if (this.mq.addEventListener) this.mq.addEventListener('change', this.mqFn);
      }
    } catch (e) { /* no media query */ }
    const ciText = '허무를 말하는 것도 결국 하나의 집착이지요. 집착할 게 남았다는 건, 아직 다 허무하진 않다는 뜻이고요.';
    this.setState({
      queue: [
        { roomId: 'nihil', pid: 'ci', to: null, text: ciText, shown: ciText.slice(0, 22) },
        { roomId: 'nihil', pid: 'ni', to: 'ci', text: '집착이라도 좋소. 아무것도 붙잡지 않는 자는 넘어설 것도 없으니.' }
      ]
    });
    this.later(() => this.pump(), 400);
    this.modelTick = setInterval(() => {
      const m = this.state.models;
      if (m.lightPaused || m.lightPct >= 100) return;
      const top = this.top();
      if (!top || top.kind !== 'models') return;
      this.setState({ models: Object.assign({}, m, { lightPct: Math.min(100, m.lightPct + 3) }) });
    }, 400);
  }
  componentWillUnmount() {
    for (const id of this.timers) clearTimeout(id);
    this.timers.clear();
    clearInterval(this.iv);
    clearInterval(this.modelTick);
    if (this.mq && this.mq.removeEventListener && this.mqFn) this.mq.removeEventListener('change', this.mqFn);
  }
  componentDidUpdate(prev) {
    const p = this.props || {};
    if (prev) {
      if (prev.theme !== p.theme && THEME_OF_PROP[p.theme]) this.setState({ themePref: THEME_OF_PROP[p.theme] });
      if (prev.lang !== p.lang && LANG_OF_PROP[p.lang]) this.setSet('lang', LANG_OF_PROP[p.lang]);
      if (prev.home !== p.home && p.home) this.setSet('home', homeOfProp(p.home));
      if (prev.startTab !== p.startTab && TAB_OF_PROP[p.startTab]) this.goTab(TAB_OF_PROP[p.startTab]);
    }
    const top = this.top();
    const el = this.scrollEl;
    if (top && top.kind === 'room' && el) {
      const room = this.roomById(top.id);
      const st = this.state.stream;
      const sig = top.id + ':' + (room ? room.msgs.length : 0) + ':' + (st && st.roomId === top.id ? st.phase + st.shown.length : '-') + ':' + this.state.queue.length;
      if (sig !== this.lastScrollSig) {
        const sameRoom = this.lastScrollSig.split(':')[0] === top.id;
        const near = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
        this.lastScrollSig = sig;
        if (!sameRoom || near || this.forceScroll) {
          el.scrollTop = el.scrollHeight;
          this.forceScroll = false;
        }
      }
    }
  }

  // ---------- language & formatting ----------
  en() { return this.state.set.lang === 'en'; }
  L(ko, en) { return this.en() ? en : ko; }
  nm(pid) { return this.en() ? P[pid].en : P[pid].name; }
  fullName(pid) { return this.en() ? P[pid].enFull : P[pid].full; }
  pf(pid, k) { return this.en() ? P[pid]['en' + k[0].toUpperCase() + k.slice(1)] : P[pid][k]; }
  names(ids) { return ids.map((p) => this.nm(p)).join(this.en() ? ', ' : '·'); }
  fmt(min) {
    const h = Math.floor(min / 60) % 24;
    const m = String(min % 60).padStart(2, '0');
    const hh = h % 12 === 0 ? 12 : h % 12;
    return this.en() ? hh + ':' + m + ' ' + (h < 12 ? 'AM' : 'PM') : (h < 12 ? '오전 ' : '오후 ') + hh + ':' + m;
  }
  dayL(k) { const d = MSG_DAY[k]; return d ? (this.en() ? d[1] : d[0]) : k; }
  feedTimeL() { const h = Math.floor(this.state.set.feedMin / 60); return this.en() ? h + ':00 AM' : '아침 ' + h + ':00'; }
  // Korean particle helpers (English text never uses them).
  ji(w) { return josa(w, '이', '가'); }
  jn(w) { return josa(w, '은', '는'); }
  jl(w) { return josa(w, '을', '를'); }

  // ---------- small utils ----------
  later(fn, ms) {
    const id = setTimeout(() => { this.timers.delete(id); fn(); }, ms);
    this.timers.add(id);
    return id;
  }
  top() { const s = this.state.stack; return s.length ? s[s.length - 1] : null; }
  screen(kind) { return this.state.stack.find((s) => s.kind === kind) || null; }
  roomById(id) { return this.state.rooms.find((r) => r.id === id) || null; }
  noteById(id) { return this.state.notes.find((n) => n.id === id) || null; }
  roomTitle(r) {
    if (!r) return '';
    if (r.kind === 'dm') return this.fullName(r.members[0]);
    return r.title || r.members.map((m) => this.nm(m)).join(' · ');
  }
  setRoom(id, fn) { this.setState({ rooms: this.state.rooms.map((r) => (r.id === id ? fn(r) : r)) }); }
  setNote(id, fn) { this.setState({ notes: this.state.notes.map((n) => (n.id === id ? fn(n) : n)) }); }
  setSet(k, v) { const s = Object.assign({}, this.state.set); s[k] = v; this.setState({ set: s }); }
  tick() { this.clock += 1; return this.clock; }
  toast(text, label, fn) {
    clearTimeout(this.toastT);
    this.setState({ toast: { text, label: label || '', fn: fn || null, k: ++this.seq } });
    this.toastT = this.later(() => this.setState({ toast: null }), label ? 4200 : 2600);
  }
  toastAct() {
    const t = this.state.toast;
    this.setState({ toast: null });
    if (t && t.fn) t.fn();
  }
  isDark() {
    const p = this.state.themePref;
    return p === 'dark' || (p === 'system' && this.state.sysDark);
  }
  undoLabel() { return this.L('되돌리기', 'Undo'); }

  // ---------- navigation ----------
  push(kind, params) {
    const st = this.state.stack;
    const i = st.findIndex((s) => s.kind === kind);
    const base = i >= 0 ? st.slice(0, i) : st.slice();
    this.setState({ stack: base.concat([Object.assign({ kind, key: ++this.navSeq }, params || {})]), sheet: null });
  }
  goBack() {
    if (this.state.sheet) { this.closeSheet(); return; }
    const top = this.top();
    if (!top) return;
    if (top.kind === 'crop') this.setState({ crop: null });
    if (top.kind === 'myProfile') this.setState({ meDraft: null });
    if (top.kind === 'noteEdit') this.setState({ noteEdit: null });
    this.setState({ stack: this.state.stack.slice(0, -1) });
  }
  goTab(tab) { this.setState({ tab, stack: [], sheet: null, feedSeen: tab === 'feed' ? true : this.state.feedSeen }); }
  openSheet(sheet) { this.setState({ sheet: Object.assign({ k: ++this.seq }, sheet), sheetText: '', sheetPick: sheet.pick || [] }); }
  closeSheet() { this.setState({ sheet: null }); }
  openSettings() { this.push('settings'); }
  openMyProfile() { this.setState({ meDraft: Object.assign({}, this.state.me) }); this.push('myProfile'); }
  openSearch() { this.setState({ searchQ: '' }); this.push('search'); }
  openArchive() { this.push('archive'); }
  openMemory() { this.push('memory'); }
  openModels() { this.push('models'); }
  openImages() { this.push('philImages'); }
  openHomeStyle() { this.push('homeStyle'); }
  openInfo(kind) { this.push('info', { info: kind }); }
  openRoomInfo() { const t = this.top(); if (t && t.kind === 'room') this.push('roomInfo', { id: t.id }); }
  openOnboarding() { this.setState({ onboard: 1 }); }
  obNext() { this.setState({ onboard: this.state.onboard >= 3 ? 0 : this.state.onboard + 1 }); }
  obSkip() { this.setState({ onboard: 0 }); }

  openRoom(id) {
    if (!this.roomById(id)) return;
    this.setRoom(id, (x) => Object.assign({}, x, { unread: 0, archived: false }));
    this.forceScroll = true;
    this.push('room', { id });
  }
  openDm(pid) {
    let r = this.state.rooms.find((x) => x.kind === 'dm' && x.members[0] === pid && !x.deleted);
    if (!r) r = this.createRoom([pid]);
    this.openRoom(r.id);
  }
  matchRoom(ids) {
    if (!ids.length) return null;
    return this.state.rooms.find((r) => !r.deleted && sameSet(r.members, ids) && (ids.length > 1 ? r.kind === 'group' : r.kind === 'dm')) || null;
  }
  createRoom(ids) {
    const base = { title: '', members: ids.slice(), unread: 0, sort: ++this.seq, notify: 'all', toFeed: true, aiLang: 'app', engine: 'device', msgs: [] };
    const r = ids.length === 1
      ? Object.assign(base, { id: 'dm-' + ids[0] + '-' + this.seq, kind: 'dm' })
      : Object.assign(base, { id: 'g' + (++this.seq), kind: 'group', auto: 'context', debate: 'some', depth: 'balanced' });
    this.setState({ rooms: this.state.rooms.concat([r]) });
    return r;
  }

  // ---------- replies: one at a time, like the on-device model ----------
  replyLang(room, text) {
    const pref = (room && room.aiLang && room.aiLang !== 'app') ? room.aiLang : this.state.set.aiLang;
    if (pref === 'ko' || pref === 'en') return pref;
    if (pref === 'msg') return /[가-힣]/.test(text) ? 'ko' : 'en';
    return this.state.set.lang;
  }
  lineFor(pid, text, lang) {
    const book = LINES[lang][pid];
    const pool = book[catOf(text)] || book.default;
    this.lineIdx[pid] = (this.lineIdx[pid] || 0) + 1;
    return pool[this.lineIdx[pid] % pool.length];
  }
  speakersFor(room) {
    const addr = this.state.addressTo[room.id];
    if (addr && room.members.indexOf(addr) >= 0) return [addr];
    if (room.kind === 'dm') return [room.members[0]];
    const ms = room.members.slice();
    const lastPhil = room.msgs.slice().reverse().find((m) => m.from !== 'me');
    let ordered = ms;
    if (lastPhil) {
      const i = ms.indexOf(lastPhil.from);
      if (i >= 0) ordered = ms.slice(i + 1).concat(ms.slice(0, i + 1));
    }
    const mode = room.auto || 'context';
    const n = mode === 'off' ? 1 : (mode === 'lively' ? Math.min(3, ms.length) : Math.min(2, ms.length));
    return ordered.slice(0, n);
  }
  enqueue(roomId, speakers, text) {
    const room = this.roomById(roomId);
    const lang = this.replyLang(room, text);
    // 첫 화자만 대목 하나를 꺼내 본다. 이 방에서 함께 읽는 자료가 먼저고, 없으면 '나에 대해'.
    const dref = this.docRefFor(room, text);
    const ref = dref ? null : this.aboutRefFor(room, text, speakers[0]);
    const jobs = speakers.map((pid, i) => {
      if (i === 0 && dref) return { roomId, pid, to: null, text: this.docFollowLine(pid, dref.sec.title, lang), ref: { kind: 'doc', roomId, docId: dref.doc.id, secId: dref.sec.id } };
      if (i === 0 && ref) return { roomId, pid, to: null, text: this.aboutLine(pid, ref.sec.title, lang), ref: { kind: 'about', noteId: ref.note.id, secId: ref.sec.id } };
      return { roomId, pid, to: i > 0 ? speakers[i - 1] : null, text: this.lineFor(pid, text, lang) };
    });
    this.setState({ queue: this.state.queue.concat(jobs) });
    this.pump();
  }
  pump() {
    if (this.state.stream || !this.state.queue.length) return;
    const job = this.state.queue[0];
    const rest = this.state.queue.slice(1);
    const room = this.roomById(job.roomId);
    if (!room || room.deleted) { this.setState({ queue: rest }); this.pump(); return; }
    const shown = job.shown || '';
    this.setState({ queue: rest, stream: Object.assign({}, job, { shown, phase: shown ? 'writing' : 'typing' }) });
    if (shown) { this.startWriting(); return; }
    clearTimeout(this.typeT);
    this.typeT = this.later(() => {
      const st = this.state.stream;
      if (!st || st.phase !== 'typing') return;
      this.setState({ stream: Object.assign({}, st, { phase: 'writing' }) });
      this.startWriting();
    }, 900 + Math.floor(Math.random() * 500));
  }
  startWriting() {
    clearInterval(this.iv);
    this.iv = setInterval(() => {
      const st = this.state.stream;
      if (!st) { clearInterval(this.iv); return; }
      const step = /[가-힣]/.test(st.text) ? 2 : 4;
      const n = Math.min(st.text.length, st.shown.length + step);
      if (n >= st.text.length) { clearInterval(this.iv); this.finish(false); return; }
      this.setState({ stream: Object.assign({}, st, { shown: st.text.slice(0, n) }) });
    }, 55);
  }
  finish(cut) {
    const st = this.state.stream;
    if (!st) return;
    const text = cut ? (st.shown.trim() ? st.shown.trim() + '…' : '') : st.text;
    const top = this.top();
    const viewing = !!(top && top.kind === 'room' && top.id === st.roomId);
    const min = this.tick();
    const rooms = this.state.rooms.map((r) => {
      if (r.id !== st.roomId || !text) return r;
      return Object.assign({}, r, {
        msgs: r.msgs.concat([{ id: ++this.seq, from: st.pid, to: st.to || null, text, day: 'today', min, cut: !!cut, ref: st.ref || null }]),
        unread: viewing ? 0 : r.unread + 1, sort: ++this.seq
      });
    });
    this.setState({ rooms, stream: null });
    this.later(() => this.pump(), cut ? 50 : 650);
  }
  stopHere() {
    const top = this.top();
    if (!top || top.kind !== 'room') return;
    clearTimeout(this.typeT);
    clearInterval(this.iv);
    this.setState({ queue: this.state.queue.filter((j) => j.roomId !== top.id) });
    if (this.state.stream && this.state.stream.roomId === top.id) this.finish(true);
  }

  // ---------- chat home ----------
  onDraft(e) {
    const draft = e.target.value;
    const patch = { draft };
    if (!this.state.pickTouched) patch.picks = draft.trim() ? SUGGEST[catOf(draft)].slice(0, 2) : [];
    this.setState(patch);
  }
  gFocusOn() { this.setState({ gFocus: true }); }
  togglePick(pid) {
    const picks = this.state.picks.indexOf(pid) >= 0 ? this.state.picks.filter((p) => p !== pid) : this.state.picks.concat([pid]);
    this.setState({ picks, pickTouched: true, routeNew: false });
  }
  openRoute() { if (this.state.picks.length) this.openSheet({ kind: 'route' }); }
  openPickCompose() { this.setState({ pickSel: this.state.picks.slice() }); this.push('pick', { mode: 'compose' }); }
  openPickNew() { this.setState({ pickSel: [] }); this.push('pick', { mode: 'new' }); }
  onListQ(e) { this.setState({ listQ: e.target.value }); }
  sendHome() {
    const s = this.state;
    const text = s.draft.trim();
    if (!text || !s.picks.length) return;
    const match = s.routeNew ? null : this.matchRoom(s.picks);
    const room = match || this.createRoom(s.picks);
    const min = this.tick();
    this.setRoom(room.id, (r) => Object.assign({}, r, { msgs: r.msgs.concat([{ id: ++this.seq, from: 'me', text, day: 'today', min }]), unread: 0, sort: ++this.seq, firstContact: false, archived: false }));
    const speakers = s.picks.slice(0, 3);
    this.setState({ draft: '', picks: [], pickTouched: false, routeNew: false, gFocus: false });
    this.openRoom(room.id);
    this.enqueue(room.id, speakers, text);
  }

  // ---------- room ----------
  onRoomDraft(e) {
    const top = this.top();
    if (!top) return;
    const d = Object.assign({}, this.state.roomDrafts);
    d[top.id] = e.target.value;
    this.setState({ roomDrafts: d });
  }
  onRoomKey(e) {
    const composing = e.nativeEvent && e.nativeEvent.isComposing;
    if (e.key === 'Enter' && !e.shiftKey && !composing) { e.preventDefault(); this.sendRoom(); }
  }
  sendRoom() {
    const top = this.top();
    if (!top || top.kind !== 'room') return;
    const room = this.roomById(top.id);
    const text = (this.state.roomDrafts[top.id] || '').trim();
    if (!room || !text) return;
    if ((this.state.stream && this.state.stream.roomId === room.id) || this.state.queue.some((j) => j.roomId === room.id)) return;
    const speakers = this.speakersFor(room);
    const min = this.tick();
    const d = Object.assign({}, this.state.roomDrafts);
    d[top.id] = '';
    const a = Object.assign({}, this.state.addressTo);
    delete a[top.id];
    this.forceScroll = true;
    this.setState({ roomDrafts: d, addressTo: a });
    this.setRoom(room.id, (r) => Object.assign({}, r, { msgs: r.msgs.concat([{ id: ++this.seq, from: 'me', text, day: 'today', min }]), sort: ++this.seq, firstContact: false }));
    this.enqueue(room.id, speakers, text);
  }
  openMention() { const t = this.top(); if (t) this.openSheet({ kind: 'mention', id: t.id }); }
  setAddress(roomId, pid) {
    const a = Object.assign({}, this.state.addressTo);
    if (pid) a[roomId] = pid; else delete a[roomId];
    this.setState({ addressTo: a, sheet: null });
  }
  setScrollEl(el) { this.scrollEl = el; }
  focusEl(el) {
    if (el && el !== this.focused) {
      this.focused = el;
      setTimeout(() => { try { el.focus(); } catch (e) { /* ignore */ } }, 80);
    }
  }
  submitReport() {
    const sh = this.state.sheet;
    const reason = this.state.sheetPick[0];
    if (!sh || !reason) return;
    const r = this.roomById(sh.id);
    this.setState({ reports: this.state.reports.concat([{ title: this.roomTitle(r), reason, min: this.tick() }]), sheet: null });
    this.toast(this.L('신고했어요 · 설정 › 신고 내역에서 볼 수 있어요', 'Reported · see Settings › Reports'));
  }

  // ---------- pick screen ----------
  pickConfirm() {
    const top = this.top();
    if (!top || top.kind !== 'pick') return;
    const sel = this.state.pickSel;
    if (top.mode === 'compose') {
      this.setState({ picks: sel.slice(), pickTouched: true, routeNew: false, stack: this.state.stack.slice(0, -1) });
      return;
    }
    if (top.mode === 'new') {
      if (!sel.length) return;
      const match = this.matchRoom(sel);
      const room = match || this.createRoom(sel);
      this.setState({ stack: this.state.stack.slice(0, -1) });
      this.openRoom(room.id);
      return;
    }
    const room = this.roomById(top.id);
    if (!room) return;
    const add = sel.filter((p) => room.members.indexOf(p) < 0);
    if (!add.length) { this.goBack(); return; }
    this.setRoom(room.id, (r) => Object.assign({}, r, { members: r.members.concat(add) }));
    this.setState({ stack: this.state.stack.slice(0, -1) });
    this.toast(this.L(this.names(add) + ' 님을 방에 불렀어요', 'Invited ' + this.names(add)));
  }
  togglePickSel(pid) {
    const sel = this.state.pickSel;
    this.setState({ pickSel: sel.indexOf(pid) >= 0 ? sel.filter((p) => p !== pid) : sel.concat([pid]) });
  }

  // ---------- search ----------
  onSearchQ(e) { this.setState({ searchQ: e.target.value }); }
  togglePeopleSearch() { this.setState({ peopleSearch: !this.state.peopleSearch, peopleQ: '' }); }
  onPeopleQ(e) { this.setState({ peopleQ: e.target.value }); }

  // ---------- my profile ----------
  patchMe(p) { this.setState({ meDraft: Object.assign({}, this.state.meDraft || this.state.me, p) }); }
  onMeName(e) { this.patchMe({ name: e.target.value }); }
  onMeIntro(e) { this.patchMe({ intro: e.target.value }); }
  onMeBirthday(e) { this.patchMe({ birthday: e.target.value }); }
  toggleIntroShare() { const m = this.state.meDraft || this.state.me; this.patchMe({ introShare: !m.introShare }); }
  toggleMeDraftPhotoClear() { this.patchMe({ photo: null }); }
  cycleCover() {
    const m = this.state.meDraft || this.state.me;
    const i = COVERS.findIndex((c) => c[0] === m.cover);
    this.patchMe({ cover: COVERS[(i + 1) % COVERS.length][0] });
  }
  onMePhoto(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => this.patchMe({ photo: rd.result });
    rd.readAsDataURL(f);
    e.target.value = '';
  }
  saveMe() {
    const m = this.state.meDraft || this.state.me;
    const name = (m.name || '').trim() || this.L('나', 'Me');
    this.setState({ me: Object.assign({}, m, { name }), meDraft: null, stack: this.state.stack.slice(0, -1) });
    this.toast(this.L('내 프로필을 저장했어요', 'Profile saved'));
  }

  // ---------- philosopher image ----------
  onPickFile(e) {
    const f = e.target.files && e.target.files[0];
    const sh = this.state.sheet;
    if (!f || !sh) return;
    const pid = sh.pid;
    const rd = new FileReader();
    rd.onload = () => this.openCrop(pid, rd.result);
    rd.readAsDataURL(f);
    e.target.value = '';
  }
  useSample() { const sh = this.state.sheet; if (sh) this.openCrop(sh.pid, SAMPLE); }
  recrop() {
    const sh = this.state.sheet;
    if (!sh) return;
    const c = this.state.custom[sh.pid];
    if (c) { this.setState({ crop: Object.assign({ pid: sh.pid }, c) }); this.push('crop'); }
  }
  openCrop(pid, src) {
    this.setState({ crop: { pid, src, s: 1, ux: 0, uy: 0, rot: 0 } });
    this.push('crop');
  }
  resetImage() {
    const sh = this.state.sheet;
    if (!sh) return;
    const pid = sh.pid;
    const prev = this.state.custom[pid];
    const c = Object.assign({}, this.state.custom);
    delete c[pid];
    this.setState({ custom: c, sheet: null });
    this.toast(this.L(this.jn(P[pid].name) + ' 다시 앱 초상이에요', this.nm(pid) + ' is back to the app portrait'), this.undoLabel(), () => {
      const c2 = Object.assign({}, this.state.custom);
      c2[pid] = prev;
      this.setState({ custom: c2 });
    });
  }
  clampCrop(c) {
    const lim = Math.max(0, (c.s - CROP_C) / 2);
    return Object.assign({}, c, { ux: Math.max(-lim, Math.min(lim, c.ux)), uy: Math.max(-lim, Math.min(lim, c.uy)) });
  }
  onCropDown(e) {
    const c = this.state.crop;
    if (!c) return;
    this.drag = { x: e.clientX, y: e.clientY, ux: c.ux, uy: c.uy, w: e.currentTarget.clientWidth || 360 };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  }
  onCropMove(e) {
    const d = this.drag;
    const c = this.state.crop;
    if (!d || !c) return;
    this.setState({ crop: this.clampCrop(Object.assign({}, c, { ux: d.ux + (e.clientX - d.x) / d.w, uy: d.uy + (e.clientY - d.y) / d.w })) });
  }
  onCropUp() { this.drag = null; }
  onZoom(e) {
    const c = this.state.crop;
    if (!c) return;
    this.setState({ crop: this.clampCrop(Object.assign({}, c, { s: parseFloat(e.target.value) || 1 })) });
  }
  cropRotate() { const c = this.state.crop; if (c) this.setState({ crop: Object.assign({}, c, { rot: (c.rot + 90) % 360 }) }); }
  toggleGray() { this.setState({ gray: !this.state.gray }); }
  cropApply() {
    const c = this.state.crop;
    if (!c) return;
    const prev = this.state.custom[c.pid];
    const custom = Object.assign({}, this.state.custom);
    custom[c.pid] = { src: c.src, s: c.s, ux: c.ux, uy: c.uy, rot: c.rot };
    this.setState({ custom, crop: null, stack: this.state.stack.filter((x) => x.kind !== 'crop'), sheet: null });
    const pid = c.pid;
    this.toast(this.L(P[pid].name + '의 이미지를 바꿨어요', 'Changed ' + this.nm(pid) + '’s image'), this.undoLabel(), () => {
      const c2 = Object.assign({}, this.state.custom);
      if (prev) c2[pid] = prev; else delete c2[pid];
      this.setState({ custom: c2 });
    });
  }

  // ---------- feed ----------
  openAskNote() { this.openSheet({ kind: 'askNote', pick: ['ni'] }); }
  openComment() { this.openSheet({ kind: 'comment' }); }
  onSheetText(e) { this.setState({ sheetText: e.target.value }); }
  toggleSheetPick(v, single) {
    const cur = this.state.sheetPick;
    if (single) { this.setState({ sheetPick: [v] }); return; }
    this.setState({ sheetPick: cur.indexOf(v) >= 0 ? cur.filter((p) => p !== v) : cur.concat([v]) });
  }
  submitAskNote() {
    const pid = this.state.sheetPick[0];
    if (!pid) return;
    const topic = this.state.sheetText.trim();
    this.setState({ requests: this.state.requests.concat([{ id: 'r' + (++this.seq), pid, topic }]), sheet: null });
    this.toast(this.L(P[pid].name + '에게 부탁했어요 · 내일 아침 피드로 와요', 'Asked ' + this.nm(pid) + ' · arrives in tomorrow’s feed'));
  }
  submitComment() {
    const text = this.state.sheetText.trim();
    if (!text) return;
    this.setState({ reflComments: this.state.reflComments.concat([{ text, min: this.tick() }]), sheet: null });
    this.toast(this.L('댓글을 남겼어요', 'Comment posted'));
  }
  toggleLike() { this.setState({ liked: !this.state.liked }); }
  openArchDay() { this.openSheet({ kind: 'archDay' }); }
  clearArchDay() { this.setState({ archDay: null }); }

  // ---------- notes ----------
  clearNoteDay() { this.setState({ noteDay: null }); }
  newNote() {
    const acc = this.state.set.scope === 'allowed' ? ['ni', 'sh'] : [];
    this.setState({ noteEdit: { id: null, title: '', body: '', access: acc } });
    this.push('noteEdit');
  }
  editNote(id) {
    const n = this.noteById(id);
    if (!n) return;
    if (n.kind === 'about') {
      this.setState({ noteEdit: { id, about: true, title: n.title, body: (n.raw || '').replace(/^\s*#\s[^\n]*\n+/, ''), access: [] } });
      this.push('noteEdit');
      return;
    }
    const body = n.paras.map((p) => (Array.isArray(p) ? p.map((s) => s.t).join('') : p)).join('\n\n');
    this.setState({ noteEdit: { id, title: n.title, body, access: n.access.slice() } });
    this.push('noteEdit');
  }
  onEditTitle(e) { this.setState({ noteEdit: Object.assign({}, this.state.noteEdit, { title: e.target.value }) }); }
  onEditBody(e) { this.setState({ noteEdit: Object.assign({}, this.state.noteEdit, { body: e.target.value }) }); }
  toggleEditAccess(pid) {
    const ne = this.state.noteEdit;
    if (!ne) return;
    const acc = pid === null ? [] : (ne.access.indexOf(pid) >= 0 ? ne.access.filter((p) => p !== pid) : ne.access.concat([pid]));
    this.setState({ noteEdit: Object.assign({}, ne, { access: acc }) });
  }
  saveNote() {
    const ne = this.state.noteEdit;
    if (!ne) return;
    if (ne.about) {
      const prev = ne.id ? this.noteById(ne.id) : null;
      const file = prev ? prev.file : { name: null, typed: true, sample: false, lang: this.state.set.lang };
      const aid = this.ingestAbout(file, ne.body, ne.title.trim() || this.L('나에 대해', 'About me'), prev ? prev.id : null);
      if (!aid) return;
      const rest = this.state.stack.filter((x) => x.kind !== 'noteEdit' && x.kind !== 'about' && x.kind !== 'aboutCands');
      this.setState({ noteEdit: null, stack: rest.concat([{ kind: 'about', id: aid, key: ++this.navSeq }]) });
      return;
    }
    const title = ne.title.trim() || ne.body.trim().split('\n')[0].slice(0, 24);
    if (!title) return;
    const paras = ne.body.split(/\n+/).map((x) => x.trim()).filter(Boolean);
    let id = ne.id;
    if (id) {
      this.setNote(id, (n) => Object.assign({}, n, { title, paras: paras.length ? paras : [''], access: ne.access.slice(), memos: n.memos }));
    } else {
      id = 'n' + (++this.seq);
      const note = { id, title, kind: 'own', day: '14', min: this.tick(), access: ne.access.slice(), paras: paras.length ? paras : [''], memos: [] };
      this.setState({ notes: [note].concat(this.state.notes) });
    }
    const stack = this.state.stack.filter((x) => x.kind !== 'noteEdit' && x.kind !== 'note');
    this.setState({ noteEdit: null, stack: stack.concat([{ kind: 'note', id, key: ++this.navSeq }]) });
    this.toast(ne.id ? this.L('노트를 고쳤어요', 'Note updated') : this.L('노트를 저장했어요', 'Note saved'));
  }
  openNote(id) {
    const n = this.noteById(id);
    if (!n) return;
    if (n.kind === 'about') { this.openAbout(id); return; }
    if (n.unseen) this.setNote(id, (x) => Object.assign({}, x, { unseen: 0 }));
    this.push('note', { id });
  }
  openNoteMore() { const t = this.top(); if (t && t.kind === 'note') this.openSheet({ kind: 'noteMore', id: t.id }); }
  submitAccess() {
    const sh = this.state.sheet;
    if (!sh) return;
    const acc = this.state.sheetPick.slice();
    this.setNote(sh.id, (n) => Object.assign({}, n, { access: acc }));
    this.setState({ sheet: null });
    this.toast(acc.length ? this.L(this.names(acc) + '만 이 노트를 읽어요', 'Only ' + this.names(acc) + ' can read this note') : this.L('이제 나만 볼 수 있어요', 'Now only you can see it'));
  }
  submitAskMemo() {
    const sh = this.state.sheet;
    const pid = this.state.sheetPick[0];
    if (!sh || !pid) return;
    this.setNote(sh.id, (n) => Object.assign({}, n, { asked: (n.asked || []).concat([pid]) }));
    this.setState({ sheet: null });
    this.toast(this.L(P[pid].name + '에게 부탁했어요 · 내일 아침 피드로 와요', 'Asked ' + this.nm(pid) + ' · arrives in tomorrow’s feed'));
  }
  sendMemoReply(noteId, memoId) {
    const key = noteId + ':' + memoId;
    const text = (this.state.memoReply[key] || '').trim();
    if (!text) return;
    const min = this.tick();
    this.setNote(noteId, (n) => Object.assign({}, n, {
      memos: n.memos.map((m) => (m.id === memoId ? Object.assign({}, m, { replies: m.replies.concat([{ text, min }]) }) : m))
    }));
    const r = Object.assign({}, this.state.memoReply);
    r[key] = '';
    const o = Object.assign({}, this.state.memoReplyOpen);
    o[key] = false;
    this.setState({ memoReply: r, memoReplyOpen: o });
  }

  // ---------- 나에 대해 ----------
  qj(title, a, b) { return '‘' + title + '’' + (hasJong(title) ? a : b); }
  cnt(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  openAboutAdd() { this.openSheet({ kind: 'aboutAdd' }); }
  onAboutFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    e.target.value = '';
    this.readAboutFile(f, null);
  }
  onAboutReplace(e) {
    const f = e.target.files && e.target.files[0];
    const sh = this.state.sheet;
    if (!f) return;
    e.target.value = '';
    this.readAboutFile(f, sh && sh.kind === 'aboutMore' ? sh.id : null);
  }
  readAboutFile(f, replaceId) { this.readTextFile(f, (name, t) => this.ingestAboutFile(name, t, replaceId)); }
  readTextFile(f, done) {
    const name = f.name || 'file.md';
    if (!/\.(md|markdown|txt)$/i.test(name) && !(f.type && /^text\//.test(f.type))) { this.toast(this.L('MD·TXT 파일만 읽을 수 있어요', 'Only MD or TXT files can be read')); return; }
    if (f.size && f.size > 2 * 1024 * 1024) { this.toast(this.L('파일이 너무 커요 · 2MB까지 읽어요', 'That file is too large · up to 2 MB')); return; }
    // UTF-8로 먼저 읽고, 글자가 깨지면 예전 한글 윈도 파일(EUC-KR)로 다시 읽는다.
    const read = (enc) => {
      const rd = new FileReader();
      rd.onload = () => {
        const t = String(rd.result || '');
        if (!enc && t.indexOf('\uFFFD') >= 0) { read('euc-kr'); return; }
        done(name, t);
      };
      rd.onerror = () => this.toast(this.L('파일을 읽지 못했어요', 'Could not read the file'));
      if (enc) rd.readAsText(f, enc); else rd.readAsText(f);
    };
    read(null);
  }
  ingestAboutFile(name, text, replaceId) {
    const prev = replaceId ? this.noteById(replaceId) : null;
    const id = this.ingestAbout({ name, sample: false, lang: this.state.set.lang }, text, prev ? prev.title : null, prev ? prev.id : null);
    if (!id) return;
    this.setState({ sheet: null });
    this.openAbout(id);
  }
  useAboutSample() {
    const lang = this.state.set.lang === 'en' ? 'en' : 'ko';
    const smp = ABOUT_SAMPLE[lang];
    const id = this.ingestAbout({ name: smp.name, sample: true, lang }, smp.text, null, null);
    if (!id) return;
    this.setState({ sheet: null });
    this.openAbout(id);
  }
  useAboutTemplate() {
    this.setState({ noteEdit: { id: null, about: true, title: this.L('나에 대해', 'About me'), body: ABOUT_TEMPLATE[this.state.set.lang === 'en' ? 'en' : 'ko'], access: [] } });
    this.push('noteEdit');
  }
  // 파일을 대목으로 나누고(제목이 같으면 예전 범위를 이어받음) 소화를 시작한다. 나중에 지운 대목에서 나온 기억은 함께 지운다.
  ingestAbout(file, text, titleOverride, replaceId) {
    const raw = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const clipped = raw.length > ABOUT_MAX;
    const body = clipped ? raw.slice(0, ABOUT_MAX) : raw;
    const fallback = file && file.name ? file.name.replace(/\.(md|markdown|txt)$/i, '') : this.L('나에 대해', 'About me');
    const parsed = parseAbout(body, fallback, this.L('머리말', 'Opening'));
    if (!parsed.sections.length) {
      this.toast(file && file.typed ? this.L('적은 내용이 없어요 · 제목 아래에 한두 줄 적어 보세요', 'Nothing written yet · add a line or two under a heading') : this.L('읽을 글이 없어요 · 빈 파일인지 확인해 주세요', 'Nothing to read · is the file empty?'));
      return null;
    }
    const prev = replaceId ? this.noteById(replaceId) : null;
    const id = prev ? prev.id : 'ab' + (++this.seq);
    const sections = parsed.sections.map((sc) => {
      const old = prev ? prev.sections.find((x) => x.title === sc.title) : null;
      return {
        id: old ? old.id : id + '-' + (++this.seq), title: sc.title, text: sc.text, tags: tagSection(sc.title, sc.text),
        scope: old ? old.scope : (SEC_QUIET.test(sc.title) ? 'quiet' : 'all'), pick: old ? old.pick.slice() : []
      };
    });
    const dig = ++this.seq;
    const note = {
      id, kind: 'about', title: titleOverride || parsed.title, day: '14', min: prev ? prev.min : this.tick(), access: [], memos: [],
      paras: sections.map((sc) => sc.title + ' · ' + sc.text.replace(/\n+/g, ' ')),
      file: Object.assign({}, file || {}), raw: body, clipped, sections, useOn: prev ? prev.useOn : true,
      digest: 'busy', step: 1, dig, cands: [], handled: prev ? (prev.handled || []).slice() : []
    };
    const keep = sections.map((x) => x.id);
    const memories = prev ? this.state.memories.filter((m) => !(m.kind === 'about' && m.noteId === id && keep.indexOf(m.secId) < 0)) : this.state.memories;
    const notes = prev ? this.state.notes.map((n) => (n.id === id ? note : n)) : [note].concat(this.state.notes);
    this.setState({ notes, memories });
    this.runDigest(id, dig);
    return id;
  }
  runDigest(id, dig) {
    const alive = () => { const n = this.noteById(id); return n && n.dig === dig ? n : null; };
    this.later(() => { if (alive()) this.setNote(id, (n) => Object.assign({}, n, { step: 2 })); }, 700);
    this.later(() => { if (alive()) this.setNote(id, (n) => Object.assign({}, n, { step: 3 })); }, 1400);
    this.later(() => {
      const n = alive();
      if (!n) return;
      const cands = this.candsFor(n);
      this.setNote(id, (x) => Object.assign({}, x, { digest: 'done', step: 4, cands }));
      const k = cands.length;
      this.toast(k ? this.L(this.qj(n.title, '을', '를') + ' 다 읽었어요 · 확인할 후보 ' + k + '개', 'Finished ‘' + n.title + '’ · ' + k + ' to review') : this.L(this.qj(n.title, '을', '를') + ' 다 읽었어요', 'Finished ‘' + n.title + '’'),
        k ? this.L('확인하기', 'Review') : '', k ? () => this.openAboutCands(id) : null);
    }, 2100);
  }
  candsFor(n) {
    const handled = n.handled || [];
    const me = this.state.me;
    const known = this.state.memories.filter((m) => m.kind === 'about' && m.noteId === n.id).map((m) => m.text);
    const out = [];
    let sampleTitles = [];
    if (n.file && n.file.sample) {
      const lang = n.file.lang === 'en' ? 'en' : 'ko';
      sampleTitles = parseAbout(ABOUT_SAMPLE[lang].text, '', '').sections.map((x) => x.title);
      for (const c of ABOUT_SAMPLE_CANDS[lang]) {
        const sec = n.sections.find((x) => x.title === c.sec);
        if (!sec) continue;
        const key = c.sec + '|' + (c.kind === 'set' ? c.copy : c.text);
        if (handled.indexOf(key) >= 0) continue;
        if (c.kind === 'set' && me[SET_COPY[c.copy].field] === SET_COPY[c.copy].val) continue;
        if (c.kind === 'fact' && known.indexOf(c.text) >= 0) continue;
        out.push(Object.assign({}, c, { id: 'c' + (++this.seq), secId: sec.id, key }));
      }
    }
    for (const sec of n.sections) {
      if (out.length >= 8) break;
      if (sampleTitles.indexOf(sec.title) >= 0 || sec.scope === 'off') continue;
      const first = firstSentence(sec.text);
      if (!first) continue;
      const key = sec.title + '|' + first;
      if (handled.indexOf(key) >= 0 || known.indexOf(first) >= 0) continue;
      out.push({ id: 'c' + (++this.seq), secId: sec.id, key, kind: 'fact', text: first, dated: sec.tags.indexOf('now') >= 0, demo: true });
    }
    return out;
  }
  openAbout(id) { this.push('about', { id }); }
  openAboutCands(id) { if (this.noteById(id)) this.push('aboutCands', { id }); }
  toggleAboutUse(id) {
    const n = this.noteById(id);
    if (!n) return;
    this.setNote(id, (x) => Object.assign({}, x, { useOn: !x.useOn }));
    this.toast(n.useOn ? this.L('이제 어떤 대목도 쓰지 않아요', 'No section will be used now') : this.L('다시 대화와 이어지는 대목을 참고해요', 'Sections will be used again when they connect'));
  }
  aboutSec(noteId, secId) {
    const note = this.noteById(noteId);
    const sec = note && note.kind === 'about' ? note.sections.find((x) => x.id === secId) : null;
    return sec ? { note, sec } : null;
  }
  setSecScope(noteId, secId, scope, pick) {
    this.setNote(noteId, (n) => Object.assign({}, n, { sections: n.sections.map((x) => (x.id === secId ? Object.assign({}, x, { scope, pick: pick ? pick.slice() : x.pick }) : x)) }));
  }
  openAboutScope(noteId, secId) {
    const info = this.aboutSec(noteId, secId);
    if (!info) return;
    this.setState({ scopeDraft: { scope: info.sec.scope, pick: info.sec.pick.slice() } });
    this.openSheet({ kind: 'aboutScope', id: noteId, secId });
  }
  saveAboutScope() {
    const sh = this.state.sheet;
    const d = this.state.scopeDraft;
    if (!sh || !d) return;
    const info = this.aboutSec(sh.id, sh.secId);
    if (!info) { this.closeSheet(); return; }
    if (d.scope === 'pick' && !d.pick.length) { this.toast(this.L('철학자를 한 명 이상 골라 주세요', 'Pick at least one philosopher')); return; }
    const prev = { scope: info.sec.scope, pick: info.sec.pick.slice() };
    this.setSecScope(sh.id, sh.secId, d.scope, d.scope === 'pick' ? d.pick : null);
    this.setState({ sheet: null, scopeDraft: null });
    const now = this.aboutSec(sh.id, sh.secId);
    this.toast('‘' + now.sec.title + '’ · ' + this.scopeLabel(now.sec), this.undoLabel(), () => this.setSecScope(sh.id, sh.secId, prev.scope, prev.pick));
  }
  acceptCand(noteId, candId) {
    const n = this.noteById(noteId);
    const cd = n ? n.cands.find((c) => c.id === candId) : null;
    if (!cd) return;
    const restore = () => this.setNote(noteId, (x) => Object.assign({}, x, { cands: x.cands.concat([cd]), handled: (x.handled || []).filter((k) => k !== cd.key) }));
    this.setNote(noteId, (x) => Object.assign({}, x, { cands: x.cands.filter((c) => c.id !== candId), handled: (x.handled || []).concat([cd.key]) }));
    if (cd.kind === 'set') {
      const cp = SET_COPY[cd.copy];
      const before = this.state.me[cp.field];
      const patch = {};
      patch[cp.field] = cp.val;
      this.setState({ me: Object.assign({}, this.state.me, patch), meDraft: this.state.meDraft ? Object.assign({}, this.state.meDraft, patch) : null });
      this.toast(this.L(cp.done[0], cp.done[1]), this.undoLabel(), () => {
        const back = {};
        back[cp.field] = before;
        this.setState({ me: Object.assign({}, this.state.me, back), meDraft: this.state.meDraft ? Object.assign({}, this.state.meDraft, back) : null });
        restore();
      });
      return;
    }
    const mid = 'mm' + (++this.seq);
    this.setState({ memories: this.state.memories.concat([{ id: mid, kind: 'about', noteId, secId: cd.secId, text: cd.text, dated: !!cd.dated, active: true, pids: [], exclude: [] }]) });
    this.toast(this.L('기억했어요', 'Remembered'), this.undoLabel(), () => { this.setState({ memories: this.state.memories.filter((m) => m.id !== mid) }); restore(); });
  }
  dismissCand(noteId, candId) {
    const n = this.noteById(noteId);
    const cd = n ? n.cands.find((c) => c.id === candId) : null;
    if (!cd) return;
    this.setNote(noteId, (x) => Object.assign({}, x, { cands: x.cands.filter((c) => c.id !== candId), handled: (x.handled || []).concat([cd.key]) }));
    this.toast(cd.kind === 'set' ? this.L('그대로 뒀어요', 'Left as is') : this.L('뺐어요', 'Skipped'), this.undoLabel(), () => this.setNote(noteId, (x) => Object.assign({}, x, { cands: x.cands.concat([cd]), handled: (x.handled || []).filter((k) => k !== cd.key) })));
  }
  acceptAllCands(noteId) {
    const n = this.noteById(noteId);
    if (!n) return;
    const facts = n.cands.filter((c) => c.kind === 'fact');
    if (!facts.length) return;
    const ids = facts.map(() => 'mm' + (++this.seq));
    const mems = facts.map((cd, i) => ({ id: ids[i], kind: 'about', noteId, secId: cd.secId, text: cd.text, dated: !!cd.dated, active: true, pids: [], exclude: [] }));
    const keys = facts.map((c) => c.key);
    this.setState({ memories: this.state.memories.concat(mems) });
    this.setNote(noteId, (x) => Object.assign({}, x, { cands: x.cands.filter((c) => c.kind !== 'fact'), handled: (x.handled || []).concat(keys) }));
    this.toast(this.L('기억 ' + facts.length + '개를 더했어요', 'Added ' + this.cnt(facts.length, 'memory', 'memories')), this.undoLabel(), () => {
      this.setState({ memories: this.state.memories.filter((m) => ids.indexOf(m.id) < 0) });
      this.setNote(noteId, (x) => Object.assign({}, x, { cands: facts.concat(x.cands), handled: (x.handled || []).filter((k) => keys.indexOf(k) < 0) }));
    });
  }
  removeAbout(id) {
    const n = this.noteById(id);
    if (!n) return;
    const k = this.state.memories.filter((m) => m.kind === 'about' && m.noteId === id).length;
    this.askConfirm(this.L(this.qj(n.title, '을', '를') + ' 지울까요?', 'Delete ‘' + n.title + '’?'),
      k ? this.L('여기서 나온 기억 ' + k + '개도 함께 지워요. 대화 기록은 남아요.', 'The ' + this.cnt(k, 'memory', 'memories') + ' from it go too. Chats stay.') : this.L('대화 기록은 남아요.', 'Chats stay.'),
      this.L('자료 지우기', 'Delete file'), () => {
        this.setState({
          notes: this.state.notes.filter((x) => x.id !== id),
          memories: this.state.memories.filter((m) => !(m.kind === 'about' && m.noteId === id)),
          stack: this.state.stack.filter((x) => !((x.kind === 'about' || x.kind === 'aboutCands') && x.id === id))
        });
        this.toast(this.L('자료를 지웠어요', 'File deleted'));
      });
  }
  pidsForSec(sec) { return sec.scope === 'off' ? [] : (sec.scope === 'pick' ? sec.pick.slice() : ORDER.slice()); }
  memPids(m) {
    if (m.kind !== 'about') return m.pids;
    const info = this.aboutSec(m.noteId, m.secId);
    if (!info || !info.note.useOn) return [];
    const ex = m.exclude || [];
    return this.pidsForSec(info.sec).filter((p) => ex.indexOf(p) < 0);
  }
  secAllows(sec, pid, room) {
    if (sec.scope === 'pick') return sec.pick.indexOf(pid) >= 0;
    if (sec.scope === 'dm') return room.kind === 'dm';
    return sec.scope === 'all';
  }
  // 지금 말과 같은 갈래(일·의미·관계·쉼·기쁨)의 대목 중 가장 좁은 것 하나. 이 방에서 최근에 꺼낸 대목은 건너뛴다.
  aboutRefFor(room, text, pid) {
    if (!room || !pid) return null;
    const cats = catsOf(text);
    if (!cats.length) return null;
    const recent = room.msgs.slice(-6).filter((m) => m.ref).map((m) => m.ref.secId);
    let best = null;
    for (const n of this.state.notes) {
      if (n.kind !== 'about' || !n.useOn || n.digest !== 'done') continue;
      for (const sec of n.sections) {
        const hit = sec.tags.filter((t) => cats.indexOf(t) >= 0).length;
        if (!hit || !this.secAllows(sec, pid, room) || recent.indexOf(sec.id) >= 0) continue;
        const score = sec.tags.length - (sec.tags.indexOf('now') >= 0 ? 2.5 : 0) - hit;
        if (!best || score < best.score) best = { note: n, sec, score };
      }
    }
    return best;
  }
  // 이 방에 보낸 자료 중, 지금 말과 이어지는(또는 '이 글'처럼 자료를 가리키는) 대목 하나. 최근에 짚은 대목은 건너뛴다.
  docRefFor(room, text) {
    if (!room || !room.docs || !room.docs.length) return null;
    const cats = catsOf(text);
    const ask = DOC_ASK.test(text);
    if (!cats.length && !ask) return null;
    const recent = room.msgs.slice(-6).filter((m) => m.ref).map((m) => m.ref.secId);
    const docs = room.docs.filter((d) => !d.removed && d.digest === 'done').slice().reverse();
    for (const d of docs) {
      let best = null;
      for (const sec of d.sections) {
        if (recent.indexOf(sec.id) >= 0) continue;
        const hit = sec.tags.filter((t) => cats.indexOf(t) >= 0).length;
        if (!hit && !ask) continue;
        const score = hit * 2 + sec.tags.length * 0.1;
        if (!best || score > best.score) best = { doc: d, sec, score };
      }
      if (best) return best;
    }
    return null;
  }
  aboutLine(pid, title, lang) { return ABOUT_LINES[lang === 'en' ? 'en' : 'ko'][pid].replace('{s}', title); }
  scopeLabel(sec) {
    if (sec.scope === 'pick') return this.L('고른 철학자만 · ' + sec.pick.map((p) => P[p].name).join('·'), 'Only ' + this.names(sec.pick));
    const o = SCOPES.find((x) => x[0] === sec.scope) || SCOPES[0];
    return this.L(o[1], o[2]);
  }
  stepL(k) { const st = ABOUT_STEP_ING[Math.max(0, Math.min(2, k - 1))]; return this.L(st[0], st[1]); }
  aboutSrcL(m) {
    const info = this.aboutSec(m.noteId, m.secId);
    if (!info) return this.L('나에 대해', 'About me');
    return this.L('‘' + info.note.title + '’ · ' + info.sec.title + ' 대목' + (m.dated ? ' · 10월 14일 기준' : ''), '‘' + info.note.title + '’ · ' + info.sec.title + (m.dated ? ' · as of Oct 14' : ''));
  }
  aboutScopeL(m) {
    const info = this.aboutSec(m.noteId, m.secId);
    if (!info) return '';
    if (!info.note.useOn) return this.L('자료 참고가 꺼져 있어요 · 쓰지 않아요', 'The file is turned off · not used');
    return this.L('대목 범위를 따라요 · ', 'Follows its section · ') + this.scopeLabel(info.sec);
  }
  aboutRow(n) {
    const busy = n.digest === 'busy';
    const mems = this.state.memories.filter((m) => m.kind === 'about' && m.noteId === n.id).length;
    const secs = n.sections.length;
    const cands = n.cands.length;
    let sub;
    if (busy) sub = this.L('읽는 중 · ', 'Reading · ') + this.stepL(n.step);
    else if (!n.useOn) sub = this.L('참고 꺼짐 · 대목 ' + secs + '개', 'Not in use · ' + this.cnt(secs, 'section', 'sections'));
    else sub = this.L('대목 ' + secs + '개 · 기억 ' + mems + '개' + (cands ? ' · 확인할 후보 ' + cands + '개' : ''), this.cnt(secs, 'section', 'sections') + ' · ' + this.cnt(mems, 'memory', 'memories') + (cands ? ' · ' + cands + ' to review' : ''));
    return { title: n.title, sub, busy, open: () => this.openAbout(n.id) };
  }

  // ---------- 같이 읽기 ----------
  roomDoc(roomId, docId) {
    const room = this.roomById(roomId);
    const doc = room && room.docs ? room.docs.find((d) => d.id === docId) : null;
    return doc ? { room, doc } : null;
  }
  roomPlace(r) {
    if (r.kind === 'dm') return this.L(P[r.members[0]].name + ' 개인톡', 'Direct chat with ' + this.nm(r.members[0]));
    return this.L('‘' + this.roomTitle(r) + '’ 방', 'Room ‘' + this.roomTitle(r) + '’');
  }
  setDoc(roomId, docId, fn) { this.setRoom(roomId, (r) => Object.assign({}, r, { docs: (r.docs || []).map((d) => (d.id === docId ? fn(d) : d)) })); }
  openDocAdd() {
    const t = this.top();
    if (t && t.kind === 'room') this.openSheet({ kind: 'docAdd', id: t.id });
  }
  onDocFile(e) {
    const f = e.target.files && e.target.files[0];
    const sh = this.state.sheet;
    if (!f || !sh) return;
    e.target.value = '';
    const roomId = sh.id;
    this.readTextFile(f, (name, t) => this.shareDoc(roomId, { name }, t, null));
  }
  useDocSample() {
    const sh = this.state.sheet;
    if (!sh) return;
    const lang = this.state.set.lang === 'en' ? 'en' : 'ko';
    this.shareDoc(sh.id, { name: DOC_SAMPLE[lang].name, sample: true }, DOC_SAMPLE[lang].text, null);
  }
  shareNoteDoc(roomId, noteId) {
    const n = this.noteById(noteId);
    if (!n) return;
    // 짧고 문장부호로 끝나지 않는 문단은 소제목으로 본다(자료에서 저장한 노트의 제목을 되살림).
    const parts = n.paras.map((p) => (Array.isArray(p) ? p.map((x) => x.t).join('') : p).trim()).filter(Boolean);
    const text = parts.map((p, i) => (p.length <= 40 && p.split(/\s+/).length <= 8 && !/[.!?。…]$/.test(p) && i < parts.length - 1 ? '## ' + p : p)).join('\n\n');
    this.shareDoc(roomId, { name: null, note: n.id }, text, n.title);
  }
  // 방에 자료 카드를 남기고, 잠깐 읽은 뒤 철학자들이 대목을 짚어 반응한다.
  shareDoc(roomId, file, text, titleOverride) {
    if (!this.roomById(roomId)) return;
    const raw = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const clipped = raw.length > ABOUT_MAX;
    const body = clipped ? raw.slice(0, ABOUT_MAX) : raw;
    const fallback = file.name ? file.name.replace(/\.(md|markdown|txt)$/i, '') : this.L('자료', 'File');
    const parsed = parseAbout(body, fallback, this.L('머리말', 'Opening'));
    if (!parsed.sections.length) { this.toast(this.L('읽을 글이 없어요 · 빈 파일인지 확인해 주세요', 'Nothing to read · is the file empty?')); return; }
    const id = 'd' + (++this.seq);
    const doc = {
      id, title: titleOverride || parsed.title, file: Object.assign({}, file), clipped, headed: parsed.headed, digest: 'busy', removed: false, min: this.tick(),
      sections: parsed.sections.map((sc, i) => ({ id: id + '-' + i, title: sc.title, text: sc.text, tags: tagSection(sc.title, sc.text) }))
    };
    this.forceScroll = true;
    this.setRoom(roomId, (r) => Object.assign({}, r, {
      docs: (r.docs || []).concat([doc]),
      msgs: r.msgs.concat([{ id: ++this.seq, from: 'me', doc: id, text: doc.title, day: 'today', min: doc.min }]),
      sort: ++this.seq, firstContact: false, archived: false
    }));
    this.setState({ sheet: null });
    this.later(() => {
      const hit = this.roomDoc(roomId, id);
      if (!hit || hit.doc.removed || hit.room.deleted) return;
      this.setDoc(roomId, id, (d) => Object.assign({}, d, { digest: 'done' }));
      this.enqueueDoc(roomId, id);
    }, 1300);
  }
  docOpenLine(pid, t, s, lang) {
    if (lang === 'en') {
      return {
        so: 'I have read ‘' + t + '’. The part ‘' + s + '’ makes me want to ask: how would you define what it speaks of?',
        ni: 'I read ‘' + t + '’ to the end. ‘' + s + '’ snags me most. Who decided the values written there?',
        sh: 'I have read ‘' + t + '’. A desire hides in ‘' + s + '’. What do you think the writer wanted?',
        ca: 'I enjoyed ‘' + t + '’. I liked ‘' + s + '’ — it does not rush to an answer.',
        ci: 'I read ‘' + t + '’. ‘' + s + '’ is the most honest part, because it is unsure.',
        au: 'I have read ‘' + t + '’. In ‘' + s + '’, separate what is in your hands from what is not.'
      }[pid];
    }
    const tt = this.qj(t, '을', '를');
    return {
      so: tt + ' 읽었네. ‘' + s + '’ 대목에서 묻고 싶은 게 생겼어. 거기서 말하는 것을 자네라면 어떻게 정의하겠나?',
      ni: tt + ' 끝까지 읽었소. ‘' + s + '’ 대목이 가장 걸리오. 거기 적힌 가치는 누가 정한 것이오?',
      sh: tt + ' 읽었습니다. ‘' + s + '’ 대목에는 욕망이 숨어 있더군요. 무엇을 원해서 그렇게 썼다고 보십니까?',
      ca: tt + ' 잘 읽었어요. 저는 ‘' + s + '’ 대목이 좋았어요. 답을 서두르지 않는 문장이라서요.',
      ci: tt + ' 읽었습니다. ‘' + s + '’ 대목이 제일 정직하더군요. 확신이 없는 곳이니까요.',
      au: tt + ' 읽었습니다. ‘' + s + '’ 대목에서, 당신 손에 달린 것과 아닌 것을 나눠 보십시오.'
    }[pid];
  }
  docSecondLine(pid, s, lang) {
    if (lang === 'en') {
      return {
        so: 'I am stuck on ‘' + s + '’. If what it says is true, what follows?',
        ni: 'I would look at ‘' + s + '’. Are you overcoming something there, or merely enduring?',
        sh: 'I lingered on ‘' + s + '’. What did the writer truly want there?',
        ca: '‘' + s + '’ stays with me more. It has questions rather than conclusions.',
        ci: '‘' + s + '’ is the least decorated part. I tend to trust sentences like that.',
        au: 'Consider ‘' + s + '’. Which part of it can you change?'
      }[pid];
    }
    return {
      so: '나는 ‘' + s + '’ 대목에서 걸리네. 거기 적힌 말이 참이라면, 무엇이 따라 나오겠나?',
      ni: '나는 ‘' + s + '’ 대목을 보겠소. 거기서 당신은 넘어서는 중이오, 버티는 중이오?',
      sh: '저는 ‘' + s + '’ 대목을 오래 봤습니다. 거기서 글쓴이가 정말 원한 건 무엇이었을까요?',
      ca: '저는 ‘' + s + '’ 대목이 더 남아요. 거기엔 결론보다 질문이 있어서요.',
      ci: '‘' + s + '’ 대목이 제일 덜 꾸며져 있더군요. 저는 그런 문장을 믿는 편입니다.',
      au: '‘' + s + '’ 대목을 두고 생각해 보십시오. 그중 당신이 바꿀 수 있는 것은 무엇입니까?'
    }[pid];
  }
  docFollowLine(pid, s, lang) {
    if (lang === 'en') {
      return {
        so: 'Let us go back to ‘' + s + '’. Is what you say now the same as what it says there?',
        ni: 'That ties to ‘' + s + '’. Think it through again from there.',
        sh: 'Hearing that, ‘' + s + '’ comes back to me.',
        ca: 'It reminds me of ‘' + s + '’. You were asking then, and you still are.',
        ci: '‘' + s + '’ comes to mind. The question has not moved at all.',
        au: 'Look at ‘' + s + '’ again. What can you do about it today?'
      }[pid];
    }
    return {
      so: '‘' + s + '’ 대목으로 돌아가 보세. 거기 적힌 것과 지금 자네가 한 말은 같은가?',
      ni: '‘' + s + '’ 대목과 이어지는 말이구려. 거기서부터 다시 생각해 보시오.',
      sh: '그 말을 들으니 ‘' + s + '’ 대목이 다시 떠오릅니다.',
      ca: '‘' + s + '’ 대목 생각이 나요. 그때도 지금도 계속 묻고 있네요.',
      ci: '‘' + s + '’ 대목이 떠오르는군요. 질문은 여전히 그대로네요.',
      au: '‘' + s + '’ 대목을 다시 보십시오. 그중 오늘 할 수 있는 것은 무엇입니까?'
    }[pid];
  }
  enqueueDoc(roomId, docId) {
    const hit = this.roomDoc(roomId, docId);
    if (!hit) return;
    const room = hit.room;
    const doc = hit.doc;
    const speakers = this.speakersFor(room);
    if (!speakers.length || !doc.sections.length) return;
    const lang = this.replyLang(room, doc.title + ' ' + doc.sections[0].text);
    const first = doc.sections.slice().sort((a, b) => b.tags.length - a.tags.length)[0];
    const others = doc.sections.filter((x) => x.id !== first.id).reverse();
    const jobs = speakers.map((pid, i) => {
      if (i === 0) return { roomId, pid, to: null, text: this.docOpenLine(pid, doc.title, first.title, lang), ref: { kind: 'doc', roomId, docId, secId: first.id } };
      const sec = others.length ? others[(i - 1) % others.length] : first;
      return { roomId, pid, to: speakers[i - 1], text: this.docSecondLine(pid, sec.title, lang), ref: { kind: 'doc', roomId, docId, secId: sec.id } };
    });
    this.setState({ queue: this.state.queue.concat(jobs) });
    this.pump();
  }
  openDoc(roomId, docId) {
    const hit = this.roomDoc(roomId, docId);
    if (hit && !hit.doc.removed) this.push('doc', { roomId, docId });
  }
  openAskDoc(roomId, docId, pid) {
    const hit = this.roomDoc(roomId, docId);
    if (!hit) return;
    this.openSheet({ kind: 'askDoc', roomId, docId, pick: [pid && hit.room.members.indexOf(pid) >= 0 ? pid : hit.room.members[0]] });
  }
  submitAskDoc() {
    const sh = this.state.sheet;
    const pid = this.state.sheetPick[0];
    const hit = sh ? this.roomDoc(sh.roomId, sh.docId) : null;
    if (!hit || !pid) return;
    this.setState({ requests: this.state.requests.concat([{ id: 'r' + (++this.seq), pid, topic: '', docTitle: hit.doc.title, roomId: sh.roomId, docId: sh.docId }]), sheet: null });
    this.toast(this.L(P[pid].name + '에게 부탁했어요 · 내일 아침 피드로 와요', 'Asked ' + this.nm(pid) + ' · arrives in tomorrow’s feed'));
  }
  saveDocNote(roomId, docId) {
    const hit = this.roomDoc(roomId, docId);
    if (!hit) return;
    const d = hit.doc;
    const paras = [];
    for (const sec of d.sections) {
      if (d.headed) paras.push(sec.title);
      paras.push(sec.text.replace(/\n+/g, ' '));
    }
    const id = 'n' + (++this.seq);
    this.setState({ notes: [{ id, title: d.title, kind: 'own', day: '14', min: this.tick(), access: [], paras: paras.length ? paras : [''], memos: [] }].concat(this.state.notes) });
    this.setDoc(roomId, docId, (x) => Object.assign({}, x, { savedNote: id }));
    this.toast(this.L('노트로 저장했어요 · 나만 봐요', 'Saved as a note · only you can see it'), this.L('열기', 'Open'), () => this.openNote(id));
  }
  removeDoc(roomId, docId) {
    const hit = this.roomDoc(roomId, docId);
    if (!hit) return;
    const asked = this.state.requests.filter((q) => q.docId === docId).length;
    this.askConfirm(this.L(this.qj(hit.doc.title, '을', '를') + ' 이 방에서 내릴까요?', 'Remove ‘' + hit.doc.title + '’ from this room?'),
      this.L('철학자들이 더는 이 자료를 보지 않아요.' + (asked ? ' 이 자료로 부탁한 사유 노트 ' + asked + '개도 취소돼요.' : '') + ' 지금까지 나눈 대화는 남아요.',
        'The philosophers stop reading it.' + (asked ? ' ' + (asked === 1 ? 'The reflection' : 'The ' + asked + ' reflections') + ' you asked for will be cancelled.' : '') + ' The conversation so far stays.'),
      this.L('내리기', 'Remove'), () => {
        this.setDoc(roomId, docId, (d) => Object.assign({}, d, { removed: true }));
        this.setState({
          queue: this.state.queue.filter((j) => !(j.ref && j.ref.kind === 'doc' && j.ref.docId === docId)),
          requests: this.state.requests.filter((q) => q.docId !== docId),
          stack: this.state.stack.filter((x) => !(x.kind === 'doc' && x.docId === docId))
        });
        this.toast(this.L('자료를 내렸어요', 'File removed'));
      });
  }

  // ---------- settings & misc ----------
  confirmOk() {
    const sh = this.state.sheet;
    this.setState({ sheet: null });
    if (sh && sh.ok) sh.ok();
  }
  askConfirm(title, body, okLabel, ok) { this.openSheet({ kind: 'confirm', title, body, okLabel, ok }); }
  openOptions(key, title, opts, help) { this.openSheet({ kind: 'options', key, title, opts, help: help || '' }); }
  doExport() {
    this.setState({ exportStep: 1 });
    this.later(() => this.setState({ exportStep: 2 }), 1200);
  }
  wipeAll() {
    clearTimeout(this.typeT);
    clearInterval(this.iv);
    this.setState({ rooms: [], notes: [], memories: [], queue: [], stream: null, requests: [], reflComments: [], stack: [], tab: 'chat' });
    this.toast(this.L('모든 기록을 지웠어요 · 보드를 다시 열면 처음 상태로 돌아와요', 'Everything erased · reopen the board to restore the demo'));
  }

  // ---------- view helpers ----------
  av(pid, ringOverride) {
    const c = this.state.custom[pid];
    const base = { ring: ringOverride || P[pid].hue, hue: P[pid].hue, name: this.nm(pid) };
    if (!c) return Object.assign(base, { src: BLOB[pid], img: 'filter: ' + GRAY + '; transform: none;' });
    const tf = 'translate(' + (c.ux / CROP_C * 100).toFixed(2) + '%, ' + (c.uy / CROP_C * 100).toFixed(2) + '%) scale(' + (c.s / CROP_C).toFixed(3) + ') rotate(' + c.rot + 'deg)';
    return Object.assign(base, { src: c.src, img: 'filter: ' + (this.state.gray ? GRAY : 'none') + '; transform: ' + tf + ';' });
  }
  cluster(members) {
    const ms = members.slice(0, 3);
    return {
      one: ms.length === 1, two: ms.length === 2, three: ms.length >= 3,
      a: ms[0] ? this.av(ms[0]) : null, b: ms[1] ? this.av(ms[1]) : null, c: ms[2] ? this.av(ms[2]) : null
    };
  }
  timeLabel(m) { return m ? (m.day === 'today' ? this.fmt(m.min) : this.dayL(m.day)) : ''; }
  writingPid() { const st = this.state.stream; return st ? st.pid : null; }
  visibleRooms() { return this.state.rooms.filter((r) => !r.archived && !r.deleted).slice().sort((a, b) => b.sort - a.sort); }

  vmNav(totalUnread) {
    const mk = (id) => {
      const on = this.state.tab === id;
      return {
        current: on ? 'page' : undefined,
        color: on ? 'color: var(--ink);' : 'color: var(--ink3);',
        pill: on ? 'background: var(--psoft); color: var(--pink);' : 'background: transparent;',
        go: () => this.goTab(id)
      };
    };
    return {
      people: mk('people'), chat: mk('chat'), feed: mk('feed'), notes: mk('notes'),
      chatBadge: totalUnread > 99 ? '99+' : String(totalUnread), hasChatBadge: totalUnread > 0, hasFeedBadge: !this.state.feedSeen
    };
  }

  roomRow(r) {
    const st = this.state.stream;
    const writing = st && st.roomId === r.id ? st : null;
    const last = r.msgs[r.msgs.length - 1];
    const who = last ? (last.from === 'me' ? this.L('나', 'You') : (r.kind === 'group' ? this.nm(last.from) : '')) : '';
    const typing = writing ? this.L(this.ji(P[writing.pid].name) + ' 쓰는 중…', this.nm(writing.pid) + ' is writing…') : '';
    return {
      id: r.id, title: this.roomTitle(r), cl: this.cluster(r.members), isGroup: r.kind === 'group',
      time: writing ? this.L('지금', 'now') : this.timeLabel(last),
      timeStyle: writing ? 'color: var(--lampink); font-weight: 700;' : 'color: var(--ink3);',
      writing: !!writing, notWriting: !writing, writingText: typing,
      hasWho: !!who, who, whoStyle: 'color: ' + (last && last.from !== 'me' ? P[last.from].hue : 'var(--ink3)') + ';',
      preview: last ? (last.doc ? this.L('자료 · ‘' + last.text + '’', 'File · ‘' + last.text + '’') : last.text) : this.L('새 대화를 시작해 보세요', 'Start the conversation'),
      unread: String(r.unread), hasUnread: r.unread > 0, first: !!r.firstContact,
      bold: r.unread > 0 || !!writing || !!r.firstContact,
      denseStyle: (r.unread > 0 || writing || r.firstContact) ? 'font-weight: 800; color: var(--ink);' : 'font-weight: 600; color: var(--ink2);',
      open: () => this.openRoom(r.id)
    };
  }

  vmChat() {
    const s = this.state;
    const typed = !!s.draft.trim();
    const sugg = typed ? SUGGEST[catOf(s.draft)] : ['ni', 'ca', 'au'];
    const ids = sugg.concat(s.picks.filter((p) => sugg.indexOf(p) < 0));
    const chips = ids.map((pid) => {
      const on = s.picks.indexOf(pid) >= 0;
      return {
        name: this.nm(pid), av: this.av(pid), on,
        style: on ? 'background: var(--psoft); color: var(--pink); font-weight: 700;' : 'background: var(--sunken); color: var(--ink2); font-weight: 600;',
        gap: on ? 'var(--psoft)' : 'var(--sunken)', toggle: () => this.togglePick(pid)
      };
    });
    const match = s.routeNew ? null : this.matchRoom(s.picks);
    let route = this.L('보낼 곳 · 철학자를 골라 주세요', 'Send to · pick philosophers');
    if (s.picks.length === 1) route = match ? this.L('보낼 곳 · ' + this.roomTitle(match) + ' 개인톡 (이어서)', 'Send to · chat with ' + this.roomTitle(match) + ' (continue)') : this.L('보낼 곳 · 새 개인톡 (' + this.nm(s.picks[0]) + ')', 'Send to · new direct chat (' + this.nm(s.picks[0]) + ')');
    else if (s.picks.length > 1) route = match ? this.L('보낼 곳 · ' + this.roomTitle(match) + ' (이어서)', 'Send to · ' + this.roomTitle(match) + ' (continue)') : this.L('보낼 곳 · 새 단톡방 (' + this.names(s.picks) + ')', 'Send to · new group (' + this.names(s.picks) + ')');
    const canSend = typed && s.picks.length > 0;
    const st = s.stream;
    const top = this.top();
    const live = st && !(top && top.kind === 'room' && top.id === st.roomId) ? st : null;
    const liveRoom = live ? this.roomById(live.roomId) : null;
    const rooms = this.visibleRooms();
    const q = s.listQ.trim();
    const qRooms = q ? rooms.filter((r) => this.roomTitle(r).indexOf(q) >= 0 || r.msgs.some((m) => m.text.indexOf(q) >= 0)) : rooms;
    const f = s.listFilter;
    const dRooms = qRooms.filter((r) => f === 'all' || (f === 'unread' && r.unread > 0) || (f === 'dm' && r.kind === 'dm') || (f === 'group' && r.kind === 'group') || (f === 'first' && r.firstContact));
    const unreadN = rooms.filter((r) => r.unread > 0).length;
    const firstRooms = rooms.filter((r) => r.firstContact);
    const fChip = (key, ko, en) => ({ label: this.L(ko, en), on: f === key, style: f === key ? 'background: var(--psoft); color: var(--pink);' : 'background: transparent; color: var(--ink2); box-shadow: inset 0 0 0 1px var(--line2);', pick: () => this.setState({ listFilter: key }) });
    const wp = this.writingPid();
    const n3 = this.noteById('n3');
    const meName = s.me.name;
    const home = s.set.home;
    const groups = rooms.filter((r) => r.kind === 'group');
    const dms = rooms.filter((r) => r.kind === 'dm');
    const writingRoom = st ? this.roomById(st.roomId) : null;
    const caRoom = firstRooms[0] || null;
    return {
      isB: home === 'B', isG: home === 'G', isD: home === 'D', isE: home === 'E', isF: home === 'F',
      draft: s.draft, chips, route, canSend, cantSend: !canSend, hasPicks: s.picks.length > 0,
      sendStyle: canSend ? 'background: var(--primary); color: var(--onprimary);' : 'background: var(--sunken2); color: var(--ink3);',
      pickLabel: typed ? this.L('이 이야기에 할 말이 있는 철학자', 'Philosophers with something to say') : this.L('함께 이야기할 철학자', 'Talk with'),
      pickHint: typed ? this.L('주제를 보고 골랐어요', 'Picked from your topic') : this.L('쓰면 주제를 보고 골라 드려요', 'Write and we will suggest'),
      routeHint: match ? this.L('같은 철학자들과 하던 방에 이어서 보내요', 'Continues the room you already have with them') : this.L('같은 철학자들과 하던 방이 있으면 그 방에 이어서 보내요', 'If you already have a room with them, it continues there'),
      gOpen: s.gFocus || typed, gClosed: !(s.gFocus || typed),
      hasLive: !!liveRoom,
      liveText: liveRoom ? this.L('지금 ' + this.ji(P[live.pid].name) + ' ‘' + this.roomTitle(liveRoom) + '’에서 쓰는 중…', this.nm(live.pid) + ' is writing in ‘' + this.roomTitle(liveRoom) + '’…') : '',
      openLive: () => { if (liveRoom) this.openRoom(liveRoom.id); },
      rows: rooms.map((r) => this.roomRow(r)), empty: !rooms.length,
      liveRow: liveRoom ? this.roomRow(liveRoom) : null,
      restRows: rooms.filter((r) => !liveRoom || r.id !== liveRoom.id).map((r) => this.roomRow(r)),
      listQ: s.listQ,
      dRows: dRooms.map((r) => this.roomRow(r)), dEmpty: !dRooms.length,
      dChips: [fChip('all', '전체', 'All'), fChip('unread', '안 읽음 ' + unreadN, 'Unread ' + unreadN), fChip('dm', '개인톡', 'Direct'), fChip('group', '단톡방', 'Groups'), fChip('first', '먼저 건넴', 'Reached out')],
      eTalk: s.eTab === 'talk', eFirst: s.eTab === 'first',
      eTalkStyle: s.eTab === 'talk' ? 'color: var(--ink); box-shadow: inset 0 -2px 0 var(--primary); font-weight: 800;' : 'color: var(--ink3); box-shadow: none; font-weight: 700;',
      eFirstStyle: s.eTab === 'first' ? 'color: var(--ink); box-shadow: inset 0 -2px 0 var(--primary); font-weight: 800;' : 'color: var(--ink3); box-shadow: none; font-weight: 700;',
      pickTalk: () => this.setState({ eTab: 'talk' }), pickFirst: () => this.setState({ eTab: 'first' }),
      firstCount: String(firstRooms.length), hasFirstCount: firstRooms.length > 0,
      eRows: (s.eTab === 'first' ? qRooms.filter((r) => r.firstContact) : qRooms.filter((r) => !r.firstContact)).map((r) => this.roomRow(r)),
      eEmpty: !(s.eTab === 'first' ? qRooms.filter((r) => r.firstContact) : qRooms.filter((r) => !r.firstContact)).length,
      notes: [{ me: true, phil: false, text: s.me.intro || this.L('한 마디 남기기', 'Add a note'), name: this.L('내 한 마디', 'My note'), initial: (meName || '나').slice(0, 1), hasPhoto: !!s.me.photo, noPhoto: !s.me.photo, photo: s.me.photo || '', open: () => this.openMyProfile(), hue: 'var(--ink2)' }]
        .concat(['ci', 'ca', 'ni', 'sh', 'so', 'au'].filter((p) => s.hidden.indexOf(p) < 0).map((pid) => ({
          me: false, phil: true, text: this.pf(pid, 'status'), name: this.nm(pid), av: this.av(pid, pid === wp ? 'var(--lamp)' : null), writing: pid === wp, hue: P[pid].hue,
          open: () => this.push('phil', { pid })
        }))),
      fGroupOpen: s.fOpen.group, fDmOpen: s.fOpen.dm,
      fGroupChevron: s.fOpen.group ? 'transform: none;' : 'transform: rotate(-90deg);',
      fDmChevron: s.fOpen.dm ? 'transform: none;' : 'transform: rotate(-90deg);',
      toggleFGroup: () => this.setState({ fOpen: Object.assign({}, s.fOpen, { group: !s.fOpen.group }) }),
      toggleFDm: () => this.setState({ fOpen: Object.assign({}, s.fOpen, { dm: !s.fOpen.dm }) }),
      fGroups: groups.filter((r) => qRooms.indexOf(r) >= 0).map((r) => this.roomRow(r)),
      fDms: dms.filter((r) => qRooms.indexOf(r) >= 0).map((r) => this.roomRow(r)),
      tileWriting: writingRoom ? '1' : '0', tileFirst: String(firstRooms.length), tileMemo: String(n3 && n3.unseen ? 1 : 0),
      openTileWriting: () => { if (writingRoom) this.openRoom(writingRoom.id); else this.toast(this.L('지금 쓰는 철학자가 없어요', 'Nobody is writing right now')); },
      openTileFirst: () => { if (caRoom) this.openRoom(caRoom.id); else this.toast(this.L('먼저 건넨 말이 없어요', 'No first messages')); },
      openTileMemo: () => this.openNote('n3'),
      meInitial: (meName || '나').slice(0, 1), meHasPhoto: !!s.me.photo, meNoPhoto: !s.me.photo, mePhoto: s.me.photo || ''
    };
  }

  vmPeople() {
    const s = this.state;
    const me = s.me;
    const q = s.peopleQ.trim().toLowerCase();
    const wp = this.writingPid();
    const n3 = this.noteById('n3');
    const caRoom = s.rooms.find((r) => r.id === 'dm-ca');
    const rows = ORDER.filter((pid) => s.hidden.indexOf(pid) < 0)
      .filter((pid) => !q || [P[pid].name, P[pid].full, P[pid].en, P[pid].enFull, this.pf(pid, 'tagline')].some((x) => x.toLowerCase().indexOf(q) >= 0))
      .map((pid) => {
        let badge = '';
        let badgeStyle = 'background: var(--psoft); color: var(--pink);';
        if (pid === wp) { badge = this.L('쓰는 중', 'Writing'); badgeStyle = 'background: var(--lampsoft); color: var(--lampink);'; }
        else if (pid === 'ca' && caRoom && caRoom.firstContact) { badge = this.L('먼저 건넴', 'Reached out'); badgeStyle = 'background: var(--lampsoft); color: var(--lampink);'; }
        else if (pid === 'ni' && n3 && n3.unseen) badge = this.L('여백 메모', 'Margin note');
        else if (pid === 'sh' && !s.feedSeen) badge = this.L('새 사유 노트', 'New reflection');
        return {
          name: this.fullName(pid), years: this.en() ? P[pid].enYears : P[pid].years, status: this.pf(pid, 'status'), hue: P[pid].hue,
          av: this.av(pid, pid === wp ? 'var(--lamp)' : null), writing: pid === wp,
          hasBadge: !!badge, badge, badgeStyle, open: () => this.push('phil', { pid })
        };
      });
    return {
      meName: me.name, meInitial: (me.name || '나').slice(0, 1), meIntro: me.intro || this.L('한 줄 소개를 써 보세요', 'Add a one-line intro'),
      hasPhoto: !!me.photo, noPhoto: !me.photo, photo: me.photo || '',
      rows, count: String(ORDER.length - s.hidden.length), searchOpen: s.peopleSearch, searchClosed: !s.peopleSearch, q: s.peopleQ,
      noResult: !rows.length, hasHidden: s.hidden.length > 0,
      hiddenLine: this.L('숨긴 철학자 ' + s.hidden.length + '명', s.hidden.length + ' hidden'),
      unhide: () => { this.setState({ hidden: [] }); this.toast(this.L('숨긴 철학자를 다시 보여 줘요', 'Hidden philosophers are back')); }
    };
  }

  vmFeed() {
    const s = this.state;
    const n3 = this.noteById('n3');
    const n2 = this.noteById('n2');
    const planned = [];
    if (n2 && n2.scheduled) planned.push({ av: this.av(n2.scheduled.pid), title: this.L(this.fmt(n2.scheduled.min) + ' · ' + P[n2.scheduled.pid].name + '의 댓글이 올 예정이에요', this.fmt(n2.scheduled.min) + ' · a comment from ' + this.nm(n2.scheduled.pid) + ' is coming'), sub: this.L('‘' + n2.title + '’ 노트 · 올리기 직전에 다시 확인해요', 'Note ‘' + n2.title + '’ · checked again right before posting'), open: () => this.openNote('n2') });
    for (const r of s.requests) {
      let sub;
      if (r.docTitle) sub = this.L('함께 읽은 ' + this.qj(r.docTitle, '을', '를') + ' 다시 읽고 써요', 'On ‘' + r.docTitle + '’, which you read together');
      else if (r.topic) sub = this.L('‘' + r.topic + '’에 대해 부탁했어요', 'You asked about ‘' + r.topic + '’');
      else sub = this.L('주제는 ' + this.ji(P[r.pid].name) + ' 골라요', this.nm(r.pid) + ' picks the topic');
      planned.push({ av: this.av(r.pid), title: this.L('내일 ' + this.feedTimeL() + ' · ' + P[r.pid].name + '의 사유 노트', 'Tomorrow ' + this.feedTimeL() + ' · reflection by ' + this.nm(r.pid)), sub, open: r.docId ? () => this.openDoc(r.roomId, r.docId) : () => {} });
    }
    for (const n of s.notes) for (const pid of (n.asked || [])) planned.push({ av: this.av(pid), title: this.L('내일 ' + this.feedTimeL() + ' · ' + P[pid].name + '의 여백 메모', 'Tomorrow ' + this.feedTimeL() + ' · margin note by ' + this.nm(pid)), sub: this.L('‘' + n.title + '’ 노트에 부탁했어요', 'Requested on ‘' + n.title + '’'), open: () => this.openNote(n.id) });
    const fi = s.set.feedItems;
    return {
      showReactions: fi.reactions && !!(n3 && n3.memos.length), showReflection: fi.reflections, showPlanned: fi.planned, showChat: fi.chat,
      nothing: !fi.reactions && !fi.reflections && !fi.planned && !fi.chat,
      niAv: this.av('ni'), shAv: this.av('sh'),
      openN3: () => this.openNote('n3'),
      comments: s.reflComments.map((c) => ({ text: c.text, t: this.L('나 · ', 'You · ') + this.fmt(c.min) })), hasComments: s.reflComments.length > 0,
      pendingText: this.L('쇼펜하우어의 답글은 내일 아침 피드로 와요', 'Schopenhauer’s reply arrives in tomorrow’s feed'),
      liked: s.liked, likeStyle: s.liked ? 'color: var(--ni);' : 'color: var(--ink2);', likeLabel: s.liked ? this.L('마음에 남김', 'Saved to heart') : this.L('마음에 남기기', 'Keep this'),
      likeFill: s.liked ? 'currentColor' : 'none',
      planned, hasPlanned: planned.length > 0, noPlanned: !planned.length,
      openNish: () => this.openRoom('nish'),
      endLine: this.L('내일 ' + this.feedTimeL() + '에 새 글이 와요', 'New posts arrive tomorrow at ' + this.feedTimeL())
    };
  }

  vmNotes() {
    const s = this.state;
    const filtered = s.notes.filter((n) => (s.noteType === 'all' || n.kind === s.noteType) && (!s.noteDay || n.day === s.noteDay));
    const groups = ['14', '13', '12'].map((d) => ({ label: this.L(NOTE_DAY[d][0], NOTE_DAY[d][1]), items: filtered.filter((n) => n.day === d).map((n) => this.noteCard(n)) })).filter((g) => g.items.length);
    const days = DAYS.map((row) => {
      const d = row[2];
      const has = s.notes.some((n) => n.day === d);
      const sel = s.noteDay ? s.noteDay === d : d === '14';
      const future = Number(d) > 14;
      return {
        dow: this.L(row[0], row[1]), d,
        style: sel ? 'background: var(--primary); color: var(--psoft);' : 'background: transparent; color: var(--ink3);',
        numStyle: sel ? 'color: var(--onprimary); font-weight: 800;' : (future ? 'color: var(--ink3); font-weight: 700;' : 'color: var(--ink); font-weight: 700;'),
        dot: has ? (sel ? 'background: var(--onprimary);' : 'background: var(--primary);') : 'background: transparent;',
        current: d === '14' ? 'date' : undefined, pressed: !!(s.noteDay && s.noteDay === d),
        pick: () => {
          if (!has) { this.toast(this.L('이 날은 노트가 없어요', 'No notes on this day')); return; }
          this.setState({ noteDay: s.noteDay === d ? null : d });
        }
      };
    });
    const typeChip = (key, ko, en) => ({ label: this.L(ko, en), on: s.noteType === key, style: s.noteType === key ? DARK_ON : DARK_OFF, pick: () => this.setState({ noteType: key }) });
    const scopeL = s.set.scope === 'me' ? this.L('나만', 'Only me') : this.L('허락한 철학자', 'Allowed philosophers');
    const acL = this.optLabel('autoComment');
    return {
      days, groups, empty: !groups.length && s.noteType !== 'about', aboutEmpty: !groups.length && s.noteType === 'about',
      addAbout: () => this.openAboutAdd(),
      filtering: !!s.noteDay,
      filterText: s.noteDay ? this.L((s.noteDay === '14' ? '오늘' : '10월 ' + s.noteDay + '일') + ' 노트만 보는 중', 'Showing ' + (s.noteDay === '14' ? 'today' : 'Oct ' + s.noteDay) + ' only') : '',
      types: [typeChip('all', '전체', 'All'), typeChip('own', '직접 쓴 노트', 'Written'), typeChip('talk', '대화 노트', 'From chats'), typeChip('about', '나에 대해', 'About me')],
      acL, scopeL
    };
  }
  noteCard(n) {
    if (n.kind === 'about') {
      const secs = n.sections.length;
      return {
        title: n.title, excerpt: n.sections.map((sc) => sc.title).join(' · '), isTalk: false, hasKind: true,
        kindL: this.L('나에 대해', 'About me'), kindStyle: 'background: var(--lampsoft); color: var(--lampink);',
        meta: this.L('대목 ' + secs + '개 · ', this.cnt(secs, 'section', 'sections') + ' · ') + this.fmt(n.min),
        onlyMe: !n.useOn, readers: [], hasReaders: false, sched: false, schedAv: null, schedText: '',
        hasNew: n.cands.length > 0, newText: this.L('확인할 후보 ', 'To review ') + n.cands.length,
        open: () => this.openAbout(n.id)
      };
    }
    const excerpt = n.paras.map((p) => (Array.isArray(p) ? p.map((x) => x.t).join('') : p)).join(' ');
    const kindL = n.kind === 'talk' ? this.L('대화 노트', 'Chat note') : this.L('직접 쓴 노트', 'Written note');
    return {
      title: n.title, excerpt, isTalk: n.kind === 'talk', hasKind: n.kind === 'talk', kindStyle: 'background: var(--psoft); color: var(--pink);', kindL, meta: kindL + ' · ' + this.fmt(n.min),
      onlyMe: !n.access.length && !n.scheduled, readers: n.access.map((p) => this.av(p)), hasReaders: n.access.length > 0 && !n.scheduled,
      sched: !!n.scheduled, schedAv: n.scheduled ? this.av(n.scheduled.pid) : null,
      schedText: n.scheduled ? this.L(P[n.scheduled.pid].name + ' 댓글 예정 · ' + this.fmt(n.scheduled.min), this.nm(n.scheduled.pid) + ' comment at ' + this.fmt(n.scheduled.min)) : '',
      hasNew: !!n.unseen, newText: this.L('새 여백 메모 ', 'New margin notes ') + (n.unseen || ''),
      open: () => this.openNote(n.id)
    };
  }

  vmRoom() {
    const top = this.screen('room');
    if (!top) return null;
    const r = this.roomById(top.id);
    if (!r) return null;
    const s = this.state;
    const items = [];
    let lastDay = null;
    for (const m of r.msgs) {
      if (m.day !== lastDay) { items.push({ divider: true, label: this.dayL(m.day) }); lastDay = m.day; }
      if (m.doc) {
        const dd = (r.docs || []).find((x) => x.id === m.doc);
        const gone = !dd || dd.removed;
        const busyD = !gone && dd.digest === 'busy';
        items.push({
          docMsg: true, t: this.fmt(m.min), docTitle: dd ? dd.title : m.text, docBusy: busyD, docGone: gone,
          docSub: gone ? this.L('방에서 내린 자료', 'Removed from this room') : (busyD ? this.L('읽는 중…', 'Reading…') : this.L('대목 ' + dd.sections.length + '개 · 이 방만 읽어요', this.cnt(dd.sections.length, 'section', 'sections') + ' · this room only')),
          openDoc: () => { if (!gone) this.openDoc(r.id, dd.id); }
        });
      } else if (m.from === 'me') items.push({ me: true, text: m.text, t: this.fmt(m.min) });
      else {
        const isDoc = !!(m.ref && m.ref.kind === 'doc');
        const rf = m.ref && !isDoc ? this.aboutSec(m.ref.noteId, m.ref.secId) : null;
        const dh = isDoc ? this.roomDoc(m.ref.roomId, m.ref.docId) : null;
        const ds = dh && !dh.doc.removed ? dh.doc.sections.find((x) => x.id === m.ref.secId) : null;
        items.push({
          phil: true, av: this.av(m.from), name: this.nm(m.from), hue: P[m.from].hue, to: m.to ? '→ ' + this.nm(m.to) : '', hasTo: !!m.to, text: m.text, t: this.fmt(m.min), first: !!m.first, cut: !!m.cut, openProfile: () => this.push('phil', { pid: m.from }),
          hasRef: !!rf || !!ds, refDoc: !!ds,
          refLabel: rf ? this.L('‘' + rf.sec.title + '’ 참고', 'Drew on ‘' + rf.sec.title + '’') : (ds ? this.L('‘' + ds.title + '’ 대목', '‘' + ds.title + '’') : ''),
          refStyle: ds ? 'background: var(--sunken); color: var(--ink2);' : 'background: var(--lampsoft); color: var(--lampink);',
          refAria: rf ? this.L('근거 보기 · ‘' + rf.note.title + '’의 ‘' + rf.sec.title + '’ 대목', 'See source · ‘' + rf.sec.title + '’ in ‘' + rf.note.title + '’') : (ds ? this.L('짚은 대목 보기 · ‘' + dh.doc.title + '’의 ‘' + ds.title + '’', 'See the passage · ‘' + ds.title + '’ in ‘' + dh.doc.title + '’') : ''),
          openRef: () => {
            if (rf) this.openSheet({ kind: 'aboutRef', noteId: m.ref.noteId, secId: m.ref.secId, pid: m.from });
            else if (ds) this.openSheet({ kind: 'docRef', roomId: m.ref.roomId, docId: m.ref.docId, secId: m.ref.secId, pid: m.from });
          }
        });
      }
    }
    const st = s.stream && s.stream.roomId === r.id ? s.stream : null;
    if (st) {
      if (lastDay !== 'today') items.push({ divider: true, label: this.dayL('today') });
      const base = { av: this.av(st.pid), name: this.nm(st.pid), hue: P[st.pid].hue, to: st.to ? '→ ' + this.nm(st.to) : '', hasTo: !!st.to, openProfile: () => this.push('phil', { pid: st.pid }) };
      items.push(Object.assign(base, st.phase === 'typing' ? { typing: true } : { streaming: true, text: st.shown }));
    }
    const waiting = s.queue.filter((j) => j.roomId === r.id);
    const blocked = waiting.length > 0 && !!s.stream && s.stream.roomId !== r.id;
    const addr = s.addressTo[r.id];
    const n = r.members.length;
    let placeholder;
    if (addr) placeholder = this.L(P[addr].name + '에게 말 걸기', 'Message ' + this.nm(addr));
    else if (r.kind === 'dm') placeholder = this.L(P[r.members[0]].name + '에게 말 걸기', 'Message ' + this.nm(r.members[0]));
    else placeholder = this.L(n === 2 ? '두 사람에게 말 걸기' : (n === 3 ? '세 사람에게 말 걸기' : n + '명에게 말 걸기'), 'Message all ' + n);
    const draft = s.roomDrafts[r.id] || '';
    const busy = !!st || waiting.length > 0;
    const wNames = waiting.map((j) => j.pid).filter((v, i, a) => a.indexOf(v) === i);
    return {
      title: this.roomTitle(r),
      sub: r.kind === 'dm' ? this.L('개인톡 · 기기 안 AI', 'Direct chat · on-device AI') : this.L('단톡방 · 철학자 ' + n + '명 · 기기 안 AI', 'Group · ' + n + ' philosophers · on-device AI'),
      heads: r.members.slice(0, 3).map((p, i) => Object.assign({ ml: i ? 'margin-left: -4px;' : '' }, this.av(p))),
      items, draft, placeholder, busy, idle: !busy, canSend: !!draft.trim() && !busy, cantSend: !(draft.trim() && !busy),
      sendStyle: draft.trim() && !busy ? 'background: var(--primary); color: var(--onprimary);' : 'background: var(--sunken2); color: var(--ink3);',
      hasWait: blocked,
      waitLine: blocked ? this.L('다른 방 답이 끝나면 ' + this.ji(wNames.map((p) => P[p].name).join('·')) + ' 이어서 답해요', this.names(wNames) + ' will reply when the other room finishes') : '',
      hasAddr: !!addr, addrText: addr ? this.L(P[addr].name + '에게만 말하는 중', 'Talking only to ' + this.nm(addr)) : '',
      clearAddr: () => this.setAddress(r.id, null),
      isGroup: r.kind === 'group',
      first: !!r.firstContact && r.kind === 'dm',
      whyOpen: !!s.whyOpen[r.id],
      toggleWhy: () => { const w = Object.assign({}, s.whyOpen); w[r.id] = !w[r.id]; this.setState({ whyOpen: w }); },
      firstLine: r.kind === 'dm' ? this.L(this.ji(P[r.members[0]].name) + ' 먼저 건넨 말이에요', this.nm(r.members[0]) + ' reached out first') : '',
      whyText: r.kind === 'dm' ? this.L(this.jn(P[r.members[0]].name) + ' 읽기를 허락한 ‘오늘 떠오른 질문’ 노트를 보고 먼저 말을 건넸어요. 먼저 연락은 하루 ' + s.set.maxPerDay + '번까지, 조용한 시간엔 보내지 않아요.', this.nm(r.members[0]) + ' read your note ‘오늘 떠오른 질문’, which you allowed, and wrote first. First messages come at most ' + s.set.maxPerDay + ' a day and never during quiet hours.') : '',
      empty: !r.msgs.length && !st
    };
  }

  vmRoomInfo() {
    const top = this.screen('roomInfo');
    if (!top) return null;
    const r = this.roomById(top.id);
    if (!r) return null;
    const seg = (key, def, opts) => opts.map((o) => {
      const on = (r[key] || def) === o[0];
      return { label: this.L(o[1], o[2]), on, style: on ? SEG_ON : SEG_OFF, pick: () => this.setRoom(r.id, (x) => { const y = Object.assign({}, x); y[key] = o[0]; return y; }) };
    });
    const autoHelp = { off: ['부른 철학자 한 명만 답해요', 'Only the one you address replies'], context: ['흐름이 이어질 때 몇 마디 더 주고받아요 (최대 2번)', 'A few more turns when the flow continues (up to 2)'], lively: ['철학자끼리 더 자주 이어 말해요 (최대 3번)', 'Philosophers talk among themselves more (up to 3)'] };
    const ah = autoHelp[r.auto || 'context'];
    const langOpts = [['app', '앱 언어 따르기', 'Follow app language'], ['msg', '내 메시지 언어 따르기', 'Follow my message'], ['ko', '항상 한국어', 'Always Korean'], ['en', '항상 영어', 'Always English']];
    return {
      title: this.roomTitle(r), cl: this.cluster(r.members), isGroup: r.kind === 'group', isDm: r.kind === 'dm',
      sub: r.kind === 'group' ? this.L('내가 만든 방 · 방 이름은 언제든 바꿀 수 있어요', 'Your room · rename anytime') : this.L('개인톡 · 이 철학자와 나만 봐요', 'Direct chat · just the two of you'),
      count: String(r.members.length),
      docs: (r.docs || []).filter((d) => !d.removed).slice().reverse().map((d) => ({
        title: d.title,
        sub: d.digest === 'busy' ? this.L('읽는 중…', 'Reading…') : this.L('대목 ' + d.sections.length + '개 · ', this.cnt(d.sections.length, 'section', 'sections') + ' · ') + this.fmt(d.min),
        open: () => this.openDoc(r.id, d.id)
      })),
      docCount: String((r.docs || []).filter((d) => !d.removed).length),
      addDoc: () => { this.setState({ stack: this.state.stack.filter((x) => x.kind !== 'roomInfo') }); this.openSheet({ kind: 'docAdd', id: r.id }); },
      members: r.members.map((pid) => ({
        name: this.fullName(pid), av: this.av(pid), canKick: r.members.length > 2, cantKick: r.members.length <= 2,
        kick: () => {
          if (r.members.length <= 2) return;
          this.setRoom(r.id, (x) => Object.assign({}, x, { members: x.members.filter((m) => m !== pid) }));
          this.toast(this.L(this.jl(P[pid].name) + ' 방에서 내보냈어요', 'Removed ' + this.nm(pid)), this.undoLabel(), () => this.setRoom(r.id, (x) => Object.assign({}, x, { members: x.members.concat([pid]) })));
        },
        open: () => this.push('phil', { pid })
      })),
      addMember: () => { this.setState({ pickSel: r.members.slice() }); this.push('pick', { mode: 'add', id: r.id }); },
      autoSeg: seg('auto', 'context', [['off', '끔', 'Off'], ['context', '맥락 따라', 'By context'], ['lively', '활발히', 'Lively']]),
      autoHelp: this.L(ah[0], ah[1]),
      debateSeg: seg('debate', 'some', [['off', '끔', 'Off'], ['some', '가끔', 'Rarely'], ['mid', '보통', 'Sometimes'], ['often', '자주', 'Often']]),
      depthSeg: seg('depth', 'balanced', [['soft', '부드럽게', 'Gentle'], ['balanced', '균형 있게', 'Balanced'], ['rigor', '엄밀하게', 'Rigorous']]),
      notifySeg: seg('notify', 'all', [['all', '모두', 'All'], ['mention', '멘션만', 'Mentions'], ['off', '끔', 'Off']]),
      engineSeg: seg('engine', 'device', [['device', '기기 안 AI', 'On-device'], ['cloud', 'Plus 클라우드', 'Plus cloud']]),
      engineHelp: (r.engine || 'device') === 'device' ? this.L('이 방의 답은 이 기기에서 만들어요. 인터넷 없이도 돼요.', 'Replies are made on this device. Works offline.') : this.L('이 방의 대화만 Plus 클라우드로 보내요. (프로토타입: 실제로 보내지 않아요)', 'Only this room goes to Plus cloud. (Prototype: nothing is sent)'),
      langs: langOpts.map((o) => {
        const on = (r.aiLang || 'app') === o[0];
        return { label: this.L(o[1], o[2]), on, dot: on ? 'background: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), 0 0 0 2px var(--primary);' : 'background: transparent; box-shadow: inset 0 0 0 2px var(--line2);', pick: () => this.setRoom(r.id, (x) => Object.assign({}, x, { aiLang: o[0] })) };
      }),
      feedSw: Object.assign(sw(r.toFeed !== false), { toggle: () => this.setRoom(r.id, (x) => Object.assign({}, x, { toFeed: x.toFeed === false })) }),
      exportChat: () => this.toast(this.L('대화를 Markdown으로 내보냈어요 (프로토타입)', 'Exported as Markdown (prototype)')),
      report: () => this.openSheet({ kind: 'report', id: r.id }),
      memory: () => this.push('memory'),
      archive: () => {
        this.setRoom(r.id, (x) => Object.assign({}, x, { archived: true }));
        this.setState({ stack: [] });
        this.toast(this.L('방을 보관했어요', 'Room archived'), this.undoLabel(), () => this.setRoom(r.id, (x) => Object.assign({}, x, { archived: false })));
      },
      remove: () => this.askConfirm(this.L('이 방을 지울까요?', 'Delete this room?'), this.L('대화와 이 방에서 나온 기억을 모두 지워요. 되돌릴 수 없어요.', 'Deletes the chat and memories from it. This cannot be undone.'), this.L('방 지우기', 'Delete room'), () => {
        this.setRoom(r.id, (x) => Object.assign({}, x, { deleted: true }));
        this.setState({ stack: [] });
        this.toast(this.L('방을 지웠어요', 'Room deleted'));
      })
    };
  }

  vmPick() {
    const top = this.screen('pick');
    if (!top) return null;
    const s = this.state;
    const room = top.mode === 'add' ? this.roomById(top.id) : null;
    const rows = ORDER.filter((pid) => s.hidden.indexOf(pid) < 0).map((pid) => {
      const fixed = !!(room && room.members.indexOf(pid) >= 0);
      const on = s.pickSel.indexOf(pid) >= 0;
      return {
        name: this.fullName(pid), years: this.en() ? P[pid].enYears : P[pid].years, hue: P[pid].hue, av: this.av(pid),
        on, fixed, sub: fixed ? this.L('이미 이 방에 있어요', 'Already in this room') : this.pf(pid, 'tagline'),
        box: on ? 'background: var(--primary); color: var(--onprimary); box-shadow: none;' : 'background: transparent; color: transparent; box-shadow: inset 0 0 0 2px var(--line2);',
        card: on ? RING_ON : RING_OFF,
        toggle: () => { if (!fixed) this.togglePickSel(pid); }
      };
    });
    const extra = room ? s.pickSel.filter((p) => room.members.indexOf(p) < 0).length : s.pickSel.length;
    let label;
    if (top.mode === 'add') label = extra ? this.L(extra + '명 부르기', 'Invite ' + extra) : this.L('부를 철학자를 골라 주세요', 'Pick someone to invite');
    else label = extra ? this.L(extra + '명과 이야기하기', 'Talk with ' + extra) : this.L('철학자를 골라 주세요', 'Pick philosophers');
    return {
      title: top.mode === 'add' ? this.L('철학자 추가', 'Invite philosophers') : (top.mode === 'new' ? this.L('새 대화', 'New chat') : this.L('함께할 철학자', 'Who to talk with')),
      note: top.mode === 'add' ? this.L('새로 부른 철학자는 이 방의 지난 대화를 읽지 않아요. 부른 다음부터 함께해요.', 'New members do not read earlier messages. They join from now on.') : this.L('고른 철학자들과 하던 방이 있으면 그 방으로 이어져요. 한 명만 고르면 개인톡이에요.', 'If you already have a room with them, it continues there. Pick one for a direct chat.'),
      rows, label, canConfirm: extra > 0, cantConfirm: !extra,
      confirmStyle: extra ? 'background: var(--primary); color: var(--onprimary);' : 'background: var(--sunken2); color: var(--ink3);'
    };
  }

  vmPhil() {
    const top = this.screen('phil');
    if (!top) return null;
    const s = this.state;
    const pid = top.pid;
    const p = P[pid];
    const nm = this.nm(pid);
    const groups = s.rooms.filter((r) => r.kind === 'group' && !r.deleted && r.members.indexOf(pid) >= 0);
    const allowed = s.notes.filter((n) => n.access.indexOf(pid) >= 0);
    const mems = s.memories.filter((m) => this.memPids(m).indexOf(pid) >= 0);
    const abouts = s.notes.filter((n) => n.kind === 'about' && n.useOn && n.digest === 'done');
    let secAll = 0;
    let secOk = 0;
    let secDm = 0;
    let secQuiet = 0;
    for (const n of abouts) {
      for (const sec of n.sections) {
        secAll += 1;
        if (this.pidsForSec(sec).indexOf(pid) < 0) continue;
        secOk += 1;
        if (sec.scope === 'dm') secDm += 1;
        if (sec.scope === 'quiet') secQuiet += 1;
      }
    }
    const aboutBits = [];
    if (secDm) aboutBits.push(this.L('개인톡에서만 ' + secDm + '개', secDm + ' in direct chats only'));
    if (secQuiet) aboutBits.push(this.L('알고만 있기 ' + secQuiet + '개', secQuiet + ' known but never raised'));
    aboutBits.push(this.L('대화와 이어질 때만 꺼내 봐요', 'Used only when the talk connects'));
    return {
      hasAbout: abouts.length > 0,
      readAbout: this.L('나에 대해 · 대목 ' + secAll + '개 중 ' + secOk + '개', 'About me · ' + secOk + ' of ' + this.cnt(secAll, 'section', 'sections')),
      readAboutSub: aboutBits.join(' · '),
      openAbout: () => { if (abouts[0]) this.openAbout(abouts[0].id); },
      pid, name: nm, full: this.fullName(pid), years: this.en() ? p.enYears : p.years, hue: p.hue, soft: p.soft,
      tagline: this.pf(pid, 'tagline'), manner: this.pf(pid, 'manner'), keys: this.pf(pid, 'keys').map((k) => ({ k })),
      av: this.av(pid), custom: !!s.custom[pid],
      readDm: this.L(p.name + ' 개인톡', 'Direct chat with ' + nm),
      readRooms: groups.length ? groups.map((r) => this.roomTitle(r)).join(', ') + this.L(' · 각 방 안에서만', ' · only inside each room') : this.L('아직 함께 있는 단톡방이 없어요', 'No shared groups yet'),
      readNotes: allowed.length ? this.L('읽기를 허락한 노트 ' + allowed.length + '개', allowed.length + ' allowed note' + (allowed.length > 1 ? 's' : '')) : this.L('읽기를 허락한 노트 없음', 'No allowed notes'),
      readNotesSub: allowed.length ? allowed.map((n) => '‘' + n.title + '’').join(', ') + this.L(' · 허락을 거두면 바로 읽지 않아요', ' · stops reading as soon as you revoke') : this.L('노트마다 읽기를 허락할 수 있어요', 'You can allow reading per note'),
      firstTitle: this.L(p.name + '의 먼저 연락', 'First messages from ' + nm),
      firstSw: Object.assign(sw(s.firstOn[pid] && s.set.firstContact), {
        toggle: () => {
          if (!this.state.set.firstContact) { this.toast(this.L('설정 › 알림과 먼저 연락에서 먼저 켜 주세요', 'Turn it on in Settings › Notifications first')); return; }
          const f = Object.assign({}, this.state.firstOn);
          f[pid] = !f[pid];
          this.setState({ firstOn: f });
        }
      }),
      firstSub: s.set.firstContact ? this.L('허락한 기록을 바탕으로 가끔 개인톡을 보내요 · 하루 최대 ' + s.set.maxPerDay + '번 · 조용한 시간 ' + this.quietL(), 'Occasionally writes first, based on what you allowed · up to ' + s.set.maxPerDay + ' a day · quiet ' + this.quietL()) : this.L('설정에서 먼저 연락이 꺼져 있어요', 'First messages are off in Settings'),
      mems: mems.map((m) => this.memItem(m, pid)), hasMems: mems.length > 0, noMems: !mems.length,
      works: p.works.map((w) => ({ title: this.L(w[0], w[2]), sub: this.L(w[1], w[3]) })),
      dm: () => this.openDm(pid),
      invite: () => this.openSheet({ kind: 'invite', pid }),
      reflections: () => { this.setState({ archPid: pid, archKind: 'all', archDay: null }); this.push('archive'); },
      changeImage: () => this.openSheet({ kind: 'img', pid }),
      forgetAll: () => this.askConfirm(this.L(p.name + '에게 모두 잊게 할까요?', 'Make ' + nm + ' forget everything?'), this.L(this.ji(p.name) + ' 기억하는 것을 모두 지워요. 대화 기록은 남아요.', 'Erases everything ' + nm + ' remembers. Chats stay.'), this.L('모두 잊게 하기', 'Forget all'), () => {
        const cur = this.state.memories;
        this.setState({
          memories: cur.filter((m) => m.kind === 'about' || m.pids.indexOf(pid) < 0).map((m) => (m.kind === 'about' && this.memPids(m).indexOf(pid) >= 0 ? Object.assign({}, m, { exclude: (m.exclude || []).concat([pid]) }) : m))
        });
        this.toast(this.L(this.ji(p.name) + ' 이제 아무것도 기억하지 않아요', nm + ' now remembers nothing'));
      }),
      hide: () => {
        this.setState({ hidden: s.hidden.concat([pid]), stack: this.state.stack.filter((x) => x.kind !== 'phil') });
        this.toast(this.L(this.jl(p.name) + ' 목록에서 숨겼어요', nm + ' hidden from lists'), this.undoLabel(), () => this.setState({ hidden: this.state.hidden.filter((h) => h !== pid) }));
      },
      hideLabel: this.L(this.jl(p.name) + ' 목록에서 숨기기', 'Hide ' + nm + ' from lists'),
      forgetLabel: this.L(p.name + '에게 모두 잊게 하기', 'Make ' + nm + ' forget everything')
    };
  }

  memItem(m, pid) {
    const lab = { guess: ['AI 추정', 'AI guess'], note: ['나의 노트에서', 'From my notes'], ok: ['확인함', 'Confirmed'], said: ['내가 말함', 'I said'], about: ['나에 대해', 'About me'] }[m.kind];
    const tone = m.kind === 'guess' ? 'background: var(--lampsoft); color: var(--lampink);' : (m.kind === 'note' || m.kind === 'about' ? 'background: var(--sunken); color: var(--ink2);' : 'background: var(--psoft); color: var(--pink);');
    const about = m.kind === 'about';
    return {
      label: this.L(lab[0], lab[1]), tone, text: m.text,
      source: about ? this.aboutSrcL(m) : this.L(m.src[0], m.src[1]),
      scope: about ? this.aboutScopeL(m) : this.L(m.scope[0], m.scope[1]),
      isGuess: m.kind === 'guess', notGuess: m.kind !== 'guess',
      priv: !!m.private && !!pid, privText: pid ? this.L(P[pid].name + '만 알아요 · 다른 철학자와 공유하지 않아요', 'Only ' + this.nm(pid) + ' knows · never shared') : '',
      pauseLabel: m.active ? this.L('사용 중지', 'Pause') : this.L('다시 쓰기', 'Resume'),
      textStyle: m.active || m.kind === 'guess' ? 'color: var(--ink);' : 'color: var(--ink3); text-decoration: line-through;',
      forget: () => {
        const prev = this.state.memories;
        if (about && pid) {
          this.setState({ memories: prev.map((x) => (x.id === m.id ? Object.assign({}, x, { exclude: (x.exclude || []).concat([pid]) }) : x)) });
          this.toast(this.L(this.ji(P[pid].name) + ' 이 기억을 잊었어요', this.nm(pid) + ' forgot this'), this.undoLabel(), () => this.setState({ memories: prev }));
          return;
        }
        this.setState({ memories: prev.filter((x) => x.id !== m.id) });
        this.toast(this.L('잊게 했어요', 'Forgotten'), this.undoLabel(), () => this.setState({ memories: prev }));
      },
      togglePause: () => this.setState({ memories: this.state.memories.map((x) => (x.id === m.id ? Object.assign({}, x, { active: !x.active }) : x)) }),
      yes: () => {
        this.setState({ memories: this.state.memories.map((x) => (x.id === m.id ? Object.assign({}, x, { kind: 'ok', scope: ['확인한 내용 · 같은 방에서만 써요', 'Confirmed · used only in that room'] }) : x)) });
        this.toast(this.L('확인했어요 · 이제 대화에 써요', 'Confirmed · now used in chats'));
      },
      no: () => {
        this.setState({ memories: this.state.memories.filter((x) => x.id !== m.id) });
        this.toast(this.L('아니라고 했어요 · 이 추정은 지웠어요', 'Marked wrong · guess deleted'));
      }
    };
  }

  vmMe() {
    const s = this.state;
    const m = s.meDraft || s.me;
    const name = (m.name || '').trim() || this.L('나', 'Me');
    const cover = COVERS.find((c) => c[0] === m.cover) || COVERS[0];
    const help = { tone: ['니체는 하오체, 소크라테스는 ‘자네’처럼 원래 말투를 살려요', 'Each keeps their own voice, like Nietzsche’s old-fashioned tone'], formal: ['모든 철학자가 존댓말로 말해요', 'Everyone speaks formally'], casual: ['모든 철학자가 편하게 말해요', 'Everyone speaks casually'] }[m.honor];
    return {
      name: m.name, intro: m.intro, birthday: m.birthday, initial: name.slice(0, 1),
      hasPhoto: !!m.photo, noPhoto: !m.photo, photo: m.photo || '',
      coverStyle: 'background: ' + cover[3] + ';',
      covers: COVERS.map((c) => ({
        label: this.L(c[1], c[2]), on: c[0] === m.cover,
        style: 'background: ' + c[3] + '; box-shadow: ' + (c[0] === m.cover ? '0 0 0 2px var(--bg), 0 0 0 4px var(--primary)' : 'inset 0 0 0 1px var(--line2)') + ';',
        pick: () => this.patchMe({ cover: c[0] })
      })),
      previews: ['ni', 'sh', 'so'].map((pid) => ({ av: this.av(pid), text: (this.en() ? P[pid].enCall : P[pid].call)[m.honor].replace('{n}', name) })),
      honor: [['tone', '말투대로', 'Their own voice'], ['formal', '모두 존댓말', 'All formal'], ['casual', '모두 편하게', 'All casual']].map((o) => ({ label: this.L(o[1], o[2]), on: m.honor === o[0], style: m.honor === o[0] ? SEG_ON : SEG_OFF, pick: () => this.patchMe({ honor: o[0] }) })),
      honorHelp: this.L(help[0], help[1]),
      shareSw: sw(m.introShare),
      interests: INTERESTS.map((t) => {
        const on = m.interests.indexOf(t[0]) >= 0;
        return { label: this.L(t[0], t[1]), on, style: on ? CHIP_ON : CHIP_OFF, pick: () => this.patchMe({ interests: on ? m.interests.filter((x) => x !== t[0]) : m.interests.concat([t[0]]) }) };
      }),
      bdayLabel: m.birthday ? m.birthday : this.L('정하지 않음', 'Not set'),
      about: (() => {
        const abouts = s.notes.filter((n) => n.kind === 'about');
        return { none: !abouts.length, some: abouts.length > 0, files: abouts.map((n) => this.aboutRow(n)), add: () => this.openAboutAdd() };
      })(),
      memLine: this.L('기억 ' + s.memories.filter((x) => x.kind !== 'guess').length + '개 · 확인할 AI 추정 ' + s.memories.filter((x) => x.kind === 'guess').length + '개', s.memories.filter((x) => x.kind !== 'guess').length + ' memories · ' + s.memories.filter((x) => x.kind === 'guess').length + ' AI guess to check')
    };
  }

  quietL() { return { q1: '22:00–07:00', q2: '23:00–08:00', none: this.L('없음', 'none') }[this.state.set.quiet]; }
  optDefs() {
    return {
      feedMin: { title: ['새 글이 오는 시간', 'When new posts arrive'], opts: [[360, '아침 6:00', '6:00 AM'], [420, '아침 7:00', '7:00 AM'], [480, '아침 8:00', '8:00 AM'], [540, '아침 9:00', '9:00 AM']], help: ['밤사이 쓴 글을 이때 한 번에 받아요', 'Posts written overnight arrive together at this time'] },
      autoReflect: { title: ['사유 노트 자동 작성', 'Automatic reflections'], opts: [['suggest', '대화 뒤에 제안하기', 'Suggest after a chat'], ['auto', '알아서 쓰기', 'Write on their own'], ['off', '끔', 'Off']], help: ['철학자가 대화를 계기로 자기 글을 쓰는 방식이에요', 'How philosophers write their own posts after a chat'] },
      quiet: { title: ['조용한 시간', 'Quiet hours'], opts: [['q1', '22:00–07:00', '22:00–07:00'], ['q2', '23:00–08:00', '23:00–08:00'], ['none', '없음', 'None']], help: ['이 시간엔 먼저 연락하지 않아요', 'No first messages during this time'] },
      scope: { title: ['새 노트의 기본 읽기 범위', 'Default reading access'], opts: [['me', '나만', 'Only me'], ['allowed', '허락한 철학자 (니체·쇼펜하우어)', 'Allowed (Nietzsche, Schopenhauer)']], help: ['노트마다 따로 바꿀 수 있어요', 'You can change it per note'] },
      autoComment: { title: ['노트 자동 댓글', 'Automatic margin notes'], opts: [['off', '끔', 'Off'], ['some', '가끔', 'Sometimes'], ['often', '자주', 'Often']], help: ['읽기를 허락한 노트에만 달려요', 'Only on notes you allowed'] }
    };
  }
  optLabel(key) {
    const d = this.optDefs()[key];
    const o = d.opts.find((x) => x[0] === this.state.set[key]) || d.opts[0];
    return this.L(o[1], o[2]);
  }
  openOpt(key) {
    const d = this.optDefs()[key];
    this.openSheet({ kind: 'options', key, title: this.L(d.title[0], d.title[1]), help: this.L(d.help[0], d.help[1]), opts: d.opts });
  }

  vmSettings() {
    const s = this.state;
    const st = s.set;
    const seg = (key, opts) => opts.map((o) => ({ label: o[1], on: st[key] === o[0], style: st[key] === o[0] ? SEG_ON : SEG_OFF, pick: () => this.setSet(key, o[0]) }));
    const sws = {};
    for (const k of ['feedNotify', 'chargeOnly', 'firstContact', 'lockHide', 'appLock', 'crash']) sws[k] = Object.assign(sw(!!st[k]), { toggle: () => this.setSet(k, !st[k]) });
    const customN = Object.keys(s.custom).length;
    const fi = st.feedItems;
    const fiL = [['reactions', '노트 반응', 'Note reactions'], ['reflections', '사유 노트', 'Reflections'], ['planned', '도착 예정', 'Coming up'], ['chat', '대화', 'Chats']].filter((x) => fi[x[0]]).map((x) => this.L(x[1], x[2])).join(' · ') || this.L('없음', 'Nothing');
    const home = HOMES.find((h) => h[0] === st.home);
    const ml = s.models.active === 'base' ? this.L('[기본 모델]', '[Base model]') : this.L('[가벼운 모델]', '[Light model]');
    return {
      lang: seg('lang', [['ko', '한국어'], ['en', 'English']]),
      langHelp: this.L('바꿔도 이미 쓴 글과 대화 원문은 그대로예요.', 'Existing notes and chats stay in their original language.'),
      aiLang: [['app', '앱 언어', 'App'], ['msg', '내 메시지', 'My message'], ['ko', '한국어', '한국어'], ['en', 'English', 'English']].map((o) => ({ label: this.L(o[1], o[2]), on: st.aiLang === o[0], style: st.aiLang === o[0] ? SEG_ON : SEG_OFF, pick: () => this.setSet('aiLang', o[0]) })),
      aiLangHelp: { app: this.L('앱 언어로 답해요', 'Replies in the app language'), msg: this.L('내가 쓴 언어로 답해요', 'Replies in the language you write'), ko: this.L('항상 한국어로 답해요', 'Always replies in Korean'), en: this.L('항상 영어로 답해요', 'Always replies in English') }[st.aiLang],
      theme: [['system', '시스템', 'System'], ['light', '라이트', 'Light'], ['dark', '다크', 'Dark']].map((o) => ({ label: this.L(o[1], o[2]), on: s.themePref === o[0], style: s.themePref === o[0] ? SEG_ON : SEG_OFF, pick: () => this.setState({ themePref: o[0] }) })),
      homeLabel: HOME_LETTER[home[0]] + ' · ' + this.L(home[1], home[2]),
      imgLine: customN ? this.L('앱 초상 ' + (6 - customN) + ' · 내 이미지 ' + customN, (6 - customN) + ' app portraits · ' + customN + ' mine') : this.L('지금은 모두 앱 초상 · 내 그림이나 사진으로 바꾸기', 'All app portraits · use your own pictures'),
      imgHeads: ['so', 'ni', 'sh'].map((pid, i) => Object.assign({ ml: i ? 'margin-left: -5px;' : '' }, this.av(pid))),
      modelLine: this.L('기기 안 AI · 무료', 'On-device AI · free'), modelSub: ml + this.L(' · 설치됨 · 오프라인 가능', ' · installed · works offline'),
      plusSub: this.L('더 깊은 대화를 위한 선택 · ', 'Optional, for deeper chats · ') + (st.plus ? this.L('켜짐', 'on') : this.L('꺼짐', 'off')),
      feedTime: this.feedTimeL(), feedItems: fiL, autoReflect: this.optLabel('autoReflect'),
      sw: sws,
      maxPerDay: [[1, '1번', 'Once'], [2, '2번', 'Twice'], [3, '3번', '3 times']].map((o) => ({ label: this.L(o[1], o[2]), on: st.maxPerDay === o[0], style: st.maxPerDay === o[0] ? SEG_ON : SEG_OFF, pick: () => this.setSet('maxPerDay', o[0]) })),
      maxLine: this.L('하루 ' + st.maxPerDay + '번까지', 'Up to ' + st.maxPerDay + ' a day'),
      firstOn: st.firstContact, quiet: this.quietL(), scope: this.optLabel('scope'), autoComment: this.optLabel('autoComment'),
      memLine: this.L(s.memories.length + '개 · 확인할 AI 추정 ' + s.memories.filter((x) => x.kind === 'guess').length + '개', s.memories.length + ' · ' + s.memories.filter((x) => x.kind === 'guess').length + ' AI guess to check'),
      reportsLine: s.reports.length ? this.L(s.reports.length + '건', String(s.reports.length)) : this.L('없음', 'None'),
      pickFeedTime: () => this.openOpt('feedMin'), pickReflect: () => this.openOpt('autoReflect'), pickQuiet: () => this.openOpt('quiet'),
      pickScope: () => this.openOpt('scope'), pickComment: () => this.openOpt('autoComment'),
      pickFeedItems: () => this.openSheet({ kind: 'feedItems' }),
      plus: () => this.openSheet({ kind: 'plus' }),
      exportAll: () => { this.setState({ exportStep: 0 }); this.openSheet({ kind: 'export' }); },
      wipe: () => this.askConfirm(this.L('모든 기록을 지울까요?', 'Erase everything?'), this.L('대화, 노트, 기억, 검색 색인까지 이 기기에서 지워요. 되돌릴 수 없어요.', 'Deletes chats, notes, memories and the search index from this device. This cannot be undone.'), this.L('모두 지우기', 'Erase all'), () => this.wipeAll()),
      aiInfo: () => this.openInfo('ai'), licenses: () => this.openInfo('licenses'), reports: () => this.openInfo('reports'),
      onboarding: () => this.openOnboarding()
    };
  }

  vmImages() {
    const s = this.state;
    return {
      graySw: sw(s.gray),
      cards: ORDER.map((pid) => ({
        name: this.nm(pid), hue: P[pid].hue, av: this.av(pid), custom: !!s.custom[pid],
        status: s.custom[pid] ? this.L('내 이미지', 'Mine') : this.L('앱 초상', 'App portrait'),
        statusStyle: s.custom[pid] ? 'background: var(--psoft); color: var(--pink); padding: 0 7px; border-radius: 6px; font-weight: 700;' : 'color: var(--ink3);',
        card: s.custom[pid] ? RING_ON : RING_OFF,
        open: () => this.openSheet({ kind: 'img', pid })
      }))
    };
  }

  vmCrop() {
    const c = this.state.crop;
    if (!c) return null;
    const g = this.state.gray ? GRAY : 'none';
    const editor = 'transform: translate(' + (c.ux * 100).toFixed(2) + '%, ' + (c.uy * 100).toFixed(2) + '%) scale(' + c.s.toFixed(3) + ') rotate(' + c.rot + 'deg); filter: ' + g + ';';
    const tf = 'translate(' + (c.ux / CROP_C * 100).toFixed(2) + '%, ' + (c.uy / CROP_C * 100).toFixed(2) + '%) scale(' + (c.s / CROP_C).toFixed(3) + ') rotate(' + c.rot + 'deg)';
    const name = (this.state.me.name || '').trim() || this.L('나', 'you');
    return {
      title: this.L(P[c.pid].name + ' 이미지 맞추기', 'Fit ' + this.nm(c.pid) + '’s image'),
      name: this.nm(c.pid), full: this.fullName(c.pid), years: this.en() ? P[c.pid].enYears : P[c.pid].years, status: this.pf(c.pid, 'status'),
      src: c.src, editor, pv: { src: c.src, img: 'filter: ' + g + '; transform: ' + tf + ';', ring: P[c.pid].hue, hue: P[c.pid].hue },
      zoom: c.s, grayOn: this.state.gray,
      grayLabel: this.state.gray ? this.L('흑백으로 맞춤', 'Grayscale on') : this.L('원래 색 그대로', 'Original colors'),
      grayStyle: this.state.gray ? 'background: #34343A; color: #F2F2F5; box-shadow: none;' : 'background: transparent; color: #ECECEF; box-shadow: inset 0 0 0 1px #3D3D44;',
      line: (this.en() ? P[c.pid].enCall : P[c.pid].call)[this.state.me.honor].replace('{n}', name)
    };
  }

  vmMemory() {
    const s = this.state;
    const f = s.memFilter;
    const items = s.memories.filter((m) => f === 'all' || (f === 'said' ? (m.kind === 'said' || m.kind === 'ok') : m.kind === f));
    const chip = (key, ko, en) => ({ label: this.L(ko, en), on: f === key, style: f === key ? DARK_ON : DARK_OFF, pick: () => this.setState({ memFilter: key }) });
    return {
      filters: [chip('all', '전체 ' + s.memories.length, 'All ' + s.memories.length), chip('said', '내가 말한 것', 'I said'), chip('note', '나의 노트에서', 'From notes'), chip('about', '나에 대해', 'About me'), chip('guess', 'AI 추정', 'AI guesses')],
      items: items.map((m) => {
        const ps = this.memPids(m);
        return Object.assign(this.memItem(m, m.private ? m.pids[0] : null), {
          heads: ps.slice(0, 6).map((p, i) => Object.assign({ ml: i ? 'margin-left: -4px;' : '' }, this.av(p))),
          nobody: !ps.length, somebody: ps.length > 0
        });
      }),
      empty: !items.length
    };
  }

  vmModels() {
    const m = this.state.models;
    const done = m.lightPct >= 100;
    return {
      baseActive: m.active === 'base', lightActive: m.active === 'light',
      lightDone: done, lightLoading: !done, lightCanUse: done && m.active !== 'light', lightInUse: done && m.active === 'light',
      pct: m.lightPct + '%', bar: 'width: ' + m.lightPct + '%;',
      lightLine: done ? this.L('받기 완료 · 바로 쓸 수 있어요', 'Downloaded · ready to use') : (m.lightPaused ? this.L('멈춤 · ' + m.lightPct + '% · 이어서 받을 수 있어요', 'Paused · ' + m.lightPct + '% · resume anytime') : this.L('받는 중 · ' + m.lightPct + '% · 끊겨도 이어서 받아요', 'Downloading · ' + m.lightPct + '% · resumes if interrupted')),
      pauseLabel: m.lightPaused ? this.L('이어 받기', 'Resume') : this.L('잠시 멈춤', 'Pause'),
      togglePause: () => this.setState({ models: Object.assign({}, m, { lightPaused: !m.lightPaused }) }),
      useLight: () => { this.setState({ models: Object.assign({}, m, { active: 'light' }) }); this.toast(this.L('[가벼운 모델]로 바꿨어요', 'Switched to [Light model]')); },
      useBase: () => { this.setState({ models: Object.assign({}, m, { active: 'base' }) }); this.toast(this.L('[기본 모델]로 바꿨어요', 'Switched to [Base model]')); },
      wifiSw: Object.assign(sw(this.state.set.wifiOnly), { toggle: () => this.setSet('wifiOnly', !this.state.set.wifiOnly) })
    };
  }

  vmArchive() {
    const s = this.state;
    const pids = ['all', 'ni', 'sh', 'ci', 'ca', 'so', 'au'];
    const list = ARCHIVE.filter((a) => (s.archKind === 'all' || a.kind === s.archKind) && (s.archPid === 'all' || a.pid === s.archPid || (a.pids && a.pids.indexOf(s.archPid) >= 0)) && (!s.archDay || a.day === s.archDay));
    const days = [];
    for (const a of list) {
      let g = days.find((d) => d.key === a.day);
      if (!g) { g = { key: a.day, label: this.L(ARCH_DAY[a.day][0], ARCH_DAY[a.day][1]), items: [] }; days.push(g); }
      if (a.kind === 'reflection') {
        const meta = [];
        if (a.quotes) meta.push(this.L('원전 인용 ' + a.quotes, a.quotes + ' source quote'));
        meta.push(this.L('댓글 ' + a.comments, a.comments + ' comments'));
        g.items.push({ isRefl: true, isMemo: false, av: this.av(a.pid), name: this.nm(a.pid), hue: P[a.pid].hue, time: this.fmt(a.min), title: a.title, text: a.text, origin: this.L(a.origin[0], a.origin[1]), meta: meta.join(' · '), comment: () => this.openSheet({ kind: 'comment' }) });
      } else {
        g.items.push({ isRefl: false, isMemo: true, heads: a.pids.map((p, i) => Object.assign({ ml: i ? 'margin-left: -3px;' : '' }, this.av(p))), text: this.L(a.text[0], a.text[1]), open: () => this.openNote(a.noteId) });
      }
    }
    return {
      pidChips: pids.map((p) => ({
        label: p === 'all' ? this.L('전체', 'All') : this.nm(p), all: p === 'all', notAll: p !== 'all', av: p === 'all' ? null : this.av(p),
        on: s.archPid === p, style: s.archPid === p ? CHIP_ON : CHIP_OFF, gap: s.archPid === p ? 'var(--psoft)' : 'var(--surface)',
        pick: () => this.setState({ archPid: p })
      })),
      kindChips: [['all', '전체', 'All'], ['reflection', '사유 노트', 'Reflections'], ['memo', '내 노트에 단 메모', 'Notes on my notes']].map((o) => ({ label: this.L(o[1], o[2]), on: s.archKind === o[0], style: s.archKind === o[0] ? DARK_ON : DARK_OFF, pick: () => this.setState({ archKind: o[0] }) })),
      days, empty: !days.length, dayFiltered: !!s.archDay,
      dayText: s.archDay ? this.L(ARCH_DAY[s.archDay][0] + ' 글만 보는 중', 'Showing ' + ARCH_DAY[s.archDay][1] + ' only') : ''
    };
  }

  vmNote() {
    const top = this.screen('note');
    if (!top) return null;
    const n = this.noteById(top.id);
    if (!n) return null;
    const s = this.state;
    const paras = n.paras.map((p) => ({
      segs: (Array.isArray(p) ? p : [{ t: p }]).map((x) => ({
        text: x.t, marked: !!x.mark, plain: !x.mark, num: x.mark ? String(x.num) : '',
        underline: x.mark ? 'text-decoration: underline; text-decoration-color: ' + P[x.mark].hue + '; text-decoration-thickness: 2px; text-underline-offset: 5px;' : '',
        badge: x.mark ? 'background: ' + P[x.mark].hue + ';' : '',
        label: x.mark ? this.L(P[x.mark].name + '의 여백 메모 ' + x.num, 'Margin note ' + x.num + ' by ' + this.nm(x.mark)) : ''
      }))
    }));
    const acL = this.optLabel('autoComment');
    const memos = n.memos.map((m) => {
      const key = n.id + ':' + m.id;
      return {
        av: this.av(m.pid), name: this.nm(m.pid), hue: P[m.pid].hue, num: String(m.num), badge: 'background: ' + P[m.pid].hue + ';',
        quote: m.quote, text: m.text, t: this.L('오늘 ', 'Today ') + this.fmt(m.min),
        replies: m.replies.map((r) => ({ text: r.text, t: this.L('나 · ', 'You · ') + this.fmt(r.min) })), hasReplies: m.replies.length > 0,
        pendingText: this.L(P[m.pid].name + '의 답글은 내일 아침 피드로 와요', this.nm(m.pid) + '’s reply arrives in tomorrow’s feed'),
        replyOpen: !!s.memoReplyOpen[key], replyText: s.memoReply[key] || '',
        canReply: !!(s.memoReply[key] || '').trim(), cantReply: !(s.memoReply[key] || '').trim(),
        toggleReply: () => { const o = Object.assign({}, s.memoReplyOpen); o[key] = !o[key]; this.setState({ memoReplyOpen: o }); },
        onReply: (e) => { const r = Object.assign({}, this.state.memoReply); r[key] = e.target.value; this.setState({ memoReply: r }); },
        sendReply: () => this.sendMemoReply(n.id, m.id),
        dm: () => this.openDm(m.pid),
        dmLabel: m.replies.length ? this.L('지금 개인톡에서 이야기하기', 'Talk now in direct chat') : this.L('개인톡에서 이어가기', 'Continue in direct chat'),
        whyOpen: !!s.memoWhy[key],
        toggleWhy: () => { const w = Object.assign({}, s.memoWhy); w[key] = !w[key]; this.setState({ memoWhy: w }); },
        whyText: this.L('읽기를 허락한 노트라서, 노트 자동 댓글 ‘' + acL + '’ 설정에 따라 ' + this.ji(P[m.pid].name) + ' 새벽에 남겼어요. 철학자의 글을 바탕으로 AI가 쓴 메모예요.', 'You allowed this note, so with automatic margin notes set to ‘' + acL + '’, ' + this.nm(m.pid) + ' left it overnight. It is written by AI based on the philosopher’s works.'),
        openProfile: () => this.push('phil', { pid: m.pid })
      };
    });
    const kindL = n.kind === 'talk' ? this.L('대화 노트', 'Chat note') : this.L('직접 쓴 노트', 'Written note');
    const dateL = this.L('10월 ' + n.day + '일', 'Oct ' + n.day);
    return {
      id: n.id, title: n.title, meta: dateL + ' · ' + this.fmt(n.min) + ' · ' + kindL, paras,
      readers: n.access.map((p) => this.av(p)), hasReaders: n.access.length > 0, noReaders: !n.access.length,
      accessLine: n.access.length ? this.L('자동 댓글 ' + acL + ' · 댓글 알림 켜짐 · 다른 철학자는 이 노트를 볼 수 없어요', 'Margin notes ' + acL.toLowerCase() + ' · notifications on · others cannot see this note') : this.L('어느 철학자도 이 노트를 읽지 않아요', 'No philosopher reads this note'),
      memos, hasMemos: memos.length > 0, noMemos: !memos.length, memoCount: String(memos.length),
      sched: !!n.scheduled, schedText: n.scheduled ? this.L(this.fmt(n.scheduled.min) + ' · ' + P[n.scheduled.pid].name + '의 댓글이 올 예정이에요', this.fmt(n.scheduled.min) + ' · a comment from ' + this.nm(n.scheduled.pid) + ' is coming') : '',
      asked: (n.asked || []).map((p) => ({ text: this.L(P[p].name + '의 여백 메모는 내일 아침 피드로 와요', this.nm(p) + '’s margin note arrives in tomorrow’s feed') })),
      hasAsked: !!(n.asked && n.asked.length),
      changeAccess: () => this.openSheet({ kind: 'access', id: n.id, pick: n.access.slice() }),
      edit: () => this.editNote(n.id),
      askMemo: () => this.openSheet({ kind: 'askMemo', id: n.id, pick: n.access.length ? [n.access[0]] : [] })
    };
  }

  vmNoteEdit() {
    const ne = this.state.noteEdit;
    if (!ne) return null;
    const can = !!(ne.title.trim() || ne.body.trim());
    const ab = !!ne.about;
    return {
      heading: ab ? (ne.id ? this.L('나에 대해 고치기', 'Edit about me') : this.L('나에 대해 쓰기', 'Write about me')) : (ne.id ? this.L('노트 고치기', 'Edit note') : this.L('새 노트', 'New note')),
      isAbout: ab, notAbout: !ab,
      bodyPh: ab ? this.L('## 제목 아래에 적어요', 'Write under each ## heading') : this.L('오늘 떠오른 생각을 적어 보세요', 'Write what came to mind today'),
      bodyStyle: ab ? 'height: 420px; font-family: inherit; font-size: 15.5px; line-height: 26px;' : '',
      title: ne.title, body: ne.body, can, cant: !can, onlyMe: !ne.access.length,
      saveStyle: can ? 'color: var(--pink);' : 'color: var(--ink3);',
      meChip: { style: !ne.access.length ? CHIP_ON : CHIP_OFF, pick: () => this.toggleEditAccess(null) },
      chips: ORDER.map((pid) => {
        const on = ne.access.indexOf(pid) >= 0;
        return { name: this.nm(pid), av: this.av(pid), on, style: on ? CHIP_ON : CHIP_OFF, gap: on ? 'var(--psoft)' : 'var(--surface)', pick: () => this.toggleEditAccess(pid) };
      }),
      accessHelp: ne.access.length ? this.L(this.names(ne.access) + '만 이 노트를 읽고 가끔 여백 메모를 남겨요', 'Only ' + this.names(ne.access) + ' can read this and leave margin notes') : this.L('나만 봐요. 철학자를 고르면 그 철학자만 읽을 수 있어요', 'Only you. Pick philosophers to let just them read it')
    };
  }

  vmDoc() {
    const top = this.screen('doc');
    if (!top) return null;
    const hit = this.roomDoc(top.roomId, top.docId);
    if (!hit || hit.doc.removed) return null;
    const room = hit.room;
    const d = hit.doc;
    const used = {};
    for (const m of room.msgs) {
      if (!m.ref || m.ref.kind !== 'doc' || m.ref.docId !== d.id) continue;
      const u = used[m.ref.secId] || (used[m.ref.secId] = []);
      if (u.indexOf(m.from) < 0) u.push(m.from);
    }
    const busy = d.digest === 'busy';
    const src = d.file && d.file.note ? this.L('내 노트에서', 'From my notes') : ((d.file && d.file.name) || '');
    const n = d.sections.length;
    return {
      title: d.title,
      meta: src + ' · ' + this.roomPlace(room) + ' · ' + this.L('대목 ' + n + '개', this.cnt(n, 'section', 'sections')),
      readers: room.members.map((p, i) => Object.assign({ ml: i ? 'margin-left: -4px;' : '' }, this.av(p))),
      readersLine: busy ? this.L('읽는 중…', 'Reading…') : this.L(room.members.map((p) => P[p].name).join('·') + ' 읽었어요', 'Read by ' + this.names(room.members)),
      busy, done: !busy, clipped: !!d.clipped,
      canSave: !d.savedNote && !(d.file && d.file.note),
      sections: d.sections.map((sec) => {
        const u = used[sec.id] || [];
        return {
          title: sec.title, text: sec.text, headed: !!d.headed, hasUsed: u.length > 0,
          usedLine: u.length ? this.L(this.ji(u.map((p) => P[p].name).join('·')) + ' 이 대목을 짚었어요', this.names(u) + ' pointed to this') : ''
        };
      }),
      ask: () => this.openAskDoc(room.id, d.id, null),
      saveNote: () => this.saveDocNote(room.id, d.id),
      remove: () => this.removeDoc(room.id, d.id)
    };
  }

  vmAbout() {
    const top = this.screen('about');
    if (!top) return null;
    const n = this.noteById(top.id);
    if (!n || n.kind !== 'about') return null;
    const s = this.state;
    const busy = n.digest === 'busy';
    const mems = s.memories.filter((m) => m.kind === 'about' && m.noteId === n.id);
    const usedBy = {};
    for (const r of s.rooms) {
      for (const m of r.msgs) {
        if (!m.ref || m.ref.noteId !== n.id) continue;
        const u = usedBy[m.ref.secId] || (usedBy[m.ref.secId] = []);
        if (u.indexOf(m.from) < 0) u.push(m.from);
      }
    }
    const src = n.file && n.file.typed ? this.L('앱에서 씀', 'Written in the app') : ((n.file && n.file.name) || '');
    const secN = n.sections.length;
    return {
      id: n.id, title: n.title,
      meta: src + this.L(' · 10월 14일 넣음 · 대목 ' + secN + '개', ' · added Oct 14 · ' + this.cnt(secN, 'section', 'sections')),
      busy, done: !busy, clipped: !!n.clipped,
      steps: ABOUT_STEP_L.map((st, i) => {
        const fin = !busy || n.step > i + 1;
        const now = busy && n.step === i + 1;
        return { label: this.L(st[0], st[1]), done: fin, now, todo: !fin && !now, style: fin ? 'color: var(--ink2);' : (now ? 'color: var(--ink); font-weight: 700;' : 'color: var(--ink3);') };
      }),
      summary: this.L('기억 ' + mems.length + '개 · 확인할 후보 ' + n.cands.length + '개', this.cnt(mems.length, 'memory', 'memories') + ' · ' + n.cands.length + ' to review'),
      hasCands: n.cands.length > 0,
      openCands: () => this.openAboutCands(n.id),
      useSw: Object.assign(sw(n.useOn), { toggle: () => this.toggleAboutUse(n.id) }),
      useSub: n.useOn ? this.L('대화와 이어지는 대목만 꺼내 봐요', 'Only sections that connect to the talk are used') : this.L('꺼져 있어요 · 어떤 대목도 쓰지 않아요', 'Off · no section is used'),
      memLine: this.L('이 자료에서 나온 기억 ' + mems.length + '개', this.cnt(mems.length, 'memory', 'memories') + ' from this file'),
      openMemory: () => { this.setState({ memFilter: 'about' }); this.push('memory'); },
      secCount: String(secN),
      sections: n.sections.map((sec) => {
        const used = usedBy[sec.id] || [];
        const off = !n.useOn || sec.scope === 'off';
        return {
          title: sec.title, text: sec.text,
          tags: sec.tags.map((t) => ({ label: this.L(TAG_L[t][0], TAG_L[t][1]) })), hasTags: sec.tags.length > 0,
          dated: sec.tags.indexOf('now') >= 0,
          scopeLabel: this.scopeLabel(sec),
          scopeStyle: off ? 'color: var(--ink3);' : 'color: var(--pink);',
          cardStyle: off ? 'background: var(--sunken); box-shadow: inset 0 0 0 1px var(--line);' : 'background: var(--surface); box-shadow: inset 0 0 0 1px var(--line);',
          hasUsed: used.length > 0,
          usedLine: used.length ? this.L('오늘 ' + this.ji(used.map((p) => P[p].name).join('·')) + ' 참고했어요', this.names(used) + ' drew on this today') : '',
          openScope: () => this.openAboutScope(n.id, sec.id)
        };
      }),
      more: () => this.openSheet({ kind: 'aboutMore', id: n.id })
    };
  }

  vmAboutCands() {
    const top = this.screen('aboutCands');
    if (!top) return null;
    const n = this.noteById(top.id);
    if (!n || n.kind !== 'about') return null;
    const items = n.cands.map((cd) => {
      const sec = n.sections.find((x) => x.id === cd.secId);
      const st = sec ? sec.title : '';
      const set = cd.kind === 'set';
      const cp = set ? SET_COPY[cd.copy] : null;
      const sub = set ? this.L(cp.sub[0], cp.sub[1]) : (cd.age ? this.L('나이는 날짜로 계산해요', 'Age is worked out from the date') : '');
      return {
        label: set ? this.L('설정 제안', 'Suggested setting') : this.L('기억 후보', 'Memory candidate'),
        tone: set ? 'background: var(--lampsoft); color: var(--lampink);' : 'background: var(--psoft); color: var(--pink);',
        source: this.L('‘' + st + '’ 대목에서', 'From ‘' + st + '’'),
        text: set ? this.L(cp.text[0], cp.text[1]) : cd.text,
        sub, hasSub: !!sub, dated: !!cd.dated,
        yesLabel: set ? this.L('바꾸기', 'Apply') : this.L('기억하기', 'Remember'),
        noLabel: set ? this.L('그대로 두기', 'Keep as is') : this.L('빼기', 'Skip'),
        yes: () => this.acceptCand(n.id, cd.id),
        no: () => this.dismissCand(n.id, cd.id)
      };
    });
    const facts = n.cands.filter((c) => c.kind === 'fact').length;
    return {
      intro: this.L(this.qj(n.title, '에서', '에서') + ' 찾았어요. 맞는 것만 기억해요. 기억한 내용도 대목의 참고 범위를 따라요.', 'Found in ‘' + n.title + '’. Keep only what is right. Memories follow each section’s scope.'),
      items, empty: !items.length,
      demo: n.cands.some((c) => c.demo),
      manyFacts: facts > 1,
      allLabel: this.L('기억 후보 ' + facts + '개 모두 기억하기', 'Remember all ' + facts),
      acceptAll: () => this.acceptAllCands(n.id)
    };
  }

  vmSearch() {
    const s = this.state;
    const q = s.searchQ.trim();
    const empty = { q: s.searchQ, has: false, none: false, hint: true, rooms: [], phils: [], notes: [], hasRooms: false, hasPhils: false, hasNotes: false };
    if (!q) return empty;
    const ql = q.toLowerCase();
    const rooms = this.visibleRooms().filter((r) => this.roomTitle(r).toLowerCase().indexOf(ql) >= 0 || r.msgs.some((m) => m.text.toLowerCase().indexOf(ql) >= 0)).map((r) => {
      const hit = r.msgs.slice().reverse().find((m) => m.text.toLowerCase().indexOf(ql) >= 0);
      const row = this.roomRow(r);
      if (hit) row.preview = hit.text;
      return row;
    });
    const phils = ORDER.filter((pid) => [P[pid].full, P[pid].enFull, this.pf(pid, 'tagline')].concat(this.pf(pid, 'keys')).some((k) => k.toLowerCase().indexOf(ql) >= 0)).map((pid) => ({ name: this.fullName(pid), hue: P[pid].hue, sub: this.pf(pid, 'tagline'), av: this.av(pid), open: () => this.push('phil', { pid }) }));
    const notes = s.notes.filter((n) => n.title.toLowerCase().indexOf(ql) >= 0 || n.paras.some((p) => (Array.isArray(p) ? p.map((x) => x.t).join('') : p).toLowerCase().indexOf(ql) >= 0)).map((n) => this.noteCard(n));
    const has = rooms.length + phils.length + notes.length > 0;
    return { q: s.searchQ, has, none: !has, hint: false, rooms, phils, notes, hasRooms: rooms.length > 0, hasPhils: phils.length > 0, hasNotes: notes.length > 0 };
  }

  vmHomeStyle() {
    const cur = this.state.set.home;
    return {
      opts: HOMES.map((h) => ({
        key: h[0], letter: HOME_LETTER[h[0]], name: this.L(h[1], h[2]), desc: this.L(h[3], h[4]), on: cur === h[0],
        card: cur === h[0] ? RING_ON : RING_OFF,
        dot: cur === h[0] ? 'background: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), 0 0 0 2px var(--primary);' : 'background: transparent; box-shadow: inset 0 0 0 2px var(--line2);',
        isB: h[0] === 'B', isG: h[0] === 'G', isD: h[0] === 'D', isE: h[0] === 'E', isF: h[0] === 'F',
        pick: () => { this.setSet('home', h[0]); this.toast(this.L('채팅 홈을 ‘' + h[1] + '’로 바꿨어요', 'Chat home set to ‘' + h[2] + '’')); }
      }))
    };
  }

  vmInfo() {
    const top = this.screen('info');
    if (!top) return null;
    const k = top.info;
    const v = { isAi: k === 'ai', isLic: k === 'licenses', isRep: k === 'reports' };
    v.title = { ai: this.L('AI 시뮬레이션 안내', 'About the AI simulation'), licenses: this.L('원전과 라이선스', 'Sources and licenses'), reports: this.L('신고 내역', 'Reports') }[k];
    if (k === 'licenses') v.groups = ORDER.map((pid) => ({ name: this.fullName(pid), hue: P[pid].hue, av: this.av(pid), works: P[pid].works.map((w) => ({ title: this.L(w[0], w[2]), sub: this.L(w[1], w[3]) })) }));
    if (k === 'reports') {
      v.items = this.state.reports.map((r) => ({ title: r.title, reason: r.reason, t: this.L('오늘 ', 'Today ') + this.fmt(r.min), status: this.L('검토 기록 · 이 기기에 저장', 'Logged on this device') }));
      v.none = !this.state.reports.length;
    }
    return v;
  }

  vmOnboard() {
    const i = this.state.onboard;
    if (!i) return null;
    const pages = [
      [this.L('철학자들과 이야기하는 곳', 'Talk with philosophers'), this.L('소크라테스부터 시오랑까지, 역사 속 철학자들과 일상을 이야기하고 생각을 노트로 남겨요.', 'From Socrates to Cioran, talk about everyday life with historical philosophers and keep your thoughts as notes.')],
      [this.L('철학자는 AI예요', 'The philosophers are AI'), this.L('역사 속 인물의 사상을 바탕으로 한 AI 시뮬레이션이에요. 실제 인물의 말이나 생각이 아니에요.', 'They are AI simulations based on historical thinkers. They are not the real people’s words or thoughts.')],
      [this.L('기록은 이 기기에만', 'Your records stay here'), this.L('대화·노트·기억은 이 기기에 저장되고, 계정 없이 써요. 기본 AI도 기기 안에서 돌아가요.', 'Chats, notes and memories are stored on this device, with no account. The default AI runs on the device too.')]
    ];
    const p = pages[i - 1];
    return {
      title: p[0], body: p[1], step: i, isFirst: i === 1, isMid: i === 2, isLast: i === 3,
      dots: [1, 2, 3].map((n) => ({ style: n === i ? 'width: 22px; background: var(--primary);' : 'width: 8px; background: var(--line2);' })),
      next: this.L(i === 3 ? '시작하기' : '다음', i === 3 ? 'Get started' : 'Next')
    };
  }

  vmSheet() {
    const sh = this.state.sheet;
    const s = this.state;
    const v = { open: !!sh, text: s.sheetText };
    if (!sh) return v;
    v['is_' + sh.kind] = true;
    if (sh.kind === 'img') {
      const pid = sh.pid;
      v.img = {
        title: this.L(P[pid].name + ' 이미지', this.nm(pid) + '’s image'), custom: !!s.custom[pid], app: !s.custom[pid], av: this.av(pid),
        appAv: { src: BLOB[pid], img: 'filter: ' + GRAY + '; transform: none;', ring: P[pid].hue },
        sub: s.custom[pid] ? this.L('지금은 내가 고른 이미지를 쓰고 있어요', 'Using your own picture now') : this.L('앨범이나 카메라로 바꿀 수 있어요', 'Change it with your album or camera')
      };
    }
    if (sh.kind === 'route') {
      const match = this.matchRoom(s.picks);
      v.route = {
        hasMatch: !!match, noMatch: !match, matchTitle: match ? this.roomTitle(match) : '', group: s.picks.length > 1,
        contStyle: !s.routeNew ? RING_ON : RING_OFF, newStyle: s.routeNew ? RING_ON : RING_OFF,
        contDot: !s.routeNew ? 'background: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), 0 0 0 2px var(--primary);' : 'background: transparent; box-shadow: inset 0 0 0 2px var(--line2);',
        newDot: s.routeNew ? 'background: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), 0 0 0 2px var(--primary);' : 'background: transparent; box-shadow: inset 0 0 0 2px var(--line2);',
        pickCont: () => this.setState({ routeNew: false, sheet: null }),
        pickNew: () => this.setState({ routeNew: true, sheet: null }),
        contTitle: match ? this.L('‘' + this.roomTitle(match) + '’에 이어서', 'Continue in ‘' + this.roomTitle(match) + '’') : '',
        newSub: this.names(s.picks) + this.L(' · 다른 이야기를 따로 나눌 때', ' · for a separate topic'),
        info: s.picks.length > 1 ? this.L(this.names(s.picks) + '와 하던 단톡방이 없어서 새로 만들어요', 'No group with ' + this.names(s.picks) + ' yet, so a new one is made') : this.L(P[s.picks[0]].name + ' 개인톡을 새로 열어요', 'Opens a new direct chat with ' + this.nm(s.picks[0]))
      };
    }
    if (sh.kind === 'mention') {
      const r = this.roomById(sh.id);
      const cur = s.addressTo[sh.id] || null;
      v.mention = {
        allStyle: !cur ? RING_ON : RING_OFF, pickAll: () => this.setAddress(sh.id, null),
        people: r ? r.members.map((pid) => ({ name: this.nm(pid), label: this.L(P[pid].name + '에게만', 'Only ' + this.nm(pid)), hue: P[pid].hue, av: this.av(pid), style: cur === pid ? RING_ON : RING_OFF, pick: () => this.setAddress(sh.id, pid) })) : []
      };
    }
    if (sh.kind === 'invite') {
      const pid = sh.pid;
      const rooms = s.rooms.filter((r) => r.kind === 'group' && !r.deleted && r.members.indexOf(pid) < 0);
      v.invite = {
        title: this.L(this.jl(P[pid].name) + ' 어느 방에 부를까요?', 'Invite ' + this.nm(pid) + ' to which room?'),
        rooms: rooms.map((r) => ({
          title: this.roomTitle(r), cl: this.cluster(r.members), sub: this.L('철학자 ' + r.members.length + '명', r.members.length + ' philosophers'),
          pick: () => {
            this.setRoom(r.id, (x) => Object.assign({}, x, { members: x.members.concat([pid]) }));
            this.setState({ sheet: null });
            this.toast(this.L(this.jl(P[pid].name) + ' ‘' + this.roomTitle(r) + '’에 불렀어요', 'Invited ' + this.nm(pid) + ' to ‘' + this.roomTitle(r) + '’'));
          }
        })),
        none: !rooms.length,
        newGroup: () => { this.setState({ sheet: null, picks: [pid], pickTouched: true, tab: 'chat', stack: [] }); this.toast(this.L('함께할 철학자를 더 고르고 말을 걸어 보세요', 'Pick more philosophers and start talking')); }
      };
    }
    if (sh.kind === 'askNote' || sh.kind === 'askMemo' || sh.kind === 'access') {
      const pool = sh.kind === 'askMemo' ? (this.noteById(sh.id) || { access: [] }).access : ORDER;
      const single = sh.kind !== 'access';
      v.pick = {
        chips: pool.map((pid) => {
          const on = s.sheetPick.indexOf(pid) >= 0;
          return { name: this.nm(pid), av: this.av(pid), on, style: on ? CHIP_ON : CHIP_OFF, gap: on ? 'var(--psoft)' : 'var(--surface)', pick: () => this.toggleSheetPick(pid, single) };
        }),
        empty: !pool.length, notEmpty: pool.length > 0,
        can: s.sheetPick.length > 0, cant: !s.sheetPick.length,
        btn: s.sheetPick.length ? 'background: var(--primary); color: var(--onprimary);' : 'background: var(--sunken2); color: var(--ink3);',
        accessHelp: s.sheetPick.length ? this.L(this.names(s.sheetPick) + '만 읽어요 · 다른 철학자는 볼 수 없어요', 'Only ' + this.names(s.sheetPick) + ' can read · others cannot') : this.L('아무도 고르지 않으면 나만 봐요', 'Pick no one to keep it private'),
        toAccess: () => { const id = sh.id; const n = this.noteById(id); this.openSheet({ kind: 'access', id, pick: n ? n.access.slice() : [] }); }
      };
    }
    if (sh.kind === 'comment') {
      v.comment = { can: !!s.sheetText.trim(), cant: !s.sheetText.trim(), btn: s.sheetText.trim() ? 'background: var(--primary); color: var(--onprimary);' : 'background: var(--sunken2); color: var(--ink3);' };
    }
    if (sh.kind === 'confirm') v.confirm = { title: sh.title, body: sh.body, okLabel: sh.okLabel };
    if (sh.kind === 'noteMore') {
      v.more = {
        edit: () => { this.setState({ sheet: null }); this.editNote(sh.id); },
        remove: () => this.askConfirm(this.L('이 노트를 지울까요?', 'Delete this note?'), this.L('여백 메모와 이 노트에서 나온 기억도 함께 지워요.', 'Margin notes and memories from it are deleted too.'), this.L('노트 지우기', 'Delete note'), () => {
          this.setState({ notes: this.state.notes.filter((n) => n.id !== sh.id), stack: this.state.stack.filter((x) => x.kind !== 'note') });
          this.toast(this.L('노트를 지웠어요', 'Note deleted'));
        })
      };
    }
    if (sh.kind === 'options') {
      v.options = {
        title: sh.title, help: sh.help,
        items: sh.opts.map((o) => {
          const on = s.set[sh.key] === o[0];
          return { label: this.L(o[1], o[2]), on, dot: on ? 'background: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), 0 0 0 2px var(--primary);' : 'background: transparent; box-shadow: inset 0 0 0 2px var(--line2);', pick: () => { this.setSet(sh.key, o[0]); this.setState({ sheet: null }); } };
        })
      };
    }
    if (sh.kind === 'feedItems') {
      const fi = s.set.feedItems;
      v.feedItems = [['reactions', '내 노트에 온 반응', 'Reactions to my notes'], ['reflections', '사유 노트', 'Reflections'], ['planned', '도착 예정', 'Coming up'], ['chat', '대화에서', 'From chats']].map((o) => ({
        label: this.L(o[1], o[2]), on: !!fi[o[0]],
        box: fi[o[0]] ? 'background: var(--primary); color: var(--onprimary); box-shadow: none;' : 'background: transparent; color: transparent; box-shadow: inset 0 0 0 2px var(--line2);',
        pick: () => { const n = Object.assign({}, this.state.set.feedItems); n[o[0]] = !n[o[0]]; this.setSet('feedItems', n); }
      }));
    }
    if (sh.kind === 'plus') {
      v.plus = { sw: Object.assign(sw(s.set.plus), { toggle: () => this.setSet('plus', !this.state.set.plus) }), state: s.set.plus ? this.L('켜짐 · 고른 대화만 보내요 (프로토타입: 실제로 보내지 않아요)', 'On · only chosen chats are sent (prototype: nothing is sent)') : this.L('꺼짐 · 모든 답을 기기 안에서 만들어요', 'Off · every reply is made on this device') };
    }
    if (sh.kind === 'report') {
      v.report = {
        reasons: [['위험하거나 해로운 말', 'Harmful or dangerous'], ['사실과 다른 정보', 'False information'], ['인물을 왜곡함', 'Misrepresents the person'], ['기타', 'Other']].map((o) => {
          const lab = this.L(o[0], o[1]);
          const on = s.sheetPick[0] === lab;
          return { label: lab, on, dot: on ? 'background: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), 0 0 0 2px var(--primary);' : 'background: transparent; box-shadow: inset 0 0 0 2px var(--line2);', pick: () => this.toggleSheetPick(lab, true) };
        }),
        can: s.sheetPick.length > 0, cant: !s.sheetPick.length,
        btn: s.sheetPick.length ? 'background: var(--danger); color: var(--ondanger);' : 'background: var(--sunken2); color: var(--ink3);'
      };
    }
    if (sh.kind === 'archDay') {
      v.archDays = [['1014'], ['1012'], ['1002']].map((o) => ({
        label: this.L(ARCH_DAY[o[0]][0], ARCH_DAY[o[0]][1]), on: s.archDay === o[0],
        dot: s.archDay === o[0] ? 'background: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), 0 0 0 2px var(--primary);' : 'background: transparent; box-shadow: inset 0 0 0 2px var(--line2);',
        pick: () => this.setState({ archDay: o[0], sheet: null })
      }));
    }
    if (sh.kind === 'export') {
      v.exp = { idle: s.exportStep === 0, busy: s.exportStep === 1, done: s.exportStep === 2, line: this.L('대화 ' + s.rooms.length + '개 · 노트 ' + s.notes.length + '개 · 기억 ' + s.memories.length + '개', s.rooms.length + ' chats · ' + s.notes.length + ' notes · ' + s.memories.length + ' memories') };
    }
    if (sh.kind === 'aboutAdd') {
      v.aboutAdd = { sampleSub: this.L('예시 ‘' + ABOUT_SAMPLE.ko.name + '’로 흐름을 써 봐요', 'Walk through the flow with ‘' + ABOUT_SAMPLE.en.name + '’') };
    }
    if (sh.kind === 'aboutMore') {
      const n = this.noteById(sh.id);
      v.aboutMore = {
        canReplace: !!(n && n.file && !n.file.typed),
        edit: () => { this.setState({ sheet: null }); this.editNote(sh.id); },
        remove: () => this.removeAbout(sh.id)
      };
    }
    if (sh.kind === 'aboutScope') {
      const info = this.aboutSec(sh.id, sh.secId);
      const d = s.scopeDraft || { scope: 'all', pick: [] };
      const t = info ? info.sec.title : '';
      const ok = !(d.scope === 'pick' && !d.pick.length);
      v.scope = {
        title: this.L('‘' + t + '’ 대목은 누가 참고할까요?', 'Who may draw on ‘' + t + '’?'),
        opts: SCOPES.map((o) => {
          const on = d.scope === o[0];
          return {
            label: this.L(o[1], o[2]), desc: this.L(o[3], o[4]), on,
            dot: on ? 'background: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), 0 0 0 2px var(--primary);' : 'background: transparent; box-shadow: inset 0 0 0 2px var(--line2);',
            pick: () => this.setState({ scopeDraft: Object.assign({}, this.state.scopeDraft || d, { scope: o[0] }) })
          };
        }),
        isPick: d.scope === 'pick',
        chips: ORDER.map((pid) => {
          const on = d.pick.indexOf(pid) >= 0;
          return {
            name: this.nm(pid), av: this.av(pid), on, style: on ? CHIP_ON : CHIP_OFF, gap: on ? 'var(--psoft)' : 'var(--surface)',
            pick: () => {
              const cur = this.state.scopeDraft || d;
              const pk = cur.pick.indexOf(pid) >= 0 ? cur.pick.filter((p) => p !== pid) : cur.pick.concat([pid]);
              this.setState({ scopeDraft: Object.assign({}, cur, { pick: pk }) });
            }
          };
        }),
        pickHelp: d.pick.length ? this.L(this.names(d.pick) + '만 이 대목을 알아요', 'Only ' + this.names(d.pick) + ' will know it') : this.L('한 명 이상 골라 주세요', 'Pick at least one'),
        can: ok, cant: !ok,
        btn: ok ? 'background: var(--primary); color: var(--onprimary);' : 'background: var(--sunken2); color: var(--ink3);'
      };
    }
    if (sh.kind === 'aboutRef') {
      const info = this.aboutSec(sh.noteId, sh.secId);
      const pid = sh.pid;
      const off = !!(info && info.sec.scope === 'off');
      v.ref = {
        av: this.av(pid),
        line: info ? this.L(this.ji(P[pid].name) + ' ‘' + info.note.title + '’의 ‘' + info.sec.title + '’ 대목을 참고했어요', this.nm(pid) + ' drew on ‘' + info.sec.title + '’ in ‘' + info.note.title + '’') : this.L('지운 자료예요', 'This file was deleted'),
        excerpt: info ? info.sec.text : '',
        scopeLine: info ? this.L('지금 참고 범위 · ', 'Who may use it now · ') + this.scopeLabel(info.sec) + (info.note.useOn ? '' : this.L(' (자료 참고 꺼짐)', ' (file turned off)')) : '',
        isOff: off, notOff: !off,
        open: () => { this.setState({ sheet: null }); if (info) this.openAbout(info.note.id); },
        stop: () => {
          if (!info) return;
          const prev = { scope: info.sec.scope, pick: info.sec.pick.slice() };
          this.setSecScope(info.note.id, info.sec.id, 'off', null);
          this.setState({ sheet: null });
          this.toast(this.L('‘' + info.sec.title + '’ 대목은 이제 쓰지 않아요', '‘' + info.sec.title + '’ will no longer be used'), this.undoLabel(), () => this.setSecScope(info.note.id, info.sec.id, prev.scope, prev.pick));
        },
        resume: () => {
          if (!info) return;
          this.setSecScope(info.note.id, info.sec.id, 'all', null);
          this.setState({ sheet: null });
          this.toast(this.L('‘' + info.sec.title + '’ 대목을 다시 모두 참고해요', 'Everyone may use ‘' + info.sec.title + '’ again'));
        }
      };
    }
    if (sh.kind === 'docAdd') {
      const r = this.roomById(sh.id);
      const notes = s.notes.filter((n) => n.kind !== 'about').slice(0, 3);
      const lang = s.set.lang === 'en' ? 'en' : 'ko';
      let sub = '';
      if (r && r.kind === 'dm') sub = this.L(P[r.members[0]].name + '만 읽어요. 다른 방이나 피드에는 쓰지 않아요.', 'Only ' + this.nm(r.members[0]) + ' reads it — never other rooms or the feed.');
      else if (r) sub = this.L('이 방 철학자 ' + r.members.length + '명만 읽어요. 다른 방이나 피드에는 쓰지 않아요.', 'Only the ' + r.members.length + ' philosophers here read it — never other rooms or the feed.');
      v.docAdd = {
        sub,
        notes: notes.map((n) => ({
          title: n.title,
          meta: this.L('10월 ' + n.day + '일 · ', 'Oct ' + n.day + ' · ') + (n.kind === 'talk' ? this.L('대화 노트', 'Chat note') : this.L('직접 쓴 노트', 'Written note')),
          pick: () => this.shareNoteDoc(sh.id, n.id)
        })),
        hasNotes: notes.length > 0,
        sampleSub: '‘' + DOC_SAMPLE[lang].name + '’'
      };
    }
    if (sh.kind === 'docRef') {
      const hit = this.roomDoc(sh.roomId, sh.docId);
      const sec = hit && !hit.doc.removed ? hit.doc.sections.find((x) => x.id === sh.secId) : null;
      const pid = sh.pid;
      v.docRef = {
        av: this.av(pid),
        line: sec ? this.L(this.ji(P[pid].name) + ' ‘' + hit.doc.title + '’의 ‘' + sec.title + '’ 대목을 짚었어요', this.nm(pid) + ' pointed to ‘' + sec.title + '’ in ‘' + hit.doc.title + '’') : this.L('방에서 내린 자료예요', 'This file was removed'),
        excerpt: sec ? sec.text : '',
        open: () => { this.setState({ sheet: null }); this.openDoc(sh.roomId, sh.docId); },
        ask: () => this.openAskDoc(sh.roomId, sh.docId, pid)
      };
    }
    if (sh.kind === 'askDoc') {
      const hit = this.roomDoc(sh.roomId, sh.docId);
      const pool = hit ? hit.room.members : [];
      v.askDoc = {
        docTitle: hit ? '‘' + hit.doc.title + '’' : '',
        chips: pool.map((pid) => {
          const on = s.sheetPick.indexOf(pid) >= 0;
          return { name: this.nm(pid), av: this.av(pid), on, style: on ? CHIP_ON : CHIP_OFF, gap: on ? 'var(--psoft)' : 'var(--surface)', pick: () => this.toggleSheetPick(pid, true) };
        }),
        can: s.sheetPick.length > 0, cant: !s.sheetPick.length,
        btn: s.sheetPick.length ? 'background: var(--primary); color: var(--onprimary);' : 'background: var(--sunken2); color: var(--ink3);'
      };
    }
    return v;
  }

  // ---------- render ----------
  renderVals() {
    const s = this.state;
    const totalUnread = s.rooms.filter((r) => !r.archived && !r.deleted).reduce((a, r) => a + r.unread, 0);
    const show = {};
    const z = {};
    s.stack.forEach((x, i) => { show[x.kind] = true; z[x.kind] = 'z-index: ' + (10 + i) + ';'; });
    const disp = (t) => (s.tab === t ? 'display: flex;' : 'display: none;');
    const t = s.toast;
    const ob = this.vmOnboard();
    return {
      t: this.en() ? T_EN : T_KO,
      rootClass: this.isDark() ? 'ag dark' : 'ag',
      isEn: this.en(), isKo: !this.en(),
      tabDisp: { people: disp('people'), chat: disp('chat'), feed: disp('feed'), notes: disp('notes') },
      nav: this.vmNav(totalUnread),
      show, z,
      people: this.vmPeople(), chat: this.vmChat(), feed: this.vmFeed(), notes: this.vmNotes(),
      room: show.room ? this.vmRoom() : null,
      roomInfo: show.roomInfo ? this.vmRoomInfo() : null,
      pick: show.pick ? this.vmPick() : null,
      phil: show.phil ? this.vmPhil() : null,
      me: show.myProfile ? this.vmMe() : null,
      settings: show.settings ? this.vmSettings() : null,
      images: show.philImages ? this.vmImages() : null,
      crop: show.crop ? this.vmCrop() : null,
      memory: show.memory ? this.vmMemory() : null,
      models: show.models ? this.vmModels() : null,
      archive: show.archive ? this.vmArchive() : null,
      note: show.note ? this.vmNote() : null,
      edit: show.noteEdit ? this.vmNoteEdit() : null,
      search: show.search ? this.vmSearch() : null,
      homeStyle: show.homeStyle ? this.vmHomeStyle() : null,
      info: show.info ? this.vmInfo() : null,
      about: show.about ? this.vmAbout() : null,
      doc: show.doc ? this.vmDoc() : null,
      cands: show.aboutCands ? this.vmAboutCands() : null,
      ob, hasOb: !!ob,
      sheet: this.vmSheet(),
      toast: { show: !!t, text: t ? t.text : '', hasAction: !!(t && t.label), label: t ? t.label : '' },
      dateLine: this.L('10월 14일 수요일 아침', 'Wednesday morning, October 14'),
      feedDate: this.L('10월 14일 수요일', 'Wednesday, October 14'),
      fn: {
        goBack: this.goBack, closeSheet: this.closeSheet, onDraft: this.onDraft, onRoomDraft: this.onRoomDraft, onRoomKey: this.onRoomKey,
        sendHome: this.sendHome, sendRoom: this.sendRoom, stopHere: this.stopHere, openRoute: this.openRoute, openMention: this.openMention,
        openPickCompose: this.openPickCompose, openPickNew: this.openPickNew, pickConfirm: this.pickConfirm, openSearch: this.openSearch, onSearchQ: this.onSearchQ,
        openSettings: this.openSettings, openMyProfile: this.openMyProfile, togglePeopleSearch: this.togglePeopleSearch, onPeopleQ: this.onPeopleQ,
        onCropDown: this.onCropDown, onCropMove: this.onCropMove, onCropUp: this.onCropUp, onZoom: this.onZoom, cropRotate: this.cropRotate,
        toggleGray: this.toggleGray, cropApply: this.cropApply, onPickFile: this.onPickFile, useSample: this.useSample,
        resetImage: this.resetImage, recrop: this.recrop, onMeName: this.onMeName, onMeIntro: this.onMeIntro, onMeBirthday: this.onMeBirthday,
        onMePhoto: this.onMePhoto, saveMe: this.saveMe, cycleCover: this.cycleCover, toggleIntroShare: this.toggleIntroShare, clearMePhoto: this.toggleMeDraftPhotoClear,
        openArchive: this.openArchive, openAskNote: this.openAskNote, onSheetText: this.onSheetText, submitAskNote: this.submitAskNote,
        submitComment: this.submitComment, openComment: this.openComment, newNote: this.newNote, onEditTitle: this.onEditTitle,
        onEditBody: this.onEditBody, saveNote: this.saveNote, setScrollEl: this.setScrollEl, focusEl: this.focusEl, toastAct: this.toastAct,
        openMemory: this.openMemory, openModels: this.openModels, openImages: this.openImages,
        clearNoteDay: this.clearNoteDay, confirmOk: this.confirmOk, submitAccess: this.submitAccess, submitAskMemo: this.submitAskMemo,
        openRoomInfo: this.openRoomInfo, openNoteMore: this.openNoteMore, onListQ: this.onListQ, gFocusOn: this.gFocusOn, openHomeStyle: this.openHomeStyle,
        obNext: this.obNext, obSkip: this.obSkip, toggleLike: this.toggleLike, openArchDay: this.openArchDay, clearArchDay: this.clearArchDay,
        submitReport: this.submitReport, doExport: this.doExport, goPeople: () => this.goTab('people'), goNotes: () => this.goTab('notes'),
        openAboutAdd: this.openAboutAdd, onAboutFile: this.onAboutFile, onAboutReplace: this.onAboutReplace, useAboutSample: this.useAboutSample,
        useAboutTemplate: this.useAboutTemplate, saveAboutScope: this.saveAboutScope,
        openDocAdd: this.openDocAdd, onDocFile: this.onDocFile, useDocSample: this.useDocSample, submitAskDoc: this.submitAskDoc
      }
    };
  }
}
