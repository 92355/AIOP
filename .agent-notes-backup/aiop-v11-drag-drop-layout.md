# 작업 계획 — AIOP v1.1 ~ v1.2 (Dashboard 레이아웃 드래그&드롭 커스터마이징)

작성일: 2026-05-11
결정 사항 반영: 2026-05-11
범위: Dashboard 위젯의 위치 / 크기를 GUI로 마우스 드래그&드롭으로 조정하고 localStorage에 저장
선행 작업: v1.0 완료 (frontend MVP + 빠른 추가 + 컴팩트 모드)
후속 작업: v1.3 데이터 export / import → v2.0 Supabase 백엔드
대상 디렉토리: `C:/dev/AIOP/src/app/page.tsx`, `C:/dev/AIOP/src/components/dashboard/**`, `C:/dev/AIOP/src/components/layout/**`, 신설 `C:/dev/AIOP/src/components/layout/grid/**`, `C:/dev/AIOP/src/components/layout/settings/**`

---

## 0. 사용자 결정 사항 (2026-05-11 확정)

| 항목 | 결정 |
|---|---|
| 1. 적용 범위 | **Dashboard만**. 다른 View(Wants / Subscriptions 등)는 v1.1 범위 밖 |
| 2. 위젯 단위 | **컴포넌트 통째 단위로 외부 grid 배치 + SummaryCards 내부 카드 5개는 순서 변경 가능** (외부 = `react-grid-layout`, 내부 = `@dnd-kit/sortable`) |
| 3. 편집 토글 위치 | **Sidebar 좌측 하단의 "설정" 버튼**. 클릭 시 메뉴 펼쳐짐 (편집 모드 / 레이아웃 초기화) |
| 4. Hero section | **위젯으로 편입**. "내 삶의 컨트롤 센터"도 다른 위젯과 동일하게 이동 가능 |

---

## 1. 요구사항 요약

- 최종 목표: **사용자가 매일 보는 Dashboard 화면을 자기가 원하는 배치로 직접 정리할 수 있는 환경** 제공
- 사용자가 제공한 요구사항:
  - 마우스 드래그&드롭으로 위젯 사이즈 조정
  - 마우스 드래그&드롭으로 위젯 위치 조정
  - 위젯 통째 이동은 물론, SummaryCards 안의 카드 5개도 순서 재배치 가능
  - GUI로 직관적으로 커스터마이징
  - 진입은 Sidebar 좌측 하단 설정 버튼에서
- 반드시 지켜야 할 조건:
  - 사용자가 변경한 레이아웃 + 카드 순서는 새로고침해도 유지 (localStorage 영속)
  - 기존 위젯의 데이터 로직 / UI 톤(zinc-900 / emerald-400 / rounded-2xl)은 그대로 유지
  - 컴팩트 모드 / 다크 모드 / 빠른 추가 흐름과 충돌 없음
  - 모바일에서는 드래그 비활성화 (1열 고정)
  - TypeScript 에러 0, build 통과
  - v2.0 백엔드 전환 시 레이아웃 + 카드 순서도 함께 마이그레이션 가능한 데이터 구조

---

## 2. 현재 상황 판단

확인된 정보:
- Dashboard 렌더링 위치: `src/app/page.tsx` 내부 `DashboardView()` 함수
- 현재 Dashboard 구조 (6개 영역, 모두 위젯화):
  1. **Hero** ("내 삶의 컨트롤 센터" 안내 카드)
  2. **SummaryCards** (5개 sub-카드 묶음: 구매 목표 / 월 구독비 / 계획 지출 합계 / 최근 인사이트 / 수집함)
  3. **WantPreview**
  4. **AssetSnapshot**
  5. **SubscriptionSummary**
  6. **RecentInsights**
- 현재 레이아웃: Tailwind `grid` + `xl:grid-cols-[1.05fr_0.95fr]` 등 정적 배치
- 컴팩트 모드: `useCompactMode()`로 padding / font-size / grid gap을 동적 조정
- Sidebar 구조: `src/components/layout/Sidebar.tsx`. 좌측 하단에 설정 메뉴를 끼울 공간이 있음 (확인 후 세부 위치 결정)
- localStorage 사용 패턴: `useLocalStorage<T>(key, fallback)` 훅 + `Array.isArray` 가드 + mock fallback
- 의존성 현황: `react`, `react-dom` 19 / `next` 15 / `clsx` / `lucide-react`. 드래그 라이브러리 없음

