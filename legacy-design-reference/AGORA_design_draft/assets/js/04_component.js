/* ---------- app ---------- */
STR.ko.journalCard = '대화가 잠잠해졌어요. 이 대화를 노트로 남겨 둘까요?';
STR.en.journalCard = 'It’s gone quiet. Keep this conversation as a note?';
STR.ko.initTag = '{n} 먼저 건넨 말 · 왜 왔나요?';
STR.en.initTag = '{n} reached out · Why?';
STR.ko.autoPausedN = '잠시 멈췄어요 · 남은 발언 {n}';
STR.en.autoPausedN = 'Paused · {n} left';
STR.ko.commentsN = '댓글 {n}개';
STR.en.commentsN = '{n} comments';

var THEME = { '시스템': 'system', '라이트': 'light', '다크': 'dark' };
var SPEED = { '느리게': 1.6, '보통': 1, '빠르게': 0.5 };
var WEEK = [11, 12, 13, 14, 15, 16, 17];

function detectDark() {
  try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; }
}
function bySort(a, b) { return b.sort - a.sort; }
function lastText(r) {
  for (var i = r.msgs.length - 1; i >= 0; i--) { var m = r.msgs[i]; if (m.k === 'text' && !m.streaming) return m; }
  return null;
}
var MN_RE = null;
function mentionRe() {
  if (MN_RE) return MN_RE;
  var names = [];
  ORDER.forEach(function (id) { names.push(PH[id].name.ko, PH[id].name.en); if (PH[id].full) names.push(PH[id].full.ko); });
  names.sort(function (a, b) { return b.length - a.length; });
  MN_RE = new RegExp('@(' + names.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'g');
  return MN_RE;
}
function idByName(n) {
  var low = n.toLowerCase();
  for (var i = 0; i < ORDER.length; i++) {
    var p = PH[ORDER[i]];
    if (p.name.ko === n || p.name.en.toLowerCase() === low || (p.full && p.full.ko === n)) return ORDER[i];
  }
  return null;
}
function segsOf(text) {
  var re = mentionRe(), out = [], last = 0, m;
  re.lastIndex = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: text.slice(last, m.index), plain: true, mn: false });
    out.push({ t: m[0], mn: true, plain: false });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: text.slice(last), plain: true, mn: false });
  if (!out.length) out.push({ t: '', plain: true, mn: false });
  return out;
}

/* ----- notes: dates, titles, summary sentences, delivery times ----- */
var DOW_KO = ['일', '월', '화', '수', '목', '금', '토'], DOW_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function dayStr(d, L) {
  var k = ((d - 11) % 7 + 7) % 7; // Oct 11, 2026 is a Sunday
  return L === 'ko' ? { date: '10월 ' + d + '일 ' + DOW_KO[k] + '요일', dshort: '10월 ' + d + '일' } : { date: DOW_EN[k] + ', October ' + d, dshort: 'Oct ' + d };
}
function noteTitle(j, t) {
  if (j.title) return j.title;
  var first = String(j.body || '').split('\n').filter(function (x) { return x.trim(); })[0];
  return first ? clip(first.trim(), 28) : t.untitled;
}
function sentOf(m, roomId, L) {
  var q = clip(m.t, 54);
  if (m.a === 'me') return { t: L === 'ko' ? '“' + q + '”라고 적었다.' : 'I wrote, “' + q + '”', refs: [[roomId, m.id]] };
  return { t: L === 'ko' ? jo(pn(m.a, L), '은', '는') + ' “' + q + '”라고 했다.' : pn(m.a, L) + ' said, “' + q + '”', refs: [[roomId, m.id]], phil: true };
}
function toHM(m) { m = ((m % 1440) + 1440) % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }
var QUIET = [[1320, 480], [1380, 420], null]; // 22:00–08:00, 23:00–07:00, none

/* The artboard's own logic block is `class Component extends DCLogic` whose
   constructor calls this.setup(props); AgoraMixin copies the app's methods onto it. */
