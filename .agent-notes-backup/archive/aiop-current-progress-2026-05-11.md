# AIOP 현재 진행사항 (2026-05-11 기준)

작성일: 2026-05-11
대상 프로젝트: `C:/dev/AIOP`
현재 브랜치: `main`
최근 커밋: `2a267f4 feat:md파일 정리`

---

## 1. 한 줄 요약

- v1.0 (frontend-only MVP)까지 README 상 완료 상태이며, **v1.1 ~ v1.2 (Dashboard 드래그&드롭 커스터마이징)이 실제 구현되어 동작 중**이다.
- 추가로 v1.0 범위 밖이었던 **Todo View / Todo 위젯**이 신설되어 8번째 View로 합류했다.
- 모든 변경분은 아직 커밋되지 않은 working tree 상태이다 (`git status`에 12개 modified + 7개 untracked).

---

## 2. 기술 스택 현황 (`package.json`)

- Next.js 15 / React 19 / TypeScript 5.7 / Tailwind 3.4
- 신규 의존성 (v1.1 진행 중 추가):
  - `react-grid-layout ^2.2.3` — Dashboard 외부 그리드 (위젯 위치 / 크기 드래그)
  - `@dnd-kit/core ^6.3.1`, `@dnd-kit/sortable ^10.0.0`, `@dnd-kit/utilities ^3.2.2` — SummaryCards 내부 카드 순서 재배치
- `lucide-react ^0.468.0`, `clsx ^2.1.1`는 기존 그대로

---

## 3. 디렉토리 구조 (현재)

```txt
src/
  app/
    layout.tsx          ko 한국어 RootLayout (title: "AIOP")
    page.tsx            View 라우팅 + QuickAdd 모달 통합
    globals.css         테마 / 그리드 / 스크롤바 스타일
  components/
    calculator/         AssetCalculatorView
    dashboard/
      AssetSnapshot.tsx
      HeroWidget.tsx          [NEW] Hero를 위젯으로 분리
      RecentInsights.tsx
      SubscriptionSummary.tsx
      SummaryCards.tsx        [수정] 카드 순서 dnd-kit 재배치 + 숨김 처리
      TodoSummary.tsx         [NEW] Dashboard용 Todo 요약 위젯
      WantPreview.tsx
    insights/           AddInsightModal, BookInsightsView, InsightCard
    layout/
      AppShell.tsx           [수정] CompactModeProvider + LayoutProvider 래핑
      BottomTabBar.tsx       [수정] 8칸 grid (Todo 합류)
      Header.tsx             [수정] HeaderSettingsButton 노출 + 빠른 추가
      Sidebar.tsx            [수정] 하단 SidebarSettingsButton 노출
      navItems.ts            [수정] todos 항목 + viewTitles 한글 정리
      grid/                  [NEW] react-grid-layout 통합
        DashboardGrid.tsx
        WidgetFrame.tsx
        defaultLayout.ts
      settings/              [NEW] 레이아웃 편집 UI
        HeaderSettingsButton.tsx
        SidebarSettingsButton.tsx
        SettingsMenu.tsx
    notes/              AddNoteModal, NotesInboxView
    quick-add/          QuickAddModal
    regret/             AddRegretItemModal, RegretCard, RegretTrackerView
    subscriptions/      AddSubscriptionModal, SubscriptionCard, SubscriptionsView
    todos/              [NEW] TodoView.tsx
    wants/              AddWantModal, WantCard, WantsView
  contexts/
    CompactModeContext.tsx
    LayoutContext.tsx       [NEW] 편집 모드 / 레이아웃 draft / 저장 / 초기화
  data/
    mockData.ts
  hooks/
    useDashboardLayout.ts   [NEW] aiop:layout normalize + persist
    useEscapeKey.ts
    useLocalStorage.ts
  lib/
    calculations.ts
    formatters.ts
    labels.ts
  types/
    index.ts             [수정] ViewKey에 "todos" 추가 + TodoItem/TodoStatus 신설
    layout.ts            [NEW] WidgetId / SummaryCardId / DashboardLayout 타입
```

---

## 4. View 구성 (8개로 확장)

`src/components/layout/navItems.ts`의 `viewTitles`:

| key | 한글 라벨 | 컴포넌트 |
|---|---|---|
| dashboard | 대시보드 | `DashboardGrid` |
| wants | 구매 목표 | `WantsView` |
| calculator | 자산 구매 계산기 (사이드바 라벨: 계산기) | `AssetCalculatorView` |
| regret | "라고할때 살껄 이라고 할때 살껄" | `RegretTrackerView` |
| subscriptions | 구독 관리 (사이드바 라벨: 구독) | `SubscriptionsView` |
| insights | 인사이트 보관함 (사이드바 라벨: 인사이트) | `BookInsightsView` |
| notes | 노트 / 수집함 (사이드바 라벨: 노트) | `NotesInboxView` |
| todos | Todo | `TodoView` **[NEW]** |

> `regret` 라벨이 "라고할때 살껄 이라고 할때 살껄" 로 들어가 있음 — 임시 / 오타로 보이는 상태.

