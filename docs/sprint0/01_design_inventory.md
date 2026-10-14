# 01 · 디자인 시안 '어스름' 분석과 보존 전략

> 근거: `legacy-design-reference/AGORA_design_draft/` 전체(Main.dc.html 917줄, agora.css, 01~04 JS, canvas.json, Map·Grammar 보드)를 끝까지 읽음. 2026-10-14.
> 이 문서는 **이식 계약**이다. 여기 적힌 값을 바꾸려면 사장님 승인이 필요하다 (지시서 2장).

## 1. 보존 전략

| 무엇을 | 어떻게 |
|---|---|
| 원본 시안 | `legacy-design-reference/AGORA_design_draft/`에 **읽기 전용**으로 커밋. 원본 ZIP·지시서의 SHA-256은 `SOURCE_CHECKSUMS.txt` |
| 초상 6장 | 카뮈·시오랑 **사용권 미확인** + 저장소가 **공개**이므로 Git에서 제외(`.gitignore`). 로컬 디스크에만 둠 |
| 색·글꼴·간격 | 아래 4장 토큰표를 Compose 테마에 **1:1** 매핑. Material3 기본 색으로 자동 대체 금지 |
| 문구 | `STR.ko`/`STR.en`(각 537키, 키 집합 동일)을 `strings.xml`(values / values-en)로 기계 변환. 손 번역 금지 |
| 아이콘 | 시안의 인라인 SVG path(선 굵기 1.8, 둥근 끝)를 그대로 ImageVector로 옮김. Material 아이콘 대체 금지 |
| 기준 화면 | 캔버스 런타임(`support.js`)이 ZIP에 없어 시안을 브라우저로 직접 렌더할 수 없음 → **사장님이 Claude 디자인 캔버스에서 찍은 스크린샷**이 필요(7번 결정 사항). 그 전까지는 CSS 수치·마크업 구조가 비교 근거 |

## 2. 화면 인벤토리

### 2.1 전체 화면 13종 (`state.screen`)
| screen | 화면 | 시안 보드 |
|---|---|---|
| `ob` (1/2/3단계) | 첫 실행 → 기기 안 AI 준비 → 권한 고르기 | Welcome, Setup |
| `home` | 하단 탭 4개를 담는 틀 | Main |
| `room` | 단톡방 / 개인톡 | Plaza, Mention, Invite, Together, Debate, Reach |
| `nr1` | 새 단톡방 · 철학자 고르기 | NewRoom |
| `nr2` | 새 방 · 대화 분위기 (이어 말하기·논쟁 빈도/강도 + 미리 보기) | NewRoom-Vibe |
| `info` | 방 정보·설정 | RoomInfo |
| `journal` | 노트 상세(나의 노트·대화 노트) — *내부 레거시 이름, UI는 '노트'* | Entry, Entry-Comments, Entry-Plan, Entry-Access |
| `compose` | 새 노트 / 고치기 | Compose |
| `note` | 철학자의 사유 노트 상세 | Note |
| `profile` | 철학자 프로필 | Profile |
| `memory` | 기억 관리 | Memory |
| `models` | 기기 안 AI 모델 | Models |
| `plus` | Plus | Plus, Consent |

### 2.2 홈 탭 4개 (`state.tab`, 하단 `ag-nav` 80px)
- **채팅**: 워드마크 `AG●RA`, 검색·새 채팅, 고정 광장·단톡방·개인톡 행(`ag-cr`), 보관함, '먼저 건넴' 태그, 진행 중 표시(`ag-live` 등불 점), FAB '새 채팅'
- **노트**: 세그먼트 `나의 노트 | 철학자의 사유 노트` → 주간 달력(`ag-week`)·유형 필터·날짜 묶음·노트 카드(`ag-entry`) / 철학자 필터·사유 노트 카드. FAB '노트 쓰기' / '사유 노트 청하기'
- **철학자**: 안내 배너 + 6명 카드(초상 링·이름색·연도·소개·개인톡 버튼)
- **설정**: 엔진 / 언어(앱·AI 응답) / 테마 / 알림·먼저 연락 / 기억·노트 / 데이터 / 정보

### 2.3 시트·오버레이 18종 (`state.sheet.type`)
newChat · invite(이번만/고정) · msg(메시지 동작) · report · access(읽기·댓글) · autoSet · whyPlan(왜 예약됐나요) · revs(수정 기록) · why(먼저 건넨 말 왜 왔나요) · cloud(클라우드 동의) · source(원본 대화) · pick · noteSet · confirm · search · info + ⋮ 메뉴(`ag-menu`) · 토스트(`ag-toast`) · 멘션 팝업(`ag-pop`)

