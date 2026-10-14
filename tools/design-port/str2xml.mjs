// 시안 01_data.js의 STR(ko/en)을 Android strings.xml로 기계 변환한다. 손 번역 금지(01_design_inventory.md 1장).
// 사용: node tools/design-port/str2xml.mjs <01_data.js> <res 디렉터리>
// - 문자열 → <string>, 문자열 배열 → <string-array>, 그 밖(표·튜플·맵)은 건너뛰고 목록을 출력한다.
// - 자리표시 {n} 등은 그대로 둔다. 앱은 시안과 같은 fill() 규칙으로 채운다.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const [src, resDir] = process.argv.slice(2);
if (!src || !resDir) { console.error('usage: str2xml.mjs <01_data.js> <resDir>'); process.exit(2); }

// 시안 파일은 데이터로만 취급: 격리된 컨텍스트에서 실행하고 STR만 꺼낸다
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(src, 'utf8') + '\n;globalThis.__STR = STR;', ctx, { timeout: 2000 });
const STR = ctx.__STR;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'")
  .replace(/\n/g, '\\n').replace(/^@/, '\\@').replace(/^\?/, '\\?')
  ;
const resName = (k) => 'd_' + k.replace(/[^A-Za-z0-9_]/g, '_'); // d_ = design 원문 접두어

function convert(lang) {
  const t = STR[lang];
  const out = ['<?xml version="1.0" encoding="utf-8"?>',
    '<!-- 자동 생성: tools/design-port/str2xml.mjs — 직접 고치지 말 것. 원본은 legacy-design-reference/.../01_data.js -->',
    '<resources>'];
  const skipped = [];
  let n = 0;
  for (const k of Object.keys(t).sort()) {
    const v = t[k];
    if (typeof v === 'string') { out.push(`    <string name="${resName(k)}" formatted="false">${esc(v)}</string>`); n++; }
    else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
      out.push(`    <string-array name="${resName(k)}">`);
      for (const x of v) out.push(`        <item>${esc(x)}</item>`);
      out.push('    </string-array>'); n++;
    } else skipped.push(k);
  }
  out.push('</resources>', '');
  const dir = path.join(resDir, lang === 'ko' ? 'values' : 'values-en');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'design_strings.xml'), out.join('\n'));
  return { lang, total: Object.keys(t).length, converted: n, skipped };
}

const r = ['ko', 'en'].map(convert);
for (const x of r) console.log(`${x.lang}: 전체 ${x.total}키 중 ${x.converted}개 변환, ${x.skipped.length}개는 구조 데이터라 코드로 옮김`);
console.log('구조 데이터 키:', r[0].skipped.join(', '));
