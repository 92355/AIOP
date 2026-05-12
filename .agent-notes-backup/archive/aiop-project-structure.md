# AIOP 프로젝트 구조

작성일: 2026-05-11
대상 버전: v0.9 완료 시점 (Dashboard 데이터 통합까지 적용된 상태)
소스 파일 수: TypeScript/TSX 30개 + CSS 1개

---

## 1. 루트 디렉토리

```txt
C:/dev/AIOP/
├─ .agent-notes/          작업 노트 (전역 .gitignore_global로 제외, 커밋되지 않음)
├─ .git/
├─ .idea/                 IDE 설정 (PhpStorm)
├─ .next/                 Next.js 빌드 산출물
├─ node_modules/
├─ src/                   애플리케이션 소스
├─ .gitignore
├─ AGENTS.md              v0.1~v1.0 구현 순서 + Step별 상세 명세
├─ README.md              프로젝트 소개 / 현재 상태 / 로드맵
├─ next-env.d.ts          Next.js 자동 생성 타입 선언
├─ next.config.ts         Next.js 설정 (현재 빈 객체에 가까움)
├─ package.json           의존성 및 scripts (dev / build / start / lint)
├─ package-lock.json
├─ postcss.config.mjs     PostCSS 설정 (Tailwind + autoprefixer)
├─ tailwind.config.ts     Tailwind 설정 (theme, shadow-soft 등 커스텀)
├─ tsconfig.json          TypeScript 컴파일러 설정
└─ tsconfig.tsbuildinfo   tsc 증분 빌드 캐시 (gitignore 대상)
```

---

## 2. src 디렉토리 전체 트리

```txt
src/
├─ app/
│  ├─ globals.css                    Tailwind 베이스 + theme-dark / theme-light CSS 변수
│  ├─ layout.tsx                     루트 레이아웃 (html, body, font, metadata)
│  └─ page.tsx                       단일 페이지 SPA 진입점, selectedView state로 View 토글
│
├─ components/
│  ├─ calculator/
│  │  └─ AssetCalculatorView.tsx     자산 구매 계산기 (입력 4종 → 결과 4종)
│  │
│  ├─ dashboard/
│  │  ├─ SummaryCards.tsx            5장 요약 카드 (Wants / 월구독비 / Target Spend / Insights / Notes Inbox)
│  │  ├─ WantPreview.tsx             최근 Want 5개 미리보기
│  │  ├─ AssetSnapshot.tsx           최신 Want 기준 Required Capital 표시
│  │  ├─ SubscriptionSummary.tsx     keep/review/cancel 카운트 + 해지 후보 칩
│  │  └─ RecentInsights.tsx          최근 인사이트 3개
│  │
│  ├─ insights/
│  │  ├─ BookInsightsView.tsx        인사이트 목록 + Add Modal 트리거
│  │  ├─ InsightCard.tsx             단일 인사이트 카드
│  │  └─ AddInsightModal.tsx         인사이트 추가 모달
│  │
│  ├─ layout/
│  │  ├─ AppShell.tsx                Sidebar + Header + main 영역 레이아웃, 테마 모드 보유
│  │  ├─ Header.tsx                  상단 검색 / 테마 토글 / 빠른 추가 버튼 (현재 placeholder)
│  │  └─ Sidebar.tsx                 좌측 네비게이션, 7개 View 토글
│  │
│  ├─ notes/
│  │  └─ NotesInboxView.tsx          빠른 메모 inline 입력 폼 + 최근 메모 리스트
│  │
│  ├─ regret/
│  │  ├─ RegretTrackerView.tsx       후회 항목 목록 + Add Modal 트리거
│  │  ├─ RegretCard.tsx              단일 후회 항목 카드
│  │  └─ AddRegretItemModal.tsx      후회 항목 추가 모달
│  │
│  ├─ subscriptions/
│  │  ├─ SubscriptionsView.tsx       구독 목록 + status 토글 + Add Modal 트리거
│  │  ├─ SubscriptionCard.tsx        단일 구독 카드
│  │  └─ AddSubscriptionModal.tsx    구독 추가 모달
│  │
│  └─ wants/
│     ├─ WantsView.tsx               Want 목록 + Add Modal 트리거
│     ├─ WantCard.tsx                단일 Want 카드
│     └─ AddWantModal.tsx            Want 추가 모달
│
├─ data/
│  └─ mockData.ts                    wants / subscriptions / insights / notes / regret-items 초기/Fallback 데이터
│
├─ hooks/
│  └─ useLocalStorage.ts             SSR-safe localStorage hydrate + write 훅 (storage 이벤트 listener 없음)
│
├─ lib/
│  ├─ calculations.ts                Required Capital / Monthly Cashflow / Months to Buy / Regret 계산
│  ├─ formatters.ts                  KRW / USD / Percent / Date / CompactKRW 포맷터
│  └─ labels.ts                      enum → 한글 라벨 매핑 (status, priority, category, sourceType, usage 등)
│
└─ types/
   └─ index.ts                       전역 타입 정의 (Want / Subscription / Insight / Note / RegretItem / ViewKey 등)
```

