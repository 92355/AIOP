# 작업 계획 — AIOP v0.9 (Dashboard 데이터 통합)

작성일: 2026-05-11
범위: AGENTS.md Step 13
대상 디렉토리: `C:/dev/AIOP/src/components/dashboard`
선행 계획서: `aiop-v02-v03-plan.md`, `aiop-v04-v06-plan.md`, `aiop-v07-v08-plan.md` (모두 완료)

## 1. 요구사항 요약

- 최종 목표: AGENTS.md 로드맵의 **v0.9 (Dashboard 데이터 통합)** 완료
- 사용자가 제공한 요구사항:
  - Dashboard 5개 컴포넌트(SummaryCards, WantPreview, AssetSnapshot, SubscriptionSummary, RecentInsights)가 모듈 스코프에서 mock을 직접 import + `reduce`/`filter`를 호출하는 안티패턴을 정리
  - 각 화면 View가 이미 사용 중인 localStorage 키(`aiop:wants`, `aiop:subscriptions`, `aiop:insights`, `aiop:notes`, `aiop:regret-items`)를 Dashboard도 동일하게 읽도록 변경
- 반드시 지켜야 할 조건:
  - AGENTS.md Step 13 표시 항목 5종(Summary, WantPreview, AssetSnapshot, SubscriptionSummary, RecentInsights) 모두 구현
  - Notes Inbox 개수를 Summary에 추가 (현재 누락)
  - 빈 상태(empty state) UI 추가 (AGENTS.md 완료 기준)
  - 백엔드/Auth/외부 API/AI API 없음
  - 디자인 톤 (zinc/emerald, rounded-2xl, shadow-soft) 보존
  - SSR/hydration 안전 (기존 `useLocalStorage` 훅 그대로 사용)

## 2. 현재 상황 판단

확인된 정보:
- Dashboard 5개 컴포넌트 모두 `src/data/mockData.ts`를 직접 import하고 모듈 스코프에서 `reduce`/`filter`/`slice` 호출 → 서버 컴포넌트로 빌드되며 mock 고정값을 표시
- 각 화면 View는 이미 client component + `useLocalStorage` 적용 완료 (v0.4~v0.8 작업 산물)
- `useLocalStorage` 훅은 SSR 안전: initialValue로 첫 렌더, mount 후 hydrate, JSON 파싱 실패 시 initialValue fallback
- 이미 사용 중인 localStorage 키:
  - `aiop:wants` (Want[])
  - `aiop:subscriptions` (Subscription[])
  - `aiop:insights` (Insight[])
  - `aiop:notes` (Note[])
  - `aiop:regret-items` (RegretItem[])
- `AssetSnapshot`은 완전 하드코딩(맥북 프로 3,500,000 / 4% / 87,500,000) — 동적 산출이 전혀 없는 상태
- `SubscriptionSummary`는 mock의 `item.service` 필드를 표시 — 타입과 정합성 확인 필요
- `WantPreview`는 `item.score`를 표시 — 타입은 `aiScore?: number` 가능성, 정합성 확인 필요

부족한 정보:
- AGENTS.md Step 13의 AssetSnapshot 기준: "가장 가격이 높은 Want **또는** 가장 최근 Want 기준" 두 옵션 명시
  - **결정: "가장 최근 Want" 채택** (사용자 확정, 2026-05-11). 사유: 새 항목 추가 → 즉시 Dashboard 카드 반영이 직관적, 사용자가 방금 한 의사결정과 가장 가깝게 연결

확실하지 않은 부분:
- 5개를 모두 `"use client"`로 전환할지, 일부는 Server에서 전송 후 client에서 hydrate하는 분리 패턴을 쓸지 → 기존 화면별 View가 모두 single client component이므로 **동일 패턴(전부 client 전환)** 채택
- WantPreview의 정렬 기준: AGENTS.md "최근 추가된 Want 3~5개" — 새 항목은 v0.3 작업으로 prepend되므로 **목록 앞 5개 = 최근 5개**로 동작
- 빈 상태 UI 톤: 한 줄 안내문 + 회색 톤 (기존 디자인 톤 보존)

## 3. 작업 범위

### 수정 예상 파일 (5개)

| 파일 | 변경 종류 |
|---|---|
| `src/components/dashboard/SummaryCards.tsx` | client 전환, useLocalStorage 4종 hydrate, Notes Inbox 카드 추가 |
| `src/components/dashboard/WantPreview.tsx` | client 전환, useLocalStorage(`aiop:wants`), 빈 상태, 필드명 정합 |
| `src/components/dashboard/AssetSnapshot.tsx` | client 전환, useLocalStorage(`aiop:wants`) + `calculateRequiredCapital` 연동, 빈 상태 |
| `src/components/dashboard/SubscriptionSummary.tsx` | client 전환, useLocalStorage(`aiop:subscriptions`), 해지 후보 칩, 빈 상태 |
| `src/components/dashboard/RecentInsights.tsx` | client 전환, useLocalStorage(`aiop:insights`), 빈 상태 |

