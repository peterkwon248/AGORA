// Checks the A~E chat-home labels: prop strings map to the right layout, and the settings/style screens show A~E.
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
global.DCLogic = class { constructor(p) { this.props = p; this.state = {}; } setState(u) { this.state = Object.assign({}, this.state, typeof u === 'function' ? u(this.state) : u); } };
global.window = { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };
global.setTimeout = () => 0; global.clearTimeout = () => {}; global.setInterval = () => 0; global.clearInterval = () => {};
const Component = new Function(src + '\nreturn Component;')();
const want = { 'A 말 걸기 먼저': 'B', 'B 한 줄 말 걸기': 'G', 'C 목록 먼저': 'D', 'D 한 마디 띠': 'E', 'E 묶음 목록': 'F',
  'G 한 줄 말 걸기': 'G', 'F 묶음 목록': 'F', 'B 말 걸기 먼저': 'B' };
let bad = 0;
for (const [prop, key] of Object.entries(want)) {
  const c = new Component({ home: prop, theme: '라이트', lang: '한국어', startTab: '채팅' });
  if (c.state.set.home !== key) { bad++; console.log('MISMATCH', prop, '->', c.state.set.home, 'want', key); }
}
const c = new Component({ home: 'C 목록 먼저', theme: '라이트', lang: '한국어', startTab: '채팅' });
c.openHomeStyle();
const vm = c.renderVals();
console.log('style screen letters:', vm.homeStyle.opts.map((o) => o.letter + ' ' + o.name + (o.on ? ' ✓' : '')).join(' | '));
console.log('settings row:', c.vmSettings ? c.vmSettings().homeLabel : '(n/a)');
process.exit(bad ? 1 : 0);
