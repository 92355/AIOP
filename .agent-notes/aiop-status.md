# AIOP Status

> 목적: 현재 프로젝트 상태 단일 기준 문서.
> Claude / Codex는 작업 전 이 문서를 읽고, 문서와 실제 코드가 다르면 실제 코드를 우선한다.
> 작성 기준: 2026-05-13, branch `main`.

---

## 1. 한눈에 요약

- 앱 성격: 개인용 All-In-One Page 대시보드
- 현재 버전: `package.json` 기준 **0.2.1.1**
- 현재 단계: **v2.1 진행 상태** (성능 개선 일부 + 환율 캐시/API 추가)
- 인증: Supabase Auth + Google OAuth
- DB: Supabase Postgres + RLS
- 데이터 접근: Next.js App Router + RSC + Server Actions
- UI 설정 일부: localStorage 유지
- 외부 API: Frankfurter v2 API (서버 Route Handler에서만 호출)
- 자동 테스트: 별도 테스트 없음
- 배포 URL: `https://aiop-alpha.vercel.app`로 문서에 기록되어 있음

---

## 2. 현재 라우트

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
/login            로그인
/auth/callback    Supabase OAuth callback
```

라우트 그룹:

```txt
src/app/
  layout.tsx
  (app)/layout.tsx
  (app)/page.tsx
  (app)/wants/page.tsx
  (app)/calculator/page.tsx
  (app)/regret/page.tsx
  (app)/subscriptions/page.tsx
  (app)/insights/page.tsx
  (app)/notes/page.tsx
  (app)/todos/page.tsx
  (app)/retros/page.tsx
  (app)/retros/weekly/page.tsx
  (auth)/login/page.tsx
  (auth)/auth/callback/route.ts
```

- `(app)` 그룹은 `AppShell`로 감싼다.
- `(auth)` 그룹은 `AppShell` 없이 렌더링한다.
- `middleware.ts`에서 미인증 사용자를 `/login`으로 redirect한다.
- 인증된 사용자가 `/login`에 접근하면 `/`로 redirect한다.

---

## 3. 주요 디렉토리 구조

```txt
src/
  middleware.ts
  app/
    (app)/                  # 인증 필요 페이지
    (auth)/                 # 로그인 / OAuth callback
    wants/actions.ts
    subscriptions/actions.ts
    insights/actions.ts
    notes/actions.ts
    regret/actions.ts
    todos/actions.ts
    retros/actions.ts
    search/actions.ts
    settings/actions.ts
  components/
    dashboard/
    calculator/
    wants/
    subscriptions/
    insights/
    notes/
    regret/
    todos/
    retros/
    quick-add/
    layout/
      AppShell.tsx
      Header.tsx
      Sidebar.tsx
      BottomTabBar.tsx
      SearchResultsDropdown.tsx
      grid/
      settings/
  contexts/
    CompactModeContext.tsx
    LayoutContext.tsx
    SearchContext.tsx
  hooks/
    useDashboardLayout.ts
    useEscapeKey.ts
    useIsMobile.ts
    useLocalStorage.ts
  lib/
    db/mappers.ts
    supabase/client.ts
    supabase/server.ts
    globalSearch.ts
    dashboardOptimistic.ts
    dataPortability.ts
    storage.ts
    storageNormalizers.ts
    calculations.ts
    formatters.ts
    labels.ts
    retros.ts
  types/
    index.ts
    layout.ts
  data/
    mockData.ts
supabase/
  schema.sql
