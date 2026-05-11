# AIOP 구현 순서 문서

> 대상: Claude Code  
> 프로젝트: AIOP / All-In-One Page  
> 현재 목표: 백엔드 없이 프론트엔드 MVP를 점진적으로 실제 사용 가능한 형태로 개선

---

## 최신 진행 상태 (2026-05-11)

본 문서 하단의 "1. 전체 구현 로드맵" 은 v0.8 시점 명세 기준이다. 실제 코드 상태는 다음과 같이 앞서 있다. 신규 작업 시 아래 정보를 우선시한다.

### 완료 (코드 기준)

- v0.1 ~ v0.8 — 7개 도메인 화면 (Wants, Calculator, Subscriptions, Notes, Insights, Regret, Dashboard) 로컬 CRUD + localStorage 영속화.
- v0.9 — Dashboard 카드/위젯이 localStorage 데이터를 직접 읽어 갱신.
- v1.0 — UI 품질 정리, 빠른 추가(QuickAddModal), 라이트/다크 토글, 컴팩트뷰(`BottomTabBar`), Todo 화면.
- v1.1 ~ v1.2 — Dashboard 드래그&드롭 (`react-grid-layout 2.2.3`), 위젯/카드 visibility 토글, Summary 카드 reorder(`@dnd-kit`), 컴팩트뷰 위/아래 이동 버튼, draft layout 패턴.
- 추가 — SummaryCard 클릭 이동, App Router 라우트 분리, Hero 문구 사용자 편집, hover 디자인, 위젯 overflow 정리, 설정 드롭다운 z-index 정리, useLocalStorage `useRef` 안정화.
- v1.3 — 데이터 export / import (`SettingsMenu` → JSON 백업), localStorage schema guard (`src/lib/storageNormalizers.ts`).
- 부가 — Notes status 변경 UI (inbox→processed→archived 사이클), Header 검색창 동작 (Wants/Subscriptions/Insights/Notes/Todo 화면 필터).

### 신규 디렉토리 / 모듈

- `src/contexts/` — `CompactModeContext`, `LayoutContext`, `SearchContext`.
- `src/components/quick-add/QuickAddModal.tsx`.
- `src/components/todos/TodoView.tsx`.
- `src/components/layout/grid/` — `DashboardGrid`, `WidgetFrame`, `defaultLayout`.
- `src/components/layout/settings/` — `SettingsMenu`, `HeaderSettingsButton`, `SidebarSettingsButton`.
- `src/components/layout/BottomTabBar.tsx`.
- `src/app/wants`, `src/app/calculator`, `src/app/regret`, `src/app/subscriptions`, `src/app/insights`, `src/app/notes`, `src/app/todos` — App Router 화면 라우트.
- `src/components/dashboard/HeroWidget.tsx`, `TodoSummary.tsx`.
- `src/hooks/useDashboardLayout.ts`, `useEscapeKey.ts`.
- `src/lib/storageNormalizers.ts`, `src/lib/dataPortability.ts`.
- `src/types/layout.ts` — `WidgetId`, `SummaryCardId`, `DashboardLayout`.

### localStorage 키 (현재 전체)

| Key | 내용 |
| --- | --- |
| `aiop:wants` | WantItem[] |
| `aiop:subscriptions` | Subscription[] |
| `aiop:insights` | Insight[] |
| `aiop:notes` | Note[] |
| `aiop:regret-items` | RegretItem[] |
| `aiop:todos` | TodoItem[] |
| `aiop:layout` | DashboardLayout |
| `aiop:hero-message` | string |
| `aiop-compact-mode` | boolean |
| `aiop-theme-mode` | "light" \| "dark" |

### 타입 명세와 코드의 차이

- `WantItem` 의 `aiScore` (명세) → 실제 코드 `score`.
- `Subscription` 의 `name`/`usageFrequency` (명세) → 실제 `service`/`usage`.
- `Insight` 의 `summary`/`relatedTarget` (명세) → 실제 `keySentence`/`relatedGoal`.
- `RegretItem` 은 명세대로 `watchedPrice/currentPrice/quantity/resultPercent/profitAmount` 사용.
- `TodoItem` 은 명세에 없는 도메인. `id/title/status/priority/createdAt/dueDate?`.

### 남은 작업 (다음 차례)

