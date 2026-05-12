# AIOP v0.2 ~ v1.1 작업 히스토리 (요약)

작성일: 2026-05-11
범위: v0.2 계산기 분기 시작 ~ v1.1 간단뷰 도입까지
대상: 기존 10개 작업 노트를 한 곳에 압축. 원본은 `.agent-notes/archive/` 에 보존됨

---

## 한눈에 보는 변화 흐름

| 버전 | 기간 | 주제 | 핵심 결과 |
|---|---|---|---|
| v0.2 | 2026-05-08 | 계산기 4단계 + 포맷터 분리 | `formatters.ts` 분리, `calculateMonthsToBuy` / `calculateMonthlyCashflowNeeded` 추가, Purchase Decision 4단계 |
| v0.3 | 2026-05-08 | Wants 로컬 CRUD | `WantsView` useState 전환, `AddWantModal` 신설, 카드 삭제 |
| (보조) | 2026-05-08 | 화면 한글화 1차 | `src/lib/labels.ts` 도입, 사이드바/헤더/대시보드/모달 한글화 |
| v0.4 | 2026-05-08 | localStorage 도입 | `useLocalStorage<T>` 훅 신설, `aiop:wants` 적용 |
| v0.5 | 2026-05-08 | Subscriptions CRUD | client 전환, 모듈 스코프 reduce 제거, `AddSubscriptionModal`, status 토글, `aiop:subscriptions` |
| v0.6 | 2026-05-08 | Notes CRUD | controlled textarea, tag chip toggle, `aiop:notes`, `Note.title?` 옵셔널 |
| v0.7 | 2026-05-11 | Insights CRUD | `BookInsightsView` client 전환, `AddInsightModal`, `aiop:insights` |
| v0.8 | 2026-05-11 | Regret 계산 + CRUD | `RegretItem` 타입 재설계, `calculateRegretPercent`/`calculateProfitAmount`, `RegretCard` 분리, `aiop:regret-items` |
| v0.9 | 2026-05-11 | Dashboard 데이터 통합 | 5개 Dashboard 컴포넌트 client 전환, `useLocalStorage` 4종 hydrate, Notes Inbox 카드 추가, 빈 상태 UI |
| (보조) | 2026-05-11 | 빠른 추가 | Header 알림 자리 placeholder → `QuickAddModal` + `AddNoteModal`, `refreshKey` 트릭으로 즉시 반영 |
| v1.0 | 2026-05-11 | UI 마무리 + Esc + 로고 | Dashboard 한글 복구, line-clamp/overflow, `useEscapeKey` 훅, Sidebar 로고 클릭 → Dashboard, `.eslintrc.json` 도입 |
| v1.1 | 2026-05-11 | 간단뷰 (모바일) | `CompactModeContext`, `BottomTabBar`, Header Bell → `Smartphone` 토글, `aiop-compact-mode` 영구 저장, 6개 모달 풀스크린화 |

---

## v0.2 — 계산기 4단계 + 포맷터 분리

### 범위
- AGENTS.md Step 1, 2
- 백엔드 / Auth / DB / 외부 API 미사용

### 주요 작업
- `src/lib/formatters.ts` 신설: `formatKRW`, `formatCompactKRW`, `formatPercent`, `formatNumber`, `formatDate`
- `src/lib/calculations.ts`에서 포맷 함수 이동
- `calculateMonthsToBuy`, `calculateMonthlyCashflowNeeded` 단독 함수 추가
- Asset Calculator Purchase Decision 4단계 분기:
  ```ts
  if (monthlyInvestment <= 0 || price <= 0) → "Need more input"
  else if (requiredCapital >= 100_000_000) → "Plan carefully"
  else if (monthsToBuy <= 3) → "Available soon"
  else if (monthsToBuy <= 12) → "Set as goal"
  else → "Hold"
  ```
- 0/음수/NaN 입력 안전화

---

## v0.3 — Wants 로컬 CRUD

### 범위
- AGENTS.md Step 3(부분), 4, 5, 6

