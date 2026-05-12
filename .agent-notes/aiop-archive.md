# AIOP Archive

> 목적: 완료된 계획과 과거 참고 기록을 한 곳에 보관한다.
> Codex는 일반 작업 시 이 문서를 읽지 않아도 된다.
> 과거 맥락이 필요할 때만 확인한다.

---

## 0. 완료된 Plan

### 2026-05-12 — 금액 +버튼 / 컴팩트뷰 모달 / Header 검색창 (A+B+C 묶음)

- 목표: 세 가지를 한 plan으로 묶어 처리.
  - **A. 금액 +버튼 변경** — `MoneyInputField`를 단위 전환(|원/천/만/억|)에서 누적 가산 방식으로 교체.
  - **B. 컴팩트뷰 모달 레이아웃 수정** — PC 화면에서 컴팩트 토글 시 입력 모달이 PC 전체로 펼쳐지는 현상 해결.
  - **C. Header 검색창 컴팩트뷰 노출** — 컴팩트뷰에서도 검색 가능하게 노출.
- 결정:
  - A2/A3: KRW `+1만/+5만/+10만/+100만`, USD `+10/+100/+1k/+10k`
  - A4: 기존 단위 버튼(`unit`/`isUnitManual`/`getAutoUnit` 등) 완전 제거
  - A8: `onChange(value + multiplier)` 누적 가산
  - A9: `value=0`일 때 입력창에 `0` 그대로 표시
  - B3: 분기점 Tailwind `sm`(640px). sm 미만 풀스크린, sm 이상 일반 모달 크기
  - B4: className 패턴 — `h-[100dvh] max-w-full rounded-none p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-{xl|2xl} sm:rounded-2xl sm:p-6`
  - C3: 컴팩트뷰 검색창을 헤더 아래 별도 한 줄로 배치 (헤더 자체는 깔끔하게 유지)
  - C4/C5: 컴팩트뷰 폭 100%, placeholder `"검색..."`로 축약
- 구현 핵심:
  - `MoneyInputField.tsx`: `KRW_INCREMENTS` / `USD_INCREMENTS` 상수 + `incrementsByCurrency` 매핑. currency에 따라 +버튼 배열 렌더.
  - 8개 모달 (`AddWant/Subscription/Insight/Note/Todo/Regret/Retro` + `QuickAddModal`)의 wrapper className에 sm: prefix 추가.
  - `Header.tsx` 검색창 visibility 조건 수정 + 컴팩트뷰 별도 행 배치.
- 영향 받지 않음 (props 유지): `AddWantModal`, `AddSubscriptionModal`, `AddRegretItemModal`, `AssetCalculatorView`는 `MoneyInputField` 인터페이스 그대로 사용.
- 검증: `tsc --noEmit`, `npm run lint`, `npm run build` 통과. 수동 QA 체크리스트 전부 OK.
- 부수 변경: `next.config.ts`, `UpdateNoticeModal.tsx`, `WantsView.tsx` 일부 변경 (working tree에 함께 존재).
- 커밋: 사용자 직접 수행.

### 2026-05-12 — 회고 인라인 편집 + 입력칸 확장 + 삭제 확인 (v1.4 후보)

- 목표: K.P.T 회고 항목을 카드 안에서 직접 편집하도록 만들고, 회고 입력칸을 긴 글 작성 가능한 textarea로 확장한다. 추가로 모든 도메인의 삭제 동작 앞에 확인 다이얼로그를 둔다.
- 범위: `RetroView`, `AddRetroModal`, `retros.ts`, `Header`, 7개 도메인(`wants`, `subscriptions`, `insights`, `notes`, `regret`, `todos`, `retros`)의 삭제 동작 + 신규 `src/lib/confirmDelete.ts`.
- 결정:
  - D1 편집 진입: `Pencil` 버튼만 사용 (더블클릭 / 텍스트 직접 클릭 X)
  - D2 Try → Todo 단방향 동기화 (`updateLinkedTodoTitle`)
  - D3 추가 입력 / 인라인 편집 모두 `textarea` 기반
  - D4 `text.trim()` 빈 값 저장 거부 → 원본 유지
  - D5 컴팩트뷰 키보드 가림 보정은 이번 작업 범위 외
