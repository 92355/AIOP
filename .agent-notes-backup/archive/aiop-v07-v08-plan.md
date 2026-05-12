# 작업 계획 — AIOP v0.7 + v0.8 (Insights + Regret 로컬 CRUD)

작성일: 2026-05-11
범위: AGENTS.md Step 11, 12
대상 디렉토리: `C:/dev/AIOP/src`
선행 계획서: `aiop-v02-v03-plan.md` (완료), `aiop-v04-v06-plan.md` (완료)

## 1. 요구사항 요약

- AGENTS.md 로드맵의 **v0.7 (Insights 로컬 CRUD + localStorage)**, **v0.8 (Regret Tracker 로컬 계산 + localStorage)** 진행
- 백엔드, Auth, DB, 외부 API, AI API 추가하지 않음
- localStorage 키 prefix: `aiop:` (선행 계획서와 동일)
- SSR/hydration 안전: 첫 렌더는 initial mock, mount 후 localStorage로 hydrate (기존 `useLocalStorage` 훅 재사용)
- Dashboard 통합은 v0.9 별도 묶음에서 처리 (이번엔 모듈 스코프 그대로 둠)

## 2. 현재 상황 판단

확인된 정보:
- **Insights**: `BookInsightsView`가 `insights.map`만, Add/Delete 없음. `InsightCard`는 표시 전용
- **Regret**: `RegretTrackerView`가 `regrets.map`만, Add/Delete 없음. 별도 카드 컴포넌트 없이 한 파일에 인라인
- `calculations.ts`에 `calculateRegretPercent`, `calculateProfitAmount` 미존재
- `useLocalStorage<T>` 훅 존재 — 그대로 재사용 가능
- `AddWantModal`, `AddSubscriptionModal` 패턴 존재 — 모달 디자인 톤 일관 적용 가능
- `labels.ts`에 `getInsightTypeLabel` 존재

부족한 정보:
- **`RegretItem` 타입 충돌**: 현재 코드는 `oldPrice / currentPrice / changeRate / memo / thoughtThen / resultNow` — AGENTS.md 명세는 `watchedPrice / currentPrice / currency / quantity / watchedAt / note / resultPercent / profitAmount`
  - 결정: **AGENTS.md 명세 채택**. 사유: v0.8 본질이 watched/current/quantity 기반 수익률·금액 계산이라 명세 필드 없이 진행 불가
  - 기존 mockData 6개 항목은 명세 필드로 재작성 (resultPercent/profitAmount는 계산 함수로 채움)
- **Insight 타입**: 현재 `keySentence`, AGENTS.md는 `summary`. 기존 코드 일관성 유지를 위해 **`keySentence` 그대로 두고 `summary`는 옵셔널 별칭 미도입** (mockData 그대로)
- **상태 변경 기능**: AGENTS.md Step 11에 "status 변경" 없음, Step 12에도 없음 → 이번엔 Add/Delete만

확실하지 않은 부분:
- Regret 카드 색상: 상승(+) / 하락(−) / 보합(0) UI 분기 → 기존 인라인 코드의 `changeRate >= 0` 이분법 → 명세는 `resultPercent` 사용, 동일 이분법 유지
- Regret quantity 단위: 주식이면 정수, 부동산 등이면 1 — UI는 number input, 기본값 1

## 3. 작업 범위

### 수정 예상 파일 (10개)

| 파일 | 변경 종류 |
|---|---|
| `src/lib/calculations.ts` | `calculateRegretPercent`, `calculateProfitAmount` 추가 |
| `src/types/index.ts` | `RegretItem` 재설계 (AGENTS.md 명세) |
| `src/data/mockData.ts` | `regrets` 6개 항목을 새 타입으로 재작성 |
| `src/components/insights/BookInsightsView.tsx` | client 전환 + useLocalStorage + Add/Delete 핸들러 |
| `src/components/insights/InsightCard.tsx` | onDelete prop 추가, 삭제 버튼 |
| `src/components/insights/AddInsightModal.tsx` | 신규 |
| `src/components/regret/RegretTrackerView.tsx` | client 전환 + useLocalStorage + Add/Delete + 인라인 카드 분리 |
| `src/components/regret/RegretCard.tsx` | 신규 (인라인을 분리) |
| `src/components/regret/AddRegretItemModal.tsx` | 신규 |
| `src/lib/labels.ts` | (필요 시) Regret assetType 라벨 |

### 추가될 기능

- `calculateRegretPercent`, `calculateProfitAmount` 함수
- Add Insight 모달 (sourceType / title / keySentence / actionItem / tags / relatedGoal)
- Insight Delete
- Insights `aiop:insights` localStorage 영속화
- Add Regret 모달 (name / assetType / symbol / watchedPrice / currentPrice / currency / quantity / watchedAt / note)
- Regret Delete
- Regret 상승/하락 UI 자동 계산 표시 (`resultPercent`, `profitAmount`)
- Regret `aiop:regret-items` localStorage 영속화

