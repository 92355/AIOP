# 작업 계획 — AIOP 빠른 추가 (Header Quick Add)

작성일: 2026-05-11
범위: Header의 "빠른 추가" 버튼 동작 구현 (현재 onClick 없는 placeholder 상태)
선행 작업: v0.1 ~ v0.9 완료 (5개 도메인 localStorage CRUD + Dashboard 통합)

## 1. 요구사항 요약

- 최종 목표: Header 우측 상단의 "빠른 추가" 버튼을 실제 동작하는 글로벌 추가 진입점으로 만든다.
- 사용자가 제공한 요구사항:
  - 클릭 시 카테고리 선택 모달 표시
  - 카테고리 선택 → 해당 카테고리에 대응하는 입력 모달 표시
  - 입력 및 저장 → 모달 닫기 + 데이터 반영
- 결정된 조건 (사용자 확정, 2026-05-11):
  - 카테고리 5종: **Wants / Subscriptions / Insights / Regret / Notes**
  - Note는 별도 Add Modal이 없으므로 **Note 전용 미니 모달 신설**
  - 저장 후 동작: **현재 화면에 머무름 + refreshKey로 강제 재렌더링**하여 Dashboard 등도 즉시 반영
- 반드시 지켜야 할 조건:
  - 백엔드 / 인증 / 외부 API / AI API 없음 (v1.0 범위 유지)
  - localStorage 키 그대로 사용 (`aiop:wants`, `aiop:subscriptions`, `aiop:insights`, `aiop:notes`, `aiop:regret-items`)
  - 디자인 톤 (zinc/emerald, rounded-2xl, shadow-soft) 보존
  - 기존 4개 Add Modal (Want/Subscription/Insight/Regret) 시그니처 변경 금지
  - NotesInboxView 내 inline 입력 폼 그대로 유지

## 2. 현재 상황 판단

확인된 정보:
- `src/components/layout/Header.tsx:46-49`의 "빠른 추가" 버튼은 `onClick` 없이 시각적으로만 존재.
- 4개 Add Modal (`AddWantModal`, `AddSubscriptionModal`, `AddInsightModal`, `AddRegretItemModal`) 모두 props 시그니처 통일: `{ isOpen, onClose, onAdd }`. `onAdd(item)`으로 부모에 새 항목 전달.
- `NotesInboxView` 안의 노트 추가 로직은 `useState` 기반 inline form. 별도 모달 없음 → 빠른 추가 동선용 미니 모달 신설 필요.
- `useLocalStorage` 훅(`src/hooks/useLocalStorage.ts`)은 `storage` 이벤트 listener 없음. 같은 탭에서 외부가 localStorage를 갱신해도 mount된 컴포넌트는 자동 감지 못함. → 화면이 새로 mount되거나 강제 재렌더링이 필요.
- `page.tsx`는 `selectedView` state 1개만 가짐. 빠른 추가 모달 상태와 refreshKey를 추가해야 함.
- `AppShell`은 page와 Header 사이 forward 레이어. props 1개 추가만 필요.

부족한 정보:
- 없음. 핵심 결정 사항은 사용자 확정.

확실하지 않은 부분:
- 카테고리 선택 모달 UI 톤 → 기존 디자인(zinc-900 카드, emerald 강조)에 맞춘 5개 카드 그리드로 진행. 다른 안 없으면 그대로.
- AddNoteModal 태그 옵션 → NotesInboxView의 `quickTags = ["구매목표", "인사이트", "구독", "나중에"]` 동일하게 가져감.

## 3. 작업 범위

### 수정 예상 파일 (3개) + 신설 (2개)

| 파일 | 변경 종류 |
|---|---|
| `src/components/layout/Header.tsx` | `onOpenQuickAdd: () => void` prop 추가, 빠른 추가 버튼 `onClick` 연결 |
| `src/components/layout/AppShell.tsx` | `onOpenQuickAdd` prop 받아 Header로 forward |
| `src/app/page.tsx` | `quickAddOpen`, `activeCategory`, `refreshKey` state. QuickAddModal과 5개 Add Modal 렌더. 각 View에 `key={refreshKey}` 부여 |
| `src/components/quick-add/QuickAddModal.tsx` | **신설** — 5개 카테고리 카드 그리드, `onSelectCategory(category)` 콜백 |
| `src/components/notes/AddNoteModal.tsx` | **신설** — Note용 미니 모달 (textarea + 태그 토글 + 저장), `{ isOpen, onClose, onAdd }` props |

