# AIOP v1.0 UI 마무리 및 Esc/로고 이동 작업 기록

## 1. 작업 일자, 대상 파일

- 작업 일자: 2026-05-11
- 대상 범위:
  - Dashboard 한글 라벨 및 긴 텍스트 처리
  - 도메인 View/Card 빈 상태 및 overflow 정리
  - Header 빠른 추가 모달과 Add Modal의 Esc 닫기
  - Sidebar 로고 클릭 시 Dashboard 이동
  - README v1.0 상태 반영
  - ESLint 설정 추가

주요 대상 파일:

```txt
.eslintrc.json
README.md
src/hooks/useEscapeKey.ts
src/components/dashboard/*
src/components/wants/*
src/components/subscriptions/*
src/components/insights/*
src/components/regret/*
src/components/notes/*
src/components/quick-add/QuickAddModal.tsx
src/components/layout/AppShell.tsx
src/components/layout/Sidebar.tsx
src/components/calculator/AssetCalculatorView.tsx
```

## 2. 요구사항

사용자 요청:

```txt
v10-plan md 읽고 진행해줘
Esc 키로 모달 닫기, 로고 클릭시 대시보드로 이동 기능 구현
현재까지 구현 내역 md 파일로 저장 및 코드 리뷰 해줘
```

작업 조건:

- 백엔드, 인증, DB, 외부 API, AI API는 추가하지 않음
- 기존 localStorage 기반 데이터 흐름 유지
- 기존 디자인 톤 유지
- TypeScript/build/lint 통과
- 작업 기록은 `.agent-notes/` 아래 한국어 Markdown으로 저장

## 3. 동작 타임라인

1. `.agent-notes/aiop-v10-plan.md`를 UTF-8로 읽고 v1.0 마무리 범위 확인
2. Dashboard 라벨을 한글 톤으로 정리
3. 각 도메인 화면에 빈 상태 UI 추가
4. 카드 제목/본문에 `truncate`, `line-clamp`, `min-w-0`, `shrink-0` 적용
5. 모바일에서 본문 높이가 깨지지 않도록 `AppShell`의 main 영역 높이 조건 완화
6. Sidebar 모바일 nav에 `thin-scrollbar`, `whitespace-nowrap` 적용
7. README를 v1.0 완료 상태로 갱신
8. `.eslintrc.json` 추가로 `npm run lint`의 대화형 설정 프롬프트 제거
9. `useEscapeKey` 훅 추가
10. QuickAddModal 및 5개 Add Modal에 Esc 닫기 연결
11. Sidebar 로고 영역을 버튼으로 바꾸고 `dashboard` 이동 연결
12. `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build` 검증

## 4. 구현 방식

### Esc 키로 모달 닫기

공통 훅을 추가하고, 모달이 열려 있을 때만 `keydown` 이벤트를 구독하도록 처리했다.

```ts
export function useEscapeKey(isActive: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscape();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onEscape]);
}
```

적용 대상:

```txt
src/components/quick-add/QuickAddModal.tsx
src/components/wants/AddWantModal.tsx
src/components/subscriptions/AddSubscriptionModal.tsx
src/components/insights/AddInsightModal.tsx
src/components/regret/AddRegretItemModal.tsx
src/components/notes/AddNoteModal.tsx
```

### 로고 클릭 시 Dashboard 이동

`Sidebar`의 로고 영역을 `button`으로 변경하고 기존 `onSelectView` 흐름을 그대로 사용했다.

```tsx
<button
  type="button"
  onClick={() => onSelectView("dashboard")}
  className="mb-6 flex w-full items-center gap-3 rounded-2xl px-2 py-1 text-left transition hover:bg-zinc-900"
  aria-label="대시보드로 이동"
>
  ...
</button>
```

### UI 마무리

- Dashboard Summary 라벨:
  - `계획 지출 합계`
  - `최근 인사이트`
  - `수집함`
- 카드 제목과 긴 본문:
  - `min-w-0`
  - `truncate`
  - `line-clamp-2`
  - `line-clamp-3`
- 빈 상태 문구:
  - Wants, Subscriptions, Insights, Regret, Notes에 추가
- 모바일 깨짐 방지:
  - Sidebar nav 가로 스크롤 개선
  - AppShell main 높이를 모바일에서는 고정하지 않도록 조정
  - 계산기 결과 행을 모바일에서 세로 배치 가능하게 조정

## 5. 검증 결과

PowerShell 실행 정책 때문에 `npm`/`npx` 대신 `.cmd`를 사용했다.

```bash
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

결과:

```txt
TypeScript: 통과
Lint: 통과
Build: 통과
```

참고:

- `npm run lint`는 통과하지만 Next.js 15 기준 `next lint` deprecated 경고가 표시된다.
- `tsconfig.tsbuildinfo`는 타입 체크/build 실행으로 갱신됐다.

## 6. 알려진 한계 / 후속 TODO

- `useEscapeKey`는 현재 열린 모달이 하나라는 전제를 둔다. 현재 QuickAddModal은 카테고리 선택 시 닫히고 도메인 Add Modal만 열리므로 문제 없음.
- Esc를 누르면 입력 중인 폼도 즉시 닫힌다. 입력 손실 확인(confirm)은 아직 구현하지 않았다.
- 모달 포커스 트랩, 첫 입력 autofocus, 배경 스크롤 잠금은 아직 없다.
- Next.js 15의 `next lint` deprecated 경고는 남아 있다. 추후 ESLint CLI 방식으로 migration 필요.
- `tsconfig.tsbuildinfo`는 빌드 산출성 파일이므로 커밋 대상 여부를 별도로 결정할 필요가 있다.

## 7. 변경 파일 목록

```txt
.eslintrc.json
README.md
src/hooks/useEscapeKey.ts
src/components/calculator/AssetCalculatorView.tsx
src/components/dashboard/RecentInsights.tsx
src/components/dashboard/SummaryCards.tsx
src/components/dashboard/WantPreview.tsx
src/components/insights/AddInsightModal.tsx
src/components/insights/BookInsightsView.tsx
src/components/insights/InsightCard.tsx
src/components/layout/AppShell.tsx
src/components/layout/Sidebar.tsx
src/components/notes/AddNoteModal.tsx
src/components/notes/NotesInboxView.tsx
src/components/quick-add/QuickAddModal.tsx
src/components/regret/AddRegretItemModal.tsx
src/components/regret/RegretCard.tsx
src/components/regret/RegretTrackerView.tsx
src/components/subscriptions/AddSubscriptionModal.tsx
src/components/subscriptions/SubscriptionCard.tsx
src/components/subscriptions/SubscriptionsView.tsx
src/components/wants/AddWantModal.tsx
src/components/wants/WantCard.tsx
src/components/wants/WantsView.tsx
tsconfig.tsbuildinfo
```