확실하지 않은 부분:
- `react-grid-layout`의 React 19 호환 (peerDeps가 18까지 명시될 가능성) — 설치 시 확인
- `@dnd-kit`은 React 19 공식 지원
- 외부 grid drag와 내부 sortable drag의 이벤트 전파 처리 — pointer event sensor 활성화 영역을 명확히 분리해서 해결

---

## 3. 작업 범위

### 신설 디렉토리 / 파일

```txt
src/components/layout/grid/
├─ DashboardGrid.tsx           위젯 6개를 grid에 배치 + 드래그/리사이즈 처리
├─ WidgetFrame.tsx             공통 위젯 wrapper (드래그 핸들 / resize 핸들 / 편집 모드 outline)
└─ defaultLayout.ts            기본 레이아웃 정의 (위젯 ID / x,y / w,h / minW,minH) + 기본 카드 순서

src/components/layout/settings/
├─ SidebarSettingsButton.tsx   Sidebar 좌측 하단 톱니바퀴 버튼
└─ SettingsMenu.tsx            버튼 클릭 시 위로 펼쳐지는 메뉴 (편집 모드 / 초기화)

src/components/dashboard/
└─ SummaryCardsSortable.tsx    기존 SummaryCards를 dnd-kit sortable로 감싸는 컨테이너 (편집 모드일 때만 활성)

src/contexts/
└─ LayoutContext.tsx           편집 모드 / 레이아웃 / 카드 순서 / setLayout / setCardsOrder / resetLayout 노출

src/hooks/
└─ useDashboardLayout.ts       localStorage에서 레이아웃 + 카드 순서 읽기/쓰기 (SSR-safe, schema guard)

src/types/
└─ layout.ts                   WidgetId / SummaryCardId / WidgetLayout / DashboardLayout 타입
```

### 수정 예상 파일

| 구분 | 파일 | 변경 종류 |
|---|---|---|
| 데이터 흐름 | `src/app/page.tsx` | `DashboardView` 내부를 `<DashboardGrid />`로 교체. Hero section을 별도 위젯 컴포넌트로 분리 |
| 위젯 wrap | `src/components/dashboard/SummaryCards.tsx` | 내부 카드 배열을 `summaryCardsOrder` 기반으로 정렬해서 렌더. 편집 모드일 때 `SummaryCardsSortable`로 wrap |
| 진입점 | `src/components/layout/Sidebar.tsx` | 좌측 하단에 `<SidebarSettingsButton />` 추가 |
| Provider | `src/app/layout.tsx` 또는 `src/components/layout/AppShell.tsx` | `<LayoutProvider>` 추가 |
| 위젯 frame | `src/components/dashboard/*.tsx` 5개 | `WidgetFrame`으로 wrap (기존 컴포넌트 코드는 거의 그대로) |
| 스타일 | `src/app/globals.css` | `react-grid-layout/css/styles.css`, `react-resizable/css/styles.css` import |
| 의존성 | `package.json` | `react-grid-layout`, `@dnd-kit/core`, `@dnd-kit/sortable` 추가 + types |
| 문서 | `README.md` | v1.1 ~ v1.2 항목 갱신 (이미 반영) |

### 데이터 모델 (localStorage)

```ts
// src/types/layout.ts

export type WidgetId =
  | "hero"
  | "summary-cards"
  | "want-preview"
  | "asset-snapshot"
  | "subscription-summary"
  | "recent-insights";

export type SummaryCardId =
  | "wants-count"
  | "subscriptions-monthly"
  | "planned-spend"
  | "recent-insight"
  | "inbox-count";

export interface WidgetLayout {
  id: WidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DashboardLayout {
  version: 1;                          // 마이그레이션 대비
  breakpoint: "lg" | "md" | "sm";
  widgets: WidgetLayout[];
  summaryCardsOrder: SummaryCardId[];   // SummaryCards 내부 카드 5개 순서
  hidden?: WidgetId[];                  // v1.2에서 위젯 숨기기 추가될 때 사용
}
```

