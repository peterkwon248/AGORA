# NEXT-ACTION — 다음 세션이 바로 할 일

> 마지막 갱신: 2026-10-14 10:32 · DESKTOP-JCJTAH8 (집/회사 미상 Windows PC) · Claude Code

## 지금 위치
Sprint 0 (게이트 G0 전). 계획 8단계 중 0-1~0-5 끝, 0-7은 화면까지(답은 아직 **개발 PC의 AI**), 0-6(기기 안 AI 실측)·0-8(시안 비교)은 대기.

## 다음 행동 (순서대로)

1. **사장님 승인 받기 → 다운로드** (승인 전엔 받지 않는다)
   - llama.cpp 소스(github.com/ggml-org, 약 30MB)
   - Qwen3 1.7B GGUF Q4_K_M (Hugging Face Qwen 공식, 약 1.1GB) / Qwen3 4B (약 2.5GB)
   - Gothic A1 · Gowun Batang 글꼴(Google Fonts, OFL)
   - Gemma 4 E2B/E4B는 llama.cpp용 GGUF 존재 여부를 먼저 확인
   - 첫 단계: 사장님이 "다운로드해"라고 했는지 대화에서 확인. 없으면 위 표를 다시 보여 드리고 묻는다.
2. **`adapters/local-llm` 만들기** — llama.cpp를 NDK(29.0.14206865)·CMake(3.31.6)로 빌드, JNI로 `InferenceProvider` 구현(스트리밍·취소). 기존 계약 검사(`collectOutcome`, 취소 시 부분 문장 미저장)를 이 어댑터에도 적용.
3. **실기기 측정** — 사장님 휴대폰 연결(USB 디버깅) 후 ADR-002 3장 절차로 측정, `qa/device-logs/`에 기록.

## 사장님 결정 대기
| 번호 | 내용 | 상태 |
|---|---|---|
| D1 | 개발 도구 설치 | ✅ 승인·설치 완료 |
| D2 | 시험용 Android 휴대폰 (기종·RAM, USB 디버깅) | ⏳ 대기 |
| D3 | 시안 기준 스크린샷 또는 'CSS 값 기준 OK' | ⏳ 대기 |
| D4 | 공개 저장소 유지 | ✅ 공개 유지 (정식 출시 때 비공개 전환은 사장님이 결정) |
| D5 | 카뮈·시오랑 초상 사용권 | ⏳ Sprint 2 전까지 |
| D6 | 모델·llama.cpp·글꼴 다운로드 | ⏳ 대기 (위 1번) |

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
