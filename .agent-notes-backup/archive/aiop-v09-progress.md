# AIOP v0.9 Dashboard 데이터 통합 진행 기록

## 1. 작업 일자, 대상 파일

- 작업 일자: 2026-05-11
- 대상 범위: AGENTS.md Step 13, v0.9 Dashboard 데이터 통합
- 대상 파일:
  - `src/components/dashboard/SummaryCards.tsx`
  - `src/components/dashboard/WantPreview.tsx`
  - `src/components/dashboard/AssetSnapshot.tsx`
  - `src/components/dashboard/SubscriptionSummary.tsx`
  - `src/components/dashboard/RecentInsights.tsx`

## 2. 요구사항

사용자 요청:

```txt
aiop-v09-plan md파일 읽고 진행시켜
```

작업 목표:

- Dashboard가 mock data 고정값이 아니라 각 화면에서 이미 사용하는 localStorage 데이터를 읽도록 변경
- `aiop:wants`, `aiop:subscriptions`, `aiop:insights`, `aiop:notes` 데이터를 Dashboard에 반영
- SummaryCards, WantPreview, AssetSnapshot, SubscriptionSummary, RecentInsights 5개 컴포넌트 개선
- Notes Inbox 개수를 SummaryCards에 추가
- 데이터가 비어 있을 때 empty state UI 표시
- 백엔드, 인증, DB, 외부 API, AI API는 추가하지 않음

## 3. 동작 타임라인 또는 흐름

1. `.agent-notes/aiop-v09-plan.md`를 먼저 읽어 v0.9 작업 범위를 확인했다.
2. Dashboard 관련 5개 컴포넌트가 `src/data/mockData.ts`를 직접 import하고 모듈 스코프에서 고정 집계하는 상태임을 확인했다.
3. 기존 화면별 View는 이미 `useLocalStorage`를 사용하고 있으므로 Dashboard도 같은 패턴을 따르도록 결정했다.
4. Dashboard 컴포넌트 5개를 client component로 전환했다.
5. 각 컴포넌트에서 필요한 localStorage key를 직접 읽도록 연결했다.
6. 잘못된 localStorage 값이 들어와도 앱이 깨지지 않도록 배열이 아니면 mock data로 fallback하게 처리했다.
7. `npx.cmd tsc --noEmit`, `npm.cmd run build`로 검증했다.
8. `npm.cmd run lint`는 ESLint 설정이 없어 Next.js 설정 프롬프트가 떠서 완료하지 못했다.
9. `npm run dev`를 백그라운드로 실행했고 `http://localhost:3000` 응답 `200`을 확인했다.

## 4. 구현 방식

### localStorage fallback 패턴

Dashboard 컴포넌트에서는 기존 `useLocalStorage` 훅을 그대로 사용하되, 저장된 값의 구조가 깨진 경우를 대비해 배열 여부를 확인했다.

```tsx
function getStoredArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}
```

이유:

- localStorage에 `"invalid"` 같은 잘못된 값이 들어와도 Dashboard 렌더링이 깨지지 않게 하기 위함
- 기존 훅과 화면별 View 패턴을 유지하면서 변경 범위를 Dashboard 컴포넌트로 제한하기 위함

### SummaryCards

- `aiop:wants`
- `aiop:subscriptions`
- `aiop:insights`
- `aiop:notes`

위 4개 localStorage 데이터를 읽는다.

주요 집계:

```tsx
const monthlyTotal = useMemo(
  () => subscriptionItems.reduce((sum, item) => sum + item.monthlyPrice, 0),
  [subscriptionItems],
);

const coverableSpend = useMemo(
  () => wantItems.reduce((sum, item) => sum + item.price, 0),
  [wantItems],
);

const inboxNoteCount = useMemo(
  () => noteItems.filter((item) => (item.status ?? "inbox") === "inbox").length,
  [noteItems],
);
```

표시 카드:

- Wants
- Monthly subscriptions
- Target spend
- Recent insights
- Notes Inbox

### WantPreview

