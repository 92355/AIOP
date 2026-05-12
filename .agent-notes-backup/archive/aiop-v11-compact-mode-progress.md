# AIOP v1.1 간단뷰 구현 진행사항

## 1. 작업 일자, 대상 파일

- 작업 일자: 2026-05-11
- 대상 범위:
  - `src/contexts/CompactModeContext.tsx`
  - `src/components/layout/*`
  - `src/components/dashboard/*`
  - `src/components/wants/*`
  - `src/components/subscriptions/*`
  - `src/components/insights/*`
  - `src/components/regret/*`
  - `src/components/notes/*`
  - `src/components/calculator/AssetCalculatorView.tsx`
  - `src/app/page.tsx`

## 2. 요구사항

사용자 요청:

```txt
aiop-v11-compact-mode-plan 읽고 진행해
```

진행 기준:

- `.agent-notes/aiop-v11-compact-mode-plan.md`를 먼저 읽고 이어서 작업
- Header 우측 알림 버튼을 간단뷰 토글 버튼으로 재활용
- 간단뷰 상태를 localStorage에 저장
- 간단뷰에서 Sidebar를 숨기고 하단 탭바로 전환
- Dashboard, 도메인 View, 카드, 모달을 모바일 친화적으로 압축
- 백엔드, 인증, DB, 외부 API, AI API는 추가하지 않음
- 기존 localStorage 데이터 흐름과 빠른 추가 동선 유지
- TypeScript 에러 없이 처리

명시 답변이 없던 선택지는 다음 기본값으로 진행:

- 토글 아이콘: `Smartphone`
- 하단 탭바: ViewKey 7개 모두 표시
- 간단뷰 컨테이너 폭: 데스크탑에서도 `max-w-md` 중앙 정렬
- 간단뷰 Header 검색바: 숨김

## 3. 동작 타임라인 / 흐름

1. 사용자가 Header의 기존 알림 자리 버튼을 클릭한다.
2. `toggleCompact()`가 실행되어 `isCompact` 상태가 전환된다.
3. `useLocalStorage<boolean>("aiop-compact-mode", false)`를 통해 상태가 localStorage에 저장된다.
4. 일반뷰일 때:
   - 좌측 Sidebar 표시
   - 기존 main padding/layout 유지
   - Header 검색바 표시
5. 간단뷰일 때:
   - Sidebar 숨김
   - main 영역을 `max-w-md` 중앙 정렬
   - 하단 고정 `BottomTabBar` 표시
   - Header 검색바 숨김
   - Dashboard helper text와 보조 설명 축소
   - 도메인 View/Card는 단일 컬럼과 축약 메타 위주로 표시
   - Add Modal과 QuickAddModal은 거의 풀스크린 형태로 표시
6. 새로고침 후에도 `aiop-compact-mode` 값에 따라 마지막 상태가 복원된다.

## 4. 구현 방식

### CompactModeContext

`src/contexts/CompactModeContext.tsx`를 추가했다.

```tsx
type CompactModeContextValue = {
  isCompact: boolean;
  setCompact: (nextValue: boolean) => void;
  toggleCompact: () => void;
};
```

핵심 구현:

```tsx
const [isCompact, setIsCompact] = useLocalStorage<boolean>(
  "aiop-compact-mode",
  false,
);
```

이유:

- 여러 View, 카드, 모달에서 같은 간단뷰 상태를 참조해야 하므로 Context로 공유하는 방식이 가장 단순하다.
- 기존 테마 저장 방식과 같은 localStorage 패턴을 사용했다.

### 공통 네비게이션 데이터 분리

`src/components/layout/navItems.ts`를 추가했다.

```tsx
export const viewTitles: Record<ViewKey, string> = {
  dashboard: "대시보드",
  wants: "구매 목표",
  calculator: "자산 구매 계산기",
  regret: "후회 기록장",
  subscriptions: "구독 관리",
  insights: "인사이트 보관함",
  notes: "노트 / 수집함",
};
```

이유:

- Sidebar와 BottomTabBar가 같은 ViewKey 목록을 공유하도록 중복을 줄였다.
- 하단 탭바 라벨은 좁은 폭에 맞게 일부 짧은 라벨을 사용한다.

