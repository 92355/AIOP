# AIOP 현재 상태 및 앞으로 해야할 일

> 작성일: 2026-05-11
> 대상 브랜치: `main`
> 기준: 워킹 트리 (미커밋 변경 포함) 전체
> 비고: 기존 `current-status-and-structure.md` (2026-05-09, v0.8 시점)는 outdated. 본 문서가 최신.

---

## 1. 한 줄 요약

- README 로드맵 상 **v1.0 (UI 품질 정리)** 까지는 완료.
- 그 다음 단계인 **v1.1 ~ v1.2 — 레이아웃 드래그&드롭 커스터마이징** 의 **상당 부분이 이미 구현**돼 있다.
- 다만 모바일 드래그 정책, Todo 화면, Layout export/import 등 마무리 항목이 남아 있고, README/AGENTS.md 문서는 현재 코드보다 뒤처져 있다.

---

## 2. 기술 스택 (실제 사용 중)

| 영역 | 사용 기술 | 비고 |
| --- | --- | --- |
| 프레임워크 | Next.js 15 (App Router) | `next ^15.0.0` |
| 언어 | TypeScript 5.7 | strict 사용 |
| UI | React 19 | client component 위주 |
| 스타일 | Tailwind CSS 3.4 | `theme-dark` / `theme-light` data attribute |
| 아이콘 | `lucide-react` ^0.468.0 | |
| 그리드 | `react-grid-layout` ^2.2.3 | `Responsive`, `useContainerWidth`, `dragConfig`, `resizeConfig` API 사용 |
| DnD (요약 카드) | `@dnd-kit/core` ^6.3.1 + `@dnd-kit/sortable` ^10.0.0 | summary cards reorder |
| 저장소 | 브라우저 `localStorage` | `useLocalStorage` 훅 |
| 백엔드 | 없음 | v2.0에서 Supabase 예정 |

---

## 3. 디렉토리 구조 (현재)

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                       # 단일 페이지, useState로 ViewKey 스위칭 + QuickAdd 모달 라우팅
├── components/
│   ├── calculator/
│   │   └── AssetCalculatorView.tsx
│   ├── dashboard/
│   │   ├── AssetSnapshot.tsx
│   │   ├── HeroWidget.tsx             # v1.0 추가
│   │   ├── RecentInsights.tsx
│   │   ├── SubscriptionSummary.tsx
│   │   ├── SummaryCards.tsx           # dnd-kit 기반 카드 reorder + visibility
│   │   ├── TodoSummary.tsx            # 신규 위젯
│   │   └── WantPreview.tsx
│   ├── insights/
│   │   ├── AddInsightModal.tsx        # v0.7 추가
│   │   ├── BookInsightsView.tsx
│   │   └── InsightCard.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── BottomTabBar.tsx           # 컴팩트뷰 전용 하단 탭
│   │   ├── Header.tsx                 # 테마 토글, 컴팩트뷰 토글, QuickAdd, 설정 버튼
│   │   ├── Sidebar.tsx
│   │   ├── navItems.ts
│   │   ├── grid/
│   │   │   ├── DashboardGrid.tsx      # react-grid-layout 기반 드래그/리사이즈
│   │   │   ├── WidgetFrame.tsx
│   │   │   └── defaultLayout.ts
│   │   └── settings/
│   │       ├── HeaderSettingsButton.tsx
│   │       ├── SettingsMenu.tsx       # 편집 모드/저장/리셋/위젯 visibility
│   │       └── SidebarSettingsButton.tsx
│   ├── notes/
│   │   ├── AddNoteModal.tsx
│   │   └── NotesInboxView.tsx
│   ├── quick-add/
│   │   └── QuickAddModal.tsx
│   ├── regret/
│   │   ├── AddRegretItemModal.tsx
│   │   ├── RegretCard.tsx
│   │   └── RegretTrackerView.tsx
│   ├── subscriptions/
│   │   ├── AddSubscriptionModal.tsx
│   │   ├── SubscriptionCard.tsx
│   │   └── SubscriptionsView.tsx
│   ├── todos/
│   │   └── TodoView.tsx               # 신규 화면 (README에 미반영)
│   └── wants/
│       ├── AddWantModal.tsx
│       ├── WantCard.tsx
│       └── WantsView.tsx
├── contexts/
│   ├── CompactModeContext.tsx         # 간단뷰 토글 (모바일 스타일 강제)
│   └── LayoutContext.tsx              # 편집 모드 + 드래프트 layout + visibility
├── data/
│   └── mockData.ts
├── hooks/
│   ├── useDashboardLayout.ts          # layout 정규화 + localStorage 영속화
│   ├── useEscapeKey.ts
│   └── useLocalStorage.ts             # SSR-safe 제네릭 훅
├── lib/
│   ├── calculations.ts
│   ├── formatters.ts
│   └── labels.ts
└── types/
    ├── index.ts                       # Want / Subscription / Insight / Note / RegretItem / TodoItem / ViewKey
    └── layout.ts                      # WidgetId / SummaryCardId / DashboardLayout
