# KPT 회고록 확장 계획 (v2 — 활용 기능 통합)

- 작업 일자: 2026-05-12
- 작업 범위: 신규 도메인 `/retros` + 활용 기능 4종 1차 통합 구현
- 작업자: Claude Code
- 상태: 구현 대기 (사용자 승인 후 진행)
- 기반 계획서: `.agent-notes/kpt-retro-feature-plan.md`

---

## 0. v1 대비 변경 요약

v1(기본 계획서)에 아래 4개 활용 기능을 **1차에 통합**한다.

1. **Try → Todo 자동 연동**
2. **어제 미완료 Try 자동 가져오기**
3. **연속 작성 Streak**
4. **주간 회고 롤업**

후속 작업으로 남기는 항목(태그, 검색, Insights 연결, 마크다운 export, QuickAddModal 통합, 대시보드 위젯)은 본 계획에 포함하지 않는다.

---

## 1. 요구사항 요약

- **최종 목표:** KPT 회고록을 단순 기록을 넘어, 기존 AIOP 도메인(Todo)과 연계하여 행동으로 이어지는 회고 시스템으로 만든다.
- **반드시 지켜야 할 조건:**
  - 기존 Todo / Notes 등 도메인 동작은 깨지지 않는다.
  - 백엔드 없이 localStorage만 사용.
  - 기존 UI 톤(zinc + emerald 액센트) 유지.
  - TypeScript 에러 없음.

---

## 2. 데이터 모델

### 2.1 타입 정의

```ts
// src/types/index.ts

export type RetroItem = {
  id: string;
  text: string;
  done?: boolean;             // Try 항목만 사용
  linkedTodoId?: string;      // [기능1] Todo 연동 시 TodoItem.id 저장
  carriedFrom?: string;       // [기능2] 이월 원본 RetroItem.id (메타)
};

export type KptRetro = {
  id: string;
  date: string;               // YYYY-MM-DD (하루 1건)
  keep: RetroItem[];
  problem: RetroItem[];
  try: RetroItem[];
  createdAt: string;
  updatedAt: string;
};
```

### 2.2 ViewKey 확장

```ts
export type ViewKey =
  | "dashboard"
  | "wants"
  | "calculator"
  | "regret"
  | "subscriptions"
  | "insights"
  | "notes"
  | "todos"
  | "retros";                 // 신규 (주간 화면도 동일 키 사용)
```

### 2.3 localStorage

- 키: `aiop:retros`
- 값: `KptRetro[]` (`date` 내림차순 유지)

---

## 3. 기능 상세 설계

### 3.1 [기능1] Try → Todo 자동 연동

#### 동작

- Try 항목 입력 영역에 **"Todo로도 추가"** 토글(체크박스).
- 토글 ON 상태로 추가 시:
  1. 새 `RetroItem` 생성.
  2. 동시에 새 `TodoItem` 생성 (`aiop:todos`에 prepend).
  3. `RetroItem.linkedTodoId = todo.id` 저장.
- Try 항목의 체크박스 토글 시:
  - `linkedTodoId`가 있으면 해당 `TodoItem.status`를 `"done"` / `"todo"`로 동기화.
- 페이지 진입 시 일방향 동기화 (Todo → Try):
  - 마운트 시 한 번, `linkedTodoId`가 있는 Try의 `done`을 연결된 Todo `status === "done"` 결과로 맞춤.
- Try 삭제 시 Todo는 유지 (안전 기본값). 사용자가 직접 Todo 화면에서 정리.
- Todo가 삭제된 경우: 다음 진입 시 `linkedTodoId` 해제 (자동 정리).

#### 데이터 흐름

```
[Try 추가 + Todo도 만들기 ON]
  RetroItem { id, text, done: false, linkedTodoId: TODO_ID }
  TodoItem  { id: TODO_ID, title: text, status: "todo", priority: "medium", createdAt: ... }

[Try 체크박스 ON]
  RetroItem.done = true
  → TodoItem.status = "done"

[Todo 화면에서 Todo done 처리]
  TodoItem.status = "done"
  → 다음 RetroView 진입 시 RetroItem.done = true 자동 반영
```