- v2.0 Supabase 백엔드 + Google OAuth + 환율 API + AI Route Handler (별도 계획서 `.agent-notes/aiop-v20-backend-plan.md`).
- v2.1+ AI 기능 4종 (자동분류 → 오늘의 할일 추천 → 투자종목 추천 → 뉴스 추천).
- 진행 계획 상세: `.agent-notes/aiop-next-steps-stage2.md` 및 후속 계획서.

### v2.0 사전 결정 (확정, 2026-05-11)

상세는 `.agent-notes/aiop-v20-decisions.md`. 요약:

- D1 — 데이터 흐름: **RSC + Server Actions** (SWR 미도입).
- D2 — 네이밍: **snake_case DB + camelCase TS + mappers.ts**.
- D3 — multi-currency: **환율 API (Frankfurter) v2.0 포함**, 단일 기준통화(KRW) 자동 환산.
- D4 — 태그: **`text[]` + GIN 인덱스**.
- D5 — 삭제: **Hard delete**.
- D6 — URL: **App Router 라우트 분리** (`/wants`, `/subscriptions`, ...). `?view=` SPA 패턴 제거.

---

## 0. 프로젝트 전제

AIOP는 개인용 All-In-One Page 서비스다.

핵심 컨셉:

> 이 웹페이지 또는 앱 하나만 켜두면, 내가 필요한 기능이 모두 들어있는 개인 운영 대시보드

초기 타겟은 대중 사용자가 아니라 **나 자신**이다.

현재는 아래 기능을 가진 프론트엔드 MVP 상태라고 가정한다.

- Next.js
- TypeScript
- Tailwind CSS
- mock data 기반
- 백엔드 없음
- 인증 없음
- DB 없음
- 외부 API 없음
- AI API 없음
- full-screen dashboard layout
- sidebar navigation
- Dashboard
- Wants
- Asset Calculator
- Regret Tracker
- Subscriptions
- Book Insights
- Notes / Inbox

---

## 1. 전체 구현 로드맵

### v0.1 — Frontend Layout MVP

목표:

- 전체 화면 레이아웃 구성
- sidebar navigation 구성
- 각 주요 화면의 mock UI 구현
- 매일 켜두고 싶은 대시보드 느낌 검증

상태:

- 이미 구현된 것으로 간주

---

### v0.2 — 계산 로직 실제화

목표:

- Asset Calculator를 실제로 동작하게 만든다.
- 계산 로직을 별도 파일로 분리한다.
- 입력값 변경 시 결과가 실시간으로 바뀌게 한다.

핵심 작업:

- `src/lib/calculations.ts` 생성 또는 정리
- 계산 함수 작성
- Asset Calculator 화면과 계산 함수 연결
- 숫자 포맷팅 적용
- 예외 입력 처리

---

### v0.3 — Wants 로컬 상태 구현

목표:

- 사고 싶은 항목을 화면에서 추가/삭제할 수 있게 만든다.
- 아직 DB 저장은 하지 않는다.
- 새로고침하면 사라져도 괜찮다.

핵심 작업:

- Wants mock data를 초기 state로 사용
- Add Want 모달 또는 패널 구현
- Want 추가 기능 구현
- Want 삭제 기능 구현
- requiredCapital 자동 계산
- monthlyCashflowNeeded 자동 계산

---

### v0.4 — localStorage 저장

목표:

- 새로고침해도 Wants 데이터가 유지되게 한다.
- 아직 백엔드는 사용하지 않는다.

핵심 작업:

- Wants state를 localStorage에 저장
- 앱 로드시 localStorage에서 초기화
- 잘못된 localStorage 데이터 예외 처리
- Reset mock data 기능 선택적으로 추가

---

### v0.5 — Subscriptions 로컬 CRUD

목표:

- 월 구독 목록을 추가/삭제/상태 변경할 수 있게 한다.
- localStorage로 유지한다.

핵심 작업:

- Subscription 타입 정리
- Add Subscription 모달 구현
- Delete 기능
- status 변경 기능
- 총 월 구독비 계산
- keep / review / cancel 상태별 요약

---

### v0.6 — Notes / Inbox 로컬 CRUD

목표:

- 빠른 메모를 입력하고 목록에 쌓을 수 있게 한다.
- localStorage로 유지한다.

핵심 작업:

- textarea 입력
- Add Note
- Delete Note
- status 변경
- tag 표시
- 최근 메모 순 정렬

---

### v0.7 — Book Insights 로컬 CRUD

