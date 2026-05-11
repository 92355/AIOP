# AIOP — App Router 라우트 분리 진행사항

> 작성일: 2026-05-11
> 기준 계획서: `.agent-notes/aiop-v20-route-split-plan.md`

---

## 진행 요약

- 단일 `src/app/page.tsx` + `ViewKey` 스위칭 구조를 App Router 라우트 구조로 분리했다.
- `AppShell`을 `src/app/layout.tsx`로 이동해 모든 라우트 공통 shell로 적용했다.
- Sidebar, BottomTabBar, SummaryCards 이동 방식을 state callback에서 `next/link` 기반 라우팅으로 변경했다.
- QuickAdd 모달 wiring을 `AppShell`로 흡수하고, 항목 저장 후 해당 라우트로 이동하도록 정리했다.
- `useLocalStorage`에 같은 탭 localStorage 변경 이벤트와 다른 탭 삭제 / clear 대응을 추가했다.
- 라우트 active 판정 helper를 `navItems.ts`에 모아 Header / Sidebar / BottomTabBar가 같은 기준을 사용하게 했다.

---

## 변경 파일

### 신규 파일

- `src/app/wants/page.tsx`
- `src/app/calculator/page.tsx`
- `src/app/regret/page.tsx`
- `src/app/subscriptions/page.tsx`
- `src/app/insights/page.tsx`
- `src/app/notes/page.tsx`
- `src/app/todos/page.tsx`
- `src/lib/storage.ts`

### 수정 파일

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/BottomTabBar.tsx`
- `src/components/layout/navItems.ts`
- `src/components/layout/grid/DashboardGrid.tsx`
- `src/components/dashboard/SummaryCards.tsx`
- `src/hooks/useLocalStorage.ts`
- `src/types/index.ts`
- `README.md`
- `AGENTS.md`

---

## 구현 내용

### 라우트 분리

- `/`는 Dashboard 전용 라우트로 유지했다.
- 다음 라우트를 신규 추가했다.
  - `/wants`
  - `/calculator`
  - `/regret`
  - `/subscriptions`
  - `/insights`
  - `/notes`
  - `/todos`
- 기존 `?view=` 쿼리 동기화, `popstate`, `hasHydratedView`, `refreshKey` 기반 화면 스위칭 코드를 제거했다.

### AppShell 정리

- `AppShell`을 root layout에서 children을 감싸는 구조로 변경했다.
- `selectedView`, `onSelectView`, `onOpenQuickAdd` props를 제거했다.
- QuickAdd 상태와 Add Modal wiring을 `AppShell` 내부로 이동했다.

### 내비게이션 정리

- `NavItem`에 `href` 필드를 추가했다.
- Sidebar / BottomTabBar는 `Link href`로 이동한다.
- SummaryCards도 비편집 모드에서 `Link`로 해당 라우트로 이동한다.
- 편집 모드에서는 기존처럼 드래그 / 정렬 동작만 수행한다.

### 라우트 helper 리팩터링

- `src/components/layout/navItems.ts`에 다음 helper를 추가했다.
  - `isDashboardPathname`
  - `isNavItemActive`
  - `getActiveNavItem`
  - `getViewKeyFromPathname`
- 하위 라우트가 생겨도 `/wants/123` 같은 경로에서 상위 nav item이 active 처리되도록 했다.
- Dashboard 설정 버튼은 정확히 `/`에서만 표시되도록 정리했다.

### localStorage 동기화

- `src/lib/storage.ts`에 `prependLocalStorageItem`을 분리했다.
- QuickAdd 저장 시 localStorage에 prepend 후 `aiop:local-storage-change` 이벤트를 발생시킨다.
- `useLocalStorage`가 같은 탭 이벤트를 수신해 현재 화면 상태를 갱신한다.
- 다른 탭에서 key 삭제 또는 `localStorage.clear()`가 발생하면 초기값으로 fallback하도록 보강했다.

---

## 확인 결과

```bash
npx tsc --noEmit
```

- 통과

```bash
npm run lint
```

- 통과
- 참고: `next lint` deprecated 경고가 출력되지만 lint error는 없음.

```bash
npm run build
```

- 통과
- Static route 생성 확인:
  - `/`
  - `/_not-found`
  - `/calculator`
  - `/insights`
  - `/notes`
  - `/regret`
  - `/subscriptions`
  - `/todos`
  - `/wants`

---

## 수동 확인 필요

- 브라우저에서 Sidebar 클릭 시 URL 변경 + 화면 전환 확인.
- 컴팩트뷰 BottomTabBar 클릭 시 URL 변경 + 화면 전환 확인.
- Dashboard SummaryCard 클릭 시 해당 라우트 이동 확인.
- Dashboard 편집 모드에서 SummaryCard 클릭이 라우팅되지 않고 드래그만 동작하는지 확인.
- QuickAdd 저장 후 해당 라우트로 이동하고 항목이 보이는지 확인.
- 같은 라우트에서 QuickAdd 저장 시 목록이 즉시 갱신되는지 확인.
- 브라우저 뒤로가기 / 앞으로가기 동작 확인.
- 새로고침 후 현재 라우트 유지 확인.
- 데이터 export / import 동작 확인.

---

## 참고 사항

- `npm run dev`는 3000 포트 사용 중으로 3001 / 3002에서 실행 로그가 찍혔으나, PowerShell `Invoke-WebRequest`에서는 연결 거부가 발생했다.
- `npm run build`는 정상 통과했으므로 컴파일 / 타입 / 정적 라우트 생성은 확인 완료했다.
- 작업 트리에 기존 `.agent-notes/aiop-v20-backend-plan.md`, `.agent-notes/aiop-v20-decisions.md`, `tsconfig.tsbuildinfo` 변경이 함께 존재한다.

---

## 남은 TODO

- 브라우저 기반 수동 QA 수행.
- `tsconfig.tsbuildinfo`를 커밋 대상에 포함할지 확인.
- dev server 연결 문제 원인 확인이 필요하면 별도 작업으로 분리.
