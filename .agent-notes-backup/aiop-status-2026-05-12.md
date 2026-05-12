# AIOP 현재 진행 상황 — 2026-05-12

> 단일 진실 소스(single source of truth) 문서.
> 이전 상태 보고서(`aiop-current-progress-2026-05-11.md`, `aiop-current-status-and-next-steps.md`)를 통합 갱신함.

---

## 1. 한눈에 요약

- **버전:** v1.3 + KPT 회고 (v1.4 후보)
- **상태:** 프론트엔드 전용 MVP, 모든 도메인 동작 가능. localStorage 영속화.
- **백엔드:** 미연결. v2.0 계획서만 확정 (`aiop-v20-backend-plan.md`).
- **커밋 상태:** 다수 미커밋. 신규 도메인(K.P.T)과 위젯 개선이 working tree에만 존재.
- **테스트:** 자동화 없음. 수동 QA만.

---

## 2. 코드 구조 현황

### 2.1 App Router 라우트 (10개)

| 라우트 | 화면 | 상태 |
| --- | --- | --- |
| `/` | 대시보드 | ✅ |
| `/wants` | 구매 목표 | ✅ |
| `/calculator` | 자산 구매 계산기 | ✅ |
| `/regret` | 그때 살걸 기록장 | ✅ |
| `/subscriptions` | 구독 관리 | ✅ |
| `/insights` | 인사이트 보관함 | ✅ |
| `/notes` | 노트 / 수집함 | ✅ |
| `/todos` | Todo | ✅ |
| `/retros` | K.P.T 회고 (신규) | ✅ |
| `/retros/weekly` | 주간 회고 롤업 (신규) | ✅ |

### 2.2 사이드바 메뉴 (9개)

`src/components/layout/navItems.ts`

```
대시보드 / 구매 목표 / 계산기 / 후회 기록 / 구독 / 인사이트 / 노트 / Todo / K.P.T
```

### 2.3 디렉토리 트리 (요지)

```
src/
├── app/                    # 10개 라우트
├── components/
│   ├── dashboard/          # 위젯 7종 (Hero, SummaryCards, WantPreview, AssetSnapshot,
│   │                       #  SubscriptionSummary, RecentInsights, TodoSummary)
│   ├── layout/             # AppShell, Header, Sidebar, BottomTabBar, navItems
│   │   ├── grid/           # react-grid-layout 기반 DashboardGrid, WidgetFrame
│   │   └── settings/       # 편집 모드 / 위젯 visibility / 저장·리셋
│   ├── inputs/             # MoneyInputField (공통 금액 입력)
│   ├── quick-add/          # QuickAddModal
│   ├── wants/              # WantsView, WantCard, AddWantModal
│   ├── calculator/         # AssetCalculatorView
│   ├── regret/             # RegretTrackerView, RegretCard, AddRegretItemModal
│   ├── subscriptions/      # SubscriptionsView, SubscriptionCard, AddSubscriptionModal
│   ├── insights/           # BookInsightsView, InsightCard, AddInsightModal
│   ├── notes/              # NotesInboxView, AddNoteModal
│   ├── todos/              # TodoView, AddTodoModal
│   └── retros/             # RetroView, WeeklyRollupView, AddRetroModal (신규)
├── contexts/               # CompactMode, Layout, Search
├── hooks/                  # useLocalStorage, useDashboardLayout, useEscapeKey
├── lib/                    # calculations, formatters, labels, storage, dataPortability,
│                           #  storageNormalizers, retros
├── types/                  # index.ts, layout.ts
└── data/mockData.ts
```

---

## 3. 도메인별 구현 상태

| 도메인 | CRUD | localStorage | 검색 | 대시보드 위젯 | 비고 |
| --- | --- | --- | --- | --- | --- |
| Wants | ✅ | `aiop:wants` | ✅ | `want-preview`, `asset-snapshot` | |
| Calculator | — | — | — | — | 계산 전용 (저장 없음) |
| Regret | ✅ | `aiop:regret-items` | — | — | |
| Subscriptions | ✅ | `aiop:subscriptions` | ✅ | `subscription-summary` | |
| Insights | ✅ | `aiop:insights` | ✅ | `recent-insights` | |
| Notes | ✅ | `aiop:notes` | ✅ | — | status 사이클 (inbox→processed→archived) |
| Todos | ✅ | `aiop:todos` | ✅ | `todo-summary` | |
| Retros (K.P.T) | ✅ | `aiop:retros` | ✅ | — | Try↔Todo 연동, 이월, Streak, 주간 |
| Dashboard | — | `aiop:layout`, `aiop:hero-message` | — | — | 위젯 7개 + 드래그/리사이즈 + visibility |

---

## 4. 기술 스택

