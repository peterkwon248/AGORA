# design/redesign — 'AGORA 리디자인' 캔버스 사본과 써 보기 원본

> 기준: Claude Design 캔버스 **'AGORA 리디자인' v41** (2026-10-15, claude.ai 세션 3).
> 캔버스 주소: https://claude.ai/artifact/Pt69V697x4igond5M1sjq4 — 사장님 계정에서만 열린다.
> **이 폴더의 화면을 그대로 앱에 옮기지 않는다.** 옮겨도 되는 범위는 [`docs/design/REDESIGN-DIFF.md`](../../docs/design/REDESIGN-DIFF.md)에서 ✅인 줄과 [ADR-011](../../docs/decisions/ADR-011-redesign-structure.md)·[ADR-012](../../docs/decisions/ADR-012-user-materials.md)뿐이다(AGENTS.md '새 디자인 금지').

## 들어 있는 것

| 경로 | 내용 |
|---|---|
| `canvas/project/*.dc.html` | 캔버스 보드 29개. `Proto.dc.html`은 앱 전체를 눌러 보는 '써 보기' 보드(빌드 결과물), 나머지 28개는 화면별 정지 설계도 |
| `canvas/project/canvas.json` | 보드 배치·제목·메모 |
| `proto/tpl/*.html` | 써 보기 보드 화면 원본(화면마다 한 파일, 파일 이름 순서대로 이어 붙인다) |
| `proto/logic.js` | 써 보기 보드 동작(상태·화면 모델·예시 답 문장) |
| `proto/helmet.css` | 색 토큰(라이트·다크)·움직임 |
| `tools/` | 빌드·점검 도구(아래) |
| `tools/once/` | 이미 적용한 일회성 변환 기록(채팅 홈 안 만들기, A~E 이름 바꾸기 등). **다시 돌리지 않는다** — 지금 보드를 덮어쓴다 |

`/_blob/<id>`는 캔버스 안에 올려 둔 초상·예시 그림의 주소다. **그림 파일은 저장소에 없다**(공개 저장소 규칙: 카뮈·시오랑 초상 사용권 미확인).

## 원본 문법 (빌드할 때 풀린다)
- `[[이름|인자|…]]` — 공용 부품(아바타, 줄, 스위치, 아이콘 등). 정의는 `tools/build_proto.py`의 `MACROS`.
- `⟦한국어¦English⟧` — 두 언어 문구. 빌드가 `{{ t.kN }}` 자리와 사전 두 벌(`T_KO`, `T_EN`)로 바꾼다.
- `{{ a.b }}`, `<sc-if>`, `<sc-for>` — 캔버스 런타임 문법. 앱으로 옮기지 않는다(`docs/sprint0/01_design_inventory.md` 5장).

## 다시 만들고 점검하기 (저장소 루트에서)
Python 3과 Node가 필요하다(이 세션은 Python 3.13·Node 22). Windows Git Bash에 `python3`가 없으면 `py -3`으로 바꿔 쓴다. 빌드는 어느 OS에서나 줄바꿈을 LF로 쓴다.
```bash
D=design/redesign
python3 -I $D/tools/build_proto.py $D                        # → canvas/project/Proto.dc.html (+ proto/build/, git 제외)
node $D/tools/syntax.js $D/proto/build/logic.js               # 문법
node $D/tools/harness.js $D/proto/build/logic.js $D/proto/build/snaps.json   # 상태 1,220가지 눌러 보기(한/영 × 라이트/다크)
python3 -I $D/tools/check_tpl.py $D/proto/build/template.html $D/proto/build/snaps.json  # 화면의 모든 {{ }} 자리가 채워지는지
python3 -I $D/tools/check_canvas.py $D/canvas/project         # 보드·링크·높이·금지어('광장'·'일기')·태그 짝·겹침
node $D/tools/check_homes.js $D/proto/build/logic.js          # 채팅 홈 모양 A~E 표시
```
2026-10-15 기준 결과: 상태 1,220가지 중 1,220가지 오류 없음, 템플릿 자리 모두 채워짐, 캔버스 점검 통과. 이 사본을 다시 빌드하면 캔버스 v41의 `Proto.dc.html`과 바이트 단위로 같다.

**눈으로 보는 확인(렌더링)은 하지 않았다.** 캔버스에서 Play로 직접 보거나, 사장님이 요청하면 그때 한다.

## 고칠 때 주의
- 써 보기 보드는 `proto/`(화면 `tpl/`, 동작 `logic.js`, 색 `helmet.css`)를 고치고 빌드한다. `canvas/project/Proto.dc.html`은 빌드 결과물이라 직접 고치지 않는다.
- 나머지 보드 28개는 정지 설계도라 파일을 직접 고친다(빌드 없음). 보드를 더하거나 빼면 `canvas.json`도 고친다.
- `logic.js` 문자열에는 U+FFFD(깨진 글자 표시)·U+FEFF(BOM)를 글자 그대로 넣지 말고 `\uFFFD`처럼 이스케이프로 쓴다. U+FFFD가 글자 그대로 들어 있으면 캔버스 게시가 거부된다. 편집 도구가 이스케이프를 실제 글자로 바꿔 넣은 일이 있었으니 고친 뒤 확인한다.
- 화면에 '광장'·'일기'를 쓰지 않는다(`check_canvas.py`가 검사).

## 캔버스에 다시 올리기
캔버스(Artifact) 게시 도구가 있는 세션에서만 된다 — claude.ai 세션에서는 됐고, 로컬 Claude Code에서 되는지는 확인하지 않았다. 순서:
1. 이 폴더에서 고치고 위 점검을 모두 통과시킨다.
2. 게시 전에 캔버스의 지금 파일을 읽어 이 사본과 비교한다(다른 사람이 고친 것을 덮어쓰지 않기).
3. `url`=캔버스 주소, `root`=`design/redesign/canvas`, `file_path`=`project/canvas.json`, `files`=바꾼 보드들로 게시한다.
4. 게시한 뒤 이 폴더를 커밋해 캔버스와 저장소를 같게 맞춘다.

## 앱으로 옮길 때 주의
- 철학자 답 문장·'나에 대해' 기억 후보·대목 고르기 규칙은 **써 보기용 예시**다. 실제 앱은 기기 안 AI가 만든다(AGENTS.md '시연 문장 금지').
- 고정 시각(10월 14일 수요일 오전 8:50), 예시 인물 '지우', 예시 방·노트·파일 내용, '프로토타입' 안내 문구는 옮기지 않는다.
- 써 보기 보드는 새로 고치면 처음 상태로 돌아간다(저장 없음). 저장·권한은 설계서 15장과 ADR-012대로 새로 만든다.
