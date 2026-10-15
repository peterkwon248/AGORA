// Drives the prototype logic through many states and dumps view-models for the template checker.
const fs = require('fs');
const [logicPath, outPath] = process.argv.slice(2);
const src = fs.readFileSync(logicPath, 'utf8');

// fake clock
let now = 0;
let tasks = [];
let tid = 1;
global.setTimeout = (fn, ms) => { const id = tid++; tasks.push({ id, t: now + (ms || 0), fn }); return id; };
global.clearTimeout = (id) => { tasks = tasks.filter((x) => x.id !== id); };
global.setInterval = (fn, ms) => { const id = tid++; const rec = { id, t: now + ms, fn, every: ms }; tasks.push(rec); return id; };
global.clearInterval = (id) => { tasks = tasks.filter((x) => x.id !== id); };
function run(ms) {
  const end = now + ms;
  for (let guard = 0; guard < 200000; guard++) {
    tasks.sort((a, b) => a.t - b.t);
    const next = tasks[0];
    if (!next || next.t > end) break;
    now = next.t;
    if (next.every) next.t += next.every; else tasks.shift();
    next.fn();
  }
  now = end;
}
global.window = { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };
global.FileReader = class {
  readAsDataURL() { this.result = 'data:image/png;base64,AAAA'; this.onload && this.onload(); }
  readAsText() { this.result = '# 바꾼 자료\n\n## 하는 일\n회사에서 일한다.\n\n## 새 대목\n요즘 피곤하다. 잠이 부족하다.'; this.onload && this.onload(); }
};

class DCLogic {
  constructor(p) { this.props = p || {}; this.state = {}; }
  setState(u, cb) { const patch = typeof u === 'function' ? u(this.state) : u; this.state = Object.assign({}, this.state, patch); if (cb) cb(); }
  forceUpdate() {} componentDidMount() {} componentDidUpdate() {} componentWillUnmount() {} renderVals() { return {}; }
}
const Component = new Function('DCLogic', 'StreamableLogic', 'React', src + '\n;return Component;')(DCLogic, DCLogic, {});

