# AIOP Active Plan

> 목적: 현재 실행할 단일 계획 파일.
> Claude는 이 파일을 갱신하고, Codex는 이 파일을 읽고 실행한다.
> 새 active plan 파일을 만들지 않는다.

---

## 1. Current Goal

`README.md`를 현재 코드 상태와 일치시킨다. (실제 코드 ↔ 문서 정합성 회복)

근거: `aiop-status.md` §11 우선순위 1번. KPT 회고 도메인, QuickAdd retro 통합, AddTodoModal, MoneyInputField, dataPortability 등 v1.2 이후 추가된 변경분이 README에 반영되지 않음.

---

## 2. Scope

### Include

- README의 라우트 / 화면 수 / 도메인 설명 / localStorage 키 / 프로젝트 구조 / QuickAdd 카테고리 / 로드맵 갱신
- 이미 구현된 항목이 "예정"으로 적힌 부분 정리
- archive로 옮겨진 노트 파일 링크 제거 (`aiop-next-steps.md` 등)
- 작성 톤 / 절 구성 / 헤딩 구조는 기존 README 형식 유지

### Exclude

- README 외 다른 파일 수정 (`AGENTS.md`, `aiop-status.md`, 소스 코드)
- README에 없던 신규 섹션 추가 (스크린샷, 배포 가이드, 기여 가이드 등)
- 라이선스 / 작성자 / 외부 링크 변경
- v2.0 백엔드 세부 사양 추가 (현재 README의 v2.0 절은 개략만 유지)
- 도메인 로직 / 알고리즘 설명 추가 (Streak 공식, Problem 키워드 추출 방식 등은 status.md에 둠)

---

## 3. Diff 대상 (코드 ↔ 현재 README 불일치 항목)

작업 전 Codex가 이 표를 기준으로 변경 위치를 식별한다.

| README 영역 | 현재 표기 | 실제 코드 | 처리 |
|---|---|---|---|
| 현재 상태 §1 | "8개 주요 화면" | 9개 도메인 + 10개 라우트 | "9개 화면 / 10개 라우트"로 수정, K.P.T 회고 1줄 추가 |
| 구현된 기능 | Dashboard ~ Todo 8개 도메인 | + K.P.T 회고 도메인 | `### K.P.T 회고 (Retros)` 절 추가 |
| 빠른 추가 (QuickAdd) | "5개 카테고리" (want / subscription / insight / regret / note) | 7개 (+ todo + retro) | 카테고리 수와 목록 갱신, `AppShell.handleAddedRetro` 동작 1줄 |
| 앞으로 구현될 기능 §v1.3 | "데이터 export / import (예정)" | `src/lib/dataPortability.ts` 구현됨 | 완료 표시로 이동, 절 자체 제거 또는 "완료" 명시 |
| 앞으로 구현될 기능 §v1.1~v1.2 | 3개 미진 항목 | 위젯 순서 / 정규화 등 작업 일부 진행 상태 재확인 | status §11와 정합 맞춰 v1.4 후보 항목으로 재배치 |
| 데이터 저장 방식 표 | 10개 키 | 11개 (`aiop:retros` 누락) | `aiop:retros` 행 추가 |
| 프로젝트 구조 트리 | inputs / retros / dataPortability / storageNormalizers / retros.ts / AddTodoModal / UpdateNoticeModal 누락 | 모두 존재 | 트리 갱신 |
| 로드맵 요약 | v1.1~v1.2 진행 중, v1.3 예정 | v1.3 완료 + K.P.T 회고(v1.4 후보) | "v1.3 완료 (데이터 export/import)", "v1.4 후보 — K.P.T 회고 도메인" 항목 추가 |
| 하단 참고 링크 | `[`.agent-notes/aiop-next-steps.md`]` | 해당 파일은 archive로 이동됨 | `AGENTS.md`만 남기거나 `aiop-status.md` 가리키도록 변경 |

---

## 4. Tasks

순서대로 진행. 각 task는 README의 특정 영역만 건드린다.