목표:

- 책/영상/아티클 인사이트를 직접 추가할 수 있게 한다.

핵심 작업:

- Add Insight 모달
- sourceType 선택
- title / summary / actionItem / tags 입력
- Delete 기능
- mock data + 사용자 추가 데이터 병합
- localStorage 저장

---

### v0.8 — Regret Tracker 로컬 계산

목표:

- “그때 살걸” 항목을 추가하고 수익률을 계산한다.
- 실제 주식 API는 사용하지 않는다.

핵심 작업:

- Add Regret Item 모달
- watchedPrice / currentPrice / quantity 입력
- resultPercent 계산
- profitAmount 계산
- 상승/하락 UI 표시
- localStorage 저장

---

### v0.9 — Dashboard 데이터 통합

목표:

- 각 화면의 데이터를 Dashboard 요약 카드에 반영한다.

핵심 작업:

- Wants 총 개수
- 사고 싶은 항목 총액
- 월 구독비 총합
- 해지 후보 구독 수
- 최근 인사이트 수
- 최근 메모 수
- 자산으로 커버 가능한 소비 금액
- 최신 Want preview
- 최신 Insight preview

---

### v1.0 — Frontend-only Personal MVP

목표:

- 백엔드 없이도 개인이 로컬에서 실제로 써볼 수 있는 MVP 완성

완료 기준:

- 주요 화면 모두 최소 CRUD 가능
- 데이터는 localStorage에 저장
- Dashboard가 실제 데이터 기반으로 업데이트됨
- UI가 깨지지 않음
- TypeScript 에러 없음
- 개발 서버 정상 실행
- README 업데이트

---

## 2. 현재 단계에서 하지 말 것

아래 기능은 아직 구현하지 않는다.

- Supabase
- PostgreSQL
- Auth
- 로그인 / 회원가입
- OpenAI API
- 실제 금융 API
- 주식 현재가 자동 조회
- 배당률 자동 조회
- 환율 API
- 결제 기능
- 모바일 앱 연동
- 서버 CRUD API
- 복잡한 권한 시스템

지금은 **프론트엔드 로컬 MVP**에 집중한다.

---

## 3. 추천 작업 순서 상세

---

# Step 1. 계산 로직 분리

## 목표

Asset Calculator에서 사용할 계산 로직을 공통 함수로 분리한다.

## 생성 또는 수정 파일

```txt
src/lib/calculations.ts
```

## 구현 함수

```ts
export function calculateRequiredCapital(
  price: number,
  expectedYieldPercent: number
): number

export function calculateMonthlyCashflowNeeded(
  price: number,
  targetMonths: number
): number

export function calculateMonthsToBuy(
  price: number,
  monthlyInvestment: number
): number

export function calculateRegretPercent(
  watchedPrice: number,
  currentPrice: number
): number

export function calculateProfitAmount(
  watchedPrice: number,
  currentPrice: number,
  quantity: number
): number
```

## 계산 규칙

### calculateRequiredCapital

```txt
price / (expectedYieldPercent / 100)
```

예외:

- price <= 0이면 0 반환
- expectedYieldPercent <= 0이면 0 반환
- NaN 반환 금지
- Infinity 반환 금지

### calculateMonthlyCashflowNeeded

```txt
price / targetMonths
```

예외:

- price <= 0이면 0 반환
- targetMonths <= 0이면 0 반환

### calculateMonthsToBuy

```txt
price / monthlyInvestment
```

예외:

- price <= 0이면 0 반환
- monthlyInvestment <= 0이면 0 반환

### calculateRegretPercent

```txt
((currentPrice - watchedPrice) / watchedPrice) * 100
```

예외:

- watchedPrice <= 0이면 0 반환

### calculateProfitAmount

```txt
(currentPrice - watchedPrice) * quantity
```

예외:

- watchedPrice <= 0이면 0 반환
- currentPrice <= 0이면 0 반환
- quantity <= 0이면 0 반환

## 완료 기준

- 모든 함수가 export됨
- TypeScript 에러 없음
- 0, 음수, 빈 값 입력에도 앱이 깨지지 않음

---

# Step 2. 공통 포맷 유틸 작성

## 목표

금액, 퍼센트, 날짜 포맷을 공통으로 처리한다.

## 생성 파일

```txt
src/lib/formatters.ts
```

## 구현 함수

