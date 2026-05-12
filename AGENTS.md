# AIOP Agent Guide

> 대상: Claude Code / Codex CLI / 코드 작업 에이전트  
> 목적: 매 작업마다 먼저 확인해야 하는 현재 기준 문서  
> 상세 이력과 긴 구현 계획은 `.agent-notes/` 문서를 참고한다.

---

## 1. Project Summary

AIOP는 개인용 **All-In-One Page** 서비스다.

> 이 웹페이지 또는 앱 하나만 켜두면, 내가 필요한 기능이 모두 들어있는 개인 운영 대시보드

초기 타겟은 대중 사용자가 아니라 개인 사용자인 나 자신이다.

---

## 2. Current Status

현재 AIOP는 **frontend-only MVP 완료 후 v2.0 backend 전환 준비 단계**다.

완료된 범위:

- Wants, Calculator, Subscriptions, Notes, Insights, Regret, Dashboard 화면 구현
- Todo 화면 추가
- 주요 도메인 localStorage CRUD 구현
- Dashboard가 localStorage 데이터를 직접 읽어 갱신
- App Router 기반 라우트 분리
- QuickAddModal 구현
- 라이트 / 다크 토글
- compact view / BottomTabBar 구현
- Dashboard drag & drop 구현
- widget visibility toggle 구현
- Summary 카드 reorder 구현
- 데이터 export / import 구현
- localStorage schema guard 구현
- Header 검색 필터 구현

다음 목표:

- v2.0 Supabase backend
- Google OAuth
- 환율 API
- AI Route Handler
- v2.1+ AI 기능 확장

---

## 3. Tech Stack

현재:

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- localStorage
- React Context
- react-grid-layout
- @dnd-kit

v2.0 예정:

- Supabase
- PostgreSQL
- Google OAuth
- Server Actions
- Route Handlers
- Frankfurter 환율 API
- AI API

---

## 4. Current Domains

- Dashboard
- Wants
- Asset Calculator
- Subscriptions
- Notes / Inbox
- Book Insights
- Regret Tracker
- Todo
- Settings

---

## 5. Important Paths

```txt
src/app/
src/app/wants/
src/app/calculator/
src/app/regret/
src/app/subscriptions/
src/app/insights/
src/app/notes/
src/app/todos/
src/components/dashboard/
src/components/layout/
src/components/layout/grid/
src/components/layout/settings/
src/components/quick-add/
src/components/todos/
src/contexts/
src/hooks/
src/lib/
src/types/
```

중요 파일:

```txt
src/lib/storageNormalizers.ts
src/lib/dataPortability.ts
src/hooks/useDashboardLayout.ts
src/hooks/useEscapeKey.ts
src/types/layout.ts
```

---

## 6. Storage Keys

현재 localStorage key는 임의 변경하지 않는다.

```txt
aiop:wants
aiop:subscriptions
aiop:insights
aiop:notes
aiop:regret-items
aiop:todos
aiop:layout
aiop:hero-message
aiop-compact-mode
aiop-theme-mode
```

상세는 `.agent-notes/aiop-storage-schema.md` 참고.

---

## 7. Known Type Differences

과거 명세보다 현재 코드 기준을 우선한다.

- `WantItem.aiScore` 명세 → 실제 코드 `score`
- `Subscription.name` / `usageFrequency` 명세 → 실제 코드 `service` / `usage`
- `Insight.summary` / `relatedTarget` 명세 → 실제 코드 `keySentence` / `relatedGoal`
- `RegretItem`은 명세대로 `watchedPrice`, `currentPrice`, `quantity`, `resultPercent`, `profitAmount` 사용
- `TodoItem`: `id`, `title`, `status`, `priority`, `createdAt`, `dueDate?`

상세는 `.agent-notes/aiop-storage-schema.md` 참고.

---

## 8. v2.0 Decisions

