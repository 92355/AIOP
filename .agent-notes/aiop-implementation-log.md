# AIOP 구현 내역

> 작성일: 2026-05-11
> 기준: 현재 워킹 트리 변경 사항

---

## 1. localStorage 훅 안정화

### 변경 파일

- `src/hooks/useLocalStorage.ts`

### 구현 내용

- `initialValue` 참조가 렌더마다 바뀌면서 hydrate effect가 반복 실행되던 문제를 수정했다.
- `initialValue`를 `useRef`로 고정했다.
- localStorage 읽기 effect 의존성을 `key` 기준으로 정리했다.

### 해결한 문제

- `Maximum update depth exceeded` 오류 방지.

---

## 2. 설정 드롭다운 z-index 수정

### 변경 파일

- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/settings/HeaderSettingsButton.tsx`
- `src/components/layout/settings/SidebarSettingsButton.tsx`

### 구현 내용

- Header와 Sidebar에 명시적인 stacking context를 추가했다.
- 설정 드롭다운 메뉴 z-index를 상향했다.

### 해결한 문제

- 설정 메뉴가 Dashboard Summary 카드 및 위젯 아래에 가려지던 문제 수정.

---

## 3. Dashboard 컴팩트뷰 위젯 순서 변경

### 변경 파일

- `src/components/layout/grid/DashboardGrid.tsx`
- `src/components/layout/grid/WidgetFrame.tsx`

### 구현 내용

- 컴팩트뷰 / 모바일 편집 모드에서 위젯 우측 상단에 위/아래 이동 버튼을 추가했다.
- 버튼 클릭 시 `narrowWidgetsOrder`와 `narrowWidgetHeights`가 draft layout에 반영된다.
- 데스크탑 그리드 드래그/리사이즈 동작은 유지했다.
- `react-grid-layout` v2 API 존재를 로컬 설치본 기준으로 확인했다.

### 확인한 API

- `Responsive`
- `useContainerWidth`
- `dragConfig`
- `resizeConfig`

---

## 4. Regret 라벨 정상화

### 변경 파일

- `src/components/layout/navItems.ts`

### 구현 내용

- Regret 화면 Header 타이틀을 `그때 살걸 기록장`으로 수정했다.
- Sidebar / BottomTabBar 라벨을 `후회 기록`으로 수정했다.

### 해결한 문제

- 비정상적으로 긴 placeholder 문구가 메뉴와 Header에 노출되던 문제 수정.

---

## 5. Wants 카테고리 필터 연결

### 변경 파일

- `src/components/wants/WantsView.tsx`

### 구현 내용

- `selectedCategory` state를 추가했다.
- 카테고리 버튼 클릭 시 필터가 적용되도록 연결했다.
- 활성 버튼 스타일을 선택된 카테고리 기준으로 변경했다.
- 필터 결과가 없을 때 별도 빈 상태 문구를 표시한다.

### 동작

- `전체` 선택 시 모든 구매 목표 표시.
- 개별 카테고리 선택 시 해당 카테고리 구매 목표만 표시.

---

## 6. Dashboard 위젯 overflow 수정

### 변경 파일

- `src/components/layout/grid/WidgetFrame.tsx`
- `src/components/dashboard/WantPreview.tsx`
- `src/components/dashboard/RecentInsights.tsx`
- `src/components/dashboard/TodoSummary.tsx`

### 구현 내용

- `WidgetFrame`에 `overflow-hidden`을 적용해 위젯 외부로 콘텐츠가 튀어나가지 않도록 했다.
- 목록형 위젯은 내부 목록 영역만 스크롤되도록 수정했다.

### 대상 위젯

- 최근 구매 목표
- 최근 인사이트
- Todo 요약

---

## 7. SummaryCard 클릭 이동

### 변경 파일

- `src/app/page.tsx`
- `src/components/layout/grid/DashboardGrid.tsx`
- `src/components/dashboard/SummaryCards.tsx`

### 구현 내용

- Summary 카드를 클릭하면 관련 화면으로 이동하도록 연결했다.
- 비편집 모드에서만 클릭 이동이 동작한다.
- 편집 모드에서는 기존 Summary 카드 드래그 정렬을 유지한다.

### 이동 매핑

- 구매 목표 → `wants`
- 월 구독비 → `subscriptions`
- 계획 지출 합계 → `wants`
- 최근 인사이트 → `insights`
- 수집함 → `notes`
- Todo → `todos`

---

## 8. SPA 뒤로가기 지원

### 변경 파일

- `src/app/page.tsx`

### 구현 내용

- `selectedView` 상태를 URL query와 동기화했다.
- 화면 이동 시 `?view=` query를 갱신한다.
- 브라우저 뒤로가기 / 앞으로가기 시 `popstate` 이벤트로 화면을 복원한다.
- 잘못된 view query는 Dashboard로 fallback한다.

### URL 예시

```text
/                       # Dashboard
/?view=wants            # Wants
/?view=notes            # Notes
/?view=subscriptions    # Subscriptions
```

### 추가 수정

- `setState` updater 내부에서 `history.pushState`를 호출하던 구조를 제거했다.
- React console error `Cannot update a component (Router) while rendering a different component (Home)`를 해결했다.

---

## 9. SummaryCard hover 디자인 개선

### 변경 파일

- `src/components/dashboard/SummaryCards.tsx`

### 구현 내용

- 클릭 가능한 Summary 카드에 hover 효과를 추가했다.
- hover 시 카드가 살짝 위로 이동한다.
- border, shadow, 값 텍스트, helper 텍스트, 아이콘 배경/색상이 반응하도록 수정했다.
- active 상태에는 눌림 효과를 적용했다.

---

## 10. Hero 문구 사용자 저장

### 변경 파일

- `src/components/dashboard/HeroWidget.tsx`

### 구현 내용

- Hero 제목 문구를 사용자가 직접 편집하고 저장할 수 있게 했다.
- 저장 key는 `aiop:hero-message`다.
- 편집 버튼, 저장 버튼, 취소 버튼을 추가했다.
- Enter로 저장, Escape로 취소할 수 있다.
- 빈 문구는 저장하지 않는다.
- 새로고침 후에도 저장한 문구가 유지된다.

---

## 검증 결과

아래 명령어를 변경 과정 중 반복 실행했다.

```bash
npm run lint
npm run build
npx tsc --noEmit
```

### 최종 확인 상태

- `npm run lint` 통과
- `npm run build` 통과
- `npx tsc --noEmit` 통과

---

## 남은 수동 확인

- Dashboard 설정 메뉴가 모든 위젯 위에 표시되는지 확인.
- Dashboard 편집 모드에서 위젯 이동 / 저장 / 초기화 동작 확인.
- 컴팩트뷰에서 위젯 위/아래 이동 후 저장 및 새로고침 유지 확인.
- Summary 카드 클릭 시 대상 화면으로 이동하는지 확인.
- 브라우저 뒤로가기 / 앞으로가기가 view query와 함께 정상 동작하는지 확인.
- Hero 문구 저장 후 새로고침해도 유지되는지 확인.