### AppShell 레이아웃 분기

`src/components/layout/AppShell.tsx`에서 `CompactModeProvider`로 감싸고 내부 레이아웃을 분기했다.

```tsx
{isCompact ? null : (
  <Sidebar selectedView={selectedView} onSelectView={onSelectView} />
)}

{isCompact ? (
  <BottomTabBar selectedView={selectedView} onSelectView={onSelectView} />
) : null}
```

간단뷰 main 영역:

```tsx
"mx-auto max-w-md px-3 py-4 pb-24 md:h-[calc(100vh-88px)] md:overflow-y-auto"
```

이유:

- 모바일 사용성을 우선하면서 데스크탑에서도 간단뷰가 너무 넓게 퍼지지 않도록 했다.
- 하단 탭바 높이만큼 `pb-24`를 줘 마지막 콘텐츠가 가려지지 않게 했다.

### Header 토글 버튼

`src/components/layout/Header.tsx`에서 기존 Bell placeholder를 `Smartphone` 토글 버튼으로 교체했다.

```tsx
<button
  title={isCompact ? "일반뷰" : "간단뷰"}
  aria-label={isCompact ? "일반뷰로 변경" : "간단뷰로 변경"}
  aria-pressed={isCompact}
  onClick={toggleCompact}
>
  <Smartphone className="h-4 w-4" />
</button>
```

이유:

- 기존 알림 기능은 실제 동작이 없는 placeholder였기 때문에 간단뷰 토글로 재활용했다.
- 접근성을 위해 `aria-pressed`와 상태별 `aria-label`을 지정했다.

### BottomTabBar

`src/components/layout/BottomTabBar.tsx`를 추가했다.

```tsx
<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur">
```

이유:

- 간단뷰에서 Sidebar를 대체하는 하단 고정 네비게이션을 제공한다.
- `safe-area-inset-bottom`을 반영해 iOS 홈 인디케이터 영역을 피한다.

### Dashboard 압축

수정 대상:

- `SummaryCards.tsx`
- `WantPreview.tsx`
- `AssetSnapshot.tsx`
- `SubscriptionSummary.tsx`
- `RecentInsights.tsx`
- `src/app/page.tsx`의 `DashboardView`

간단뷰에서 적용한 방향:

- helper text 숨김
- 보조 메모 숨김
- 카드 padding 축소
- 2열 요약 카드 사용
- action item, status chip 등 일부 부가 메타 숨김

예시:

```tsx
{isCompact ? null : (
  <p className="mt-4 text-sm text-zinc-500">{card.helper}</p>
)}
```

### 도메인 View/Card 압축

수정 대상:

- Wants
- Subscriptions
- Insights
- Regret
- Notes
- Asset Calculator

간단뷰에서 적용한 방향:

- View 제목 크기 축소
- 보조 설명 숨김
- grid를 단일 컬럼으로 변경
- 카드 padding 축소
- 긴 텍스트 `line-clamp` 강화
- 일부 상태 칩과 부가 메타 숨김

예시:

```tsx
<div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-2"}`}>
```

### Modal 풀스크린화

수정 대상:

- `QuickAddModal.tsx`
- `AddWantModal.tsx`
- `AddSubscriptionModal.tsx`
- `AddInsightModal.tsx`
- `AddRegretItemModal.tsx`
- `AddNoteModal.tsx`

간단뷰 컨테이너:

```tsx
isCompact
  ? "h-[100dvh] max-w-full rounded-none p-4"
  : "max-h-[90vh] max-w-2xl rounded-2xl p-6"