| 영역 | 사용 |
| --- | --- |
| 프레임워크 | Next.js 15 (App Router) |
| UI | React 19 + TypeScript 5.7 + Tailwind 3.4 |
| 아이콘 | `lucide-react` |
| 드래그 / 리사이즈 | `react-grid-layout` (대시보드 위젯) |
| 카드 순서 재배치 | `@dnd-kit/core` + `@dnd-kit/sortable` (SummaryCards) |
| 영속화 | `window.localStorage` + custom `useLocalStorage` 훅 (다른 탭 storage 이벤트 처리) |
| 백엔드 / 인증 | 없음 |
| 외부 API | 없음 |
| 테스트 | 없음 |

---

## 5. localStorage 키 (전체)

`src/lib/dataPortability.ts` 기준.

| 키 | 값 | 정규화 |
| --- | --- | --- |
| `aiop:wants` | `WantItem[]` | `normalizeWants` |
| `aiop:subscriptions` | `Subscription[]` | `normalizeSubscriptions` |
| `aiop:insights` | `Insight[]` | `normalizeInsights` |
| `aiop:notes` | `Note[]` | `normalizeNotes` |
| `aiop:regret-items` | `RegretItem[]` | `normalizeRegretItems` |
| `aiop:todos` | `TodoItem[]` | `normalizeTodos` |
| `aiop:retros` | `KptRetro[]` | `normalizeRetros` |
| `aiop:layout` | `DashboardLayout` | (객체 가드만) |
| `aiop:hero-message` | `string` | — |
| `aiop-compact-mode` | `boolean` | — |
| `aiop-theme-mode` | `"light" \| "dark"` | — |

Export / Import은 11개 키 모두 포함 (`SettingsMenu` → JSON 다운로드 / 업로드).

---

## 6. 핵심 타입 (`src/types/index.ts`)

```ts
WantItem        // 구매 목표
RegretItem      // 후회 기록 (KRW/USD)
Subscription    // 구독
Insight         // 책/영상/아티클/생각
Note            // 인박스 메모
TodoItem        // 할 일
RetroItem       // K.P.T 회고 항목 (linkedTodoId, carriedFrom, done)
KptRetro        // 날짜별 회고 (keep/problem/try 배열)
```

`ViewKey`에 `"retros"` 포함 (9개). `Currency = "KRW" | "USD"`.

---

## 7. K.P.T 회고 기능 (신규) — 구현 명세

기획 문서: `kpt-retro-feature-plan.md`, `kpt-retro-feature-plan-v2.md` (둘 다 코드에 반영됨).

### 7.1 화면

- `/retros` — 오늘 작성 + 과거 회고 목록 + Streak + 이월 안내
- `/retros/weekly` — 주간 롤업 (월~일)

### 7.2 통합 기능

| 기능 | 구현 위치 | 상태 |
| --- | --- | --- |
| K/P/T 항목 추가/삭제 | `RetroView.tsx` | ✅ |
| Try 체크박스 토글 | `RetroView.tsx` | ✅ |
| **Try → Todo 자동 연동** (양방향) | `RetroView.tsx` + `retros.ts` `syncTryWithTodos` | ✅ |
| **어제 미완료 Try 이월** | `findPreviousRetro` + `carryOverTryItems` + 이월 카드 | ✅ |
| **연속 작성 Streak** | `calculateStreak`, `getWeekProgress` | ✅ |
| **주간 롤업** | `WeeklyRollupView.tsx` + `buildWeeklyRollup` | ✅ |
| Problem 키워드 Top 3 | `extractProblemKeywords` (단순 토큰화) | ✅ |
| 검색 통합 | `SearchContext` 사용 | ✅ |
| 과거 회고 편집/삭제 | `RetroView.tsx` (날짜 선택) | ✅ |

### 7.3 헬퍼 모듈 — `src/lib/retros.ts`

```
createTodoFromTry, syncTryWithTodos,
findPreviousRetro, getUnfinishedTryItems, carryOverTryItems,
calculateStreak, getWeekProgress, getWeekRange,
buildWeeklyRollup, extractProblemKeywords,
hasRetroContent, createEmptyRetro, sortRetrosByDateDesc,
parseLocalDate / formatLocalDate / addDays, createId
```

---

## 8. 미커밋 작업 (working tree)

`git status` 기준 — 모두 K.P.T 회고 + 직전 위젯 개선 작업.

### Modified (15)
```
src/components/dashboard/SummaryCards.tsx
src/components/dashboard/TodoSummary.tsx
src/components/layout/AppShell.tsx
src/components/layout/BottomTabBar.tsx
src/components/layout/grid/defaultLayout.ts
src/components/layout/navItems.ts
src/components/notes/NotesInboxView.tsx
src/components/quick-add/QuickAddModal.tsx
src/components/todos/TodoView.tsx
src/contexts/LayoutContext.tsx
src/hooks/useDashboardLayout.ts
src/lib/dataPortability.ts
src/lib/storageNormalizers.ts
src/types/index.ts
src/types/layout.ts
```