function AgoraMixin(Target) {
  var Src = class AgoraApp {
  setup(props) {
    this.timers = [];
    this.g = null;
    this.rot = {};
    this.uid = 0;
    this.lastPlan = null;
    this.toastTimer = null;
    this.scrollRef = { current: null };
    this.inputRef = { current: null };
    this.replyRef = { current: null };
    this.noteRef = { current: null };
    this.searchRef = { current: null };
    this.cpTitleRef = { current: null };
    this.cpTimer = null;
    this.scrollSig = '';
    this.state = this.initial(props);
  }

  /* ----- lifecycle ----- */
  initial(props) {
    var L = props.language === 'English' ? 'en' : 'ko';
    var w = seedWorld(L);
    var st = {
      contentLang: L, uiLang: L, themeMode: THEME[props.theme] || 'system', sysDark: detectDark(), offline: !!props.offline,
      plus: false, screen: 'home', tab: 'chats', recSeg: 'journal', stack: [],
      roomId: null, journalId: null, noteId: null, philId: null,
      rooms: w.rooms, journals: w.journals, notes: w.notes, mems: w.mems, plans: w.plans, kindFilter: 'all', compose: null,
      draft: '', replyTo: null, mention: null, menu: false, sheet: null, toast: null, live: null,
      debateRooms: {}, softRooms: {}, cards: {}, showArchived: false, dayFilter: null, noteFilter: 'all', memFilter: 'all', memRoom: null,
      reflDraft: '', editingRefl: false, editingSum: false, sumDraft: '', replyC: null, cDraft: '', nDraft: '', writing: null, newNote: false,
      nr: { picks: [], name: '', auto: 'contextual', freq: 'rare', int: 'balanced' },
      settings: { init: true, max: 2, quiet: 0, hideLock: true, diag: false, appLock: false, defAccess: 'private', autoC: 'some', noteAuto: 'suggest', aiLang: 'app', philInit: { so: true, ni: true, sh: true, ca: true, ci: true, au: true } },
      ob: { step: 1, dl: 0, dlState: 'idle', wifi: true, notif: false, diag: false },
      models: { active: 'base', light: 'none', lightP: 0 },
      reports: [], consent: { journal: false, memory: false, agreed: false }, search: ''
    };
    this.scenario(st, props.start || '홈', L);
    return st;
  }
  scenario(st, key, L) {
    var home = { screen: 'home', tab: 'chats', recSeg: 'journal' };
    var tx = function (ko, en) { return L === 'ko' ? ko : en; };
    var set = function (o) { Object.keys(o).forEach(function (k) { st[k] = o[k]; }); };
    switch (key) {
      case '첫 실행': set({ screen: 'ob' }); break;
      case '첫 실행 · 모델': set({ screen: 'ob', ob: { step: 2, dl: 46, dlState: 'paused', wifi: true, notif: false, diag: false } }); break;
      case '광장': set({ screen: 'room', roomId: 'plaza', stack: [home] }); st.rooms.plaza.unread = 0; break;
      case '멘션': {
        var d = tx('오늘 커피 얘기 말인데, @', 'About the coffee today, @');
        set({ screen: 'room', roomId: 'daily', stack: [home], draft: d, mention: { start: d.length - 1, q: '' } });
        break;
      }
      case '초대': {
        var b = tx('오늘 커피 얘기 말인데, ', 'About the coffee today, ');
        set({ screen: 'room', roomId: 'daily', stack: [home], draft: b + '@' + pn('sh', L) + ' ', sheet: { type: 'invite', pid: 'sh', roomId: 'daily', before: b } });
        break;
      }
      case '이어 말하기': {
        var r = st.rooms.plaza; r.unread = 0;
        var mk = function (id, a, ko, en, x) { return Object.assign({ id: id, a: a, k: 'text', t: tx(ko, en), time: '', reply: null, to: null, mn: [], eng: 'local', priv: false, temp: false }, x || {}); };
        r.msgs = r.msgs.concat([
          mk('p7', 'me', '요즘은 퇴근길에 옛날 노래만 들어.', 'These days I only listen to old songs on the way home.', { time: '18:32' }),
          mk('p8', 'ca', '옛날 노래만 듣는 시기가 있죠. 요즘 하루가 어떤지 노래가 먼저 말해 주는 것 같아요.', 'There are seasons for old songs. It’s as if the songs tell you how your days are going.', { time: '18:33' }),
          mk('p9', 'ni', '향수는 나쁘지 않소. 다만 거기 눌러앉지만 않는다면.', 'Nostalgia is fine—as long as you don’t move in.', { time: '18:33', reply: 'p8', to: 'ca' }),
          mk('p10', 'ci', '눌러앉아도 괜찮아요. 어차피 다들 언젠가 돌아가는 곳이니까요.', 'Moving in is fine too. Everyone goes back there eventually.', { time: '18:34', reply: 'p9', to: 'ni' })
        ]);
        r.last = '18:34'; r.sort = 990;
        this.revSeq = 1;
        this.g = { roomId: 'plaza', rev: 1, paused: true, hold: false, autoLeft: 2, queue: [
          { sp: 'sh', to: 'ci', auto: true, t: tx('돌아간다기보다, 같은 노래가 우리를 다시 데려가는 거지요. 음악만이 그럴 수 있습니다.', 'Rather than us going back, the same song takes us back. Only music can do that.') },
          { sp: 'au', to: 'sh', auto: true, t: tx('어디로 데려가든, 퇴근길의 그 시간은 당신 거예요. 잘 쓰고 있네요.', 'Wherever it takes you, that commute time is yours. You’re using it well.') }
        ] };
        this.lastPlan = { roomId: 'plaza', topic: 'music', used: {}, spoken: ['ca', 'ni', 'ci'] };
        set({ screen: 'room', roomId: 'plaza', stack: [home], live: { roomId: 'plaza', phase: 'wait', paused: true, hold: false, left: 2, quiet: false } });
        break;
      }
      case '논쟁': set({ screen: 'room', roomId: 'nihil', stack: [home], debateRooms: { nihil: true } }); break;
      case '먼저 연락': st.rooms['dm-ca'].unread = 0; set({ screen: 'room', roomId: 'dm-ca', stack: [home], sheet: { type: 'why', roomId: 'dm-ca', msgId: 'ca5' } }); break;
      case '새 방': set({ screen: 'nr1', stack: [home], nr: { picks: ['ni', 'ca'], name: '', auto: 'contextual', freq: 'rare', int: 'balanced' } }); break;
      case '방 분위기': set({ screen: 'nr2', stack: [home, { screen: 'nr1' }], nr: { picks: ['ni', 'sh', 'ca'], name: tx('밤의 대화', 'Late-night talk'), auto: 'active', freq: 'normal', int: 'rigorous' } }); break;
      case '방 정보': set({ screen: 'info', roomId: 'nihil', stack: [home, { screen: 'room', roomId: 'nihil' }] }); break;
      case '나의 노트': set({ tab: 'records' }); break;
      case '새 노트': {
        var dd = dayStr(13, L);
        var dn = { id: 'jnew', kind: 'user', day: 13, date: dd.date, dshort: dd.dshort, time: '18:39', title: tx('퇴근길 하늘', 'The sky on the way home'), body: tx('버스에서 내리니 하늘이 분홍색이었다. 사진을 찍으려다 그냥 한참 봤다.', 'Got off the bus and the sky was pink. I meant to take a photo, but just looked for a while instead.'), status: 'draft', access: { mode: st.settings.defAccess, ids: [] }, auto: null, notif: true, rooms: [], sents: [], revs: [], reflection: { t: '', time: '' }, comments: [] };
        st.journals = [dn].concat(st.journals);
        set({ screen: 'compose', stack: [{ screen: 'home', tab: 'records', recSeg: 'journal' }], compose: { id: 'jnew', mode: 'new', title: dn.title, body: dn.body, day: 13, t0: '', b0: '', d0: 13, savedAt: '18:41', saving: false, pickDate: false } });
        break;
      }
      case '대화 노트': set({ screen: 'journal', journalId: 'j13b', stack: [{ screen: 'home', tab: 'records', recSeg: 'journal' }], editingRefl: true, reflDraft: '' }); break;
      case '노트 댓글': set({ screen: 'journal', journalId: 'j12', stack: [{ screen: 'home', tab: 'records', recSeg: 'journal' }], reflDraft: st.journals.filter(function (x) { return x.id === 'j12'; })[0].reflection.t }); break;
      case '자동 댓글 예약': set({ screen: 'journal', journalId: 'j13c', stack: [{ screen: 'home', tab: 'records', recSeg: 'journal' }] }); break;
      case '읽기와 댓글': set({ screen: 'journal', journalId: 'j13b', stack: [{ screen: 'home', tab: 'records', recSeg: 'journal' }], editingRefl: true, sheet: { type: 'access', journalId: 'j13b', mode: 'selected', ids: ['ca'], auto: null, notif: true } }); break;
      case '사유 노트': set({ tab: 'records', recSeg: 'notes' }); break;
      case '사유 노트 상세': set({ screen: 'note', noteId: 'n1', stack: [{ screen: 'home', tab: 'records', recSeg: 'notes' }] }); break;
      case '철학자': set({ tab: 'people' }); break;
      case '프로필': set({ screen: 'profile', philId: 'ca', stack: [{ screen: 'home', tab: 'people' }] }); break;
      case '설정': set({ tab: 'settings' }); break;
      case 'Plus': set({ screen: 'plus', stack: [{ screen: 'home', tab: 'settings' }] }); break;
      case '클라우드 동의': set({ screen: 'plus', stack: [{ screen: 'home', tab: 'settings' }], sheet: { type: 'cloud', from: 'plus' } }); break;
      case '기억': set({ screen: 'memory', stack: [{ screen: 'home', tab: 'settings' }] }); break;
      case '모델': set({ screen: 'models', stack: [{ screen: 'home', tab: 'settings' }] }); break;
      default: break;
    }
  }
  componentDidMount() {
    var self = this;
    try {
      this.mq = window.matchMedia('(prefers-color-scheme: dark)');
      this.mqFn = function (e) { self.setState({ sysDark: !!e.matches }); };
      if (this.mq.addEventListener) this.mq.addEventListener('change', this.mqFn); else if (this.mq.addListener) this.mq.addListener(this.mqFn);
    } catch (e) { this.mq = null; }
    this.scrollBottom();
  }
  componentWillUnmount() {
    this.clearAll();
    try { if (this.mq) { if (this.mq.removeEventListener) this.mq.removeEventListener('change', this.mqFn); else if (this.mq.removeListener) this.mq.removeListener(this.mqFn); } } catch (e) { /* ignore */ }
  }
  componentDidUpdate(prev) {
    var p = this.props;
    if (prev.language !== p.language || prev.start !== p.start) { this.clearAll(); this.g = null; this.lastPlan = null; this.setState(this.initial(p)); return; }
    if (prev.theme !== p.theme) this.setState({ themeMode: THEME[p.theme] || 'system' });
    if (prev.offline !== p.offline) this.setState({ offline: !!p.offline });
    this.scrollBottom();
  }
  scrollBottom() {
    var s = this.state, el = this.scrollRef.current;
    if (s.screen !== 'room' || !el) return;
    var r = s.rooms[s.roomId];
    if (!r) return;
    var lm = r.msgs[r.msgs.length - 1];
    var sig = r.id + ':' + r.msgs.length + ':' + (lm && lm.shown || 0) + ':' + (s.live ? s.live.phase + s.live.sp : '') + ':' + (s.replyTo || '') + ':' + (s.debateRooms[r.id] ? 1 : 0);
    if (sig !== this.scrollSig) { this.scrollSig = sig; el.scrollTop = el.scrollHeight; }
  }

  /* ----- utilities ----- */
  later(fn, ms) { var id = setTimeout(fn, ms); this.timers.push(id); if (this.timers.length > 400) this.timers = this.timers.slice(-200); return id; }
  clearAll() { this.timers.forEach(function (x) { clearTimeout(x); }); this.timers = []; if (this.toastTimer) clearTimeout(this.toastTimer); }
  nid(p) { this.uid += 1; return p + this.uid + '_' + (Date.now() % 100000); }
  spd() { return SPEED[this.props.speed] || 1; }
  T() { return STR[this.state.uiLang]; }
  toast(text, act, actLabel) {
    var self = this;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.setState({ toast: { text: text, act: act || null, actLabel: actLabel || '' } });
    this.toastTimer = setTimeout(function () { self.setState({ toast: null }); }, act ? 4200 : 2600);
  }
  updRoom(id, fn) {
    this.setState(function (s) {
      if (!s.rooms[id]) return null;
      var rooms = Object.assign({}, s.rooms);
      var r = Object.assign({}, rooms[id]);
      r.msgs = r.msgs.slice(); r.members = r.members.slice(); r.set = Object.assign({}, r.set);
      fn(r, s);
      rooms[id] = r;
      return { rooms: rooms };
    });
  }
  roomLang(room, text) {
    var mode = room.set.lang, L = this.state.uiLang;
    if (mode === 'ko' || mode === 'en') return mode;
    if (mode === 'msg') return text ? (hasHangul(text) ? 'ko' : 'en') : L;
    return L;
  }
  engineOf(room) { return room.set.eng === 'cloud' && this.state.plus && !this.state.offline ? 'cloud' : 'local'; }
  snap(s) { return { screen: s.screen, tab: s.tab, recSeg: s.recSeg, roomId: s.roomId, journalId: s.journalId, noteId: s.noteId, philId: s.philId }; }
  go(screen, extra) {
    var self = this;
    this.setState(function (s) {
      var o = Object.assign({ stack: s.stack.concat([self.snap(s)]), screen: screen, sheet: null, menu: false, mention: null, toast: s.toast }, extra || {});
      if (screen !== 'room' || (extra && extra.roomId && extra.roomId !== s.roomId)) { o.draft = o.draft || ''; o.replyTo = null; }
      return o;
    });
  }
  back() {
    var self = this;
    this.setState(function (s) {
      var st = s.stack.slice(), p = st.pop() || { screen: 'home', tab: 'chats' };
      var o = Object.assign({ stack: st, sheet: null, menu: false, mention: null, replyC: null, writing: s.writing }, p);
      if (s.screen === 'room') { o.draft = ''; o.replyTo = null; if (s.live && s.live.quiet) o.live = null; }
      if (p.screen === 'room' && p.roomId && s.rooms[p.roomId]) { var rooms = Object.assign({}, s.rooms); rooms[p.roomId] = Object.assign({}, rooms[p.roomId], { unread: 0 }); o.rooms = rooms; }
      return o;
    });
  }
  openRoom(id) {
    var self = this;
    this.setState(function (s) {
      var rooms = Object.assign({}, s.rooms);
      rooms[id] = Object.assign({}, rooms[id], { unread: 0 });
      var live = s.live && s.live.quiet && s.live.roomId !== id ? null : s.live;
      return { rooms: rooms, stack: s.stack.concat([self.snap(s)]), screen: 'room', roomId: id, draft: '', replyTo: null, mention: null, sheet: null, menu: false, live: live };
    });
  }
  openProfile(pid) { this.go('profile', { philId: pid }); }
  openJournal(id) {
    var j = this.state.journals.filter(function (x) { return x.id === id; })[0];
    if (!j) return;
    if (j.kind === 'user' && j.status === 'draft') { this.openCompose(j); return; }
    // a conversation note invites a reflection right away; a note I wrote offers it as a button
    this.go('journal', { journalId: id, editingRefl: j.kind === 'conv' && !j.reflection.t, reflDraft: j.reflection.t, editingSum: false, sumDraft: '', replyC: null, cDraft: '' });
  }
  openNote(id) { this.go('note', { noteId: id, nDraft: '' }); }
  openSearch() { var self = this; this.setState({ sheet: { type: 'search' }, search: '' }); this.later(function () { var el = self.searchRef.current; if (el) try { el.focus(); } catch (e) { /* ignore */ } }, 60); }

  /* ----- generation runner ----- */
  setLive(patch) { this.setState(function (s) { return { live: patch === null ? null : Object.assign({}, s.live || {}, patch) }; }); }
  startFlow(roomId, turns, autoCount) {
    this.revSeq = (this.revSeq || 0) + 1;
    var rev = this.revSeq;
    this.g = { roomId: roomId, rev: rev, queue: turns.slice(), paused: false, hold: false, autoLeft: autoCount };
    this.setState({ live: { roomId: roomId, phase: 'wait', paused: false, hold: false, left: autoCount, quiet: false } });
    var self = this;
    this.later(function () { self.nextTurn(rev); }, 420 * this.spd());
  }
  nextTurn(rev) {
    var g = this.g, self = this;
    if (!g || g.rev !== rev || g.paused || g.hold) return;
    var turn = g.queue.shift();
    if (!turn) { this.finishFlow(); return; }
    g.current = turn;
    this.setLive({ phase: 'typing', sp: turn.sp });
    this.later(function () { self.streamTurn(rev, turn); }, (650 + Math.random() * 650) * this.spd());
  }
  streamTurn(rev, turn) {
    var g = this.g, self = this;
    if (!g || g.rev !== rev) return;
    var room = this.state.rooms[g.roomId];
    if (!room) { this.g = null; return; }
    var replyId = null;
    if (turn.to && turn.to !== 'user') {
      for (var i = room.msgs.length - 1; i >= 0; i--) { if (room.msgs[i].a === turn.to && room.msgs[i].k === 'text') { replyId = room.msgs[i].id; break; } }
    }
    var id = this.nid('g');
    var isTemp = room.members.some(function (m) { return m.id === turn.sp && m.type === 'temp'; });
    var msg = { id: id, a: turn.sp, k: 'text', t: turn.t, time: nowHM(), reply: replyId, to: (turn.to && turn.to !== 'user') ? turn.to : null, mn: [], eng: this.engineOf(room), priv: false, temp: isTemp, streaming: true, shown: 0 };
    var open = this.state.screen === 'room' && this.state.roomId === g.roomId;
    this.updRoom(g.roomId, function (r) { r.msgs.push(msg); r.last = nowHM(); r.sort = Date.now(); if (!open) r.unread = (r.unread || 0) + 1; });
    this.setLive({ phase: 'streaming', sp: turn.sp, msgId: id });
    var len = turn.t.length, step = Math.max(1, Math.ceil(len / 34)), shown = 0;
    var tick = function () {
      if (!self.g || self.g.rev !== rev) return;
      shown = Math.min(len, shown + step);
      var n = shown;
      self.updRoom(g.roomId, function (r) {
        r.msgs = r.msgs.map(function (m) { return m.id === id ? Object.assign({}, m, { shown: n, streaming: n < len }) : m; });
      });
      if (n >= len) { self.afterTurn(rev, turn); return; }
      self.later(tick, 30);
    };
    this.later(tick, 30);
  }
  afterTurn(rev, turn) {
    var g = this.g, self = this;
    if (!g || g.rev !== rev) return;
    g.current = null;
    if (turn.auto) g.autoLeft = Math.max(0, g.autoLeft - 1);
    if (turn.tempExit) {
      this.updRoom(g.roomId, function (r) {
        r.members = r.members.filter(function (m) { return !(m.id === turn.sp && m.type === 'temp'); });
        r.msgs.push({ id: self.nid('s'), a: 'sys', k: 'sys', key: 'leftTemp', pid: turn.sp });
      });
    }
    this.setLive({ phase: 'wait', sp: null, msgId: null, left: g.autoLeft });
    this.later(function () { self.nextTurn(rev); }, 520 * this.spd());
  }
  finishFlow() {
    var g = this.g, self = this;
    if (!g) return;
    var roomId = g.roomId;
    this.g = null;
    var s = this.state, room = s.rooms[roomId];
    var showQuiet = room && room.kind === 'group';
    this.setState({ live: showQuiet ? { roomId: roomId, phase: 'quiet', quiet: true, paused: false, hold: false, left: 0 } : null });
    if (room && !s.cards[roomId] && room.msgs.filter(function (m) { return m.k === 'text'; }).length >= 3) {
      var cid = this.nid('c');
      this.updRoom(roomId, function (r) { r.msgs.push({ id: cid, a: 'sys', k: 'card' }); });
      this.setState(function (st) { var c = Object.assign({}, st.cards); c[roomId] = cid; return { cards: c }; });
    }
  }
  pause() { if (this.g) { this.g.paused = true; this.setLive({ paused: true }); } }
  resume() {
    var g = this.g;
    if (!g) return;
    g.paused = false; g.hold = false;
    this.setLive({ paused: false, hold: false });
    if (!g.current) { var rev = g.rev, self = this; this.later(function () { self.nextTurn(rev); }, 200); }
  }
  stopNow() {
    var g = this.g, s = this.state, live = s.live, self = this;
    if (!g) return;
    var roomId = g.roomId, turn = g.current;
    this.g = null;
    if (live && live.phase === 'streaming' && live.msgId && turn) {
      var mid = live.msgId;
      this.updRoom(roomId, function (r) {
        r.msgs = r.msgs.map(function (m) { return m.id === mid ? { id: self.nid('x'), a: 'sys', k: 'stopped', pid: turn.sp, turn: turn } : m; });
      });
    } else if (turn) {
      this.updRoom(roomId, function (r) { r.msgs.push({ id: self.nid('x'), a: 'sys', k: 'stopped', pid: turn.sp, turn: turn }); });
    }
    this.setState({ live: null });
  }
  regen(msgId) {
    var s = this.state, roomId = s.roomId, room = s.rooms[roomId];
    var item = room.msgs.filter(function (m) { return m.id === msgId; })[0];
    if (!item || !item.turn) return;
    this.updRoom(roomId, function (r) { r.msgs = r.msgs.filter(function (m) { return m.id !== msgId; }); });
    this.startFlow(roomId, [Object.assign({}, item.turn, { auto: false, tempExit: false })], 0);
  }
  more() {
    var s = this.state, room = s.rooms[s.roomId];
    if (!room) return;
    var lp = this.lastPlan && this.lastPlan.roomId === room.id ? this.lastPlan : { topic: 'open', used: {}, spoken: [] };
    var lt = lastText(room);
    var plan = planMore({ room: room, lang: this.roomLang(room, ''), topic: lp.topic, used: lp.used, spoken: lp.spoken, lastSp: lt && lt.a !== 'me' ? lt.a : null, seed: this.uid });
    this.lastPlan = { roomId: room.id, topic: lp.topic, used: plan.used, spoken: plan.spoken };
    if (plan.turns.length) this.startFlow(room.id, plan.turns, plan.turns.length);
  }

  /* ----- sending ----- */
  boundMentions(text) {
    var re = mentionRe(), out = [], m;
    re.lastIndex = 0;
    while ((m = re.exec(text))) { var id = idByName(m[1]); if (id && out.indexOf(id) < 0) out.push(id); }
    return out;
  }
  send(textArg) {
    var s = this.state, room = s.rooms[s.roomId], self = this;
    if (!room) return;
    var text = String(textArg != null ? textArg : s.draft).trim();
    if (!text) return;
    var mns = this.boundMentions(text);
    var outside = mns.filter(function (id) { return !room.members.some(function (m) { return m.id === id; }); });
    if (outside.length && room.kind === 'group' && textArg == null) {
      this.setState({ sheet: { type: 'invite', pid: outside[0], roomId: room.id, before: null, pendingSend: true } });
      return;
    }
    var interrupted = false;
    if (this.g && this.g.roomId === room.id) {
      var live = s.live;
      interrupted = true;
      var mid = live && live.phase === 'streaming' ? live.msgId : null;
      this.g = null;
      if (mid) this.updRoom(room.id, function (r) { r.msgs = r.msgs.filter(function (m) { return m.id !== mid; }); });
    }
    var replyMsg = s.replyTo ? room.msgs.filter(function (m) { return m.id === s.replyTo; })[0] : null;
    var it = detectIntent(text);
    var uid = this.nid('u');
    var umsg = { id: uid, a: 'me', k: 'text', t: text, time: nowHM(), reply: s.replyTo, to: null, mn: mns, eng: 'local', priv: it.topic === 'private', temp: false };
    var lastSp = null;
    for (var i = room.msgs.length - 1; i >= 0; i--) { if (room.msgs[i].k === 'text' && room.msgs[i].a !== 'me') { lastSp = room.msgs[i].a; break; } }
    var soft = it.topic === 'soften' || !!s.softRooms[room.id];
    var plan = planTurns({ room: room, text: text, mentions: mns, replyAuthor: replyMsg && replyMsg.a !== 'me' ? replyMsg.a : null, lang: this.roomLang(room, text), rot: this.rot, lastSp: lastSp, soft: soft });
    this.lastPlan = { roomId: room.id, topic: plan.topic, used: plan.used, spoken: plan.spoken };
    this.updRoom(room.id, function (r) {
      if (interrupted) r.msgs.push({ id: self.nid('s'), a: 'sys', k: 'sys', key: 'interrupted' });
      r.msgs.push(umsg);
      plan.sys.forEach(function (k) { r.msgs.push({ id: self.nid('s'), a: 'sys', k: 'sys', key: k === 'private' ? 'privateSys' : 'softenSys' }); });
      r.last = nowHM(); r.sort = Date.now();
    });
    this.setState(function (st) {
      var dr = Object.assign({}, st.debateRooms), sr = Object.assign({}, st.softRooms);
      dr[room.id] = plan.debate && it.topic !== 'soften';
      if (it.topic === 'soften') { sr[room.id] = true; dr[room.id] = false; }
      if (it.change || ['music', 'daily', 'work', 'greet', 'thanks'].indexOf(it.topic) >= 0) { dr[room.id] = false; delete sr[room.id]; }
      return { draft: '', replyTo: null, mention: null, debateRooms: dr, softRooms: sr };
    });
    if (plan.turns.length) this.startFlow(room.id, plan.turns, plan.autoCount);
    else this.setState({ live: null });
  }

  /* ----- composer ----- */
  onDraft(e) {
    var v = e.target.value, pos = e.target.selectionStart != null ? e.target.selectionStart : v.length;
    var m = v.slice(0, pos).match(/@([^\s@]*)$/);
    var room = this.state.rooms[this.state.roomId];
    var mention = m && room && room.kind === 'group' ? { start: pos - m[0].length, q: m[1] } : null;
    this.setState({ draft: v, mention: mention });
    var g = this.g;
    if (g && g.roomId === this.state.roomId && !g.paused) {
      if (v.trim() && !g.hold) { g.hold = true; this.setLive({ hold: true }); }
      else if (!v.trim() && g.hold) { g.hold = false; this.setLive({ hold: false }); if (!g.current) { var rev = g.rev, self = this; this.later(function () { self.nextTurn(rev); }, 300); } }
    }
  }
  focusInput() { var self = this; this.later(function () { var el = self.inputRef.current; if (el) { try { el.focus(); var n = el.value.length; el.setSelectionRange(n, n); } catch (e) { /* ignore */ } } }, 30); }
  atBtn() {
    var d = this.state.draft;
    var nd = d + (d && !/\s$/.test(d) ? ' @' : '@');
    this.setState({ draft: nd, mention: { start: nd.length - 1, q: '' } });
    this.focusInput();
  }
  pickMention(pid) {
    var s = this.state, room = s.rooms[s.roomId], mt = s.mention;
    var d = s.draft;
    var start = mt ? mt.start : d.length;
    var end = mt ? start + 1 + mt.q.length : d.length;
    var nd = d.slice(0, start) + '@' + pn(pid, s.uiLang) + ' ' + d.slice(end);
    var member = room.members.some(function (m) { return m.id === pid; });
    if (member) { this.setState({ draft: nd, mention: null }); this.focusInput(); return; }
    this.setState({ draft: nd, mention: null, sheet: { type: 'invite', pid: pid, roomId: room.id, before: d.slice(0, start) + d.slice(end) } });
  }
  invite(type) {
    var sh = this.state.sheet, self = this;
    if (!sh) return;
    var pid = sh.pid, rid = sh.roomId;
    this.updRoom(rid, function (r) {
      if (!r.members.some(function (m) { return m.id === pid; })) r.members.push({ id: pid, type: type });
      r.msgs.push({ id: self.nid('s'), a: 'sys', k: 'sys', key: type === 'temp' ? 'joinedTemp' : 'joinedFixed', pid: pid });
    });
    this.setState({ sheet: null });
    if (sh.pendingSend) { this.later(function () { self.send(); }, 60); } else this.focusInput();
  }
  cancelInvite() {
    var sh = this.state.sheet;
    if (sh && sh.type === 'invite' && sh.before != null) this.setState({ draft: sh.before, sheet: null });
    else this.setState({ sheet: null });
  }

  /* ----- message actions ----- */
  openDm(pid, src) {
    var s = this.state, id = 'dm-' + pid, self = this, L = s.contentLang;
    var rooms = Object.assign({}, s.rooms);
    if (!rooms[id]) {
      rooms[id] = { id: id, kind: 'dm', pid: pid, name: pn(pid, L), desc: '', members: [{ id: pid, type: 'fixed' }], set: { auto: 'off', freq: 'off', int: 'balanced', notify: 'all', lang: s.settings.aiLang, eng: 'local' }, pinned: false, unread: 0, archived: false, sort: Date.now(), last: nowHM(), msgs: [{ id: id + '0', a: 'sys', k: 'notice', key: 'noticeD', pid: pid }] };
    }
    var r = Object.assign({}, rooms[id]); r.msgs = r.msgs.slice(); r.unread = 0;
    if (src) { r.msgs.push({ id: this.nid('src'), a: 'sys', k: 'src', lkey: src.lkey, lroom: src.lroom || '', t: src.t }); r.sort = Date.now(); r.last = nowHM(); }
    rooms[id] = r;
    this.setState({ rooms: rooms, stack: s.stack.concat([this.snap(s)]), screen: 'room', roomId: id, draft: '', replyTo: null, mention: null, sheet: null, menu: false });
    if (src) {
      var lang = this.roomLang(r, '');
      this.later(function () { self.startFlow(id, [{ sp: pid, t: STR[lang].dmHello[pid], to: 'user', auto: false }], 0); }, 250);
    }
  }
  msgActions(room, m) {
    var t = this.T(), self = this, isPhil = m.a !== 'me', acts = [];
    acts.push({ label: t.actReply, iReply: true, run: function () { self.setState({ replyTo: m.id, sheet: null }); self.focusInput(); } });
    acts.push({ label: t.actCopy, iCopy: true, run: function () { try { if (navigator.clipboard) navigator.clipboard.writeText(m.t); } catch (e) { /* ignore */ } self.setState({ sheet: null }); self.toast(t.copied); } });
    if (isPhil && room.kind === 'group') acts.push({ label: fill(t.actDm, { n: nm(m.a, this.state.uiLang, 'wa') }), sub: t.actDmSub, hasSub: true, iDm: true, run: function () { self.openDm(m.a, { lkey: 'fromRoom', lroom: room.name, t: m.t }); } });
    acts.push({ label: t.actNote, iNote: true, run: function () { self.setState({ sheet: null }); if (isPhil) self.requestNote(m.a, room.id); else self.setState({ sheet: { type: 'pick', mode: 'note', roomId: room.id } }); } });
    acts.push({ label: t.actNoteFrom, sub: t.actNoteFromSub, hasSub: true, iJournal: true, run: function () { self.setState({ sheet: null }); self.draftFromRoom(room.id, m.id); } });
    if (isPhil) acts.push({ label: t.actReport, sub: t.actReportSub, hasSub: true, iFlag: true, run: function () { self.setState({ sheet: { type: 'report', target: 'msg', roomId: room.id, msgId: m.id, reason: null } }); } });
    else acts.push({ label: t.actDelete, iTrash: true, run: function () { self.updRoom(room.id, function (r) { r.msgs = r.msgs.filter(function (x) { return x.id !== m.id; }); }); self.setState({ sheet: null }); } });
    return acts;
  }

  /* ----- journal & notes ----- */
  updJournal(id, fn) {
    this.setState(function (s) {
      return { journals: s.journals.map(function (j) { if (j.id !== id) return j; var n = Object.assign({}, j); n.comments = j.comments.slice(); n.access = Object.assign({}, j.access); n.reflection = Object.assign({}, j.reflection); fn(n); return n; }) };
    });
  }
  updNote(id, fn) {
    this.setState(function (s) {
      return { notes: s.notes.map(function (x) { if (x.id !== id) return x; var n = Object.assign({}, x); n.comments = x.comments.slice(); fn(n); return n; }) };
    });
  }
  canRead(j, pid) { return j.access.mode === 'all' || (j.access.mode === 'selected' && j.access.ids.indexOf(pid) >= 0); }
  /* A conversation note is always a new, independent note (11.1, NOTE-004/005):
     default range = today's session in that room; fromId = from that message onward. */
  draftFromRoom(roomId, fromId) {
    var s = this.state, room = s.rooms[roomId], L = s.contentLang, self = this;
    if (!room) return;
    var msgs = room.msgs, start = 0, i;
    if (fromId) { for (i = 0; i < msgs.length; i++) if (msgs[i].id === fromId) { start = i; break; } }
    else { for (i = msgs.length - 1; i >= 0; i--) if (msgs[i].k === 'day') { start = i + 1; break; } }
    var texts = msgs.slice(start).filter(function (m) { return m.k === 'text' && !m.streaming; });
    if (!texts.length) return;
    var picked = fromId ? texts.slice(0, 6) : texts.slice(-6);
    var firstMe = picked.filter(function (m) { return m.a === 'me'; })[0];
    var ds = dayStr(13, L), jid = this.nid('j');
    var nj = { id: jid, kind: 'conv', day: 13, date: ds.date, dshort: ds.dshort, time: nowHM(), title: firstMe ? clip(firstMe.t, 24) : room.name, status: 'draft',
      access: { mode: s.settings.defAccess, ids: [] }, auto: null, notif: true, rooms: [roomId], range: { n: texts.length, from: picked[0].id },
      sents: picked.map(function (m) { return sentOf(m, roomId, L); }), reflection: { t: '', time: '' }, comments: [] };
    this.setState(function (st) { return { journals: [nj].concat(st.journals) }; });
    this.makePlans(nj);
    var cid = s.cards[roomId];
    if (cid) this.updRoom(roomId, function (r) { r.msgs = r.msgs.filter(function (m) { return m.id !== cid; }); });
    this.setState({ menu: false, live: s.live && s.live.quiet ? null : s.live });
    this.toast(this.T().draftAdded, function () { self.setState({ toast: null }); self.openJournal(jid); }, this.T().view);
  }
  /* Summarizing again never overwrites: the same sources become a new note (NOTE-005). */
  regenNote(jid) {
    var s = this.state, L = s.contentLang, j = s.journals.filter(function (x) { return x.id === jid; })[0];
    if (!j) return;
    var seen = {}, refs = [];
    j.sents.forEach(function (x) { x.refs.forEach(function (r) { var k = r[0] + '/' + r[1]; if (!seen[k]) { seen[k] = true; refs.push(r); } }); });
    var sents = refs.map(function (r) {
      var rm = s.rooms[r[0]], m = rm && rm.msgs.filter(function (x) { return x.id === r[1]; })[0];
      return m ? sentOf(m, r[0], L) : null;
    }).filter(Boolean);
    if (!sents.length) sents = j.sents.filter(function (x) { return !x.guess; }).map(function (x) { return Object.assign({}, x); });
    var ds = dayStr(13, L), nid = this.nid('j');
    var nj = { id: nid, kind: 'conv', day: 13, date: ds.date, dshort: ds.dshort, time: nowHM(), title: j.title, status: 'draft',
      access: { mode: s.settings.defAccess, ids: [] }, auto: null, notif: true, rooms: j.rooms.slice(), range: j.range || null, from: j.id,
      sents: sents, reflection: { t: '', time: '' }, comments: [] };
    this.setState(function (st) { return { journals: [nj].concat(st.journals) }; });
    this.go('journal', { journalId: nid, editingRefl: true, reflDraft: '', editingSum: false, sumDraft: '', replyC: null, cDraft: '' });
    this.toast(this.T().regenNew);
  }

  /* ----- automatic comments: ProactiveActionPlan (NC-002/007/009, 16.3, 16.5) ----- */
  autoModeOf(j) { return (j && j.auto) || this.state.settings.autoC; }
  autoLabel(m) { var o = this.T().autoCOpts.filter(function (x) { return x[0] === m; })[0]; return o ? o[1] : m; }
  planWhen(p, L) { var t = STR[L]; return p.day > 13 ? fill(t.tomorrow, { t: fmtTime(p.at, L) }) : fmtTime(p.at, L); }
  deliverAt(now, n) {
    var q = QUIET[this.state.settings.quiet], p = String(now).split(':'), m0 = (+p[0]) * 60 + (+p[1]), out = [];
    for (var k = 0; k < n; k++) {
      var m = m0 + 180 + k * 55, day = 13;
      if (m >= 1440) { m -= 1440; day = 14; }
      if (q && (q[0] > q[1] ? (m >= q[0] || m < q[1]) : (m >= q[0] && m < q[1]))) { if (m >= q[0]) day += 1; m = q[1] + 30 + k * 20; }
      out.push({ day: day, at: toHM(m) });
    }
    return out;
  }
  // NOTE_CREATED / NOTE_REFLECTION_ADDED / access granted -> maybe prepare a comment ahead of time
  makePlans(j) {
    var s = this.state, self = this, mode = this.autoModeOf(j);
    if (!j || mode === 'off' || j.access.mode === 'private' || j.status === 'draft' && j.kind === 'user') return 0;
    var active = s.plans.filter(function (p) { return p.jid === j.id; });
    var cap = mode === 'active' ? 2 : 1;
    if (active.length >= cap) return 0;
    if (mode === 'some' && j.comments.some(function (c) { return c.auto; })) return 0;
    var pref = [];
    (j.rooms || []).forEach(function (rid) { var r = s.rooms[rid]; if (r) r.members.forEach(function (m) { if (pref.indexOf(m.id) < 0) pref.push(m.id); }); });
    ['ca', 'so', 'au', 'ni', 'sh', 'ci'].forEach(function (id) { if (pref.indexOf(id) < 0) pref.push(id); });
    var taken = {};
    active.forEach(function (p) { taken[p.pid] = true; });
    j.comments.forEach(function (c) { if (c.a !== 'me') taken[c.a] = true; });
    var picks = pref.filter(function (id) { return self.canRead(j, id) && !taken[id]; }).slice(0, cap - active.length);
    if (!picks.length) return 0;
    var now = nowHM(), when = this.deliverAt(now, picks.length), li = s.contentLang === 'ko' ? 0 : 1;
    var bank = ENTRY_COMMENT[j.id] || ENTRY_COMMENT.gen;
    var plans = picks.map(function (pid, k) {
      return { id: self.nid('pl'), kind: 'comment', jid: j.id, pid: pid, day: when[k].day, at: when[k].at, prepared: now, status: 'scheduled', rev: (j.revs || []).length, t: (bank[pid] || ENTRY_COMMENT.gen[pid])[li] };
    });
    this.setState(function (st) { return { plans: st.plans.concat(plans) }; });
    return plans.length;
  }
  cancelPlans(jid, pred) {
    var gone = this.state.plans.filter(function (p) { return p.jid === jid && (!pred || pred(p)); });
    if (!gone.length) return 0;
    var ids = {};
    gone.forEach(function (p) { ids[p.id] = true; });
    this.setState(function (st) { return { plans: st.plans.filter(function (p) { return !ids[p.id]; }) }; });
    return gone.length;
  }
  // an edit changes the note's revision: pending comments are written again against it
  recheckPlans(jid) {
    var self = this, n = this.state.plans.filter(function (p) { return p.jid === jid; }).length;
    if (!n) return 0;
    this.setState(function (st) { return { plans: st.plans.map(function (p) { return p.jid === jid ? Object.assign({}, p, { status: 'checking' }) : p; }) }; });
    this.later(function () {
      var at = nowHM();
      self.setState(function (st) { return { plans: st.plans.map(function (p) { return p.jid === jid && p.status === 'checking' ? Object.assign({}, p, { status: 'scheduled', prepared: at, rechecked: true }) : p; }) }; });
      self.toast(self.T().planRechecked);
    }, 1400 * this.spd());
    return n;
  }
  // "지금 받기" = the scheduled time arriving; everything is checked again first
  deliverPlan(id) {
    var self = this, p = this.state.plans.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    this.setState(function (st) { return { plans: st.plans.map(function (x) { return x.id === id ? Object.assign({}, x, { status: 'posting' }) : x; }) }; });
    this.later(function () {
      var st = self.state, still = st.plans.filter(function (x) { return x.id === id; })[0];
      if (!still) return;
      var jj = st.journals.filter(function (x) { return x.id === p.jid; })[0];
      var ok = !!jj && self.canRead(jj, p.pid) && self.autoModeOf(jj) !== 'off';
      self.setState(function (x) { return { plans: x.plans.filter(function (y) { return y.id !== id; }) }; });
      if (!ok) { self.toast(self.T().planStale); return; }
      self.updJournal(p.jid, function (n) { n.comments.push({ id: self.nid('jc'), a: p.pid, t: p.t, time: nowHM(), parent: null, auto: true, prepared: p.prepared }); });
      self.toast(fill(self.T().planArrived, { n: pn(p.pid, st.uiLang) }));
    }, 900 * this.spd());
  }
  saveAccess(sh) {
    var s = this.state, t = this.T(), self = this, j = s.journals.filter(function (x) { return x.id === sh.journalId; })[0];
    if (!j) return;
    var access = { mode: sh.mode, ids: sh.mode === 'selected' ? sh.ids.slice() : [] };
    var after = Object.assign({}, j, { access: access, auto: sh.auto || null, notif: sh.notif !== false });
    this.updJournal(j.id, function (x) { x.access = access; x.auto = after.auto; x.notif = after.notif; });
    this.setState({ sheet: null });
    // permission changes cancel what no longer fits (11.4, NC-009)
    var gone = this.cancelPlans(j.id, function (p) { return !self.canRead(after, p.pid) || self.autoModeOf(after) === 'off'; });
    if (gone) { this.toast(fill(t.accSavedCancel, { n: gone })); return; }
    this.toast(this.makePlans(after) ? t.accSavedPlan : t.accSaved);
  }
  setAutoDefault(m) {
    var s = this.state, t = this.T(), self = this, n = 0;
    this.setState({ settings: Object.assign({}, s.settings, { autoC: m }) });
    if (m === 'off') s.journals.forEach(function (j) { if (!j.auto) n += self.cancelPlans(j.id); });
    this.toast(n ? fill(t.autoCChanged, { m: this.autoLabel(m) }) + ' · ' + fill(t.planCancelledN, { n: n }) : fill(t.autoCChanged, { m: this.autoLabel(m) }));
  }

  /* ----- writing a note: title + body, drafts, versions (NOTE-003/011/012, 11.3) ----- */
  openCompose(j) {
    var self = this;
    var c = j
      ? { id: j.id, mode: j.status === 'draft' ? 'draft' : 'edit', title: j.title || '', body: j.body || '', day: j.day, t0: j.title || '', b0: j.body || '', d0: j.day, savedAt: j.status === 'draft' ? j.time : null, saving: false, pickDate: false }
      : { id: this.nid('j'), mode: 'new', title: '', body: '', day: 13, t0: '', b0: '', d0: 13, savedAt: null, saving: false, pickDate: false };
    this.go('compose', { compose: c });
    if (!j) this.later(function () { var el = self.cpTitleRef.current; if (el) try { el.focus(); } catch (e) { /* ignore */ } }, 60);
  }
  cpSet(patch) {
    var self = this, c = this.state.compose;
    if (!c) return;
    var typing = 'title' in patch || 'body' in patch || 'day' in patch;
    var drafty = c.mode !== 'edit' && typing;
    this.setState(function (s) { return s.compose ? { compose: Object.assign({}, s.compose, patch, drafty ? { saving: true } : {}) } : null; });
    if (!drafty) return;
    // a draft saves itself to this note id only; nothing exists until there is something to keep
    if (this.cpTimer) clearTimeout(this.cpTimer);
    this.cpTimer = this.later(function () { self.cpTimer = null; self.cpAutosave(); }, 700);
  }
  cpAutosave() {
    var c = this.state.compose;
    if (!c || c.mode === 'edit') return;
    var has = !!(c.title.trim() || c.body.trim()), at = nowHM();
    this.upsertDraft(c, has);
    this.setState(function (st) { return st.compose ? { compose: Object.assign({}, st.compose, { saving: false, savedAt: has ? at : null }) } : null; });
  }
  upsertDraft(c, has) {
    var s = this.state, L = s.contentLang, ds = dayStr(c.day, L);
    var exists = s.journals.some(function (j) { return j.id === c.id; });
    if (!has) { if (exists) this.setState(function (st) { return { journals: st.journals.filter(function (j) { return j.id !== c.id || j.status !== 'draft'; }) }; }); return; }
    if (exists) { this.updJournal(c.id, function (x) { x.title = c.title.trim(); x.body = c.body.trim(); x.day = c.day; x.date = ds.date; x.dshort = ds.dshort; }); return; }
    var nj = { id: c.id, kind: 'user', day: c.day, date: ds.date, dshort: ds.dshort, time: nowHM(), title: c.title.trim(), body: c.body.trim(), status: 'draft', access: { mode: s.settings.defAccess, ids: [] }, auto: null, notif: true, rooms: [], sents: [], revs: [], reflection: { t: '', time: '' }, comments: [] };
    this.setState(function (st) { return { journals: [nj].concat(st.journals) }; });
  }
  cpLeave() { if (this.cpTimer) { clearTimeout(this.cpTimer); this.cpTimer = null; } this.back(); this.setState({ compose: null }); }
  cpClose() {
    var s = this.state, c = s.compose, t = this.T(), self = this;
    if (!c) { this.back(); return; }
    if (c.mode === 'edit') {
      if (c.title !== c.t0 || c.body !== c.b0 || c.day !== c.d0) { this.setState({ sheet: { type: 'confirm', what: 'discard' } }); return; }
      this.cpLeave(); return;
    }
    var has = !!(c.title.trim() || c.body.trim()), id = c.id, isNew = c.mode === 'new';
    this.upsertDraft(c, has);
    this.cpLeave();
    if (!has) { if (isNew) this.toast(t.emptyDiscarded); return; }
    this.toast(t.draftKept, function () { self.setState({ toast: null }); var j = self.state.journals.filter(function (x) { return x.id === id; })[0]; if (j) self.openCompose(j); }, t.keepWriting);
  }
  cpDone() {
    var s = this.state, c = s.compose, t = this.T(), L = s.contentLang;
    if (!c) return;
    var title = c.title.trim(), body = c.body.trim();
    if (!title && !body) return;
    if (this.cpTimer) { clearTimeout(this.cpTimer); this.cpTimer = null; }
    var at = nowHM(), ds = dayStr(c.day, L), ver = { at: at, title: title, body: body, day: c.day };
    if (c.mode === 'edit') {
      if (title === c.t0.trim() && body === c.b0.trim() && c.day === c.d0) { this.cpLeave(); return; }
      // same note_id, a new version; comments and links stay attached
      this.updJournal(c.id, function (x) { x.title = title; x.body = body; x.day = c.day; x.date = ds.date; x.dshort = ds.dshort; x.revs = (x.revs || []).concat([ver]); });
      var n = this.recheckPlans(c.id);
      this.cpLeave();
      this.toast(n ? t.revSaved + ' · ' + t.planChecking : t.revSaved);
      return;
    }
    var old = s.journals.filter(function (j) { return j.id === c.id; })[0];
    var saved = Object.assign({ id: c.id, kind: 'user', time: at, access: { mode: s.settings.defAccess, ids: [] }, auto: null, notif: true, rooms: [], sents: [], reflection: { t: '', time: '' }, comments: [] }, old || {},
      { day: c.day, date: ds.date, dshort: ds.dshort, title: title, body: body, status: 'saved', revs: [ver] });
    this.setState(function (st) { return { journals: old ? st.journals.map(function (j) { return j.id === c.id ? saved : j; }) : [saved].concat(st.journals) }; });
    // the compose screen becomes the saved note; back still leads to the list
    this.setState({ screen: 'journal', journalId: c.id, compose: null, editingRefl: false, reflDraft: '', editingSum: false, sumDraft: '', replyC: null, cDraft: '', menu: false, sheet: null });
    this.toast(this.makePlans(saved) ? t.savedPlan : t.noteSaved);
  }
  requestComment(pid) {
    var s = this.state, j = s.journals.filter(function (x) { return x.id === s.journalId; })[0], self = this;
    if (!j) return;
    this.setState({ sheet: null, writing: { kind: 'journal', id: j.id, pid: pid } });
    var L = s.contentLang, li = L === 'ko' ? 0 : 1;
    var bank = ENTRY_COMMENT[j.id] || ENTRY_COMMENT.gen;
    var t = (bank[pid] || ENTRY_COMMENT.gen[pid])[li];
    this.later(function () {
      self.updJournal(j.id, function (n) { n.comments.push({ id: self.nid('jc'), a: pid, t: t, time: nowHM(), parent: null }); });
      self.setState({ writing: null });
      if (self.cancelPlans(j.id, function (p) { return p.pid === pid; })) self.toast(fill(self.T().planDup, { n: nm(pid, self.state.uiLang, 'ga') }));
    }, 1700 * this.spd());
  }
  sendCommentReply() {
    var s = this.state, j = s.journals.filter(function (x) { return x.id === s.journalId; })[0], self = this;
    var text = s.cDraft.trim();
    if (!j || !text || !s.replyC) return;
    var parent = j.comments.filter(function (c) { return c.id === s.replyC; })[0];
    var myId = this.nid('jc');
    this.updJournal(j.id, function (n) { n.comments.push({ id: myId, a: 'me', t: text, time: nowHM(), parent: s.replyC }); });
    this.setState({ cDraft: '', replyC: null });
    if (parent && parent.a !== 'me' && this.canRead(j, parent.a)) {
      var pid = parent.a, L = this.roomLang({ set: { lang: s.settings.aiLang } }, text);
      this.setState({ writing: { kind: 'journal', id: j.id, pid: pid } });
      this.later(function () {
        self.updJournal(j.id, function (n) { n.comments.push({ id: self.nid('jc'), a: pid, t: REPLY_BACK[pid][L === 'ko' ? 0 : 1], time: nowHM(), parent: myId }); });
        self.setState({ writing: null });
      }, 1600 * this.spd());
    }
  }
  sendNoteComment() {
    var s = this.state, note = s.notes.filter(function (x) { return x.id === s.noteId; })[0], self = this;
    var text = s.nDraft.trim();
    if (!note || !text) return;
    var myId = this.nid('nc');
    this.updNote(note.id, function (n) { n.comments.push({ id: myId, a: 'me', t: text, time: nowHM(), parent: null }); });
    this.setState({ nDraft: '', writing: { kind: 'note', id: note.id, pid: note.a } });
    var L = this.roomLang({ set: { lang: s.settings.aiLang } }, text);
    this.later(function () {
      self.updNote(note.id, function (n) { n.comments.push({ id: self.nid('nc'), a: note.a, t: NOTE_REPLY[note.a][L === 'ko' ? 0 : 1], time: nowHM(), parent: myId }); });
      self.setState({ writing: null });
    }, 1700 * this.spd());
  }
  requestNote(pid, roomId) {
    var s = this.state, self = this, L = s.contentLang, li = L === 'ko' ? 0 : 1, t = this.T();
    var room = roomId ? s.rooms[roomId] : null;
    if (!room) {
      var cand = Object.keys(s.rooms).map(function (k) { return s.rooms[k]; }).filter(function (r) { return r.members.some(function (m) { return m.id === pid; }); }).sort(bySort);
      room = cand[0] || null;
    }
    var lt = room ? room.msgs.filter(function (m) { return m.k === 'text' && m.a === 'me'; }).slice(-1)[0] : null;
    var q = lt ? clip(lt.t, 40) : (L === 'ko' ? '오늘 하루' : 'today');
    var rname = room ? room.name : (L === 'ko' ? '오늘의 대화' : 'today’s talk');
    var tpl = NOTE_TPL[pid];
    var title = fill(tpl.t[li], { r: rname });
    if (L === 'ko' && pid === 'ci') title = rname + (hasBatchim(rname) ? '이' : '가') + ' 끝난 뒤';
    var note = { id: this.nid('n'), a: pid, date: L === 'ko' ? '10월 13일 ' + nowHM() : 'Oct 13, ' + fmtTime(nowHM(), 'en'), origin: { room: room ? room.id : null }, title: title, paras: tpl.p.map(function (p) { return fill(p[li], { r: rname, q: q }); }), quote: null, allowOthers: false, comments: [] };
    this.setState({ sheet: null, menu: false });
    this.toast(fill(t.noteWriting, { n: nm(pid, s.uiLang, 'ga') }));
    this.later(function () {
      self.setState(function (st) { return { notes: [note].concat(st.notes), newNote: true }; });
      self.toast(fill(self.T().noteArrived, { n: pn(pid, self.state.uiLang) }), function () { self.setState({ toast: null }); self.openNote(note.id); }, self.T().view);
    }, 2400 * this.spd());
  }
  // '새 노트' issues a new note id every time; the note only appears once something is written
  newEntry() { this.openCompose(null); }

  /* ----- room settings ----- */
  setRoom(id, key, val) {
    var s = this.state, t = this.T();
    if (key === 'eng' && val === 'cloud') {
      if (!s.plus) { this.toast(t.needPlus); this.go('plus'); return; }
      if (!s.consent.agreed) { this.setState({ sheet: { type: 'cloud', from: 'room', roomId: id } }); return; }
    }
    this.updRoom(id, function (r) { r.set[key] = val; });
    if (key === 'eng') this.toast(val === 'cloud' ? t.cloudOn : t.localOn);
  }
  agreeCloud() {
    var s = this.state, sh = s.sheet, t = this.T();
    this.setState({ consent: Object.assign({}, s.consent, { agreed: true }), plus: true, sheet: null });
    if (sh && sh.roomId) { this.updRoom(sh.roomId, function (r) { r.set.eng = 'cloud'; }); this.toast(t.cloudOn); }
    else this.toast(t.plusOnToast);
  }

  /* ----- onboarding & models ----- */
  dlTick(kind) {
    var self = this, s = this.state;
    if (kind === 'ob') {
      if (s.ob.dlState !== 'downloading') return;
      var n = Math.min(100, s.ob.dl + 3 + Math.floor(Math.random() * 4));
      if (n >= 100) {
        this.setState({ ob: Object.assign({}, s.ob, { dl: 100, dlState: 'verifying' }) });
        this.later(function () { self.setState(function (st) { return { ob: Object.assign({}, st.ob, { dlState: 'done' }) }; }); }, 900);
        return;
      }
      this.setState({ ob: Object.assign({}, s.ob, { dl: n }) });
      this.later(function () { self.dlTick('ob'); }, 110);
    } else {
      if (s.models.light !== 'downloading') return;
      var p = Math.min(100, s.models.lightP + 4 + Math.floor(Math.random() * 5));
      if (p >= 100) { this.setState({ models: Object.assign({}, s.models, { light: 'installed', lightP: 100 }) }); return; }
      this.setState({ models: Object.assign({}, s.models, { lightP: p }) });
      this.later(function () { self.dlTick('model'); }, 110);
    }
  }
  reseedLang(L) {
    var w = seedWorld(L);
    this.clearAll(); this.g = null;
    this.setState({ uiLang: L, contentLang: L, rooms: w.rooms, journals: w.journals, notes: w.notes, mems: w.mems, plans: w.plans, compose: null, live: null });
  }

  /* ----- view models ----- */
  vHome(s, t, L) {
    var self = this, rooms = Object.keys(s.rooms).map(function (k) { return s.rooms[k]; });
    var live = this.g;
    var row = function (r) {
      var lm = lastText(r), isDm = r.kind === 'dm';
      var isLive = !!(live && live.roomId === r.id);
      var who = lm ? (lm.a === 'me' ? t.you : pn(lm.a, L)) : '';
      return {
        isRow: true, open: function () { self.openRoom(r.id); }, isGroup: !isDm, isDm: isDm, pid: r.pid || '', img: isDm ? IMG[r.pid] : '',
        faces: r.members.slice(0, 3).map(function (m) { return { img: IMG[m.id] }; }), name: r.name, count: r.members.length,
        reached: !!r.reached && r.unread > 0, time: fmtTime(r.last, L), live: isLive, notLive: !isLive,
        liveText: live && live.paused ? t.pausedLive : t.liveText, lastPid: lm ? lm.a : '', hasWho: !!lm && (!isDm || lm.a === 'me'),
        who: who + ':', prev: lm ? lm.t : '', hasUnread: r.unread > 0, unread: r.unread
      };
    };
    var vis = rooms.filter(function (r) { return !r.archived; });
    var pinned = vis.filter(function (r) { return r.pinned; }).sort(bySort);
    var others = vis.filter(function (r) { return !r.pinned; }).sort(bySort);
    var arch = rooms.filter(function (r) { return r.archived; }).sort(bySort);
    var items = [];
    if (pinned.length) { items.push({ isHead: true, label: t.pinned }); pinned.forEach(function (r) { items.push(row(r)); }); }
    items.push({ isHead: true, label: t.allChats });
    others.forEach(function (r) { items.push(row(r)); });
    if (arch.length) {
      items.push({ isArch: true, label: fill(t.archivedCount, { n: arch.length }), toggle: function () { self.setState({ showArchived: !s.showArchived }); } });
      if (s.showArchived) arch.forEach(function (r) { items.push(row(r)); });
    }
    return {
      items: items, newChat: function () { self.setState({ sheet: { type: 'newChat' } }); }, search: function () { self.openSearch(); }
    };
  }
  vRecords(s, t, L) {
    var self = this;
    // a date groups notes; it never identifies one. Newest day first, then newest time first.
    var entries = s.journals.slice().sort(function (a, b) { return b.day - a.day || String(b.time || '').localeCompare(String(a.time || '')); });
    var byDay = s.dayFilter != null ? entries.filter(function (j) { return j.day === s.dayFilter; }) : entries;
    var filtered = s.kindFilter === 'all' ? byDay : byDay.filter(function (j) { return j.kind === s.kindFilter; });
    var accessLabel = function (j) {
      if (j.access.mode === 'private') return t.accPrivate;
      if (j.access.mode === 'all') return t.accAllShort;
      return j.access.ids.map(function (id) { return pn(id, L); }).join(', ') || t.accPrivate;
    };
    var groups = [];
    filtered.forEach(function (j) {
      var g = groups[groups.length - 1];
      if (!g || g.day !== j.day) { g = { day: j.day, label: j.date, items: [] }; groups.push(g); }
      g.items.push(j);
    });
    var card = function (j) {
      var isUser = j.kind === 'user', shared = j.access.mode !== 'private';
      var faces = [];
      j.comments.forEach(function (c) { if (c.a !== 'me' && faces.indexOf(c.a) < 0) faces.push(c.a); });
      var plans = s.plans.filter(function (p) { return p.jid === j.id; });
      return {
        open: function () { self.openJournal(j.id); },
        isUserK: isUser, isConvK: !isUser, kindLabel: isUser ? t.kindUser : t.kindConv, time: fmtTime(j.time, L),
        isDraftUser: isUser && j.status === 'draft', isDraftAi: !isUser && j.status === 'draft', isEdited: !isUser && !!j.edited,
        title: noteTitle(j, t), excerpt: isUser ? (j.body || '…') : (j.edited || j.sents.map(function (x) { return x.t; }).join(' ')),
        accessCls: 'ag-access' + (shared ? ' shared' : ''), isPrivate: !shared, isShared: shared, access: accessLabel(j),
        hasPlan: plans.length > 0, planLabel: plans.length ? fill(t.listPlan, { n: pn(plans[0].pid, L), w: self.planWhen(plans[0], L) }) : '',
        hasComments: j.comments.length > 0, faces: faces.slice(0, 3).map(function (id) { return { img: IMG[id] }; }), comments: fill(t.commentsN, { n: j.comments.length })
      };
    };
    var notes = s.notes.filter(function (n) { return s.noteFilter === 'all' || n.a === s.noteFilter; });
    var authors = [];
    s.notes.forEach(function (n) { if (authors.indexOf(n.a) < 0) authors.push(n.a); });
    var originLabel = function (n) {
      var r = n.origin.room && s.rooms[n.origin.room];
      if (!r) return '';
      return r.kind === 'dm' ? fill(t.originDm, { n: nm(r.pid, L, 'wae') }) : fill(t.originRoom, { n: r.name });
    };
    var modeLabel = (t.noteModes.filter(function (m) { return m[0] === s.settings.noteAuto; })[0] || t.noteModes[1])[1];
    return {
      isJ: s.recSeg === 'journal', isN: s.recSeg === 'notes', jCls: s.recSeg === 'journal' ? 'on' : '', nCls: s.recSeg === 'notes' ? 'on' : '',
      showJ: function () { self.setState({ recSeg: 'journal' }); }, showN: function () { self.setState({ recSeg: 'notes', newNote: false }); },
      countLabel: fill(t.countMonth, { n: s.journals.length }),
      week: WEEK.map(function (d, k) {
        var cnt = s.journals.filter(function (j) { return j.day === d; }).length, on = s.dayFilter === d;
        return { num: d, dow: t.dows[k], cls: 'ag-day-c' + (on ? ' on' : ''), on: on, dotCls: cnt ? '' : 'none', aria: fill(t.dayAria, { d: L === 'ko' ? '10월 ' + d + '일' : 'Oct ' + d, n: cnt }), pick: function () { self.setState({ dayFilter: on ? null : d }); } };
      }),
      filtered: s.dayFilter != null, filterLabel: fill(t.filterDay, { d: L === 'ko' ? '10월 ' + s.dayFilter + '일' : 'Oct ' + s.dayFilter }), clearDay: function () { self.setState({ dayFilter: null }); },
      kinds: t.kindFilters.map(function (k) { var on = s.kindFilter === k[0]; return { label: k[1], on: on, cls: 'ag-chip' + (on ? ' on' : ''), pick: function () { self.setState({ kindFilter: k[0] }); } }; }),
      groups: groups.map(function (g) { return { label: g.label, count: g.items.length === 1 ? t.dayCount1 : fill(t.dayCount, { n: g.items.length }), entries: g.items.map(card) }; }),
      empty: filtered.length === 0, emptyText: byDay.length ? t.kindEmpty : t.journalEmpty, write: function () { self.newEntry(); },
      filters: [{ label: t.allFilter, cls: 'ag-chip' + (s.noteFilter === 'all' ? ' on' : ''), on: s.noteFilter === 'all', hasImg: false, pick: function () { self.setState({ noteFilter: 'all' }); } }].concat(authors.map(function (id) {
        return { label: pn(id, L), img: IMG[id], hasImg: true, cls: 'ag-chip' + (s.noteFilter === id ? ' on' : ''), on: s.noteFilter === id, pick: function () { self.setState({ noteFilter: id }); } };
      })),
      autoLabel: t.noteAuto + ' · ' + modeLabel, noteSettings: function () { self.setState({ sheet: { type: 'noteSet' } }); },
      notes: notes.map(function (n) {
        var vis = n.comments.filter(function (c) { return !c.other || n.allowOthers; });
        return { pid: n.a, img: IMG[n.a], name: pn(n.a, L), meta: fill(t.noteMeta, { d: n.date, o: originLabel(n) }), title: n.title, excerpt: n.paras[0], hasComments: vis.length > 0, comments: fill(t.commentsN, { n: vis.length }), open: function () { self.openNote(n.id); } };
      }),
      notesEmpty: notes.length === 0, askNote: function () { self.setState({ sheet: { type: 'pick', mode: 'note', roomId: null } }); }
    };
  }
  vPeople(s, t, L) {
    var self = this;
    return {
      list: ORDER.map(function (id) {
        return { id: id, img: IMG[id], name: pn(id, L), years: PH[id].years[L], one: PH[id].one[L], chatAria: fill(t.actDm, { n: nm(id, L, 'wa') }), open: function () { self.openProfile(id); }, chat: function () { self.openDm(id); } };
      })
    };
  }
  vSettings(s, t, L) {
    var self = this, st = s.settings;
    var sw = function (on) { return 'ag-sw' + (on ? ' on' : ''); };
    var upd = function (o) { self.setState(function (x) { return { settings: Object.assign({}, x.settings, o) }; }); };
    var quiets = ['22:00–08:00', '23:00–07:00', t.quietOff];
    var guesses = s.mems.filter(function (m) { return m.kind === 'guess'; }).length;
    var accOrder = ['private', 'selected', 'all'];
    var accLabel = { private: t.accPrivate, selected: t.accSelected, all: t.accAll };
    var modeLabel = (t.noteModes.filter(function (m) { return m[0] === st.noteAuto; })[0] || t.noteModes[1])[1];
    return {
      openModels: function () { self.go('models'); }, openPlus: function () { self.go('plus'); },
      localSub: t.localSub, localOn: true, plusSub: s.plus ? t.plusSubOn : t.plusSubOff, cloudOn: s.plus,
      uiKoCls: s.uiLang === 'ko' ? 'on' : '', uiEnCls: s.uiLang === 'en' ? 'on' : '', uiIsKo: s.uiLang === 'ko', uiIsEn: s.uiLang === 'en',
      uiKo: function () { self.setState({ uiLang: 'ko' }); }, uiEn: function () { self.setState({ uiLang: 'en' }); },
      aiLangs: t.aiLangOpts.map(function (o) {
        return { label: o[1], on: st.aiLang === o[0], cls: st.aiLang === o[0] ? 'on' : '', pick: function () {
          upd({ aiLang: o[0] });
          self.setState(function (x) { var rooms = {}; Object.keys(x.rooms).forEach(function (k) { rooms[k] = Object.assign({}, x.rooms[k], { set: Object.assign({}, x.rooms[k].set, { lang: o[0] }) }); }); return { rooms: rooms }; });
        } };
      }),
      aiLangHelp: t.aiLangHelp[st.aiLang],
      themes: t.themeOpts.map(function (o) { return { label: o[1], on: s.themeMode === o[0], cls: s.themeMode === o[0] ? 'on' : '', pick: function () { self.setState({ themeMode: o[0] }); } }; }),
      initOn: st.init, initCls: sw(st.init), toggleInit: function () { upd({ init: !st.init }); },
      maxLabel: fill(t.maxLabel, { n: st.max }), maxOpts: [1, 2, 3].map(function (n) { return { label: fill(t.timesN, { n: n }), on: st.max === n, cls: st.max === n ? 'on' : '', pick: function () { upd({ max: n }); } }; }),
      quietLabel: quiets[st.quiet], cycleQuiet: function () { upd({ quiet: (st.quiet + 1) % 3 }); },
      hideLock: st.hideLock, hideCls: sw(st.hideLock), toggleHide: function () { upd({ hideLock: !st.hideLock }); },
      openMemory: function () { self.go('memory', { memRoom: null, memFilter: 'all' }); }, memSub: fill(t.memSub, { n: s.mems.length, g: guesses }),
      accessLabel: accLabel[st.defAccess], cycleAccess: function () { upd({ defAccess: accOrder[(accOrder.indexOf(st.defAccess) + 1) % 3] }); },
      noteAutoLabel: modeLabel, openNoteSettings: function () { self.setState({ sheet: { type: 'noteSet' } }); },
      autoCLabel: this.autoLabel(st.autoC), openAutoC: function () { self.setState({ sheet: { type: 'autoSet' } }); },
      exportAll: function () { self.toast(t.exported); },
      appLock: st.appLock, lockCls: sw(st.appLock), toggleLock: function () { upd({ appLock: !st.appLock }); },
      diag: st.diag, diagCls: sw(st.diag), toggleDiag: function () { upd({ diag: !st.diag }); },
      deleteAll: function () { self.setState({ sheet: { type: 'confirm', what: 'all' } }); },
      sources: function () { self.setState({ sheet: { type: 'info', what: 'sources' } }); },
      reports: function () { self.setState({ sheet: { type: 'info', what: 'reports' } }); },
      reportsSub: s.reports.length ? fill(t.reportsN, { n: s.reports.length }) : t.reportsNone,
      restart: function () { self.setState({ screen: 'ob', ob: { step: 1, dl: 0, dlState: 'idle', wifi: true, notif: false, diag: false }, stack: [] }); }
    };
  }
  vRoom(s, t, L) {
    var self = this, r = s.rooms[s.roomId];
    if (!r) return {};
    var isDm = r.kind === 'dm', live = s.live && s.live.roomId === r.id ? s.live : null, g = this.g && this.g.roomId === r.id ? this.g : null;
    var nameOf = function (a) { return a === 'me' ? t.you : pn(a, L); };
    var byId = {};
    r.msgs.forEach(function (m) { byId[m.id] = m; });
    var items = [], prev = null;
    r.msgs.forEach(function (m, idx) {
      var o = { id: m.id };
      if (m.k === 'day') { o.isDay = true; o.text = m.t; }
      else if (m.k === 'notice') { o.isNotice = true; o.text = m.key === 'noticeD' ? fill(t.noticeD, { n: nm(m.pid, L, 'neun') }) : (m.key ? t[m.key] : m.t); }
      else if (m.k === 'sys') {
        o.isSys = true;
        var args = {};
        if (m.pid) args.n = nm(m.pid, L, 'ga');
        if (m.ids) args.n = L === 'ko' ? jo(joinNames(m.ids, L), '과', '와') : joinNames(m.ids, L);
        o.text = fill(t[m.key] || '', args);
      }
      else if (m.k === 'src') { o.isSrc = true; o.label = fill(t[m.lkey] || '', { n: m.lroom }); o.text = clip(m.t, 120); }
      else if (m.k === 'init') { o.isInit = true; o.text = fill(t.initTag, { n: nm(r.pid, L, 'ga') }); o.why = function () { self.setState({ sheet: { type: 'why', roomId: r.id, msgId: m.why } }); }; }
      else if (m.k === 'stopped') { o.isStopped = true; o.text = fill(t.stoppedText, { n: pn(m.pid, L) }); o.regen = function () { self.regen(m.id); }; }
      else if (m.k === 'card') {
        o.isCard = true; o.text = t.journalCard;
        o.yes = function () { self.draftFromRoom(r.id); };
        o.no = function () { self.updRoom(r.id, function (x) { x.msgs = x.msgs.filter(function (y) { return y.id !== m.id; }); }); };
      }
      else if (m.k === 'text') {
        var me = m.a === 'me';
        var next = r.msgs[idx + 1];
        var first = !(prev && prev.k === 'text' && prev.a === m.a && !m.to && !m.reply);
        var lastIn = !(next && next.k === 'text' && next.a === m.a && !next.to && !next.reply);
        var shown = m.streaming ? m.t.slice(0, m.shown || 0) : m.t;
        var q = m.reply ? byId[m.reply] : null;
        o.isMe = me; o.isPhil = !me; o.pid = me ? 'me' : m.a; o.img = me ? '' : IMG[m.a]; o.name = nameOf(m.a);
        o.first = first; o.showMeta = lastIn && !m.streaming;
        o.rowCls = 'ag-row' + (me ? ' me' : '') + (first ? ' gap' : '');
        o.bubCls = 'ag-bub' + (first ? ' first' : '') + (me ? ' me' : '') + (m.streaming ? ' streaming' : '');
        o.segs = segsOf(shown); o.streaming = !!m.streaming;
        o.hasQuote = !!q && q.k === 'text'; o.qPid = q ? q.a : ''; o.qName = q ? nameOf(q.a) : ''; o.qText = q ? clip(q.t, 64) : '';
        o.hasTo = !!m.to && first; o.toName = m.to ? pn(m.to, L) : '';
        o.priv = !!m.priv;
        o.meta = (me && m.priv ? t.thisRoomOnly + ' · ' : '') + fmtTime(m.time, L) + (m.eng === 'cloud' ? ' · Plus' : '') + (m.temp ? ' · ' + t.guestTag : '');
        o.menu = function () { self.setState({ sheet: { type: 'msg', roomId: r.id, msgId: m.id }, mention: null }); };
        o.profile = function () { self.openProfile(m.a); };
        o.profileAria = fill(t.profileOf, { n: pn(m.a, L) });
      }
      prev = m;
      items.push(o);
    });
    var hasText = r.msgs.some(function (m) { return m.k === 'text'; });
    var memberIds = r.members.map(function (m) { return m.id; });
    var mt = s.mention && !isDm ? s.mention : null;
    var q = mt ? mt.q.toLowerCase() : '';
    var match = function (id) { if (!q) return true; var p = PH[id]; return p.aliases.concat([p.name.ko, p.name.en.toLowerCase()]).some(function (a) { return a.toLowerCase().indexOf(q) === 0 || p.name.en.toLowerCase().indexOf(q) >= 0; }); };
    var mIn = mt ? memberIds.filter(match).map(function (id) { var mem = r.members.filter(function (x) { return x.id === id; })[0]; return { id: id, img: IMG[id], name: pn(id, L), sub: L === 'ko' ? PH[id].name.en : PH[id].name.ko, isTemp: mem && mem.type === 'temp', pick: function () { self.pickMention(id); } }; }) : [];
    var mOut = mt ? ORDER.filter(function (id) { return memberIds.indexOf(id) < 0 && match(id); }).map(function (id) { return { id: id, img: IMG[id], name: pn(id, L), sub: PH[id].one[L], pick: function () { self.pickMention(id); } }; }) : [];
    var rep = s.replyTo ? byId[s.replyTo] : null;
    var eng = this.engineOf(r) === 'cloud' ? t.engCloudTag : t.engLocalTag;
    var names = memberIds.slice(0, 3).map(function (id) { return pn(id, L); }).join(', ') + (memberIds.length > 3 ? ' ' + fill(t.more3, { n: memberIds.length - 3 }) : '');
    var flowing = !!(g && live && (live.phase === 'typing' || live.phase === 'streaming'));
    var draftOn = !!s.draft.trim();
    var autoBar = {};
    if (!isDm && live) {
      if (live.quiet) autoBar = { show: true, text: t.autoQuiet, b1: r.set.auto !== 'off' ? t.btnMore : '', a1: function () { self.more(); }, b2: t.btnJournal, a2: function () { self.draftFromRoom(r.id); } };
      else if (g && live.paused) autoBar = { show: true, text: fill(t.autoPausedN, { n: g.autoLeft }), b1: t.btnResume, a1: function () { self.resume(); } };
      else if (g && live.hold) autoBar = { show: true, text: t.autoHold };
      else if (g && g.autoLeft > 0) autoBar = { show: true, live: true, text: fill(t.autoTalking, { n: g.autoLeft }), b1: t.btnPause, a1: function () { self.pause(); } };
    }
    var typing = !!(live && live.phase === 'typing' && live.sp);
    return {
      isDm: isDm, isGroup: !isDm, pid: r.pid || '', img: isDm ? IMG[r.pid] : '', title: r.name,
      sub: isDm ? fill(t.dmSub, { e: eng }) : names + ' · ' + eng,
      faces: memberIds.slice(0, 3).map(function (id) { return { img: IMG[id] }; }),
      menuOpen: !!s.menu, toggleMenu: function () { self.setState({ menu: !s.menu }); },
      openInfo: function () { if (isDm) self.openProfile(r.pid); else self.go('info', { roomId: r.id }); },
      infoLabel: isDm ? t.infoLabelD : t.infoLabelG, infoAria: isDm ? fill(t.profileOf, { n: pn(r.pid, L) }) : t.infoAriaG,
      makeJournal: function () { self.draftFromRoom(r.id); },
      askNote: function () { self.setState({ menu: false, sheet: { type: 'pick', mode: 'note', roomId: r.id } }); },
      exportChat: function () { self.setState({ menu: false }); self.toast(t.exported); },
      showOffline: s.offline, offlineText: r.set.eng === 'cloud' && s.plus ? t.offlineCloud : t.offlineLocal,
      scrollRef: this.scrollRef, items: items,
      typing: typing, typingPid: typing ? live.sp : '', typingImg: typing ? IMG[live.sp] : '', typingText: typing ? fill(t.typing, { n: nm(live.sp, L, 'ga') }) : '',
      empty: !isDm && !hasText, emptyTitle: fill(t.emptyTitle, { n: L === 'ko' ? jo(joinNames(memberIds, L), '과', '와') : joinNames(memberIds, L) }),
      starters: t.starters.map(function (x) { return { label: x[0], pick: function () { self.setState({ draft: x[1] }); self.focusInput(); } }; }),
      showAuto: !!autoBar.show, autoLive: !!autoBar.live, autoText: autoBar.text || '', autoHasBtn: !!autoBar.b1, autoBtn: autoBar.b1 || '', autoAct: autoBar.a1, autoHasBtn2: !!autoBar.b2, autoBtn2: autoBar.b2 || '', autoAct2: autoBar.a2,
      showQuick: !!s.debateRooms[r.id] && !draftOn && !flowing, quick: [t.quickSoft, t.quickChange].map(function (x) { return { label: x, pick: function () { self.send(x); } }; }),
      mentionOpen: !!mt, mHasIn: mIn.length > 0, mIn: mIn, mHasOut: mOut.length > 0, mOut: mOut, mNone: !!mt && !mIn.length && !mOut.length,
      hasReply: !!rep, replyPid: rep ? rep.a : '', replyName: rep ? nameOf(rep.a) : '', replyText: rep ? clip(rep.t, 80) : '', cancelReply: function () { self.setState({ replyTo: null }); },
      submit: function (e) { if (e && e.preventDefault) e.preventDefault(); self.send(); },
      atBtn: function () { self.atBtn(); }, inputRef: this.inputRef, draft: s.draft,
      onDraft: function (e) { self.onDraft(e); },
      onKey: function (e) { if (e.key === 'Escape') self.setState({ mention: null }); },
      ph: isDm ? fill(t.phDm, { n: pn(r.pid, L) }) : t.phGroup,
      canStop: flowing && !draftOn, canSend: !(flowing && !draftOn), sendCls: 'ag-send' + (draftOn ? '' : ' off'), sendDisabled: !draftOn,
      stop: function () { self.stopNow(); }
    };
  }
  vNew(s, t, L) {
    var self = this, nr = s.nr;
    var upd = function (o) { self.setState(function (x) { return { nr: Object.assign({}, x.nr, o) }; }); };
    var lvl = { gentle: 'g', balanced: 'b', rigorous: 'r' }[nr.int];
    var preview;
    if (nr.freq === 'off') {
      preview = [{ pid: 'ni', t: LINES.meaning.ni[0][L === 'ko' ? 0 : 1] }, { pid: 'ca', t: LINES.meaning.ca[0][L === 'ko' ? 0 : 1] }];
    } else {
      preview = [{ pid: 'ni', t: FOLLOW.meaning[0][L][lvl] }, { pid: 'sh', t: FOLLOW.meaning[1][L][lvl] }];
      if (lvl !== 'g' && nr.freq !== 'rare') preview.push({ pid: 'ni', t: FOLLOW.meaning[2][L][lvl] });
    }
    var seg = function (opts, cur, key, disabled) { return opts.map(function (o) { var on = cur === o[0]; return { label: o[1], on: on, cls: on ? 'on' : '', disabled: !!disabled, pick: function () { var p = {}; p[key] = o[0]; upd(p); } }; }); };
    return {
      list: ORDER.map(function (id) {
        var on = nr.picks.indexOf(id) >= 0;
        return { id: id, img: IMG[id], name: pn(id, L), years: PH[id].years[L], one: PH[id].one[L], on: on, checkCls: 'ag-check' + (on ? ' on' : ''), toggle: function () { upd({ picks: on ? nr.picks.filter(function (x) { return x !== id; }) : nr.picks.concat([id]) }); } };
      }),
      hasPicked: nr.picks.length > 0,
      picked: nr.picks.map(function (id) { return { id: id, img: IMG[id], name: pn(id, L), removeAria: fill(t.removeAria, { n: pn(id, L) }), remove: function () { upd({ picks: nr.picks.filter(function (x) { return x !== id; }) }); } }; }),
      countLabel: nr.picks.length ? fill(t.picked, { n: nr.picks.length }) : t.pickedNone, nextDisabled: nr.picks.length === 0, next: function () { self.go('nr2'); },
      faces: nr.picks.slice(0, 4).map(function (id) { return { img: IMG[id] }; }), namesLabel: joinNames(nr.picks, L),
      name: nr.name, onName: function (e) { upd({ name: e.target.value }); },
      nameSugs: t.nameSugs.map(function (x) { return { label: x, pick: function () { upd({ name: x }); } }; }),
      autoOpts: seg(t.autoOpts, nr.auto, 'auto'), autoHelp: t.autoHelp[nr.auto],
      freqOpts: seg(t.freqOpts, nr.freq, 'freq'), freqHelp: t.freqHelp[nr.freq],
      intOpts: seg(t.intOpts, nr.int, 'int', nr.freq === 'off'),
      previewLabel: nr.freq === 'off' ? t.previewOff : t.previewLabel,
      preview: preview.map(function (p) { return { pid: p.pid, img: IMG[p.pid], name: pn(p.pid, L), t: p.t }; }),
      create: function () {
        var x = self.state.nr, id = self.nid('r');
        var name = x.name.trim() || fill(t.defaultRoomName, { n: x.picks.slice(0, 2).map(function (p) { return pn(p, L); }).join('·') });
        var room = { id: id, kind: 'group', name: name, desc: t.newRoomDesc, members: x.picks.map(function (p) { return { id: p, type: 'fixed' }; }), set: { auto: x.auto, freq: x.freq, int: x.int, notify: 'all', lang: self.state.settings.aiLang, eng: 'local' }, pinned: false, unread: 0, archived: false, sort: Date.now(), last: nowHM(),
          msgs: [{ id: id + 'n', a: 'sys', k: 'notice', key: 'noticeG' }, { id: id + 's', a: 'sys', k: 'sys', key: 'roomCreated', ids: x.picks.slice() }] };
        self.setState(function (st) { var rooms = Object.assign({}, st.rooms); rooms[id] = room; return { rooms: rooms, screen: 'room', roomId: id, stack: [{ screen: 'home', tab: 'chats' }], draft: '', nr: { picks: [], name: '', auto: 'contextual', freq: 'rare', int: 'balanced' } }; });
      }
    };
  }
  vInfo(s, t, L) {
    var self = this, r = s.rooms[s.roomId];
    if (!r) return {};
    var seg = function (opts, key, disabled) { return opts.map(function (o) { var on = r.set[key] === o[0]; return { label: o[1], on: on, cls: on ? 'on' : '', disabled: !!disabled, pick: function () { self.setRoom(r.id, key, o[0]); } }; }); };
    return {
      faces: r.members.slice(0, 4).map(function (m) { return { img: IMG[m.id] }; }), name: r.name, desc: r.desc,
      membersLabel: fill(t.membersLabel, { n: r.members.length }),
      members: r.members.map(function (m, k) {
        return { id: m.id, img: IMG[m.id], name: pn(m.id, L), type: m.type === 'temp' ? t.typeTemp : t.typeFixed, liCls: 'ag-li' + (k ? ' sep' : ''), cantRemove: r.members.length <= 1,
          remove: function () { self.updRoom(r.id, function (x) { x.members = x.members.filter(function (y) { return y.id !== m.id; }); x.msgs.push({ id: self.nid('s'), a: 'sys', k: 'sys', key: 'removedSys', pid: m.id }); }); } };
      }),
      addMember: function () { self.setState({ sheet: { type: 'pick', mode: 'member', roomId: r.id } }); },
      autoOpts: seg(t.autoOpts, 'auto'), autoHelp: t.autoHelp[r.set.auto], freqOpts: seg(t.freqOpts, 'freq'), freqHelp: t.freqHelp[r.set.freq], intOpts: seg(t.intOpts, 'int', r.set.freq === 'off'),
      notifOpts: seg(t.notifOpts, 'notify'),
      langOpts: t.langOpts.map(function (o, k) { var on = r.set.lang === o[0]; return { label: o[1], on: on, liCls: 'ag-li' + (k ? ' sep' : ''), ring: on ? 'box-shadow: inset 0 0 0 2px var(--primary)' : '', pick: function () { self.setRoom(r.id, 'lang', o[0]); } }; }),
      engIsLocal: r.set.eng !== 'cloud', engIsCloud: r.set.eng === 'cloud', engLocalCls: r.set.eng !== 'cloud' ? 'on' : '', engCloudCls: r.set.eng === 'cloud' ? 'on' : '',
      engLocal: function () { self.setRoom(r.id, 'eng', 'local'); }, engCloud: function () { self.setRoom(r.id, 'eng', 'cloud'); },
      engHelp: r.set.eng === 'cloud' ? t.engHelpCloud : t.engHelpLocal,
      openMemory: function () { self.go('memory', { memRoom: r.id, memFilter: 'room' }); },
      exportChat: function () { self.toast(t.exported); },
      archiveLabel: r.archived ? t.unarchive : t.archive,
      archive: function () { var a = !r.archived; self.updRoom(r.id, function (x) { x.archived = a; }); self.toast(a ? t.archivedToast : t.unarchivedToast); if (a) self.setState({ screen: 'home', tab: 'chats', stack: [] }); },
      report: function () { self.setState({ sheet: { type: 'report', target: 'room', roomId: r.id, reason: null } }); },
      del: function () { self.setState({ sheet: { type: 'confirm', what: 'room', roomId: r.id } }); }
    };
  }
  vJournal(s, t, L) {
    var self = this, j = s.journals.filter(function (x) { return x.id === s.journalId; })[0];
    if (!j) return {};
    var isUser = j.kind === 'user', shared = j.access.mode !== 'private';
    var n = 0;
    var sents = j.sents.map(function (x) {
      return { t: x.t, cls: 'ag-sent' + (x.phil ? ' ag-phil' : '') + (x.guess ? ' ag-guess' : ''), guess: !!x.guess,
        refs: x.refs.map(function (rf) { n += 1; var k = n; return { n: k, aria: fill(t.sourceTitle + ' {n}', { n: k }), open: function () { self.setState({ sheet: { type: 'source', ref: rf } }); } }; }) };
    });
    var ordered = [];
    var kids = function (pid) { return j.comments.filter(function (c) { return c.parent === pid; }); };
    var walk = function (c, depth) { ordered.push({ c: c, depth: depth }); kids(c.id).forEach(function (k) { walk(k, depth + 1); }); };
    kids(null).forEach(function (c) { walk(c, 0); });
    var writing = s.writing && s.writing.kind === 'journal' && s.writing.id === j.id ? s.writing : null;
    var replyTarget = s.replyC ? j.comments.filter(function (c) { return c.id === s.replyC; })[0] : null;
    var accessLabel = j.access.mode === 'private' ? t.accPrivate : (j.access.mode === 'all' ? t.accAllShort : j.access.ids.map(function (id) { return pn(id, L); }).join(', '));
    var rooms = j.rooms.filter(function (id) { return s.rooms[id]; });
    var edited = !!j.edited, plain = j.sents.map(function (x) { return x.t; }).join(' ');
    var revs = j.revs || [];
    var hasRevs = isUser ? revs.length > 1 : edited;
    var revLabel = !hasRevs ? '' : (isUser ? fill(t.revCount, { n: revs.length - 1, t: fmtTime(revs[revs.length - 1].at, L) }) : fill(t.revCount, { n: 1, t: fmtTime(j.editedAt, L) }));
    var prev = j.from ? s.journals.filter(function (x) { return x.id === j.from; })[0] : null;
    var srcNames = rooms.map(function (id) { return s.rooms[id].name; }).join(' · ');
    var plans = s.plans.filter(function (p) { return p.jid === j.id; });
    return {
      date: j.date + (j.time ? ' · ' + fmtTime(j.time, L) : ''), title: noteTitle(j, t),
      isUser: isUser, isConv: !isUser, kindLabel: isUser ? t.kindUser : t.kindConv, kindCls: 'ag-tag' + (isUser ? ' primary' : ''),
      hasRevs: hasRevs, revLabel: revLabel, openRevs: function () { self.setState({ menu: false, sheet: { type: 'revs', journalId: j.id } }); },
      paras: isUser ? String(j.body || '').split(/\n\s*\n/).filter(function (p) { return p.trim(); }).map(function (p) { return { t: p.trim() }; }) : [],
      editNote: function () { self.setState({ menu: false }); self.openCompose(j); },
      isRegen: !!prev, openPrev: function () { if (prev) self.openJournal(prev.id); },
      accessCls: 'ag-access' + (shared ? ' shared' : ''), isPrivate: !shared, isShared: shared, access: accessLabel,
      openAccess: function () { self.setState({ menu: false, sheet: { type: 'access', journalId: j.id, mode: j.access.mode, ids: j.access.ids.slice(), auto: j.auto || null, notif: j.notif !== false } }); },
      hasSources: rooms.length > 0, sources: !rooms.length ? '' : (j.range ? fill(t.rangeLabel, { r: srcNames, n: j.range.n }) : fill(t.fromRooms, { n: srcNames })),
      hasDraft: !isUser && j.sents.length > 0, isDraft: j.status === 'draft', isReviewed: j.status === 'reviewed', sents: sents,
      showDraftTag: j.status === 'draft', showReviewedTag: j.status === 'reviewed' && !edited, sumEdited: edited,
      showSents: !edited && !s.editingSum, showEdited: edited && !s.editingSum, sumText: j.edited || '',
      editingSum: !!s.editingSum, showSumActions: !s.editingSum, canApprove: j.status === 'draft' && !s.editingSum,
      sumDraft: s.sumDraft, sumSaveDisabled: !s.sumDraft.trim(),
      onSum: function (e) { self.setState({ sumDraft: e.target.value }); },
      editSum: function () { self.setState({ editingSum: true, sumDraft: j.edited || plain, menu: false }); },
      cancelSum: function () { self.setState({ editingSum: false, sumDraft: '' }); },
      saveSum: function () {
        var v = self.state.sumDraft.trim(); if (!v) return;
        self.updJournal(j.id, function (x) { x.edited = v; x.editedAt = nowHM(); x.status = 'reviewed'; });
        self.setState({ editingSum: false, sumDraft: '' });
        self.toast(self.recheckPlans(j.id) ? t.sumSaved + ' · ' + t.planChecking : t.sumSaved);
      },
      approve: function () { self.updJournal(j.id, function (x) { x.status = 'reviewed'; }); self.toast(t.approved); },
      // never overwrites this note or its edit: the same sources become a new note
      regen: function () { self.setState({ menu: false, editingSum: false }); self.regenNote(j.id); },
      hasRoom: rooms.length > 0, openRoom: function () { self.openRoom(rooms[0]); },
      refTitle: t.refTitle, refPh: t.refPh,
      editing: s.editingRefl, refDraft: s.reflDraft, onRef: function (e) { self.setState({ reflDraft: e.target.value }); },
      hasRef: !!j.reflection.t, canCancelRef: !!j.reflection.t || isUser, saveDisabled: !s.reflDraft.trim(),
      saveRef: function () {
        var v = self.state.reflDraft.trim(); if (!v) return;
        var first = !j.reflection.t;
        self.updJournal(j.id, function (x) { x.reflection = { t: v, time: nowHM() }; });
        self.setState({ editingRefl: false });
        self.toast(first && self.makePlans(j) ? t.savedPlan : t.saved);
      },
      cancelRef: function () { self.setState({ editingRefl: false, reflDraft: j.reflection.t }); },
      showRef: !s.editingRefl && !!j.reflection.t, ref: j.reflection.t, refMeta: fill(t.refMeta, { t: fmtTime(j.reflection.time, L) }),
      editRef: function () { self.setState({ editingRefl: true, reflDraft: j.reflection.t }); },
      showAddRef: !s.editingRefl && !j.reflection.t, addRef: function () { self.setState({ editingRefl: true, reflDraft: '' }); },
      commentCount: fill(t.commentN, { n: j.comments.length }), locked: !shared,
      plans: plans.map(function (p) {
        var busy = p.status === 'checking' || p.status === 'posting';
        return { pid: p.pid, img: IMG[p.pid], line: fill(t.planLine, { n: nm(p.pid, L, 'ga'), w: self.planWhen(p, L) }), sub: fill(p.rechecked ? t.planSubRe : t.planSub, { t: fmtTime(p.prepared, L) }),
          idle: !busy, busy: busy, busyText: p.status === 'posting' ? t.planPosting : t.planChecking,
          now: function () { self.deliverPlan(p.id); },
          cancel: function () { self.cancelPlans(j.id, function (x) { return x.id === p.id; }); self.toast(t.planCancelled); },
          why: function () { self.setState({ sheet: { type: 'whyPlan', journalId: j.id, planId: p.id } }); } };
      }),
      comments: ordered.map(function (o) {
        var c = o.c, isMe = c.a === 'me';
        return { cls: 'ag-cm' + (o.depth ? ' reply' : ''), isPhil: !isMe, isMe: isMe, pid: isMe ? 'me' : c.a, img: isMe ? '' : IMG[c.a], name: isMe ? t.you : pn(c.a, L), time: fmtTime(c.time, L), t: c.t, tCls: 'ag-cm-t',
          isAuto: !!c.auto, why: function () { self.setState({ sheet: { type: 'whyPlan', journalId: j.id, commentId: c.id } }); },
          reply: function () { self.setState({ replyC: c.id, cDraft: '' }); self.later(function () { var el = self.replyRef.current; if (el) try { el.focus(); } catch (e) { /* ignore */ } }, 40); },
          dm: function () { self.openDm(c.a, { lkey: 'fromComment', t: c.t }); },
          del: function () { self.updJournal(j.id, function (x) { var gone = {}; gone[c.id] = true; var changed = true; while (changed) { changed = false; x.comments.forEach(function (y) { if (!gone[y.id] && gone[y.parent]) { gone[y.id] = true; changed = true; } }); } x.comments = x.comments.filter(function (y) { return !gone[y.id]; }); }); } };
      }),
      writing: !!writing, writingPid: writing ? writing.pid : '', writingImg: writing ? IMG[writing.pid] : '', writingText: writing ? fill(t.writingComment, { n: nm(writing.pid, L, 'ga') }) : '',
      canAsk: shared && !writing, askComment: function () { self.setState({ sheet: { type: 'pick', mode: 'comment' } }); },
      replying: !!replyTarget, replyLabel: replyTarget ? fill(t.replyTo, { n: replyTarget.a === 'me' ? t.you : pn(replyTarget.a, L) }) : '',
      replyDraft: s.cDraft, onReply: function (e) { self.setState({ cDraft: e.target.value }); }, replyRef: this.replyRef,
      sendReply: function (e) { if (e && e.preventDefault) e.preventDefault(); self.sendCommentReply(); }, cancelReply: function () { self.setState({ replyC: null, cDraft: '' }); },
      sendCls: 'ag-send' + (s.cDraft.trim() ? '' : ' off'), sendDisabled: !s.cDraft.trim(),
      menuOpen: !!s.menu, toggleMenu: function () { self.setState({ menu: !s.menu }); },
      exportEntry: function () { self.setState({ menu: false }); self.toast(t.exported); },
      del: function () { self.setState({ menu: false, sheet: { type: 'confirm', what: 'entry', journalId: j.id } }); }
    };
  }
  vCompose(s, t, L) {
    var self = this, c = s.compose;
    if (!c) return {};
    var j = s.journals.filter(function (x) { return x.id === c.id; })[0];
    var has = !!(c.title.trim() || c.body.trim());
    var dirty = c.title !== c.t0 || c.body !== c.b0 || c.day !== c.d0;
    var access = j ? j.access : { mode: s.settings.defAccess, ids: [] }, shared = access.mode !== 'private';
    var aLabel = access.mode === 'private' ? t.accPrivate : (access.mode === 'all' ? t.accAllShort : access.ids.map(function (id) { return pn(id, L); }).join(', ') || t.accPrivate);
    var planned = s.plans.some(function (p) { return p.jid === c.id; });
    return {
      heading: c.mode === 'edit' ? t.composeEdit : t.composeNew,
      title: c.title, body: c.body, titleRef: this.cpTitleRef,
      onTitle: function (e) { self.cpSet({ title: e.target.value }); }, onBody: function (e) { self.cpSet({ body: e.target.value }); },
      status: c.mode === 'edit' ? (dirty ? t.editDirty : t.editIdle) : (c.saving ? t.autoSaving : (c.savedAt ? fill(t.autoSaved, { t: fmtTime(c.savedAt, L) }) : t.composeIdle)),
      dateLabel: dayStr(c.day, L).date, pickingDate: !!c.pickDate, toggleDate: function () { self.cpSet({ pickDate: !c.pickDate }); },
      days: WEEK.map(function (d, k) {
        var on = c.day === d, future = d > 13;
        return { num: d, dow: t.dows[k], cls: 'ag-day-c' + (on ? ' on' : ''), on: on, future: future, aria: dayStr(d, L).date, pick: function () { if (!future) self.cpSet({ day: d }); } };
      }),
      doneDisabled: !has || (c.mode === 'edit' && !dirty), done: function () { self.cpDone(); }, close: function () { self.cpClose(); },
      isShared: shared, isPrivate: !shared, foot: planned && c.mode === 'edit' ? t.composeFootPlan : fill(t.composeFoot, { a: aLabel })
    };
  }
  vNote(s, t, L) {
    var self = this, n = s.notes.filter(function (x) { return x.id === s.noteId; })[0];
    if (!n) return {};
    var origin = n.origin.room && s.rooms[n.origin.room];
    var vis = n.comments.filter(function (c) { return !c.other || n.allowOthers; });
    var writing = s.writing && s.writing.kind === 'note' && s.writing.id === n.id;
    return {
      pid: n.a, img: IMG[n.a], name: pn(n.a, L), date: n.date, title: n.title, paras: n.paras.map(function (p) { return { t: p }; }),
      origin: origin ? (origin.kind === 'dm' ? fill(t.originDm, { n: nm(origin.pid, L, 'wae') }) : fill(t.originRoom, { n: origin.name })) : '',
      openOrigin: function () { if (origin) self.openRoom(origin.id); },
      hasQuote: !!n.quote, quote: n.quote ? n.quote.t : '', quoteSrc: n.quote ? n.quote.src + ' · ' + t.sourceQuote.split(' · ')[1] : '',
      disclose: fill(t.disclose, { n: pn(n.a, L), n2: nm(n.a, L, 'ga') }),
      profile: function () { self.openProfile(n.a); }, profileAria: fill(t.profileOf, { n: pn(n.a, L) }),
      commentCount: fill(t.commentN, { n: vis.length }),
      comments: vis.map(function (c) {
        var isMe = c.a === 'me';
        return { cls: 'ag-cm' + (c.parent ? ' reply' : ''), isPhil: !isMe, isMe: isMe, isAuthor: c.a === n.a, pid: isMe ? 'me' : c.a, img: isMe ? '' : IMG[c.a], name: isMe ? t.you : pn(c.a, L), time: fmtTime(c.time, L), t: c.t, tCls: 'ag-cm-t',
          dm: function () { self.openDm(c.a, { lkey: 'fromNote', t: c.t }); },
          del: function () { self.updNote(n.id, function (x) { x.comments = x.comments.filter(function (y) { return y.id !== c.id && y.parent !== c.id; }); }); } };
      }),
      writing: !!writing, writingText: fill(t.writingReply, { n: nm(n.a, L, 'ga') }),
      allowOthers: !!n.allowOthers, othersCls: 'ag-sw' + (n.allowOthers ? ' on' : ''), toggleOthers: function () { self.updNote(n.id, function (x) { x.allowOthers = !x.allowOthers; }); },
      draft: s.nDraft, onDraft: function (e) { self.setState({ nDraft: e.target.value }); }, inputRef: this.noteRef,
      ph: fill(t.notePh, { n: pn(n.a, L) }), send: function (e) { if (e && e.preventDefault) e.preventDefault(); self.sendNoteComment(); },
      sendCls: 'ag-send' + (s.nDraft.trim() ? '' : ' off'), sendDisabled: !s.nDraft.trim(),
      menuOpen: !!s.menu, toggleMenu: function () { self.setState({ menu: !s.menu }); },
      dm: function () { self.openDm(n.a, { lkey: 'fromNote', t: n.title }); },
      toRoom: function () { if (origin && origin.kind === 'group') { self.openRoom(origin.id); self.later(function () { self.setState({ draft: (L === 'ko' ? '‘' + n.title + '’ 노트 이야기를 해 보고 싶어. ' : 'I’d like to talk about the note “' + n.title + '.” ') }); }, 30); } else self.setState({ menu: false }); },
      report: function () { self.setState({ menu: false, sheet: { type: 'report', target: 'note', noteId: n.id, reason: null } }); },
      del: function () { self.setState({ menu: false, sheet: { type: 'confirm', what: 'note', noteId: n.id } }); }
    };
  }
  vProfile(s, t, L) {
    var self = this, pid = s.philId, p = PH[pid];
    if (!p) return {};
    var st = s.settings;
    var dm = s.rooms['dm-' + pid];
    var shared = Object.keys(s.rooms).map(function (k) { return s.rooms[k]; }).filter(function (r) { return r.kind === 'group' && r.members.some(function (m) { return m.id === pid; }); });
    var js = s.journals.filter(function (j) { return self.canRead(j, pid); });
    var reads = [];
    if (dm) reads.push({ t: fill(t.readDm, { n: nm(pid, L, 'wae') }), s: t.readDmSub });
    reads.push({ t: t.readRooms, s: shared.length ? fill(t.readRoomsSub, { n: shared.map(function (r) { return r.name; }).join(', ') }) : t.readRoomsNone });
    reads.push({ t: js.length ? fill(t.readJournal, { n: js.length }) : t.readJournalNone, s: t.readJournalSub });
    var on = st.init && st.philInit[pid];
    var mems = s.mems.filter(function (m) { return m.who.indexOf(pid) >= 0; });
    return {
      id: pid, img: IMG[pid], name: pn(pid, L), alt: L === 'ko' ? (p.full ? p.full.en : p.name.en) : (p.full ? p.full.ko : p.name.ko), years: p.years[L], one: p.one[L],
      portraitAlt: fill(t.profileOf, { n: pn(pid, L) }),
      chat: function () { self.openDm(pid); }, invite: function () { self.setState({ sheet: { type: 'pick', mode: 'room', pid: pid } }); },
      notes: function () { self.setState({ screen: 'home', tab: 'records', recSeg: 'notes', noteFilter: pid, stack: [] }); },
      ideas: p.ideas[L].map(function (x) { return { t: x }; }), style: p.style[L],
      reads: reads.map(function (x, k) { return { t: x.t, s: x.s, liCls: 'ag-li' + (k ? ' sep' : '') }; }),
      initOn: !!on, initCls: 'ag-sw' + (on ? ' on' : ''), initTitle: fill(t.initTitle, { n: pn(pid, L) }),
      initSub: !st.init ? t.initGlobalOff : (st.philInit[pid] ? t.initOnSub : t.initOffSub),
      toggleInit: function () { var pi = Object.assign({}, st.philInit); pi[pid] = !pi[pid]; self.setState({ settings: Object.assign({}, st, { philInit: pi, init: pi[pid] ? true : st.init }) }); },
      mems: mems.map(function (m, k) {
        return { liCls: 'ag-li' + (k ? ' sep' : ''), t: m.t, src: m.src, kind: m.kind === 'guess' ? t.kindGuess : (m.kind === 'journal' ? t.kindJournal : t.kindSaid), tagCls: 'ag-tag' + (m.kind === 'guess' ? ' lamp' : (m.kind === 'said' ? ' primary' : '')), delAria: t.delete,
          del: function () { self.setState(function (x) { return { mems: x.mems.filter(function (y) { return y.id !== m.id; }) }; }); self.toast(t.memDeleted); } };
      }),
      noMems: mems.length === 0,
      sources: p.sources.map(function (x, k) { return { t: x[L][0], s: x[L][1], liCls: 'ag-li' + (k ? ' sep' : '') }; }),
      hideLabel: fill(t.hideLabel, { n: nm(pid, L, 'eul') }), hide: function () { self.toast(t.hidden); }
    };
  }
  vMemory(s, t, L) {
    var self = this;
    var filters = t.memFilters.filter(function (f) { return f[0] !== 'room' || s.memRoom; });
    var items = s.mems.filter(function (m) {
      if (s.memFilter === 'said') return m.kind !== 'guess';
      if (s.memFilter === 'guess') return m.kind === 'guess';
      if (s.memFilter === 'room') return m.room === s.memRoom;
      return true;
    });
    return {
      filters: filters.map(function (f) { var on = s.memFilter === f[0]; return { label: f[1], on: on, cls: 'ag-chip' + (on ? ' on' : ''), pick: function () { self.setState({ memFilter: f[0] }); } }; }),
      items: items.map(function (m) {
        var isGuess = m.kind === 'guess';
        return {
          kind: isGuess ? t.kindGuess : (m.kind === 'journal' ? t.kindJournal : t.kindSaid), tagCls: 'ag-tag' + (isGuess ? ' lamp' : (m.kind === 'said' ? ' primary' : '')),
          src: m.src, t: m.t, scope: fill(t.scopeLabel, { s: m.scope }), paused: !isGuess && !m.active, isGuess: isGuess, isSaid: !isGuess,
          toggleLabel: m.active ? t.stopUse : t.useAgain,
          toggle: function () { self.setState(function (x) { return { mems: x.mems.map(function (y) { return y.id === m.id ? Object.assign({}, y, { active: !y.active }) : y; }) }; }); },
          confirm: function () { self.setState(function (x) { return { mems: x.mems.map(function (y) { return y.id === m.id ? Object.assign({}, y, { kind: 'said', active: true }) : y; }) }; }); self.toast(t.confirmed); },
          reject: function () { self.setState(function (x) { return { mems: x.mems.filter(function (y) { return y.id !== m.id; }) }; }); self.toast(t.rejected); },
          del: function () { self.setState(function (x) { return { mems: x.mems.filter(function (y) { return y.id !== m.id; }) }; }); self.toast(t.memDeleted); }
        };
      }),
      empty: items.length === 0
    };
  }
  vModels(s, t, L) {
    var self = this, md = s.models;
    var lightState = md.light;
    return {
      list: [
        { name: t.modelBase, sub: t.modelBaseSub, desc: t.mBaseDesc, tileCls: 'ag-tile', inUse: md.active === 'base', canUse: md.active !== 'base', use: function () { self.setState({ models: Object.assign({}, md, { active: 'base' }) }); self.toast(t.modelSwitched); } },
        { name: t.mLight, sub: t.mLightSub, desc: t.mLightDesc, tileCls: 'ag-tile', inUse: md.active === 'light', downloading: lightState === 'downloading', w: md.lightP + '%', dlLabel: t.dlLabel + ' ' + md.lightP + '%',
          canGet: lightState === 'none', get: function () { self.setState({ models: Object.assign({}, md, { light: 'downloading', lightP: 0 }) }); self.later(function () { self.dlTick('model'); }, 120); },
          canUse: lightState === 'installed' && md.active !== 'light', use: function () { self.setState({ models: Object.assign({}, self.state.models, { active: 'light' }) }); self.toast(t.modelSwitched); } },
        { name: t.mBig, sub: t.mBigSub, desc: t.mBigDesc, tileCls: 'ag-tile muted', incompatible: true }
      ]
    };
  }
  vPlus(s, t) {
    var self = this;
    return {
      free: t.plusFree.map(function (x) { return { t: x }; }), plus: t.plusPlus.map(function (x) { return { t: x }; }), notes: t.plusNotes.map(function (x) { return { t: x }; }),
      notPlus: !s.plus, isPlus: s.plus,
      start: function () { self.setState({ sheet: { type: 'cloud', from: 'plus' } }); },
      stop: function () { self.setState(function (x) { var rooms = {}; Object.keys(x.rooms).forEach(function (k) { rooms[k] = Object.assign({}, x.rooms[k], { set: Object.assign({}, x.rooms[k].set, { eng: 'local' }) }); }); return { plus: false, rooms: rooms }; }); self.toast(t.plusOffToast); }
    };
  }
  vOb(s, t) {
    var self = this, ob = s.ob;
    var upd = function (o) { self.setState(function (x) { return { ob: Object.assign({}, x.ob, o) }; }); };
    var active = ob.dlState === 'downloading' || ob.dlState === 'paused' || ob.dlState === 'verifying';
    return {
      canBack: ob.step > 1, back: function () { upd({ step: ob.step - 1 }); }, stepLabel: fill(t.stepN, { n: ob.step }),
      s1: ob.step === 1, s2: ob.step === 2, s3: ob.step === 3,
      isKo: s.uiLang === 'ko', isEn: s.uiLang === 'en', koCls: s.uiLang === 'ko' ? 'on' : '', enCls: s.uiLang === 'en' ? 'on' : '',
      setKo: function () { if (s.uiLang !== 'ko') self.reseedLang('ko'); }, setEn: function () { if (s.uiLang !== 'en') self.reseedLang('en'); },
      next: function () { upd({ step: Math.min(3, ob.step + 1) }); },
      dlIdle: ob.dlState === 'idle', dlActive: active, dlDone: ob.dlState === 'done',
      dlLabel: ob.dlState === 'verifying' ? t.verifying : (ob.dlState === 'paused' ? t.pausedDl : t.dlLabel), dlPct: ob.dl + '%', dlWidth: ob.dl + '%',
      verifying: ob.dlState === 'verifying', pauseLabel: ob.dlState === 'paused' ? t.resumeDl : t.pauseDl,
      togglePause: function () {
        if (ob.dlState === 'paused') { upd({ dlState: 'downloading' }); self.later(function () { self.dlTick('ob'); }, 100); }
        else if (ob.dlState === 'downloading') upd({ dlState: 'paused' });
      },
      startDl: function () { upd({ dlState: 'downloading', dl: 0 }); self.later(function () { self.dlTick('ob'); }, 120); },
      nextDisabled: ob.dlState !== 'done', wifi: ob.wifi, wifiCls: 'ag-sw' + (ob.wifi ? ' on' : ''), toggleWifi: function () { upd({ wifi: !ob.wifi }); },
      notif: ob.notif, notifCls: 'ag-sw' + (ob.notif ? ' on' : ''), toggleNotif: function () { upd({ notif: !ob.notif }); },
      diag: ob.diag, diagCls: 'ag-sw' + (ob.diag ? ' on' : ''), toggleDiag: function () { upd({ diag: !ob.diag }); },
      finish: function () { self.setState(function (x) { return { screen: 'home', tab: 'chats', stack: [], settings: Object.assign({}, x.settings, { init: x.ob.notif, diag: x.ob.diag }) }; }); self.toast(t.obDoneToast); }
    };
  }
  vSheet(s, t, L) {
    var self = this, sh = s.sheet;
    if (!sh) return { open: false };
    var close = function () { if (sh.type === 'invite') self.cancelInvite(); else self.setState({ sheet: null }); };
    var o = { open: true, close: close, label: '' };
    var plist = function (ids, pick, sub) { return ids.map(function (id) { return { id: id, img: IMG[id], name: pn(id, L), sub: sub ? sub(id) : PH[id].one[L], disabled: false, pick: function () { pick(id); } }; }); };
    if (sh.type === 'newChat') {
      o.isNewChat = true; o.label = t.newChat;
      o.newGroup = function () { self.setState({ sheet: null }); self.go('nr1', { nr: { picks: [], name: '', auto: 'contextual', freq: 'rare', int: 'balanced' } }); };
      o.phils = plist(ORDER, function (id) { self.openDm(id); });
    } else if (sh.type === 'invite') {
      o.isInvite = true; o.pid = sh.pid; o.img = IMG[sh.pid];
      o.inviteTitle = L === 'ko' ? jo(pn(sh.pid, L), '은', '는') + ' 이 방에 없어요' : pn(sh.pid, L) + ' isn’t in this room';
      o.label = o.inviteTitle;
      o.temp = function () { self.invite('temp'); }; o.fixed = function () { self.invite('fixed'); };
    } else if (sh.type === 'msg') {
      var room = s.rooms[sh.roomId], m = room && room.msgs.filter(function (x) { return x.id === sh.msgId; })[0];
      if (!m) return { open: false };
      o.isMsg = true; o.label = t.more; o.msgPid = m.a === 'me' ? 'me' : m.a; o.msgWho = m.a === 'me' ? t.you : pn(m.a, L); o.msgText = m.t;
      o.actions = this.msgActions(room, m);
    } else if (sh.type === 'report') {
      o.isReport = true; o.label = t.reportTitle;
      o.reasons = t.reasons.map(function (r, k) { var on = sh.reason === k; return { label: r, on: on, cls: 'ag-opt' + (on ? ' on' : ''), pick: function () { self.setState({ sheet: Object.assign({}, sh, { reason: k }) }); } }; });
      o.reportDisabled = sh.reason == null;
      o.submitReport = function () { self.setState(function (x) { return { sheet: null, reports: x.reports.concat([{ reason: sh.reason, at: nowHM() }]) }; }); self.toast(t.reportSent); };
    } else if (sh.type === 'access') {
      var j = s.journals.filter(function (x) { return x.id === sh.journalId; })[0];
      o.isAccess = true; o.label = t.accessTitle; o.entryTitle = j ? noteTitle(j, t) : '';
      var setSh = function (p) { self.setState({ sheet: Object.assign({}, sh, p) }); };
      o.modes = [['private', t.accPrivate, t.accPrivateSub], ['selected', t.accSelected, t.accSelectedSub], ['all', t.accAll, t.accAllSub]].map(function (m) { var on = sh.mode === m[0]; return { label: m[1], sub: m[2], on: on, cls: 'ag-opt' + (on ? ' on' : ''), pick: function () { setSh({ mode: m[0] }); } }; });
      o.showPick = sh.mode === 'selected';
      o.picks = ORDER.map(function (id) { var on = sh.ids.indexOf(id) >= 0; return { id: id, img: IMG[id], name: pn(id, L), on: on, cls: 'ag-chip' + (on ? ' on' : ''), toggle: function () { setSh({ ids: on ? sh.ids.filter(function (x) { return x !== id; }) : sh.ids.concat([id]) }); } }; });
      o.accessDisabled = sh.mode === 'selected' && sh.ids.length === 0;
      // automatic comments and notifications are set per note (11.5, NC-007)
      var def = s.settings.autoC, eff = sh.auto || def;
      o.autoEnabled = sh.mode !== 'private'; o.autoDisabled = !o.autoEnabled;
      o.autoOpts = t.autoCOpts.map(function (m) { var on = eff === m[0]; return { label: m[1], on: on, cls: on ? 'on' : '', pick: function () { setSh({ auto: m[0] === def ? null : m[0] }); } }; });
      o.autoHelp = (t.autoCOpts.filter(function (m) { return m[0] === eff; })[0] || t.autoCOpts[1])[2];
      o.autoSrc = sh.auto ? t.autoCOwn : fill(t.autoCInherit, { m: this.autoLabel(def) }); o.hasReset = !!sh.auto; o.resetAuto = function () { setSh({ auto: null }); };
      var np = j ? s.plans.filter(function (p) { return p.jid === j.id; }).length : 0;
      o.hasPlans = np > 0; o.planNote = fill(t.planInSheet, { n: np });
      o.notifOn = sh.notif !== false; o.notifCls = 'ag-sw' + (o.notifOn ? ' on' : ''); o.toggleNotif = function () { setSh({ notif: !o.notifOn }); };
      o.saveAccess = function () { self.saveAccess(sh); };
    } else if (sh.type === 'autoSet') {
      o.isAutoSet = true; o.label = t.autoCTitle;
      o.autoModes = t.autoCOpts.map(function (m) { var on = s.settings.autoC === m[0]; return { label: m[1], sub: m[2], on: on, cls: 'ag-opt' + (on ? ' on' : ''), pick: function () { self.setAutoDefault(m[0]); } }; });
    } else if (sh.type === 'whyPlan') {
      // INIT-006: where a scheduled or automatic comment came from, and what is checked before it appears
      var jw = s.journals.filter(function (x) { return x.id === sh.journalId; })[0];
      var pw = sh.planId ? s.plans.filter(function (x) { return x.id === sh.planId; })[0] : null;
      var cw = jw && sh.commentId ? jw.comments.filter(function (x) { return x.id === sh.commentId; })[0] : null;
      if (!jw || (!pw && !cw)) return { open: false };
      var wpid = pw ? pw.pid : cw.a;
      o.isWhyPlan = true; o.label = pw ? t.whyPlanT : t.whyAutoT; o.wpTitle = o.label; o.wpPid = wpid; o.wpImg = IMG[wpid]; o.wpName = pn(wpid, L);
      o.wpText = pw ? fill(t.whyPlanX, { n: pn(wpid, L), m: this.autoLabel(this.autoModeOf(jw)), t: fmtTime(pw.prepared, L) }) : fill(t.whyAutoX, { n: pn(wpid, L), p: fmtTime(cw.prepared || cw.time, L), t: fmtTime(cw.time, L) });
      o.wpChecksT = pw ? t.checksT : t.checksDone; o.wpChecks = t.checks.map(function (x) { return { t: x }; });
      o.wpFoot = fill(t.whyPlanFoot, { q: ['22:00–08:00', '23:00–07:00', t.quietOff][s.settings.quiet] });
      o.canAutoOff = this.autoModeOf(jw) !== 'off';
      o.autoOff = function () { self.updJournal(jw.id, function (x) { x.auto = 'off'; }); self.cancelPlans(jw.id); self.setState({ sheet: null }); self.toast(t.autoOffDone); };
    } else if (sh.type === 'revs') {
      // NOTE-011: every edit is a version of the same note
      var jr = s.journals.filter(function (x) { return x.id === sh.journalId; })[0];
      if (!jr) return { open: false };
      o.isRevs = true; o.label = t.revs;
      var rows = [];
      if (jr.kind === 'user') {
        var rv = jr.revs || [];
        rv.forEach(function (r, k) { rows.unshift({ label: k === rv.length - 1 ? t.revNow : (k === 0 ? t.revFirst : fill(t.revMid, { n: k + 1 })), time: fmtTime(r.at, L), title: r.title || '', text: clip(r.body, 140), isNow: k === rv.length - 1, cls: 'ag-card' + (k === rv.length - 1 ? '' : ' sunk') }); });
      } else {
        rows.push({ label: t.revAi, time: fmtTime(jr.time, L), title: '', text: clip(jr.sents.map(function (x) { return x.t; }).join(' '), 140), isNow: !jr.edited, cls: 'ag-card' + (jr.edited ? ' sunk' : '') });
        if (jr.edited) rows.unshift({ label: t.revMine, time: fmtTime(jr.editedAt, L), title: '', text: clip(jr.edited, 140), isNow: true, cls: 'ag-card' });
      }
      rows.forEach(function (r) { r.hasTitle = !!r.title; });
      o.revRows = rows;
    } else if (sh.type === 'why') {
      var dm = s.rooms[sh.roomId], pid = dm ? dm.pid : 'ca', st = s.settings, on = st.init && st.philInit[pid];
      var q = ['22:00–08:00', '23:00–07:00', t.quietOff][st.quiet];
      var j12 = s.journals.filter(function (x) { return x.id === 'j12'; })[0];
      o.isWhy = true; o.label = t.whyTitle; o.whyText = t.whyText; o.whySrcLabel = t.whySrcLabel; o.whySrc = j12 ? j12.reflection.t : '';
      o.initOn = !!on; o.initCls = 'ag-sw' + (on ? ' on' : ''); o.initLabel = fill(t.initLabel, { n: pn(pid, L) }); o.initSub = fill(t.initSub, { m: st.max, q: q });
      o.toggleInit = function () { var pi = Object.assign({}, st.philInit); pi[pid] = !pi[pid]; self.setState({ settings: Object.assign({}, st, { philInit: pi }) }); };
      o.openSettings = function () { self.setState({ sheet: null, screen: 'home', tab: 'settings', stack: [] }); };
    } else if (sh.type === 'cloud') {
      var c = s.consent, tog = function (k) { var n = Object.assign({}, c); n[k] = !n[k]; self.setState({ consent: n }); };
      o.isCloud = true; o.label = t.cloudTitle;
      o.cJournal = c.journal; o.cJournalCls = 'ag-check' + (c.journal ? ' on' : ''); o.toggleCJ = function () { tog('journal'); };
      o.cMemory = c.memory; o.cMemoryCls = 'ag-check' + (c.memory ? ' on' : ''); o.toggleCM = function () { tog('memory'); };
      o.agreeCloud = function () { self.agreeCloud(); };
    } else if (sh.type === 'source') {
      var rm = s.rooms[sh.ref[0]], msg = rm && rm.msgs.filter(function (x) { return x.id === sh.ref[1]; })[0];
      o.isSource = true; o.label = t.sourceTitle; o.srcRoom = rm ? rm.name : '';
      var list = [];
      if (msg) { if (msg.reply) { var rp = rm.msgs.filter(function (x) { return x.id === msg.reply; })[0]; if (rp) list.push(rp); } list.push(msg); }
      o.srcMsgs = list.map(function (x) { return { pid: x.a === 'me' ? 'me' : x.a, name: x.a === 'me' ? t.you : pn(x.a, L), isPhil: x.a !== 'me', time: fmtTime(x.time, L), t: x.t }; });
      o.goRoom = function () { if (rm) self.openRoom(rm.id); };
    } else if (sh.type === 'pick') {
      o.isPick = true;
      var ids = [], pick = function () {}, sub = null;
      if (sh.mode === 'member') {
        var r = s.rooms[sh.roomId], mem = r.members.map(function (m) { return m.id; });
        ids = ORDER.filter(function (id) { return mem.indexOf(id) < 0; });
        o.pickTitle = t.pickMember; o.pickSub = t.pickMemberSub; o.pickEmptyText = t.pickMemberEmpty;
        pick = function (id) { self.updRoom(r.id, function (x) { x.members.push({ id: id, type: 'fixed' }); x.msgs.push({ id: self.nid('s'), a: 'sys', k: 'sys', key: 'joinedFixed', pid: id }); }); self.setState({ sheet: null }); };
      } else if (sh.mode === 'comment') {
        var jj = s.journals.filter(function (x) { return x.id === s.journalId; })[0];
        ids = jj ? ORDER.filter(function (id) { return self.canRead(jj, id); }) : [];
        o.pickTitle = t.pickComment; o.pickSub = t.pickCommentSub; o.pickEmptyText = t.pickCommentEmpty;
        pick = function (id) { self.requestComment(id); };
      } else if (sh.mode === 'note') {
        var rr = sh.roomId ? s.rooms[sh.roomId] : null;
        ids = rr ? rr.members.map(function (m) { return m.id; }) : ORDER.slice();
        o.pickTitle = t.pickNote; o.pickSub = rr ? fill(t.pickNoteSub, { n: rr.name }) : t.pickNoteAll;
        pick = function (id) { self.requestNote(id, sh.roomId); };
      } else if (sh.mode === 'room') {
        var groups = Object.keys(s.rooms).map(function (k) { return s.rooms[k]; }).filter(function (x) { return x.kind === 'group' && !x.archived && !x.members.some(function (m) { return m.id === sh.pid; }); });
        o.pickTitle = t.pickRoom; o.pickSub = fill(t.pickRoomSub, { n: nm(sh.pid, L, 'ga') }); o.pickEmptyText = t.pickRoomEmpty;
        o.hasPickSub = true;
        o.pickList = groups.map(function (g) { return { id: '', disabled: false, img: IMG[g.members[0].id], name: g.name, sub: g.members.map(function (m) { return pn(m.id, L); }).join(', '), pick: function () { self.updRoom(g.id, function (x) { x.members.push({ id: sh.pid, type: 'fixed' }); x.msgs.push({ id: self.nid('s'), a: 'sys', k: 'sys', key: 'joinedFixed', pid: sh.pid }); }); self.setState({ sheet: null }); self.openRoom(g.id); } }; });
        o.pickEmpty = groups.length === 0; o.label = o.pickTitle;
        return o;
      }
      o.hasPickSub = !!o.pickSub; o.label = o.pickTitle;
      o.pickList = plist(ids, pick);
      o.pickEmpty = ids.length === 0;
    } else if (sh.type === 'noteSet') {
      o.isNoteSet = true; o.label = t.noteAuto;
      o.noteModes = t.noteModes.map(function (m) { var on = s.settings.noteAuto === m[0]; return { label: m[1], sub: m[2], on: on, cls: 'ag-opt' + (on ? ' on' : ''), pick: function () { self.setState({ settings: Object.assign({}, s.settings, { noteAuto: m[0] }) }); } }; });
    } else if (sh.type === 'confirm') {
      o.isConfirm = true; o.cOkCls = 'ag-btn danger'; o.cNoLabel = t.cancel;
      if (sh.what === 'discard') { o.cTitle = t.discardT; o.cText = t.discardX; o.cOkLabel = t.discardOk; o.cNoLabel = t.keepEditing; o.cOk = function () { self.setState({ sheet: null }); self.cpLeave(); }; }
      else if (sh.what === 'all') { o.cTitle = t.delAllT; o.cText = t.delAllX; o.cOkLabel = t.delAllOk; o.cOk = function () { self.setState({ sheet: null }); self.toast(t.delAllDone); }; }
      else if (sh.what === 'room') { o.cTitle = t.delRoomT; o.cText = t.delRoomX; o.cOkLabel = t.delOk; o.cOk = function () { if (self.g && self.g.roomId === sh.roomId) self.g = null; self.setState(function (x) { var rooms = Object.assign({}, x.rooms); delete rooms[sh.roomId]; return { rooms: rooms, sheet: null, screen: 'home', tab: 'chats', stack: [], live: null }; }); self.toast(t.roomDeleted); }; }
      else if (sh.what === 'entry') { o.cTitle = t.delEntryT; o.cText = t.delEntryX; o.cOkLabel = t.delOk; o.cOk = function () { self.cancelPlans(sh.journalId); self.setState(function (x) { return { journals: x.journals.filter(function (y) { return y.id !== sh.journalId; }), sheet: null, screen: 'home', tab: 'records', recSeg: 'journal', stack: [] }; }); self.toast(t.entryDeleted); }; }
      else if (sh.what === 'note') { o.cTitle = t.delNoteT; o.cText = t.delNoteX; o.cOkLabel = t.delOk; o.cOk = function () { self.setState(function (x) { return { notes: x.notes.filter(function (y) { return y.id !== sh.noteId; }), sheet: null, screen: 'home', tab: 'records', recSeg: 'notes', stack: [] }; }); self.toast(t.noteDeleted); }; }
      o.label = o.cTitle;
    } else if (sh.type === 'info') {
      o.isInfo = true;
      if (sh.what === 'sources') { o.iTitle = t.aboutSources; o.iRows = t.sourcesRows.map(function (r) { return { t: r[0], s: r[1] }; }); }
      else { o.iTitle = t.reportsTitle; o.iRows = s.reports.length ? s.reports.map(function (r) { return { t: t.reasons[r.reason], s: fmtTime(r.at, L) }; }) : [{ t: t.noReports, s: '' }]; }
      o.label = o.iTitle;
    } else if (sh.type === 'search') {
      o.isSearch = true; o.label = t.searchTitle; o.q = s.search; o.searchRef = this.searchRef;
      o.onQ = function (e) { self.setState({ search: e.target.value }); };
      var q2 = s.search.trim().toLowerCase(), res = [];
      if (q2) {
        Object.keys(s.rooms).forEach(function (k) {
          var r = s.rooms[k];
          var hit = r.msgs.filter(function (m) { return m.k === 'text' && m.t.toLowerCase().indexOf(q2) >= 0; }).slice(-1)[0];
          if (r.name.toLowerCase().indexOf(q2) >= 0 || hit) res.push({ kind: t.kindRoom, title: r.name, sub: hit ? hit.t : r.desc, open: function () { self.setState({ sheet: null }); self.openRoom(r.id); } });
        });
        s.journals.forEach(function (j) {
          var hay = (noteTitle(j, t) + ' ' + (j.body || '') + ' ' + j.sents.map(function (x) { return x.t; }).join(' ') + ' ' + (j.edited || '') + ' ' + j.reflection.t).toLowerCase();
          if (hay.indexOf(q2) >= 0) res.push({ kind: j.kind === 'user' ? t.kindUser : t.kindConv, title: noteTitle(j, t), sub: j.dshort + (j.time ? ' · ' + fmtTime(j.time, L) : ''), open: function () { self.setState({ sheet: null }); self.openJournal(j.id); } });
        });
        s.notes.forEach(function (n) {
          var hay = (n.title + ' ' + n.paras.join(' ')).toLowerCase();
          if (hay.indexOf(q2) >= 0) res.push({ kind: t.kindNote, title: n.title, sub: pn(n.a, L), open: function () { self.setState({ sheet: null }); self.openNote(n.id); } });
        });
      }
      o.results = res.slice(0, 8); o.noResults = !!q2 && res.length === 0;
    }
    return o;
  }

  renderVals() {
    var s = this.state, L = s.uiLang, t = STR[L], self = this;
    var theme = s.themeMode === 'system' ? (s.sysDark ? 'dark' : 'light') : s.themeMode;
    var scr = s.screen;
    var is = { ob: scr === 'ob', home: scr === 'home', room: scr === 'room', nr1: scr === 'nr1', nr2: scr === 'nr2', info: scr === 'info', journal: scr === 'journal', compose: scr === 'compose', note: scr === 'note', profile: scr === 'profile', memory: scr === 'memory', models: scr === 'models', plus: scr === 'plus' };
    var tab = { chats: s.tab === 'chats', records: s.tab === 'records', people: s.tab === 'people', settings: s.tab === 'settings' };
    var anyUnread = Object.keys(s.rooms).some(function (k) { return s.rooms[k].unread > 0; });
    var setTab = function (k) { return function () { self.setState({ tab: k, sheet: null }); }; };
    var nav = {
      chatsCls: tab.chats ? 'on' : '', recCls: tab.records ? 'on' : '', peopleCls: tab.people ? 'on' : '', setCls: tab.settings ? 'on' : '',
      chatsCur: tab.chats ? 'page' : 'false', recCur: tab.records ? 'page' : 'false', peopleCur: tab.people ? 'page' : 'false', setCur: tab.settings ? 'page' : 'false',
      chats: setTab('chats'), rec: setTab('records'), people: setTab('people'), set: setTab('settings'),
      chatsDot: anyUnread && !tab.chats, recDot: !!s.newNote && !tab.records
    };
    var toastBottom = scr === 'room' ? '140px' : (scr === 'home' ? '96px' : (scr === 'journal' || scr === 'note' ? '88px' : (scr === 'compose' ? '76px' : '24px')));
    return {
      theme: theme, lc: L, t: t, is: is, tab: tab, nav: nav, offline: s.offline,
      back: function () { self.back(); },
      hm: is.home && tab.chats ? this.vHome(s, t, L) : { items: [], search: function () { self.openSearch(); } },
      rc: is.home && tab.records ? this.vRecords(s, t, L) : {},
      pp: is.home && tab.people ? this.vPeople(s, t, L) : { list: [] },
      st: is.home && tab.settings ? this.vSettings(s, t, L) : {},
      rm: is.room ? this.vRoom(s, t, L) : {},
      nr: is.nr1 || is.nr2 ? this.vNew(s, t, L) : {},
      ri: is.info ? this.vInfo(s, t, L) : {},
      jd: is.journal ? this.vJournal(s, t, L) : {},
      cp: is.compose ? this.vCompose(s, t, L) : {},
      nd: is.note ? this.vNote(s, t, L) : {},
      pf: is.profile ? this.vProfile(s, t, L) : {},
      mm: is.memory ? this.vMemory(s, t, L) : {},
      md: is.models ? this.vModels(s, t, L) : {},
      pl: is.plus ? this.vPlus(s, t, L) : {},
      ob: is.ob ? this.vOb(s, t, L) : {},
      sx: this.vSheet(s, t, L),
      tt: s.toast ? { on: true, text: s.toast.text, hasAct: !!s.toast.act, act: s.toast.act, actLabel: s.toast.actLabel, bottom: toastBottom } : { on: false }
    };
  }
  };
  Object.getOwnPropertyNames(Src.prototype).forEach(function (k) {
    if (k !== 'constructor') Object.defineProperty(Target.prototype, k, Object.getOwnPropertyDescriptor(Src.prototype, k));
  });
  return Target;
}