- Data flow: RSC + Server Actions
- DB naming: snake_case
- TS naming: camelCase
- Mapping layer: mappers.ts
- Multi-currency: 환율 API 포함
- Base currency: KRW
- Tags: `text[]` + GIN index
- Delete policy: hard delete
- Routing: App Router route-based pages
- `?view=` SPA 패턴은 사용하지 않는다.

상세는 `.agent-notes/aiop-v20-decisions.md` 참고.

---

## 9. Work Rules

- 한 번에 전체를 고치지 않는다.
- 작은 단위로 작업한다.
- 작업 전 관련 파일을 먼저 확인한다.
- 기존 UI 톤을 유지한다.
- 기존 데이터 구조를 임의 변경하지 않는다.
- 변경이 필요한 경우 migration 또는 normalizer를 고려한다.
- 타입을 추측하지 않는다.
- `any` 사용을 피한다.
- 기존 localStorage fallback 동작을 깨지 않는다.
- 완료 후 수정 파일 목록과 테스트 방법을 남긴다.

---

## 10. Do Not

- 기존 화면 전체를 새 디자인으로 갈아엎지 않는다.
- 사용 중인 localStorage key를 임의로 변경하지 않는다.
- snake_case DB / camelCase TS 원칙을 깨지 않는다.
- 백엔드 작업 중 frontend-only 기능을 망가뜨리지 않는다.
- 타입명만 보고 실제 코드 구조를 단정하지 않는다.
- 과거 명세를 현재 코드보다 우선하지 않는다.
- 불필요하게 SWR을 도입하지 않는다.
- 불필요하게 API route를 남발하지 않는다.
- 인증, DB, AI, 환율 기능을 한 번에 모두 구현하지 않는다.

---

## 11. Implementation Priority

1. 기존 코드 상태 확인
2. v2.0 결정사항 확인
3. Supabase schema 설계
4. Google OAuth 연결
5. 기존 localStorage 데이터를 DB 구조로 매핑
6. 환율 API 연결
7. AI Route Handler 기반 기능 추가
8. Dashboard와 각 도메인 화면 점진적 DB 전환

---

## 12. Backend Migration Rule

- 기존 localStorage UX를 즉시 제거하지 않는다.
- Supabase 전환은 도메인별로 진행한다.
- 한 화면씩 Server Action으로 전환한다.
- Mapper로 DB snake_case와 TS camelCase를 분리한다.
- 기존 export/import 기능과 충돌하지 않게 한다.
- auth user 기준으로 데이터가 분리되어야 한다.

---

## 13. UI Rules

- 개인 운영 대시보드 느낌 유지
- 가계부처럼 보이지 않게 한다.
- 투자 앱처럼만 보이지 않게 한다.
- 카드형 레이아웃 유지
- hover / focus 상태 유지
- dark mode 깨짐 방지
- overflow 처리
- 긴 텍스트는 line-clamp 또는 truncate 처리
- modal, dropdown, sidebar z-index 충돌 확인

---

## 14. Validation Commands

작업 후 가능한 명령어:

```bash
npm run lint
npm run type-check
npm run build
```

스크립트가 없다면 `package.json`을 확인하고 가능한 검증 명령어만 실행한다.

개발 서버 확인:

```bash
npm run dev
```

---

## 15. Reference Docs

```txt
.agent-notes/aiop-history.md
.agent-notes/aiop-storage-schema.md
.agent-notes/aiop-v20-decisions.md
.agent-notes/aiop-v20-backend-plan.md
.agent-notes/aiop-next-steps-stage2.md
.agent-notes/aiop-frontend-mvp-archive.md
.agent-notes/aiop-prompts.md
.agent-notes/aiop-test-checklist.md
```

---

## 16. Agent Response Requirement

작업 완료 후 반드시 포함:

- 수정한 파일
- 구현한 내용
- 확인한 명령어
- 수동 테스트 방법
- 남은 리스크

확실하지 않은 내용은 단정하지 말고 명시한다.
