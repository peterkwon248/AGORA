# NEXT-ACTION — 다음 세션이 바로 할 일

> 마지막 갱신: 2026-10-15 · claude.ai 클라우드 세션(세션 3, 리디자인) · Claude — 이 PC에서는 먼저 `git pull`

## 지금 위치
Sprint 0 (게이트 G0 전). 계획 8단계 중 0-1~0-5 끝, 0-7은 화면까지(답은 아직 **개발 PC의 AI**), 0-6(기기 안 AI 실측)·0-8(시안 비교)은 대기.

디자인: 리디자인 캔버스 'AGORA 리디자인' v41의 결정이 저장소에 기록됐다 — [ADR-011](decisions/ADR-011-redesign-structure.md)(화면 구조), [ADR-012](decisions/ADR-012-user-materials.md)(나에 대해·같이 읽기), [차이 표](design/REDESIGN-DIFF.md), 캔버스 사본 `design/redesign/`. 세션 3은 앱 코드를 바꾸지 않았다. 앱 이식은 Sprint 0 게이트 뒤(차이 표 3장 순서).

## 다음 행동 (순서대로)

0. **`git pull` 후 PC 시험 재실행** — `./gradlew :tools:pc-harness:run`. 세션 2에서 바뀐 것: 첫 화자 선택(화제 관련도·직전 화자), PASS 지시 한 번, 팩 말투 예시, 스트리밍. 클라우드 비교 결과는 `qa/pc-runs/*cloudcpu-before*`·`*cloudcpu-after*`.
   - 클라우드 결과에서 남은 문제: ① 말투 예시를 **그대로 베끼는** 답이 나옴(니체 01번) → 요청마다 예시 일부만 돌려 넣기 또는 '예시와 같은 문장' 검사 ② 긴 흐름에서 **중국어가 섞이고 다른 사람 대사를 대신 씀**(05번, 수정 전에도 06번에서 발생) → 생성 후 검사(한자·이름표 줄에서 자르기)로 막기
1. **사장님 승인 받기 → 다운로드** (승인 전엔 받지 않는다)
   - llama.cpp 소스(github.com/ggml-org, 약 30MB)
   - Qwen3 1.7B GGUF Q4_K_M (Hugging Face Qwen 공식, 약 1.1GB) / Qwen3 4B (약 2.5GB)
   - Gothic A1 · Gowun Batang 글꼴(Google Fonts, OFL)
   - Gemma 4 E2B/E4B는 llama.cpp용 GGUF 존재 여부를 먼저 확인
   - 첫 단계: 사장님이 "다운로드해"라고 했는지 대화에서 확인. 없으면 위 표를 다시 보여 드리고 묻는다.
2. **`adapters/local-llm` 만들기** — llama.cpp를 NDK(29.0.14206865)·CMake(3.31.6)로 빌드, JNI로 `InferenceProvider` 구현(스트리밍·취소). 기존 계약 검사(`collectOutcome`, 취소 시 부분 문장 미저장)를 이 어댑터에도 적용.
3. **실기기 측정** — 사장님 휴대폰 연결(USB 디버깅) 후 ADR-002 3장 절차로 측정, `qa/device-logs/`에 기록.
   - ADR-012 때문에 측정 항목 하나 추가: **참고 글(자료 대목)을 붙였을 때 첫 토큰까지 시간** → '나에 대해'·'같이 읽기'에서 한 번에 몇 조각까지 붙일지 정한다.
4. **(디자인) 사장님 승인 받기 — D7·D8.** 답을 받으면 차이 표의 상태·날짜를 고친다. 이식은 Sprint 0 게이트 전에는 시작하지 않는다.

## 사장님 결정 대기
| 번호 | 내용 | 상태 |
|---|---|---|
| D1 | 개발 도구 설치 | ✅ 승인·설치 완료 |
| D2 | 시험용 Android 휴대폰 (기종·RAM, USB 디버깅) | ⏳ 대기 |
| D3 | 시안 기준 스크린샷 또는 'CSS 값 기준 OK' | ⏳ 대기 |
| D4 | 공개 저장소 유지 | ✅ 공개 유지 (정식 출시 때 비공개 전환은 사장님이 결정) |
| D5 | 카뮈·시오랑 초상 사용권 | ⏳ Sprint 2 전까지 |
| D6 | 모델·llama.cpp·글꼴 다운로드 | ⏳ 대기 (위 1번) |
| D7 | 리디자인 차이 표의 🟡·↩︎ 줄 — 설정 묶음, 내 프로필 항목, 새 대화의 분위기 단계, 답 순서, 방 정보 배치, 노트 상세, 피드 배치, 철학자 프로필 배치, 데스크톱, 처음 안내·모델·Plus, 색 값 | ⏳ 대기 — 추천: 색은 원래 '어스름' 값 |
| D8 | 채팅 홈 모양(A~E) 중 앱에 몇 개 남길지 | ⏳ 대기 — 추천: A·C 둘(많아도 셋) |

## 리디자인을 이어 할 때
- 기준: ADR-011·012와 차이 표. **앱으로 옮겨도 되는 것은 ✅ 줄뿐**이다(AGENTS.md '리디자인 예외').
- 써 보기 보드 원본은 `design/redesign/proto/`, 정지 설계도는 `design/redesign/canvas/project/`. 고친 뒤 `design/redesign/README.md`의 점검 명령을 모두 통과시키고 커밋한다(Python 3·Node 필요).
- 캔버스에 올리기는 Artifact 게시 도구가 있는 세션에서만 — claude.ai 세션에서는 됐고, 이 PC의 Claude Code에서 되는지는 확인 안 함. 올리기 전에 캔버스의 지금 파일을 읽어 사본과 비교한다.
- 써 보기의 철학자 답 문장·기억 후보·대목 고르기 규칙은 시안용이다. 앱 코드로 옮기지 않는다(시연 문장 금지).

## 시작 명령 (이 PC 기준)
```bash
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-17.0.20.101-hotspot"
export ANDROID_HOME="/c/Users/kwonkyunghun/AppData/Local/Android/Sdk"
./gradlew test                         # 검사 35가지
./gradlew :apps:android:assembleDebug  # 디버그 APK
./gradlew :tools:pc-harness:run        # PC Ollama로 니체·쇼펜하우어 시험 → qa/pc-runs/
"$ANDROID_HOME/emulator/emulator.exe" -avd agora_pixel -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect
```
가상 휴대폰에 한글 메시지 보내기(adb input은 한글 불가):
```bash
MSG=$(printf '%s' '오늘 커피가 유난히 맛있어.' | base64 -w0)
adb shell "am start -n app.agora/.MainActivity --es dev_send \"\$(echo $MSG | base64 -d)\""
```
다른 PC에서는 JDK 17·Android SDK(platforms 36·37, build-tools 36.1.0, NDK 29.0.14206865, CMake 3.31.6)를 먼저 설치해야 한다.
