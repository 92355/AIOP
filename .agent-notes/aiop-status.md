# AIOP Status

> 목적: 현재 프로젝트 상태 단일 기준 문서.
> Claude / Codex는 작업 전 이 문서를 읽고, 문서와 실제 코드가 다르면 실제 코드를 우선한다.
> 작성 기준: 2026-05-12, branch `main`.

---

## 1. 한눈에 요약

- 버전: **v2.0** (Supabase + Google OAuth + RSC/Server Actions 전환 완료)
- 상태: 9개 도메인 모두 Supabase DB 연동 완료
- 데이터: **Supabase Postgres** (RLS 적용)
- 인증: **Google OAuth** (Supabase Auth)
- 백엔드: **Supabase** + Next.js Server Actions
- 외부 API: 없음 (exchange_rates 미구현)
- 자동 테스트: 없음 (수동 QA만)
- 다음 큰 목표: exchange_rates 캐시 + localStorage export/import → Supabase import 도구, v2.1 AI 기능

---

## 2. 라우트 (Next.js App Router)

```txt
/                 Dashboard
/wants            구매 목표
/calculator       자산 구매 계산기
/regret           그때 살걸 기록장
/subscriptions    구독 관리
/insights         인사이트 보관함
/notes            노트 / 인박스
/todos            Todo
/retros           K.P.T 회고
/retros/weekly    주간 회고 롤업
```

`src/app/layout.tsx` → `AppShell`(클라이언트 컴포넌트)이 공통 셸로 감싼다.

---

## 3. 디렉토리 구조 (요지)

```txt
src/
├── app/
│   ├── wants/actions.ts          # Server Actions (Supabase CRUD)
│   ├── subscriptions/actions.ts
│   ├── insights/actions.ts
│   ├── notes/actions.ts
│   ├── regret/actions.ts
│   ├── todos/actions.ts
│   ├── retros/actions.ts
│   ├── search/actions.ts         # searchDomains (전 도메인 Promise.all + searchAllDomains)
│   └── settings/actions.ts       # getDashboardLayout / saveDashboardLayout / resetDashboardLayout
├── components/
│   ├── dashboard/                # Hero, SummaryCards, WantPreview, AssetSnapshot,
│   │                             # SubscriptionSummary, RecentInsights, TodoSummary
│   ├── layout/
│   │   ├── AppShell.tsx          # 테마/컴팩트/레이아웃 Provider + QuickAdd wiring (Server Actions)
│   │   ├── SearchResultsDropdown.tsx  # 300ms debounce + searchDomains Server Action
│   │   ├── grid/                 # DashboardGrid, WidgetFrame, defaultLayout
│   │   └── settings/             # HeaderSettingsButton, SidebarSettingsButton, SettingsMenu
│   ├── inputs/                   # MoneyInputField (공통 금액 입력)
│   ├── quick-add/                # QuickAddModal
│   ├── wants/ subscriptions/ insights/ notes/ todos/ retros/ regret/
├── contexts/                     # CompactModeContext, LayoutContext, SearchContext
├── hooks/
│   ├── useLocalStorage.ts        # 테마/컴팩트 UI 설정 전용으로 범위 축소
│   └── useDashboardLayout.ts     # useState + useEffect + getDashboardLayout/saveDashboardLayout
├── lib/
│   ├── supabase/                 # server.ts, client.ts (@supabase/ssr)
│   ├── db/mappers.ts             # snake_case DB ↔ camelCase TS 변환
│   ├── globalSearch.ts           # searchAllDomains(data: SearchData, query, maxPerDomain)
│   ├── calculations.ts formatters.ts labels.ts retros.ts storageNormalizers.ts
│   └── dataPortability.ts        # ⏸ export/import 미전환 (localStorage 기반 유지)
├── types/                        # index.ts (도메인), layout.ts (위젯/카드)
└── data/mockData.ts              # 초기 / fallback (현재 미사용)
```

---

## 4. 도메인 상태

