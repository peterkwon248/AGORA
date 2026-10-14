# CONTEXT — 지금 코드가 어떻게 생겼나

## 제품
철학자 AI들과 자유롭게 이야기하는 Android 메신저 + 하루 여러 개의 독립 노트. 기준 문서는 `docs/source/`(지시서 v1.0, 설계서 v2.1), 시각 기준은 `legacy-design-reference/`(시안 '어스름'). 에이전트 규칙은 `AGENTS.md`.

## 모듈
| 모듈 | 종류 | 내용 |
|---|---|---|
| `core:inference-api` | 순수 Kotlin | `InferenceProvider` 계약, `GenerateEvent`, `collectOutcome`(완성만 저장), `UnavailableInferenceProvider` |
| `core:philosophers` | 순수 Kotlin | 팩 스키마(`PhilosopherPack`), 검증(대비·ID·필수값), `PhilosopherRegistry`(suggest/bindTyped/legacy/비활성) |
| `core:orchestration` | 순수 Kotlin | `SpeakerSelector`(시안 planTurns 규칙), `PromptComposer`(팩 → 프롬프트, PASS 침묵), `ConversationEngine`(한 흐름 실행·리비전 확인·손님 퇴장) |
| `adapters:demo-inference` | 테스트 전용 | `DemoInferenceProvider`(providerType=DEMO) |
| `adapters:ollama-dev` | 개발 전용 | PC Ollama 연결(HttpURLConnection) |
| `tools:pc-harness` | 개발 도구 | 평가 문장 6개를 니체·쇼펜하우어 방에 돌려 `qa/pc-runs/*.md` |
| `tools/design-port/str2xml.mjs` | 스크립트 | 시안 STR → `design_strings.xml`(ko/en, `d_` 접두어) |
| `apps:android` | Android 앱 | `AgoraTheme`(시안 토큰), `RoomScreen`, `RoomViewModel`, 디버그/릴리스별 `DevProviders` |

데이터: `resources/philosophers/<id>/pack.yaml` → 앱 assets로 번들.

## 구현된 것 / 안 된 것
- ✅ 생성 계약, 등록부, 조율 규칙, PC 실제 생성, 가상 휴대폰 대화방 1개(메모리 안에서만)
- ❌ 기기 안 AI(llama.cpp), 영구 저장, 여러 방·개인톡, 멘션 UI, 노트·댓글, 예약·선제 연락, 설정·온보딩, 시안 글꼴·초상

## 실행
`docs/NEXT-ACTION.md`의 '시작 명령'. 환경 의존: JDK 17, Android SDK(36·37, build-tools 36.1.0, NDK 29.0.14206865, CMake 3.31.6), PC 시험엔 Ollama + `qwen2.5:7b`.

## 문서 지도
`docs/sprint0/00_kickoff_report.md`(착수 보고) · `01` 시안 분석 · `02` 시안 동작 명세 · `03` 요구사항 점검표 · `04` Registry 계약 · `docs/decisions/ADR-*`