### 추가될 기능

- Dashboard 5개 카드 전체가 localStorage 데이터로 hydrate → 새로고침/재방문 시에도 사용자 데이터 반영
- AssetSnapshot: "가장 가격이 높은 Want" 자동 선택, `expectedYield`/`price` 기반으로 `calculateRequiredCapital` 동적 호출
- Notes Inbox 카드 (Summary): `status === "inbox"` 개수 표시
- SubscriptionSummary: keep / review / cancel 카운트 + 해지 후보 칩 동적 산출
- 5개 카드 모두 빈 상태(데이터 0개) 안내문 표시

### 수정하지 않을 범위

- `src/data/mockData.ts` (이미 v0.7-v0.8까지 정리됨)
- 각 화면별 View 파일 (Wants/Subscriptions/Insights/Notes/Regret — 이미 localStorage 연동 완료)
- `useLocalStorage` 훅
- 디자인 톤
- Context/공용 훅 도입 (v1.0에서 함께 검토)
- Storage event 기반 같은 탭 실시간 동기화 (페이지 이동 후 mount 시 hydrate로 충분)
- 백엔드, 외부 API, 인증

## 4. 구현 방향

선택한 방식:
- 5개 Dashboard 컴포넌트를 각자 client component로 전환하고 자체적으로 `useLocalStorage` 호출
- 상태 공유 도구(Context/공용 훅) 추가하지 않음
- AssetSnapshot 기준 Want = **"가장 최근 Want" (`items[0]`)** — 사용자 확정
- 집계 계산은 컴포넌트 내부 `useMemo`로 분리 (모듈 스코프 reduce 제거)

선택 이유:
- 화면별 View가 이미 옵션 A(직접 useLocalStorage 호출) 패턴 사용 중 → 일관성 유지
- Context 도입은 표면적이 크고 v1.0 정리 범위와 겹침 → 보수적 변경 우선
- "가장 최근 Want" = 새 항목 prepend 직후 즉시 카드 반영 → 사용자 의사결정 흐름과 카드 표시 연결이 직관적
- `useMemo`로 분리하면 hydrate 전/후 모두 동일 코드 경로

대안:
- **방법 A: 각 컴포넌트가 직접 useLocalStorage 호출 (선택)**
  - 장점: 기존 패턴 일관, 변경 표면적 작음, 추가 추상 없음
  - 단점: 같은 탭에서 다른 페이지 작업 중에는 동기화 안 됨 (재방문 시에는 정상 hydrate)
- **방법 B: Context 도입(`AppDataContext` 단일 source of truth)**
  - 장점: 같은 탭 동시 동기화, storage event 통합 쉬움
  - 단점: 5개 View + 5개 Dashboard + Provider 도입 = 큰 변경, v1.0 범위와 중복
- **방법 C: 공용 훅 (`useWantsStore` 등)**
  - 장점: 캡슐화 향상, 미래 Context 전환 시 인터페이스 안정
  - 단점: 현 시점 가치 대비 보일러플레이트, v1.0까지 미루는 게 자연스러움

AssetSnapshot 기준 대안:
- **A. 가장 최근 Want (`items[0]`)** (선택, 사용자 확정) — 새 항목 prepend 직후 즉시 반영, UX 직관
- **B. 가장 가격이 높은 Want** — 변동 적고 "가장 큰 구매 목표" 의미와 맞음. 빈 배열 가드 + `reduce`로 산출
  - 추후 전환 원하면 `items[0]` → `items.reduce((a, b) => a.price >= b.price ? a : b)` 한 줄 수정

## 5. 작업 순서

1. **SummaryCards 전환**
   - `"use client"` 선언
   - `useLocalStorage<Want[]>("aiop:wants", wants)`, `Subscription[]`, `Insight[]`, `Note[]` 4종 hydrate
   - 카드 5개로 확장: `사고 싶은 항목` / `이번 달 구독비` / `자산 커버 소비` / `최근 인사이트` / `Notes Inbox`
   - Notes Inbox = `notes.filter(n => n.status === "inbox").length`
   - `monthlyTotal`, `coverableSpend`는 `useMemo`로 분리
   - 빈 데이터는 0개 / ₩0 그대로 표시 (별도 empty UI 불필요)
   - verify: tsc, build, dev에서 5장 카드 표시

2. **WantPreview 전환**
   - `"use client"` 선언
   - `useLocalStorage<Want[]>("aiop:wants", wants)`
   - `items.slice(0, 5)` 유지
   - 빈 상태: `items.length === 0`이면 "아직 등록된 항목이 없습니다." 안내 카드
   - `item.score` → 타입에 맞춰 정합 (`aiScore` 사용 여부 빌드로 확인 후 통일)
   - verify: Wants 페이지에서 추가 → Dashboard 이동 시 반영

