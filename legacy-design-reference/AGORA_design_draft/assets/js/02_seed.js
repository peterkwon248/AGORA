/* ---------- seed world (demo content, written per language) ---------- */
function nm(id, L, kind) {
  var n = pn(id, L);
  if (L !== 'ko' || !kind) return n;
  if (kind === 'ga') return jo(n, '이', '가');
  if (kind === 'neun') return jo(n, '은', '는');
  if (kind === 'wa') return jo(n, '과', '와');
  if (kind === 'eul') return jo(n, '을', '를');
  if (kind === 'wae') return jo(n, '과의', '와의');
  return n;
}
function txt(L, ko, en) { return L === 'ko' ? ko : en; }

function seedWorld(L) {
  var S = STR[L];
  function M(id, a, k, ko, en, x) {
    var m = { id: id, a: a, k: k, t: txt(L, ko, en), time: '', reply: null, to: null, mn: [], eng: 'local', priv: false, temp: false };
    if (x) Object.keys(x).forEach(function (key) { m[key] = x[key]; });
    return m;
  }
  function notice(id) { return M(id, 'sys', 'notice', STR.ko.noticeG, STR.en.noticeG); }
  function dmNotice(id, pid) { return M(id, 'sys', 'notice', fill(STR.ko.noticeD, { n: nm(pid, 'ko', 'neun') }), fill(STR.en.noticeD, { n: pn(pid, 'en') })); }
  function day(id, ko, en) { return M(id, 'sys', 'day', ko, en); }
  var D13 = ['10월 13일 화요일', 'Tuesday, October 13'], D12 = ['10월 12일 월요일', 'Monday, October 12'], D11 = ['10월 11일 일요일', 'Sunday, October 11'];
  var def = function (o) { return Object.assign({ auto: 'contextual', freq: 'rare', int: 'balanced', notify: 'all', lang: 'app', eng: 'local' }, o || {}); };

  var rooms = {};
  rooms.plaza = {
    id: 'plaza', kind: 'group', name: txt(L, '철학자들의 광장', 'The Plaza'), desc: txt(L, '모든 철학자가 함께하는 기본 방이에요. 매번 모두가 답하지는 않아요.', 'The default room with every philosopher. Not everyone answers every time.'),
    members: ORDER.map(function (id) { return { id: id, type: 'fixed' }; }), set: def({ auto: 'contextual', freq: 'rare', int: 'balanced' }),
    pinned: true, unread: 1, archived: false, sort: 900, last: '08:47',
    msgs: [
      notice('p0'), day('pd', D13[0], D13[1]),
      M('p1', 'me', 'text', '빗속의 출근길에서 오랜만에 유재하를 만났다. 오랜만에 듣는 그의 목소리가 더 깊고 묵직하다.', 'Ran into Yoo Jae-ha on my rainy commute—haven’t heard his voice in ages. It sounds deeper, heavier now.', { time: '08:42' }),
      M('p2', 'ca', 'text', '비 오는 출근길에 그 목소리라니, 좋은 아침이네요. 어떤 노래였어요?', 'That voice on a rainy commute—what a morning. Which song was it?', { time: '08:43' }),
      M('p3', 'sh', 'text', '음악은 다른 예술과 달리 감정을 설명하지 않고 그대로 들려줍니다. 같은 곡이 더 무겁게 들린다면, 그사이 당신 쪽에 무언가 쌓였다는 뜻이겠지요.', 'Unlike the other arts, music doesn’t describe a feeling—it simply sounds it. If the same song feels heavier, something has piled up on your side in the meantime.', { time: '08:43' }),
      M('p4', 'ci', 'text', '노래는 그대로인데 듣는 사람이 늙죠. 꼭 슬픈 일만은 아니에요.', 'The song stays the same; the listener ages. That isn’t only sad.', { time: '08:44', reply: 'p3', to: 'sh' }),
      M('p5', 'me', 'text', '‘사랑하기 때문에’. 학생 때는 그냥 슬픈 노래였는데 오늘은 좀 달랐어.', '“Because I Love You.” It was just a sad song back in school. Today it was different.', { time: '08:46', reply: 'p2' }),
      M('p6', 'ca', 'text', '그때는 몰랐던 걸 이제는 아는 거죠. 오늘 아침 비까지 그 노래에 같이 들어간 것 같아요.', 'You know things now you didn’t know then. Maybe this morning’s rain got into the song, too.', { time: '08:47', reply: 'p5' })
    ]
  };
  rooms.daily = {
    id: 'daily', kind: 'group', name: txt(L, '일상의 철학', 'Everyday Philosophy'), desc: txt(L, '가벼운 하루 이야기를 나누는 방', 'A room for light, everyday talk'),
    members: [{ id: 'so', type: 'fixed' }, { id: 'au', type: 'fixed' }, { id: 'ca', type: 'fixed' }], set: def({ auto: 'contextual', freq: 'off', int: 'gentle' }),
    pinned: false, unread: 0, archived: false, sort: 950, last: '12:38',
    msgs: [
      notice('d0'), day('dd', D13[0], D13[1]),
      M('d1', 'me', 'text', '오늘 커피가 유난히 맛있어.', 'My coffee tastes especially good today.', { time: '12:20' }),
      M('d2', 'so', 'text', '좋은 점심이군! 원두가 바뀐 건가, 아니면 자네 기분이 바뀐 건가?', 'A fine lunch, then! Did the beans change, or did you?', { time: '12:20' }),
      M('d3', 'au', 'text', '그 한 잔을 서두르지 말고 다 마셔요. 오늘 받은 좋은 것 하나니까요.', 'Don’t rush that cup. It’s one good thing today handed you.', { time: '12:21' }),
      M('d4', 'ca', 'text', '맛있는 커피는 이유를 묻지 않는 게 좋아요.', 'Good coffee is best left unexplained.', { time: '12:21' }),
      M('d5', 'me', 'text', '사실 기분이 좋은 건 오전에 큰 프로젝트를 끝내서야. 근데 막상 끝내니까 생각보다 별거 없네.', 'Honestly, I’m in a good mood because I wrapped up a big project this morning. But now that it’s done, it feels like less than I expected.', { time: '12:31' }),
      M('d6', 'so', 'text', '흥미롭군. 끝내기 전에 자네가 기대한 건 무엇이었나? 결과 자체인가, 결과가 자네에게 줄 무언가인가?', 'Interesting. Before you finished, what were you expecting—the result itself, or something the result would give you?', { time: '12:32' }),
      M('d7', 'au', 'text', '일을 잘 해낸 것 자체가 이미 보상이에요. 박수는 덤이고요.', 'Doing the work well is already the reward. Applause is extra.', { time: '12:33' }),
      M('d8', 'me', 'text', '그럼 성취가 의미를 주는 게 아니라, 의미 있는 걸 하다 보면 성취가 따라오는 걸까?', 'So achievement doesn’t give meaning—maybe it just follows when you do something meaningful?', { time: '12:35' }),
      M('d9', 'ca', 'text', '어쩌면 둘 다 아닐지도요. 의미는 끝난 뒤에 오는 게 아니라, 하는 동안 이미 와 있기도 하니까요. 오늘 커피처럼요.', 'Maybe neither. Meaning doesn’t only come afterward—sometimes it’s already there while you’re doing it. Like today’s coffee.', { time: '12:36' }),
      M('d10', 'so', 'text', '좋은 질문을 얻었군. 그 질문을 오늘 저녁까지 들고 다녀 보게.', 'You’ve found a good question. Carry it with you until this evening.', { time: '12:38' })
    ]
  };
  rooms.nihil = {
    id: 'nihil', kind: 'group', name: txt(L, '허무주의자들의 방', 'The Nihilists’ Room'), desc: txt(L, '무의미와 노력에 대해 자주 이야기하는 방', 'Where meaning and effort come up a lot'),
    members: [{ id: 'ni', type: 'fixed' }, { id: 'sh', type: 'fixed' }, { id: 'ci', type: 'fixed' }, { id: 'ca', type: 'fixed' }], set: def({ auto: 'active', freq: 'normal', int: 'balanced' }),
    pinned: true, unread: 0, archived: false, sort: 700, last: S.yesterday,
    msgs: [
      notice('h0'), day('hd', D12[0], D12[1]),
      M('h1', 'me', 'text', '노력해도 결과가 없다면 노력은 무의미할까?', 'If effort brings no results, is it meaningless?', { time: '22:10' }),
      M('h2', 'sh', 'text', '결과를 바라는 한, 노력은 끝없는 결핍의 다른 이름입니다. 얻어도 곧 다음 것을 원하게 되니까요.', 'As long as you want results, effort is just another name for endless lack. The moment you get one thing, you want the next.', { time: '22:11' }),
      M('h3', 'ni', 'text', '결과로만 노력을 재는 건 장사꾼의 셈법이오. 노력은 그것을 견딘 사람을 바꿔 놓소.', 'Measuring effort only by results is a shopkeeper’s arithmetic. Effort changes the one who endures it.', { time: '22:11', reply: 'h2', to: 'sh' }),
      M('h4', 'sh', 'text', '바뀐 사람도 곧 또 무언가를 원하게 됩니다. 그 순환부터 봐야 하지 않을까요?', 'The changed person soon wants something else. Shouldn’t we look at that cycle first?', { time: '22:12', reply: 'h3', to: 'ni' }),
      M('h5', 'ni', 'text', '순환을 피할 수 없다면, 그 순환을 다시 살아도 좋다고 말할 수 있느냐가 내 물음이오.', 'If the cycle can’t be escaped, my question is whether you could say yes to living it again.', { time: '22:12', reply: 'h4', to: 'sh' }),
      M('h6', 'ca', 'text', '두 분 말이 다 맞는 것 같아요. 그래도 오늘 결과 없이 그 일을 끝까지 한 당신이 있잖아요. 그건 진짜예요.', 'You’re both onto something. Still, today you saw the work through with no result. That part is real.', { time: '22:13' }),
      M('h7', 'ci', 'text', '무의미한 걸 알면서도 계속하는 것. 제가 아는 유일한 성실함이에요.', 'Carrying on while knowing it’s pointless—the only sincerity I know.', { time: '22:14' }),
      M('h8', 'me', 'text', '결과 없는 노력도 하루를 버티게는 해 주는 것 같아.', 'Even effort without results gets me through the day, I think.', { time: '22:16' })
    ]
  };
  function dm(id, pid, sort, last, msgs, extra) {
    var r = { id: id, kind: 'dm', pid: pid, name: pn(pid, L), desc: '', members: [{ id: pid, type: 'fixed' }], set: def({ auto: 'off', freq: 'off' }), pinned: false, unread: 0, archived: false, sort: sort, last: last, msgs: [dmNotice(id + '0', pid)].concat(msgs) };
    if (extra) Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
    return r;
  }
  rooms['dm-ca'] = dm('dm-ca', 'ca', 820, '07:58', [
    day('cad1', D12[0], D12[1]),
    M('ca1', 'me', 'text', '오늘은 그냥 좀 지쳤어.', 'I’m just tired today.', { time: '23:02' }),
    M('ca2', 'ca', 'text', '그런 날도 있죠. 오늘 하루 중에 그래도 괜찮았던 장면이 하나 있었어요?', 'Some days are like that. Was there one moment today that was still okay?', { time: '23:03' }),
    M('ca3', 'me', 'text', '퇴근길 하늘이 예뻤어.', 'The sky on the way home was pretty.', { time: '23:05' }),
    M('ca4', 'ca', 'text', '그거면 하루를 버틸 이유로 충분해요. 잘 자요.', 'That’s reason enough to have made it through the day. Sleep well.', { time: '23:05' }),
    day('cad2', D13[0], D13[1]),
    M('cai', 'sys', 'init', '카뮈가 먼저 건넨 말 · 왜 왔나요?', 'Camus reached out · Why?', { why: 'ca5' }),
    M('ca5', 'ca', 'text', '어제 감상평에 ‘결과 없는 노력도 하루를 버티게는 해 준다’고 썼죠. 오늘 아침엔 그 문장이 어떻게 들려요?', 'Yesterday you wrote that effort without results still gets you through the day. How does that line sound this morning?', { time: '07:58', initiative: true })
  ], { unread: 1, reached: true });
  rooms['dm-ni'] = dm('dm-ni', 'ni', 600, txt(L, '10월 11일', 'Oct 11'), [
    day('nid', D11[0], D11[1]),
    M('ni1', 'me', 'text', '남들이 부러워하는 일을 하는데 이상하게 신이 안 나.', 'I do work people envy, but somehow it doesn’t excite me.', { time: '13:40' }),
    M('ni2', 'ni', 'text', '박수가 없었어도 그 일을 했겠소? 그 대답에 당신의 일이 누구 것인지 들어 있소.', 'Would you have done it with no applause? Your answer tells you whose work it really is.', { time: '13:41' })
  ]);
  rooms['dm-so'] = dm('dm-so', 'so', 590, txt(L, '10월 10일', 'Oct 10'), [
    day('sod', '10월 10일 토요일', 'Saturday, October 10'),
    M('so1', 'me', 'text', '의미 있는 삶이 뭘까?', 'What makes a life meaningful?', { time: '21:30' }),
    M('so2', 'so', 'text', '좋은 질문이군. 그런데 자네가 말하는 ‘의미’는 오래 남는 것인가, 지금 충만한 것인가?', 'A good question. But by “meaningful,” do you mean what lasts, or what feels full right now?', { time: '21:31' })
  ]);
  rooms['dm-sh'] = dm('dm-sh', 'sh', 580, txt(L, '10월 9일', 'Oct 9'), [
    day('shd', '10월 9일 금요일', 'Friday, October 9'),
    M('sh1', 'me', 'text', '욕심을 줄이면 편해질까?', 'Would wanting less make things easier?', { time: '19:12' }),
    M('sh2', 'sh', 'text', '욕망이 잠시 멎는 순간을 한번 관찰해 보세요. 음악을 들을 때처럼요. 그 순간이 답에 가깝습니다.', 'Watch for the moment desire goes quiet—like when you listen to music. That moment is close to the answer.', { time: '19:13' })
  ]);
  rooms['dm-au'] = dm('dm-au', 'au', 570, txt(L, '10월 8일', 'Oct 8'), [
    day('aud', '10월 8일 목요일', 'Thursday, October 8'),
    M('au1', 'me', 'text', '할 일이 너무 많아서 아무것도 못 하겠어.', 'There’s so much to do that I can’t do anything.', { time: '08:20' }),
    M('au2', 'au', 'text', '오늘 할 일 하나만 정해요. 나머지는 그다음이에요.', 'Choose one thing for today. The rest comes after.', { time: '08:21' })
  ]);
  rooms['dm-ci'] = dm('dm-ci', 'ci', 560, txt(L, '10월 2일', 'Oct 2'), [
    day('cid', '10월 2일 금요일', 'Friday, October 2'),
    M('ci1', 'me', 'text', '요즘 뭐가 맞는지 잘 모르겠어.', 'Lately I don’t know what’s right.', { time: '01:12' }),
    M('ci2', 'ci', 'text', '확신이 없는 날이 오히려 정직한 날이에요. 잠이 안 오면 그 정직함이랑 조금 같이 있어 봐요.', 'The days without certainty are the honest ones. If you can’t sleep, sit with that honesty for a while.', { time: '01:14' })
  ]);

  var D13S = [txt(L, '10월 13일 화요일', 'Tuesday, October 13'), txt(L, '10월 13일', 'Oct 13')];
  // Notes are independent: one date can hold any number of them (spec 11.1, 21.5).
  // kind 'user' = USER_AUTHORED (title + body, versions), kind 'conv' = CONVERSATION_SUMMARY (AI summary with sources).
  var journals = [
    {
      id: 'j13a', kind: 'user', day: 13, date: D13S[0], dshort: D13S[1], time: '08:15',
      title: txt(L, '빗속에서 만난 유재하', 'Meeting Yoo Jae-ha in the rain'),
      body: txt(L, '빗속의 출근길에서 오랜만에 유재하를 만났다. 이어폰에서 ‘사랑하기 때문에’가 흘러나왔다. 오랜만에 듣는 그의 목소리가 더 깊고 묵직하다.\n\n학생 때는 그냥 슬픈 노래였다. 오늘은 슬프다기보다 무거웠다. 버스 창에 맺힌 빗방울을 보면서 끝까지 들었다.',
        'Ran into Yoo Jae-ha on my rainy commute. “Because I Love You” came on in my earphones. After all this time, his voice sounds deeper and heavier.\n\nIn school it was just a sad song. Today it felt less sad than heavy. I listened to the end, watching the rain bead on the bus window.'),
      status: 'saved', access: { mode: 'selected', ids: ['ci'] }, auto: null, notif: true, rooms: [], sents: [],
      revs: [{ at: '08:15' }],
      reflection: { t: '', time: '' },
      comments: [
        { id: 'ja1', a: 'ci', t: txt(L, '젊을 때 슬픈 노래는 장식이고, 나이가 들면 증언이 되죠. 오늘 아침 비는 그 증언을 조금 일찍 불러냈을 뿐이에요.', 'When you’re young, a sad song is decoration; when you’re older, it’s testimony. This morning’s rain just called the testimony in a little early.'), time: '14:20', parent: null, auto: true, prepared: '08:16' }
      ]
    },
    {
      id: 'j13b', kind: 'conv', day: 13, date: D13S[0], dshort: D13S[1], time: '12:42',
      title: txt(L, '성취와 삶의 의미', 'Achievement and the meaning of life'),
      status: 'draft', access: { mode: 'private', ids: [] }, auto: null, notif: true, rooms: ['daily'], range: { n: 10, from: 'd1' },
      sents: [
        { t: txt(L, '점심 커피가 유난히 맛있었고, 기분이 좋은 건 오전에 큰 프로젝트를 끝내서라고 적었다.', 'Lunch coffee tasted especially good, and I wrote that my good mood came from finishing a big project that morning.'), refs: [['daily', 'd1'], ['daily', 'd5']] },
        { t: txt(L, '막상 끝내니 생각보다 별거 없다고 하자, 소크라테스는 끝내기 전에 기대한 것이 결과 자체인지 결과가 줄 무언가인지 물었다.', 'When I said it felt like less than expected, Socrates asked whether I had wanted the result itself or something it would give me.'), refs: [['daily', 'd6']], phil: true },
        { t: txt(L, '아우렐리우스는 일을 잘 해낸 것 자체가 이미 보상이라고 했다.', 'Aurelius said doing the work well is already the reward.'), refs: [['daily', 'd7']], phil: true },
        { t: txt(L, '나는 성취가 의미를 주는 게 아니라 의미 있는 걸 하다 보면 성취가 따라오는 게 아닐까 물었다.', 'I asked whether achievement doesn’t give meaning, but follows when you do something meaningful.'), refs: [['daily', 'd8']] },
        { t: txt(L, '카뮈는 의미가 끝난 뒤가 아니라 하는 동안 이미 와 있기도 하다고 했다.', 'Camus said meaning is sometimes already there while you’re doing it, not only afterward.'), refs: [['daily', 'd9']], phil: true },
        { t: txt(L, '성취 뒤의 허전함 때문에 일의 의미를 다시 생각해 본 점심이었을 수 있다.', 'It may have been a lunch spent rethinking what work means, after the emptiness that followed an achievement.'), refs: [], guess: true }
      ],
      reflection: { t: '', time: '' }, comments: []
    },
    {
      id: 'j13c', kind: 'user', day: 13, date: D13S[0], dshort: D13S[1], time: '21:30',
      title: txt(L, '오늘 떠오른 질문', 'A question that came to me today'),
      body: txt(L, '점심에 소크라테스가 이 질문을 저녁까지 들고 다녀 보라고 했다.\n\n아무도 박수 치지 않아도 나는 이 일을 할까?\n\n오전에 프로젝트를 끝내고 허전했던 건, 내가 원한 게 일이 아니라 끝냈다는 소리였기 때문일지도 모른다. 내일은 결과 말고 하는 동안을 조금 더 들여다봐야겠다.',
        'At lunch, Socrates told me to carry this question until evening.\n\nWould I still do this work if no one applauded?\n\nMaybe I felt empty after finishing the project this morning because what I wanted wasn’t the work but the sound of having finished. Tomorrow I want to look a little more at the doing, not the result.'),
      status: 'saved', access: { mode: 'selected', ids: ['so', 'ca'] }, auto: null, notif: true, rooms: [], sents: [],
      revs: [{ at: '21:30' }],
      reflection: { t: '', time: '' }, comments: []
    },
    {
      id: 'j12', kind: 'conv', day: 12, date: txt(L, '10월 12일 월요일', 'Monday, October 12'), dshort: txt(L, '10월 12일', 'Oct 12'),
      title: txt(L, '결과 없는 노력에 대하여', 'On effort without results'),
      status: 'reviewed', access: { mode: 'selected', ids: ['ca', 'ni'] }, auto: null, notif: true, rooms: ['nihil', 'dm-ca'], time: '22:50',
      sents: [
        { t: txt(L, '‘노력해도 결과가 없다면 노력은 무의미할까?’라고 물었다.', 'I asked whether effort is meaningless when it brings no results.'), refs: [['nihil', 'h1']] },
        { t: txt(L, '쇼펜하우어는 결과를 바라는 한 노력은 끝없는 결핍이라고 했고, 니체는 노력이 견딘 사람을 바꾼다고 반박했다.', 'Schopenhauer said effort is endless lack as long as you want results; Nietzsche countered that effort changes the one who endures it.'), refs: [['nihil', 'h2'], ['nihil', 'h3']], phil: true },
        { t: txt(L, '카뮈는 결과 없이도 일을 끝까지 한 내가 있다고 했다.', 'Camus said the me who saw the work through is real.'), refs: [['nihil', 'h6']], phil: true },
        { t: txt(L, '나는 결과 없는 노력도 하루를 버티게는 해 준다고 적었다.', 'I wrote that effort without results still gets me through the day.'), refs: [['nihil', 'h8']] }
      ],
      reflection: { t: txt(L, '니체와 쇼펜하우어가 다투는 걸 보면서, 나는 둘 다에게서 조금씩 위로를 받았다. 결과 없는 노력도 하루를 버티게는 해 준다.', 'Watching Nietzsche and Schopenhauer go at it, I found a little comfort in both. Even effort without results gets me through the day.'), time: '23:20' },
      comments: [
        { id: 'jc1', a: 'ca', t: txt(L, '‘하루를 버티게 해 준다’는 말이 좋아요. 버틴 하루는 이미 결과 하나예요.', 'I like “gets me through the day.” A day you got through is already a result.'), time: '23:24', parent: null },
        { id: 'jc2', a: 'me', t: txt(L, '그럼 내일도 그냥 버티면 되는 걸까?', 'So I just need to get through tomorrow too?'), time: '23:31', parent: 'jc1' },
        { id: 'jc3', a: 'ca', t: txt(L, '버티는 것과 사는 건 조금 달라요. 내일은 버티면서 한 번쯤 고개를 들어 봐요.', 'Getting through and living are a little different. Tomorrow, get through it—and look up once.'), time: '23:33', parent: 'jc2' },
        { id: 'jc4', a: 'ni', t: txt(L, '위로를 둘 다에게서 받았다니, 당신은 생각보다 덜 허무주의자요.', 'Comforted by both of us? You’re less of a nihilist than you think.'), time: '08:05', parent: null, auto: true, prepared: '23:21' }
      ]
    },
    {
      id: 'j09', kind: 'user', day: 9, date: txt(L, '10월 9일 금요일', 'Friday, October 9'), dshort: txt(L, '10월 9일', 'Oct 9'),
      title: txt(L, '아무 일도 없던 금요일', 'A Friday where nothing happened'),
      body: txt(L, '회의가 취소돼서 오후가 통째로 비었다. 아무것도 안 했는데 이상하게 죄책감이 들었다. 쉬는 것도 연습이 필요하다.', 'A meeting got cancelled and the whole afternoon opened up. I did nothing, and oddly felt guilty about it. Resting takes practice too.'),
      status: 'saved', access: { mode: 'private', ids: [] }, auto: null, notif: true, rooms: [], time: '21:40', sents: [],
      revs: [{ at: '21:40' }],
      reflection: { t: '', time: '' }, comments: []
    }
  ];
  // the first version of a user note is its current text
  journals.forEach(function (j) { if (j.revs) j.revs[0] = { at: j.revs[0].at, title: j.title, body: j.body, day: j.day }; });

  // ProactiveActionPlan (spec 14.1, 16.5): written ahead on the device, posted later after re-checking
  var plans = [
    { id: 'pl1', kind: 'comment', jid: 'j13c', pid: 'so', day: 14, at: '08:30', prepared: '21:31', status: 'scheduled', rev: 1,
      t: txt(L, '“박수가 없어도 할까”라… 좋은 질문이군. 그런데 자네는 오늘 일하는 동안 좋았던 순간을 하나라도 기억하나? 답은 거기서부터 찾아보세.', '“Would I do it without applause?”—a fine question. But do you remember one good moment while you were working today? Let us look for the answer there.') }
  ];

  var notes = [
    {
      id: 'n1', a: 'ca', date: txt(L, '10월 13일 09:30', 'Oct 13, 9:30 AM'), origin: { room: 'plaza' },
      title: txt(L, '익숙한 노래가 다르게 들릴 때', 'When a familiar song sounds different'),
      paras: L === 'ko' ? [
        '오늘 아침 한 사람이 비 오는 출근길에 오래된 노래를 들었다고 했다. 학생 때는 그저 슬픈 노래였는데, 오늘은 달랐다고.',
        '나는 노래가 변하지 않았다는 데서 시작하고 싶다. 변한 것은 그사이에 쌓인 아침들이다. 젖은 신발, 늦은 버스, 아무도 모르게 견딘 날들. 그것들이 같은 멜로디에 무게를 더한다.',
        '그 무게를 슬픔이라고만 부르고 싶지 않다. 그건 살아 있었다는 증거에 가깝다. 같은 노래를 다르게 들을 수 있다는 건, 우리가 아직 같은 자리에 멈춰 있지 않다는 뜻이니까.',
        '그러니 오늘의 비도 나쁘지 않았다. 비는 노래에 젖을 핑계를 주었고, 그 사람은 출근길에 잠깐 자기 삶을 들었다.'
      ] : [
        'This morning someone told me they heard an old song on a rainy commute. It used to be just a sad song, they said. Today it was different.',
        'I want to begin with the fact that the song didn’t change. What changed were the mornings that piled up in between: wet shoes, late buses, days endured without anyone noticing. They add weight to the same melody.',
        'I don’t want to call that weight sadness alone. It’s closer to proof of having lived. Hearing the same song differently means we haven’t stayed in the same place.',
        'So today’s rain wasn’t bad. It gave the song an excuse to soak in, and on the way to work, that person heard their own life for a moment.'
      ],
      quote: null, allowOthers: true,
      comments: [
        { id: 'nc1', a: 'me', t: txt(L, '‘살아 있었다는 증거’라는 말, 좀 과장 아니야?', '“Proof of having lived”—isn’t that a bit much?'), time: '09:50', parent: null },
        { id: 'nc2', a: 'ca', t: txt(L, '조금 과장일 수도 있어요. 그래도 젖은 신발로 하루를 시작한 사람에게는 그 정도 과장이 필요할 때가 있죠.', 'Maybe a little. But someone who starts the day in wet shoes deserves a little exaggeration.'), time: '09:52', parent: 'nc1' },
        { id: 'nc3', a: 'ci', t: txt(L, '증거라니요. 저는 그냥 ‘아직 끝나지 않았다’는 소식 정도라고 하겠어요.', 'Proof? I’d call it news that it isn’t over yet.'), time: '10:05', parent: null, other: true }
      ]
    },
    {
      id: 'n2', a: 'ni', date: txt(L, '10월 12일 23:40', 'Oct 12, 11:40 PM'), origin: { room: 'nihil' },
      title: txt(L, '남이 준 목표는 이뤄도 남의 것이다', 'A goal you were handed stays theirs, even when reached'),
      paras: L === 'ko' ? [
        '결과로 노력을 재는 사람은 언제나 빚진 채로 산다. 결과가 오지 않으면 노력은 손해가 되고, 결과가 오면 곧 다음 결과가 그 자리를 차지한다.',
        '쇼펜하우어는 이것을 결핍의 순환이라 부를 것이다. 나는 다르게 묻고 싶다. 그 순환 속에서 당신이 원한 것은 정말 당신의 것이었는가?',
        '남이 준 목표는 이뤄도 남의 것이다. 자기 목표는 이루지 못해도 당신을 바꾼다. 견딘 시간이 당신을 만들었다면, 그 노력은 이미 값을 치렀다.'
      ] : [
        'Whoever measures effort by results lives forever in debt. When the result doesn’t come, effort is a loss; when it does, the next result soon takes its place.',
        'Schopenhauer would call this the cycle of lack. I would ask something else: within that cycle, was what you wanted ever truly yours?',
        'A goal you were handed stays theirs, even when reached. Your own goal changes you, even unreached. If the enduring made you, the effort has already paid.'
      ],
      quote: { t: txt(L, '너는 너 자신이 되어야 한다.', 'You shall become who you are.'), src: txt(L, '니체, 『즐거운 학문』 270절', 'Nietzsche, The Gay Science §270') }, allowOthers: false,
      comments: []
    },
    {
      id: 'n3', a: 'ci', date: txt(L, '10월 2일 02:10', 'Oct 2, 2:10 AM'), origin: { room: 'dm-ci' },
      title: txt(L, '확신 없는 날의 정직함', 'The honesty of uncertain days'),
      paras: L === 'ko' ? [
        '확신은 대개 피곤한 사람이 고르는 지름길이다. 모른다고 말할 힘이 남아 있는 날, 우리는 조금 더 정직하다.',
        '오늘 밤 한 사람이 뭐가 맞는지 모르겠다고 했다. 나는 그 말을 위로하지 않기로 했다. 대신 그 모름이 얼마나 깨끗한지 말해 주고 싶었다.'
      ] : [
        'Certainty is usually a shortcut chosen by the tired. On days when we still have the strength to say we don’t know, we are a little more honest.',
        'Tonight someone said they didn’t know what was right. I decided not to console them. I wanted instead to tell them how clean that not-knowing was.'
      ],
      quote: null, allowOthers: false, comments: []
    }
  ];

  var mems = [
    { id: 'm1', kind: 'said', t: txt(L, '비 오는 날 출근길에 오래된 노래를 듣는다', 'Listens to old songs on rainy commutes'), src: txt(L, '광장 · 10월 13일', 'Plaza · Oct 13'), scope: txt(L, '광장', 'the Plaza'), room: 'plaza', who: ORDER.slice(), active: true },
    { id: 'm2', kind: 'said', t: txt(L, '남들이 부러워하는 일을 하지만 신이 나지 않는다고 했다', 'Said their enviable job doesn’t excite them'), src: txt(L, '니체 개인톡 · 10월 11일', 'Chat with Nietzsche · Oct 11'), scope: txt(L, '니체 개인톡', 'the chat with Nietzsche'), room: 'dm-ni', who: ['ni'], active: true },
    { id: 'm3', kind: 'journal', t: txt(L, '결과 없는 노력도 하루를 버티게 해 준다고 생각한다', 'Thinks effort without results still gets them through the day'), src: txt(L, '나의 노트 · 10월 12일', 'My note · Oct 12'), scope: txt(L, '카뮈·니체 (허락한 노트)', 'Camus & Nietzsche (allowed note)'), room: null, who: ['ca', 'ni'], active: true },
    { id: 'm4', kind: 'guess', t: txt(L, '익숙한 것에서 위로를 찾는 편일 수 있다', 'May tend to find comfort in familiar things'), src: txt(L, '광장 대화에서 추정', 'Guessed from the Plaza'), scope: txt(L, '광장 · 확인 전엔 쓰지 않아요', 'the Plaza · unused until confirmed'), room: 'plaza', who: ORDER.slice(), active: false }
  ];

  return { rooms: rooms, journals: journals, notes: notes, mems: mems, plans: plans };
}
