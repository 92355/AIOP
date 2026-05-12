# AIOP Status

> 목적: 현재 프로젝트 상태 단일 기준 문서.
> Claude / Codex는 작업 전 이 문서를 읽고, 문서와 실제 코드가 다르면 실제 코드를 우선한다.
> 작성 기준: 2026-05-12, branch `main`, working tree dirty.

---

## 1. 한눈에 요약

- 버전: v1.3 + K.P.T 회고 반영 완료 (v1.4 후보 진입)
- 상태: frontend-only MVP, 9개 도메인 모두 동작
- 데이터: 브라우저 `localStorage` 영속화
- 백엔드: 없음
- 인증: 없음
- 외부 API: 없음
- 자동 테스트: 없음 (수동 QA만)
- working tree: dirty (`src/components/wants/WantsView.tsx`, `.agent-notes/*`, `tsconfig.tsbuildinfo` 변경 중)
- Supabase 프로젝트: 아직 생성 안 됨 (v2.0 1단계 미착수)
- 다음 큰 목표: v2.0 Supabase + Google OAuth + RSC/Server Actions

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
├── app/                        # 10개 라우트 + globals.css + layout.tsx
├── components/
│   ├── dashboard/              # Hero, SummaryCards, WantPreview, AssetSnapshot,
│   │                           # SubscriptionSummary, RecentInsights, TodoSummary
│   ├── layout/
│   │   ├── AppShell.tsx        # 테마/컴팩트/레이아웃 Provider + QuickAdd wiring
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomTabBar.tsx    # 컴팩트뷰 전용
│   │   ├── UpdateNoticeModal.tsx
│   │   ├── navItems.ts
│   │   ├── grid/               # DashboardGrid, WidgetFrame, defaultLayout
│   │   └── settings/           # HeaderSettingsButton, SidebarSettingsButton, SettingsMenu
│   ├── inputs/                 # MoneyInputField (공통 금액 입력)
│   ├── quick-add/              # QuickAddModal
│   ├── wants/                  # WantsView, WantCard, AddWantModal
│   ├── calculator/             # AssetCalculatorView
│   ├── regret/                 # RegretTrackerView, RegretCard, AddRegretItemModal
│   ├── subscriptions/          # SubscriptionsView, SubscriptionCard, AddSubscriptionModal
│   ├── insights/               # BookInsightsView, InsightCard, AddInsightModal
│   ├── notes/                  # NotesInboxView, AddNoteModal
│   ├── todos/                  # TodoView, AddTodoModal
│   └── retros/                 # RetroView, WeeklyRollupView, AddRetroModal
├── contexts/                   # CompactModeContext, LayoutContext, SearchContext
├── hooks/                      # useLocalStorage, useDashboardLayout, useEscapeKey
├── lib/                        # calculations, formatters, labels, storage,
│                               # storageNormalizers, dataPortability, retros
├── types/                      # index.ts (도메인), layout.ts (위젯/카드)
└── data/mockData.ts            # 초기 / fallback mock data
```

---

## 4. 도메인 상태

| 도메인 | CRUD | localStorage | 검색 | 대시보드 위젯 | 비고 |
|---|---:|---|---:|---|---|
| Dashboard | - | `aiop:layout`, `aiop:hero-message` | - | 위젯 7개 | 드래그/리사이즈/visibility |
| Wants | ✅ | `aiop:wants` | ✅ | `want-preview`, `asset-snapshot` | 구매 목표, 카테고리 필터 AND 검색 |
| Calculator | - | - | - | - | 계산 전용 (저장 없음) |
| Regret | ✅ | `aiop:regret-items` | - | - | 후회 기록, KRW/USD |
| Subscriptions | ✅ | `aiop:subscriptions` | ✅ | `subscription-summary` | keep/review/cancel |
| Insights | ✅ | `aiop:insights` | ✅ | `recent-insights` | book/video/article/thought |
| Notes | ✅ | `aiop:notes` | ✅ | - | inbox → processed → archived |
| Todos | ✅ | `aiop:todos` | ✅ | `todo-summary` | todo → doing → done |
| Retros | ✅ | `aiop:retros` | ✅ | - | K.P.T, Try↔Todo, 이월, Streak, 주간 |

---

## 5. 기술 스택

| 영역 | 사용 |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript 5.7 + Tailwind 3.4 |
| Icons | `lucide-react` |
| Dashboard grid | `react-grid-layout` 2.2.3 (Responsive) |
| Summary card reorder | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Persistence | `window.localStorage` + custom `useLocalStorage` (same-tab event 포함) |
| Backend / Auth | 없음 |
| External API | 없음 |
| Test | 없음 |

---

## 6. localStorage 키 (전체 11개)

`src/lib/dataPortability.ts` 가 단일 출처.

| Key | Value | Normalizer |
|---|---|---|
| `aiop:wants` | `WantItem[]` | `normalizeWants` |
| `aiop:subscriptions` | `Subscription[]` | `normalizeSubscriptions` |
| `aiop:insights` | `Insight[]` | `normalizeInsights` |
| `aiop:notes` | `Note[]` | `normalizeNotes` |
| `aiop:regret-items` | `RegretItem[]` | `normalizeRegretItems` |
| `aiop:todos` | `TodoItem[]` | `normalizeTodos` |
| `aiop:retros` | `KptRetro[]` | `normalizeRetros` (date desc 정렬) |
| `aiop:layout` | `DashboardLayout` | 객체 가드만 |
| `aiop:hero-message` | `string` | - |
| `aiop-compact-mode` | `boolean` | - |
| `aiop-theme-mode` | `"light" \| "dark"` | - |

Export / Import (`buildExportPayload` / `applyImport`)은 11개 키 모두 포함. `version: 1` JSON.

도메인 키는 normalizer 통과한 결과만 저장. 환경 키는 타입 가드 후 그대로 저장.

---

## 7. 핵심 타입

`src/types/index.ts`

```txt
ViewKey         // dashboard | wants | calculator | regret | subscriptions
                // | insights | notes | todos | retros