#### 헬퍼 함수 (`src/lib/retros.ts`)

```ts
export function syncTryWithTodos(retros: KptRetro[], todos: TodoItem[]): KptRetro[]
export function createTodoFromTry(text: string): TodoItem
```

---

### 3.2 [기능2] 어제 미완료 Try 자동 가져오기

#### 동작

- 오늘 회고 진입 시 **가장 최근 이전 회고(보통 어제)의 미완료 Try** 검색.
- 미완료 Try가 1개 이상 있으면 상단에 안내 카드 표시:
  ```
  📋 이전 회고에서 못 한 Try 3개
  ☐ 11시 전 취침
  ☐ 영어 단어 10개
  ☐ 산책 20분
  [한 번에 이월]  [각각 선택]
  ```
- "한 번에 이월" 클릭 시:
  - 미완료 Try 전체를 새 ID로 복사하여 오늘 Try 배열에 추가.
  - 각 새 항목에 `carriedFrom = 원본 RetroItem.id` 저장.
  - `linkedTodoId`는 복사하지 않음 (Todo는 그대로 사용).
- 각 항목별 선택 이월 모드도 지원 (체크박스 + 이월 버튼).
- 이월된 항목은 카드에 `↻ 이월` 배지 표시.
- 한 번 이월하거나 닫으면 해당 안내 카드는 다시 표시하지 않음 (오늘 날짜 회고에 `metadata.carryoverDismissed` 같은 플래그 — 단순화하려면 이월된 항목이 있거나 사용자가 닫기 누르면 숨김).

#### 헬퍼 함수

```ts
export function findPreviousRetro(retros: KptRetro[], today: string): KptRetro | null
export function getUnfinishedTryItems(retro: KptRetro | null): RetroItem[]
export function carryOverTryItems(items: RetroItem[]): RetroItem[]
```

---

### 3.3 [기능3] 연속 작성 Streak

#### 동작

- "비어있지 않은 회고" 기준으로 연속 일수 계산.
- "비어있지 않음" 정의: `keep.length + problem.length + try.length > 0`.
- RetroView 상단에 배지:
  ```
  🔥 12일 연속  ·  이번 주 5/7
  ```
- 오늘 회고가 비어있으면 streak는 어제까지 기준으로 계산.
- 끊긴 경우 0 표시.

#### 헬퍼 함수

```ts
export function calculateStreak(retros: KptRetro[], today: string): number
export function getWeekProgress(retros: KptRetro[], today: string): { written: number; total: 7 }
```

#### 계산 로직

1. 비어있지 않은 회고만 필터 → date 내림차순 정렬.
2. 오늘 또는 어제부터 거꾸로 연속된 날짜 카운트.
3. 하루라도 빠지면 중단.

---

### 3.4 [기능4] 주간 회고 롤업

#### 동작

- 신규 라우트: `/retros/weekly`
- RetroView 상단에 **"주간 보기"** 버튼 → `/retros/weekly` 이동.
- 주간 화면 표시 내용:
  - 헤더: 이번 주 범위 (`2026-05-11 (월) ~ 2026-05-17 (일)`) + 이전 주 / 다음 주 네비.
  - 요약 카드:
    - 작성한 날: `5 / 7`
    - 총 Try: `12개` (완료 `7개`, 완료율 `58%`)
    - 자주 등장한 Problem 키워드 Top 3 (단순 텍스트 매칭 기반)
  - 일별 카드 (월~일 순서):
    - 날짜 / 요일 / K·P·T 개수
    - 클릭 시 펼침 → 항목 미리보기 (각 3개까지)
    - "상세 보기" → 해당 날짜 회고로 이동(쿼리 또는 anchor)

#### 주차 기준

- **월요일 시작** (ISO 8601), `2026-05-11`은 월요일.
- 헬퍼 함수로 처리.

#### 키워드 빈도 (단순 버전)

