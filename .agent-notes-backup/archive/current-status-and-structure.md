# AIOP 현재 구현 상태 및 구조

> ⚠ **DEPRECATED (2026-05-11)** — 이 문서는 v0.8 시점 스냅샷입니다. 최신 상태는
> [`aiop-current-status-and-next-steps.md`](./aiop-current-status-and-next-steps.md),
> 진행 계획은 [`aiop-next-steps-stage2.md`](./aiop-next-steps-stage2.md) 를 참고하세요.

> 작성일: 2026-05-09
> 대상 브랜치: `main`
> 기준: 워킹 트리(미커밋 변경 포함) 전체

---

## 1. 프로젝트 개요

- **이름**: AIOP (All-In-One Page / 개인 운영 대시보드)
- **목표**: 한 페이지에서 구매 판단, 자산 계산, 구독, 인사이트, 후회 기록, 메모를 모두 관리
- **현재 단계**: 프론트엔드 개인용 MVP (백엔드 없음)
- **타겟 사용자**: 본인 (개인 사용)

---

## 2. 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript 5.7 |
| UI | React 19 |
| 스타일 | Tailwind CSS 3.4 |
| 아이콘 | lucide-react |
| 상태 저장 | `useLocalStorage` 커스텀 훅 (localStorage) |
| 백엔드 | 없음 |
| 인증 | 없음 |
| DB | 없음 |
| 외부 API | 없음 |
| AI API | 없음 |

---

## 3. 디렉토리 구조

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx                       # 단일 진입점, 뷰 라우팅을 useState로 처리
├── components/
│   ├── calculator/
│   │   └── AssetCalculatorView.tsx
│   ├── dashboard/
│   │   ├── AssetSnapshot.tsx
│   │   ├── RecentInsights.tsx
│   │   ├── SubscriptionSummary.tsx
│   │   ├── SummaryCards.tsx
│   │   └── WantPreview.tsx
│   ├── insights/
│   │   ├── BookInsightsView.tsx
│   │   └── InsightCard.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── notes/
│   │   └── NotesInboxView.tsx
│   ├── regret/
│   │   └── RegretTrackerView.tsx
│   ├── subscriptions/
│   │   ├── AddSubscriptionModal.tsx
│   │   ├── SubscriptionCard.tsx
│   │   └── SubscriptionsView.tsx
│   └── wants/
│       ├── AddWantModal.tsx
│       ├── WantCard.tsx
│       └── WantsView.tsx
├── data/
│   └── mockData.ts                    # 초기 mock data (wants/subscriptions/insights/regrets/notes)
├── hooks/
│   └── useLocalStorage.ts             # SSR-safe 제네릭 localStorage 훅
├── lib/
│   ├── calculations.ts                # 자산 계산 함수
│   ├── formatters.ts                  # 통화/퍼센트/날짜 포맷
│   └── labels.ts                      # 한국어 라벨 매핑
└── types/
    └── index.ts                       # 도메인 타입 정의