---

## 3. 디렉토리별 책임 (요약)

| 디렉토리 | 책임 |
|---|---|
| `app/` | Next.js App Router 진입점. SPA 형태로 selectedView를 useState로 관리해 View를 토글한다. 별도 라우팅 분리 없음 |
| `components/layout/` | 화면 골격(Sidebar / Header / AppShell). 테마 모드와 View 전환을 담당 |
| `components/dashboard/` | 다른 도메인의 localStorage 데이터를 읽어 요약/미리보기 표시. 자체 데이터 변경 없음 |
| `components/<domain>/` | 5개 도메인(wants/subscriptions/insights/regret/notes)의 View + Card + Modal 묶음 |
| `data/` | mock 초기값. localStorage가 비어 있거나 손상되었을 때 fallback |
| `hooks/` | 재사용 훅 (현재 useLocalStorage 1개) |
| `lib/` | 순수 함수 유틸. 계산 / 포맷 / 라벨 매핑 |
| `types/` | 도메인 타입과 ViewKey 등 공용 enum |

---

## 4. 도메인 vs 컴포넌트 매핑

| 도메인 | View | Card | Add Modal |
|---|---|---|---|
| Wants | `WantsView.tsx` | `WantCard.tsx` | `AddWantModal.tsx` |
| Subscriptions | `SubscriptionsView.tsx` | `SubscriptionCard.tsx` | `AddSubscriptionModal.tsx` |
| Insights | `BookInsightsView.tsx` | `InsightCard.tsx` | `AddInsightModal.tsx` |
| Regret | `RegretTrackerView.tsx` | `RegretCard.tsx` | `AddRegretItemModal.tsx` |
| Notes | `NotesInboxView.tsx` | (메모 행 inline) | **없음** — view 내부 inline 입력 폼 |
| Calculator | `AssetCalculatorView.tsx` | (없음, 입출력 카드만) | (없음, 추가 개념 없음) |

Add Modal 4개 (Note 제외)는 모두 동일한 props 시그니처를 사용한다.

```ts
type AddXModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: X) => void;
};
```

---

## 5. 데이터 흐름

```txt
사용자 입력
  ↓
View 내부 useState (입력 폼 임시 상태)
  ↓
onAdd 호출 시 새 객체 생성
  ↓
View가 useLocalStorage 의 setter 호출 → 배열 prepend
  ↓
useLocalStorage 가 localStorage 에 write
  ↓
Dashboard 컴포넌트가 새로 mount될 때 동일 키를 read → 화면 갱신
```

- `useLocalStorage`는 `storage` 이벤트 listener가 없다. 같은 탭에서 mount 중인 컴포넌트는 다른 컴포넌트의 write를 자동 감지하지 못한다.
- View 전환(unmount/mount) 또는 새로고침으로 hydrate가 다시 실행돼야 반영된다.

---

## 6. localStorage 키 매핑

| Key | 타입 | 쓰는 곳 | 읽는 곳 |
|---|---|---|---|
| `aiop:wants` | `WantItem[]` | WantsView | WantsView, SummaryCards, WantPreview, AssetSnapshot |
| `aiop:subscriptions` | `Subscription[]` | SubscriptionsView | SubscriptionsView, SummaryCards, SubscriptionSummary |
| `aiop:insights` | `Insight[]` | BookInsightsView | BookInsightsView, SummaryCards, RecentInsights |
| `aiop:notes` | `Note[]` | NotesInboxView | NotesInboxView, SummaryCards (inbox 카운트) |
| `aiop:regret-items` | `RegretItem[]` | RegretTrackerView | RegretTrackerView |
| `aiop-theme-mode` | `"dark" \| "light"` | AppShell (테마 토글) | AppShell |

값 손상 시(`Array.isArray` 실패) Dashboard 컴포넌트는 `src/data/mockData.ts`로 fallback 한다.

---

## 7. 타입 요약 (`src/types/index.ts`)

```txt
ViewKey       = dashboard | wants | calculator | regret | subscriptions | insights | notes
WantStatus    = thinking | planned | bought | skipped
WantPriority  = low | medium | high
Currency      = KRW | USD
WantItem      { id, name, price, category, reason, status, score, requiredCapital, targetDate, priority?, targetMonths?, expectedYield?, monthlyCashflowNeeded?, currency? }
SubscriptionStatus = keep | review | cancel
Subscription  { id, service, monthlyPrice, category, usage, valueScore, status }
InsightType   = book | video | article | thought
Insight       { id, title, sourceType, keySentence, actionItem, tags, relatedGoal }
NoteStatus    = inbox | processed | archived
Note          { id, title?, body, tags, createdAt, status? }
RegretItem    { id, name, assetType, symbol?, watchedPrice, currentPrice, currency, quantity, watchedAt?, note, resultPercent, profitAmount }
NavItem       { key, label, icon }
```