```

---

## 4. 기술 스택

| 영역 | 현재 사용 |
|---|---|
| Framework | Next.js 15 App Router |
| UI | React 19, TypeScript 5.7, Tailwind CSS 3.4 |
| Icons | `lucide-react` |
| Dashboard Grid | `react-grid-layout` |
| Drag / Sort | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Backend | Supabase |
| Auth | Supabase Auth + Google OAuth |
| DB | Supabase Postgres |
| SSR/Auth helper | `@supabase/ssr` |
| 테스트 | 자동 테스트 없음 |

---

## 5. Supabase 테이블 상태

`supabase/schema.sql` 기준:

| 테이블 | 용도 | 현재 코드 사용 |
|---|---|---:|
| `profiles` | Google OAuth 사용자 정보 캐시 | 제한적 / 직접 UI 사용 여부 미확인 |
| `wants` | 구매 목표 | ✅ |
| `subscriptions` | 구독 관리 | ✅ |
| `insights` | 인사이트 | ✅ |
| `notes` | 노트 | ✅ |
| `todos` | 할 일 | ✅ |
| `retros` | K.P.T 회고 | ✅ |
| `regret_items` | 그때 살걸 기록 | ✅ |
| `dashboard_layouts` | 대시보드 위젯 레이아웃 | ✅ |
| `user_settings` | 테마 / 컴팩트 / hero 설정용 스키마 | ⚠️ 현재 UI 설정은 localStorage 사용 |
| `exchange_rates` | 환율 캐시 | ✅ |

주의:

- `settings/actions.ts`는 `dashboard_layouts.layout`을 사용한다.
- `user_settings.dashboard_layout` 컬럼은 현재 스키마와 코드에 없다.
- `exchange_rates`는 `base_currency`, `quote_currency`, `rate_date`, `provider` 조합을 unique key로 사용한다.
- 모든 개인 데이터 테이블은 RLS를 켜고 `auth.uid() = user_id` 정책을 둔다.
- `retros`는 `UNIQUE (user_id, date)` 기준으로 날짜별 1행 구조다.
- `insights.tags`, `notes.tags`는 `text[]` + GIN index 구조다.

---

## 6. 도메인별 구현 상태

| 도메인 | 페이지 | Server Action | 저장소 | 검색 | 대시보드 |
|---|---|---|---|---:|---:|
| Dashboard | `/` | `settings/actions.ts` | Supabase + localStorage 일부 | - | ✅ |
| Wants | `/wants` | `wants/actions.ts` | Supabase `wants` | ✅ | ✅ |
| Calculator | `/calculator` | 없음 | 저장 없음 | - | - |
| Regret | `/regret` | `regret/actions.ts` | Supabase `regret_items` | - | QuickAdd만 |
| Subscriptions | `/subscriptions` | `subscriptions/actions.ts` | Supabase `subscriptions` | ✅ | ✅ |
| Insights | `/insights` | `insights/actions.ts` | Supabase `insights` | ✅ | ✅ |
| Notes | `/notes` | `notes/actions.ts` | Supabase `notes` | ✅ | QuickAdd optimistic |
| Todos | `/todos` | `todos/actions.ts` | Supabase `todos` | ✅ | ✅ |
| Retros | `/retros`, `/retros/weekly` | `retros/actions.ts` | Supabase `retros` | ✅ | QuickAdd |

---

## 7. 데이터 흐름

기본 패턴:

```txt
page.tsx (RSC)
  → Server Action 또는 Supabase server client 호출
  → mapper로 DB snake_case를 TS camelCase로 변환
  → Client View에 initialItems 전달
  → Client View에서 useState(initialItems)
  → 생성/수정/삭제 시 Server Action 호출
```

대시보드:

```txt
src/app/(app)/page.tsx
  → Supabase에서 wants/subscriptions/insights/notes/todos를 Promise.all로 조회
  → mapper 변환
  → DashboardGrid initialData 전달
```

QuickAdd:

```txt
AppShell
  → QuickAddModal
  → 도메인별 Add Modal
  → Server Action 호출
  → 일부 도메인은 dashboard optimistic event 적용
  → router.refresh()
```

대시보드 레이아웃:

```txt
src/app/(app)/layout.tsx
  → getDashboardLayout()
  → AppShell initialLayout 전달
  → LayoutProvider / useDashboardLayout 초기값으로 사용
  → dashboard_layouts.layout 조회
  → 클라이언트 상태에 반영
  → saveDashboardLayout() upsert
```

환율:

```txt
ExchangeRatePanel
  → useExchangeRate()
  → GET /api/exchange-rates?base=USD&quote=KRW
  → exchange_rates 캐시 조회
  → 12시간 이내 캐시가 있으면 캐시 반환
  → 없거나 refresh=1이면 Frankfurter v2 API 호출
  → exchange_rates upsert 후 반환
```

---

## 8. 검색 상태

현재 전역 검색:

```txt
Header.tsx
  → Dashboard 경로(`/`)에서만 SearchResultsDropdown 표시
  → searchDomains(query, 3)
  → wants/subscriptions/insights/notes/todos/retros 조회
  → searchAllDomains(data, query, maxPerDomain)