### 주요 결정
- 타입: 현재 코드 유지 + 부족 필드만 옵셔널 추가
- `WantItem`에 `priority?`, `targetMonths?`, `expectedYield?`, `monthlyCashflowNeeded?`, `currency?` 추가
- mock 5개에 합리적 기본값 부여

### 주요 작업
- `WantsView` useState 전환, Add/Delete 핸들러
- `AddWantModal` 신설 (모달 디자인 톤 첫 도입)
- name 빈값 / price ≤ 0 차단
- id 생성: `crypto.randomUUID?.() ?? Date.now().toString()`
- 저장 시 `requiredCapital`, `monthlyCashflowNeeded` 계산해서 함께 저장
- `WantCard` 삭제 버튼

---

## (보조) 화면 한글화 1차

### 주요 작업
- `src/lib/labels.ts` 신설
- 내부 enum/type 값은 영문 유지, 화면 라벨만 한글 변환
- 대상 라벨: WantCategory / WantStatus / WantPriority / SubscriptionStatus / UsageFrequency / SubscriptionCategory / InsightType
- 사이드바 메뉴, 헤더 검색 placeholder, 대시보드 카드, 모달 제목/필드, 카드 상태/카테고리 모두 한글화
- mock 일부 항목도 한글로 정리

---

## v0.4 — localStorage 도입

### 핵심 결정
- 키 prefix: `aiop:`
- SSR 안전: 첫 렌더는 initialValue, mount 후 hydrate
- 손상 시 silent fallback + `console.warn`

### 주요 작업
- `src/hooks/useLocalStorage.ts` 신설
  ```ts
  export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>]
  ```
- `WantsView`에 `useLocalStorage<WantItem[]>("aiop:wants", wants)` 적용

---

## v0.5 — Subscriptions 로컬 CRUD

### 주요 작업
- `SubscriptionsView` client 전환, 모듈 스코프 reduce 제거 → 컴포넌트 내부 `useMemo`
- `AddSubscriptionModal` 신설 (`service` / `monthlyPrice` / `category` / `usage` / `valueScore` / `status`)
- service 빈값 / monthlyPrice ≤ 0 차단
- `SubscriptionCard`에 삭제 버튼 + 3-way status 토글
- `aiop:subscriptions` 영속화
- 상단 요약(총/유지/검토/해지) state 기반 갱신

---

## v0.6 — Notes 로컬 CRUD

### 주요 결정
- `Note.title`을 필수 → 옵셔널로 변경 (quick capture는 body 위주)
- `NoteStatus` (`inbox` / `processed` / `archived`) 타입 추가

### 주요 작업
- `NotesInboxView` controlled textarea + tag chip toggle (`useState<string[]>`)
- 빈 body 차단
- `aiop:notes` 영속화
- `createdAt`은 `오늘 HH:mm` 형식
- title 없는 새 노트는 body 첫 줄을 강조 텍스트로

---

## v0.7 — Insights 로컬 CRUD

### 주요 작업
- `BookInsightsView` client 전환
- `AddInsightModal` 신설 (`sourceType` / `title` / `keySentence` / `actionItem` / `tags` (comma split) / `relatedGoal`)
- title 또는 keySentence 빈값 차단
- `InsightCard` 삭제 버튼
- `aiop:insights` 영속화
- `Insight.keySentence` 유지 (AGENTS.md `summary`와 명세 차이 있지만 기존 코드 일관성 우선)

---

## v0.8 — Regret 계산 + CRUD

### 핵심 결정
- `RegretItem` 타입 **재설계** (AGENTS.md 명세 채택)
  - 제거: `oldPrice`, `changeRate`, `memo`, `thoughtThen`, `resultNow`
  - 추가: `watchedPrice`, `currentPrice`, `currency`, `quantity`, `assetType`, `symbol?`, `watchedAt?`, `note`, `resultPercent`, `profitAmount`
- 사유: v0.8 본질이 watched/current/quantity 기반 수익률 계산이라 명세 필드 없이 진행 불가

