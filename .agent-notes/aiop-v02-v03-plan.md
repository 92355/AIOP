# 작업 계획 — AIOP v0.2 마무리 + v0.3 (Wants 로컬 CRUD)

작성일: 2026-05-08
범위: AGENTS.md Step 1, 2, 3(부분), 4, 5, 6
대상 디렉토리: `C:/dev/aioP/src`

## 1. 요구사항 요약

- AGENTS.md 로드맵의 **v0.2 (계산 로직 실제화)** 마무리와 **v0.3 (Wants 로컬 CRUD)** 진행
- 백엔드, Auth, DB, 외부 API, AI API 추가하지 않음
- 타입은 현재 코드 구조 유지, 새 기능에서 필요한 필드만 옵셔널로 추가
- localStorage는 이번 묶음에서 사용하지 않음 (v0.4 별도 처리)

## 2. 현재 상황 판단

확인된 정보:
- `src/lib/calculations.ts` 부분 구현 (`calculateRequiredCapital`, `calculateAssetPlan`, `formatKRW`, `formatCompactKRW`)
- `formatKRW`/`formatCompactKRW`가 calculations.ts에 섞여 있음
- `AssetCalculatorView`는 useState+useMemo로 거의 동작 중 (단순 2단계 결정)
- `WantsView`는 mock data만 표시, Add 버튼 onClick 없음
- `WantCard`에 삭제 버튼 없음
- mockData의 wants에는 `score`, `requiredCapital`, `targetDate`만 있고 `expectedYield`, `targetMonths`, `priority` 등 없음

부족한 정보:
- AddWantModal의 카테고리 입력 방식 (select vs free text) — select로 가정
- mockData 기존 5개 항목에 새 필드의 기본값 — 합리적 추정값으로 채움

확실하지 않은 부분:
- Purchase Decision 4단계 분기 도입 시 디자인 톤 — 기존 단일 emerald 박스에 텍스트만 교체로 처리

## 3. 작업 범위

### 수정 예상 파일 (8개)

| 파일 | 변경 종류 |
|---|---|
| `src/lib/formatters.ts` | 신규 생성 |
| `src/lib/calculations.ts` | format 함수 이동 + 단독 계산 함수 추가 |
| `src/types/index.ts` | WantItem에 옵셔널 필드 추가 |
| `src/data/mockData.ts` | wants 항목 새 필드 채움 |
| `src/components/calculator/AssetCalculatorView.tsx` | Purchase Decision 4단계 분기 |
| `src/components/wants/WantsView.tsx` | useState 전환 + Add/Delete 핸들러 |
| `src/components/wants/WantCard.tsx` | 삭제 버튼 추가 |
| `src/components/wants/AddWantModal.tsx` | 신규 생성 |

### 추가될 기능

- formatters.ts 분리
- 단독 `calculateMonthsToBuy`, `calculateMonthlyCashflowNeeded` 함수
- Asset Calculator Purchase Decision 4단계 분기 (Plan carefully / Available soon / Set as goal / Hold / Need more input)
- Wants Add Modal
- Wants 삭제

### 수정하지 않을 범위

- Subscriptions, Notes, Insights, Regret 화면
- Dashboard 데이터 통합
- localStorage
- 백엔드, 외부 API
- 디자인 톤 (zinc/emerald 색, rounded-2xl)
- `calculateRegretPercent`, `calculateProfitAmount` (v0.8에서 추가 예정 — 이번에는 보류)

## 4. 구현 방향

선택한 방식: AGENTS.md 명세를 참고하되 현재 코드 타입 이름은 유지. 새 필드는 옵셔널로 추가하고 기존 mock 데이터에 합리적 기본값을 부여한다.

선택 이유:
- 광범위 리팩토링 회피
- 한 번에 하나씩 변경
- 디자인 톤 보존
- 사용자 결정 (타입 전략 = 현재 유지 + 부족한 필드만 추가)

대안:
- AGENTS.md 그대로 따라가기 → 기각됨 (작업량 큼)
- formatters.ts 만들지 않음 → 기각 (재사용 분리 어색)

## 5. 작업 순서

1. **formatters.ts 분리 + calculations.ts 보강**
   - 새 파일 `src/lib/formatters.ts` 생성: `formatKRW`, `formatCompactKRW`, `formatPercent`, `formatNumber`, `formatDate`
   - `calculations.ts`에서 `formatKRW`/`formatCompactKRW` 제거 (formatters로 이동)
   - `calculations.ts`에 `calculateMonthsToBuy`, `calculateMonthlyCashflowNeeded` 단독 함수 추가
   - 기존 `calculateAssetPlan`은 유지 (안에서 새 함수들 호출)
   - 호출하는 모든 import 경로 일괄 수정 (`AssetCalculatorView`, `SummaryCards`, 기타 dashboard 컴포넌트)
   - verify: `npx tsc --noEmit` 0 에러, `npm run dev` 모든 화면 렌더

