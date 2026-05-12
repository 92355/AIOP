# AIOP — App Router 라우트 분리 계획 (D6)

> 작성일: 2026-05-11
> 짝 문서: `aiop-v20-decisions.md` (D6), `aiop-v20-backend-plan.md`
> 전제: v2.0 백엔드 코드 작업 시작 전, **선행 작업**으로 단독 PR.
> 외부 작업 (Supabase, OAuth) 불필요. 기존 localStorage 그대로 유지하면서 라우트 구조만 정리한다.

---

## 1. 목적

- 단일 `page.tsx` + `ViewKey` 스위칭 구조를 App Router 정식 라우트 7개로 분리한다.
- `?view=` 쿼리 동기화 / `popstate` 핸들러 / `hasHydratedView` 깜빡임 게이트 같은 우회 코드를 제거한다.
- 후속 v2.0 단계(RSC + Server Actions, 라우트별 캐시)의 토대를 만든다.
- 사용자에게 보이는 동작은 동일해야 한다 (기능 회귀 0).

---

## 2. 현재 구조 (변경 전)

```
src/app/
  layout.tsx          # html/body 만, metadata 정의
  page.tsx            # "use client", useState<ViewKey> 로 8개 뷰 스위칭
  globals.css
```

문제점:

- `page.tsx` 가 178줄로 점점 커지고 있다 (모든 모달 wiring, refreshKey 패턴, ?view= 동기화).
- 헤더 타이틀 / Sidebar / BottomTabBar 가 모두 `selectedView` 한 곳에 의존 → 라우트와 분리되어 URL ↔ UI 동기화 코드를 별도로 짜야 함 (현재 `?view=` 가 그것).
- Dashboard 위젯에서 다른 화면으로 이동할 때 `onSelectView` 콜백을 props 로 깊게 내려야 함.

---

## 3. 목표 구조

```
src/app/
  layout.tsx                       # RootLayout, AppShell 로 children wrap
  page.tsx                         # Dashboard (server component, DashboardGrid 만 렌더)
  wants/page.tsx
  calculator/page.tsx
  regret/page.tsx
  subscriptions/page.tsx
  insights/page.tsx
  notes/page.tsx
  todos/page.tsx
  globals.css
```

핵심 변화:

- `AppShell` 은 `src/app/layout.tsx` 로 끌어올린다 → 모든 라우트에서 동일.
- `selectedView` state 삭제. 대신 `usePathname()` → `pathToViewKey()` 로 현재 라우트를 도출.
- `onSelectView` 콜백 체인 삭제. Sidebar / BottomTabBar / SummaryCards 클릭 → `<Link href>` 또는 `router.push` 로 교체.
- QuickAdd 모달 wiring 은 `AppShell` 안에서 처리 (모든 라우트 공통 모달).
- `refreshKey` 패턴 삭제. 모달에서 추가 → 해당 라우트로 `router.push()` 이동 + `useLocalStorage` 가 mount 시 자동으로 최신 상태 읽음.

---

## 4. 영향받는 파일 (예상)

### 4.1 신규 추가

- `src/app/wants/page.tsx`
- `src/app/calculator/page.tsx`
- `src/app/regret/page.tsx`
- `src/app/subscriptions/page.tsx`
- `src/app/insights/page.tsx`
- `src/app/notes/page.tsx`
- `src/app/todos/page.tsx`

각 파일 본체는 5~10줄 (해당 View 컴포넌트 렌더). v2.0 에서 RSC + Server Action 으로 자연스럽게 확장.

### 4.2 수정

- `src/app/layout.tsx` — AppShell wrap. metadata 유지.
- `src/app/page.tsx` — Dashboard 전용으로 축소. ViewKey 스위칭 / 모달 wiring / ?view= 동기화 / refreshKey 제거.
- `src/components/layout/AppShell.tsx` — `selectedView` / `onSelectView` props 제거. 내부에서 `usePathname()` 사용. QuickAdd 상태 + 5개 Add Modal wiring 흡수.
- `src/components/layout/Header.tsx` — `title` props 제거 (또는 pathname 기반으로 내부 계산). `canCustomizeLayout` 도 `pathname === "/"` 로 자체 판단.
- `src/components/layout/Sidebar.tsx` — `selectedView / onSelectView` props 제거. `navItems` 를 `<Link href>` 로 렌더. active 상태는 `pathname` 비교.
- `src/components/layout/BottomTabBar.tsx` — 동일하게 `<Link>` + `pathname`.
- `src/components/layout/navItems.ts` — `NavItem` 에 `href` 필드 추가.
- `src/components/dashboard/SummaryCards.tsx` — `onSelectView` 제거. `SummaryCard.targetView` → `targetHref` 로 교체. `SummaryCardItem` 클릭 → `next/link` 또는 `useRouter().push(href)`.
- `src/components/layout/grid/DashboardGrid.tsx` — `onSelectView` props 제거 (SummaryCards 가 자체 라우팅).
- `src/components/quick-add/QuickAddModal.tsx` — 그대로. 다만 카테고리 선택 후 후속 동작 변경 (아래 §5.5).
- `src/types/index.ts` — `NavItem` 타입에 `href`.

