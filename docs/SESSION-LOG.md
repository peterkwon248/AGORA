# SESSION-LOG

## 2026-10-14 · 세션 1 — 착수 → Sprint 0 엔진·화면 (DESKTOP-JCJTAH8, Claude Code)

### 한 일
1. 인계 ZIP·지시서 v1.0·설계서 v2.1 전부 판독. 디자인 시안은 에이전트 3개로 나눠 끝까지 분석.
2. 착수 보고(지시서 15장 7항목): `docs/sprint0/00~04`, ADR-001(플랫폼)·ADR-002(로컬 LLM) 제안.
3. `Desktop\AGORA`를 독립 Git 저장소로 만들고 github.com/peterkwon248/AGORA(공개)에 연결. 홈 폴더는 Plot-V3 저장소라 주의.
4. 사장님 승인(D1) 후 설치: Temurin JDK 17(Microsoft JDK는 winget 해시 불일치로 건너뜀), Android cmdline-tools(해시 확인), platform-tools, platforms 36·37.0, build-tools 36.1.0, NDK 29.0.14206865, CMake 3.31.6, emulator, system image android-36 google_apis x86_64, AVD `agora_pixel`. Gradle 9.8.1(해시 확인).
5. 코드:
   - `core:inference-api` 생성 계약 / `UnavailableInferenceProvider`(모델 없음 → 정직한 실패)
   - `adapters:demo-inference` 테스트 전용
   - `core:philosophers` 팩 스키마·검증·Registry
   - `core:orchestration` SpeakerSelector·PromptComposer·ConversationEngine
   - `adapters:ollama-dev` PC Ollama 연결(디버그·PC 도구 전용)
   - `tools:pc-harness` PC 시험 대화 → `qa/pc-runs/`
   - `apps:android` 시안 토큰 테마, 시안 문구 520/537 기계 이식, Sprint 0 대화방 화면
6. 니체·쇼펜하우어 팩 초안(시안 원문 + 말투 수준·인용 정책·색·legacy ID).

### 검증
- 자동 검사 35가지 전부 통과(이 기기). 규칙 2곳(1글자 별칭 바인딩, 리비전 확인)을 일부러 깨면 해당 검사가 실패함을 확인 후 복구.
- 릴리스 APK: 인터넷 권한 없음, PC 연결·데모 생성기 클래스 없음(aapt2·dex 확인). 디버그 APK에만 PC 연결.
- 가상 휴대폰(이 PC)에서 앱 실행·한글 표시·시안 색 확인, PC Ollama(qwen2.5:7b) 실제 답 표시. 스크린샷 `qa/screenshots/sprint0/`.
- PC 시험(qwen2.5:7b): `qa/pc-runs/` 2회. **실기기 측정 아님.**

### 발견·수정
- 침묵한 철학자를 다음 자율 차례에 반복 호출 → 수정 + 회귀 검사
- 괄호 없는 `PASS`가 대화에 저장 → 수정 + 회귀 검사
- 한글이 단어 중간에서 줄바꿈 → `LineBreak.WordBreak.Phrase`
- 첫 PC 연결 요청이 시간 초과(모델 로딩 추정) → 앱이 '기기 안 AI 준비 안 됨'으로 정직하게 표시(데모 대체 없음). 두 번째 요청 정상.

### 미완료·한계
- 기기 안 AI(llama.cpp) 미구현 — 다운로드 승인 대기
- 실기기 측정 0건 — 휴대폰 대기
- 글꼴은 기기 기본 글꼴(시안 글꼴 다운로드 승인 대기), 초상은 이니셜 원
- 영구 저장·여러 방·멘션 UI·노트는 Sprint 1 이후
- qwen2.5:7b 품질: 하오체 불안정, 쇼펜하우어 사상 오기('낙관'), 2인 방에서 상대가 늘 침묵, 깨진 토큰 1회

### 커밋
636af01 착수 문서 · c9f5d92 엔진 뼈대 · df976ed PC 도구·버그 수정 · 8fe3fbc Android 뼈대 · b8e41a0 첫 실제 대화 (모두 main에 직접 푸시) · 이 인계는 브랜치 `claude/handoff-sprint0-day1` → PR

## 2026-10-14 · 세션 2 — 리뷰 반영 (claude.ai 클라우드 세션, Claude)

### 한 일
1. 저장소 리뷰에서 찾은 문제 4건 수정
   - **첫 화자가 늘 니체**: 앱이 관련도·직전 화자를 안 넘겨 동점 → 멤버 순서. `TopicDetector`(시안 detectIntent 키워드 화제 그대로) + 팩 `persona.topic_affinity`(시안 REL 순위 `(6-순위)/6`)로 관련도, 대화 기록의 마지막 철학자를 직전 화자로 — 엔진이 비어 있으면 채운다.
   - **쇼펜하우어가 거의 늘 침묵**: PASS 지시가 SYSTEM·USER 두 번 → 한 번, 좁은 조건으로. 이어 말하기 질문을 '앞사람 말을 듣고 당신의 관점으로'로.
   - **말투 붕괴**: 팩에 `persona.examples`(언어마다 최대 12개·160자) 추가, 니체·쇼펜하우어 예시 8개씩(앱이 만든 문장, 저작 인용 아님).
   - **스트리밍 미연결**: 엔진이 누적 부분 문장 `FlowEvent.Token`을 보냄(`[PASS]`·이름표가 될 수 있는 앞부분 보류, 규칙은 `ReplyText.kt`에서 완성본과 공유). 대화방에 시안 `ag-bub.streaming`(등불색 1.5px) + `ag-caret`(깜빡 커서) 말풍선.
2. 사장님 결정 기록: `docs/decisions/ADR-010-product-direction.md`(철학자 우선·평행자아 보류·피드는 디자인 승인 후).
3. Registry 계약(04)·CONTEXT·MEMORY·TODO·NEXT-ACTION 갱신.

### 검증
- 자동 검사 **52가지 중 52가지 통과**(기존 35 + 새 17). 환경: 클라우드 Linux, JDK 17, Android SDK 37.0, `./gradlew test`.
- 디버그·릴리스 APK 빌드 성공. 릴리스 APK: 인터넷 권한 없음, Ollama·데모 클래스 없음(aapt2·dexdump 확인).
- 모델 비교(클라우드 CPU, llama.cpp + Ollama 호환 중계, Qwen2.5-7B-Instruct Q4_K_M — **실기기 아님**, `qa/pc-runs/*cloudcpu*`):
  - 수정 전: 멘션 없는 5개 중 5개 니체가 첫 화자, 쇼펜하우어 6개 중 5개 침묵.
  - 수정 후(끝까지 돈 4개 기준): 첫 화자는 화제대로(일상·의미·음악 → 쇼펜하우어, 일·멘션 → 니체), 쇼펜하우어 침묵 4개 중 0개. 니체 하오체 비율 늘었지만 해요체로 흐르는 문장 아직 있음.
  - 남은 문제: 예시 문장을 그대로 베낌(01번), 긴 흐름에서 중국어 섞임·남의 대사 대신 쓰기(05번 — 수정 전 06번에도 있던 문제). 06·10번 실패는 클라우드 모델 서버가 내려간 탓.
- 독립 리뷰(다른 에이전트): **하지 않음** — 사장님이 시간 때문에 중단. 대신 작성자가 직접 점검.

### 발견·결정
- 사장님이 병합까지 승인(실기기 확인 없이). 실기기 확인은 기존대로 D2·D6 이후.

### 커밋
이 세션의 변경은 PR 하나로 squash 병합.