```ts
export function formatCurrency(
  value: number,
  currency?: "KRW" | "USD"
): string

export function formatPercent(value: number): string

export function formatNumber(value: number): string

export function formatDate(value?: string): string
```

## 포맷 규칙

### KRW

```txt
₩3,500,000
```

### USD

```txt
$2,500.00
```

### Percent

```txt
+12.4%
-8.2%
0.0%
```

## 완료 기준

- Dashboard, Wants, Calculator 등에서 재사용 가능
- 숫자가 undefined/null이어도 깨지지 않음

---

# Step 3. 타입 정리

## 목표

mock data와 컴포넌트에서 사용하는 타입을 한 곳에서 관리한다.

## 수정 파일

```txt
src/types/index.ts
```

## 타입 정의

```ts
export type Currency = "KRW" | "USD"

export type WantStatus = "thinking" | "planned" | "bought" | "skipped"
export type Priority = "low" | "medium" | "high"

export type Want = {
  id: string
  name: string
  price: number
  currency: Currency
  category: string
  reason: string
  priority: Priority
  status: WantStatus
  targetDate?: string
  targetMonths: number
  expectedYield: number
  requiredCapital: number
  monthlyCashflowNeeded: number
  aiScore?: number
}

export type SubscriptionStatus = "keep" | "review" | "cancel"
export type UsageFrequency = "daily" | "weekly" | "monthly" | "rarely"

export type Subscription = {
  id: string
  name: string
  monthlyPrice: number
  currency: Currency
  category: string
  usageFrequency: UsageFrequency
  valueScore: number
  status: SubscriptionStatus
}

export type SourceType = "book" | "video" | "article" | "thought"

export type Insight = {
  id: string
  sourceType: SourceType
  title: string
  summary: string
  actionItem: string
  tags: string[]
  relatedTarget?: string
}

export type RegretItem = {
  id: string
  name: string
  assetType: string
  symbol?: string
  watchedPrice: number
  currentPrice: number
  currency: Currency
  quantity: number
  watchedAt?: string
  note: string
  resultPercent: number
  profitAmount: number
}

export type Note = {
  id: string
  content: string
  tags: string[]
  status: "inbox" | "processed" | "archived"
  createdAt: string
}
```

## 완료 기준

- mockData가 위 타입과 호환됨
- 컴포넌트 props에 타입 적용
- any 사용 최소화

---

# Step 4. Asset Calculator 실제 동작 구현

## 목표

Asset Calculator 화면에서 입력값을 바꾸면 계산 결과가 실시간으로 반영되게 한다.

## 수정 대상

```txt
src/components/calculator/AssetCalculatorView.tsx
```

또는 현재 프로젝트의 계산기 컴포넌트 파일

## 입력 필드

- Item Price
- Target Months
- Expected Yield %
- Monthly Investment

## 기본값

```ts
const DEFAULT_PRICE = 3500000
const DEFAULT_TARGET_MONTHS = 12
const DEFAULT_EXPECTED_YIELD = 4
const DEFAULT_MONTHLY_INVESTMENT = 300000
```

## 출력 카드

- Required Capital
- Monthly Cashflow Needed
- Months to Buy
- Purchase Decision

## Purchase Decision 규칙

```ts
if (requiredCapital >= 100_000_000) {
  return "Plan carefully"
}

if (monthsToBuy <= 3) {
  return "Available soon"
}

if (monthsToBuy <= 12) {
  return "Set as goal"
}

return "Hold"
```

단, `monthsToBuy`가 0이면 `"Need more input"` 처리.

## 완료 기준

- 입력값 변경 시 결과 즉시 변경
- 0 입력해도 오류 없음
- 금액 포맷 적용
- 디자인 기존 톤 유지

---

# Step 5. Wants Add Modal 구현

## 목표

Wants 화면에서 사고 싶은 항목을 직접 추가할 수 있게 한다.

## 수정 대상

```txt
src/components/wants/WantsView.tsx
src/components/wants/WantCard.tsx
```

필요 시 추가:

```txt
src/components/wants/AddWantModal.tsx
```

## 입력 필드

- name
- price
- currency
- category
- reason
- priority
- status
- targetMonths
- expectedYield

## 기본값

```ts
currency: "KRW"
priority: "medium"
status: "thinking"
targetMonths: 12
expectedYield: 4
```

## 저장 시 처리