### 4.3 삭제 (코드 조각)

- `src/app/page.tsx` 의 `isViewKey`, `getViewFromUrl`, `updateViewQuery`, `prependLocalStorageItem`, `hasHydratedView` 로직.
- AppShell 의 `selectedView / onSelectView` props 자리.
- Header 의 `title` props 자리.

---

## 5. 단계별 작업

### 5.1 NavItem 에 href 추가

`src/types/index.ts`:

```ts
export type NavItem = {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  href: string;
};
```

`src/components/layout/navItems.ts`:

```ts
export const navItems: NavItem[] = [
  { key: "dashboard", label: viewTitles.dashboard, icon: BarChart3, href: "/" },
  { key: "wants", label: viewTitles.wants, icon: Sparkles, href: "/wants" },
  { key: "calculator", label: "계산기", icon: Calculator, href: "/calculator" },
  { key: "regret", label: "후회 기록", icon: TrendingUp, href: "/regret" },
  { key: "subscriptions", label: "구독", icon: CreditCard, href: "/subscriptions" },
  { key: "insights", label: "인사이트", icon: BookOpen, href: "/insights" },
  { key: "notes", label: "노트", icon: Inbox, href: "/notes" },
  { key: "todos", label: "Todo", icon: CheckSquare, href: "/todos" },
];
```

부수 유틸 추가:

```ts
export function getViewKeyFromPathname(pathname: string): ViewKey {
  if (pathname === "/" || pathname.startsWith("/?")) return "dashboard";
  const segment = pathname.split("/")[1] as ViewKey | undefined;
  return navItems.some((item) => item.key === segment) ? (segment as ViewKey) : "dashboard";
}
```

### 5.2 7개 page.tsx 신규

각 파일 패턴 (예 `src/app/wants/page.tsx`):

```tsx
import { WantsView } from "@/components/wants/WantsView";

export default function WantsPage() {
  return <WantsView />;
}
```

`src/app/page.tsx` 는 다음과 같이 단순화:

```tsx
import { DashboardGrid } from "@/components/layout/grid/DashboardGrid";

export default function Home() {
  return <DashboardGrid />;
}
```

> v1.x 단계에서는 View 컴포넌트가 모두 `"use client"` 이므로 page.tsx 는 그대로 서버 컴포넌트(default) 로 둘 수 있다. v2.0 에서 page.tsx 가 직접 데이터 fetch 하도록 확장 예정.

### 5.3 AppShell 을 layout.tsx 로 이동

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIOP",
  description: "개인 운영 페이지",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

`AppShell` 시그니처 변경:

```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  // selectedView, onSelectView, onOpenQuickAdd props 삭제
  // 내부에서 usePathname() → currentView
  // QuickAdd 상태 + Add Modal wiring 흡수
}
```

### 5.4 Sidebar / BottomTabBar / Header

- Sidebar: `<button onClick={onSelectView(key)}>` → `<Link href={item.href}>`. active 판정은 `usePathname() === item.href` 또는 prefix 매칭.
- BottomTabBar: 동일.
- Header: `title` props 제거 → 내부에서 `usePathname` → `viewTitles[getViewKeyFromPathname(pathname)]`. `canCustomizeLayout` 도 자체 판단.
- 모든 컴포넌트가 `"use client"` 인 상태에서 `usePathname()` 사용 가능.

### 5.5 QuickAdd 흐름 재설계

기존: 모달 추가 → `prependLocalStorageItem` 으로 직접 localStorage 갱신 → `refreshKey++` 로 view 재마운트.

신규:

1. 모달 추가는 그대로 (각 화면의 View 컴포넌트가 자체적으로 `useLocalStorage` 로 관리).
2. **추가된 항목의 화면으로 자동 이동**:
   - want 추가 → `router.push("/wants")` + `wants` 페이지에서 mount 시 localStorage 재읽기.
   - 다만 다른 화면 페이지의 `useLocalStorage` 가 이미 mount 돼있다면 (같은 라우트에서 빠른 추가) state 가 stale.