- 항목 `text`를 공백/문장부호로 단순 분리 → 길이 2자 이상 토큰만 카운트.
- 불용어 제외(`이`, `가`, `을`, `를`, `은`, `는`, `의`, `에` 등 — 짧은 한글 조사 위주 기본 목록).
- 영문은 lowercase 후 카운트.
- 정확도는 낮아도 OK. 후속 개선 가능.

#### 헬퍼 함수

```ts
export function getWeekRange(date: Date): { start: Date; end: Date; days: string[] }
export function buildWeeklyRollup(retros: KptRetro[], weekStart: Date): WeeklyRollup
export function extractProblemKeywords(retros: KptRetro[], topN: number): Array<{ word: string; count: number }>
```

```ts
export type WeeklyRollup = {
  weekStart: string;            // YYYY-MM-DD (월요일)
  weekEnd: string;              // YYYY-MM-DD (일요일)
  daysWritten: number;
  totalTry: number;
  doneTry: number;
  completionRate: number;       // 0~1
  problemKeywords: Array<{ word: string; count: number }>;
  daily: Array<{
    date: string;
    weekday: string;
    retro: KptRetro | null;     // 작성 안 한 날은 null
  }>;
};
```

---

## 4. 작업 범위

### 4.1 수정 파일 (5개)

| 파일 | 작업 내용 |
| --- | --- |
| `src/types/index.ts` | `RetroItem`, `KptRetro` 타입 추가; `ViewKey`에 `"retros"` |
| `src/lib/storageNormalizers.ts` | `normalizeRetros` 추가 (linkedTodoId, carriedFrom 가드) |
| `src/lib/dataPortability.ts` | export/import payload에 `retros` 포함 |
| `src/components/layout/navItems.ts` | `K.P.T` 메뉴 항목 추가 (`NotebookPen` 아이콘) |
| `src/hooks/useLocalStorage.ts` | (변경 없음 — 기존 훅 사용) |

### 4.2 신규 파일 (5개)

| 파일 | 작업 내용 |
| --- | --- |
| `src/lib/retros.ts` | streak, 주간, 이월, 동기화 헬퍼 함수 모음 |
| `src/components/retros/RetroView.tsx` | 메인 화면 (오늘 작성 + 과거 목록 + Streak + 이월 카드) |
| `src/components/retros/WeeklyRollupView.tsx` | 주간 롤업 화면 |
| `src/app/retros/page.tsx` | 메인 라우트 |
| `src/app/retros/weekly/page.tsx` | 주간 라우트 |

---

## 5. 화면 레이아웃

### 5.1 메인 (`/retros`)

```
┌──────────────────────────────────────────────────┐
│ K.P.T 회고            [주간 보기 →]              │
│ 🔥 12일 연속  ·  이번 주 5/7                     │
├──────────────────────────────────────────────────┤
│ 📋 이전 회고에서 못 한 Try 2개          [닫기]   │
│   ☐ 11시 전 취침                                │
│   ☐ 영어 단어 10개                              │
│   [한 번에 이월]                                 │
├──────────────────────────────────────────────────┤
│ 📅 오늘 (2026-05-12)                             │
│                                                  │
│ ┌─ Keep ✅ ─────────────────────────────┐       │
│ │ • 매일 운동 30분 유지           [×]   │       │
│ │ [입력...]                    [추가]   │       │
│ └─────────────────────────────────────┘       │
│                                                  │
│ ┌─ Problem ⚠️ ──────────────────────────┐       │
│ │ • 늦게 잠                       [×]   │       │
│ │ [입력...]                    [추가]   │       │
│ └─────────────────────────────────────┘       │
│                                                  │
│ ┌─ Try 🎯 ──────────────────────────────┐       │
│ │ ☐ 11시 전 취침   ↻ 이월         [×]   │       │
│ │ ☑ 도시락 준비                   [×]   │       │
│ │ [입력...]   ☑ Todo로도 추가  [추가]   │       │
│ └─────────────────────────────────────┘       │
├──────────────────────────────────────────────────┤
│ 과거 회고                                        │
│ ▶ 2026-05-11 · K 2 / P 1 / T 3 (2 완료)         │
│ ▶ 2026-05-10 · K 1 / P 2 / T 2 (1 완료)         │
└──────────────────────────────────────────────────┘
```