### Untracked (4)
```
src/app/retros/                 # /retros, /retros/weekly 라우트
src/components/retros/          # RetroView, WeeklyRollupView, AddRetroModal
src/components/todos/AddTodoModal.tsx
src/lib/retros.ts               # KPT 헬퍼
```

**커밋 분할 권장:**
1. `feat: add K.P.T retrospective domain` — `src/app/retros/**`, `src/components/retros/**`, `src/lib/retros.ts`, `src/types/index.ts`(RetroItem/KptRetro), `src/lib/storageNormalizers.ts`(normalizeRetros), `src/lib/dataPortability.ts`(retros 키), `src/components/layout/navItems.ts`(K.P.T 메뉴)
2. `feat: add AddTodoModal and minor widget polish` — 나머지 위젯 / Notes / QuickAdd 변경분

---

## 9. v2.0 백엔드 다음 단계 (확정 사항만)

상세는 `aiop-v20-backend-plan.md`, `aiop-v20-decisions.md`.

| 결정 | 내용 |
| --- | --- |
| D1 데이터 흐름 | RSC + Server Actions (SWR 미도입) |
| D2 네이밍 | snake_case DB + camelCase TS + `mappers.ts` |
| D3 다중 통화 | Frankfurter 환율 API, 기준 KRW 자동 환산 |
| D4 태그 | Postgres `text[]` + GIN 인덱스 |
| D5 삭제 | Hard delete |
| D6 URL | App Router 라우트 분리 (`?view=` 폐기) — ✅ 이미 완료 |

**진행해야 할 작업 순서:**
1. Supabase 프로젝트 생성 + 환경변수
2. 도메인별 테이블 스키마 (Wants, Subscriptions, Insights, Notes, Regret, Todos, **Retros 신규**)
3. Google OAuth + RLS 정책
4. Server Actions으로 CRUD 마이그레이션 (도메인 1개씩)
5. localStorage → Supabase 데이터 이관 도구 (기존 export JSON 재활용 가능)

후속 AI 기능 (v2.1+): 자동분류 → 오늘의 할일 추천 → 투자종목 추천 → 뉴스 추천.

---

## 10. 후속 후보 작업 (미확정)

KPT 회고 관련 추가 가치 작업:
- [ ] 대시보드에 회고 위젯 (오늘 회고 진척도, Streak)
- [ ] QuickAddModal에 "회고" 카테고리 통합
- [ ] Insights `actionItem` → 회고 Try로 보내기
- [ ] 회고 마크다운 export (단일 날짜)
- [ ] 회고 항목 인라인 텍스트 편집
- [ ] 회고 태그 / 카테고리

다른 영역:
- [ ] AGENTS.md 갱신 (KPT 도메인 반영)
- [ ] README 현재 상태 반영
- [ ] 자동 테스트 도입 검토 (vitest + react-testing-library)

---

## 11. 노트 파일 인덱스 (정리 후)

### 활성 (지금 보면 됨)

| 파일 | 용도 |
| --- | --- |
| `aiop-status-2026-05-12.md` | **본 문서. 현재 상태 단일 진실 소스.** |
| `aiop-todo.md` | 실시간 v2.0 단계별 체크리스트 |
| `aiop-v20-backend-plan.md` | v2.0 백엔드 13단계 로드맵 |
| `aiop-v20-decisions.md` | 백엔드 설계 결정 D1~D6 |
| `aiop-v20-next-steps.md` | 라우트 분리 후 다음 단계 |
| `aiop-v20-route-split-progress.md` | App Router 분리 완료 보고 |
| `aiop-v20-route-split-plan.md` | 라우트 분리 원안 |
| `aiop-money-unit-status.md` | 금액 입력 통합 작업 진행 |
| `aiop-v11-drag-drop-layout.md` | 드래그앤드롭 기술 레퍼런스 (참고용) |

### 아카이브로 이동된 파일 (`.agent-notes/archive/`)

| 파일 | 이동 이유 |
| --- | --- |
| `aiop-current-progress-2026-05-11.md` | 본 문서로 갱신됨 |
| `aiop-current-status-and-next-steps.md` | 본 문서로 갱신됨 |
| `current-status-and-structure.md` | 2026-05-09 버전, 더 신규 문서로 대체 |
| `aiop-project-structure.md` | 코드 직접 보면 더 정확. 더 이상 능동적이지 않음 |
| `aiop-next-steps.md` | `aiop-v20-*` 시리즈로 대체 |
| `aiop-next-steps-stage2.md` | `aiop-v20-*` 시리즈로 대체 |
| `aiop-implementation-log.md` | 과거 기록 |
| `aiop-v02-v11-history.md` | 과거 기록 |
| `kpt-retro-feature-plan.md` | 본 문서 §7에 통합. 구현 완료 |
| `kpt-retro-feature-plan-v2.md` | 본 문서 §7에 통합. 구현 완료 |

---

## 12. 실행 / 검증

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (type-check 포함)
npm run lint     # ESLint
```

수동 QA 체크리스트는 각 기능별 계획서 / 진행 문서 참고.