```

검색 대상:

| 도메인 | 검색 필드 |
|---|---|
| Wants | `name`, `reason`, `category`, `status`, `priority` |
| Subscriptions | `service`, `category` |
| Insights | `title`, `keySentence`, `actionItem`, `relatedGoal`, `tags` |
| Notes | `title`, `body`, `tags` |
| Todos | `title`, `memo` |
| Retros | `date`, `keep/problem/try.text` |

현재 제외:

- Calculator
- Regret

---

## 9. localStorage 상태

현재 코드에서 직접 쓰는 키:

| Key | 용도 | 위치 |
|---|---|---|
| `aiop-theme-mode` | 다크 / 라이트 모드 | `AppShell.tsx` |
| `aiop-compact-mode` | 컴팩트 모드 | `CompactModeContext.tsx` |
| `aiop-update-notice-v1` | 업데이트 안내 모달 닫힘 여부 | `AppShell.tsx` |

레거시 / 미전환:

- `dataPortability.ts`는 v1 localStorage export/import 키를 여전히 다룬다.
- `storage.ts`의 `prependLocalStorageItem`은 남아 있으나 현재 주요 저장 흐름에서는 Supabase Server Action이 우선이다.
- `dataPortability.ts`는 Supabase DB import/export로 전환되지 않았다.

---

## 10. K.P.T 회고 상태

| 기능 | 상태 |
|---|---:|
| 일일 K/P/T 작성 | ✅ |
| 날짜별 회고 저장 | ✅ |
| `UNIQUE(user_id, date)` 기반 upsert | ✅ |
| Try 항목 Todo 연동 | ✅ |
| Todo 상태 변경과 Try done 동기화 | ✅ |
| 어제 미완료 Try 이월 | ✅ |
| Streak / 주간 진행률 | ✅ |
| `/retros/weekly` 주간 롤업 | ✅ |
| QuickAdd retro | ✅ |

---

## 11. 대시보드 상태

위젯:

```txt
hero
summary-cards
want-preview
asset-snapshot
subscription-summary
recent-insights
todo-summary
```

레이아웃:

- 넓은 화면: `react-grid-layout` 기반 위치 / 크기 조정
- 모바일 / 컴팩트: 단순 세로 스택
- 편집 모드: 설정 메뉴에서 위젯 숨김, 순서 변경, 리셋 가능
- 저장 위치: Supabase `dashboard_layouts.layout`
- 초기값: `defaultDashboardLayout`

v2.1 성능 개선:

- `(app)/layout.tsx`에서 `dashboard_layouts.layout`을 서버에서 먼저 조회해 `AppShell`에 전달한다.
- `useDashboardLayout`은 서버에서 받은 초기 레이아웃이 있으면 mount 직후 중복 조회를 생략한다.
- `TodoSummary`는 `router.refresh()`로 갱신된 `initialTodos`를 다시 로컬 상태에 반영한다.

주의:

- 레이아웃 저장은 여전히 클라이언트에서 `saveDashboardLayout()`을 호출한다.
- QuickAdd 후 일부 도메인은 optimistic event와 `router.refresh()`를 함께 사용한다.

---

## 12. 환율 캐시 / API 상태

현재 구현:

| 항목 | 상태 |
|---|---:|
| `exchange_rates` 테이블 스키마 | ✅ |
| RLS policy | ✅ |
| `GET /api/exchange-rates` | ✅ |
| Frankfurter v2 단일 환율 API 연동 | ✅ |
| 12시간 캐시 TTL | ✅ |
| stale cache fallback | ✅ |
| `/calculator` USD/KRW 패널 | ✅ |

API:

```txt
GET /api/exchange-rates?base=USD&quote=KRW
GET /api/exchange-rates?base=USD&quote=KRW&refresh=1
```

응답 요지:

```txt
base, quote, rate, rateDate, fetchedAt, provider, source
```

주의:

- 현재 지원 통화쌍은 코드 타입 기준 `KRW`, `USD`다.
- 운영 DB에는 `supabase/schema.sql`의 `exchange_rates` 추가분을 적용해야 한다.
- Frankfurter API는 브라우저가 아니라 Next.js Route Handler에서 호출한다.
- 미인증 사용자는 401을 반환한다.

---

## 13. 현재 계획서 상태

`.agent-notes/aiop-plan.md`는 **v2.1 데이터 로딩 / 페이지 이동 성능 진단 및 개선 + 환율 캐시/API 연동** 계획이다.

AI 기능은 v2.2 후보로 미뤘다.

남아 있는 문서 작업:

- v2.1 완료 후 `aiop-archive.md` 이동 여부 결정
- 실제 Supabase 운영 DB migration 적용 여부 기록

---

## 14. 검증 명령어

`package.json` 기준 사용 가능한 스크립트:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

프로젝트 공통 검증:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

주의:

- `package.json`에는 `test` 스크립트가 없다.
- `npm run lint`는 `next lint`를 실행한다.

---

## 15. 알려진 주의사항

- `dataPortability.ts`는 Supabase 전환 이후 현재 데이터 구조와 맞지 않는 레거시 export/import일 수 있다.
- `user_settings` 테이블은 스키마에 있으나 현재 테마/컴팩트 모드는 localStorage 기반이다.
- `dashboard_layouts`와 `user_settings`의 역할이 문서에서 섞이지 않도록 주의한다.
- Regret 도메인은 전역 검색 대상에서 제외되어 있다.
- Dashboard RSC는 `wants/subscriptions/insights/notes/todos`만 직접 조회한다. `regret_items`, `retros`는 현재 대시보드 초기 데이터에 포함되지 않는다.
- 환율 테이블은 스키마에 추가됐지만 실제 Supabase 프로젝트에는 별도 SQL 적용이 필요하다.
- `mockData.ts`는 초기 / fallback 성격으로 남아 있으나 현재 주요 데이터 흐름은 Supabase다.
- 환경 변수와 secret은 문서에 기록하지 않는다.

---

## 16. 다음 후보 작업

- Supabase 운영 DB에 `exchange_rates` SQL 적용
- 환율 기능 수동 QA
- 모바일 UI/UX QA 및 overflow 수정
- `dataPortability.ts`를 Supabase 기반 export/import로 재설계하거나 제거 여부 결정
- Regret 전역 검색 포함 여부 결정
- Wants / Regret에 환율 환산 표시 확장
- v2.2 AI 자동분류 / 추천 기능
