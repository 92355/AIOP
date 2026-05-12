# AIOP Active Plan

> 목적: 현재 실행할 단일 계획 파일.
> Claude는 이 파일을 갱신하고, Codex는 이 파일을 읽고 실행한다.
> 새 active plan 파일을 만들지 않는다.

---

## 1. Current Goal

회고 항목(Keep / Problem / Try) 텍스트를 카드 안에서 직접 편집할 수 있게 하고, 회고 입력칸을 긴 글 작성에 맞게 확장한다.

근거: `aiop-status.md` 11번 우선순위 중 1번(회고 항목 인라인 텍스트 편집)과 4번(텍스트 입력칸 확장)을 하나의 작업으로 묶어 진행한다.

---

## 2. 결정 사항

| # | 결정 | 내용 |
|---|---|---|
| D1 | 편집 진입 | 별도 편집 버튼 사용. 더블클릭이나 텍스트 직접 클릭은 사용하지 않는다. |
| D2 | Try-Todo 동기화 | Try에서 연결된 Todo 방향으로만 동기화한다. Try 텍스트 수정 시 `linkedTodoId`가 있으면 해당 Todo `title`도 갱신한다. |
| D3 | 입력칸 확장 | 회고 추가 입력과 인라인 편집 UI를 모두 `textarea` 기반으로 맞춘다. |
| D4 | 빈 값 저장 | `text.trim()` 결과가 비어 있으면 저장하지 않고 기존 텍스트를 유지한다. |
| D5 | 컴팩트뷰 키보드 가림 | 이번 작업에서는 보정하지 않는다. 동작만 깨지지 않으면 OK. |

---

## 3. Scope

### Include

- 회고 항목(K / P / T)의 인라인 편집 진입 / 저장 / 취소 동작
- 각 항목 카드 안에 lucide `Pencil` 편집 버튼 배치
- 편집 중에는 텍스트 자리에서 `textarea` + 저장 / 취소 버튼 표시
- 회고 추가 입력 UI를 `<input>`에서 `<textarea>`로 교체
- `AddRetroModal` 입력 UI도 긴 글 입력이 가능한 `textarea`로 정리
- Try 텍스트 수정 시 연결된 Todo `title` 동기화
- Try 삭제 시 연결된 Todo도 같이 삭제
- Todo 삭제 시 연결된 Try는 삭제하지 않고 연동만 해제
- 빈 문자열 저장 거부
- `Escape` 편집 취소, `Cmd|Ctrl+Enter` 저장
- 회고 항목 표시 시 textarea 줄바꿈 유지
- 앱 전체 삭제 버튼에 삭제 확인 팝업 표시

### Exclude

- 컴팩트뷰 키보드 가림 보정
- Todo에서 Try 방향 역동기화
- 회고 외 다른 도메인 인라인 편집
- 백엔드 / Supabase 관련 변경
- 회고 항목 reorder
- Markdown / rich text 편집
- 자동 테스트 추가

---

## 4. Tasks

- [x] **T1. RetroView 구조 파악** - `RetroView.tsx`와 `AddRetroModal.tsx`의 현재 input / textarea / 버튼 배치 확인.
- [x] **T2. 입력칸 확장 (D3)** - 회고 추가 입력을 `textarea`로 교체하고 `AddRetroModal`에도 적용.
- [x] **T3. 편집 상태 관리** - `editingItemId: string | null` 기반으로 한 번에 하나의 항목만 편집.
- [x] **T4. 편집 아이콘 / 편집 UI 렌더 (D1)** - 항목 카드에 `Pencil` 버튼 추가, 편집 중 `textarea` + 저장 / 취소 버튼 표시.
- [x] **T5. 저장 / 취소 / 빈값 처리 (D4)** - 공백 저장 거부, 취소 시 원래 텍스트 유지.
- [x] **T6. Try-Todo 텍스트 동기화 (D2)** - Try 항목 저장 시 연결된 Todo `title` 갱신.
- [x] **T7. 키보드 단축키** - `Escape` 취소, `Cmd|Ctrl+Enter` 저장.
- [x] **T8. 정규화 / 저장 영향 확인** - `RetroItem` / `KptRetro` 스키마 변경 없이 텍스트 필드만 갱신.
- [x] **T9. 검증** - `tsc`, `lint`, `build` 통과. 브라우저 수동 QA 통과.
- [x] **T10. 사용자 검토** - diff와 수동 QA 결과 보고 후 사용자 확인 완료. 커밋 금지.

---

## 5. Files Expected to Change

```txt
src/components/retros/RetroView.tsx
src/components/retros/AddRetroModal.tsx
src/lib/retros.ts
src/components/layout/Header.tsx
src/lib/confirmDelete.ts
src/components/wants/WantsView.tsx
src/components/subscriptions/SubscriptionsView.tsx
src/components/notes/NotesInboxView.tsx
src/components/insights/BookInsightsView.tsx
src/components/regret/RegretTrackerView.tsx
src/components/todos/TodoView.tsx
```

---

## 6. Verification

```bash
npm exec tsc -- --noEmit
npm run lint
npm run build
```

### 수동 QA 체크리스트

- [x] Keep 항목 인라인 편집 진입, 수정, 저장 반영
- [x] Problem 항목 인라인 편집 진입, 수정, 저장 반영
- [x] Try 항목 인라인 편집 진입, 수정, 저장 반영
- [x] Try 항목 중 `linkedTodoId`가 있는 항목 편집 시 `/todos`의 Todo `title`도 변경
- [x] Try 항목 중 `linkedTodoId`가 없는 항목 편집 시 Todos 변경 없음
- [x] Try 항목 삭제 시 연결된 Todo도 삭제
- [x] Todo 삭제 시 연결된 Try는 삭제되지 않고 연동만 해제
- [x] 빈 문자 / 공백만 저장 시 저장 거부, 기존 텍스트 유지
- [x] `Escape` 편집 취소
- [x] `Cmd|Ctrl+Enter` 저장
- [x] 한 항목 편집 중 다른 항목 편집 버튼 클릭 시 새 항목 편집으로 전환
- [x] Try 체크박스 / 삭제 / 추가 기능 유지
- [x] 과거 회고 날짜에서도 동일하게 동작
- [x] 새로고침 후 편집 내용 유지
- [x] `AddRetroModal`에서 긴 글 입력 가능
- [x] `AddRetroModal`로 추가한 여러 줄 텍스트의 줄바꿈 표시
- [x] `RetroView`의 K/P/T 추가 입력칸에서 긴 글 입력 가능
- [x] 컴팩트뷰에서 편집 / 저장 동작 유지
- [x] 컴팩트뷰 상단 AIOP 로고 클릭 시 대시보드로 이동
- [x] 삭제 버튼 클릭 시 삭제 확인 팝업 표시

---

## 7. Done Criteria

- [x] 4번 Tasks 모두 체크
- [x] 6번 검증 모두 통과
- [x] 사용자 검토 후 OK
- [x] `aiop-status.md` 우선순위에서 1번 + 4번 항목 제거
- [ ] 본 plan 요약을 `aiop-archive.md`로 이전
- [ ] plan.md를 다음 작업 대기 상태로 정리

---

## 8. Next Plan Placeholder

다음 후보는 `aiop-status.md` 11번의 2번, **Wants 카테고리 필터 실제 동작 연결**.