### 추가될 기능

- 글로벌 헤더에서 어떤 화면에 있든 5개 도메인 어디로든 1~2 클릭으로 항목 추가
- 저장 즉시 현재 화면(Dashboard 포함)의 모든 위젯 갱신
- Note 빠른 입력은 NotesInboxView로 이동하지 않고 모달 내에서 완료

### 수정하지 않을 범위

- 기존 4개 Add Modal 내부 로직, props 시그니처
- `useLocalStorage` 훅 (storage 이벤트 listener 추가하지 않음)
- 각 View 내부 localStorage 처리 (`WantsView`, `SubscriptionsView` 등)
- mockData, types, calculations, formatters
- Dashboard 5개 컴포넌트 (v0.9 결과 그대로 사용)

## 4. 구현 방향

선택한 방식:
- **분리 모달**: QuickAddModal에서 카테고리 선택 → 닫고 → 해당 도메인 Add Modal 자동 표시
- **page.tsx 레벨에 모달 상태 + refreshKey 보유**: AppShell/Header는 단순 forward만
- **localStorage 직접 prepend**: 빠른 추가 핸들러가 `window.localStorage.setItem` 직접 호출. refreshKey 증가 → 각 View가 key 변경으로 remount되며 useLocalStorage hydrate로 자연스럽게 동기화

선택 이유:
- 기존 4개 Add Modal의 `{ isOpen, onClose, onAdd }` 시그니처를 그대로 재사용해 변경 표면 최소
- QuickAddModal 안에 도메인별 폼을 다 넣으면 거대한 단일 파일이 되어 유지보수 비용 증가
- refreshKey는 page.tsx 한 곳에서만 관리 → 다른 컴포넌트 인터페이스 무변경
- storage 이벤트 listener 도입은 훅에 영향이 크므로 v1.1+ 검토로 미룸

대안:
- **방법 A: 분리 모달 + page.tsx refreshKey (선택)**
  - 장점: 코드 재사용 극대, 인터페이스 변경 최소, 모든 View 일괄 갱신
  - 단점: 각 View가 remount되며 내부 input focus / 작성 중 텍스트 손실. 빠른 추가 직후라 실사용 영향 작음
- **방법 B: QuickAddModal 안에 도메인별 폼을 모두 포함하는 단일 모달**
  - 장점: 사용자 동선 1회 클릭 절약
  - 단점: 파일 1000줄 가까이 비대, 기존 Add Modal과 중복 코드, 두 곳에서 동기화 부담
- **방법 C: storage 이벤트 listener를 useLocalStorage에 추가 후 직접 dispatch**
  - 장점: refreshKey 불필요, 입력 focus 보존
  - 단점: 훅 인터페이스 변경, 모든 사용처 영향, v1.1+ 작업과 중복

## 5. 작업 순서

1. **AddNoteModal 신설** (`src/components/notes/AddNoteModal.tsx`)
   - props: `{ isOpen, onClose, onAdd: (note: Note) => void }`
   - 내부 state: `body`, `selectedTags`, `errorMessage`
   - 빈 body 차단, 태그 토글, 저장 시 `Note` 객체 생성해 `onAdd` 호출 후 form 초기화 + onClose
   - quickTags는 NotesInboxView와 동일 (`["구매목표", "인사이트", "구독", "나중에"]`)
   - id: `crypto.randomUUID?.() ?? Date.now().toString()`, `createdAt`: ISO date 또는 NotesInboxView와 동일 포맷
   - verify: tsc 통과, NotesInboxView 동작에 영향 없음

2. **QuickAddModal 신설** (`src/components/quick-add/QuickAddModal.tsx`)
   - props: `{ isOpen, onClose, onSelectCategory: (category: QuickAddCategory) => void }`
   - `QuickAddCategory = "want" | "subscription" | "insight" | "regret" | "note"`
   - UI: 5개 카드 그리드 (sm:grid-cols-2, lg:grid-cols-3 등), 각 카드 lucide 아이콘 + 라벨 + 짧은 설명
   - 카드 클릭 시 `onSelectCategory(cat)` 호출 (모달 닫기는 부모 책임)
   - 우상단 X 버튼, 배경 클릭 닫기, `isOpen=false`면 null 반환
   - verify: tsc 통과, 디자인 톤 일치

