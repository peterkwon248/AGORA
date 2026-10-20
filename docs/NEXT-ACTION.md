# NEXT-ACTION — 다음 세션이 바로 할 일

> 마지막 갱신: 2026-10-21 · KWONKYUNGHUN Claude Code(세션 7, 가벼운 말 예시) · Claude — 다른 기기에서는 먼저 `git pull`

## 지금 위치
Sprint 0 (게이트 G0 전). 계획 8단계 중 0-1~0-5 끝. **0-6·0-7: 사장님 Z Fold7에서 철학자가 기기 안 AI(llama.cpp)로 직접 답한다** — 첫 비교만 했고 정식 측정은 남음([기록](../qa/device-logs/20261018-zfold7-first-run.md)). 0-8(시안 비교)은 대기.

디자인: 리디자인 캔버스 'AGORA 리디자인' v41의 결정이 저장소에 기록됐다 — [ADR-011](decisions/ADR-011-redesign-structure.md)(화면 구조), [ADR-012](decisions/ADR-012-user-materials.md)(나에 대해·같이 읽기), [차이 표](design/REDESIGN-DIFF.md), 캔버스 사본 `design/redesign/`. 세션 3은 앱 코드를 바꾸지 않았다. 앱 이식은 Sprint 0 게이트 뒤(차이 표 3장 순서).

## 다음 행동 (순서대로)

0. ✅ **말투 두 번째 손질** (2026-10-20, 노트북 E2B — [기록](../qa/pc-runs/20261020-voice-pass2.md)): 맞장구 한 마디로 시작 60개 중 12 → 1, 니체 반말 → 0(팩 `ko_register: hao`), 앞사람 말 되풀이 → 0, 엉터리 어미 → 0, 쇼펜하우어 반박 18번 중 0 → 5. 시험 기록에 '검사가 손댄 답'도 남는다.
   - ✅ **가벼운 말 「덧없음」 줄이기** (2026-10-21, 노트북 E2B — [기록](../qa/pc-runs/20261021-light-examples.md)): 팩 `light_examples`(가벼운 말에만 쓰는 예시) + 가벼운 말 지시에서 금지 낱말 목록 빼기 → 쇼펜하우어 답 40개 중 덧없음 결 24 → 12. 깊은 대화는 그대로.
   - 남은 것: 아직 40개 중 12개가 「그 순간의 만족」류. 영어 판은 재지 않음. TODO '말투 남은 것'.
   - **답 언어 = 휴대폰 화면 언어**다(한국어로 써도 화면이 영어면 영어로 답함 — 가상 휴대폰에서 확인, 예전부터 그랬다). 사용자가 쓴 언어를 따라야 할지 사장님께 여쭐 것.
