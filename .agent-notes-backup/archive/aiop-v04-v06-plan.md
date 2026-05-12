# 작업 계획 — AIOP v0.4 + v0.5 + v0.6 (localStorage 도입 + Subscriptions/Notes CRUD)

작성일: 2026-05-08
범위: AGENTS.md Step 7, 8, 9, 10
대상 디렉토리: `C:/dev/aioP/src`
선행 계획서: `aiop-v02-v03-plan.md` (완료)

## 1. 요구사항 요약

- AGENTS.md 로드맵의 **v0.4 (Wants localStorage)**, **v0.5 (Subscriptions 로컬 CRUD + localStorage)**, **v0.6 (Notes 로컬 CRUD + localStorage)** 진행
- 백엔드, Auth, DB, 외부 API, AI API 추가하지 않음
- 타입은 현재 코드 구조 유지, 새 기능에서 필요한 필드만 옵셔널로 추가
- localStorage 키 prefix: `aiop:`
- SSR/hydration 안전: 첫 렌더는 initial mock, mount 후 localStorage로 hydrate
- Insights/Regret/Dashboard는 이번 묶음에서 손대지 않음

## 2. 현재 상황 판단

확인된 정보:
- **Wants**: `useState<WantItem[]>(wants)`로 동작 중, Add/Delete 핸들러 완료. localStorage 미사용.
- **Subscriptions**: `subscriptions.map`만 표시. 모듈 스코프에서 `total`/`keep`/`review` reduce/filter — state 도입 시 컴포넌트 내부로 이동 필수. CRUD 없음.
- **Notes**: textarea uncontrolled, Send 버튼 onClick 없음. `notes.map`으로 mock만 표시. CRUD 없음.
- **labels.ts** 존재 — 새 라벨은 여기에 추가
- **SummaryCards**: 모듈 스코프에서 mock data를 reduce → localStorage 데이터 반영 안 됨 (v0.9에서 처리 예정)
- **Note 타입**: `title`, `body` 둘 다 필수 — AGENTS.md는 `content` 하나만 명시

부족한 정보:
- Notes 입력 폼에 title 입력란을 별도로 둘지 → **title 옵셔널화하고 폼은 body+tags만 받음**으로 결정 (현재 mock의 title은 유지)
- Subscription status 변경 UI 표현 방식 → **카드에 작은 select 또는 토글 버튼 그룹**으로 결정

확실하지 않은 부분:
- 대량의 localStorage 손상 시 fallback이 silent로 되어도 되는지 → **silent fallback + console.warn**으로 처리
- key prefix `aiop:` 일관성 — Wants `aiop:wants`, Subs `aiop:subscriptions`, Notes `aiop:notes`

## 3. 작업 범위

### 수정 예상 파일 (9개)

| 파일 | 변경 종류 |
|---|---|
| `src/hooks/useLocalStorage.ts` | 신규 생성 |
| `src/components/wants/WantsView.tsx` | useState → useLocalStorage |
| `src/components/subscriptions/SubscriptionsView.tsx` | useLocalStorage + 모듈 스코프 reduce 제거 + Add/Delete/status 핸들러 |
| `src/components/subscriptions/SubscriptionCard.tsx` | onDelete, onStatusChange prop 추가 |
| `src/components/subscriptions/AddSubscriptionModal.tsx` | 신규 생성 |
| `src/components/notes/NotesInboxView.tsx` | controlled textarea + Add/Delete + 정렬 |
| `src/types/index.ts` | Note에 옵셔널 필드 추가 (title?, status?) |
| `src/lib/labels.ts` | Note status 라벨 추가 (사용 시) |
| `src/data/mockData.ts` | 손대지 않음 (현재 mock 유지) — 단 Note title 필수 → 옵셔널 변경에 따른 호환만 확인 |

### 추가될 기능

- `useLocalStorage<T>(key, initialValue)` 훅
- Wants 데이터 새로고침 후 유지
- Subscriptions Add / Delete / status 변경 (keep ↔ review ↔ cancel)
- Subscriptions 새로고침 후 유지
- Notes Add (textarea + tags) / Delete / 최근순 정렬
- Notes 새로고침 후 유지

### 수정하지 않을 범위

- Insights, Regret 화면
- Dashboard SummaryCards / WantPreview / AssetSnapshot / SubscriptionSummary / RecentInsights (모듈 스코프 reduce는 v0.9에서 처리)
- 백엔드, 외부 API
- 디자인 톤 (zinc/emerald, rounded-2xl)
- `crypto.randomUUID` 패턴 (기존 AddWantModal과 동일)
- Note `body` → `content` 이름 변경 (현재 코드 유지)