### 5.2 주간 (`/retros/weekly`)

```
┌──────────────────────────────────────────────────┐
│ ← 이전 주    2026-05-11 ~ 2026-05-17    다음 주 →│
│                                                  │
│ ┌─ 요약 ─────────────────────────────────┐      │
│ │ 작성한 날     5 / 7                    │      │
│ │ 총 Try        12개                     │      │
│ │ 완료율        7 / 12  (58%)            │      │
│ │ Problem TOP 3                          │      │
│ │   1. 수면 (3회)                        │      │
│ │   2. 점심 (2회)                        │      │
│ │   3. 운동 (2회)                        │      │
│ └──────────────────────────────────────┘      │
│                                                  │
│ 월 05-11 · K 2 / P 1 / T 3 (2)   [상세 →]       │
│ 화 05-12 · K 1 / P 2 / T 2 (1)   [상세 →]       │
│ 수 05-13 · 작성 안 함                            │
│ 목 05-14 · K 1 / P 0 / T 1 (0)   [상세 →]       │
│ ...                                              │
└──────────────────────────────────────────────────┘
```

---

## 6. 작업 순서

1. **타입 정의** — `src/types/index.ts` (RetroItem, KptRetro, ViewKey)
2. **헬퍼 모듈** — `src/lib/retros.ts` (streak, weekRange, rollup, carryover, todo sync)
3. **Normalizer** — `src/lib/storageNormalizers.ts`에 `normalizeRetros`
4. **RetroView** — 메인 화면 (기본 CRUD 먼저 → Streak → 이월 카드 → Todo 연동 토글 순)
5. **메인 라우트** — `src/app/retros/page.tsx`
6. **사이드바 메뉴** — `src/components/layout/navItems.ts`
7. **주간 화면** — `WeeklyRollupView.tsx` + `src/app/retros/weekly/page.tsx`
8. **Export/Import** — `src/lib/dataPortability.ts`에 `retros` 포함
9. **`npm run dev`로 통합 동작 확인**

각 단계는 TypeScript 에러 없이 단계별로 빌드 가능하게 처리.

---

## 7. 예상 위험도

### 낮음
- 타입 추가
- 라우트 생성
- 사이드바 메뉴 추가
- Normalizer

### 중간
- **Streak 계산 경계 조건** — 오늘 미작성 시 어제까지 인정할지, 자정 경계 처리
- **주간 범위 계산** — 월요일 기준 ISO week 처리, 타임존 KST 가정
- **키워드 토큰화** — 한글 처리 단순함, 정확도 낮을 수 있음 (수용 가능 한계)

### 높음
- **Todo 양방향 동기화** — 마운트 시점 / 토글 시점 두 곳에서 처리해야 함
  - 해결: 마운트 시 1회 동기화 + 사용자 액션 시 동기화. 실시간 양방향 X.
  - Try.done 토글 → Todo 즉시 갱신
  - Todo 화면에서의 변경 → RetroView 진입 시 반영
- **데이터 손실 가능성** — linkedTodoId가 가리키는 Todo가 삭제된 경우 정리 필요
  - 해결: 진입 시 linkedTodoId 유효성 검사, 깨진 참조는 해제

---

## 8. 확인 방법

### 실행

```bash
npm run dev
```

### 수동 테스트 체크리스트

#### 기본
```
[ ] 사이드바에 K.P.T 메뉴가 보인다.
[ ] /retros 페이지가 정상 렌더링된다.
[ ] K/P/T 항목 추가/삭제가 동작한다.
[ ] Try 항목 체크 토글이 동작한다.
[ ] 새로고침 후에도 데이터가 유지된다.
```

#### 기능1: Try → Todo
```
[ ] Try 입력 시 "Todo로도 추가" 토글이 보인다.
[ ] 토글 ON 후 Try 추가 → /todos 페이지에 새 Todo가 보인다.
[ ] Try 체크 → Todo가 done 상태가 된다 (Todo 화면에서 확인).
[ ] Todo를 done 처리한 뒤 /retros 진입 → 해당 Try가 done 상태로 보인다.
[ ] linkedTodoId가 가리키는 Todo가 삭제된 경우, 다음 진입 시 깨지지 않는다.
```