Currency        // "KRW" | "USD"
WantItem        // 구매 목표 (price, requiredCapital, score, priority, currency 등)
RegretItem      // 후회 기록 (watchedPrice, currentPrice, quantity, resultPercent, profitAmount)
Subscription    // 구독 (monthlyPrice, valueScore, status: keep/review/cancel)
Insight         // 책/영상/아티클/생각 (keySentence, actionItem, tags, relatedGoal)
Note            // 인박스 메모 (body, tags, status: inbox/processed/archived)
TodoItem        // 할 일 (status, priority, dueDate?)
RetroItem       // K.P.T 항목 (text, done?, linkedTodoId?, carriedFrom?)
KptRetro        // 날짜별 회고 (keep/problem/try: RetroItem[])
NavItem         // 사이드바 nav 메타
```

`src/types/layout.ts`

```txt
WidgetId        // hero | summary-cards | want-preview | asset-snapshot
                // | subscription-summary | recent-insights | todo-summary
SummaryCardId   // wants-count | subscriptions-monthly | planned-spend
                // | recent-insight | inbox-count | todo-count
DashboardLayout // version, breakpoint, widgets, summaryCardsOrder,
                // narrowWidgetsOrder, narrowWidgetHeights,
                // hidden, hiddenSummaryCards
```

---

## 8. K.P.T 회고 기능

### 화면
- `/retros` 오늘 회고 + 과거 회고 목록 + Streak + 이월 안내
- `/retros/weekly` 주간 롤업 (월~일)

### 통합 기능
| 기능 | 위치 | 상태 |
|---|---|---|
| K/P/T 항목 추가/삭제 | `RetroView.tsx` | ✅ |
| Try 체크박스 토글 | `RetroView.tsx` | ✅ |
| Try ↔ Todo 양방향 연동 | `retros.ts` `syncTryWithTodos` | ✅ |
| 어제 미완료 Try 이월 | `findPreviousRetro` + `carryOverTryItems` | ✅ |
| 연속 작성 Streak | `calculateStreak`, `getWeekProgress` | ✅ |
| 주간 롤업 | `WeeklyRollupView.tsx` + `buildWeeklyRollup` | ✅ |
| Problem 키워드 Top 3 | `extractProblemKeywords` (단순 토큰화) | ✅ |
| 검색 통합 | `SearchContext` | ✅ |
| 과거 회고 편집/삭제 | `RetroView.tsx` (날짜 선택) | ✅ |
| QuickAdd에 retro 카테고리 통합 | `AppShell.tsx` `handleAddedRetro` | ✅ |

### 헬퍼 모듈 (`src/lib/retros.ts`)
```txt
createTodoFromTry, syncTryWithTodos
findPreviousRetro, getUnfinishedTryItems, carryOverTryItems
calculateStreak, getWeekProgress, getWeekRange
buildWeeklyRollup, extractProblemKeywords
hasRetroContent, createEmptyRetro, sortRetrosByDateDesc
getLocalDateString, formatDateLabel, parseLocalDate, addDays, createId
```

---

## 9. 금액 입력 (`MoneyInputField`)

`src/components/inputs/MoneyInputField.tsx`

- 내부 저장값은 항상 base value 숫자.
- 입력창은 숫자 직접 입력 가능.
- KRW 입력 시 누적 버튼 `+1만 / +5만 / +10만 / +100만`.
- USD 입력 시 누적 버튼 `+10 / +100 / +1k / +10k`.
- 입력창 아래 `formatKRW` / `formatCurrency` 미리보기(emerald 색).

적용 위치:
```txt
구매 목표 추가 (AddWantModal)
구독 추가 (AddSubscriptionModal)
후회 기록 추가 (AddRegretItemModal)
자산 구매 계산기 (AssetCalculatorView)
```

UX 개선 후보 (확정 작업 아님):
- 단위 버튼을 입력창 내부에 더 밀착
- 선택 단위 / 저장값 / 미리보기의 시각적 구분 강화
- KRW / USD 입력 UX 분리

---

## 10. v2.0 백엔드 확정 사항

| ID | 항목 | 결정 |
|---|---|---|
| D1 | 데이터 흐름 | RSC + Server Actions (SWR 미도입) |
| D2 | 네이밍 | snake_case DB + camelCase TS + `src/lib/db/mappers.ts` |
| D3 | 통화 | Frankfurter 환율 API, KRW 기준 자동 환산 |
| D4 | 태그 | Postgres `text[]` + GIN index |
| D5 | 삭제 | Hard delete |
| D6 | URL | App Router 라우트 분리 (이미 완료) |
| D7 | Auth provider | Google OAuth |
| D8 | Backend | Supabase (Postgres + Auth + RLS) |

### 진행 순서
```txt
1. Supabase 프로젝트 생성 + 환경변수
2. Postgres 스키마 + RLS (도메인 8개 + dashboard_layouts + user_settings)
3. Google OAuth 설정
4. @supabase/ssr 서버/클라이언트 세팅
5. DB ↔ TS mappers
6. Wants 도메인부터 RSC + Server Action 전환
7. 나머지 도메인 순차 전환 (Retros 포함)
8. exchange_rates 캐시 테이블 + Cron
9. localStorage export JSON → Supabase import 도구
10. 서버 기반 export
11. dashboard layout / user settings 동기화
12. localStorage 사용 코드 제거
13. v2.1+ AI Route Handler
```

### v2.1+ AI 기능 (순차)
입력 자동분류 → 오늘의 할일 추천 → 투자종목 추천 → 뉴스 추천

---

## 11. 현재 우선순위

위에서 아래 순서로 진행한다. `aiop-plan.md`에는 한 번에 하나만 옮긴다.

6. v2.0 Supabase 프로젝트 생성 / 스키마 SQL 작성

---

## 12. 주의사항

- 백엔드 연결 전에는 기존 localStorage 동작을 깨지 않는다.
- 라우트는 이미 App Router 구조다. `?view=` / `popstate` 흔적이 보이면 잔재이므로 제거 대상.
- v2.0 문서에 SWR 흔적이 있으면 RSC + Server Actions 결정(D1)이 우선이다.
- Retros는 신규 도메인이므로 v2.0 스키마/마이그레이션에 반드시 포함한다.
- `aiop:layout`은 별도 정규화 로직(`useDashboardLayout`)을 거친다. 임의 변경 금지.
- `tsconfig.tsbuildinfo`는 빌드 산출물 — gitignore 여부 확인 필요.
