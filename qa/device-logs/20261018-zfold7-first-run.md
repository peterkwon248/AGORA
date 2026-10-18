# 실기기 첫 실행 — Galaxy Z Fold7, llama.cpp 기기 안 AI (2026-10-18)

> **실기기 측정 맞음**(개발 PC 연결 아님 — 화면의 '개발용' 띠가 사라진 상태). 다만 **한 문장 × 한 번씩**이라 품질·속도를 확정하는 자료가 아니다. ADR-002 3장의 정식 측정(평가 문장 13개 × 한/영, 10분 연속, 취소 시간)은 아직이다.

## 기기 (ADR-002 3장 '준비' 1)
| 항목 | 값 |
|---|---|
| 모델 | Samsung Galaxy Z Fold7 (SM-F966N) |
| 칩 | Qualcomm SM8750 (Snapdragon 8 Elite), 8코어, arm64-v8a |
| RAM | 12GB (커널이 보는 값 11.1GB) — 측정 때 다른 앱 때문에 여유 0.6~3GB |
| Android | 16 (SDK 36), One UI 8.5 |
| 남은 저장공간 | 118GB |

## 빌드
- llama.cpp `f74e2fa6` (third_party/llama.cpp submodule), NDK 29.0.14206865, CMake 3.31.6
- CPU 전용, `armv8.2-a+dotprod+fp16`, OpenMP 끔, 스레드 6, 문맥 4096
- 모델은 **메모리에 통째로 읽기**(mmap 끔). mmap일 때 입력 873토큰에 **82초**(메모리 부족으로 매핑 페이지가 밀려남) → 끄고 **23초**
- 템플릿: 모델 고유 jinja, Qwen3 생각 단계 끔. 사용자 문장은 특수 토큰으로 해석하지 않음

## 결과 — 입력 "요즘 하루하루가 똑같이 반복되는 느낌이에요." (니체·쇼펜하우어 방)
| 모델 | 파일 | 읽기 | 입력 처리 (토큰/초) | 첫 글자까지 | 쓰기 (토큰/초) | 앱 메모리(PSS) | 답 (사람 판정) |
|---|---|---|---|---|---|---|---|
| **Gemma 4 E2B** QAT Q4_0 | 3.35GB | 6.1초 | 762토큰 8.1초 (**94**) | **8~11초** | 약 **19** | 4.1GB | 자연스러움. 니체 하오체("무엇을 느끼고 있소?"), 쇼펜하우어 해요체("…순환이지요."), 니체를 받아 말함 |
| Qwen3 4B Q4_K_M | 2.50GB | 5.3~14초 | 873토큰 23~27초 (32~37) | 23~30초 | 7~11 | 3.6GB | 영어 섞임("내면의 something"), 쇼펜하우어가 합니다체로 앵무새처럼 받음 |
| Qwen3 1.7B Q8_0 | 1.83GB | 11.6초 | 873토큰 13.9초 (63) | 14초 | 약 18 | 2.8GB | 문장이 무너짐("하오. 반복하는 느낌은 끝나는 일이오. 그런데 지금은 끝나는 것 같은 느낌이에요.") |

- 배터리 온도: 30.3℃(시작 전) → 37.1℃(세 모델 연속 후). 충전 중이라 배터리 소모는 재지 않음
- 모델을 바꾸면 진행 중 생성이 다음 토큰에서 멈춤(status=2 기록) — 취소 경로가 실제로 일한다. 멈추기까지 시간은 따로 재지 않음
- 화면: [Gemma 4 E2B](20261018-zfold7/gemma-4-E2B.png) · [Qwen3 4B](20261018-zfold7/qwen3-4B.png) · [Qwen3 1.7B](20261018-zfold7/qwen3-1.7B.png)

## 판단 (임시)
- 앱 기본 모델을 **Gemma 4 E2B**로 임시 지정(`LocalModels.DEFAULT_ORDER`). 확정은 정식 측정 뒤 ADR-002에서.
- 입력 처리가 첫 글자까지 시간의 대부분이다. 다음 손볼 곳: ① 같은 화자 앞부분 캐시 재사용 ② i8mm 등 이 칩이 가진 명령어를 실행 중에 골라 쓰기 ③ 스레드 수 비교(4·6·8).

## 다시 하는 법
```bash
# 모델 넣기 (앱 내부 저장소 — Android/data에 push하면 앱에서 안 보인다)
adb shell "cat /sdcard/Download/<모델>.gguf | run-as app.agora sh -c 'cat > files/models/<모델>.gguf'"
# 모델 고르고 한글 메시지 보내기
MSG=$(printf '%s' '요즘 하루하루가 똑같이 반복되는 느낌이에요.' | base64 -w0)
adb shell "am start -n app.agora/.MainActivity --es dev_model gemma-4-E2B_q4_0-it.gguf --es dev_send \"\$(echo $MSG | base64 -d)\""
adb logcat -s AGORA-llama:I    # 'generate status=… prompt=…ms first=…ms' 줄
```