| 도메인 | CRUD | 저장소 | 검색 | 대시보드 위젯 | 비고 |
|---|---:|---|---:|---|---|
| Dashboard layout | - | **Supabase** `user_settings` | - | 위젯 7개 | useDashboardLayout → DB upsert |
| Wants | ✅ | **Supabase** `wants` | ✅ | `want-preview`, `asset-snapshot` | |
| Calculator | - | - | - | - | 계산 전용 (저장 없음) |
| Regret | ✅ | **Supabase** `regret_items` | - | - | |
| Subscriptions | ✅ | **Supabase** `subscriptions` | ✅ | `subscription-summary` | |
| Insights | ✅ | **Supabase** `insights` | ✅ | `recent-insights` | |
| Notes | ✅ | **Supabase** `notes` | ✅ | - | |
| Todos | ✅ | **Supabase** `todos` | ✅ | `todo-summary` | |
| Retros | ✅ | **Supabase** `retros` | ✅ | - | UNIQUE(user_id, date) upsert |

---

## 5. 기술 스택

| 영역 | 사용 |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript 5.7 + Tailwind 3.4 |
| Icons | `lucide-react` |
| Dashboard grid | `react-grid-layout` 2.2.3 (Responsive) |
| Summary card reorder | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Backend / DB | Supabase (Postgres + Auth + RLS) |
| Auth | Google OAuth (Supabase Auth) |
| 데이터 접근 | Next.js Server Actions (`'use server'`) |
| Persistence (UI) | `window.localStorage` — 테마/컴팩트 2개 키만 유지 |
| External API | 없음 |
| Test | 없음 |

---

## 6. localStorage 잔존 키 (UI 설정 2개만)

도메인 데이터는 전부 Supabase로 이전. 아래 2개는 per-device UI 설정으로 유지.

| Key | Value | 위치 |
|---|---|---|
| `aiop-compact-mode` | `boolean` | `CompactModeContext` |
| `aiop-theme-mode` | `"light" \| "dark"` | `AppShell.tsx` |

> `dataPortability.ts`의 export/import는 아직 localStorage 기반 그대로 유지 (⏸ 미전환).

---

## 7. Supabase 스키마 (테이블 목록)

| 테이블 | PK | 주요 컬럼 |
|---|---|---|
| `wants` | `id` (uuid) | `user_id`, `name`, `price`, `expected_yield`, ... |
| `subscriptions` | `id` (uuid) | `user_id`, `service`, `monthly_price`, `status`, ... |
| `insights` | `id` (uuid) | `user_id`, `title`, `key_sentence`, `tags` (text[]), ... |
| `notes` | `id` (uuid) | `user_id`, `title`, `body`, `tags` (text[]), `status`, ... |
| `regret_items` | `id` (uuid) | `user_id`, `name`, `watched_price`, `current_price`, ... |
| `todos` | `id` (uuid) | `user_id`, `title`, `status`, `priority`, `memo`, ... |
| `retros` | `id` (uuid) | `user_id`, `date` (text), `keep`/`problem`/`try` (jsonb) — UNIQUE(user_id, date) |
| `user_settings` | `user_id` (uuid) | `dashboard_layout` (jsonb) — UNIQUE(user_id) |

모든 테이블 RLS 활성화. `user_id = auth.uid()` 조건.

---

## 8. Server Actions 패턴

```txt
src/app/<domain>/actions.ts
  'use server'
  getAuthenticatedUser() → { supabase, userId }
  get<Domain>()         → DB select → mapper → TS type[]
  create<Domain>(item)  → DB insert → mapper → TS type
  update<Domain>*(id, ...) → DB update
  delete<Domain>(id)    → DB delete
```

- **page.tsx**: async RSC → Server Action 호출 → `initialItems` prop 전달
- **View.tsx**: `useState(initialItems)` + 핸들러에서 Server Action 호출
- **Dashboard 위젯**: `useEffect` + Server Action (RSC 불가 클라이언트 컴포넌트)
- **globalSearch**: `searchAllDomains(data: SearchData, query, maxPerDomain)` — 순수 함수
- **검색 드롭다운**: `useEffect` + 300ms debounce + `searchDomains` Server Action
- **레이아웃 저장**: `saveDashboardLayout` fire-and-forget (로컬 상태 즉시 반영)
- **Retros upsert**: `saveRetro` — UNIQUE(user_id, date) 기준 upsert