localStorage 키:
- `aiop:layout` — `DashboardLayout` 통합 저장 (위젯 layout + 카드 순서)
- 손상 / 누락 시 `defaultLayout`으로 fallback
- `version` 필드로 스키마 변경 시 마이그레이션 가능

### 수정하지 않을 범위

- 각 위젯의 내부 데이터 / 계산 로직 (`SummaryCards`의 5개 카드 본문, `WantPreview` 등)
- 디자인 토큰 (`rounded-2xl`, `shadow-soft`, `border-zinc-800`, `bg-zinc-900`)
- 컴팩트 모드 / 다크 모드 동작 방식
- 빠른 추가 / 모달 / 라우팅 / Header
- Dashboard 외 다른 View

---

## 4. 구현 방향

### 라이브러리 조합

| 영역 | 라이브러리 | 역할 |
|---|---|---|
| 외부 grid (위젯 6개) | **`react-grid-layout`** | 드래그 + 리사이즈 + 반응형 breakpoint |
| 내부 카드 (SummaryCards 안 5개) | **`@dnd-kit/core` + `@dnd-kit/sortable`** | 순서 재정렬 전용 (리사이즈 불필요) |

### 라이브러리 분리 이유

- **`react-grid-layout` 하나로 중첩 grid 구성도 가능하지만**, 내부 카드는 "한 줄 안에서 순서만 바꾸면 되는" 작업이라 grid 시스템은 과함
- **`@dnd-kit/sortable`**은 순서 재정렬 전용에 최적화. 가볍고 React 19 공식 지원
- 외부 = grid 자유 배치, 내부 = 단순 sortable 로 책임 분리가 명확

### 외부 / 내부 드래그 충돌 방지

- `react-grid-layout`의 드래그 핸들을 `.widget-drag-handle` 클래스로 명시 (`draggableHandle=".widget-drag-handle"`)
- `WidgetFrame`이 상단에 좁은 핸들 영역만 노출 → 카드 내부 클릭 영역과 분리
- `@dnd-kit` sensor는 SummaryCardsSortable 내부에서만 활성, pointer down 이벤트는 `stopPropagation()`으로 외부 grid drag 트리거 방지

### UX

- **편집 모드 OFF (기본)**:
  - Dashboard는 현재와 시각적으로 동일 (위젯 정적 배치, 핸들 숨김)
  - SummaryCards는 저장된 순서로 정렬해서 렌더 (단순 map)
- **편집 모드 ON**:
  - 위젯 테두리에 emerald outline
  - WidgetFrame 상단에 드래그 핸들 표시 (`cursor-grab`)
  - WidgetFrame 우측 하단에 resize 핸들 표시
  - SummaryCards의 5개 카드도 각각 sortable 활성 (개별 카드 드래그 가능)
  - Sidebar 설정 메뉴에 "편집 종료" / "초기화" 노출

### 설정 메뉴 (Sidebar 좌측 하단)

```
┌─ Sidebar ───┐
│ ...         │
│ 메뉴 항목들  │
│             │
│ ───────────  │
│ ⚙ 설정      │ ← 평소엔 톱니바퀴 버튼
└─────────────┘

클릭 시 위로 팝업:
┌─────────────┐
│ ▶ 레이아웃 편집 │
│ ▶ 레이아웃 초기화│
└─────────────┘
│ ⚙ 설정      │
```

- 평상시: 톱니바퀴 아이콘 + "설정" 라벨 (Sidebar collapsed면 아이콘만)
- 클릭: 위로 펼쳐지는 메뉴
- 항목:
  - "레이아웃 편집" / "편집 종료" (편집 모드 토글)
  - "레이아웃 초기화" (확인 모달 후 `resetLayout()`)
- v1.2 확장 후보: 다크 모드 / 컴팩트 모드 / 데이터 export 등을 여기로 모으기

### 반응형 처리

