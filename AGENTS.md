# AGORA — 에이전트 공통 지침

이 파일이 모든 AI 코딩 에이전트(Claude Code, Codex 등)의 공통 규칙이다. 도구별 파일(CLAUDE.md 등)은 이 파일을 참조만 하고 규칙을 복제하지 않는다.

## 제품 한 줄
철학자 AI들과 자유롭게 이야기하는 메신저 + 하루에도 여러 개 쓰는 독립 노트. 토론 대회가 아니다.

## 소스 오브 트루스 (충돌 시 위가 이긴다)
1. `docs/source/AGORA_Integrated_Development_Directive_v1.0.md` 0~15장 (최근 확정: 기존 디자인 보존, Philosopher Registry)
2. 같은 문서 부록 = 설계서 v2.1 (`docs/source/AGORA_Integrated_Master_Blueprint_v2.1.md`)
3. 디자인 시안 `legacy-design-reference/AGORA_design_draft/` — **읽기 전용, 수정 금지**
4. 결정 기록 `docs/decisions/ADR-*.md`

> **리디자인 예외 (2026-10-15 사장님 결정):** [ADR-011](docs/decisions/ADR-011-redesign-structure.md)·[ADR-012](docs/decisions/ADR-012-user-materials.md)의 확정 결정과 [리디자인 차이 표](docs/design/REDESIGN-DIFF.md)의 ✅ 줄은 3번 시안, 그리고 2번 설계서의 화면 구조(탭, 노트와 피드 나눔 등)보다 우선한다. 🟡·↩︎ 줄은 승인 전까지 3번 시안이 기준이다.

## 절대 규칙
- **새 디자인 금지.** 색·글꼴·간격·컴포넌트는 `docs/sprint0/01_design_inventory.md`의 토큰 그대로. 바꿔야 하면 차이 표를 만들어 사용자 승인 후.
- **시연 문장을 실제 AI처럼 쓰지 않는다.** `DemoInferenceProvider`는 테스트 전용이며 릴리스 빌드에 포함하지 않는다. 모델이 없으면 '없다'고 표시한다.
- **노트 = note_id.** 날짜 유일 제약 금지. 댓글·감상평·예약은 note_id에 붙는다.
- **언어·테마 전환이 데이터를 바꾸거나 지우면 버그.** 원문은 작성 언어 그대로.
- **철학자별 if/else 금지.** 철학자 차이는 `resources/philosophers/<id>/pack.yaml`에만.
- **권한은 코드가 검사한다.** 조회 전에 `canRead(principal, resource, purpose)`. 프롬프트로 권한을 지키지 않는다.
- 사용자 UI 문구에 '일기' 금지(내부 레거시 이름 journal/entry는 새 코드에서 쓰지 않음).
- 초상 이미지·모델 가중치·라이선스 불명 자료를 저장소(공개)에 올리지 않는다.

## 승인 없이 하지 않는 일
디자인 변경, DB 파괴적 변경, 유료 클라우드 API 호출, 외부 가입·결제, 개인정보 업로드, main 병합·배포.

## 작업 절차
요구사항 ID 확인 → 변경 계획 → 영향받는 시안 화면 지정 → 구현 → 자동 테스트 → 독립 리뷰(다른 세션/에이전트) → 실기기 확인 → 차이 보고 → 사용자 승인 → 병합.
병렬 작업은 worktree + 별도 브랜치.

## 보고 양식 (단계마다)
1. 변경 파일·커밋 ID 2. 구현한/안 한 요구사항 ID 3. 시안 대비 바뀐 화면과 스크린샷 4. 테스트 명령·환경·PASS/FAIL 5. 실기기·모델·메모리·속도(잰 경우만) 6. 개인정보·권한·라이선스·비용 위험 7. 다음 단계와 승인 필요 사항

테스트하지 않은 것을 '완료'라고 쓰지 않는다. 실기기 없이 '실기기 검증 완료'라고 쓰지 않는다.

## 지도
- 시안 분석: `docs/sprint0/01_design_inventory.md`
- 시안 동작 규칙·옮기면 안 되는 것: `docs/sprint0/02_prototype_behavior_spec.md`
- 요구사항 점검표: `docs/sprint0/03_requirements_gap_checklist.md`
- Registry 계약: `docs/sprint0/04_philosopher_registry_contract.md`
- 착수 보고: `docs/sprint0/00_kickoff_report.md`
- 결정 기록: `docs/decisions/` (제품 방향 ADR-010, 리디자인 화면 구조 ADR-011, 나에 대해·같이 읽기 ADR-012)
- 리디자인 차이 표 — 앱으로 옮겨도 되는 것은 ✅ 줄만: `docs/design/REDESIGN-DIFF.md`
- 리디자인 캔버스 사본·써 보기 원본·점검 도구: `design/redesign/` — 시안 자료이지 앱 코드가 아니다. 예시 문장·예시 데이터는 옮기지 않는다