---

## 5. v1.1 ~ v1.2 구현 — Dashboard 드래그&드롭 커스터마이징

### 데이터 모델 (`src/types/layout.ts`)

```ts
WidgetId =
  | "hero" | "summary-cards" | "want-preview" | "asset-snapshot"
  | "subscription-summary" | "recent-insights" | "todo-summary"

SummaryCardId =
  | "wants-count" | "subscriptions-monthly" | "planned-spend"
  | "recent-insight" | "inbox-count" | "todo-count"

DashboardLayout = {
  version: 1,
  breakpoint: "lg" | "md" | "sm",
  widgets: WidgetLayout[],
  summaryCardsOrder: SummaryCardId[],
  narrowWidgetsOrder?: WidgetId[],
  narrowWidgetHeights?: Partial<Record<WidgetId, number>>,
  hidden?: WidgetId[],
  hiddenSummaryCards?: SummaryCardId[],
}
```

### 저장 키

- `aiop:layout` — Dashboard 레이아웃 (위젯 위치/크기/순서/숨김 + Summary 카드 순서/숨김)
- 기존 데이터 키 그대로:
  - `aiop:wants`, `aiop:subscriptions`, `aiop:insights`, `aiop:notes`, `aiop:regret-items`
  - `aiop:todos` **[NEW]**
- 환경 / 테마:
  - `aiop-theme-mode` (dark | light)
  - `aiop-compact-mode` (boolean)

### 핵심 컴포넌트 / 훅 흐름

1. `LayoutProvider` (`src/contexts/LayoutContext.tsx`)
   - `isEditMode`, `draftLayout`, `hasUnsavedChanges` 상태 관리
   - 편집 중에는 `draftLayout`을 사용, 저장 시 `useDashboardLayout.saveLayout()`로 영속화
   - `toggleEditMode` / `discardLayoutChanges` / `resetLayout` 제공
2. `useDashboardLayout` (`src/hooks/useDashboardLayout.ts`)
   - `useLocalStorage`로 `aiop:layout` 읽기/쓰기
   - `normalizeDashboardLayout`이 손상 / 누락 / 잘못된 타입을 모두 기본값으로 보정
   - `version: 1` 가드 — 다른 버전이면 default로 fallback
3. `DashboardGrid` (`src/components/layout/grid/DashboardGrid.tsx`)
   - `react-grid-layout`의 `Responsive` 사용 (breakpoints: lg 768+, sm 0+)
   - 컴팩트 모드 또는 768px 미만은 1열 narrow 레이아웃 (드래그 비활성)
   - `WidgetFrame`이 편집 모드에서만 grab 핸들 표시
   - `editableWidgetIds` 만 react-grid-layout이 관리하고, `hero`는 위에 따로 렌더
4. `SettingsMenu` (`src/components/layout/settings/SettingsMenu.tsx`)
   - "레이아웃 편집 / 저장 / 저장 안 하고 종료 / 레이아웃 초기화"
   - "Dashboard 위젯" 그룹: 6개 위젯 토글 (hero는 편집 대상 아님)
   - "Summary 상세 카드" 그룹: 6개 카드 토글
5. SummaryCards 내부 (`src/components/dashboard/SummaryCards.tsx`)
   - 편집 모드일 때 `@dnd-kit/sortable` 활성 → 카드 6개 순서 변경
   - 비편집 모드에서는 단순 grid 렌더
   - 숨김 처리된 카드(`hiddenSummaryCards`)는 렌더에서 제외

### Hero 위젯 결정

`.agent-notes/aiop-v11-drag-drop-layout.md`의 결정 (Hero를 편집 위젯으로 편입)과 달리,
**현재 구현은 `DashboardGrid`가 `HeroWidget`을 그리드 밖 상단에 고정 렌더**하고
`editableWidgetIds`에서 `"hero"`를 제외하고 있다. `widgetIds`/`widgetLabels`에는 hero가 남아 있지만
실제로는 토글 불가 / 이동 불가 상태. → 계획서와 구현 간 불일치 항목.

---

## 6. Todo 기능 (v1.1과 함께 들어온 신기능)

- `src/types/index.ts`에 `TodoItem` / `TodoStatus = "todo" | "doing" | "done"` 추가
- View: `src/components/todos/TodoView.tsx`
  - 입력 + 우선순위(low/medium/high) + Enter 등록
  - 상태 순환: todo → doing → done → todo
  - 삭제 / 빈 상태 안내 / 개수 통계 카드 3개
- 위젯: `src/components/dashboard/TodoSummary.tsx`
  - 진행 전 / 진행 중 / 완료 카운트 + 미완 Todo 4개 미리보기
- Summary Card 1개 추가: `todo-count` (완료 전 Todo 개수)
- 저장 키: `aiop:todos`
- `TodoView`만 기본 mock todos 3개 보유 (`defaultTodos`), Dashboard 위젯은 빈 배열 fallback

---

## 7. AppShell / Header / Sidebar 변경