### 주요 작업
- `calculations.ts`:
  ```ts
  export function calculateRegretPercent(watchedPrice: number, currentPrice: number) {
    if (watchedPrice <= 0) return 0;
    return ((currentPrice - watchedPrice) / watchedPrice) * 100;
  }
  export function calculateProfitAmount(watchedPrice, currentPrice, quantity) {
    if (watchedPrice <= 0 || currentPrice <= 0 || quantity <= 0) return 0;
    return (currentPrice - watchedPrice) * quantity;
  }
  ```
- `RegretCard` 신규 분리 (인라인 → 컴포넌트)
- `RegretTrackerView` client 전환 + `aiop:regret-items` 영속화
- `AddRegretItemModal` 신설 — 필드 수 가장 많음 (9개)
- 상승/하락 ribbon: `resultPercent >= 0` 분기
- mock 6개를 새 타입으로 재작성

---

## v0.9 — Dashboard 데이터 통합

### 핵심 결정
- Dashboard 5개 컴포넌트 모두 `"use client"` 전환 + `useLocalStorage` 직접 hydrate
- AssetSnapshot 기준: **"가장 최근 Want (`items[0]`)"** (사용자 확정)
- Context/공용 store 도입은 v1.0+로 미룸
- 빈 상태 UI 모든 컴포넌트 추가

### 주요 작업
- `getStoredArray<T>` 헬퍼 패턴: `Array.isArray` 가드 → mock fallback
- `SummaryCards`: 5장 카드 (Wants / 월 구독비 / Target Spend / Insights / **Notes Inbox**), `useMemo`로 monthlyTotal / coverableSpend / inboxNoteCount 계산
- `WantPreview`: `items.slice(0, 5)` + 빈 상태
- `AssetSnapshot`: `items[0]` + `calculateRequiredCapital` 동적 계산 (완전 하드코딩 제거)
- `SubscriptionSummary`: total/keep/review/cancel + `review`/`cancel` 항목 4개 액션 칩
- `RecentInsights`: `items.slice(0, 3)`
- 모든 카드에 빈 상태 안내문

### 알려진 한계 (당시 v1.0에서 처리 예정)
- 일부 문구를 한글 인코딩 이슈 회피로 영어로 임시 정리 ("Target Spend", "Subscription Summary" 등)
- `npm run lint` ESLint 미설정으로 중단

---

## (보조) 빠른 추가 (v1.0 범위, Header placeholder 재활용)

### 핵심 결정
- Header의 알림 placeholder 버튼 자리에 두지 않고 별도 "빠른 추가" 동선 신설
- 카테고리 선택 분리 모달 + 도메인 모달 호출 패턴
- 저장 후 **현재 화면 머무름 + `refreshKey` 강제 재렌더링** (storage event listener는 v1.1+ 검토)
- Note 전용 미니 모달 신설 (NotesInboxView의 inline form은 유지)

### 주요 작업
- `src/components/quick-add/QuickAddModal.tsx` 신설 — 5개 카테고리 카드 그리드
- `src/components/notes/AddNoteModal.tsx` 신설 — textarea + 태그 토글 + 저장
- `app/page.tsx`에 `quickAddOpen` / `activeCategory` / `refreshKey` state
- 각 View에 `key={refreshKey}` 부여로 강제 re-mount → useLocalStorage hydrate로 자동 동기화
- Header.tsx, AppShell.tsx에 `onOpenQuickAdd` prop forward

### 흐름
```txt
Header button → setQuickAddOpen(true)
  → QuickAddModal 카드 클릭 → setActiveCategory("want") + setQuickAddOpen(false)
    → AddWantModal isOpen → 저장 → localStorage write → setRefreshKey(k=>k+1)
      → 전체 View remount → useLocalStorage hydrate → 즉시 반영
```

---

## v1.0 — UI 마무리 + Esc + 로고 + ESLint

