# KPT 회고록 기능 추가 계획

- 작업 일자: 2026-05-12
- 작업 범위: 신규 도메인 추가 (`/retros`)
- 작업자: Claude Code
- 상태: 구현 대기 (사용자 승인 후 진행)

---

## 1. 요구사항 요약

- **최종 목표:** AIOP에 매일 일기처럼 작성하는 KPT 회고록 기능을 추가한다.
- **사용자가 제공한 요구사항:**
  - KPT 회고(Keep / Problem / Try)를 매일 일기처럼 기록하고 싶다.
  - 사이드바 메뉴 라벨은 `K.P.T`.
- **반드시 지켜야 할 조건:**
  - 기존 도메인(Todo, Notes 등)과 동일한 패턴을 따른다.
  - 백엔드 없이 localStorage만 사용한다.
  - 기존 UI는 깨지지 않게 한다.
  - TypeScript 에러 없음.

---

## 2. 입력 구조 결정 (사용자 선택)

**혼합형 (체크 가능한 항목 리스트)** 채택.

- K / P / T 각 섹션은 항목 배열로 관리.
- Keep, Problem 항목은 텍스트만.
- **Try 항목만 체크박스로 완료 여부(`done`) 관리.** 다음날 회고에서 어제 Try의 완료 여부를 확인 가능.

---

## 3. 데이터 모델

```ts
// src/types/index.ts

export type RetroItem = {
  id: string;
  text: string;
  done?: boolean;        // Try 항목만 사용 (체크박스)
};

export type KptRetro = {
  id: string;
  date: string;          // YYYY-MM-DD (하루 1건 원칙)
  keep: RetroItem[];
  problem: RetroItem[];
  try: RetroItem[];
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
};
```

- `ViewKey`에 `"retros"` 추가.
- localStorage 키: `aiop:retros`
- 값 형태: `KptRetro[]` (`date` 내림차순 정렬 유지)

---

## 4. 작업 범위

### 4.1 수정 예상 파일 (6개)

| 파일 | 작업 내용 |
| --- | --- |
| `src/types/index.ts` | `RetroItem`, `KptRetro` 타입 추가, `ViewKey`에 `"retros"` 포함 |
| `src/lib/storageNormalizers.ts` | `normalizeRetros` 함수 추가 (배열/객체/필드 가드) |
| `src/lib/dataPortability.ts` | export/import payload에 `retros` 키 포함 |
| `src/components/layout/navItems.ts` | `viewTitles.retros`, `navItems`에 `K.P.T` 항목 추가 |
| `src/components/retros/RetroView.tsx` | **신규** — 메인 화면 컴포넌트 |
| `src/app/retros/page.tsx` | **신규** — App Router 라우트 |

### 4.2 추가될 기능

- 오늘 날짜 회고 작성 / 자동 로드
- K / P / T 각 섹션마다 항목 추가 (Enter 또는 버튼)
- 항목 삭제
- Try 항목 체크박스 토글
- 과거 회고 목록 (날짜별 카드, 펼침/접힘, 편집/삭제)
- 회고 전체 삭제 (특정 날짜)

### 4.3 수정하지 않을 범위

- 대시보드 위젯 (별도 작업으로 분리)
- QuickAddModal 통합 (별도 작업)
- 어제 미완료 Try 자동 가져오기 (별도 옵션 기능)
- AGENTS.md 갱신 (구현 확정 후 별도 커밋)

---

## 5. 구현 방향

### 5.1 화면 레이아웃

```
┌─────────────────────────────────────────┐
│ K.P.T 회고                              │
│ 매일 짧게 돌아보기                       │
├─────────────────────────────────────────┤
│ 📅 오늘 (2026-05-12)                    │
│                                         │
│ ┌─ Keep ✅ ───────────────────────┐    │
│ │ • 매일 운동 30분 유지     [×]   │    │
│ │ [입력...]              [추가]    │    │
│ └────────────────────────────────┘    │
│                                         │
│ ┌─ Problem ⚠️ ────────────────────┐    │
│ │ • 늦게 잠                 [×]   │    │
│ │ [입력...]              [추가]    │    │
│ └────────────────────────────────┘    │
│                                         │
│ ┌─ Try 🎯 ────────────────────────┐    │
│ │ ☐ 11시 전 취침            [×]   │    │
│ │ ☑ 도시락 준비             [×]   │    │
│ │ [입력...]              [추가]    │    │
│ └────────────────────────────────┘    │
└─────────────────────────────────────────┘

┌─ 과거 회고 ─────────────────────────────┐
│ 2026-05-11 · K 2 / P 1 / T 3 (2 완료)  │
│   ▼ 펼치면 내용 보기 + 편집/삭제         │
│ 2026-05-10 · K 1 / P 2 / T 2 (1 완료)  │
└─────────────────────────────────────────┘
```

### 5.2 컴포넌트 구조

- 단일 컴포넌트 `RetroView.tsx` 로 시작 (TodoView 패턴과 동일).
- 내부 로컬 함수로 K/P/T 섹션 렌더링 (중복 코드 최소화).
- `useLocalStorage<KptRetro[]>("aiop:retros", [])` 로 영속화.

