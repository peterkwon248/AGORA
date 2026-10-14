# ADR-001 · Android 첫 릴리스와 앱 기술 스택

- 상태: **제안(Proposed)** — Sprint 0 스파이크 결과로 확정
- 날짜: 2026-10-14
- 관련: 지시서 5.1·5.2, 설계서 19장

## 맥락
- 첫 플랫폼은 Android. iOS·Windows는 나중이지만 도메인 로직이 UI에 묶이면 안 된다.
- 로컬 LLM을 기기에서 돌려야 한다(네이티브 런타임 연동 필요).
- 시안 '어스름'을 충실히 재현해야 한다(색·글꼴·한글 줄바꿈·애니메이션).

## 후보

| | A. Android Native Kotlin + Jetpack Compose (도메인은 KMP 호환 모듈로 분리) | B. Kotlin Multiplatform + Compose Multiplatform 처음부터 | C. Flutter / React Native |
|---|---|---|---|
| 로컬 LLM 연동 | JNI(llama.cpp) / LiteRT-LM Kotlin API 직접 | Android 쪽은 A와 같음, iOS용 별도 바인딩 필요 | 플러그인·브리지 한 겹 더 |
| 시안 재현 | Compose 성숙, 한글 줄바꿈(`WordBreak.Phrase`) 지원 | 대부분 같으나 일부 텍스트·접근성 API가 Android보다 늦음 | 가능하나 기존 Kotlin 생태계(WorkManager·Room) 이점 없음 |
| 백그라운드 예약 | WorkManager·AlarmManager 그대로 | expect/actual로 감싸야 함 | 플러그인 의존 |
| 나중 iOS | 도메인 모듈만 KMP로 올리면 재사용 | 처음부터 공유 | 공유 |
| Sprint 0 위험 | **가장 낮음** | 빌드 설정 복잡도 ↑ | 지시서 후보 밖, 근거 약함 |

## 제안 결정
**A안.** Android Native + Compose로 시작하되, `domain`·`orchestration`·`inference-api` 모듈은 **Android 의존성 없는 순수 Kotlin**으로 작성해 나중에 KMP로 옮길 수 있게 한다. Compose Multiplatform 전환은 iOS 착수 시점에 다시 판단(ADR 갱신).

## 모듈 구조(제안)
```
apps/android/            # Compose UI(시안 이식), DI, WorkManager, 알림
shared/domain/           # 엔터티·유스케이스·권한(canRead) — 순수 Kotlin
shared/orchestration/    # 발언자 선택·예산·취소 — 순수 Kotlin
shared/inference-api/    # InferenceProvider 계약 — 순수 Kotlin
shared/philosophers/     # Registry·팩 로더 — 순수 Kotlin
adapters/local-llm/      # llama.cpp JNI 또는 LiteRT-LM 어댑터 (ADR-002)
adapters/persistence/    # Room(SQLite) + 암호화, 마이그레이션
adapters/demo-inference/ # DemoInferenceProvider — 테스트 전용, 릴리스 빌드에서 제외
resources/philosophers/  # 팩 YAML
qa/                      # 평가셋·시각 회귀·기기 측정 로그
legacy-design-reference/ # 시안 원본(읽기 전용)
```
지시서 5.2의 논리 구조와 같고, 이름만 Gradle 관례에 맞췄다.

## 확정 전 확인할 것
- [ ] 이 PC에 JDK 17+·Android SDK·NDK·CMake 설치 후 빈 Compose 앱 디버그 빌드 성공
- [ ] 실기기 설치 실행
- [ ] 최소 지원 Android 버전: 로컬 LLM 런타임 요구사항 + 기기 RAM 실측 후 결정(가정으로 선언하지 않음)

## 결과
확정되면 '상태'를 Accepted로 바꾸고 빌드 명령·실측 근거를 덧붙인다.