## 4. 구현 방향

선택한 방식:
- 공통 훅 1개로 3개 화면 모두 적용
- 첫 렌더는 initialValue (SSR 안전), mount 후 useEffect로 localStorage 읽어 hydrate
- JSON.parse 실패 시 initialValue로 fallback + console.warn
- 손상된 localStorage가 있어도 앱 자체는 깨지지 않음

선택 이유:
- AGENTS.md Step 7 명세
- 이전 계획서에서 정한 "현재 타입 유지 + 부족한 필드만 옵셔널 추가" 전략 일관 적용
- 모듈 스코프 reduce는 안티패턴이라 어차피 컴포넌트 내부로 옮겨야 함

대안:
- localStorage hydration 없이 첫 렌더부터 client-only — 기각 (Next.js SSR 충돌)
- Subscriptions status를 별도 modal로 변경 — 기각 (카드 안에서 빠르게 토글이 더 자연스러움)
- Note title 입력란 추가 — 기각 (textarea만 받는 게 quick capture에 부합)

## 5. 작업 순서

1. **`useLocalStorage` 훅 신규**
   - 파일: `src/hooks/useLocalStorage.ts`
   - 시그니처: `useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>]`
   - 동작:
     - useState 초기값은 initialValue (SSR-safe, hydration mismatch 방지)
     - useEffect로 mount 시 localStorage 읽기 → 성공 시 setState, 실패 시 console.warn + initialValue 유지
     - useEffect로 value 변경 시 localStorage.setItem (window 가드)
   - verify: `npx tsc --noEmit` 0 에러

2. **Wants localStorage 연결**
   - `src/components/wants/WantsView.tsx`
   - `useState<WantItem[]>(wants)` → `useLocalStorage<WantItem[]>("aiop:wants", wants)`
   - handleAdd, handleDelete 그대로 동작
   - verify: 추가 → 새로고침 → 유지 확인. localStorage 비우면 mock 5개 복원.

3. **Subscriptions 컴포넌트 내부화**
   - `src/components/subscriptions/SubscriptionsView.tsx`
   - 모듈 스코프 `total`/`keep`/`review` 제거
   - `useLocalStorage<Subscription[]>("aiop:subscriptions", subscriptions)`
   - 컴포넌트 내부에서 useMemo로 total/keepCount/reviewCount/cancelCount 계산
   - `useState<boolean>` for isAddOpen
   - handleAdd, handleDelete, handleStatusChange 핸들러
   - verify: 첫 렌더에서 mock 6개, 새로고침 후 유지

4. **AddSubscriptionModal 신규**
   - `src/components/subscriptions/AddSubscriptionModal.tsx`
   - 입력: service, monthlyPrice, category(input), usage(select: daily/weekly/monthly/rare), valueScore(0~100), status(기본 keep)
   - 검증: service 비어 있으면 차단, monthlyPrice <= 0이면 차단
   - 디자인: AddWantModal과 동일한 톤 (fixed inset-0 backdrop, zinc/emerald)
   - id 생성: `crypto.randomUUID?.() ?? Date.now().toString()`
   - 저장 후 폼 리셋 + 모달 닫기
   - verify: 필수값 누락 차단, 추가 시 카드 prepend

5. **SubscriptionCard 상호작용 추가**
   - `src/components/subscriptions/SubscriptionCard.tsx`
   - prop 추가: `onDelete?: (id: string) => void`, `onStatusChange?: (id: string, status: SubscriptionStatus) => void`
   - 우측 상단에 작은 status 토글 (3-way segmented 또는 select). 디자인 톤 유지.
   - 또는 카드 우측 끝에 작은 X 아이콘 (삭제) + status select
   - verify: status 변경 즉시 카드 색상/라벨 변경, 삭제 시 카드 제거

6. **Note 타입 옵셔널 보강**
   - `src/types/index.ts`
   - `Note.title?: string` (필수 → 옵셔널)
   - `Note.status?: "inbox" | "processed" | "archived"` (옵셔널 추가, 이번엔 표시만 안 함)
   - mockData의 기존 `title` 값들은 그대로 동작 (옵셔널이라 호환)
   - verify: tsc 에러 없음