3. **AssetSnapshot 전환 + 동적 계산**
   - `"use client"` 선언
   - `useLocalStorage<Want[]>("aiop:wants", wants)`
   - `target = items[0]` (빈 배열 가드: `items.length === 0` 이면 빈 상태 UI 분기)
   - `requiredCapital = calculateRequiredCapital(target.price, target.expectedYield)`
   - 표시: name, price, expectedYield(%), requiredCapital
   - 구매 판단 문구: 알고리즘 도입 없음, 기존 mock 문구 유지 또는 단순 문구로 치환 (v0.9 범위 외)
   - 빈 상태: "추적 중인 구매 목표가 없습니다." 안내
   - verify: Wants에 새 항목 추가 → AssetSnapshot이 그 항목으로 갱신

4. **SubscriptionSummary 전환**
   - `"use client"` 선언
   - `useLocalStorage<Subscription[]>("aiop:subscriptions", subscriptions)`
   - `total`, `keep`, `review`, `cancel` 각각 `useMemo`로 분리
   - 해지 후보 칩: `status === "cancel"` 또는 `"review"` 항목 4개 (`item.name` 통일)
   - 빈 상태: "등록된 구독이 없습니다." 안내
   - verify: 구독 추가/삭제 → Dashboard 총액/카운트 반영

5. **RecentInsights 전환**
   - `"use client"` 선언
   - `useLocalStorage<Insight[]>("aiop:insights", insights)`
   - `items.slice(0, 3)` 유지
   - `keySentence`/`actionItem` 표시 (기존 그대로)
   - 빈 상태: "최근 인사이트가 없습니다." 안내
   - verify: 인사이트 추가/삭제 → Dashboard 3개 반영

6. **타입/필드 정합 확인**
   - WantPreview의 `item.score` vs 타입 정의 어긋남 → tsc 에러 발생 시 `aiScore`로 통일
   - SubscriptionSummary의 `item.service` vs 타입 정의 → mockData 실제 필드 확인 후 통일
   - `npx tsc --noEmit` 0 에러 보장

7. **최종 검증**
   - `npx tsc --noEmit`
   - `npm run build`
   - `npm run dev` 시나리오 점검:
     - Wants에서 추가/삭제 → SummaryCards 개수/총액 변경
     - Subscriptions에서 status 토글 → keep/review/cancel 카운트 변경
     - Insights에서 추가 → RecentInsights 상단 반영
     - Notes에서 inbox 메모 추가 → SummaryCards Notes 개수 증가
     - DevTools에서 `aiop:wants`를 `"invalid"`로 손상 → mock fallback 확인

## 6. 예상 위험도

- 낮음:
  - SummaryCards, WantPreview, SubscriptionSummary, RecentInsights의 client 전환 (구조 동일, hook 1~4개 추가)
- 중간:
  - AssetSnapshot 동적 계산 (현재 100% 하드코딩이라 시각적 변화 큼, 빈 배열 가드 필수)
  - 필드 정합 정리 (`score` vs `aiScore`, `service` vs `name`) — 빌드 시 발견되면 한쪽으로 통일 결정
- 높음: 없음

## 7. 확인 방법

실행 명령어 (Git Bash):
```bash
npx tsc --noEmit
npm run build
npm run dev
```

브라우저 확인 (http://localhost:3000):
- Wants → 항목 1개 추가 → Dashboard 이동 → SummaryCards "사고 싶은 항목" +1, WantPreview 상단 반영, AssetSnapshot이 방금 추가한 항목으로 갱신
- Subscriptions → `keep` 한 개를 `cancel`로 변경 → Dashboard 이동 → keep/cancel 카운트 변동, 해지 후보 칩에 추가
- Insights → 항목 1개 추가 → Dashboard 이동 → RecentInsights 상단 반영
- Notes → inbox 메모 1개 추가 → SummaryCards "Notes Inbox" +1
- DevTools Application → Local Storage → `aiop:wants` 값을 `"invalid"`로 덮어쓰고 새로고침 → Dashboard가 mock으로 fallback

## 8. 구현 전 확인 질문

- 없음. AssetSnapshot 기준은 **"가장 최근 Want (`items[0]`)"** 로 사용자 확정(2026-05-11). `진행해` / `구현해` / `그대로 해줘` 중 하나로 응답 시 위 1~7 순서대로 구현 시작.

## 부록 — 다음 묶음

- **v1.0** (Step 14, 15): UI 품질 정리 (카드/버튼/input/modal 일관성, empty state 문구, overflow/line-clamp, 모바일 깨짐 방지) + README 업데이트. `tsconfig.tsbuildinfo` 정리, lint 결정 포함.
- Context/공용 훅 도입은 v1.0에서 함께 검토 (현 v0.9에서는 안 함).