### 5.3 상태 관리 흐름

1. `useLocalStorage`로 `retros` 배열 로드.
2. 오늘 날짜 (`YYYY-MM-DD`) 회고가 없으면 빈 `KptRetro` 자동 생성 (저장은 첫 항목 추가 시).
3. 항목 추가/삭제/체크 시 `setRetros`로 배열 갱신.
4. 빈 회고(K/P/T 전부 비어있음)는 저장하지 않거나, 자동 정리.

### 5.4 ID 생성

```ts
crypto.randomUUID?.() ?? Date.now().toString()
```

기존 `TodoView` 패턴과 동일.

### 5.5 사이드바 아이콘

- `lucide-react`의 `NotebookPen` 또는 `ClipboardList`.
- 기본 선택: **`NotebookPen`** (회고/기록 뉘앙스에 맞음).

### 5.6 라벨

```ts
viewTitles.retros = "K.P.T 회고";
navItems: { key: "retros", label: "K.P.T", icon: NotebookPen, href: "/retros" }
```

### 5.7 대안

#### 방법 A — 단일 컴포넌트 (채택)

- **장점:** 구현 단순, TodoView 패턴 일치, 리뷰 쉬움.
- **단점:** 파일이 길어질 수 있음.

#### 방법 B — 섹션별 분리 (`KeepSection`, `ProblemSection`, `TrySection`)

- **장점:** 재사용성, 가독성.
- **단점:** 첫 구현에 과한 추상화. MVP 단계에 부적합.

---

## 6. 작업 순서

1. `src/types/index.ts` — 타입 추가, `ViewKey` 확장.
2. `src/lib/storageNormalizers.ts` — `normalizeRetros` 추가.
3. `src/components/retros/RetroView.tsx` — 메인 화면 작성.
4. `src/app/retros/page.tsx` — 라우트 생성.
5. `src/components/layout/navItems.ts` — 사이드바 항목 추가.
6. `src/lib/dataPortability.ts` — export/import payload에 추가.
7. `npm run dev` 로 동작 확인.

---

## 7. 예상 위험도

- **낮음:**
  - 타입 추가
  - 라우트 생성
  - 사이드바 메뉴 추가
- **중간:**
  - localStorage 스키마 호환성 (`normalizeRetros` 누락 시 import 시 데이터 손실)
  - 빈 회고 처리 로직 (저장 시점)
- **높음:**
  - 없음 (기존 도메인과 격리된 신규 키)

---

## 8. 확인 방법

### 실행 명령어

```bash
npm run dev
```

### 브라우저 확인 위치

```
http://localhost:3000/retros
```

### 수동 테스트 체크리스트

```
[ ] 사이드바에 K.P.T 메뉴가 보인다.
[ ] /retros 페이지가 정상 렌더링된다.
[ ] 오늘 날짜가 자동 표시된다.
[ ] Keep 항목을 추가/삭제할 수 있다.
[ ] Problem 항목을 추가/삭제할 수 있다.
[ ] Try 항목을 추가/삭제/체크 토글할 수 있다.
[ ] 빈 입력으로 추가 시 막힌다.
[ ] 새로고침 후에도 데이터가 유지된다.
[ ] 과거 회고가 목록에 표시된다.
[ ] 과거 회고 펼침/접힘이 동작한다.
[ ] 과거 회고를 삭제할 수 있다.
[ ] 설정 → 데이터 내보내기에 retros가 포함된다.
[ ] 내보낸 JSON 파일을 다시 가져오면 복원된다.
[ ] TypeScript 에러가 없다.
```

---

## 9. 알려진 한계 / 후속 TODO

- **하루 1건 원칙:** 같은 날짜에 회고가 이미 있으면 새로 만들지 않고 기존 회고에 추가. 이 정책은 추후 변경 가능.
- **시간대:** `YYYY-MM-DD`는 클라이언트 로컬 시간 기준. 자정 직후 작성 시 날짜 경계 이슈 가능 — 후속 작업.
- **편집 기능:** 과거 회고 항목 텍스트 인라인 편집은 v1.1 후속 작업으로 분리.
- **어제 Try 자동 가져오기:** 별도 옵션 기능. 본 작업에 포함하지 않음.
- **대시보드 위젯:** 최근 회고 미리보기 위젯은 별도 작업.
- **QuickAddModal:** 빠른 추가 모달에 "회고" 카테고리 추가는 별도 작업.

---

## 10. 변경 파일 목록 (예정)

```
수정:
- src/types/index.ts
- src/lib/storageNormalizers.ts
- src/lib/dataPortability.ts
- src/components/layout/navItems.ts

신규:
- src/components/retros/RetroView.tsx
- src/app/retros/page.tsx
```

---

## 11. 구현 전 확인 질문

- 본 계획대로 진행해도 되는지?
- 사이드바 아이콘 `NotebookPen`으로 진행해도 되는지? (대안: `ClipboardList`, `Sparkle`, `History`)

사용자가 `진행해` / `구현해` / `그대로 해줘` / `계획대로 진행` 중 하나로 응답하면 구현 시작.