### 주요 작업
- **Dashboard 한글 라벨 복구**: "Wants" → "구매 목표", "Monthly subscriptions" → "월 구독비", "Target Spend" → "계획 지출 합계", "Recent Insights" → "최근 인사이트", "Notes Inbox" → "수집함", "Purchase Goal Preview" → "최근 구매 목표" 등
- **빈 상태 / overflow / line-clamp** 도메인별로 정리 (Wants / Subscriptions / Insights / Regret / Notes)
- 카드 제목·본문에 `truncate`, `line-clamp-2`, `line-clamp-3`, `min-w-0`, `shrink-0` 적용
- 모바일 깨짐 방지: AppShell main 영역 높이를 모바일에서 고정 안 함, Sidebar nav 가로 스크롤 + `whitespace-nowrap`
- **`src/hooks/useEscapeKey.ts`** 신설
  ```ts
  export function useEscapeKey(isActive: boolean, onEscape: () => void) {
    useEffect(() => {
      if (!isActive) return;
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") onEscape();
      }
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isActive, onEscape]);
  }
  ```
- 6개 모달(`QuickAddModal` + 5개 도메인 Add Modal)에 Esc 닫기 연결
- **Sidebar 로고 → 버튼**, `onClick={() => onSelectView("dashboard")}`, `aria-label="대시보드로 이동"`
- **`.eslintrc.json`** 추가 → `npm run lint` 대화형 프롬프트 제거
- README v1.0 완료 상태로 갱신

### 검증
- `npx.cmd tsc --noEmit` 통과
- `npm.cmd run lint` 통과 (Next.js 15 `next lint` deprecated 경고는 잔존)
- `npm.cmd run build` 통과

### 알려진 한계 / v1.0 시점 후속 TODO
- `useEscapeKey`는 동시에 모달 1개 가정 (현재 QuickAdd → 도메인 Modal 순차라 문제 없음)
- Esc 누를 때 입력 손실 confirm 미구현
- 모달 포커스 트랩 / 첫 input autofocus / 배경 스크롤 잠금 미구현
- `next lint` deprecated → ESLint CLI 방식 migration 필요
- `tsconfig.tsbuildinfo` 커밋 여부 미결

---

## v1.1 — 간단뷰 (모바일)

### 사용자 결정
- 알림 버튼(`Header.tsx:43-45` Bell placeholder) → 간단뷰 토글 재활용
- 동작: 전체 압축 + **Sidebar → 하단 탭바**
- 토글: **순수 수동** (화면 크기 무관)
- 저장: **localStorage 영구** (`aiop-compact-mode`)
- 숨김/압축: 카드 helper text, Dashboard 보조 위젯, Sidebar 자동 접기
- 기본값 채택 (사용자 응답 없음): 토글 아이콘 `Smartphone`, 하단 탭바 7개 전체, 데스크탑에서도 `max-w-md` 중앙 정렬, Header 검색바 숨김

### 주요 작업
- **`src/contexts/CompactModeContext.tsx`** 신설
  ```ts
  const [isCompact, setIsCompact] = useLocalStorage<boolean>("aiop-compact-mode", false);
  ```
- **`src/components/layout/BottomTabBar.tsx`** 신설
  - `fixed inset-x-0 bottom-0 z-40 ... backdrop-blur`
  - `safe-area-inset-bottom` 처리 (iOS)
  - ViewKey 7개 표시
- **`src/components/layout/navItems.ts`** 신설 — Sidebar / BottomTabBar 공통 데이터
- **Header**: Bell → `Smartphone` 토글, `aria-pressed`, 상태별 `aria-label`
- **AppShell** 레이아웃 분기:
  ```tsx
  {isCompact ? null : <Sidebar ... />}
  {isCompact ? <BottomTabBar ... /> : null}
  ```
  - 간단뷰 main: `mx-auto max-w-md px-3 py-4 pb-24 md:h-[calc(100vh-88px)] md:overflow-y-auto`