### 2.4 장면 보드 26개 → 시작 상태
26개 보드는 모두 `<dc-import name="Main" start="…">` 한 줄 래퍼다. 실제 앱에서는 **개발용 미리보기/스크린샷 진입점**(Compose `@Preview` + 디버그 딥링크)으로만 재현하고 제품 코드와 분리한다. 매핑은 [02_prototype_behavior_spec.md](02_prototype_behavior_spec.md) 6장.

## 3. 컴포넌트 카탈로그 (CSS 클래스 → Compose 컴포넌트)

| 묶음 | 시안 클래스 | 메모 |
|---|---|---|
| 프레임 | `ag-top`(64) `ag-nav`(80) `ag-scroll` `ag-hscroll` `ag-sec` `ag-div` | 상단바 3패턴: 뒤로+제목 / X+제목+버튼 / 워드마크+아이콘 |
| 워드마크 | `ag-wm`(21/800, 자간 .22em, O 자리에 호박색 원) `.big` 40 | |
| 버튼 | `ag-ib`(48 원) `ag-btn`(52, pill; tonal·ghost·danger·sm 40·block) `ag-link` `ag-fab`(56, r18) `ag-send`(48; stop=등불색) | |
| 칩·태그 | `ag-chip`(36; on·lamp) `ag-tag`(18, r6, 10.5/700; lamp·primary·hue·danger) `ag-badge` `ag-access`(32) `ag-ref` | 'AI'·'자동'·'베타'·'먼저 건넴'·'초안/검토됨/수정됨' 모두 `ag-tag` |
| 초상 | `ag-av`(**흑백 + contrast 1.06 필터**, 20~96) `ag-ring`(2px 간격 + 2px 철학자색) `ag-cl`(3인 클러스터) `ag-stack`(-8 겹침) `ag-me-av` | Compose: ColorMatrix 채도 0 |
| 메시지 | `ag-row`(.me, .gap 12) `ag-who`(이름색+AI+`→ 대상`) `ag-bub`(r20; first 모서리 6; me; streaming=등불 1.5px 테두리+깜빡 커서; private) `ag-mn` `ag-q`(인용) `ag-meta` `ag-day` `ag-notice` `ag-sysline` `ag-src` | 다크에서 말풍선 테두리 없음 |
| 대화 상태 | `ag-typing`(점 3개 등불색 바운스) `ag-auto`(이어 말하기 상태바) `ag-quick`(완화 칩) `ag-stopped` `ag-init`('먼저 건넨 말 · 왜 왔나요?') `ag-cardmsg`(노트 제안 카드) | |
| 입력 | `ag-comp` `ag-in`(48 pill) `ag-reply` `ag-pop`(멘션 자동완성: '이 방에서' / '초대해서 부르기') | `@` 버튼은 단톡방에서만 |
| 카드·목록 | `ag-card`(r20; sunk·lamp) `ag-group` `ag-li`(56) `ag-tile`(40, r12) `ag-banner` | 그림자 대신 1px 안쪽 선 |
| 폼 | `ag-seg` `ag-sw`(52×32) `ag-opt`+`ag-radio` `ag-check` `ag-steps` `ag-field`(52; textarea는 명조 1.7) `ag-bar`(8) | |
| 노트 | `ag-week` `ag-day-c` `ag-entry`(r22; 제목 명조 19/27, 발췌 2줄) `ag-read`(명조 16.5/30) `ag-sent` `ag-guess`(점선 밑줄) `ag-quote` `ag-compose-t/b` | |
| 댓글 | `ag-cm`(.reply 들여쓰기 22) `ag-cm-a` | |
| **예약 댓글** | `ag-plan`(r18, **1.5px 점선**) + `ag-plan-av`(시계 배지) | '지금 올리기'는 시연용 → 실제 예약으로 대체 |
| 시트 | `ag-scrim` `ag-sheet`(상단 r28, 최대 88%) `ag-handle` `ag-menu` `ag-toast` `ag-preview` | ModalBottomSheet / DropdownMenu |

## 4. 디자인 토큰 (agora.css 원본값)

### 4.1 색
| 토큰 | 라이트 | 다크 |
|---|---|---|
| bg | #F5F4F9 | #131315 |
| surface | #FFFFFF | #1C1C1F |
| raised | #FFFFFF | #222225 |
| sunken | #ECEAF3 | #27272B |
| sunken-2 | #E3E0EC | #34343A |
| line | #E2DFEB | #2A2A2E |
| line-2 | #CDC9DA | #3D3D44 |
| ink | #1C1930 | #ECECEF |
| ink-2 | #474360 | #BDBDC4 |
| ink-3 | #625E7A | #A0A0A8 |
| primary | #4636CC | #E2E2E6 |
| on-primary | #FFFFFF | #141416 |
| primary-soft | #E8E5FD | #2F2F35 |
| primary-ink | #3A2BB0 | #F2F2F5 |
| me (내 말풍선) | #4636CC | #3A3A40 |
| on-me | #FFFFFF | #F2F2F5 |
| lamp (등불) | #F2B544 | #F5C25C |
| on-lamp | #2B1D00 | #2B1D00 |
| lamp-ink | #835300 | #F5C25C |
| lamp-soft | #FCF0D6 | #3A2F17 |
| danger | #B3261E | #FFB4AB |
| danger-soft | #FBE9E7 | #3D1F1C |
| ok | #2E7D4F | #8FD3A7 |
| scrim | rgba(24,20,48,.44) | rgba(0,0,0,.6) |
| 토스트 배경(고정) | ink | #2E2E34 |

