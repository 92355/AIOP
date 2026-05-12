# AIOP Active Plan

> 목적: 현재 실행할 단일 계획 파일.
> Claude는 이 파일을 갱신하고, Codex는 이 파일을 읽고 실행한다.
> 새 active plan 파일을 만들지 않는다.

---

## 1. Current Goal

문서 운영 구조를 단순화하고, Claude → Codex 작업 흐름을 고정한다.

```txt
Claude: 계획 작성
Codex: 계획 실행
AGENTS.md: 고정 규칙
aiop-status.md: 현재 상태
aiop-plan.md: 현재 실행 계획
aiop-archive.md: 과거 기록
```

---

## 2. Scope

### Include

- `AGENTS.md` 기준으로 작업 규칙 정리
- `.agent-notes/aiop-status.md` 기준으로 현재 상태 확인
- `.agent-notes/aiop-plan.md` 기준으로 한 번에 하나의 작업 실행
- 작업 후 체크리스트 갱신
- 필요한 경우 `aiop-status.md` 갱신

### Exclude

- 새 active plan md 생성
- 기존 UI 대규모 변경
- 백엔드 임의 도입
- Supabase 설정값 추측
- `.env` 또는 secret 출력

---

## 3. Recommended Workflow

### Step 1 — Claude 계획 작성

Claude에게 요청:

```txt
AGENTS.md와 .agent-notes/aiop-status.md를 읽고,
이번 작업 계획을 .agent-notes/aiop-plan.md 하나로 작성해줘.

새 계획 파일을 만들지 말고 기존 aiop-plan.md를 갱신해.
Codex가 바로 실행할 수 있게 작업 범위, 수정 예상 파일, 단계별 체크리스트, 검증 방법을 명확히 써줘.

코드는 수정하지 말고 계획만 작성해.
```

### Step 2 — 사용자 검토

확인할 것:

```txt
[ ] 목표가 한 문장으로 명확한가?
[ ] 이번 작업에 포함/제외 범위가 명확한가?
[ ] 수정 예상 파일이 적혀 있는가?
[ ] 검증 명령어가 적혀 있는가?
[ ] 너무 큰 작업을 한 번에 시키지 않는가?
```

### Step 3 — Codex 실행

Codex에게 요청:

```txt
AGENTS.md, .agent-notes/aiop-status.md, .agent-notes/aiop-plan.md를 읽고
aiop-plan.md의 Tasks 순서대로 구현해줘.

계획에 없는 대규모 리팩터링은 하지 마.
작업 후 다음을 알려줘.

1. 수정한 파일 목록
2. 구현 내용 요약
3. 실행한 검증 명령어
4. 실패한 검증이 있다면 원인
5. aiop-plan.md 체크리스트 갱신 결과
```

### Step 4 — 작업 후 정리

```txt
[ ] aiop-plan.md의 Tasks 체크 여부 갱신
[ ] 현재 상태가 바뀌었으면 aiop-status.md 갱신
[ ] 완료된 상세 계획은 필요한 요약만 aiop-archive.md로 이동
[ ] 새 active plan 파일이 생겼다면 삭제 또는 archive로 이동
```

---

## 4. Tasks

현재 문서 구조 적용 작업:

- [ ] 프로젝트 루트에 `AGENTS.md` 배치
- [ ] `.agent-notes/aiop-status.md` 배치
- [ ] `.agent-notes/aiop-plan.md` 배치
- [ ] `.agent-notes/aiop-archive.md` 배치
- [ ] 기존 중복 계획 md를 archive 또는 삭제 대상으로 분류
- [ ] Claude에게는 `aiop-plan.md`만 갱신하도록 안내
- [ ] Codex에게는 `AGENTS.md + aiop-status.md + aiop-plan.md`만 읽고 실행하도록 안내

---

## 5. Files Expected to Change

```txt
AGENTS.md
.agent-notes/aiop-status.md
.agent-notes/aiop-plan.md
.agent-notes/aiop-archive.md
```

작업 종류에 따라 이후 별도 계획에서 `src/**` 파일을 명시한다.

---

## 6. Verification

문서 정리만 하는 경우:

```bash
ls
ls .agent-notes
```

코드 변경이 포함되는 경우:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## 7. Done Criteria

- [ ] 활성 문서가 4개로 정리됨
- [ ] `AGENTS.md`가 300줄 이하로 유지됨
- [ ] `aiop-plan.md`가 단일 실행 계획 파일 역할을 함
- [ ] Claude / Codex 역할이 문서에 명확히 구분됨
- [ ] 과거 문서는 `aiop-archive.md`로 통합됨
- [ ] Codex가 어떤 파일을 먼저 읽어야 하는지 명확함

---

## 8. Next Plan Placeholder

다음 작업이 정해지면 Claude가 아래 섹션을 교체한다.

```md
## Current Goal

...

## Scope

...

## Tasks

- [ ] ...

## Files Expected to Change

...

## Verification

...

## Done Criteria

...
```