```

> README의 "프로젝트 구조" 섹션에는 `contexts/`, `todos/`, `quick-add/`, `layout/grid/`, `layout/settings/` 가 누락돼 있다.

---

## 4. ViewKey (실제) vs README

- 실제: `"dashboard" | "wants" | "calculator" | "regret" | "subscriptions" | "insights" | "notes" | "todos"`
- README "구현된 기능": Todo 화면이 누락돼 있음.

---

## 5. 화면별 구현 상태

### 5.1 Dashboard

- `DashboardGrid.tsx`에서 `react-grid-layout`의 `Responsive` 컴포넌트로 위젯 배치.
- 위젯: `hero`, `summary-cards`, `want-preview`, `asset-snapshot`, `subscription-summary`, `recent-insights`, `todo-summary`.
- `hero`는 편집 불가 고정. 나머지 6개가 `editableWidgetIds`.
- 데스크탑(lg, 768px↑): 12-col 그리드, 자유 드래그/리사이즈 (`se` 핸들).
- 모바일/컴팩트(sm): 1-col 강제, 높이만 조절 가능.
- 위젯/요약 카드별 visibility 토글 → 모두 숨기면 빈 상태 안내 표시.
- Summary 카드는 `@dnd-kit`으로 별도 reorder.
- 모든 카드/위젯이 `localStorage` (`aiop:wants`, `aiop:subscriptions`, `aiop:insights`, `aiop:notes`, `aiop:todos`) 직접 읽어 계산.
- `useLayoutContext`의 `draftLayout` 패턴: 편집 모드 진입 시 draft → save 시 영속화, discard 시 폐기.

### 5.2 Wants / Subscriptions / Asset Calculator / Notes / Book Insights / Regret Tracker

- 모두 추가/삭제 + localStorage 영속화 완료.
- Insights/Regret도 v0.7/v0.8 모달 작성 완료. README 명세대로 동작.
- Wants 화면의 카테고리 필터는 여전히 시각만이고 실제 필터링 미연결 (확인 필요).

### 5.3 Todo (신규)

- `TodoView.tsx` + `TodoSummary.tsx` 위젯.
- 추가 / 우선순위(low/medium/high) / 상태 사이클(todo→doing→done) / 삭제.
- localStorage key: `aiop:todos`.
- README와 AGENTS.md 어느 쪽에도 명시돼 있지 않다. 로드맵에 반영되지 않은 기능.

### 5.4 컴팩트뷰 (간단뷰)

- Header의 `Smartphone` 버튼으로 토글.
- 활성화 시 사이드바 숨김 → `BottomTabBar` 노출, 본문 최대 폭 `max-w-md`.
- 데스크탑에서도 모바일 레이아웃을 강제로 볼 수 있음.

### 5.5 테마

- `aiop-theme-mode` (`dark` | `light`) localStorage 영속화.
- `<html data-theme>` attribute로 토글.

---

## 6. 로드맵 대비 진행도

| 단계 | 내용 | 상태 |
| --- | --- | --- |
| v0.1 | Frontend Layout MVP | 완료 |
| v0.2 | Asset Calculator | 완료 |
| v0.3 | Wants 로컬 CRUD | 완료 |
| v0.4 | localStorage 저장 | 완료 |
| v0.5 | Subscriptions 로컬 CRUD | 완료 |
| v0.6 | Notes 로컬 CRUD | 완료 |
| v0.7 | Book Insights 로컬 CRUD | 완료 |
| v0.8 | Regret Tracker 로컬 계산 | 완료 |
| v0.9 | Dashboard 데이터 통합 (localStorage 직참조) | 완료 |
| v1.0 | UI 품질 정리 + README 최종화 | 완료 |
| v1.1~v1.2 | 드래그&드롭 레이아웃 | **부분 완료** (코드는 거의 다 있음, 문서/검증/모바일 정책 미정) |
| v1.3 | 데이터 export / import | **미구현** |
| v2.0 | Supabase + Auth + AI Route Handler | **미구현** (`.agent-notes/aiop-v20-backend-plan.md` 존재 여부 미확인) |
| v2.1+ | AI 기능 4종 | **미구현** |

> 또한 로드맵 상에 없는 **Todo 화면** 과 **컴팩트뷰** 가 이미 들어가 있다. → README 갱신 필요.

---

## 7. 알려진 한계 / TODO (코드 측면)

### 7.1 Dashboard / 레이아웃

- `react-grid-layout` v2.2.3은 일반적인 v1.x API와 다르다 (`Responsive`, `useContainerWidth`, `dragConfig`, `resizeConfig`). 의존성 fork 또는 새 버전 사용 여부 확인 필요.
- `dashboard-grid-edit` CSS 클래스가 `globals.css`에 정의돼 있는지 확인 필요 (편집 모드 외곽선 등).
- 컴팩트뷰에서 1-col 강제는 잘 동작하지만, `narrowWidgetsOrder` reorder UX 검증 미진행 (드래그 핸들로 위/아래 이동만 가능).
- `WidgetFrame`의 드래그 핸들 클래스(`.widget-drag-handle`)가 비편집 모드에서도 cursor가 grab으로 보이는지 확인.
- Layout 정규화 (`useDashboardLayout`)에서 `editableWidgetIds`의 `minY`를 0으로 보정하는 로직이 있음 → 사용자가 위젯 위치를 모두 아래로 옮겼을 때 의도와 다르게 위로 당겨질 가능성.

### 7.2 데이터 / 안전망

- localStorage schema guard가 layout에만 존재. `aiop:wants` 등 도메인 데이터는 `Array.isArray` 정도만 체크하고 필드 검증은 없음. 잘못된 JSON 저장 시 런타임 에러 가능.
- v2.0 백엔드 이전 안전망인 `export / import` (v1.3) 미구현.
- `crypto.randomUUID()` 미지원 환경 fallback이 `Date.now()` 단일값 → 같은 ms에 추가 시 충돌 가능 (실사용 가능성은 매우 낮음).

### 7.3 명세 / 문서 정합성

- README "프로젝트 구조" 섹션이 실제 디렉토리 (`contexts/`, `todos/`, `quick-add/`, `layout/grid/`, `layout/settings/`) 미반영.
- README "구현된 기능"에 **Todo 화면**, **컴팩트뷰** 항목 누락.
- README "데이터 저장 방식" 표에 `aiop:todos`, `aiop:layout`, `aiop-compact-mode` 누락.
- AGENTS.md는 v0.8 시점에서 멈춰 있음 (확인 필요).
- 기존 `.agent-notes/current-status-and-structure.md`는 v0.8 시점이라 outdated.

### 7.4 UX 잔여

- Wants 카테고리 필터 동작 미연결 (UI만 존재 — 확인 필요).
- Notes status 변경 UI (`inbox / processed / archived`) 미구현.
- 검색 (Header의 검색창)이 시각만 있고 동작 없음.
- 모바일 (실기기) 검증 미진행.

---

## 8. 앞으로 해야할 일 (우선순위)

### 우선순위 1 — v1.1 ~ v1.2 마무리 (드래그&드롭)

1. **편집 모드 진입/이탈 UX 검증**
   - 편집 모드에서 위젯 외곽선, 드래그 핸들 hover 상태, resize 핸들 시각적 명확화.
   - `verify`: 데스크탑에서 위젯 위치/크기 변경 → 저장 → 새로고침 후 유지.
2. **컴팩트뷰 (mobile) 드래그 정책 확정**
   - 현재 1-col + 높이만 조절. 순서 변경은 어떻게? (드래그 핸들 / 위/아래 버튼 / DnD?)
   - `verify`: 폭 < 768px 에서 위젯 순서 변경 UX가 깨지지 않고 영속화되는지.
3. **`react-grid-layout` 의존성 확인**
   - npm 레지스트리에 `react-grid-layout ^2.2.3` 의 `Responsive`/`useContainerWidth`/`dragConfig` API가 실제로 존재하는지 확인. fork 사용 중이면 README 기술 스택에 명시.
4. **`globals.css` 의 `.dashboard-grid-edit`, `.widget-drag-handle` 등 스타일 정의 검토**
5. **레이아웃 초기화 시 정상 복귀 확인** — `resetLayout` 이후 6개 위젯이 기본 위치/크기로 복귀해야 함.

### 우선순위 2 — 문서 동기화

1. **README 갱신**
   - "구현된 기능"에 Todo, 컴팩트뷰, Dashboard 드래그&드롭, Summary 카드 reorder, 위젯/카드 visibility 추가.
   - "프로젝트 구조"에 `contexts/`, `todos/`, `quick-add/`, `layout/grid/`, `layout/settings/` 추가.
   - "데이터 저장 방식" 표에 `aiop:todos`, `aiop:layout`, `aiop-compact-mode` 추가.
   - "로드맵 요약"에 v1.0이 완료된 시점으로 정리되어 있는지 확인.
2. **AGENTS.md 보강**
   - Todo 화면, 컴팩트뷰, 드래그&드롭이 명세에 없음. 후속 작업자(다른 에이전트 포함) 입장에서 헷갈리지 않도록 추가.
3. **기존 `current-status-and-structure.md` 삭제 또는 deprecated 표시** — outdated 정보가 충돌을 만든다.

### 우선순위 3 — v1.3 데이터 export / import

1. JSON 1개 파일로 모든 `aiop:*` 키를 묶어 다운로드.
2. JSON 파일 업로드 → 검증 후 복원 (현재 데이터 덮어쓸지 머지할지 선택).
3. v2.0 Supabase 이전 시 마이그레이션 경로 확보.
4. `verify`: 서로 다른 브라우저에서 export → 다른 브라우저에서 import → 모든 화면 정상 표시.

### 우선순위 4 — UX 잔여

1. Wants 카테고리 필터 실동작 연결.
2. Notes status 변경 UI.
3. localStorage 도메인 데이터 schema guard (각 도메인 타입별 최소 필드 검증 + 실패 시 mock fallback 강화).
4. 실기기 모바일 검증 (가능하면 사파리 포함).

### 우선순위 5 — v2.0 백엔드 (한 묶음)

- 본격 시작 전 `.agent-notes/aiop-v20-backend-plan.md` 작성 (현재 파일 존재 여부 확인 필요).
- 그 전까지 Supabase / OAuth / AI API는 도입하지 않음 (README 정책 유지).

---

## 9. 검증 명령어

```bash
npm run dev       # 개발 서버
npm run build     # 빌드 (TypeScript 체크 포함)
npm run lint      # ESLint
npx tsc --noEmit  # 타입 체크만
```

`type-check` 전용 스크립트는 `package.json`에 정의돼 있지 않다.

---

## 10. 다음 세션 이어가기

이 문서를 기준으로 작업 시작:

```text
.agent-notes/aiop-current-status-and-next-steps.md 읽고 진행해줘
```

작업 단위로 들어갈 때는 우선순위 1번부터 차례대로 하되, 단계 하나가 끝나기 전에는 다음 단계로 넘어가지 않는다 (README 정책).

---

## 구현 결과

> 업데이트: 2026-05-11

### 변경 파일

- `src/hooks/useLocalStorage.ts`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/settings/HeaderSettingsButton.tsx`
- `src/components/layout/settings/SidebarSettingsButton.tsx`
- `src/components/layout/grid/DashboardGrid.tsx`
- `src/components/layout/grid/WidgetFrame.tsx`