- name이 비어 있으면 저장 금지
- price가 0 이하이면 저장 금지
- id 생성
- requiredCapital 계산
- monthlyCashflowNeeded 계산
- 리스트 상단에 추가
- 폼 초기화
- 모달 닫기

## id 생성

가능하면:

```ts
crypto.randomUUID()
```

대체:

```ts
`${Date.now()}`
```

## 완료 기준

- Add Want 버튼 동작
- 필수값 검증
- 새 항목이 리스트 상단에 추가됨
- 계산값이 카드에 표시됨
- TypeScript 에러 없음

---

# Step 6. Wants 삭제 기능 구현

## 목표

추가된 Want 또는 mock Want를 리스트에서 삭제할 수 있게 한다.

## 수정 대상

```txt
src/components/wants/WantCard.tsx
src/components/wants/WantsView.tsx
```

## 구현 방식

- 카드 우측 상단에 삭제 버튼 또는 아이콘 추가
- 클릭 시 해당 id 항목 제거
- confirm은 선택 사항
- 삭제 후 리스트 즉시 갱신

## 완료 기준

- 삭제 버튼 클릭 시 카드 제거
- 다른 카드에 영향 없음
- 빈 리스트 상태 UI 표시

---

# Step 7. localStorage 공통 훅 작성

## 목표

각 화면의 데이터를 localStorage에 쉽게 저장하고 불러오기 위한 공통 훅을 만든다.

## 생성 파일

```txt
src/hooks/useLocalStorage.ts
```

## 구현 예시

```ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>]
```

## 요구사항

- 서버 렌더링 환경에서 window 접근 에러 방지
- JSON parse 실패 시 initialValue 사용
- 값 변경 시 localStorage 저장
- TypeScript generic 지원

## 완료 기준

- Wants에서 적용 가능
- 추후 Subscriptions, Notes, Insights에도 재사용 가능

---

# Step 8. Wants localStorage 연결

## 목표

Wants 데이터가 새로고침 후에도 유지되게 한다.

## 수정 대상

```txt
src/components/wants/WantsView.tsx
```

## 저장 key

```txt
aiop:wants
```

## 동작 규칙

- localStorage에 데이터가 있으면 그것을 사용
- 없으면 mock wants를 초기값으로 사용
- 추가/삭제 시 자동 저장
- 잘못된 데이터가 있으면 mock wants로 fallback

## 선택 기능

- Reset 버튼 추가 가능
- 클릭 시 localStorage 삭제 후 mock wants 복구

## 완료 기준

- 새 항목 추가 후 새로고침해도 유지됨
- 삭제 후 새로고침해도 삭제 상태 유지됨
- localStorage 오류로 앱이 깨지지 않음

---

# Step 9. Subscriptions 로컬 CRUD 구현

## 목표

구독 서비스를 추가/삭제하고 상태를 변경할 수 있게 한다.

## 수정 대상

```txt
src/components/subscriptions/SubscriptionsView.tsx
src/components/subscriptions/SubscriptionCard.tsx
```

필요 시 추가:

```txt
src/components/subscriptions/AddSubscriptionModal.tsx
```

## 입력 필드

- name
- monthlyPrice
- currency
- category
- usageFrequency
- valueScore
- status

## 저장 key

```txt
aiop:subscriptions
```

## 계산

- totalMonthlyPrice
- keepCount
- reviewCount
- cancelCount

## 완료 기준

- 구독 추가 가능
- 구독 삭제 가능
- 상태 변경 가능
- 총 월 구독비 갱신
- 새로고침 후 유지됨

---

# Step 10. Notes / Inbox 로컬 CRUD 구현

## 목표

빠른 메모를 입력하고 관리할 수 있게 한다.

## 수정 대상

```txt
src/components/notes/NotesInboxView.tsx
```

## 입력 필드

- content
- tags

## 저장 key

```txt
aiop:notes
```

## 구현 기능

- Add Note
- Delete Note
- status 변경
- 최근순 정렬
- 빈 입력 저장 방지

## 완료 기준

- 메모 추가 가능
- 메모 삭제 가능
- 새로고침 후 유지됨
- 긴 텍스트가 UI를 깨지 않음

---

# Step 11. Book Insights 로컬 CRUD 구현

## 목표

인사이트를 직접 추가하고 관리할 수 있게 한다.

## 수정 대상

```txt
src/components/insights/BookInsightsView.tsx
src/components/insights/InsightCard.tsx
```

