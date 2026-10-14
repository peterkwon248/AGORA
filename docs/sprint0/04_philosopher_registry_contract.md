# 04 · Philosopher Registry 데이터 계약 (schema_version 1, 초안)

> 원칙(지시서 4장): **새 철학자 추가 = 검증된 데이터 팩 등록.** 채팅·노트·댓글·멘션·예약 기능 코드는 수정하지 않는다. 모델은 하나를 공유하고, 런타임에 `philosopher_id`로 팩을 읽는다.

## 1. 구성 요소

| 이름 | 책임 | 하지 않는 일 |
|---|---|---|
| `PhilosopherRegistry` | 팩 로드·스키마 검증·ID/별칭 검색·활성 상태·로케일별 표시 정보 | 대화 생성, 사용자 기록 접근 |
| `PersonaPack` (팩 안 `persona`) | 말투·말투 수준·성향·금지 습관·DM 인사 | 권한 판단 |
| `KnowledgePack` (팩 안 `knowledge`) | 핵심 개념·저작·**권리 상태**·인용 정책 | 다른 방·개인톡 기록 읽기 |
| `PhilosopherEngine` | 공통 생성: 팩 + 허가된 문맥 → `InferenceProvider` 요청 | 철학자별 `if/else` |
| `ConversationOrchestrator` | 방별 발언자 선택·멘션 우선·예산·취소 | 팩 내용 해석 |

## 2. 팩 파일 위치와 형식
`resources/philosophers/<id>/pack.yaml` (+ 초상은 `assets/`, 사용권 확인 후). 앱 빌드 시 assets로 묶고, 나중에는 다운로드 팩으로 확장 가능.

## 3. 필드

| 경로 | 필수 | 설명 |
|---|---|---|
| `schema_version` | ✔ | 계약 버전. 로더가 지원하지 않으면 팩을 비활성 처리하고 이유를 기록 |
| `id` | ✔ | 영구 ID. 소문자·밑줄(`marcus_aurelius`). **바꾸지 않는다** |
| `legacy_ids` | | 시안 단축 ID(`ni`) → 마이그레이션 표 전용 |
| `pack_version` | ✔ | 팩 내용 버전(semver). 생성 메시지에 기록해 추적 |
| `status` | ✔ | `active` / `beta` / `disabled`. disabled면 목록·멘션·새 방·예약 대상에서 빠지고 **기존 기록은 그대로 보임** |
| `order` | | 목록 순서 |
| `display.name` · `full_name` · `years` · `one_line` · `ideas` · `style_summary` | ✔ (ko·en) | 화면 표시용. 시안 원문 그대로 |
| `display.colors.light/dark.hue/hue_soft` | ✔ | 이름·초상 링·옅은 배경. **대비 4.5:1 검사**를 로더 테스트에서 수행 |
| `display.portrait_asset_id` | | 없으면 이니셜 아바타(기존 `ag-me-av` 문법 재사용) |
| `aliases.ko/en` | ✔ | 멘션 검색. **1글자 별칭은 자동완성 목록 검색에만 쓰고, 직접 입력 자동 바인딩은 2글자 이상만** |
| `persona.speech_level.ko/en` | ✔ | 한국어 말투 수준(하오체·해요체 등) |
| `persona.dm_greeting.ko/en` | | 개인톡 첫 인사(시안 `dmHello`). 이건 **고정 문구로 써도 되는 유일한 대사** — 'AI 생성'이 아님을 내부에 표시 |
| `persona.conversation_traits[]` · `avoid[]` | ✔ | 프롬프트 지침. `avoid`는 설계서 10.1의 '고정관념 금지' |
| `persona.ask_question_tendency` · `default_length_profile` · `debate_affinity` | | 조율기가 참고하는 성향값(low/medium/high) |
| `persona.topic_affinity` | | 화제별 관련도 0~1. 키는 `music/meaning/work/daily/greet/thanks/change/soften/private/open`. 첫 발언자 순위의 **보조 신호**. 초기 6명은 시안 `03_engine.js` REL 순위를 `(6-순위)/6`으로 옮긴 값을 쓴다 |
| `persona.examples.ko/en[]` | | 말투 예시(언어마다 최대 12개, 160자). 화면에 안 보이고 프롬프트에만 들어간다. **이 앱이 만든 문장**이어야 하며 저작 인용을 넣지 않는다 |
| `relations[]` | | 다른 철학자와의 실제 사상적 관계. 대상 ID가 없거나 비활성이면 무시 |
| `knowledge.core_concepts[]` | ✔ | 화제 관련도 계산·프롬프트 |
| `knowledge.sources[].rights` | ✔ | `public_domain` / `licensed` / `in_copyright` |
| `knowledge.quote_policy` | ✔ | `verified_public_domain_only`(원전 인용 가능, 자체 번역만) / `paraphrase_only`(카뮈·시오랑: 인용 금지, 요약·의역만) |
| `assets.portrait.rights_status` | ✔ | 확인 전이면 **출시 빌드에 포함 금지**, 이니셜 아바타로 대체 |
| `locales` | ✔ | 실제 평가를 통과한 언어만 |

## 4. 로더 규칙
1. 스키마 검증 실패 → 그 팩만 비활성, 앱은 계속 동작, 원인 로그.
2. ID 중복 → 둘 다 거부.
3. 별칭 충돌(두 철학자가 같은 별칭) → 자동 바인딩하지 않고 사용자에게 선택 요청(MEN 구현 규칙).
4. 팩은 **사용자 데이터를 읽을 수 없다.** 문맥은 언제나 권한 검사를 통과한 것만 `PhilosopherEngine`이 넣는다.

## 5. 초기 팩
- `nietzsche` — [pack.yaml](../../resources/philosophers/nietzsche/pack.yaml)
- `schopenhauer` — [pack.yaml](../../resources/philosophers/schopenhauer/pack.yaml)
- 다음(Sprint 2): `camus`(paraphrase_only, 초상 사용권 확인 필요), `cioran`(같음), `socrates`, `marcus_aurelius`

## 6. 확장 검증 테스트 (지시서 4.4)
테스트 전용 `test_philosopher` 팩을 등록하고 다음이 **기능 코드 변경 없이** 통과해야 한다:
개인톡 열기 · 새 방 멤버 선택 · `@` 자동완성(ko/en 별칭) · 임시 초대 · 내 노트 댓글 · 사유 노트 작성 · 선제 연락 대상 · 한/영 표시 · `disabled` 전환 시 목록·멘션에서 빠지고 과거 기록은 유지.