1. ✅ **다운로드 끝 (2026-10-17, 사장님 승인, KWONKYUNGHUN 기기)** — 저장소 밖 `C:\Users\kkh94\AgoraAssets\`에 있다(OneDrive 동기화·공개 저장소를 피함). 다른 기기에서는 아래 출처에서 다시 받는다.
   | 무엇 | 위치(AgoraAssets 아래) | 출처 · 확인 |
   |---|---|---|
   | llama.cpp 소스 | `llama.cpp/` (얕은 clone, 218MB) | github.com/ggml-org/llama.cpp · 커밋 `f74e2fa6` (2026-10-16) · MIT · `gemma4` 구조 지원 |
   | Qwen3 1.7B | `models/Qwen3-1.7B-Q8_0.gguf` (1.83GB) | Qwen/Qwen3-1.7B-GGUF · SHA-256 `061b54da…90cb1a` 공식값 일치 |
   | Qwen3 4B | `models/Qwen3-4B-Q4_K_M.gguf` (2.50GB) | Qwen/Qwen3-4B-GGUF · SHA-256 `7485fe6f…34fdf5` 공식값 일치 |
   | Gemma 4 E2B | `models/gemma-4-E2B_q4_0-it.gguf` (3.35GB, QAT Q4_0) | google/gemma-4-E2B-it-qat-q4_0-gguf · Apache-2.0 · SHA-256 `fa401b55…dec6634` 공식값 일치 · 사진용 mmproj는 안 받음 |
   | 글꼴 | `fonts/gothica1/` 9굵기, `fonts/gowunbatang/` 2굵기 + 각 OFL.txt | github.com/google/fonts `ofl/` |
   - **정정:** 문서에 'Qwen3 1.7B Q4_K_M 공식 약 1.1GB'라고 적혀 있었으나, Qwen 공식 저장소의 1.7B는 **Q8_0 하나뿐**이다. 휴대폰에서 Q8_0이 무거우면 llama.cpp `llama-quantize`로 Q4_K_M을 만들거나(원본 BF16에서 만드는 편이 낫다) 다른 배포처를 쓴다 — 고를 때 사장님께 묻는다.
   - **Gemma 4:** E2B는 받았다(2026-10-17, D6b). E4B(`google/gemma-4-E4B-it-qat-q4_0-gguf`, 5.15GB)는 휴대폰 램(D2)을 본 뒤 받을지 정한다. 다른 배포처(ggml-org·unsloth 등)에도 있다.
2. ✅ **`adapters/local-llm`** (2026-10-18) — llama.cpp(`third_party/llama.cpp` submodule, `f74e2fa6`)를 NDK·CMake로 빌드, JNI로 `LlamaCppProvider`(스트리밍·취소·마감 시간). 모델은 앱 내부 저장소 `files/models/`. 휴대폰에 모델이 있으면 디버그 앱도 기기 안 AI로 답하고 '개발용' 띠가 사라진다. arm64만 빌드(에뮬레이터용 x86_64는 아직).
   - ✅ **칩에 맞는 CPU 판 고르기** (2026-10-20): arm64는 llama.cpp CPU 판 7가지(`libggml-cpu-android_armv8.0_1`~`armv9.2_2`)를 APK에 넣고 시작할 때 칩에 맞는 가장 빠른 판을 읽는다(llama.cpp 공식 방식). SM8750이면 i8mm 판이 골라질 것 — **휴대폰에서 확인 전**. 릴리스 APK 61MB → 30MB(디버그 정보 떼기 고침). 가상 휴대폰(x86_64)은 그대로 한 판이고 바뀐 빌드로 답함을 확인.
   - 남은 것: 어댑터에 계약 검사(`collectOutcome`) 기기 시험.
3. **실기기 정식 측정** — 첫 비교는 끝(Gemma 4 E2B: 첫 글자 8~11초·초당 19토큰·한국어 자연스러움 / Qwen3 4B: 23~30초·영어 섞임 / Qwen3 1.7B: 문장 무너짐 — 한 문장 한 번씩이라 확정 아님). 이제 ADR-002 3장 절차(평가 문장 13개 × 한/영, 10분 연속, 취소 시간)로 재고 `qa/device-logs/`에 기록.
   - **E2B·E4B 평가 문장 비교 끝**([기록](../qa/device-logs/20261018-gemma-e2b-e4b-eval.md)): E4B가 말은 낫지만 첫 글자 2배 느림(23.6초)·메모리 6GB → 기본값 E2B 유지. 프롬프트 손질로 '캐묻기'는 해소, '가벼운 말에도 철학'은 노트북에서 손질함 — 가벼운 말 15개 중 9~10개 → 0~2개, 깊은 대화 유지([기록](../qa/pc-runs/20261018-light-talk-tuning.md)). **휴대폰 확인은 다음 실기기 측정 때.**
   - **첫 글자까지 시간 줄이기 — 화자별 앞부분 재사용(KV 캐시)** (2026-10-18, [가상 휴대폰 기록](../qa/device-logs/20261018-prompt-cache-emulator.md)): 가상 휴대폰에서 다시 읽는 입력 60% 줄고 첫 글자 가운데값 39.3→13.2초. **Z Fold7에서 확인·메모리 재기가 남음.**
   - **다음 휴대폰 측정 때 할 일(순서대로, 사장님은 잠금 해제·충전기만):**
     1. 새 APK 설치 → `adb logcat -s AGORA-llama:I`의 `backend ready` 줄에 `MATMUL_INT8 = 1`(i8mm 판)이 보이는지. 안 보이면 `loading CPU backends from` 줄의 폴더를 본다.
     2. 첫 글자까지 시간을 10-18 기록과 비교([첫 실행](../qa/device-logs/20261018-zfold7-first-run.md)) — i8mm 판 효과.
     3. 스레드 수 비교: `--ei dev_threads 4`, `6`, `8`로 같은 문장(다시 빌드 필요 없음).
     4. `--ez dev_eval true`로 평가 문장 — 말투 손질이 휴대폰에서도 같은지, 화자별 재사용 메모리.
   - **가상 휴대폰**(노트북 에뮬레이터 `agora_x86`, WHPX 가속)에서 디버그 앱이 기기 안 AI로 돈다 — 맞는지 확인은 휴대폰 없이 여기서. 켜기: `emulator -avd agora_x86 -no-window -no-audio -gpu swiftshader_indirect`, 모델은 `adb -s emulator-5554`로 같은 방법으로 넣는다.
   - **품질 손질은 노트북에서**: llama.cpp b11706 Windows 판(`C:/Users/kkh94/AgoraAssets/llama-bin-b11706`, 공식 SHA-256 확인)으로 `llama-server` → `./gradlew :tools:pc-harness:run --args="llama-server <이름>"`. 휴대폰은 속도 확인 때만, 사장님이 안 쓰실 때(예: 밤 충전 중).
   - 휴대폰: 사장님 Galaxy Z Fold7(SM8750·12GB). USB 디버깅 켜짐, 이 노트북을 '항상 허용'. 화면 잠금 상태에서는 앱이 안 뜬다 → 측정 때 잠금 해제 부탁.
   - ADR-012 때문에 측정 항목 하나 추가: **참고 글(자료 대목)을 붙였을 때 첫 토큰까지 시간** → '나에 대해'·'같이 읽기'에서 한 번에 몇 조각까지 붙일지 정한다.
4. **(디자인) 사장님 승인 받기 — D7·D8.** 답을 받으면 차이 표의 상태·날짜를 고친다. 이식은 Sprint 0 게이트 전에는 시작하지 않는다.

## 사장님 결정 대기
| 번호 | 내용 | 상태 |
|---|---|---|
| D1 | 개발 도구 설치 | ✅ 승인·설치 완료 |
| D2 | 시험용 Android 휴대폰 (기종·RAM, USB 디버깅) | ✅ 사장님 Galaxy Z Fold7 (SM8750, 12GB, Android 16) — 2026-10-18 연결 |
| D3 | 시안 기준 스크린샷 또는 'CSS 값 기준 OK' | ⏳ 대기 |
| D4 | 공개 저장소 유지 | ✅ 공개 유지 (정식 출시 때 비공개 전환은 사장님이 결정) |
| D5 | 카뮈·시오랑 초상 사용권 | ⏳ Sprint 2 전까지 |
| D6 | 모델·llama.cpp·글꼴 다운로드 | ✅ 2026-10-17 받음 (위 1번) |
| D6b | Gemma 4 GGUF도 받을지 | ✅ E2B 받음 (2026-10-17) · E4B는 D2(휴대폰 램) 뒤에 |
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
./gradlew test                         # 검사 91가지
./gradlew :apps:android:assembleDebug  # 디버그 APK
./gradlew :tools:pc-harness:run        # PC Ollama로 니체·쇼펜하우어 시험 → qa/pc-runs/
git submodule update --init --depth 1 third_party/llama.cpp   # 새로 clone했으면 먼저 (기기 안 AI 소스)
"$ANDROID_HOME/emulator/emulator.exe" -avd agora_pixel -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect
```
실제 휴대폰에서 기기 안 AI 시험 — 모델 넣기·고르기·로그 보기는 [첫 실행 기록](../qa/device-logs/20261018-zfold7-first-run.md) '다시 하는 법'.

가상 휴대폰에 한글 메시지 보내기(adb input은 한글 불가):
```bash
MSG=$(printf '%s' '오늘 커피가 유난히 맛있어.' | base64 -w0)
adb shell "am start -n app.agora/.MainActivity --es dev_send \"\$(echo $MSG | base64 -d)\""
```
다른 PC에서는 JDK 17·Android SDK(platforms 36·37, build-tools 36.1.0, NDK 29.0.14206865, CMake 3.31.6)를 먼저 설치해야 한다.