```

이유:

- 모바일에서 모달이 좁은 화면에 어색하게 뜨지 않고 화면 전체를 사용하도록 했다.
- 기존 폼 검증과 저장 로직은 건드리지 않고 시각 컨테이너만 분기했다.

## 5. 알려진 한계 / 후속 TODO

- 실제 브라우저에서 360px / 414px / 768px / 1024px / 1440px responsive 확인은 아직 수동으로 남아 있다.
- 하단 탭바 7개 전체 표시는 360px에서도 동작하도록 작게 만들었지만, 라벨 가독성은 실제 기기에서 확인 필요하다.
- 모달 풀스크린 상태에서 모바일 키보드가 올라올 때 저장 버튼 접근성은 추가 검증이 필요하다.
- `tsconfig.tsbuildinfo`는 `tsc` 실행으로 갱신됐다. 커밋 대상 여부는 별도 판단 필요.
- 작업 전부터 `README.md`, `.eslintrc.json`, `src/hooks/useEscapeKey.ts` 등 이미 작업 트리에 있던 변경/미추적 파일이 있었다.

## 6. 변경 파일 목록

이번 작업에서 직접 추가한 파일:

```txt
src/contexts/CompactModeContext.tsx
src/components/layout/BottomTabBar.tsx
src/components/layout/navItems.ts
```

이번 작업에서 수정한 파일:

```txt
src/app/page.tsx
src/components/calculator/AssetCalculatorView.tsx
src/components/dashboard/AssetSnapshot.tsx
src/components/dashboard/RecentInsights.tsx
src/components/dashboard/SubscriptionSummary.tsx
src/components/dashboard/SummaryCards.tsx
src/components/dashboard/WantPreview.tsx
src/components/insights/AddInsightModal.tsx
src/components/insights/BookInsightsView.tsx
src/components/insights/InsightCard.tsx
src/components/layout/AppShell.tsx
src/components/layout/Header.tsx
src/components/layout/Sidebar.tsx
src/components/notes/AddNoteModal.tsx
src/components/notes/NotesInboxView.tsx
src/components/quick-add/QuickAddModal.tsx
src/components/regret/AddRegretItemModal.tsx
src/components/regret/RegretCard.tsx
src/components/regret/RegretTrackerView.tsx
src/components/subscriptions/AddSubscriptionModal.tsx
src/components/subscriptions/SubscriptionCard.tsx
src/components/subscriptions/SubscriptionsView.tsx
src/components/wants/AddWantModal.tsx
src/components/wants/WantCard.tsx
src/components/wants/WantsView.tsx
```

검증/빌드 실행으로 변경된 파일:

```txt
tsconfig.tsbuildinfo
```

작업 전부터 변경 또는 미추적 상태였던 파일:

```txt
README.md
.eslintrc.json
src/hooks/useEscapeKey.ts
```

## 7. 검증 결과

실행한 명령:

```bash
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd run lint
```

결과:

- TypeScript 검사 통과
- Next.js production build 통과
- ESLint 경고/오류 없음

PowerShell에서 `npx tsc --noEmit`은 실행 정책 때문에 `npx.ps1`이 차단되어 실패했다.
동일 검사를 `npx.cmd tsc --noEmit`으로 실행해 통과했다.

개발 서버:

```bash
npm.cmd run dev
```

- 백그라운드 실행 후 `http://localhost:3001`에 대해 200 응답 확인

## 8. 수동 테스트 체크리스트

```txt
[ ] Header 우측 알림 자리의 Smartphone 아이콘이 표시된다.
[ ] 아이콘 클릭 시 일반뷰 / 간단뷰가 즉시 전환된다.
[ ] 새로고침 후에도 마지막 간단뷰 상태가 유지된다.
[ ] localStorage에 aiop-compact-mode 값이 저장된다.
[ ] 간단뷰에서 Sidebar가 사라진다.
[ ] 간단뷰에서 하단 탭바가 표시된다.
[ ] 하단 탭바 7개 View가 모두 정상 이동한다.
[ ] Dashboard helper text와 보조 메타가 간단뷰에서 숨겨진다.
[ ] Wants / Subscriptions / Insights / Regret / Notes가 단일 컬럼으로 보인다.
[ ] Asset Calculator 입력/결과 카드가 좁은 폭에서 깨지지 않는다.
[ ] QuickAddModal이 간단뷰에서 풀스크린에 가깝게 열린다.
[ ] 각 Add Modal이 간단뷰에서 풀스크린에 가깝게 열린다.
[ ] 빠른 추가 동선이 기존처럼 저장 후 반영된다.
[ ] 360px 화면에서 하단 탭바와 버튼 텍스트가 심하게 깨지지 않는다.
```