### 수정하지 않을 범위

- Dashboard 5개 컴포넌트 (v0.9에서 통합)
- Wants, Subscriptions, Notes, Calculator
- 디자인 톤 (zinc/emerald, rounded-2xl, fixed inset-0 모달)
- `Insight` 타입 (`keySentence` 유지, `summary` 변경 안 함)
- 백엔드, 외부 API, 인증

## 4. 구현 방향

선택한 방식:
- 기존 `useLocalStorage` 훅과 `Add*Modal` 패턴을 그대로 재사용
- Regret 타입은 명세대로 재설계 — 그래야 v0.8 핵심 계산이 동작
- 상승/하락 UI는 `resultPercent` 부호 기반 (기존 `changeRate` 분기 로직과 동일 컨셉)
- AGENTS.md Step 11/12에 "status 변경"이 없으므로 이번엔 Add/Delete만 — 범위 확장 자제

선택 이유:
- 한 번에 하나씩 변경 + 디자인 톤 보존 원칙 일관 적용
- Regret 타입 충돌은 미루지 않음 (v0.8 본질 작업이므로 이번에 정리)
- 이전 묶음의 모듈 스코프 reduce 안티패턴을 답습하지 않음

대안:
- **Regret 타입 유지 + 옵셔널만 추가** → 기각. `resultPercent`/`profitAmount`를 계산해도 mock의 `changeRate`와 의미 중복, 표시 로직이 둘 다 처리해야 해 복잡도 증가
- **AddInsightModal에 sourceType free text** → 기각. select가 명세에 맞고 입력 일관성 높음

## 5. 작업 순서

1. **calculations.ts 함수 추가**
   - `calculateRegretPercent(watchedPrice, currentPrice)`: `watchedPrice <= 0` → 0, 그 외 `((currentPrice - watchedPrice) / watchedPrice) * 100`
   - `calculateProfitAmount(watchedPrice, currentPrice, quantity)`: `watchedPrice <= 0 || currentPrice <= 0 || quantity <= 0` → 0, 그 외 `(currentPrice - watchedPrice) * quantity`
   - verify: `npx tsc --noEmit` 0 에러

2. **RegretItem 타입 재설계**
   - 기존 필드 제거: `oldPrice`, `changeRate`, `memo`, `thoughtThen`, `resultNow`
   - 신규 필드: `watchedPrice`, `currentPrice: number`, `currency: Currency`, `quantity: number`, `assetType: string`, `symbol?: string`, `watchedAt?: string`, `note: string`, `resultPercent: number`, `profitAmount: number`
   - `name`, `id`는 유지
   - verify: tsc 에러 — mockData/RegretTrackerView 깨질 것 → 다음 단계에서 재작성

3. **mockData regrets 재작성**
   - 기존 6개 항목을 새 타입으로 재구성 (예: `오피스텔 매입 기회`: watchedPrice 2.5억, currentPrice 3.1억, quantity 1, currency KRW, note 한 줄 등)
   - `resultPercent`, `profitAmount`는 계산 함수로 채워 정적 값 부여
   - verify: tsc 에러 없음

4. **RegretCard 신규 분리**
   - 파일: `src/components/regret/RegretCard.tsx`
   - 기존 `RegretTrackerView` 인라인 마크업을 그대로 옮기되 필드명 새 타입 기준 (`oldPrice` → `watchedPrice`, `changeRate` → `resultPercent`, `memo` → `note`)
   - 상승/하락 ribbon: `resultPercent >= 0` 분기 (기존 컨셉 유지)
   - 추가 표시: `profitAmount`를 `currency`에 맞춰 `formatKRW` 또는 USD 포맷
   - prop: `item: RegretItem`, `onDelete?: (id: string) => void`
   - 우측 상단 삭제 아이콘 (lucide `Trash` 또는 `X`)
   - verify: 화면에 6개 카드 그대로 렌더

5. **RegretTrackerView client 전환 + CRUD**
   - `"use client"` 선언
   - `useLocalStorage<RegretItem[]>("aiop:regret-items", regrets)` 적용
   - `useState<boolean>` for isAddOpen
   - `handleAdd(item)`: id 생성 + `resultPercent` / `profitAmount` 계산해 prepend
   - `handleDelete(id)`: filter
   - 상단 헤더 옆에 "후회 항목 추가" 버튼
   - 기존 인라인 카드 → `<RegretCard />`로 치환
   - verify: Add → 새로고침 후 유지, Delete → 즉시 반영 + 새로고침 후 유지