- 구현 핵심:
  - `RetroView`: `editingItemId` / `editingText` / `editingErrorMessage` 상태로 한 번에 한 항목만 편집. `Escape` 취소, `Cmd|Ctrl+Enter` 저장.
  - Try 삭제 시 연결 Todo 동반 삭제 (`linkedTodoId` 기반).
  - `syncTryWithTodos`: 연결 Todo가 사라지면 `linkedTodoId`만 해제 → Todo→Try 비파괴 정책 유지.
  - 회고 표시 텍스트에 `whitespace-pre-wrap` 적용해 textarea 줄바꿈 보존.
  - `AddRetroModal`: `<input>` → `<textarea rows={5}>` + `Cmd|Ctrl+Enter` 제출.
  - `Header`: 컴팩트뷰 상단 AIOP 로고를 `Link href="/"`로 감싸 대시보드 이동.
  - `confirmDelete(targetLabel)`: 공용 `window.confirm` 래퍼. 7개 도메인 + 회고 전체/개별 삭제 전부 통과.
- 검증: `tsc --noEmit`, `npm run lint`, `npm run build` 모두 통과. 수동 QA 체크리스트 (T1-T10) 전부 OK.
- 커밋: 사용자 직접 수행.

### 2026-05-12 — README 정합성 회복 (v1.4 후보 1번)

- 목표: `README.md`를 현재 코드와 일치시킴 (KPT 회고 도메인, QuickAdd retro 통합, 11개 localStorage 키, 프로젝트 구조 트리, 로드맵).
- 범위: README 1개 파일만. 다른 파일 / 소스 코드 손대지 않음.
- 결과:
  - 라우트 표기 9개 / 10라우트로 통일
  - `### K.P.T 회고 (Retros)` 절 신설
  - QuickAdd 5개 → 7개 카테고리, `handleAddedRetro` upsert 동작 명시
  - `aiop:retros` localStorage 행 추가 + normalizer / dataPortability 안내
  - 프로젝트 구조 트리에 inputs / retros / SearchContext / dataPortability / storageNormalizers / retros.ts / app/retros 반영
  - "앞으로 구현될 기능" 절을 v1.1~v1.2 / v1.3 / v1.x 보조 3개에서 `v1.4 후보` 단일 절로 통합
  - 로드맵 v1.1~v1.2 / v1.3 완료 표시, v1.4 후보 행 추가
  - 하단 참고 링크에서 `aiop-next-steps.md` 제거 → `AGENTS.md` + `aiop-status.md` + `aiop-plan.md`
- diff: README.md +60 / -47
- 커밋: 사용자 직접 수행 (메시지 형식 자유)

---

## 1. 이전 문서 통합 기준

아래 문서들은 활성 문서에서 제외하고 archive 성격으로 본다.

```txt
aiop-money-unit-status.md
aiop-status-2026-05-12.md
aiop-todo.md
aiop-v11-drag-drop-layout.md
aiop-v20-backend-plan.md
aiop-v20-decisions.md
aiop-v20-next-steps.md
aiop-v20-route-split-plan.md
aiop-v20-route-split-progress.md
```

현재 활성 문서는 아래 4개다.

```txt
AGENTS.md
.agent-notes/aiop-status.md
.agent-notes/aiop-plan.md
.agent-notes/aiop-archive.md
```

---

## 2. Frontend MVP 기록

완료된 흐름:

```txt
v0.1 ~ v0.8
- Dashboard, Wants, Calculator, Regret, Subscriptions, Insights, Notes 로컬 CRUD
- localStorage 영속화

v0.9
- Dashboard가 localStorage 데이터를 읽어 요약 카드/위젯 갱신

v1.0
- UI 품질 정리
- QuickAddModal
- 라이트/다크 토글
- 컴팩트뷰
- Todo 화면

v1.1 ~ v1.2
- Dashboard 드래그앤드롭
- 위젯/카드 visibility
- SummaryCards reorder
- draft layout 패턴

v1.3
- 데이터 export / import
- localStorage schema guard
```

---

## 3. App Router 라우트 분리 기록

완료된 작업:

- 단일 `src/app/page.tsx` + `ViewKey` 스위칭 구조 제거
- App Router 라우트 구조로 분리
- `AppShell`을 `src/app/layout.tsx`로 이동
- Sidebar / BottomTabBar / SummaryCards를 `Link` 기반 이동으로 변경
- QuickAdd 모달 wiring을 `AppShell`로 이동
- `?view=`, `popstate`, `hasHydratedView`, `refreshKey` 기반 구조 제거
- `useLocalStorage`에 same-tab event 대응 추가