7. **NotesInboxView controlled + CRUD**
   - `src/components/notes/NotesInboxView.tsx`
   - `useLocalStorage<Note[]>("aiop:notes", notes)`로 전환
   - textarea controlled: `useState<string>("")`로 body 관리
   - tags 입력은 quick tag chip 클릭으로 toggle (현재 4개 chip 그대로 활용) — `useState<string[]>`
   - Send 버튼 onClick → handleAdd
   - 검증: body trim() 빈 값이면 저장 차단
   - id 생성: `crypto.randomUUID?.() ?? Date.now().toString()`
   - createdAt: `new Date()` 기반 한글 표시 (예: `오늘 14:32`) — 단순화하려면 ISO string + display utility로 분리
   - 카드 우측 상단에 삭제 아이콘
   - 정렬: 최근 추가 항목이 상단 (`prepend`로 충분)
   - title이 비어 있는 새 노트는 카드에서 body 첫 줄을 강조 텍스트로 표시
   - verify: 추가 → 새로고침 → 유지. body 빈 입력 차단. 삭제 동작.

8. **labels.ts 보강 (선택)**
   - Note status가 화면에 노출되면 라벨 추가 (이번 묶음에서는 표시 안 하므로 보류 가능)
   - verify: tsc 에러 없음

## 6. 성공 기준

- [ ] `npx tsc --noEmit` 0 에러
- [ ] `npm run build` 통과
- [ ] `useLocalStorage` 훅이 SSR 환경에서 window 접근 에러 발생 안 함
- [ ] Wants: 추가/삭제 후 새로고침 → 유지
- [ ] Wants: localStorage 비우면 mock 5개로 복원
- [ ] Subscriptions: Add 모달 → 새 카드 prepend, 새로고침 후 유지
- [ ] Subscriptions: status 토글 즉시 카드 색/라벨 변경, 새로고침 후 유지
- [ ] Subscriptions: 카드 삭제 즉시 반영, 새로고침 후 유지
- [ ] Subscriptions 상단 요약 (총/유지/해지 후보) 카드가 state 변화에 따라 갱신
- [ ] Notes: textarea body + tag chip → 기록 → 새 노트가 카드 리스트 상단에 표시
- [ ] Notes: 빈 body 차단
- [ ] Notes: 카드 삭제 동작
- [ ] Notes: 새로고침 후 유지
- [ ] localStorage 데이터를 의도적으로 망가뜨려도 앱이 깨지지 않고 mock으로 fallback
- [ ] 디자인 톤 (zinc/emerald, rounded-2xl, border, shadow-soft) 보존

## 7. 예상 위험도

- 낮음:
  - useLocalStorage 훅 신규 (간단 패턴)
  - Wants 한 줄 교체 (useState → useLocalStorage)
  - types Note 옵셔널 추가
- 중간:
  - SubscriptionsView 모듈 스코프 reduce 제거 + 내부 state 도입 (요약 카드 4개 모두 영향)
  - AddSubscriptionModal 신규 (AddWantModal 패턴 재사용)
  - NotesInboxView 전면 controlled 전환 + tags 토글 UX
- 높음: 없음

## 8. 확인 방법

실행 명령어 (Git Bash):
```bash
npx tsc --noEmit
npm run build
npm run dev
```