- `lg` (≥1280px): 12-column grid, 드래그/리사이즈 모두 활성
- `md` (768~1279px): 8-column grid, 드래그/리사이즈 활성 (편집 모드 시)
- `sm` (<768px): 1-column 강제, 드래그/리사이즈/sortable 모두 비활성, Sidebar 설정 메뉴에서 "레이아웃 편집"은 비활성 안내
- breakpoint별 layout을 별도 저장하지 않고 lg 기준 1개만 저장, md/sm은 비례 축소 (단순)

### 변경 저장 정책

- 위젯 이동/리사이즈 직후 자동 저장 (별도 "저장" 버튼 없음)
- 카드 순서 변경 직후 자동 저장
- 편집 모드 진입/종료는 단순 토글, 저장과 무관
- 초기화는 확인 모달 후 `defaultLayout`으로 덮어쓰기

---

## 5. 작업 순서

### 단계 1 — 라이브러리 설치 + 호환성 확인

```bash
npm install react-grid-layout @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D @types/react-grid-layout
```

설치 후 React 19 peerDeps 경고 확인. `react-grid-layout`이 19를 안 받으면 `--legacy-peer-deps`로 재시도. 그래도 실패 시 `react-grid-layout`을 같은 `@dnd-kit` 계열로 통일하는 방안(외부도 dnd-kit + re-resizable)으로 우회.

`src/app/globals.css` 상단에 추가:
```css
@import "react-grid-layout/css/styles.css";
@import "react-resizable/css/styles.css";
```

### 단계 2 — 타입 / 기본 레이아웃 / Context

- `src/types/layout.ts` — `WidgetId`, `SummaryCardId`, `WidgetLayout`, `DashboardLayout`
- `src/components/layout/grid/defaultLayout.ts` — 6개 위젯 기본 배치 + `summaryCardsOrder` 기본 순서
- `src/hooks/useDashboardLayout.ts` — `useLocalStorage<DashboardLayout>("aiop:layout", defaultLayout)` + schema guard
- `src/contexts/LayoutContext.tsx` — `isEditMode`, `layout`, `setLayout`, `setCardsOrder`, `resetLayout`, `toggleEditMode` 노출

### 단계 3 — `WidgetFrame` 공통 wrapper

- props: `id: WidgetId`, `title?: string`, `children: ReactNode`
- 기본 스타일은 기존 위젯과 동일 (`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft`)
- 편집 모드 ON:
  - outline (emerald-400/40)
  - 상단에 `.widget-drag-handle` 영역 (높이 ~24px, `cursor-grab`)
  - 우측 하단 resize 핸들 (`react-grid-layout` 기본 핸들 + 스타일 override)
- 편집 모드 OFF: 기존 위젯과 시각적으로 동일

### 단계 4 — `DashboardGrid` 작성

- `ResponsiveGridLayout` (또는 `WidthProvider(GridLayout)`) 사용
- 6개 위젯을 `WidgetFrame` + 각 위젯 컴포넌트로 렌더
- 이벤트 핸들러:
  - `onLayoutChange`: 새 레이아웃 → context → localStorage 자동 저장
  - `onResizeStop`: 동일
- `draggableHandle=".widget-drag-handle"` 지정으로 내부 클릭과 분리

### 단계 5 — Hero를 위젯 컴포넌트로 분리

- 기존 `page.tsx`의 Hero JSX를 `src/components/dashboard/HeroWidget.tsx`로 추출
- 컴팩트 모드 분기 그대로 유지
- `WidgetFrame`으로 wrap

### 단계 6 — `SummaryCards`를 sortable로 변환

- 기존 `SummaryCards.tsx`에서 카드 배열을 `summaryCardsOrder` 순서로 정렬
- 편집 모드 ON일 때만 `SummaryCardsSortable` (DndContext + SortableContext)로 wrap
  - 카드 5개 각각을 `useSortable({ id })` 적용
  - drag handle은 카드 전체 (cursor: grab)
  - `pointerDown`에 `stopPropagation` 처리 — 외부 grid drag로 전파 방지
- `onDragEnd` → 새 순서 → context → localStorage 자동 저장
- 편집 모드 OFF: 단순 map (드래그 비활성), 동일 정렬 적용

### 단계 7 — Sidebar 설정 메뉴