- [x] T1. **라우트 / 화면 수 갱신** — "현재 상태" 절의 "8개 주요 화면" 표현, 도입 문장, 화면 수 명시 부분 일괄 9개 / 10라우트로 정합
- [x] T2. **K.P.T 회고 도메인 절 추가** — "구현된 기능"에 `### K.P.T 회고 (Retros)` 절 신설 (`/retros`, `/retros/weekly`, K/P/T CRUD, Try↔Todo, 이월, Streak, 주간 롤업, 저장 키 `aiop:retros`)
- [x] T3. **QuickAdd 카테고리 갱신** — 5개 → 7개 (Todo, Retro 추가), `AppShell.handleAddedRetro`가 today 회고에 upsert 한다는 동작 한 줄
- [x] T4. **localStorage 키 표 갱신** — `aiop:retros` 행 추가, 표 하단 fallback 문구가 normalizer / export 도구를 포함하도록 미세 조정
- [x] T5. **프로젝트 구조 트리 갱신** — inputs / retros / lib 신규 파일 / AddTodoModal / UpdateNoticeModal / SearchContext / app/retros 전부 반영
- [x] T6. **"앞으로 구현될 기능" 절 재정렬** — v1.1~v1.2 마무리 / v1.3 / v1.x 보조 작업 절 삭제, `v1.4 후보` 단일 절로 통합. status §11 7개 항목 + 잔여 (Regret 라벨 / 위젯 순서 / 모달 추상화) 포함
- [x] T7. **로드맵 요약 표 갱신** — v1.1~v1.2 완료, v1.3 완료, v1.4 후보 행 추가, v2.0 설명 보강
- [x] T8. **하단 참고 링크 정리** — `aiop-next-steps.md` 제거, `AGENTS.md` + `aiop-status.md` + `aiop-plan.md` 3개로 변경
- [ ] T9. **사용자 검토** — diff를 사용자에게 보여주고 OK 받기 전 커밋 금지

---

## 5. Files Expected to Change

```txt
README.md
```

다른 파일은 건드리지 않는다. `aiop-status.md` / `aiop-plan.md` 갱신은 작업 완료 후 별도로 진행한다.

---

## 6. Verification

문서 변경만 있으므로 빌드/타입체크는 필수 아님. 단, README 내 코드 블록(```bash, ```text)의 문법 / 들여쓰기는 사람이 직접 검수.

```bash
git diff README.md          # 변경 범위 확인
```

체크 항목:

- [ ] 라우트 10개가 본문 어디에도 누락 없음
- [ ] `aiop:retros` 가 localStorage 표에 있음
- [ ] QuickAdd 카테고리 수가 본문과 일치 (7개)
- [ ] 프로젝트 구조 트리에 inputs / retros / 신규 lib 파일 포함
- [ ] "데이터 export / import"가 "예정"으로 적혀 있지 않음
- [ ] 하단 참고 링크에서 archive 파일을 가리키지 않음
- [ ] 문서가 모순된 화면 수 ("8개" / "9개")를 동시에 들고 있지 않음

---

## 7. Done Criteria

- [ ] README가 코드 / `aiop-status.md`와 모순되지 않음
- [ ] 사용자 검토 후 커밋 (`docs: update README to match current code` 형식 권장)
- [ ] 본 plan §4 모든 task 체크
- [ ] 작업 완료 후 `aiop-status.md` §11 1번 항목 처리 표시
- [ ] 완료된 plan 요약을 `aiop-archive.md`로 이전

---

## 8. Next Plan Placeholder

다음 작업이 정해지면 Claude가 아래 섹션을 교체한다. 다음 후보는 `aiop-status.md §11`의 2번 — **회고 항목 인라인 텍스트 편집**.

```md
## Current Goal

회고 항목 (Keep / Problem / Try)의 텍스트를 카드 안에서 바로 편집할 수 있게 한다.

## Scope

...

## Tasks

- [ ] ...

## Files Expected to Change

src/components/retros/RetroView.tsx
...

## Verification

npx tsc --noEmit
npm run lint
npm run build

## Done Criteria

...
```
