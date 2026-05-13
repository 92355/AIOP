# 페이지 로딩 속도 개선 계획

## 작업 일자
2026-05-13

## 현재 상황
- Next.js App Router + RSC(React Server Components) 구조
- 페이지 이동 시 `router.push()` + `router.refresh()` 사용 (AppShell.tsx)
- 각 페이지에 `loading.tsx`로 Suspense boundary 있음
- 3-1은 완료: BottomTabBar, Sidebar의 `<Link>` 에 `prefetch` prop 추가

## 완료된 작업
- **3-1 Link prefetch** — `BottomTabBar.tsx`, `Sidebar.tsx` 의 `<Link>` 에 `prefetch` 추가
  - 앱 로드 즉시 모든 페이지의 RSC payload를 백그라운드에서 미리 받아옴
  - 적용 후 두 번째 방문부터 즉각 전환됨

---

## 남은 작업

### 3-2: 데이터 캐싱 (unstable_cache)

**목표:** 서버에서 동일 데이터를 반복 조회할 때 캐시 반환 → 페이지 전환 시 DB 왕복 제거

**구현 위치:** 각 페이지의 Server Action 또는 데이터 fetching 함수

**방법:**
```typescript
import { unstable_cache } from "next/cache";

// 예시: src/app/wants/actions.ts
export const getWants = unstable_cache(
  async (userId: string) => {
    // supabase 쿼리
    return data;
  },
  ["wants"],
  {
    revalidate: 60,       // 60초 TTL
    tags: ["wants"],      // 태그로 수동 무효화 가능
  }
);
```

**수동 무효화 (데이터 변경 시):**
```typescript
import { revalidateTag } from "next/cache";
// 항목 추가/수정/삭제 후 호출
revalidateTag("wants");
```

**적용 대상 파일:**
- `src/app/wants/actions.ts`
- `src/app/subscriptions/actions.ts`
- `src/app/insights/actions.ts`
- `src/app/regret/actions.ts`
- `src/app/notes/actions.ts`
- `src/app/todos/actions.ts`
- `src/app/retros/actions.ts`

**주의사항:**
- `unstable_cache`는 Next.js 14+에서 사용 가능
- 사용자별 데이터면 userId를 캐시 키에 포함해야 함
- 쓰기 작업 후 반드시 `revalidateTag()` 호출해야 함

---

### 3-3: Optimistic UI (useOptimistic)

**목표:** 서버 응답을 기다리지 않고 즉시 UI 반영 → `router.refresh()` 의존 제거

**현재 문제:** `AppShell.tsx`의 `handleAddedItem`이 서버 action 완료 후 `router.push()` + `router.refresh()`를 순서대로 호출 → 체감 느림

**구현 방향:**

각 페이지를 RSC → Client Component로 전환 + `useOptimistic` 적용

```typescript
// 예시: WantsView.tsx 에서 적용
"use client";
import { useOptimistic, useTransition } from "react";

export function WantsView({ initialItems }: { initialItems: WantItem[] }) {
  const [items, addOptimistic] = useOptimistic(
    initialItems,
    (state, newItem: WantItem) => [newItem, ...state]
  );
  const [isPending, startTransition] = useTransition();

  function handleAdd(newItem: WantItem) {
    startTransition(async () => {
      addOptimistic(newItem);       // 즉시 UI 반영
      await createWant(newItem);    // 백그라운드에서 서버 저장
    });
  }

  return (/* 렌더링 */);
}
```

**적용 시 변경 필요 파일:**
- 각 View 컴포넌트 (WantsView, SubscriptionsView 등)를 Client Component로 전환
- `AppShell.tsx`에서 `router.refresh()` 호출 제거 (또는 최소화)
- 각 페이지 `page.tsx`에서 초기 데이터를 prop으로 View에 전달

**주의사항:**
- 서버 저장 실패 시 롤백 처리 필요 (`try/catch` + state 복원)
- 3-2(캐싱)와 함께 적용하면 상호 보완 효과 있음
- 현재 구조가 RSC 기반이라 전환 비용이 있음 (파일당 30분 내외 예상)

---

## 작업 순서 권장

1. 3-2 먼저 적용 (변경 최소, 효과 즉시)
2. 효과 확인 후 3-3 적용 (구조 변경 큼, 가장 효과적)

## 관련 파일
- `src/components/layout/AppShell.tsx` — router.push/refresh 위치
- `src/components/layout/BottomTabBar.tsx` — prefetch 완료
- `src/components/layout/Sidebar.tsx` — prefetch 완료
- `src/app/**/actions.ts` — 캐싱 적용 대상