3. 해결 — 두 가지 옵션:
   - **옵션 A**: `prependLocalStorageItem` 패턴은 유지하되, 추가 후 `router.push(targetHref)` + 만약 같은 라우트면 `router.refresh()` 호출. `useLocalStorage` 가 mount 시 hydration 하므로 충분.
   - **옵션 B**: `useLocalStorage` 훅에 storage 이벤트 + same-tab broadcast 추가. 같은 탭에서도 다른 컴포넌트가 변경을 감지하도록.

추천: **옵션 A**. 단순하고 빠른 추가의 의도(해당 화면으로 가서 결과를 보고 싶음)와 잘 맞는다. `router.refresh()` 만으로 RSC 단계에서도 자연스럽게 확장.

구현 위치: `AppShell` 안의 `handleAddedItem`:

```tsx
const router = useRouter();

function handleAddedItem<T>(targetHref: string, storageKey: string, item: T, fallback: T[]) {
  prependLocalStorageItem(storageKey, item, fallback);
  if (pathname === targetHref) {
    router.refresh();
  } else {
    router.push(targetHref);
  }
  setActiveCategory(null);
}
```

### 5.6 `prependLocalStorageItem` 의 위치

- 현재 `src/app/page.tsx` 에 헬퍼로 있다.
- 라우트 분리 후 `AppShell` 안으로 옮김. 또는 `src/lib/storage.ts` 같은 공용 위치로.
- 추천: `src/lib/storage.ts` 신규 + AppShell 이 import.

### 5.7 SummaryCards 클릭 이동

- `SummaryCard.targetView` → `targetHref` 로 교체.
- `SummaryCardItem` 의 클릭 핸들러 → `<Link href={card.targetHref}>` 또는 `useRouter().push(card.targetHref)`.
- 편집 모드일 때 (드래그 상태) 는 `<Link>` 가 동작하지 않도록 — 현재 `isEditMode` 분기 그대로 유지.
- dnd-kit listener 와 Link 충돌을 피하려면 비편집 모드에서만 `<Link>` 로 wrap.

### 5.8 ?view= / popstate / hasHydratedView 삭제

- 모두 삭제.
- 외부 링크 (`/?view=wants`) 가 어딘가 공유돼 있을 수 있으므로, `src/app/page.tsx` 에 호환 리다이렉트 1회 둘지 결정:
  - 옵션 1: `src/middleware.ts` 에서 `?view=` 발견 시 해당 라우트로 308.
  - 옵션 2: 무시. 본인 사용이라 외부 링크 없음.
  - 추천: 옵션 2.

---

## 6. 깨질 수 있는 것 (Risks)

- **localStorage 가 라우트 이동 시 다시 읽힘**: `useLocalStorage` 가 mount 마다 `getItem` 하므로 정상. 다만 같은 라우트에서 빠른 추가 + 추가 직후 본문이 같은 화면 → `router.refresh()` 가 client component 의 state 를 reset 하지는 않음. 이 케이스는 추가 후 같은 화면에서 즉시 항목이 안 보일 가능성. 대응:
  - `prependLocalStorageItem` 호출 후 `window.dispatchEvent(new StorageEvent("storage", ...))` 발생 → `useLocalStorage` 가 같은 탭에서도 감지하도록 확장.
  - 또는 같은 라우트면 `window.location.reload()` 호출. 단순하지만 hard reload.
  - 또는 옵션 A 그대로 두고, "같은 화면에서 빠른 추가" 케이스는 사용자가 해당 화면의 자체 추가 버튼을 쓰면 되므로 의도된 동작으로 받아들임.
  - **추천**: 후자. 같은 화면에서는 화면 자체 추가 버튼 쓰면 즉시 반영.
- **Dashboard 편집 모드 / hero 편집**: AppShell 에서 모든 라우트에 LayoutProvider 가 들어가는데, Hero 편집 / 레이아웃 편집은 Dashboard 에서만 의미 있음. 현재도 `canCustomizeLayout` 분기로 Dashboard 에서만 설정 버튼 노출 중 → 그대로.
- **검색 상태 유지**: SearchProvider 가 layout.tsx 단으로 올라가므로 라우트 이동 시에도 검색어가 유지된다. 기존 동작 유지 (단일 페이지 안에서 검색어가 유지됐던 것과 동일).
- **컴팩트 모드 / 테마**: `aiop-compact-mode`, `aiop-theme-mode` 도 동일하게 유지.