function ser(v, depth) {
  if (depth > 14) return '__deep__';
  if (v === undefined) return '__undef__';
  if (typeof v === 'function') return '__fn__';
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map((x) => ser(x, depth + 1));
  const o = {};
  for (const k of Object.keys(v)) o[k] = ser(v[k], depth + 1);
  return o;
}
const snaps = [];
const errors = [];
let c;
function fresh(props) { now = 0; tasks = []; c = new Component(props || {}); c.componentDidMount(); }
function snap(name) {
  try { snaps.push({ name, vm: ser(c.renderVals(), 0) }); }
  catch (e) { errors.push(name + ': ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
}
function step(name, fn) {
  try { fn(); } catch (e) { errors.push('step ' + name + ': ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
  snap(name);
}
const ev = (value) => ({ target: { value, files: [{}] }, key: 'Enter', shiftKey: false, nativeEvent: {}, preventDefault() {}, clientX: 0, clientY: 0, currentTarget: { clientWidth: 340, setPointerCapture() {} }, pointerId: 1 });
const vm = () => c.renderVals();

for (const lang of ['ko', 'en']) {
  for (const theme of ['light', 'dark']) {
    const L = lang + '/' + theme + ' ';
    fresh({ lang: lang === 'en' ? 'English' : '한국어', theme: theme === 'dark' ? '다크' : '라이트' });
    snap(L + 'initial');
    run(800); snap(L + 'streaming');
    for (const h of ['G', 'D', 'E', 'F', 'B']) {
      step(L + 'home ' + h, () => c.setSet('home', h));
    }
    step(L + 'type draft', () => c.onDraft(ev(lang === 'ko' ? '회의에서 낸 아이디어가 묻혔어' : 'My idea got buried in the meeting')));
    for (const h of ['G', 'D', 'E', 'F', 'B']) step(L + 'draft home ' + h, () => c.setSet('home', h));
    step(L + 'route sheet', () => c.openRoute());
    step(L + 'route new', () => vm().sheet.route.pickNew());
    step(L + 'route sheet 2', () => c.openRoute());
    step(L + 'route cont', () => c.closeSheet());
    step(L + 'pick compose', () => c.openPickCompose());
    step(L + 'pick toggle', () => vm().pick.rows[0].toggle());
    step(L + 'pick confirm', () => c.pickConfirm());
    step(L + 'send home', () => c.sendHome());
    run(300); snap(L + 'room typing');
    run(1600); snap(L + 'room writing');
    run(20000); snap(L + 'room done');
    step(L + 'room draft', () => c.onRoomDraft(ev(lang === 'ko' ? '좋은 말이네' : 'Nice point')));
    step(L + 'room send', () => c.sendRoom());
    run(600); snap(L + 'room busy');
    step(L + 'room stop', () => c.stopHere());
    step(L + 'mention', () => c.openMention());
    step(L + 'mention pick', () => vm().sheet.mention.people[0].pick());
    step(L + 'room info', () => c.openRoomInfo());
    step(L + 'room info seg', () => vm().roomInfo.autoSeg[2].pick());
    step(L + 'room info lang', () => vm().roomInfo.langs[3].pick());
    step(L + 'room info feed', () => vm().roomInfo.feedSw.toggle());
    step(L + 'room add', () => vm().roomInfo.addMember());
    step(L + 'room add pick', () => vm().pick.rows[5].toggle());
    step(L + 'room add confirm', () => c.pickConfirm());
    step(L + 'report', () => vm().roomInfo.report());
    step(L + 'report pick', () => vm().sheet.report.reasons[1].pick());
    step(L + 'report submit', () => c.submitReport());
    step(L + 'kick', () => vm().roomInfo.members[2] && vm().roomInfo.members[2].kick());
    step(L + 'toast undo', () => c.toastAct());
    step(L + 'back', () => c.goBack());
    step(L + 'back2', () => c.goBack());
    step(L + 'open dm ca', () => c.openRoom('dm-ca'));
    step(L + 'why', () => vm().room.toggleWhy());
    step(L + 'dm info', () => c.openRoomInfo());
    step(L + 'dm archive', () => vm().roomInfo.archive());
    step(L + 'undo archive', () => c.toastAct());
    step(L + 'tab people', () => c.goTab('people'));
    step(L + 'people search', () => c.togglePeopleSearch());
    step(L + 'people q', () => c.onPeopleQ(ev(lang === 'ko' ? '니' : 'nie')));
    step(L + 'people q none', () => c.onPeopleQ(ev('zzz')));
    step(L + 'people search close', () => c.togglePeopleSearch());
    step(L + 'phil ni', () => vm().people.rows[1].open());
    step(L + 'phil first', () => vm().phil.firstSw.toggle());
    step(L + 'phil mem yes', () => vm().phil.mems[0].yes());
    step(L + 'phil mem pause', () => vm().phil.mems[1].togglePause());
    step(L + 'phil mem forget', () => vm().phil.mems[1].forget());
    step(L + 'phil invite', () => vm().phil.invite());
    step(L + 'phil img sheet', () => vm().phil.changeImage());
    step(L + 'use sample', () => c.useSample());
    step(L + 'crop zoom', () => c.onZoom(ev('2')));
    step(L + 'crop drag', () => { c.onCropDown(ev()); c.onCropMove(Object.assign(ev(), { clientX: 40, clientY: -30 })); c.onCropUp(); });
    step(L + 'crop rotate', () => c.cropRotate());
    step(L + 'crop gray', () => c.toggleGray());
    step(L + 'crop apply', () => c.cropApply());
    step(L + 'phil img custom', () => vm().phil.changeImage());
    step(L + 'recrop', () => c.recrop());
    step(L + 'recrop back', () => c.goBack());
    step(L + 'img sheet again', () => vm().phil.changeImage());
    step(L + 'reset img', () => c.resetImage());
    step(L + 'pick file', () => { vm().phil.changeImage(); c.onPickFile(ev()); });
    step(L + 'apply file', () => c.cropApply());
    step(L + 'phil forget all', () => vm().phil.forgetAll());
    step(L + 'confirm ok', () => c.confirmOk());
    step(L + 'phil hide', () => vm().phil.hide());
    step(L + 'people hidden', () => c.goTab('people'));
    step(L + 'phil so', () => vm().people.rows[0].open());
    step(L + 'phil so dm', () => vm().phil.dm());
    step(L + 'my profile', () => { c.goTab('people'); c.openMyProfile(); });
    step(L + 'me name', () => c.onMeName(ev('민')));
    step(L + 'me honor', () => vm().me.honor[1].pick());
    step(L + 'me cover', () => c.cycleCover());
    step(L + 'me interest', () => vm().me.interests[3].pick());
    step(L + 'me photo', () => c.onMePhoto(ev()));
    step(L + 'me share', () => c.toggleIntroShare());
    step(L + 'me bday', () => c.onMeBirthday(ev('1995-03-02')));
    // ----- 나에 대해: 넣기 → 소화 → 범위 → 후보 → 고치기 -----
    step(L + 'about add sheet', () => vm().me.about.add());
    step(L + 'about sample', () => c.useAboutSample());
    run(300); snap(L + 'about busy 1');
    run(800); snap(L + 'about busy 2');
    run(2000); snap(L + 'about done');
    step(L + 'about use off', () => vm().about.useSw.toggle());
    step(L + 'about use on', () => vm().about.useSw.toggle());
    step(L + 'about scope open', () => vm().about.sections[2].openScope());
    step(L + 'about scope pick', () => vm().sheet.scope.opts[1].pick());
    step(L + 'about scope pid', () => vm().sheet.scope.chips[1].pick());
    step(L + 'about scope save', () => c.saveAboutScope());
    step(L + 'about scope undo', () => c.toastAct());
    step(L + 'about scope empty', () => { vm().about.sections[3].openScope(); vm().sheet.scope.opts[1].pick(); c.saveAboutScope(); });
    step(L + 'about scope dm', () => { vm().sheet.scope.opts[2].pick(); c.saveAboutScope(); });
    step(L + 'about cands', () => vm().about.openCands());
    step(L + 'cand set yes', () => vm().cands.items[0].yes());
    step(L + 'cand set undo', () => c.toastAct());
    step(L + 'cand fact yes', () => vm().cands.items[1].yes());
    step(L + 'cand fact no', () => vm().cands.items[1].no());
    step(L + 'cand no undo', () => c.toastAct());
    step(L + 'cand all', () => vm().cands.acceptAll());
    step(L + 'cand all undo', () => c.toastAct());
    step(L + 'cand all again', () => vm().cands.acceptAll());
    step(L + 'cands clear', () => { let g = 0; while (vm().cands.items.length && g++ < 20) vm().cands.items[0].yes(); });
    step(L + 'about back', () => c.goBack());
    step(L + 'about more', () => vm().about.more());
    step(L + 'about edit', () => vm().sheet.aboutMore.edit());
    step(L + 'about edit save', () => { c.onEditBody(ev(c.state.noteEdit.body + (lang === 'ko' ? '\n\n## 요즘 쉼\n요즘 너무 피곤하다. 잠이 부족하다.' : '\n\n## Rest lately\nI am tired lately. Not enough sleep.'))); c.saveNote(); });
    run(2500); snap(L + 'about re-digest');
    step(L + 'about re cands', () => vm().about.hasCands && vm().about.openCands());
    step(L + 'about re cands back', () => c.goBack());
    step(L + 'about memory', () => vm().about.openMemory());
    step(L + 'about memory back', () => c.goBack());
    step(L + 'about back to me', () => c.goBack());
    step(L + 'me save', () => c.saveMe());
    // ----- 대화에서 근거 보기 -----
    step(L + 'ref dm send', () => { c.goTab('chat'); c.openRoom('dm-ni'); c.onRoomDraft(ev(lang === 'ko' ? '요즘 회사 일이 너무 많아' : 'Too much work at the office lately')); c.sendRoom(); });
    run(20000); snap(L + 'ref dm done');
    step(L + 'ref sheet', () => { const it = vm().room.items.filter((x) => x.hasRef).pop(); if (it) it.openRef(); });
    step(L + 'ref stop', () => vm().sheet.ref.stop());
    step(L + 'ref sheet off', () => { const it = vm().room.items.filter((x) => x.hasRef).pop(); if (it) it.openRef(); });
    step(L + 'ref resume', () => vm().sheet.ref.resume());
    step(L + 'ref open about', () => { const it = vm().room.items.filter((x) => x.hasRef).pop(); if (it) { it.openRef(); vm().sheet.ref.open(); } });
    step(L + 'ref group send', () => { c.goTab('chat'); c.openRoom('nihil'); c.onRoomDraft(ev(lang === 'ko' ? '요즘 다 의미 없게 느껴져' : 'Everything feels pointless lately')); c.sendRoom(); });
    run(30000); snap(L + 'ref group done');
    step(L + 'ref group again', () => { c.onRoomDraft(ev(lang === 'ko' ? '공허해' : 'So empty')); c.sendRoom(); });
    run(30000); snap(L + 'ref group again done');
    // ----- 같이 읽기: 방에 자료 보내기 → 반응 → 근거 → 사유 노트 부탁 → 보기·저장·내리기 -----
    step(L + 'doc add sheet', () => { c.goTab('chat'); c.openRoom('nihil'); c.openDocAdd(); });
    step(L + 'doc sample', () => c.useDocSample());
    run(400); snap(L + 'doc reading');
    run(30000); snap(L + 'doc reacted');
    step(L + 'doc ref sheet', () => { const it = vm().room.items.filter((x) => x.refDoc).pop(); if (it) it.openRef(); });
    step(L + 'doc ref ask', () => vm().sheet.docRef.ask());
    step(L + 'doc ask pick', () => vm().sheet.askDoc.chips[1].pick());
    step(L + 'doc ask submit', () => c.submitAskDoc());
    step(L + 'doc follow', () => { c.onRoomDraft(ev(lang === 'ko' ? '이 글에서 제일 공감 가는 데가 어디야?' : 'Which part of this text do you agree with most?')); c.sendRoom(); });
    run(30000); snap(L + 'doc follow done');
    step(L + 'doc follow 2', () => { c.onRoomDraft(ev(lang === 'ko' ? '요즘 쉬는 게 제일 어려워' : 'Resting is the hardest thing lately')); c.sendRoom(); });
    run(30000); snap(L + 'doc follow 2 done');
    step(L + 'doc open card', () => { const it = vm().room.items.filter((x) => x.docMsg).pop(); it.openDoc(); });
    step(L + 'doc ask from viewer', () => vm().doc.ask());
    step(L + 'doc ask close', () => c.closeSheet());
    step(L + 'doc save note', () => vm().doc.saveNote());
    step(L + 'doc save note open', () => c.toastAct());
    step(L + 'doc back', () => c.goBack());
    step(L + 'doc room info', () => { c.goBack(); c.openRoomInfo(); });
    step(L + 'doc room info open', () => vm().roomInfo.docs[0].open());
    step(L + 'doc remove', () => vm().doc.remove());
    step(L + 'doc remove ok', () => c.confirmOk());
    step(L + 'doc removed room', () => { c.goTab('chat'); c.openRoom('nihil'); });
    step(L + 'doc dm note share', () => { c.goTab('chat'); c.openRoom('dm-so'); c.openDocAdd(); vm().sheet.docAdd.notes[0].pick(); });
    run(20000); snap(L + 'doc dm note done');
    step(L + 'doc dm file', () => { c.openDocAdd(); c.onDocFile(ev()); });
    run(20000); snap(L + 'doc dm file done');
    step(L + 'doc dm empty', () => { c.openDocAdd(); c.shareDoc(c.top().id, { name: 'empty.md' }, '  ', null); });
    step(L + 'doc dm bad file', () => c.readTextFile({ name: 'x.pdf', type: 'application/pdf', size: 10 }, () => {}));
    step(L + 'doc dm info add', () => { c.closeSheet(); c.openRoomInfo(); vm().roomInfo.addDoc(); });
    step(L + 'feed planned doc', () => { c.closeSheet(); c.goTab('feed'); });
    step(L + 'feed planned open', () => { const p = vm().feed.planned.find((x) => x.title.indexOf(lang === 'ko' ? '사유 노트' : 'reflection') >= 0); if (p) p.open(); });
    step(L + 'chat list doc preview', () => c.goTab('chat'));
    // ----- 노트·철학자 쪽에서 본 '나에 대해', 파일 바꾸기·지우기 -----
    step(L + 'notes about chip', () => { c.goTab('notes'); vm().notes.types[3].pick(); });
    step(L + 'notes about open', () => vm().notes.groups[0].items[0].open());
    step(L + 'phil about row', () => { c.goTab('people'); c.push('phil', { pid: 'ni' }); });
    step(L + 'phil about open', () => vm().phil.openAbout());
    step(L + 'phil about mem forget', () => { c.push('phil', { pid: 'ni' }); const m = vm().phil.mems.find((x) => x.label === (lang === 'ko' ? '나에 대해' : 'About me')); if (m) m.forget(); });
    step(L + 'phil forget all', () => { vm().phil.forgetAll(); c.confirmOk(); });
    step(L + 'memory about', () => { c.openMemory(); vm().memory.filters[3].pick(); });
    step(L + 'about replace', () => { c.openAbout(c.state.notes.find((n) => n.kind === 'about').id); vm().about.more(); c.onAboutReplace(ev()); });
    run(2500); snap(L + 'about replaced');
    step(L + 'about txt file', () => { c.openAboutAdd(); c.ingestAboutFile('me.txt', lang === 'ko' ? '첫 문단이에요. 회사 이야기.\n\n둘째 문단. 친구 이야기.' : 'First paragraph. Work talk.\n\nSecond paragraph. Friends.', null); });
    run(2500); snap(L + 'about txt done');
    step(L + 'about txt cands', () => vm().about.openCands());
    step(L + 'about empty file', () => c.ingestAboutFile('empty.txt', '   \n  ', null));
    step(L + 'about bad file', () => c.readAboutFile({ name: 'photo.png', type: 'image/png', size: 10 }, null));
    step(L + 'about big file', () => c.readAboutFile({ name: 'big.md', size: 5 * 1024 * 1024 }, null));
    step(L + 'about long text', () => c.ingestAboutFile('long.md', '## 긴 글\n' + 'ㄱ'.repeat(60100), null));
    run(2500); snap(L + 'about long done');
    step(L + 'about template', () => { c.openAboutAdd(); c.useAboutTemplate(); });
    step(L + 'about template empty save', () => c.saveNote());
    step(L + 'about template fill', () => { c.onEditBody(ev(c.state.noteEdit.body.replace(lang === 'ko' ? '## 하는 일\n' : '## Work\n', lang === 'ko' ? '## 하는 일\n개발자로 일한다.\n' : '## Work\nI work as a developer.\n'))); c.saveNote(); });
    run(2500); snap(L + 'about template done');
    step(L + 'about delete', () => { vm().about.more(); vm().sheet.aboutMore.remove(); });
    step(L + 'about delete ok', () => c.confirmOk());
    step(L + 'notes about after', () => { c.goTab('notes'); vm().notes.types[3].pick(); });
    step(L + 'notes all again', () => vm().notes.types[0].pick());
    step(L + 'search about', () => { c.goTab('notes'); c.openSearch(); c.onSearchQ(ev(lang === 'ko' ? '회사' : 'company')); });
    step(L + 'search about close', () => c.goBack());
    step(L + 'tab feed', () => c.goTab('feed'));
    step(L + 'like', () => c.toggleLike());
    step(L + 'comment', () => c.openComment());
    step(L + 'comment text', () => c.onSheetText(ev('좋네요')));
    step(L + 'comment submit', () => c.submitComment());
    step(L + 'ask note', () => c.openAskNote());
    step(L + 'ask note pick', () => vm().sheet.pick.chips[2].pick());
    step(L + 'ask note submit', () => c.submitAskNote());
    step(L + 'archive', () => c.openArchive());
    step(L + 'arch pid', () => vm().archive.pidChips[1].pick());
    step(L + 'arch kind', () => vm().archive.kindChips[2].pick());
    step(L + 'arch all', () => { vm().archive.pidChips[0].pick(); vm().archive.kindChips[0].pick(); });
    step(L + 'arch day', () => c.openArchDay());
    step(L + 'arch day pick', () => vm().sheet.archDays[1].pick());
    step(L + 'arch comment', () => vm().archive.days[0].items[0].comment());
    step(L + 'arch back', () => { c.closeSheet(); c.clearArchDay(); c.goBack(); });
    step(L + 'tab notes', () => c.goTab('notes'));
    step(L + 'notes day', () => vm().notes.days[1].pick());
    step(L + 'notes empty day', () => vm().notes.days[5].pick());
    step(L + 'notes type', () => { c.clearNoteDay(); vm().notes.types[2].pick(); });
    step(L + 'notes all', () => vm().notes.types[0].pick());
    step(L + 'note n3', () => c.openNote('n3'));
    step(L + 'note reply', () => vm().note.memos[0].toggleReply());
    step(L + 'note reply text', () => vm().note.memos[0].onReply(ev('그런가 봐요')));
    step(L + 'note reply send', () => vm().note.memos[0].sendReply());
    step(L + 'note why', () => vm().note.memos[1].toggleWhy());
    step(L + 'note access', () => vm().note.changeAccess());
    step(L + 'note access pick', () => vm().sheet.pick.chips[0].pick());
    step(L + 'note access save', () => c.submitAccess());
    step(L + 'note ask memo', () => vm().note.askMemo());
    step(L + 'note ask memo submit', () => c.submitAskMemo());
    step(L + 'note more', () => c.openNoteMore());
    step(L + 'note edit', () => vm().sheet.more.edit());
    step(L + 'note edit save', () => { c.onEditBody(ev('새 문단\n둘째 문단')); c.saveNote(); });
    step(L + 'note n1', () => c.openNote('n1'));
    step(L + 'note n1 ask', () => vm().note.askMemo());
    step(L + 'note n1 to access', () => vm().sheet.pick.toAccess());
    step(L + 'note n2', () => { c.closeSheet(); c.openNote('n2'); });
    step(L + 'new note', () => { c.goTab('notes'); c.newNote(); });
    step(L + 'new note fill', () => { c.onEditTitle(ev('오늘')); c.onEditBody(ev('본문')); vm().edit.chips[1].pick(); });
    step(L + 'new note save', () => c.saveNote());
    step(L + 'note delete', () => { c.openNoteMore(); vm().sheet.more.remove(); });
    step(L + 'note delete ok', () => c.confirmOk());
    step(L + 'settings', () => c.openSettings());
    step(L + 'set lang seg', () => vm().settings.aiLang[1].pick());
    step(L + 'set theme', () => vm().settings.theme[0].pick());
    step(L + 'set feedtime', () => vm().settings.pickFeedTime());
    step(L + 'set feedtime pick', () => vm().sheet.options.items[2].pick());
    step(L + 'set reflect', () => vm().settings.pickReflect());
    step(L + 'set quiet', () => { c.closeSheet(); vm().settings.pickQuiet(); });
    step(L + 'set scope', () => { c.closeSheet(); vm().settings.pickScope(); });
    step(L + 'set comment', () => { c.closeSheet(); vm().settings.pickComment(); });
    step(L + 'set feed items', () => { c.closeSheet(); vm().settings.pickFeedItems(); });
    step(L + 'feed items toggle', () => { vm().sheet.feedItems[0].pick(); vm().sheet.feedItems[1].pick(); vm().sheet.feedItems[2].pick(); vm().sheet.feedItems[3].pick(); });
    step(L + 'feed nothing', () => { c.closeSheet(); c.goTab('feed'); });
    step(L + 'settings 2', () => c.openSettings());
    step(L + 'set plus', () => vm().settings.plus());
    step(L + 'set plus on', () => vm().sheet.plus.sw.toggle());
    step(L + 'set export', () => { c.closeSheet(); vm().settings.exportAll(); });
    step(L + 'set export go', () => c.doExport());
    run(1500); snap(L + 'export done');
    step(L + 'set switches', () => { c.closeSheet(); const sw = vm().settings.sw; for (const k of Object.keys(sw)) sw[k].toggle(); });
    step(L + 'set max', () => vm().settings.maxPerDay && vm().settings.maxPerDay[0] && vm().settings.maxPerDay[0].pick());
    step(L + 'home style', () => c.openHomeStyle());
    step(L + 'home style pick', () => vm().homeStyle.opts[3].pick());
    step(L + 'images', () => { c.goBack(); c.openImages(); });
    step(L + 'images card', () => vm().images.cards[2].open());
    step(L + 'models', () => { c.closeSheet(); c.openModels(); });
    run(30000); snap(L + 'models done');
    step(L + 'models use light', () => vm().models.useLight());
    step(L + 'models pause', () => vm().models.togglePause());
    step(L + 'memory', () => c.openMemory());
    for (let i = 0; i < 5; i++) step(L + 'memory filter ' + i, () => vm().memory.filters[i].pick());
    step(L + 'info ai', () => c.openInfo('ai'));
    step(L + 'info lic', () => c.openInfo('licenses'));
    step(L + 'info rep', () => c.openInfo('reports'));
    step(L + 'onboarding', () => c.openOnboarding());
    step(L + 'ob next', () => c.obNext());
    step(L + 'ob next2', () => c.obNext());
    step(L + 'ob done', () => c.obNext());
    step(L + 'search', () => { c.goTab('chat'); c.openSearch(); });
    for (const q of ['니체', '커피', 'Nietzsche', 'zzz', '빗속']) step(L + 'search ' + q, () => c.onSearchQ(ev(q)));
    step(L + 'pick new', () => { c.goTab('chat'); c.openPickNew(); });
    step(L + 'pick new sel', () => { vm().pick.rows[0].toggle(); vm().pick.rows[3].toggle(); });
    step(L + 'pick new go', () => c.pickConfirm());
    step(L + 'invite sheet', () => { c.goTab('people'); vm().people.rows[0].open(); vm().phil.invite(); });
    step(L + 'invite pick', () => vm().sheet.invite.rooms[0] && vm().sheet.invite.rooms[0].pick());
    step(L + 'invite new group', () => { vm().phil.invite(); vm().sheet.invite.newGroup(); });
    step(L + 'list filters', () => { c.setSet('home', 'D'); for (const f of vm().chat.dChips) f.pick(); });
    step(L + 'list q', () => c.onListQ(ev('니체')));
    step(L + 'E tabs', () => { c.setSet('home', 'E'); vm().chat.pickFirst(); });
    step(L + 'F collapse', () => { c.setSet('home', 'F'); vm().chat.toggleFGroup(); vm().chat.toggleFDm(); });
    step(L + 'F tiles', () => { c.onListQ(ev('')); vm().chat.toggleFGroup(); vm().chat.toggleFDm(); vm().chat.openTileFirst(); });
    step(L + 'wipe', () => { c.goTab('chat'); c.openSettings(); vm().settings.wipe(); c.confirmOk(); });
    for (const h of ['B', 'G', 'D', 'E', 'F']) step(L + 'wiped home ' + h, () => c.setSet('home', h));
    step(L + 'wiped people', () => c.goTab('people'));
    step(L + 'wiped feed', () => c.goTab('feed'));
    step(L + 'wiped notes', () => c.goTab('notes'));
    step(L + 'wiped memory', () => c.openMemory());
  }
}
fs.writeFileSync(outPath, JSON.stringify(snaps));
console.log('snapshots', snaps.length, 'errors', errors.length);
for (const e of errors.slice(0, 40)) console.log(' -', e);