라우트:

```txt
/
 /wants
 /calculator
 /regret
 /subscriptions
 /insights
 /notes
 /todos
 /retros
 /retros/weekly
```

수동 QA 후보:

```txt
[ ] Sidebar 클릭 시 URL 변경 + 화면 전환
[ ] BottomTabBar 클릭 시 URL 변경 + 화면 전환
[ ] SummaryCard 클릭 시 해당 라우트 이동
[ ] Dashboard 편집 모드에서 SummaryCard 클릭이 라우팅되지 않음
[ ] QuickAdd 저장 후 해당 라우트 이동 + 항목 표시
[ ] 뒤로가기 / 앞으로가기 정상
[ ] 새로고침 후 현재 라우트 유지
[ ] 데이터 export / import 정상
```

---

## 4. Dashboard 드래그앤드롭 기록

결정 사항:

| 항목 | 결정 |
|---|---|
| 적용 범위 | Dashboard만 |
| 외부 위젯 배치 | `react-grid-layout` |
| SummaryCards 내부 순서 | `@dnd-kit/sortable` |
| 편집 토글 | Sidebar 좌측 하단 설정 |
| Hero | 이동 가능한 위젯으로 편입 |

저장 key:

```txt
aiop:layout
```

검증 후보:

```txt
[ ] 위젯 이동/리사이즈 유지
[ ] SummaryCards 순서 변경 유지
[ ] 외부 grid drag와 내부 sortable 충돌 없음
[ ] 모바일 1열 + 드래그 비활성
[ ] layout 손상 시 default fallback
```

---

## 5. 금액 입력 기록

완료된 작업:

- 공통 `MoneyInputField` 도입
- KRW 입력 시 `원 / 천 / 만 / 억` 단위 버튼 제공
- 내부 값은 원 단위 숫자로 유지
- 입력창 아래 원화 미리보기 제공

적용 위치:

```txt
구매 목표 추가
구독 추가
후회 기록 추가
자산 구매 계산기
```

남은 개선 후보:

```txt
[ ] 단위 버튼을 입력 내부에 더 밀착
[ ] 선택 단위 / 실제 저장 값 / 미리보기의 시각적 구분 강화
[ ] 일반 숫자 입력도 공통화
[ ] KRW / USD 입력 UX 분리
```

---

## 6. v2.0 백엔드 기록

결정 사항:

| ID | 항목 | 결정 |
|---|---|---|
| D1 | 데이터 흐름 | RSC + Server Actions |
| D2 | 네이밍 | snake_case DB + camelCase TS + mapper |
| D3 | 통화 | Frankfurter 기반 환율 API + KRW 기준 환산 |
| D4 | 태그 | `text[]` + GIN index |
| D5 | 삭제 | Hard delete |
| D6 | URL | App Router 라우트 분리 |

기본 진행 순서:

```txt
1. Supabase 프로젝트 생성 + 환경변수
2. Postgres 스키마 + RLS
3. Google OAuth
4. @supabase/ssr 세팅
5. DB ↔ TS mappers
6. Wants 도메인 시범 마이그레이션
7. 나머지 도메인 확장
8. exchange_rates + Cron
9. localStorage export JSON import
10. 서버 기반 export
11. dashboard_layouts / user_settings 동기화
12. localStorage 사용 코드 제거
13. v2.1+ AI Route Handler
```

---

## 7. 오래된 프롬프트 처리

과거 Claude/Codex 프롬프트는 활성 문서에 두지 않는다.

필요할 때만 아래 패턴을 사용한다.

### Claude 계획 작성

```txt
AGENTS.md와 .agent-notes/aiop-status.md를 읽고,
이번 작업 계획을 .agent-notes/aiop-plan.md 하나로 작성해줘.
새 계획 파일은 만들지 마.
```

### Codex 실행

```txt
AGENTS.md, .agent-notes/aiop-status.md, .agent-notes/aiop-plan.md를 읽고
aiop-plan.md의 Tasks 순서대로 구현해줘.
계획에 없는 대규모 리팩터링은 하지 마.
```