### 구현 내용

- `useLocalStorage`의 hydrate effect에서 `initialValue` 참조가 렌더마다 바뀌며 `setValue`가 반복 호출되던 문제를 수정했다.
  - `initialValue`를 `useRef`로 고정했다.
  - localStorage 읽기 effect 의존성은 `key`만 사용하도록 정리했다.
- Dashboard 설정 드롭다운이 Summary 카드 및 위젯 아래에 가려지는 문제를 수정했다.
  - `Header`, `Sidebar`에 명시적인 stacking context를 추가했다.
  - Header/Sidebar 설정 메뉴 z-index를 상향했다.
- 우선순위 1 — v1.1~v1.2 레이아웃 마무리 범위에서 컴팩트뷰/모바일 위젯 순서 변경 UX를 보강했다.
  - 편집 모드에서 좁은 레이아웃일 때 위젯 우측 상단에 위/아래 이동 버튼을 표시한다.
  - 버튼 클릭 시 `narrowWidgetsOrder`와 `narrowWidgetHeights`가 draft layout에 반영된다.
  - 데스크탑 그리드 드래그/리사이즈 동작은 기존 방식 그대로 유지했다.
- 로컬 설치본 기준으로 `react-grid-layout` v2 API 존재를 확인했다.
  - `Responsive`
  - `useContainerWidth`
  - `dragConfig`
  - `resizeConfig`

### 확인 결과

```bash
npm run lint
npm run build
npx tsc --noEmit
```

- 세 명령 모두 통과했다.

### 남은 TODO

- 브라우저에서 Dashboard 편집 모드 수동 확인이 필요하다.
  - 데스크탑 위젯 위치/크기 변경 → 저장 → 새로고침 후 유지 확인.
  - 컴팩트뷰 또는 768px 미만 폭에서 위/아래 버튼으로 순서 변경 → 저장 → 새로고침 후 유지 확인.
  - 레이아웃 초기화 후 기본 위치/크기 복귀 확인.
- 실기기 모바일 검증은 아직 진행하지 않았다.
- 문서 동기화 우선순위 2는 아직 진행하지 않았다.