3. **page.tsx에 state와 핸들러 추가**
   - `const [quickAddOpen, setQuickAddOpen] = useState(false)`
   - `const [activeCategory, setActiveCategory] = useState<QuickAddCategory | null>(null)`
   - `const [refreshKey, setRefreshKey] = useState(0)`
   - 5개 핸들러: `handleAddWant`, `handleAddSubscription`, `handleAddInsight`, `handleAddRegret`, `handleAddNote`
     - 각 핸들러: 현재 localStorage 읽기 → 배열 가드 → `[newItem, ...prev]` prepend → `setItem` write → `setRefreshKey(k => k + 1)` → `setActiveCategory(null)`
   - QuickAddModal + 5개 Add Modal 렌더
   - 각 View에 `key={refreshKey}` 부여 (Dashboard 위젯도 동일하게 적용되도록 DashboardView에도 부여)
   - verify: tsc 통과

4. **AppShell.tsx에 onOpenQuickAdd prop 추가**
   - 인터페이스 1줄 추가 + Header에 forward
   - verify: tsc 통과, 기존 동작 변경 없음

5. **Header.tsx 버튼 연결**
   - `onOpenQuickAdd: () => void` prop 추가
   - 빠른 추가 버튼에 `onClick={onOpenQuickAdd}` 부여
   - verify: tsc 통과

6. **최종 검증**
   - `npx tsc --noEmit`
   - `npm run build`
   - `npm run dev` 시나리오 점검 (아래 §7)

## 6. 예상 위험도

- 낮음:
  - AddNoteModal 신설 (NotesInboxView의 inline form 패턴 재구성)
  - QuickAddModal 신설 (정적 카드 그리드)
  - Header / AppShell prop 추가 (1줄씩)
- 중간:
  - `refreshKey` 변경 시 모든 View remount → 각 View 내부에서 작성 중인 임시 state(예: WantsView가 자체 Add Modal을 열고 텍스트를 입력 중) 손실 가능. 단, 빠른 추가는 별도 동선이라 동시 입력 가능성 낮음
  - 각 핸들러가 localStorage에 직접 prepend write할 때, 현재 mount된 View의 useLocalStorage가 같은 키에 다시 write하지 않도록 unmount 순서 보장 필요. key 변경 시 React가 unmount → mount 순서로 처리하므로 일반적으로 안전
- 높음: 없음

## 7. 확인 방법

실행 명령어 (Git Bash):
```bash
npx tsc --noEmit
npm run build
npm run dev
```

브라우저 확인 (http://localhost:3000):
- Dashboard 화면에서 빠른 추가 → Want 카테고리 → 항목 추가 → SummaryCards "Wants" +1, WantPreview 상단 반영, AssetSnapshot도 갱신
- Wants 화면에서 빠른 추가 → Subscription 카테고리 → 항목 추가 → 모달 닫힘, Wants 화면 유지. Subscriptions 화면 이동 시 새 항목 존재
- 빠른 추가 → Insight → Dashboard로 돌아오면 RecentInsights 반영
- 빠른 추가 → Regret → Regret 화면 이동 시 반영
- 빠른 추가 → Note → Notes 화면 이동 시 최상단 새 메모 + Dashboard SummaryCards Notes Inbox +1
- 빠른 추가 모달에서 X 버튼 / 배경 클릭 / Esc(가능하면)로 닫기
- 카테고리 선택 후 도메인 모달에서 취소 → 모달만 닫히고 데이터 변경 없음
- 새로고침 후에도 추가된 모든 항목 유지
- 잘못된 localStorage 값일 때도 mock data로 fallback (기존 동작 보존)

## 8. 구현 전 확인 질문

- 카테고리 선택 모달 UI: 기존 디자인 톤 그대로 5개 카드 그리드로 진행. 다른 요구 없으면 이대로.
- AddNoteModal 태그: NotesInboxView의 `quickTags`와 동일. 다른 요구 없으면 이대로.

위 두 가지 외 추가 요구가 없다면 `진행해` / `구현해` / `그대로 해줘` / `계획대로 진행` 중 하나로 응답 시 §5 순서대로 구현 시작.

## 부록 — 후속 작업

- v1.0 (UI 품질 정리) 작업 시 QuickAddModal과 AddNoteModal의 빈 상태 / 에러 메시지 톤도 함께 정리
- v1.1+ 검토 항목 후보:
  - `useLocalStorage`에 `storage` 이벤트 listener 추가 → refreshKey 제거 가능
  - Esc 키로 모달 닫기 공통 훅
  - 모달 진입 시 첫 input autofocus
