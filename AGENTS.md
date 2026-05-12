# AIOP Agent Guide

> 목적: Claude가 계획을 작성하고, Codex가 그 계획을 실행할 때 사용하는 최소 공통 규칙.
> 이 파일은 길게 확장하지 않는다. 상세 상태와 실행 계획은 `.agent-notes/`를 본다.

---

## 1. 문서 역할

| 파일 | 역할 |
|---|---|
| `AGENTS.md` | 고정 작업 규칙. Claude / Codex 공통 기준 |
| `.agent-notes/aiop-status.md` | 현재 프로젝트 상태. 코드 구조, 도메인, localStorage, 미커밋 현황 |
| `.agent-notes/aiop-plan.md` | 현재 실행할 단일 계획. Claude가 작성하고 Codex가 실행 |
| `.agent-notes/aiop-archive.md` | 완료된 계획 / 과거 참고 기록 |

---

## 2. 반드시 먼저 읽을 문서

작업 시작 전 아래 순서로 읽는다.

```txt
1. AGENTS.md
2. .agent-notes/aiop-status.md
3. .agent-notes/aiop-plan.md
```

`aiop-archive.md`는 과거 맥락이 필요할 때만 읽는다.

---

## 3. 역할 분리

### Claude

- 코드 수정 전에 계획을 작성한다.
- 새 계획 파일을 만들지 않는다.
- 항상 `.agent-notes/aiop-plan.md`만 갱신한다.
- 계획에는 목표, 범위, 제외 범위, 수정 예상 파일, 작업 순서, 검증 방법을 포함한다.
- 코드 구현은 사용자가 명시하지 않으면 하지 않는다.

### Codex

- `AGENTS.md`, `aiop-status.md`, `aiop-plan.md`를 읽고 실행한다.
- 계획에 없는 대규모 리팩터링을 하지 않는다.
- 작업 후 수정 파일, 구현 요약, 검증 결과를 정리한다.
- 가능하면 `aiop-plan.md` 체크리스트를 갱신한다.
- 현재 상태가 바뀌면 `aiop-status.md`도 갱신한다.

---

## 4. 작업 원칙

- 기존 UI/UX를 임의로 갈아엎지 않는다.
- 한 번에 하나의 작업 단위만 처리한다.
- 작업 전 관련 파일을 먼저 확인한다.
- 타입, 파일 구조, 데이터 구조를 추측하지 않는다.
- 실제 코드와 문서가 다르면 실제 코드를 우선한다.
- `any` 사용을 피한다.
- `.env`, secret, key 파일은 출력하지 않는다.
- localStorage key는 임의로 변경하지 않는다.
- 백엔드 전환 전 기존 frontend-only 기능을 망가뜨리지 않는다.

---

## 5. AIOP 현재 방향

AIOP는 개인용 All-In-One Page 대시보드다.

현재 핵심 방향:

```txt
v1.x: frontend-only MVP + localStorage
v2.0: Supabase + Google OAuth + RSC/Server Actions + 환율 + AI Route Handler 기반 마련
v2.1+: AI 자동분류 / 오늘 할 일 추천 / 투자종목 추천 / 뉴스 추천
```

---

## 6. 고정 기술 기준

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- localStorage 기반 v1.x 데이터 유지
- v2.0 백엔드는 Supabase 기준
- DB 컬럼은 snake_case
- TypeScript 도메인 타입은 camelCase
- DB ↔ TS 변환은 mapper 계층에서 처리
- 삭제 정책은 hard delete
- 태그는 Postgres `text[]` + GIN index 기준

---

## 7. 검증 명령어

가능하면 작업 후 아래 순서로 실행한다.

```bash
npx tsc --noEmit
npm run lint
npm run build
```

개발 서버 확인이 필요한 경우:

```bash
npm run dev
```

실패한 명령이 있으면 성공한 것처럼 말하지 말고 실패 원인과 로그 요약을 남긴다.

---

## 8. 작업 완료 보고 형식

작업 완료 후 아래 형식으로 보고한다.

```md
## 수정 파일

- `src/...`

## 구현 내용

- ...

## 검증

```bash
npx tsc --noEmit
npm run lint
npm run build
```

결과:
- tsc: 통과 / 실패
- lint: 통과 / 실패
- build: 통과 / 실패

## 남은 작업

- ...
```

---

## 9. 문서 관리 규칙

- 새 active 계획 파일을 만들지 않는다.
- 현재 계획은 항상 `.agent-notes/aiop-plan.md`에만 둔다.
- 완료된 계획은 필요한 요약만 `.agent-notes/aiop-archive.md`로 옮긴다.
- 현재 상태 변경은 `.agent-notes/aiop-status.md`에 반영한다.
- `AGENTS.md`는 300줄 이하로 유지한다.