브라우저 확인 (http://localhost:3000):

### Wants
- 구매 목표 추가 → 새로고침 → 유지
- 카드 삭제 → 새로고침 → 삭제 상태 유지
- DevTools Application → Local Storage → `aiop:wants` 확인
- DevTools에서 `aiop:wants`를 `"invalid json"`으로 덮어쓰고 새로고침 → mock 5개로 복원

### Subscriptions
- Add 버튼 → 모달에서 입력 → 카드 prepend
- status 토글 → 카드 색/라벨 변경 + 상단 요약 갱신
- 카드 삭제 → 즉시 반영
- 새로고침 후 모든 변경 유지

### Notes
- textarea에 입력 + tag chip 클릭 → 기록 → 카드 상단에 추가
- 빈 textarea 저장 → 차단
- 카드 삭제 → 즉시 반영
- 새로고침 후 유지

### 알려진 한계 (v0.9에서 처리 예정)
- Dashboard SummaryCards / WantPreview / AssetSnapshot / SubscriptionSummary / RecentInsights는 여전히 모듈 스코프에서 mock을 reduce
- → Wants/Subs/Notes를 사용자 데이터로 변경해도 Dashboard 요약은 mock 그대로
- 사용자에게 보여줄 때 "Dashboard 통합은 v0.9에서 진행"이라고 안내

## 9. 구현 전 확인 질문

- 없음. 진행 시 위 순서 1→8 단계대로 작업, 각 단계 verify 통과 후 다음으로 이동.

## 부록 — 다음 묶음

- v0.7: Step 11 (Insights 로컬 CRUD + localStorage) — 별도 계획서
- v0.8: Step 12 (Regret Tracker 로컬 계산 + `calculateRegretPercent`/`calculateProfitAmount` 추가) — 별도 계획서
- v0.9: Step 13 (Dashboard 데이터 통합) — 모듈 스코프 reduce 전체 정리, 별도 계획서
- v1.0: Step 14, 15 (UI 정리 + README) — 마무리

## 구현 결과

작성일: 2026-05-08

### 진행 과정

1. 계획서와 현재 코드 상태 확인
   - `.agent-notes/aiop-v04-v06-plan.md`를 읽고 작업 범위를 확인함
   - 이전 작업의 한글화/localStorage 이전 변경분이 남아 있는 상태를 확인함
   - Dashboard, Insights, Regret 화면은 이번 계획서 범위 밖이라 수정하지 않음

2. `useLocalStorage` 훅 추가
   - `src/hooks/useLocalStorage.ts`를 생성함
   - 첫 렌더는 `initialValue`를 사용하도록 구현함
   - mount 이후 `localStorage`를 읽어 hydrate하도록 구현함
   - JSON parse 실패 또는 저장 실패 시 `console.warn`을 남기고 앱은 깨지지 않도록 처리함
   - 쓰기 동작은 hydrate 이후에만 수행하도록 처리함

3. Wants localStorage 연결
   - `WantsView`의 기존 `useState<WantItem[]>(wants)`를 `useLocalStorage<WantItem[]>("aiop:wants", wants)`로 교체함
   - 기존 Add/Delete 핸들러는 유지함
   - 추가/삭제 결과가 새로고침 후에도 유지되도록 변경함

4. Subscriptions 로컬 CRUD 구현
   - `SubscriptionsView`를 client component로 전환함
   - 모듈 스코프의 `total`/`keep`/`review` 계산을 제거하고 컴포넌트 내부 `useMemo`로 이동함
   - `useLocalStorage<Subscription[]>("aiop:subscriptions", subscriptions)`를 적용함
   - Add/Delete/status 변경 핸들러를 추가함
   - 상단 요약 카드가 state 변경에 따라 갱신되도록 변경함
   - `AddSubscriptionModal`을 새로 생성함
   - `SubscriptionCard`에 삭제 버튼과 3단계 status 토글을 추가함

5. Notes 로컬 CRUD 구현
   - `NotesInboxView`를 controlled textarea 구조로 변경함
   - `useLocalStorage<Note[]>("aiop:notes", notes)`를 적용함
   - 빠른 태그 chip 토글을 추가함
   - 빈 body 저장 차단을 추가함
   - 새 노트는 리스트 상단에 prepend되도록 구현함
   - 노트 삭제 버튼을 추가함
   - 새 노트의 `createdAt`은 `오늘 HH:mm` 형식으로 생성함
   - title이 없는 새 노트는 body 첫 줄을 카드 제목처럼 표시하도록 처리함

6. 타입/라벨 보강
   - `Note.title`을 옵셔널로 변경함
   - `NoteStatus` 타입과 `Note.status?`를 추가함
   - `labels.ts`에 Note status 라벨 함수를 추가함

### 변경 파일

- `src/hooks/useLocalStorage.ts`
- `src/components/wants/WantsView.tsx`
- `src/components/subscriptions/SubscriptionsView.tsx`
- `src/components/subscriptions/SubscriptionCard.tsx`
- `src/components/subscriptions/AddSubscriptionModal.tsx`
- `src/components/notes/NotesInboxView.tsx`
- `src/types/index.ts`
- `src/lib/labels.ts`

### 구현 내용

- localStorage 공통 훅 추가
- Wants localStorage 저장/복원 연결
- Subscriptions Add/Delete/status 변경 구현
- Subscriptions localStorage 저장/복원 연결
- Notes Add/Delete/tag toggle 구현
- Notes localStorage 저장/복원 연결
- Note 타입 옵셔널 필드 보강

### 확인 결과

- `npx tsc --noEmit` 통과
- `npm run build` 통과

### 남은 TODO

- 브라우저에서 localStorage 유지 동작은 추가 수동 확인 필요
- Dashboard 요약은 계획서대로 아직 mock 기준이며 v0.9에서 통합 예정
- `npm run lint`는 기존 프로젝트에 ESLint 설정 파일이 없어 Next.js 설정 프롬프트가 표시되는 상태라 완료하지 않음
- `tsconfig.tsbuildinfo`가 생성되어 있음. 삭제 여부는 사용자 확인 필요