- `AppShell`이 `CompactModeProvider` + `LayoutProvider`를 모두 감싸도록 변경
- 컴팩트 모드에서 Sidebar 대신 `BottomTabBar` 렌더 (8칸 grid)
- `Header`는 Dashboard일 때만 `HeaderSettingsButton` 노출 (`canCustomizeLayout`)
- Sidebar 하단에 `SidebarSettingsButton`도 노출 — Header / Sidebar 두 곳에서 동일한 `SettingsMenu` 진입 가능

---

## 8. 빠른 추가 흐름 (v1.0에서 유지)

`src/app/page.tsx`:

- `Header > 빠른 추가` 버튼 → `QuickAddModal` 오픈
- 카테고리 5개 (want / subscription / insight / regret / note) 선택 시
  카테고리별 Add Modal 오픈
- 저장은 `prependLocalStorageItem`이 localStorage 앞에 prepend
- 저장 후 `refreshKey` 증가 → 현재 View 컴포넌트 강제 remount로 즉시 갱신
- Todo는 빠른 추가 후보에서 빠져 있음 (TodoView 내부 입력으로만 추가 가능)

---

## 9. 작업 중(미커밋) 파일 목록

`git status` 기준:

수정됨 (12):
- `README.md`
- `package.json`, `package-lock.json` (의존성 4개 추가)
- `src/app/globals.css` (그리드 / 편집 모드 스타일 추정)
- `src/app/page.tsx` (Todo View / DashboardGrid 라우팅)
- `src/components/dashboard/SummaryCards.tsx` (정렬 + 숨김 + Todo 카드)
- `src/components/layout/AppShell.tsx` (LayoutProvider 래핑)
- `src/components/layout/BottomTabBar.tsx` (8칸)
- `src/components/layout/Header.tsx` (Settings 버튼)
- `src/components/layout/Sidebar.tsx` (Settings 버튼)
- `src/components/layout/navItems.ts` (Todo + 한글 라벨)
- `src/types/index.ts` (TodoItem / ViewKey 확장)

신규 (7):
- `src/components/dashboard/HeroWidget.tsx`
- `src/components/dashboard/TodoSummary.tsx`
- `src/components/layout/grid/` (3 파일)
- `src/components/layout/settings/` (3 파일)
- `src/components/todos/` (TodoView)
- `src/contexts/LayoutContext.tsx`
- `src/hooks/useDashboardLayout.ts`
- `src/types/layout.ts`

→ 전체적으로 README가 말하는 v1.1 ~ v1.2 + Todo 기능이 한 묶음으로 진행됨.
  커밋 분리가 필요하면 (1) Todo 추가, (2) 레이아웃 시스템, (3) Settings UI 정도로 끊을 수 있다.

---

## 10. 알려진 이슈 / 후속 TODO

1. **`navItems.ts`의 `regret` 라벨**이 `"라고할때 살껄 이라고 할때 살껄"`로 들어가 있음 → 정상 문구로 정정 필요.
2. **Hero 위젯 정책 불일치**:
   계획서(`aiop-v11-drag-drop-layout.md`)는 Hero를 편집 위젯에 편입하기로 했으나,
   현재 구현은 그리드 외부 고정 + `editableWidgetIds`에서 제외. 둘 중 하나로 정리 필요.
3. **`hero`가 `widgetIds` / `widgetLabels`에는 남아있지만** SettingsMenu에서는 토글 불가.
   사용하지 않는 ID라면 layout 타입에서도 제거하거나, 토글 가능하게 만들거나 결정 필요.
4. **빠른 추가에 Todo 누락**. README는 5종(want/subscription/insight/regret/note)으로 정확하지만,
   "오늘 처리할 일"이라는 Todo의 성격상 QuickAdd에 합류하는 게 자연스러울 수 있음.
5. **README가 v1.1 진행 상황을 아직 "예정"으로 표기** (line 263). 실제 구현된 부분 반영 필요.
6. **`tsconfig.tsbuildinfo`가 변경된 채로 staged 영역에 보임** — 빌드 캐시이므로 커밋 직전에 제외하거나 `.gitignore`에 추가 권장.
7. **react-grid-layout의 React 19 호환** — 일단 동작 확인된 상태로 보이나, peerDeps 경고 / lint 경고 확인 필요.

---

## 11. 다음 작업 후보

README 로드맵 기준으로 다음 후보는:

- **v1.3 — 데이터 export / import**
  - 모든 `aiop:*` 키를 JSON 한 파일로 내보내기 / 업로드 복원
  - v2.0 백엔드 마이그레이션 안전망
- **v2.0 — Supabase + Google OAuth + AI API 라우트** (계획서 `aiop-v20-backend-plan.md` 존재)
- **v2.1+ — AI 기능 4종** (입력 자동분류 → 오늘의 할일 추천 → 투자종목 → 뉴스)

단, 그전에 본 노트의 "알려진 이슈" 1 ~ 5를 먼저 정리하고 v1.1 ~ v1.2를 한 번 커밋으로 끊는 것을 권장.