```

---

## 4. 라우팅 / 화면 전환

- 별도 라우터 없이 `src/app/page.tsx`에서 `selectedView` state로 단일 페이지 안에서 뷰를 스위칭한다.
- `AppShell` → `Sidebar`의 `onSelectView`로 `ViewKey`를 변경한다.
- `ViewKey`: `dashboard | wants | calculator | regret | subscriptions | insights | notes`

---

## 5. 화면별 구현 상태

### 5.1 Dashboard (대시보드)

- 파일: `SummaryCards.tsx`, `WantPreview.tsx`, `AssetSnapshot.tsx`, `SubscriptionSummary.tsx`, `RecentInsights.tsx`
- **상태: mockData 직참조** — 각 카드는 `@/data/mockData`의 wants/subscriptions/insights를 모듈 최상위에서 합산한다.
- localStorage 데이터와 **연동되어 있지 않다**. (Wants/Subscriptions/Notes 화면에서 추가/삭제해도 Dashboard 수치는 변하지 않음)

### 5.2 Wants (구매 목표)

- `WantsView.tsx`, `WantCard.tsx`, `AddWantModal.tsx`
- localStorage key: `aiop:wants`
- 구현 완료: 추가 모달, 카드 렌더링, 삭제, 카테고리 필터 UI(시각만, 필터링 로직 미연결)
- 폼 검증: 이름 필수, 가격 > 0
- 저장 시 `requiredCapital`, `monthlyCashflowNeeded` 자동 계산
- ID: `crypto.randomUUID()` (fallback `Date.now()`)
- 미구현: 카테고리 필터 실제 동작, 상태 변경 UI

### 5.3 Asset Calculator (자산 구매 계산기)

- `AssetCalculatorView.tsx`
- 입력: 구매 가격, 목표 기간, 예상 수익률, 월 투자 가능액
- 결과: 필요 자산, 월 필요 현금흐름, 구매까지 걸리는 기간, 구매 판단
- 계산: `calculateAssetPlan`을 useMemo로 처리 → 입력값 변경 시 실시간 갱신
- 구매 판단 로직:
  - `requiredCapital >= 1억` → "신중한 계획이 필요합니다"
  - `monthsToBuy <= 3` → "곧 구매 가능합니다"
  - `monthsToBuy <= 12` → "목표로 설정하세요"
  - 그 외 → "보류"
  - 입력값 0/음수 → "입력값이 더 필요합니다"

### 5.4 Subscriptions (구독 관리)

- `SubscriptionsView.tsx`, `SubscriptionCard.tsx`, `AddSubscriptionModal.tsx`
- localStorage key: `aiop:subscriptions`
- 구현 완료: 추가, 삭제, 상태(keep/review/cancel) 변경, 요약 카드(총액·유지·검토·해지 카운트)
- 폼 검증: 서비스명 필수, 월 금액 > 0, 가치점수 0~100 클램프

### 5.5 Notes / Inbox (노트)

- `NotesInboxView.tsx`
- localStorage key: `aiop:notes`
- 구현 완료: 빠른 추가, 삭제, 태그 토글, 최근순 표시
- 미구현: status 변경 UI(`inbox/processed/archived`), 검색

### 5.6 Book Insights (인사이트)

- `BookInsightsView.tsx`, `InsightCard.tsx`
- **상태: mockData 그대로 표시 (읽기 전용)**
- 미구현: 추가 모달, 삭제, localStorage 저장

### 5.7 Regret Tracker (후회 기록장)

- `RegretTrackerView.tsx`
- **상태: mockData 그대로 표시 (읽기 전용)**
- 미구현: 추가 모달, 삭제, `resultPercent`/`profitAmount` 계산, localStorage 저장

---

## 6. 공통 모듈

### 6.1 `src/lib/calculations.ts`

| 함수 | 입력 | 반환 | 예외 처리 |
| --- | --- | --- | --- |
| `calculateRequiredCapital` | price, expectedYield | `price / (yield/100)` | yield ≤ 0이면 0 |
| `calculateMonthsToBuy` | price, monthlyInvestment | `price / monthly` | monthly ≤ 0이면 0 |
| `calculateMonthlyCashflowNeeded` | price, targetMonths | `price / months` | months ≤ 0이면 0 |
| `calculateAssetPlan` | 위 4값 | 3개 결과 객체 | 위 함수들 위임 |

> AGENTS.md에서 명세된 `calculateRegretPercent`, `calculateProfitAmount`는 **아직 미구현**.

### 6.2 `src/lib/formatters.ts`

- `formatKRW(value)` — `Intl.NumberFormat ko-KR currency`
- `formatCompactKRW(value)` — 1억/1만 단위 축약
- `formatPercent(value)` — `12%` 형태 (부호 자동 표시 미구현)
- `formatNumber(value)` — 한국어 천 단위
- `formatDate(value)` — `YYYY. MM. DD.`

> AGENTS.md 명세의 `Currency` 인자, `+/-` 부호 표시는 **미구현**.

### 6.3 `src/lib/labels.ts`

- 영문 enum → 한국어 라벨 매핑
- 카테고리(Productivity 등), 우선순위, Want/Subscription/Note 상태, 사용 빈도, 인사이트 타입 모두 지원

### 6.4 `src/hooks/useLocalStorage.ts`

- SSR 환경에서 `window` 접근 회피
- 마운트 시 hydration → 이후부터 저장
- JSON parse 실패 시 initialValue로 fallback
- 제네릭 `<T>` 지원

---

## 7. 도메인 타입 (`src/types/index.ts`)

| 타입 | 주요 필드 |
| --- | --- |
| `WantItem` | id, name, price, category, reason, status, score, requiredCapital, targetDate, priority?, targetMonths?, expectedYield?, monthlyCashflowNeeded?, currency? |
| `Subscription` | id, service, monthlyPrice, category, usage, valueScore, status |
| `Insight` | id, title, sourceType, keySentence, actionItem, tags[], relatedGoal |
| `RegretItem` | id, name, oldPrice, currentPrice, changeRate, memo, thoughtThen, resultNow |
| `Note` | id, title?, body, tags[], createdAt, status? |
| `ViewKey`, `NavItem` | 사이드바 라우팅용 |

> AGENTS.md 명세와 차이점:
>
> - `WantItem.aiScore` → `score` (이름 다름)
> - `Subscription.name` → `service`, `usageFrequency` → `usage`
> - `Insight.summary` → `keySentence`, `relatedTarget` → `relatedGoal`
> - `RegretItem.watchedPrice/quantity/symbol/note/resultPercent/profitAmount` 명세 있으나 현재는 `oldPrice/currentPrice/changeRate/memo/thoughtThen/resultNow` 구조 사용
> - `Currency` 타입은 정의돼 있으나 currency 분기 포맷팅은 KRW 전용

---

## 8. 로드맵 대비 진행도 (AGENTS.md 기준)

| Step | 내용 | 상태 |
| --- | --- | --- |
| 1 | 계산 로직 분리 | 완료 (Regret 함수만 누락) |
| 2 | 포맷 유틸 | 완료 (currency 분기 미구현) |
| 3 | 타입 정리 | 부분 완료 (네이밍/필드 명세와 다름) |
| 4 | Asset Calculator 실제 동작 | 완료 |
| 5 | Wants Add Modal | 완료 |
| 6 | Wants 삭제 | 완료 |
| 7 | useLocalStorage 훅 | 완료 |
| 8 | Wants localStorage | 완료 |
| 9 | Subscriptions 로컬 CRUD | 완료 |
| 10 | Notes 로컬 CRUD | 부분 완료 (status 변경 UI 없음) |
| 11 | Book Insights 로컬 CRUD | **미구현** |
| 12 | Regret Tracker 로컬 계산 | **미구현** |
| 13 | Dashboard 데이터 통합 | **미구현** (mockData 직참조 유지) |
| 14 | UI 품질 정리 | 미진행 |
| 15 | README 업데이트 | 미진행 |

---

## 9. localStorage 사용 키 정리

| 화면 | key | 초기값 |
| --- | --- | --- |
| Wants | `aiop:wants` | `mockData.wants` |
| Subscriptions | `aiop:subscriptions` | `mockData.subscriptions` |
| Notes | `aiop:notes` | `mockData.notes` |
| Insights | (미사용) | — |
| Regret | (미사용) | — |

---

## 10. 알려진 한계 / TODO

### 코드 측면

- Dashboard 카드(`SummaryCards`, `WantPreview`, `AssetSnapshot`, `SubscriptionSummary`, `RecentInsights`)가 모두 mockData를 모듈 최상위에서 import해 계산하므로, 실제 사용자 데이터가 반영되지 않는다.
- Wants 화면의 카테고리 필터 버튼은 시각적 토글만 있고 실제 필터링 동작이 없다.
- `formatDate`는 잘못된 ISO 입력 시 `Invalid Date`로 표시될 수 있다(빈 값 가드 없음).
- Insights/Regret 컴포넌트는 서버 컴포넌트로 보이며 mockData만 표시한다 → CRUD 추가 시 `"use client"` 필요.
- `ResultRow` 등 일부 inline 컴포넌트는 같은 파일에 산재해 있어, 추후 분리 여부 검토 필요.

### 명세 정합성

- `RegretItem`은 AGENTS.md 명세(watchedPrice/quantity 등)와 현재 구현(oldPrice/changeRate)의 필드 정의가 다르다. v0.8 진행 전 결정 필요.
- `formatCurrency(value, currency?)` 시그니처가 `formatKRW`로 단순화돼 있다. USD 지원 시 시그니처 변경 필요.

### 기능 측면

- 검색 / 정렬 / 필터 없음
- 데이터 백업/내보내기/가져오기 없음
- 다크모드만 존재 (라이트 모드 없음)
- 모바일 레이아웃은 Tailwind 반응형으로 처리하나 본격 검증 안 됨

---

## 11. 다음 추천 작업 순서

1. **Step 13 — Dashboard 데이터 통합**
   가장 임팩트가 크다. localStorage 데이터를 Dashboard에 반영하면 "매일 켜두는 페이지" 컨셉이 비로소 검증된다.
2. **Step 11 — Book Insights 로컬 CRUD**
3. **Step 12 — Regret Tracker 로컬 계산**
   (`calculations.ts`에 `calculateRegretPercent`, `calculateProfitAmount` 추가 필요)
4. Notes status 변경 UI / 카테고리 필터 동작
5. Step 14 — UI 일관성 정리
6. Step 15 — README 업데이트

---

## 12. 검증 명령어

```bash
npm run dev       # 개발 서버
npm run build     # 빌드 (TypeScript 체크 포함)
npm run lint      # ESLint
```

`type-check` 전용 스크립트는 `package.json`에 정의돼 있지 않다.