필요 시 추가:

```txt
src/components/insights/AddInsightModal.tsx
```

## 입력 필드

- sourceType
- title
- summary
- actionItem
- tags
- relatedTarget

## 저장 key

```txt
aiop:insights
```

## 완료 기준

- 인사이트 추가 가능
- 인사이트 삭제 가능
- sourceType 표시
- tags 표시
- 새로고침 후 유지됨

---

# Step 12. Regret Tracker 로컬 계산 구현

## 목표

“그때 살걸” 기록을 직접 추가하고 상승률/수익금액을 계산한다.

## 수정 대상

```txt
src/components/regret/RegretTrackerView.tsx
```

필요 시 추가:

```txt
src/components/regret/AddRegretItemModal.tsx
```

## 입력 필드

- name
- assetType
- symbol
- watchedPrice
- currentPrice
- currency
- quantity
- watchedAt
- note

## 저장 key

```txt
aiop:regret-items
```

## 계산값

- resultPercent
- profitAmount

## 완료 기준

- 항목 추가 가능
- 항목 삭제 가능
- 상승/하락률 표시
- 예상 수익/손실 표시
- 새로고침 후 유지됨

---

# Step 13. Dashboard 데이터 통합

## 목표

Dashboard가 mock 고정값이 아니라 각 화면의 실제 localStorage 데이터를 기반으로 표시되게 한다.

## 수정 대상

```txt
src/components/dashboard/*
src/components/dashboard/SummaryCards.tsx
src/components/dashboard/WantPreview.tsx
src/components/dashboard/AssetSnapshot.tsx
src/components/dashboard/SubscriptionSummary.tsx
src/components/dashboard/RecentInsights.tsx
```

프로젝트 구조에 따라 실제 파일명은 다를 수 있음.

## 표시할 데이터

### Summary Cards

- Wants 개수
- Wants 총액
- 월 구독비 총액
- 최근 인사이트 수
- Notes inbox 개수

### Want Preview

- 최근 추가된 Want 3~5개

### Asset Snapshot

- 가장 가격이 높은 Want 또는 가장 최근 Want 기준
- price
- expectedYield
- requiredCapital
- monthlyCashflowNeeded

### Subscription Summary

- 총 월 구독비
- keep / review / cancel 개수
- 해지 후보 리스트

### Recent Insights

- 최근 인사이트 3개

## 완료 기준

- 각 화면에서 데이터 변경 후 Dashboard에 반영됨
- 새로고침 후에도 localStorage 데이터 기반으로 표시됨
- 데이터가 없을 때 빈 상태 UI 표시

---

# Step 14. UI 품질 정리

## 목표

기능 추가 후 UI 밀도와 일관성을 정리한다.

## 체크리스트

- 카드 border, radius, padding 일관성
- 버튼 스타일 일관성
- input 스타일 일관성
- modal 스타일 일관성
- empty state 문구 추가
- 숫자 크기와 시각적 우선순위 정리
- 모바일에서 심각하게 깨지지 않게 처리
- overflow 처리
- 긴 텍스트 line-clamp 적용

## 완료 기준

- Dashboard가 복잡하지만 정돈되어 보임
- 가계부처럼 보이지 않음
- 투자앱처럼만 보이지 않음
- “개인 운영 대시보드” 느낌 유지

---

# Step 15. README 업데이트

## 목표

현재 구현 상태를 README에 반영한다.

## 수정 대상

```txt
README.md
```

## 포함 내용

- 현재 버전
- 현재 구현 기능
- 아직 구현하지 않은 기능
- 실행 방법
- localStorage 사용 안내
- 백엔드는 아직 없다는 내용
- 다음 단계 계획

## 현재 상태 문구 예시

```md
## 현재 상태

현재 AIOP는 frontend-only personal MVP입니다.

- 백엔드는 아직 구현하지 않았습니다.
- 인증은 아직 없습니다.
- 데이터베이스는 아직 연결하지 않았습니다.
- 모든 데이터는 localStorage에 저장됩니다.
- 외부 API와 AI API는 아직 사용하지 않습니다.
```

---

# Step 16. Git 커밋 단위 추천

작업은 아래처럼 나눠서 커밋한다.

```bash
git add .
git commit -m "Add calculation utilities"
```

```bash
git add .
git commit -m "Make asset calculator interactive"
```

```bash
git add .
git commit -m "Add local wants management"
```