#### 기능2: 이월
```
[ ] 어제 회고에 미완료 Try를 만들고 오늘 진입 → 이월 안내 카드가 보인다.
[ ] "한 번에 이월" 클릭 → 오늘 Try에 항목들이 복사된다.
[ ] 이월된 항목에 ↻ 배지가 보인다.
[ ] 닫기 클릭 → 안내 카드가 사라진다.
[ ] 어제 회고가 비어있거나 미완료 Try가 0개면 안내 카드가 보이지 않는다.
```

#### 기능3: Streak
```
[ ] 오늘 작성하면 streak가 1 이상으로 표시된다.
[ ] 어제까지 매일 작성했으면 streak가 누적된다.
[ ] 하루 빠진 다음날 진입 → streak가 0 또는 1로 리셋된다.
[ ] 이번 주 작성한 날 수가 정확히 표시된다.
```

#### 기능4: 주간 롤업
```
[ ] "주간 보기" 버튼 → /retros/weekly 이동.
[ ] 이번 주 범위(월~일)가 정확히 표시된다.
[ ] 이전 주 / 다음 주 네비가 동작한다.
[ ] 작성한 날 수, 총 Try, 완료율이 정확하다.
[ ] Problem 키워드 Top 3가 표시된다 (없으면 빈 상태 표시).
[ ] 일별 카드의 "상세 →" 클릭 시 해당 날짜로 이동한다.
```

#### export/import
```
[ ] 데이터 내보내기에 retros가 포함된다.
[ ] 내보낸 파일을 가져오면 retros가 복원된다.
```

---

## 9. 알려진 한계 / 후속 TODO

- **Todo 양방향 동기화 한계:** 실시간 양방향이 아니라 마운트 + 액션 시점 동기화. 동시에 여러 탭을 열어두면 어긋날 수 있음.
- **시간대:** 모든 날짜는 클라이언트 로컬 기준 `YYYY-MM-DD`. 여행 시 어긋날 수 있음.
- **키워드 정확도:** 단순 토큰화. 형태소 분석 미적용. 후속 개선 가능.
- **편집:** 항목 텍스트 인라인 편집은 본 작업에 포함 안 함 (삭제 → 재추가로 처리).
- **대시보드 위젯:** 별도 작업.
- **QuickAddModal 통합:** 별도 작업.
- **Insights / Wants 연결:** 별도 작업.
- **태그 / 검색:** 별도 작업.
- **AGENTS.md 갱신:** 구현 확정 후 별도 커밋.

---

## 10. 변경 파일 목록 (예정)

```
수정:
- src/types/index.ts
- src/lib/storageNormalizers.ts
- src/lib/dataPortability.ts
- src/components/layout/navItems.ts

신규:
- src/lib/retros.ts
- src/components/retros/RetroView.tsx
- src/components/retros/WeeklyRollupView.tsx
- src/app/retros/page.tsx
- src/app/retros/weekly/page.tsx
```

---

## 11. 구현 전 확인 질문

1. **Try → Todo 동기화 방향**
   - A. Try.done ↔ Todo.status 양방향 (마운트 + 액션 시점)  ← **제안 기본값**
   - B. Try → Todo 단방향만 (Todo가 done 되어도 Try는 안 바뀜)

2. **이월 카드 표시 조건**
   - A. 미완료 Try가 1개라도 있고 오늘 회고가 비어있을 때만 노출  ← **제안 기본값**
   - B. 미완료 Try만 있으면 항상 노출 (닫기 누르기 전까지)

3. **주간 시작 요일**
   - A. 월요일 (ISO 8601)  ← **제안 기본값**
   - B. 일요일 (미국식)

`진행해` / `구현해` / `그대로 해줘` / `계획대로 진행` 중 하나로 응답하면 구현 시작.
질문 1~3에 대한 다른 의견이 있으면 함께 알려줘.