- `src/components/layout/settings/SidebarSettingsButton.tsx`:
  - Sidebar 좌측 하단에 톱니바퀴 + "설정" 라벨
  - 클릭 시 `SettingsMenu` 토글
- `src/components/layout/settings/SettingsMenu.tsx`:
  - 위로 펼쳐지는 메뉴
  - 항목 1: "레이아웃 편집" / "편집 종료" — `toggleEditMode()`
  - 항목 2: "레이아웃 초기화" — 확인 모달 후 `resetLayout()`
  - 모바일에서는 항목 1, 2 비활성 + 안내 텍스트
- `src/components/layout/Sidebar.tsx`에 끼워 넣기 (기존 메뉴 아래 구분선 + 좌측 하단 고정)

### 단계 8 — `DashboardView` 교체

`src/app/page.tsx`:

```tsx
function DashboardView() {
  return (
    <LayoutProvider>
      <DashboardGrid />
    </LayoutProvider>
  );
}
```

(또는 `LayoutProvider`를 `AppShell` 레벨로 올려서 Sidebar 설정 메뉴도 같은 context를 보게 함)

### 단계 9 — 반응형 / 모바일 분기

- 768px 미만:
  - `<DashboardGrid />`에 `isDraggable={false}`, `isResizable={false}` + 1-column layout 강제
  - Sidebar 설정 메뉴의 "레이아웃 편집" 비활성 + 안내

### 단계 10 — 최종 검증

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run dev
```

브라우저 시나리오는 §7.

---

## 6. 예상 위험도

- 낮음:
  - 의존성 추가, 타입 정의, Context 추가
  - 기본 레이아웃 / 카드 순서 정의
  - Sidebar 설정 버튼 추가
- 중간:
  - `WidgetFrame` 디자인이 기존 위젯과 어색하지 않게 어울리도록 조정 (특히 SummaryCards처럼 자체 grid를 갖는 위젯)
  - SummaryCards 카드 정렬 — `summaryCardsOrder`가 누락된 카드 ID나 잘못된 ID를 가진 경우 fallback 로직
  - 컴팩트 모드와 grid row height 상호작용
  - Hero 위젯의 최소 크기 (minW/minH) — 안내문이 줄바꿈으로 깨지지 않게
- 높음:
  - **`react-grid-layout` React 19 호환 이슈** — §5 단계 1에서 빠르게 검증, 실패 시 dnd-kit 기반 외부 grid로 우회
  - **외부 grid drag와 내부 sortable drag 충돌** — 드래그 핸들 영역 분리 + `stopPropagation`으로 해결하되, 실제 브라우저에서 직접 검증 필수
  - **localStorage 데이터 손상** — 마이너 버전 변경 시 schema guard로 fallback. 카드 ID가 default와 불일치 시 default로 복원
  - **모바일 1열 분기 누락** — 모바일에서 핸들이 보이거나 위젯이 화면 밖으로 나가는 경우. DevTools 모바일 뷰에서 반드시 확인

---

## 7. 확인 방법

실행 명령어:
```bash
npm install
npx tsc --noEmit
npm run lint
npm run build
npm run dev
```

브라우저 확인 위치: `http://localhost:3000` (Dashboard 선택)

테스트 시나리오:

**A. 기본 동작 (편집 모드 OFF)**
1. Dashboard 진입 → 기존과 동일한 배치 / 동일한 시각적 톤
2. SummaryCards가 default 순서로 정렬됨
3. 빠른 추가로 항목 추가 → 위젯 데이터 즉시 갱신, 배치 유지

**B. 편집 모드 진입 / 종료**
4. Sidebar 좌측 하단 "설정" 클릭 → 메뉴 위로 펼쳐짐
5. "레이아웃 편집" 클릭 → 메뉴 닫힘 + 위젯 outline + 드래그/리사이즈 핸들 노출
6. 다시 "설정" → "편집 종료" → 보기 모드 복귀

**C. 외부 위젯 이동 / 리사이즈**
7. Hero 위젯을 드래그해 다른 위치로 이동 → 즉시 반영
8. WantPreview 우측 하단 핸들로 가로 폭 확대 → 즉시 반영
9. 새로고침 → 변경된 배치 그대로 유지