```bash
git add .
git commit -m "Persist wants with localStorage"
```

```bash
git add .
git commit -m "Add local subscription management"
```

```bash
git add .
git commit -m "Add notes and insights local management"
```

```bash
git add .
git commit -m "Connect dashboard to local data"
```

```bash
git add .
git commit -m "Polish frontend MVP"
```

---

## 4. Claude Code 작업 지시 원칙

Claude Code에게 작업을 맡길 때는 한 번에 전체를 시키지 말고 단계별로 시킨다.

좋은 지시 방식:

```txt
Step 1과 Step 2만 구현해줘.
기존 UI를 깨지 말고, TypeScript 에러 없이 처리해줘.
완료 후 수정한 파일 목록과 테스트 방법을 알려줘.
```

나쁜 지시 방식:

```txt
전체 기능 다 만들어줘.
```

큰 작업을 한 번에 시키면 기존 UI가 깨지거나 구조가 과하게 바뀔 수 있다.

---

## 5. Claude Code 첫 작업 프롬프트

아래 문장을 첫 작업으로 사용한다.

```txt
현재 프로젝트는 AIOP 프론트엔드 MVP입니다.

백엔드는 아직 구현하지 않습니다.
Supabase, Auth, DB, 외부 API, OpenAI API는 추가하지 마세요.

이번 작업에서는 아래 두 단계만 구현하세요.

1. Step 1 — 계산 로직 분리
2. Step 2 — 공통 포맷 유틸 작성

요구사항:
- src/lib/calculations.ts 파일을 만들거나 정리하세요.
- src/lib/formatters.ts 파일을 만드세요.
- 기존 UI는 깨지지 않아야 합니다.
- TypeScript 에러가 없어야 합니다.
- 0, 음수, undefined, NaN 입력에도 안전하게 동작해야 합니다.
- 아직 화면 연결은 최소화하거나 하지 않아도 됩니다.
- 완료 후 수정한 파일 목록, 구현한 함수 목록, 테스트 방법을 알려주세요.
```

---

## 6. Claude Code 두 번째 작업 프롬프트

```txt
이전 단계에서 calculations.ts와 formatters.ts를 만들었습니다.

이번 작업에서는 Asset Calculator 화면만 실제 동작하도록 연결하세요.

백엔드는 구현하지 않습니다.
Supabase, Auth, DB, 외부 API, OpenAI API는 추가하지 마세요.

요구사항:
- Asset Calculator 입력값을 useState로 관리하세요.
- Item Price, Target Months, Expected Yield %, Monthly Investment 입력값을 변경할 수 있어야 합니다.
- 입력값 변경 시 Required Capital, Monthly Cashflow Needed, Months to Buy, Purchase Decision이 실시간으로 갱신되어야 합니다.
- 계산은 src/lib/calculations.ts의 함수를 사용하세요.
- 금액/퍼센트 표시는 src/lib/formatters.ts의 함수를 사용하세요.
- 기존 디자인 톤은 유지하세요.
- 0 또는 잘못된 입력값에서도 UI가 깨지지 않게 하세요.
- 완료 후 수정한 파일 목록과 테스트 방법을 알려주세요.
```

---

## 7. Claude Code 세 번째 작업 프롬프트

```txt
이번 작업에서는 Wants 화면만 개선하세요.

백엔드는 구현하지 않습니다.
Supabase, Auth, DB, 외부 API, OpenAI API는 추가하지 마세요.
localStorage도 아직 사용하지 마세요.

목표:
- 기존 mock wants를 초기값으로 사용합니다.
- Add Want 버튼을 누르면 모달 또는 우측 패널이 열립니다.
- 사용자가 Want를 추가할 수 있습니다.
- 추가된 Want는 useState로 관리합니다.
- Want 삭제 기능을 구현합니다.
- 새로고침하면 데이터가 사라져도 괜찮습니다.

입력 필드:
- name
- price
- currency
- category
- reason
- priority
- status
- targetMonths
- expectedYield

저장 시:
- name이 비어 있으면 저장하지 마세요.
- price가 0 이하이면 저장하지 마세요.
- requiredCapital은 calculations.ts 함수로 계산하세요.
- monthlyCashflowNeeded도 calculations.ts 함수로 계산하세요.
- 새 항목은 리스트 상단에 추가하세요.
- 저장 후 폼을 초기화하고 모달을 닫으세요.

주의:
- 기존 UI 디자인을 최대한 유지하세요.
- TypeScript 타입을 명확히 하세요.
- any 사용을 피하세요.
- 완료 후 수정한 파일 목록과 테스트 방법을 알려주세요.
```