- `aiop:wants`를 읽어 최근 5개 항목을 표시한다.
- Wants 화면에서 새 항목은 리스트 상단에 추가되므로 `items.slice(0, 5)`를 최신 5개로 간주한다.
- 항목이 없으면 empty state를 표시한다.

```tsx
const previewItems = items.slice(0, 5);
```

### AssetSnapshot

- `aiop:wants`를 읽어 최신 Want인 `items[0]`을 기준으로 표시한다.
- `calculateRequiredCapital`을 사용해 필요 자산을 동적으로 계산한다.

```tsx
const targetItem = items[0];
const expectedYield = targetItem?.expectedYield ?? 0;
const requiredCapital = targetItem
  ? calculateRequiredCapital(targetItem.price, expectedYield)
  : 0;
```

### SubscriptionSummary

- `aiop:subscriptions`를 읽어 월 구독비와 상태별 개수를 집계한다.
- `review`, `cancel` 상태 항목을 리뷰/해지 후보로 표시한다.

```tsx
const summary = useMemo(() => {
  return {
    total: items.reduce((sum, item) => sum + item.monthlyPrice, 0),
    keepCount: items.filter((item) => item.status === "keep").length,
    reviewCount: items.filter((item) => item.status === "review").length,
    cancelCount: items.filter((item) => item.status === "cancel").length,
    actionItems: items
      .filter((item) => item.status === "review" || item.status === "cancel")
      .slice(0, 4),
  };
}, [items]);
```

### RecentInsights

- `aiop:insights`를 읽어 최근 3개 인사이트를 표시한다.
- 항목이 없으면 empty state를 표시한다.

```tsx
const recentItems = items.slice(0, 3);
```

## 5. 알려진 한계 / 후속 TODO

- `npm run lint`는 ESLint 설정이 없어 대화형 설정 프롬프트에서 중단된다.
- Dashboard 문구 일부는 기존 한글 인코딩 깨짐을 피하기 위해 영어로 정리했다.
- localStorage 데이터 구조 검증은 현재 배열 여부만 확인한다. v1.0 이후 필요하면 item 단위 schema guard를 추가할 수 있다.
- Dashboard와 각 화면이 같은 localStorage를 읽지만, 같은 화면 안에서 동시에 열린 컴포넌트 간 실시간 동기화용 Context는 아직 도입하지 않았다.
- `storage` 이벤트 기반 탭 간 동기화는 아직 구현하지 않았다.
- v1.0 후속 작업:
  - Step 14 UI 품질 정리
  - Step 15 README 업데이트
  - ESLint 설정 여부 결정

## 6. 변경 파일 목록

```txt
src/components/dashboard/SummaryCards.tsx
src/components/dashboard/WantPreview.tsx
src/components/dashboard/AssetSnapshot.tsx
src/components/dashboard/SubscriptionSummary.tsx
src/components/dashboard/RecentInsights.tsx
```

## 7. 검증 결과

실행한 명령:

```bash
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd run lint
```

결과:

- `npx.cmd tsc --noEmit`: 통과
- `npm.cmd run build`: 통과
- `npm.cmd run lint`: ESLint 미설정으로 Next.js 대화형 설정 프롬프트가 떠서 중단

개발 서버:

```bash
npm run dev
```

- 백그라운드 실행됨
- `http://localhost:3000` 응답 `200` 확인

## 8. 수동 테스트 체크리스트

```txt
[ ] Wants에서 항목 추가 후 Dashboard의 Wants 카드 개수가 증가한다.
[ ] Wants에서 항목 추가 후 WantPreview 상단에 새 항목이 표시된다.
[ ] Wants에서 항목 추가 후 AssetSnapshot이 새 항목 기준으로 갱신된다.
[ ] Subscriptions에서 항목 추가/삭제/상태 변경 후 Dashboard 구독 요약이 갱신된다.
[ ] Insights에서 항목 추가 후 RecentInsights 상단에 새 항목이 표시된다.
[ ] Notes에서 inbox 메모 추가 후 SummaryCards의 Notes Inbox 개수가 증가한다.
[ ] localStorage 값을 잘못된 값으로 바꿔도 Dashboard가 mock data로 fallback된다.
```