2. **types/index.ts WantItem 보강**
   - 옵셔널 추가: `priority?: "low" | "medium" | "high"`, `targetMonths?: number`, `expectedYield?: number`, `monthlyCashflowNeeded?: number`, `currency?: "KRW" | "USD"`
   - 기존 필드 (`score`, `requiredCapital`, `targetDate`) 그대로 유지
   - verify: tsc 에러 없음

3. **mockData.ts wants 새 필드 채움**
   - 5개 항목에 `priority`, `targetMonths`, `expectedYield`, `currency: "KRW"` 부여
   - `monthlyCashflowNeeded`는 mock에 미리 계산해 두거나 미부여 (런타임 계산)
   - verify: WantsView, Dashboard 카드 그대로 렌더

4. **AssetCalculatorView Purchase Decision 4단계**
   ```ts
   if (monthlyInvestment <= 0 || price <= 0) → "Need more input"
   else if (requiredCapital >= 100_000_000) → "Plan carefully"
   else if (monthsToBuy <= 3) → "Available soon"
   else if (monthsToBuy <= 12) → "Set as goal"
   else → "Hold"
   ```
   - 0/음수 입력 시 화면이 깨지지 않도록 입력 onChange에서도 Number 변환 안전화
   - emerald 강조 박스 유지, 텍스트만 교체
   - verify: 입력값 다양하게 변경, 각 분기 텍스트 확인

5. **WantsView 상태화**
   - `const [items, setItems] = useState<WantItem[]>(wants)`
   - `const [isAddOpen, setIsAddOpen] = useState(false)`
   - Add Want 버튼 onClick → setIsAddOpen(true)
   - onAdd: 새 항목 prepend
   - onDelete(id): id로 필터
   - verify: 추가/삭제 즉시 반영, 새로고침 시 mock으로 복원

6. **AddWantModal 신규 컴포넌트**
   - 입력: name, price, currency(기본 KRW), category(select), reason, priority(기본 medium), status(기본 thinking), targetMonths(기본 12), expectedYield(기본 4)
   - 검증: name 비어 있으면 막음, price <= 0이면 막음
   - id: `crypto.randomUUID?.() ?? Date.now().toString()`
   - 저장 시 `requiredCapital = calculateRequiredCapital(price, expectedYield)`, `monthlyCashflowNeeded = calculateMonthlyCashflowNeeded(price, targetMonths)` 포함
   - 저장 후 폼 리셋 + 모달 닫기
   - 디자인: 기존 zinc/emerald + rounded-2xl 톤 유지, fixed inset-0 backdrop
   - verify: 필수값 누락 시 저장 차단, 정상 입력 시 카드 prepend

7. **WantCard 삭제 버튼**
   - 우측 상단에 작은 X 또는 Trash 아이콘 (lucide-react)
   - prop `onDelete?: (id: string) => void`
   - click 시 onDelete(item.id)
   - verify: 단일 카드 삭제, 다른 카드 영향 없음

## 6. 성공 기준

- [ ] `npx tsc --noEmit` 0 에러
- [ ] `npm run dev` 모든 화면 렌더 깨지지 않음
- [ ] `npm run lint` 통과 (warning 무관)
- [ ] Asset Calculator: 4단계 분기 텍스트가 입력에 따라 변경됨
- [ ] Asset Calculator: 0/음수 입력 시에도 화면 정상
- [ ] Wants: Add Want 버튼 → 모달 열림
- [ ] Wants: 빈 name 또는 price 0 저장 차단
- [ ] Wants: 정상 입력 → 카드 리스트 상단 prepend
- [ ] Wants: 삭제 버튼 → 해당 카드만 사라짐
- [ ] 기존 디자인 톤 (zinc/emerald, rounded-2xl, border, shadow-soft) 보존

## 7. 예상 위험도

- 낮음:
  - formatters 분리 (호출부 import 경로만 정리)
  - calculations 함수 추가
  - types 옵셔널 필드 추가
  - mockData 보강
  - AssetCalculatorView Purchase Decision 텍스트 교체
- 중간:
  - WantsView 상태화 (현재 무상태 → useState 전환)
  - AddWantModal 신규 (모달 패턴 첫 도입, 디자인 톤 매칭 필요)
- 높음: 없음

## 8. 확인 방법

실행 명령어 (Git Bash):
```bash
npx tsc --noEmit
npm run lint
npm run dev
```