---

## 8. 유틸 / 훅 책임

### `src/lib/calculations.ts`
- `calculateRequiredCapital(price, expectedYieldPercent)`
- `calculateMonthlyCashflowNeeded(price, targetMonths)`
- `calculateMonthsToBuy(price, monthlyInvestment)`
- `calculateRegretPercent(watchedPrice, currentPrice)`
- `calculateProfitAmount(watchedPrice, currentPrice, quantity)`
- 0 / 음수 / NaN / Infinity 입력에 대해 0 반환으로 가드

### `src/lib/formatters.ts`
- `formatKRW`, `formatUSD`, `formatPercent`, `formatNumber`, `formatDate`, `formatCompactKRW`

### `src/lib/labels.ts`
- WantStatus / WantPriority / WantCategory / SubscriptionStatus / UsageFrequency / InsightType 등 enum → 한글 라벨

### `src/hooks/useLocalStorage.ts`
- generic `<T>` 지원
- mount 후 `localStorage.getItem(key)` 으로 hydrate
- value 변경 시 `localStorage.setItem(key, JSON.stringify(value))`
- JSON parse 실패 시 initialValue로 fallback
- `storage` 이벤트 listener는 의도적으로 미구현 (v1.1+에서 검토)

---

## 9. 라우팅 / 네비게이션 방식

- Next.js App Router를 사용하지만 실제 라우트는 `/` 하나만 존재.
- `src/app/page.tsx` 안에서 `selectedView: ViewKey` state로 7개 View(Dashboard / Wants / Calculator / Regret / Subscriptions / Insights / Notes)를 조건부 렌더한다.
- Sidebar 클릭 → `setSelectedView(key)` → 해당 View만 mount.
- URL은 변하지 않으므로 새로고침 시 항상 Dashboard로 돌아온다 (의도된 단순화).

---

## 10. 스타일 / 테마

- Tailwind CSS 3.4 + custom `theme-dark` / `theme-light` 클래스를 `<div>`에 부여하는 방식.
- `src/app/globals.css`에 CSS 변수와 스크롤바 / shadow-soft 등 커스텀.
- `tailwind.config.ts`에서 `shadow-soft` 등 일부 토큰 확장.
- 디자인 톤: `zinc-900` 배경 + `emerald-400` 강조 + `rounded-2xl` + `shadow-soft`.

---

## 11. 빌드 / 실행 명령어

| 명령 | 설명 |
|---|---|
| `npm install` | 의존성 설치 |
| `npm run dev` | Next.js 개발 서버 (기본 http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint (현재 미설정 — 첫 실행 시 대화형 프롬프트) |
| `npx tsc --noEmit` | 타입 체크만 실행 |

---

## 12. 의존성 요약 (`package.json`)

런타임:
- `next ^15.0.0`
- `react ^19.0.0`, `react-dom ^19.0.0`
- `lucide-react ^0.468.0` (아이콘)
- `clsx ^2.1.1` (조건부 className)

개발:
- `typescript ^5.7.2`, `@types/node`, `@types/react`, `@types/react-dom`
- `tailwindcss ^3.4.17`, `autoprefixer`, `postcss`
- `eslint ^8.57.1`, `eslint-config-next ^15.0.0` (lint config는 아직 생성되지 않음)

---

## 13. 관련 문서

| 문서 | 용도 |
|---|---|
| `README.md` | 프로젝트 소개, 현재 구현/앞으로 구현 기능, 실행 방법 |
| `AGENTS.md` | v0.1~v1.0 단계별 구현 명세 |
| `.agent-notes/aiop-v02-v03-plan.md` | v0.2~v0.3 작업 계획 |
| `.agent-notes/aiop-v04-v06-plan.md` | v0.4~v0.6 작업 계획 |
| `.agent-notes/aiop-v07-v08-plan.md` | v0.7~v0.8 작업 계획 |
| `.agent-notes/aiop-v09-plan.md` | v0.9 Dashboard 데이터 통합 계획 |
| `.agent-notes/aiop-v09-progress.md` | v0.9 진행 기록 |
| `.agent-notes/aiop-quick-add-plan.md` | Header 빠른 추가 버튼 구현 계획 (대기 중) |
| `.agent-notes/aiop-project-structure.md` | (이 문서) 현재 프로젝트 구조 스냅샷 |