**D. 내부 카드 순서 변경**
10. 편집 모드 ON 상태에서 SummaryCards의 "월 구독비" 카드를 끌어서 맨 앞으로 이동 → 즉시 반영
11. 새로고침 → 변경된 카드 순서 유지
12. "레이아웃 초기화" 클릭 → 확인 모달 → default 카드 순서 복원

**E. 드래그 충돌 / 이벤트 전파**
13. SummaryCards 안에서 카드 드래그 시 외부 grid의 위젯 드래그가 동시에 발동하지 않음
14. 편집 모드 OFF 상태에서 카드 클릭 / 위젯 클릭은 정상 동작 (드래그 트리거 없음)

**F. 다른 모드와 충돌 검증**
15. 컴팩트 모드 토글 → 배치 / 카드 순서 유지된 채로 padding 축소
16. 다크 / 라이트 모드 전환 → 정상 동작 + 편집 모드 outline도 양쪽 모두에서 시인성 확보

**G. 모바일**
17. DevTools 모바일 뷰 (375px) → 1열 배치, 드래그/sortable 모두 비활성
18. Sidebar 설정 메뉴 → "레이아웃 편집" 항목이 비활성 + 안내 표시

**H. 데이터 무결성**
19. DevTools Application → Local Storage `aiop:layout` 값 확인 (`version`, `widgets`, `summaryCardsOrder`)
20. `aiop:layout`을 임의로 깨진 JSON으로 변경 → 새로고침 → defaultLayout으로 fallback
21. `summaryCardsOrder`에서 카드 ID 1개를 임의 문자열로 변경 → 새로고침 → default 순서로 복원

수동 체크리스트:
```txt
[ ] react-grid-layout React 19에서 정상 동작
[ ] @dnd-kit/sortable이 SummaryCards 내부에서 정상 동작
[ ] 6개 위젯 모두 드래그 가능 (Hero 포함)
[ ] 6개 위젯 모두 리사이즈 가능 (Hero 포함, minW/minH 적용)
[ ] SummaryCards 5개 카드 순서 변경 가능
[ ] 외부 grid drag와 내부 sortable drag가 충돌하지 않음
[ ] 변경한 레이아웃 + 카드 순서가 새로고침 후 유지
[ ] Sidebar 좌측 하단 설정 버튼 + 위로 펼쳐지는 메뉴 동작
[ ] "레이아웃 초기화"가 default로 복원
[ ] 모바일에서 1열 + 드래그/sortable 모두 비활성 + 설정 메뉴 안내
[ ] 컴팩트 모드 / 다크 모드 / 빠른 추가와 충돌 없음
[ ] tsc / lint / build 통과
[ ] README.md 갱신됨 (이미 반영)
```

---

## 8. 구현 직전 확인 (모든 결정 완료)

§0의 4개 항목 모두 결정됨. 추가 질문 없음.

`진행해` / `구현해` / `그대로 해줘` 중 하나로 명령하시면 §5 단계 1부터 시작합니다. 단계 1에서 라이브러리 설치 후 React 19 호환 이슈가 발견되면 즉시 보고하고, 우회안(dnd-kit 기반 외부 grid) 적용 여부를 다시 확인받습니다.

---

## 부록 — v1.2 확장 후보

v1.1로 기본 드래그&드롭 + 카드 sortable이 안정되면 v1.2에서 다음을 검토합니다.

- **위젯 숨기기 / 보이기** (`hidden: WidgetId[]` 활용, 설정 메뉴에서 토글)
- **위젯 추가 라이브러리** (v2.1+ AI 위젯도 동일 grid에 자연스럽게 끼우기 위한 기반)
- **레이아웃 프리셋** (집중 모드 / 자산 중심 / 메모 중심 등 1-click 전환)
- **설정 메뉴 통합** (다크 모드 / 컴팩트 모드 / 데이터 export까지 여기로 모으기 검토)
- **v2.0 백엔드 전환 시 `aiop:layout`을 user_preferences 테이블로 이관** (DashboardLayout 구조 그대로 JSONB 컬럼에 저장)