---

## 8. Claude Code 네 번째 작업 프롬프트

```txt
이번 작업에서는 Wants 데이터를 localStorage에 저장하세요.

백엔드는 구현하지 않습니다.
Supabase, Auth, DB, 외부 API, OpenAI API는 추가하지 마세요.

목표:
- src/hooks/useLocalStorage.ts 훅을 만드세요.
- WantsView에서 useLocalStorage를 사용하세요.
- 저장 key는 aiop:wants를 사용하세요.
- localStorage에 데이터가 있으면 그것을 사용하세요.
- localStorage에 데이터가 없으면 기존 mock wants를 초기값으로 사용하세요.
- 추가/삭제 시 자동 저장되게 하세요.
- 잘못된 localStorage 데이터가 있어도 앱이 깨지지 않게 하세요.

완료 기준:
- Want를 추가한 뒤 새로고침해도 유지됩니다.
- Want를 삭제한 뒤 새로고침해도 삭제 상태가 유지됩니다.
- TypeScript 에러가 없습니다.
- 기존 UI는 깨지지 않습니다.
```

---

## 9. 완료 후 검증 명령어

작업 후 아래 명령어를 실행한다.

```bash
npm run dev
```

가능하면:

```bash
npm run lint
```

TypeScript 체크 스크립트가 있다면:

```bash
npm run type-check
```

없다면 `package.json`을 확인해서 사용 가능한 스크립트를 따른다.

---

## 10. 수동 테스트 체크리스트

### Asset Calculator

```txt
[ ] 가격을 바꾸면 Required Capital이 바뀐다.
[ ] Expected Yield를 바꾸면 Required Capital이 바뀐다.
[ ] Target Months를 바꾸면 Monthly Cashflow Needed가 바뀐다.
[ ] Monthly Investment를 바꾸면 Months to Buy가 바뀐다.
[ ] 0 입력 시 화면이 깨지지 않는다.
[ ] 음수 입력 시 화면이 깨지지 않는다.
```

### Wants

```txt
[ ] Add Want 버튼이 동작한다.
[ ] 이름 없이 저장하면 막힌다.
[ ] 가격 0으로 저장하면 막힌다.
[ ] 저장하면 리스트 상단에 추가된다.
[ ] requiredCapital이 자동 계산된다.
[ ] monthlyCashflowNeeded가 자동 계산된다.
[ ] Delete가 동작한다.
[ ] 새로고침 전까지 상태가 유지된다.
```

### localStorage 적용 후

```txt
[ ] Want 추가 후 새로고침해도 유지된다.
[ ] Want 삭제 후 새로고침해도 삭제 상태가 유지된다.
[ ] localStorage를 비우면 mock data로 fallback된다.
```

---

## 11. 다음 백엔드 전환 기준

아래 조건을 만족하면 Supabase 백엔드로 넘어간다.

```txt
[ ] Wants를 실제로 며칠 써봤다.
[ ] localStorage만으로 부족함이 생겼다.
[ ] 모바일 앱 연동 필요성이 명확해졌다.
[ ] 데이터 백업이 필요해졌다.
[ ] 로그인 기반 사용자 분리가 필요해졌다.
```

그 전까지는 백엔드를 구현하지 않는다.

---

## 12. 최종 목표

이 문서의 v1.0 목표는 다음이다.

> 백엔드 없이도 로컬에서 실제로 사용할 수 있는 개인용 AIOP MVP

완성된 v1.0은 다음 조건을 만족해야 한다.

```txt
[ ] 매일 켜두고 볼 수 있는 Dashboard가 있다.
[ ] 사고 싶은 것을 기록할 수 있다.
[ ] 자산 기준으로 구매 판단 계산이 가능하다.
[ ] 월 구독을 정리할 수 있다.
[ ] 책/영상 인사이트를 정리할 수 있다.
[ ] 빠른 메모를 남길 수 있다.
[ ] “그때 살걸” 기록을 남길 수 있다.
[ ] 데이터가 localStorage에 저장된다.
[ ] 백엔드는 아직 없다.
[ ] 나중에 Supabase로 확장하기 쉬운 구조다.
```