브라우저 확인 위치 (http://localhost:3000):
- Sidebar → **Asset Calculator**:
  - 가격 1억 이상 입력 → "Plan carefully"
  - 가격 정상 + 월 투자액 0 → "Need more input"
  - 월 투자액 충분 → "Available soon" / "Set as goal" / "Hold" 분기
- Sidebar → **Wants**:
  - Add Want 클릭 → 모달 표시
  - name 비우고 저장 → 차단
  - 정상 입력 후 저장 → 새 카드가 상단에 표시
  - 카드 삭제 아이콘 클릭 → 해당 카드만 사라짐
  - 새로고침 → mock 5개 + 추가분 사라지고 mock 5개로 복원

테스트/빌드:
- 단위 테스트 미도입 → 수동 체크리스트로 검증

## 9. 구현 전 확인 질문

- 없음. 진행 시 위 순서 1→7 단계대로 작업, 각 단계 verify 통과 후 다음으로 이동.

## 부록 — 다음 묶음 (이 계획서에 포함 안 됨)

- v0.4: Step 7 (`useLocalStorage` 훅) + Step 8 (Wants localStorage 연결) — 별도 계획서
- v0.5~0.8: Subscriptions/Notes/Insights/Regret 로컬 CRUD — 각각 별도 계획서
- v0.9: Dashboard 데이터 통합 — 별도 계획서
- v1.0: UI 정리 + README 업데이트 — 마지막 단계

## 구현 결과

작성일: 2026-05-08

### 진행 과정

1. 계획서와 현재 프로젝트 구조 확인
   - `.agent-notes/aiop-v02-v03-plan.md`를 읽고 작업 범위를 확인함
   - `package.json`, `src/` 구조, 기존 수정 상태를 확인함
   - 계획서와 현재 코드 구조의 큰 충돌은 없었음

2. 계산/포맷터 분리
   - `src/lib/formatters.ts`를 새로 생성함
   - `formatKRW`, `formatCompactKRW`, `formatPercent`, `formatNumber`, `formatDate`를 포맷터 파일로 분리함
   - `src/lib/calculations.ts`에는 계산 함수만 남김
   - `calculateMonthsToBuy`, `calculateMonthlyCashflowNeeded`를 추가함
   - 기존 `calculateAssetPlan`은 새 계산 함수를 호출하도록 유지함

3. Want 타입과 mock 데이터 보강
   - `WantPriority`, `Currency` 타입을 추가함
   - `WantItem`에 `priority`, `targetMonths`, `expectedYield`, `monthlyCashflowNeeded`, `currency` 옵셔널 필드를 추가함
   - 기존 5개 wants mock 데이터에 `priority`, `targetMonths`, `expectedYield`, `currency`를 채움

4. Asset Calculator 구매 판단 분기 적용
   - 기존 2단계 판단 문구를 4단계 분기로 교체함
   - 입력값 부족 시 `Need more input`
   - 필요 자산 1억 이상 시 `Plan carefully`
   - 3개월 이내 구매 가능 시 `Available soon`
   - 12개월 이내 구매 가능 시 `Set as goal`
   - 그 외 `Hold`
   - 숫자 입력 변환 시 `NaN`이 들어가지 않도록 안전 변환 함수를 추가함

5. Wants 로컬 CRUD 구현
   - `WantsView`를 `useState` 기반으로 전환함
   - Add Want 버튼 클릭 시 모달이 열리도록 연결함
   - 새 want 저장 시 리스트 상단에 prepend되도록 구현함
   - 삭제 버튼 클릭 시 해당 카드만 제거되도록 구현함
   - localStorage는 계획 범위 밖이라 추가하지 않음

6. Add Want 모달 추가
   - `src/components/wants/AddWantModal.tsx`를 생성함
   - 입력 필드: name, price, currency, category, reason, priority, status, targetMonths, expectedYield
   - name 빈 값, price 0 이하 저장 차단을 구현함
   - 저장 시 `requiredCapital`, `monthlyCashflowNeeded`, `targetDate`, `score`를 생성함

7. 포맷터 import 경로 정리
   - 기존 `@/lib/calculations`에서 포맷터를 가져오던 컴포넌트들을 `@/lib/formatters`로 변경함

### 변경 파일

- `src/lib/formatters.ts`
- `src/lib/calculations.ts`
- `src/types/index.ts`
- `src/data/mockData.ts`
- `src/components/calculator/AssetCalculatorView.tsx`
- `src/components/wants/WantsView.tsx`
- `src/components/wants/WantCard.tsx`
- `src/components/wants/AddWantModal.tsx`
- `src/components/dashboard/SummaryCards.tsx`
- `src/components/dashboard/AssetSnapshot.tsx`
- `src/components/dashboard/WantPreview.tsx`
- `src/components/dashboard/SubscriptionSummary.tsx`
- `src/components/regret/RegretTrackerView.tsx`
- `src/components/subscriptions/SubscriptionCard.tsx`
- `src/components/subscriptions/SubscriptionsView.tsx`

### 구현 내용

- 포맷터 유틸 분리
- 계산 함수 보강
- Wants Add/Delete 로컬 상태 처리
- Add Want 모달 추가
- WantCard 삭제 버튼 추가
- Asset Calculator 구매 판단 분기 추가
- 기존 포맷터 import 경로 정리

### 확인 결과

- `npx tsc --noEmit` 통과
- `npm run build` 통과
- `npm run dev -- --port 3001` 실행 확인
- `http://localhost:3001` HTTP 200 확인

### 남은 TODO

- `npm run lint`는 ESLint 설정 파일이 없어 Next.js 설정 프롬프트가 표시되어 완료하지 못함
- 수동 브라우저 UI 체크는 개발 서버 `http://localhost:3001`에서 추가 확인 필요
- `tsconfig.tsbuildinfo`가 생성되어 있음. 삭제 여부는 사용자 확인 필요

## 추가 구현 결과 — 화면 한글화

작성일: 2026-05-08

### 진행 과정

1. 영어 문구 위치 확인
   - `src/` 하위 컴포넌트에서 화면에 보이는 영어 텍스트를 검색함
   - 내비게이션, 헤더, 대시보드 카드, 계산기, Wants 모달, 구독 카드, 인사이트 카드, 노트 화면에 영어 문구가 남아 있음을 확인함

2. 화면 표시용 라벨 헬퍼 추가
   - 내부 enum/type 값은 유지함
   - 화면에 표시할 한글 라벨만 `src/lib/labels.ts`에서 변환하도록 추가함
   - 대상 라벨:
     - Want 카테고리
     - Want 상태
     - Want 우선순위
     - 구독 상태
     - 구독 사용 빈도
     - 구독 카테고리
     - 인사이트 타입

3. 레이아웃/공통 UI 한글화
   - 사이드바 메뉴명을 한글화함
   - 헤더 제목, 검색 placeholder, 알림 title, 빠른 추가 버튼을 한글화함
   - 메타 description을 `개인 운영 페이지`로 변경함

4. 화면별 문구 한글화
   - Asset Calculator의 제목, 입력 라벨, 결과 라벨, 구매 판단 문구를 한글화함
   - Dashboard의 카드 제목과 보조 문구를 한글화함
   - Wants의 Add 버튼, 필터, 카드 상태/카테고리, 삭제 aria-label을 한글화함
   - AddWantModal의 제목, 필드 라벨, 검증 에러, 버튼 문구를 한글화함
   - SubscriptionCard의 상태/사용 빈도/카테고리 표시를 한글화함
   - InsightCard와 RecentInsights의 인사이트 타입 표시를 한글화함
   - NotesInboxView의 제목, 버튼, 태그, 설명 문구를 한글화함

5. mock 데이터 표시명 정리
   - 일부 Want 이름을 한글화함
   - 인사이트 title, tag, relatedGoal 일부를 한글화함
   - 노트 tag와 createdAt 표시 문구를 한글화함

### 변경 파일

- `src/lib/labels.ts`
- `src/app/layout.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/dashboard/AssetSnapshot.tsx`
- `src/components/dashboard/RecentInsights.tsx`
- `src/components/dashboard/SubscriptionSummary.tsx`
- `src/components/dashboard/SummaryCards.tsx`
- `src/components/dashboard/WantPreview.tsx`
- `src/components/calculator/AssetCalculatorView.tsx`
- `src/components/wants/WantsView.tsx`
- `src/components/wants/WantCard.tsx`
- `src/components/wants/AddWantModal.tsx`
- `src/components/subscriptions/SubscriptionCard.tsx`
- `src/components/insights/InsightCard.tsx`
- `src/components/notes/NotesInboxView.tsx`
- `src/data/mockData.ts`

### 구현 내용

- 화면 표시용 한글 라벨 헬퍼 추가
- 주요 UI 텍스트 한글화
- 상태/카테고리/우선순위/사용 빈도 표시 한글화
- mock 데이터 중 화면에 보이는 영어 항목 일부 한글화

### 확인 결과

- `npx tsc --noEmit` 통과
- `npm run build` 통과

### 남은 TODO

- `localhost:3001` 기존 개발 서버는 Next dev 번들러 매니페스트 오류로 500을 반환함
- 프로덕션 빌드는 정상 통과했으므로 코드 컴파일 문제는 확인되지 않음
- 브라우저에서 실제 UI 문구와 줄바꿈은 개발 서버 재시작 후 추가 확인 필요