6. **AddRegretItemModal 신규**
   - 파일: `src/components/regret/AddRegretItemModal.tsx`
   - 입력: name, assetType(text or select: 주식/부동산/물건/기타), symbol(optional), currency(select: KRW/USD, 기본 KRW), watchedPrice(number), currentPrice(number), quantity(number, 기본 1), watchedAt(date input, optional), note(textarea)
   - 검증: name 빈 값 차단, watchedPrice <= 0 차단, currentPrice <= 0 차단, quantity <= 0 차단
   - 저장 시 `calculateRegretPercent`, `calculateProfitAmount`로 두 필드 계산해서 함께 onSubmit
   - id: `crypto.randomUUID?.() ?? Date.now().toString()`
   - 디자인: 기존 `AddWantModal` / `AddSubscriptionModal`과 동일 톤 (fixed inset-0 backdrop, zinc/emerald, rounded-2xl)
   - verify: 필수값 누락 차단, 정상 입력 시 카드 prepend, %/금액 자동 계산 표시

7. **InsightCard 삭제 버튼**
   - prop 추가: `onDelete?: (id: string) => void`
   - 카드 우측 상단에 작은 삭제 아이콘 (Trash)
   - verify: 단일 카드 삭제, 다른 카드 영향 없음

8. **BookInsightsView client 전환 + CRUD**
   - `"use client"` 선언
   - `useLocalStorage<Insight[]>("aiop:insights", insights)`
   - `useState<boolean>` for isAddOpen
   - "인사이트 추가" 버튼 (헤더 우측)
   - `handleAdd(item)`: prepend
   - `handleDelete(id)`: filter
   - verify: Add/Delete + localStorage 유지

9. **AddInsightModal 신규**
   - 파일: `src/components/insights/AddInsightModal.tsx`
   - 입력: sourceType (select: book/video/article/thought), title, keySentence, actionItem, tags (comma split string → string[]), relatedGoal
   - 검증: title 빈 값 차단, keySentence 빈 값 차단
   - 디자인: 기존 모달 톤 유지
   - id 생성 동일 패턴
   - verify: 누락 차단 + 카드 prepend

10. **labels.ts 보강 (선택)**
    - Regret assetType이 한국어 자유 입력이면 추가 불필요
    - select로 한정하면 `getAssetTypeLabel` 추가
    - 결정: **자유 입력** → labels 미수정
    - verify: tsc 에러 없음

## 6. 성공 기준

- [ ] `npx tsc --noEmit` 0 에러
- [ ] `npm run build` 통과
- [ ] Insights: "인사이트 추가" 버튼 → 모달 표시
- [ ] Insights: title 또는 keySentence 빈 값 저장 차단
- [ ] Insights: 정상 입력 → 카드 prepend
- [ ] Insights: 카드 삭제 아이콘 → 해당 카드만 제거
- [ ] Insights: 새로고침 후 유지 (`aiop:insights`)
- [ ] Regret: "후회 항목 추가" 버튼 → 모달 표시
- [ ] Regret: watchedPrice/currentPrice/quantity 0 이하 저장 차단
- [ ] Regret: 정상 입력 → 카드 prepend + 상승률/수익금액 자동 표시
- [ ] Regret: 상승 시 emerald, 하락 시 zinc 톤 분기 유지
- [ ] Regret: 카드 삭제 → 해당 카드만 제거
- [ ] Regret: 새로고침 후 유지 (`aiop:regret-items`)
- [ ] localStorage를 손상시켜도 mock으로 fallback (기존 훅 동작)
- [ ] 디자인 톤 (zinc/emerald, rounded-2xl, border, shadow-soft) 보존

## 7. 예상 위험도

- 낮음:
  - calculations.ts 함수 2개 추가
  - useLocalStorage 재사용
  - InsightCard 삭제 버튼 추가
- 중간:
  - `RegretItem` 타입 재설계 + mockData 재작성 (필드명 광범위 변경, 표시 컴포넌트도 일괄 변경)
  - RegretCard 분리 (인라인 → 컴포넌트)
  - AddRegretItemModal 신규 (필드 수 가장 많음)
  - AddInsightModal 신규
- 높음: 없음

## 8. 확인 방법

실행 명령어 (Git Bash):
```bash
npx tsc --noEmit
npm run build
npm run dev
```

