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