---

## 7. 검증 항목 (verify)

빌드 / 타입:

- [ ] `npx tsc --noEmit` 통과.
- [ ] `npm run lint` 통과.
- [ ] `npm run build` 통과, 7개 page route 모두 `○ (Static)` 으로 prerender.

브라우저 수동:

- [ ] `/` 로 진입 시 Dashboard 표시.
- [ ] `/wants` 직진입 → 즉시 Wants 화면, 깜빡임 없음.
- [ ] Sidebar 클릭 → URL 변경 + 화면 전환.
- [ ] BottomTabBar 클릭 동일.
- [ ] SummaryCard 클릭 (비편집) → 해당 라우트로 이동.
- [ ] Dashboard 편집 모드에서 SummaryCard 클릭이 라우트 이동 트리거하지 않음 (드래그만).
- [ ] Header `빠른 추가` → QuickAddModal → 카테고리 선택 → Add Modal → 저장 후 해당 라우트로 이동 + 항목이 보임.
- [ ] 같은 라우트에서 빠른 추가 시: 화면 자체 추가 버튼 권장 안내 또는 dispatchEvent 패턴 동작.
- [ ] 라이트 / 다크 토글 유지.
- [ ] 컴팩트 모드 토글 유지.
- [ ] 검색어 입력 후 라우트 이동 시 검색어 유지 (의도된 동작).
- [ ] 브라우저 뒤로가기 / 앞으로가기 → URL + 화면 정상 복원.
- [ ] 새로고침 후 현재 라우트 그대로 유지.

기능 회귀:

- [ ] Dashboard 레이아웃 편집 / 저장 / 초기화.
- [ ] Wants 카테고리 필터.
- [ ] Notes status 사이클.
- [ ] Subscription / Insight / Regret / Todo CRUD.
- [ ] 데이터 export / import (Settings 메뉴).

---

## 8. 작업 순서 (커밋 단위)

1. **타입 + navItems** — `NavItem.href` 추가, `getViewKeyFromPathname` 헬퍼. 빌드 통과.
2. **7개 page.tsx 신규** — 각 5~10줄. 이 시점에서 `/wants` 등 URL 직접 접근 가능하지만 Sidebar 는 아직 onSelectView.
3. **AppShell 이동** — `layout.tsx` 에서 children wrap. `selectedView` props 제거. 내부 `usePathname()` 도입. Header / Sidebar / BottomTabBar 의 props 도 그에 맞춰 정리.
4. **Link 교체** — Sidebar / BottomTabBar / SummaryCards 의 클릭 → `<Link>` 또는 `router.push`.
5. **QuickAdd wiring 흡수** — AppShell 안으로 모달 5개 + 핸들러 이동. `prependLocalStorageItem` 을 `src/lib/storage.ts` 로 추출.
6. **page.tsx 정리** — `?view=`, `hasHydratedView`, `refreshKey`, popstate 핸들러 삭제. Dashboard 만 렌더.
7. **검증 + 문서 갱신** — README "프로젝트 구조" 섹션의 src/app 추가, AGENTS.md 최신 진행 상태에 D6 적용 완료 표시.

각 커밋 후 `npx tsc --noEmit` + 화면 동작 1회 확인.

---

## 9. 예상 변경 규모

- 신규 파일: 7 (page.tsx) + 1 (`src/lib/storage.ts`) + 1 (선택, 라우트 헬퍼)
- 수정 파일: `layout.tsx`, `page.tsx`, `AppShell`, `Header`, `Sidebar`, `BottomTabBar`, `navItems.ts`, `SummaryCards`, `DashboardGrid`, `types/index.ts` 약 10개
- 삭제 코드: ~50줄 (`?view=` 동기화, refreshKey 패턴)
- 순 증가: ~80~100줄 예상

---

## 10. 후속 (이 PR 이후 v2.0 본 작업으로 이어짐)

- 각 page.tsx 가 Server Component 가 되어 데이터 fetch 자리 마련 (`async function WantsPage() { const items = await getWants(); ... }`).
- `useLocalStorage` 호출 자리가 → `getWants()` 서버 호출 + props 전달로 교체될 위치 명확.
- Supabase 도입 후 mappers.ts + Server Action 추가가 자연스럽게 끼워들어감.

---

## 세션 이어가기

```text
.agent-notes/aiop-v20-route-split-plan.md 읽고 단계 1번부터 진행해줘
```

특정 단계만:

```text
.agent-notes/aiop-v20-route-split-plan.md 의 단계 3번 (AppShell 이동) 진행해줘
```