**철학자 색** (이름·초상 링 `--h-*` / 옅은 배경 `--hs-*`)
| 철학자 | 라이트 h / hs | 다크 h / hs |
|---|---|---|
| 소크라테스 so | #56691A / #EEF2DE | #C5D47E / #2C3218 |
| 니체 ni | #B0353F / #FBE6E8 | #FF9DA8 / #3C2328 |
| 쇼펜하우어 sh | #3D5A93 / #E5ECF8 | #A8C0F4 / #222C40 |
| 카뮈 ca | #8A580B / #F8EDD9 | #F0C373 / #3A2F17 |
| 시오랑 ci | #7A4284 / #F3E6F5 | #E3A9EB / #35233A |
| 아우렐리우스 au | #1E6D66 / #DFF1EE | #84D3C8 / #18322F |

> 철학자 색은 **Registry 팩이 아니라 테마 토큰**에 둔다(팩에는 `color_token: ph-ni`만). 새 철학자를 추가할 때 색 토큰 한 쌍도 함께 등록해야 한다 → 팩 계약에 `colors.light/dark` 선택 필드로 열어 둠(4장 참고).

### 4.2 글꼴
- **Gothic A1**(400~800): 대화·화면 전체 / **Gowun Batang**(400·700): 노트 본문·제목, AI 요약, 원전 인용, 노트 입력
- 둘 다 SIL OFL 1.1로 알려져 있음 → 앱 번들 시 라이선스 파일 동봉(확인 후 ADR 기록)
- 기본 15/1.5, **한글 어절 단위 줄바꿈**(`keep-all`) → Compose `LineBreak.Paragraph` + `WordBreak.Phrase`(Android 13+), 이하 버전 차이는 기록
- 크기표(크기/줄높이/굵기): display 30/38/800 · h1 22/30/800 · h2 18/26/700 · 상단 제목 20/28/800 · 섹션 13/18/700 · 말풍선 15/23 · 이름 13/18/700 · 메타 11 · 태그 10.5/700 · 칩 14/600 · 버튼 16/700 · 탭 라벨 12/700 · 시트 제목 19/27/800 · 노트 카드 제목 명조 19/27/700 · 읽기 명조 16.5/30 · 작성 제목 명조 24/34/700 · 시간·숫자 tabular-nums

### 4.3 모양·간격·움직임
- 둥글기: pill 999 · 카드/말풍선/팝업 20 · 노트 카드 22 · 시트 상단 28 · 메뉴/필드/세그먼트 16 · 예약 카드 18 · 타일 12 · 태그 6 · 말풍선 꼬리 6
- 간격: 화면 좌우 20 · 카드 좌우 16 · 메시지 묶음 2 / 화자 바뀌면 12 · 말풍선 안 10/14 · 터치 영역 36~56
- 그림자: 시트·팝업·FAB·토스트만. 나머지는 1px 안쪽 선
- 움직임: 등불 점 맥박 1.8s · 입력 중 점 1.2s(0/.15/.3s 지연) · 커서 깜빡 1s · 시트 올라옴 .28s · 메시지 등장 .25s · easing cubic-bezier(.2,.8,.2,1) · **'동작 줄이기' 설정 시 모두 끔**

## 5. 버릴 것 (캔버스 전용)
`<x-dc>`, `<helmet>`, `{{…}}` 바인딩, `<sc-if>`/`<sc-for>`, `dc-import`, `support.js`, `/_blob/…` 주소, 412×915 고정 프레임, hover 스타일, Tweaks(언어·테마·시작 화면·오프라인·속도). `aria-*`/`role`은 버리지 말고 Compose semantics로 옮긴다.

## 6. 자리표시 (실제 값 미정 — 그대로 자리표시로 둠)
`[기본 모델]` `[모델 용량]` `[가벼운 모델]` `[큰 모델]` `[구독료]` `[크레딧]` `[잔여 크레딧]`, 문구 끝 '(데모)', 고정 수치(저장공간 38%·23GB/61GB, 메모리 8GB, 크레딧 62%, 다운로드 46%), 달력 `2026년 10월`·`WEEK=[11..17]`.