브라우저 확인 (http://localhost:3000):

### Insights
- "인사이트 추가" 클릭 → 모달
- title 비우고 저장 → 차단
- 정상 입력 → 상단에 카드 추가
- 삭제 아이콘 → 카드 제거
- 새로고침 → 유지
- DevTools Application → Local Storage → `aiop:insights` 확인
- DevTools에서 `aiop:insights`를 `"invalid"`로 덮어쓰고 새로고침 → mock으로 복원

### Regret
- "후회 항목 추가" → 모달
- watchedPrice 0 → 차단
- watchedPrice 100, currentPrice 130, quantity 10 → `+30%`, profit 300 표시
- watchedPrice 100, currentPrice 80, quantity 5 → `-20%`, profit -100 표시
- 삭제 아이콘 → 카드 제거
- 새로고침 → 유지
- DevTools에서 `aiop:regret-items` 확인 및 손상 fallback 테스트

### 알려진 한계
- Dashboard `RecentInsights`는 여전히 mock 기반 → v0.9에서 통합
- `Insight` 타입은 AGENTS.md 명세(`summary`)와 불일치하나 기존 코드 일관성을 위해 유지
- `tsconfig.tsbuildinfo` 정리 여부 미결 (v1.0에서 함께 처리)

## 9. 구현 전 확인 질문

- 없음. `RegretItem` 타입 재설계는 본 계획서에서 결정됨. 진행 시 위 순서 1→10 단계대로 작업, 각 단계 verify 통과 후 다음으로 이동.

## 부록 — 다음 묶음

- **v0.9** (Step 13): Dashboard 데이터 통합 — 5개 컴포넌트의 모듈 스코프 reduce 전체 정리. state 전략(Context/공용 훅) 결정 필요. 별도 계획서
- **v1.0** (Step 14, 15): UI 품질 정리 + README 업데이트. `tsconfig.tsbuildinfo` 정리, lint 설정도 이때 결정

---

## 10. 진행 결과 (2026-05-11)

### 완료한 작업

- v0.7 Insights 로컬 CRUD 구현
  - `BookInsightsView`를 client component로 전환
  - `useLocalStorage<Insight[]>("aiop:insights", insights)` 적용
  - 인사이트 추가 모달 추가
  - 인사이트 카드 삭제 버튼 추가
  - 추가 항목은 목록 상단에 prepend

- v0.8 Regret Tracker 로컬 CRUD 구현
  - `RegretTrackerView`를 client component로 전환
  - `useLocalStorage<RegretItem[]>("aiop:regret-items", regrets)` 적용
  - 후회 항목 추가 모달 추가
  - 후회 카드 컴포넌트 분리
  - 후회 카드 삭제 버튼 추가
  - 추가 항목은 목록 상단에 prepend

- Regret 계산 모델 전환
  - `RegretItem` 타입을 `watchedPrice`, `currentPrice`, `currency`, `quantity`, `watchedAt`, `note`, `resultPercent`, `profitAmount` 기반으로 변경
  - `calculateRegretPercent`, `calculateProfitAmount` 추가
  - mock regret 데이터 6개를 새 타입 구조로 재작성
  - 상승/하락 표시와 놓친 손익을 자동 계산값으로 표시

### 핵심 코드 스니펫

```ts
export function calculateRegretPercent(watchedPrice: number, currentPrice: number) {
  if (watchedPrice <= 0) return 0;
  return ((currentPrice - watchedPrice) / watchedPrice) * 100;
}

export function calculateProfitAmount(watchedPrice: number, currentPrice: number, quantity: number) {
  if (watchedPrice <= 0 || currentPrice <= 0 || quantity <= 0) return 0;
  return (currentPrice - watchedPrice) * quantity;
}
```

```ts
const [items, setItems] = useLocalStorage<Insight[]>("aiop:insights", insights);
const [items, setItems] = useLocalStorage<RegretItem[]>("aiop:regret-items", regrets);
```

### 변경 파일 목록

- `src/lib/calculations.ts`
- `src/lib/formatters.ts`
- `src/types/index.ts`
- `src/data/mockData.ts`
- `src/components/insights/BookInsightsView.tsx`
- `src/components/insights/InsightCard.tsx`
- `src/components/insights/AddInsightModal.tsx`
- `src/components/regret/RegretTrackerView.tsx`
- `src/components/regret/RegretCard.tsx`
- `src/components/regret/AddRegretItemModal.tsx`

### 검증 결과

```bash
npx.cmd tsc --noEmit
npm.cmd run build
```

- `npx.cmd tsc --noEmit` 통과
- `npm.cmd run build` 통과
- `http://localhost:3000` 응답 코드 200 확인

### 알려진 한계 / 후속 TODO

- Dashboard는 아직 mock 데이터 기반이며, 이번 범위에서는 통합하지 않음. v0.9에서 처리 예정.
- `tsconfig.tsbuildinfo`는 타입 체크/빌드 실행으로 갱신됨. v1.0 정리 범위에서 처리 예정.
- 브라우저에서 실제 클릭 기반 Add/Delete 시나리오까지는 자동화하지 않았고, 타입/빌드/서버 응답 검증까지만 완료.