- **Dashboard 압축**: helper text 숨김, 보조 메모 숨김, 카드 padding 축소, 2열 요약, status chip 숨김
  ```tsx
  {isCompact ? null : <p className="mt-4 text-sm text-zinc-500">{card.helper}</p>}
  ```
- **5개 도메인 View 압축**: View 제목 축소, 보조 설명 숨김, grid 단일 컬럼, line-clamp 강화
  ```tsx
  <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-2"}`}>
  ```
- **6개 Modal 풀스크린화**:
  ```tsx
  isCompact
    ? "h-[100dvh] max-w-full rounded-none p-4"
    : "max-h-[90vh] max-w-2xl rounded-2xl p-6"
  ```

### 검증
- `npx.cmd tsc --noEmit` 통과
- `npm.cmd run build` 통과
- `npm.cmd run lint` 통과
- `http://localhost:3001` 200 응답

### 알려진 한계 / v1.1 시점 후속 TODO
- 360 / 414 / 768 / 1024 / 1440 responsive 수동 시각 검증 미완료
- 하단 탭바 7개 라벨 가독성 실제 기기 확인 필요
- 모달 풀스크린 + 모바일 키보드 가림 검증 필요
- `tsconfig.tsbuildinfo` 커밋 정책 미결
- README.md / .eslintrc.json / useEscapeKey.ts가 작업 트리에 미커밋 상태로 남아있던 시점에 v1.1 시작 → 두 단위로 커밋 분리 권장

---

## 누적된 후속 TODO (v2.0 도입 전 정리할 것)

전체 합본 후속 작업 목록은 `aiop-todo.md` §3 참조. 핵심:

- 미커밋 변경분 정리 (v1.0 + v1.1을 두 커밋으로 분리)
- 모바일 360 ~ 1440 responsive 수동 검증
- 모달 포커스 트랩 / autofocus / 배경 스크롤 잠금
- Esc 입력 손실 confirm
- `next lint` deprecated → ESLint CLI migration

---

## 누적된 결정 사항 (다음 단계에 영향)

| 영역 | 결정 | 효과 |
|---|---|---|
| 타입 전략 | 현재 코드 유지 + 옵셔널 필드만 추가 | 광범위 리팩토링 회피, 단계별 변경 |
| Regret 타입 | AGENTS.md 명세 채택 (예외) | 본질 작업 위해 필드 재설계 |
| localStorage 키 | `aiop:` prefix 통일 | 6개 도메인 키 일관성 (theme/compact mode는 dash) |
| SSR | 첫 렌더 initialValue + mount 후 hydrate | hydration mismatch 회피 |
| 손상 fallback | silent + `console.warn` | 앱 깨지지 않음 |
| Dashboard 데이터 흐름 | 각 컴포넌트가 useLocalStorage 직접 호출 | Context 도입은 v1.1+로 미룸 (v1.1에서 CompactMode만 Context) |
| AssetSnapshot 기준 | 최신 Want (`items[0]`) | 추가 직후 즉시 카드 반영 |
| 빠른 추가 동기화 | `refreshKey` 강제 remount | storage event listener는 v1.1+로 미룸 |
| 간단뷰 컨테이너 | 데스크탑에서도 `max-w-md` 중앙 정렬 | 모바일 폭 모사 |
| 디자인 톤 | zinc / emerald / rounded-2xl / shadow-soft | 모든 단계에서 보존 |

---

## 원본 파일

다음 10개 파일은 `.agent-notes/archive/` 로 이동됨. 세부 단계 / 대안 비교 / 시점별 결정 근거가 필요하면 archive 참조.

```txt
archive/aiop-v02-v03-plan.md
archive/aiop-v04-v06-plan.md
archive/aiop-v07-v08-plan.md
archive/aiop-v09-plan.md
archive/aiop-v09-progress.md
archive/aiop-quick-add-plan.md
archive/aiop-v10-plan.md
archive/aiop-v10-ui-esc-logo-review.md
archive/aiop-v11-compact-mode-plan.md
archive/aiop-v11-compact-mode-progress.md
```