---

## 9. K.P.T 회고 기능

### 화면
- `/retros` 오늘 회고 + 과거 회고 목록 + Streak + 이월 안내
- `/retros/weekly` 주간 롤업 (월~일) — `useEffect + getRetros()`

### 통합 기능
| 기능 | 위치 | 상태 |
|---|---|---|
| K/P/T 항목 추가/삭제 | `RetroView.tsx` | ✅ |
| Try 체크박스 토글 | `RetroView.tsx` + `updateTodoStatus` | ✅ |
| Try ↔ Todo 양방향 연동 | `saveRetro` + `updateTodoStatus` | ✅ |
| 어제 미완료 Try 이월 | `findPreviousRetro` + `carryOverTryItems` | ✅ |
| 연속 작성 Streak | `calculateStreak`, `getWeekProgress` | ✅ |
| 주간 롤업 | `WeeklyRollupView.tsx` + `buildWeeklyRollup` | ✅ |
| Problem 키워드 Top 3 | `extractProblemKeywords` | ✅ |
| QuickAdd retro | `AppShell.tsx` → `addRetroItem` Server Action | ✅ |

---

## 10. v2.0 진행 현황

```txt
✅  1. Supabase 프로젝트 생성 + 환경변수
✅  2. Postgres 스키마 + RLS (도메인 8개 + user_settings)
✅  3. Google OAuth 설정
✅  4. @supabase/ssr 서버/클라이언트 세팅
✅  5. DB ↔ TS mappers (src/lib/db/mappers.ts)
✅  6. Wants 도메인 RSC + Server Action 전환
✅  7. 나머지 도메인 전환 (Subscriptions, Insights, Regret, Notes, Todos, Retros)
✅  8. Dashboard 위젯 DB 전환 (SummaryCards, TodoSummary, RecentInsights, AssetSnapshot)
✅  9. AppShell QuickAdd → Server Actions
✅ 10. Dashboard layout → user_settings DB 저장
✅ 11. WeeklyRollupView → getRetros()
✅ 12. 전역 검색 → searchDomains Server Action (300ms debounce)
⏸ 13. localStorage export JSON → Supabase import 도구 (미전환)
⬜ 14. exchange_rates 캐시 테이블 + Cron
⬜ 15. 서버 기반 export
⬜ 16. v2.1+ AI Route Handler
```

---

## 11. 현재 우선순위

v2.0 핵심 DB 전환 완료. 남은 항목:

- **단기**: exchange_rates 캐시 + Frankfurter API 연동 (통화 환산 실데이터)
- **중기**: localStorage → Supabase 데이터 이전 도구 (`dataPortability.ts` 전환)
- **장기**: v2.1 AI 기능 (입력 자동분류 → 오늘의 할일 추천 → 투자종목 추천)

---

## 12. 주의사항

- `dataPortability.ts`는 아직 localStorage 기반. export/import 기능은 현재 사용 불가 상태로 간주.
- `aiop-compact-mode`, `aiop-theme-mode` 2개 키는 의도적으로 localStorage 유지 (per-device UI 설정).
- `globalSearch.ts`의 `searchAllDomains`는 더 이상 `window.localStorage`를 읽지 않음. `SearchData` 객체를 인자로 받는 순수 함수로 변경됨.
- `useDashboardLayout`은 초기값이 `defaultDashboardLayout`이고, mount 후 DB에서 로드해 덮어씀 — 짧은 레이아웃 플래시 발생 가능.
- Retros는 `UNIQUE(user_id, date)` 기준 upsert. `saveRetro` 호출 시 date 값이 정확해야 함.
- 라우트는 이미 App Router 구조. `?view=` / `popstate` 흔적이 보이면 잔재이므로 제거 대상.
