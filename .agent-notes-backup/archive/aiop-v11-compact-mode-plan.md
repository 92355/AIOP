# 작업 계획 — AIOP v1.1 (간단뷰 / 모바일뷰)

작성일: 2026-05-11
범위: Header의 알림 버튼을 "간단뷰 토글"로 재활용 + 모바일 친화적 컴팩트 모드 도입
선행 작업: v0.1 ~ v1.0 완료 (frontend MVP 마무리), 빠른 추가 구현 완료
대상 디렉토리: `C:/dev/AIOP/src/components/layout/`, `src/components/dashboard/`, `src/app/`, 5개 도메인 View

## 1. 요구사항 요약

- 최종 목표: 좁은 화면(모바일)에서도 스크롤 부담 없이 한 손으로 사용 가능한 **간단뷰(컴팩트 모드)** 도입
- 사용자 결정 사항(2026-05-11):
  - **알림 버튼 재활용**: Header 우측의 Bell placeholder를 간단뷰 토글 버튼으로 전환
  - **간단뷰 동작**: 전체 압축 + **Sidebar를 하단 탭바로 전환**
  - **토글 방식**: 순수 수동. 화면 크기와 무관하게 사용자가 버튼을 눌러야만 적용
  - **상태 저장**: localStorage 영구 저장 (다음 방문 시에도 유지). 키: `aiop-compact-mode`
  - **간단뷰에서 숨길/압축**:
    - 카드의 helper text / 보조 설명
    - Dashboard 보조 위젯 (WantPreview 상세 메타, AssetSnapshot Decision note, RecentInsights actionItem 등)
    - Sidebar 자동 접기 (하단 탭바로 전환)
- 반드시 지켜야 할 조건:
  - 백엔드 / 인증 / 외부 API / AI API 도입 금지
  - 기존 5개 도메인 데이터 흐름(useLocalStorage)과 빠른 추가 동선 보존
  - 일반뷰(기본 상태)는 v1.0 결과 그대로 유지. 컴팩트 모드는 **추가 레이어**
  - 디자인 톤 (zinc-900 / emerald-400 / rounded-2xl / shadow-soft) 보존
  - TypeScript 에러 0

## 2. 현재 상황 판단

확인된 정보:
- `src/components/layout/Header.tsx:43-45`의 알림 버튼은 `onClick` 없는 placeholder → 토글 버튼으로 재활용 가능
- `src/components/layout/AppShell.tsx`는 `md:flex` 기반 가로 분할 레이아웃 (좌 Sidebar + 우 main). 모바일에서는 어떻게 처리되는지 시각 검증 필요
- 테마 토글이 이미 `useLocalStorage<ThemeMode>("aiop-theme-mode", "dark")` 패턴을 사용 → 컴팩트 모드도 동일 패턴 채택 가능 (`useLocalStorage<boolean>("aiop-compact-mode", false)`)
- `aiop-theme-mode`는 colon 없이 dash로 키를 쓴 전례 — 컴팩트 모드도 동일하게 `aiop-compact-mode` 사용
- Sidebar(`src/components/layout/Sidebar.tsx`)는 `ViewKey` 7개를 렌더하는 네비게이션 — 동일한 7개 항목을 하단 탭바에서도 그대로 표시
- 빠른 추가는 `app/page.tsx` 레벨에서 모달 상태/refreshKey 관리 — 컴팩트 모드에서도 동일하게 작동해야 함
- 4개 도메인 Add Modal + QuickAddModal + AddNoteModal: 컴팩트 모드일 때 모달 컨테이너가 좁은 화면 폭을 거의 다 채우는 형태로 조정 필요

부족한 정보:
- 하단 탭바에 ViewKey 7개를 모두 넣을지, 핵심 5개 + "더보기"로 분리할지
- 컴팩트 모드 진입 시 메인 영역의 좌우 padding / max-width 정책
- 토글 아이콘 (Smartphone / LayoutDashboard / Rows3 / Maximize2 + Minimize2 등)
- 컴팩트 모드에서도 Header 검색바를 유지할지, 숨길지

확실하지 않은 부분:
- 데스크탑에서 컴팩트 모드를 켰을 때 화면 폭이 매우 넓다면 카드가 띄엄띄엄 보일 수 있음 → 별도 `max-w` 컨테이너로 화면 중앙 정렬 권장 (기본값 채택)
- 컴팩트 모드 토글 직후 layout shift / 스크롤 위치 보존 여부

## 3. 작업 범위

### 수정 예상 파일

| 구분 | 파일 | 변경 종류 |
|---|---|---|
| 상태 관리 | `src/contexts/CompactModeContext.tsx` | **신설** — provider + `useCompactMode` 훅. `useLocalStorage<boolean>("aiop-compact-mode", false)` 래핑 |
| 셸 | `src/components/layout/AppShell.tsx` | CompactModeProvider 감싸기 + 레이아웃 분기 (Sidebar vs BottomTabBar) + 메인 영역 컨테이너 조정 |
| Header | `src/components/layout/Header.tsx` | Bell 버튼 → 토글 버튼. 아이콘 교체, `aria-pressed` + `title`, onClick 연결. 컴팩트 모드일 때 검색바 숨김 또는 축소 |
| Sidebar | `src/components/layout/Sidebar.tsx` | 컴팩트 모드일 때 자체 렌더 생략(또는 부모에서 분기) |
| 하단 탭바 | `src/components/layout/BottomTabBar.tsx` | **신설** — 모바일 하단 고정 네비게이션. ViewKey 7개를 아이콘 + 라벨로 표시 |
| Dashboard | `src/components/dashboard/SummaryCards.tsx` | 컴팩트 모드일 때 helper 텍스트 숨김, 카드 grid를 1~2열로 폴드, padding 축소 |
| Dashboard | `src/components/dashboard/WantPreview.tsx` | 컴팩트 모드일 때 부가 메타(카테고리/상태 칩 일부) 숨김, score 영역 단순화 |
| Dashboard | `src/components/dashboard/AssetSnapshot.tsx` | 컴팩트 모드일 때 Decision note 숨김, expectedYield/requiredCapital만 표시 |
| Dashboard | `src/components/dashboard/SubscriptionSummary.tsx` | 컴팩트 모드일 때 4분할 카드 → 핵심 2분할(월 총액 + 검토 대상), 칩 영역 축소 |
| Dashboard | `src/components/dashboard/RecentInsights.tsx` | 컴팩트 모드일 때 actionItem 한 줄 line-clamp, 카드 padding 축소 |
| 도메인 View | `src/components/wants/WantsView.tsx`, `subscriptions/SubscriptionsView.tsx`, `insights/BookInsightsView.tsx`, `regret/RegretTrackerView.tsx`, `notes/NotesInboxView.tsx` | 컴팩트 모드일 때 grid 1열 폴드, 카드 padding 축소, 보조 메타 숨김 |
| 도메인 카드 | `src/components/wants/WantCard.tsx`, `subscriptions/SubscriptionCard.tsx`, `insights/InsightCard.tsx`, `regret/RegretCard.tsx` | 컴팩트 모드일 때 텍스트 line-clamp / 일부 칩 숨김 |
| 계산기 | `src/components/calculator/AssetCalculatorView.tsx` | 컴팩트 모드일 때 입력 4필드 세로 정렬, 결과 카드 압축 |
| 모달 | `QuickAddModal.tsx`, `AddNoteModal.tsx`, `AddWantModal.tsx`, `AddSubscriptionModal.tsx`, `AddInsightModal.tsx`, `AddRegretItemModal.tsx` | 컴팩트 모드일 때 컨테이너 거의 풀스크린(`h-screen` 또는 `max-h-[100dvh]`), 좌우 padding 축소 |
| 페이지 | `src/app/page.tsx` | CompactModeProvider 적용 (또는 AppShell 내부에서 처리) |
| 글로벌 스타일 | `src/app/globals.css`, `tailwind.config.ts` | 필요 시 `safe-area-inset-bottom` 처리, 하단 탭바 높이 토큰 |

### 추가될 기능

- 알림 버튼 클릭 → 간단뷰 ON/OFF 즉시 전환
- 간단뷰일 때 Sidebar 숨김 + 하단 탭바 표시 + 카드/모달 압축
- localStorage 영구 저장으로 다음 방문에도 마지막 상태 유지
- 모달이 컴팩트 모드일 때 좁은 화면 폭을 거의 다 채우는 형태로 풀스크린화

### 수정하지 않을 범위

- 5개 도메인 데이터 모델 / 계산 로직 / localStorage 키 (`aiop:wants` 등)
- 빠른 추가 동작 흐름 (QuickAddModal → 도메인 Modal → refreshKey)
- 일반뷰의 시각 (기본 상태는 v1.0 결과 그대로)
- 다국어 / 백엔드 / 인증
- Add Modal 폼 구조 (검증 로직 변경 없음, 시각 컨테이너만 조정)

## 4. 구현 방향

선택한 방식:
- **React Context로 `isCompact` 상태 공유**: AppShell 내부에 Provider를 두고 모든 자식이 `useCompactMode()` 훅으로 접근. prop drilling 회피
- **하단 탭바 분리 컴포넌트**: Sidebar와 동일한 ViewKey 7개를 표시하지만 시각/배치가 다르므로 별도 컴포넌트로 분리
- **컴팩트 분기는 className 조건부**: 각 컴포넌트가 `isCompact ? "..." : "..."` 형태로 클래스 분기. 별도 컴팩트 전용 컴포넌트 신설은 피함(코드 중복 방지)
- **순수 수동 토글**: 화면 크기 감지 없음. 데스크탑/모바일 동일하게 사용자 의지로 켜고 끔
- **모바일 1순위, 데스크탑 컴팩트는 부수 효과**: 데스크탑에서 컴팩트 켜면 화면 중앙에 `max-w-md` 정도로 모바일 폭을 유사하게 보이도록 컨테이너 처리

선택 이유:
- Context는 7개 View + 모든 카드 + 모달이 동일 상태에 접근하므로 가장 자연스러움. 이미 useLocalStorage 패턴이 있어 wrap만 하면 됨
- 별도 컴팩트 컴포넌트는 변경 표면이 너무 큼. 클래스 분기는 작고 검토 가능
- 사용자가 "순수 수동 토글"을 명시했으므로 `window.innerWidth` 감지 로직 도입 안 함

대안:
- **방법 A: Context + className 분기 (선택)**
  - 장점: 상태 공유 깔끔, 컴포넌트 구조 보존, 변경 표면 작음
  - 단점: Context 1개 추가, isCompact prop을 받지 않는 컴포넌트가 다시 렌더링되는 미세한 비용
- **방법 B: page.tsx 레벨 prop drilling**
  - 장점: Context 추가 없음
  - 단점: AppShell → Header → Bell 토글 → page → AppShell 흐름이 어색, 5개 도메인 View / 5개 Modal 모두에 prop을 내려야 함
- **방법 C: 컴팩트 전용 컴포넌트 세트 신설 (`CompactDashboardView` 등)**
  - 장점: 일반뷰/컴팩트뷰가 시각적으로 완전 분리
  - 단점: 코드 중복 대규모, 유지보수 비용 큼

## 5. 작업 순서

### 단계 1 — CompactModeContext 신설

대상: `src/contexts/CompactModeContext.tsx`

```ts
type CompactModeContextValue = {
  isCompact: boolean;
  setCompact: (next: boolean) => void;
  toggleCompact: () => void;
};
```

- `useLocalStorage<boolean>("aiop-compact-mode", false)`를 wrap
- Provider, `useCompactMode()` 훅 export
- SSR 안전 (useLocalStorage가 이미 SSR-safe)

검증: tsc 통과, Provider 없이 훅 호출하면 명확한 에러

### 단계 2 — AppShell에 Provider + 레이아웃 분기

대상: `src/components/layout/AppShell.tsx`

- 최상단을 `<CompactModeProvider>`로 감싸기
- 내부에서 `useCompactMode()` 호출해 분기:
  - 일반: 현재 그대로 (좌 Sidebar + 우 main)
  - 컴팩트: Sidebar 숨김 + main 영역 단일 컬럼 + 하단 `<BottomTabBar />` 추가
- main 영역 padding 조정 (컴팩트일 때 `px-3 py-4` 정도로 축소, 하단 탭바 높이만큼 `pb-20` 보강)
- 컴팩트일 때 컨테이너에 `mx-auto max-w-md` 적용해 데스크탑에서도 모바일 폭 모사 (선택)

검증: 일반 모드에서 기존 디자인 그대로, 컴팩트 모드에서 Sidebar 사라지고 하단 탭바 등장

### 단계 3 — Header 알림 버튼 → 간단뷰 토글

대상: `src/components/layout/Header.tsx`

- `useCompactMode()` 호출
- Bell 아이콘 → 토글 아이콘 (예: `Smartphone` 또는 `Rows3`)
- `onClick={toggleCompact}`, `aria-pressed={isCompact}`, `title={isCompact ? "일반뷰" : "간단뷰"}`
- 컴팩트 모드일 때 검색바 숨김 또는 아이콘만 (옵션) — 단계 8 질문

검증: 버튼 클릭 시 즉시 토글, 새로고침 후에도 상태 유지

### 단계 4 — BottomTabBar 신설

대상: `src/components/layout/BottomTabBar.tsx`

- 7개 ViewKey 아이콘 + 라벨 렌더 (Sidebar에서 사용하는 NavItem 그대로 재사용)
- `fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur border-t border-zinc-800`
- `safe-area-inset-bottom` 처리 (iOS 노치/홈 인디케이터)
- 너무 좁으면 가로 스크롤 또는 아이콘만 표시 + 라벨 `text-[10px]` 축소
- 옵션: 7개 다 표시 vs 5개 핵심 + 더보기 (단계 8 질문)
- 빠른 추가 버튼을 탭바 중앙에 별도 강조 카드로 둘지(권장) 결정

검증: 모바일 360px / 414px에서 7개 항목 깨짐 없음, 탭 전환 동작

### 단계 5 — Dashboard 컴팩트 적용

대상: `src/components/dashboard/*`

- 각 컴포넌트가 `useCompactMode()` 호출 (또는 부모 prop)
- `SummaryCards`: 컴팩트일 때 helper text 숨김, grid `grid-cols-2`로 폴드, 카드 padding `p-3`
- `WantPreview`: 컴팩트일 때 카테고리 칩만 남기고 상태 칩 숨김, score 영역은 숫자만
- `AssetSnapshot`: 컴팩트일 때 Decision note 숨김, expectedYield/requiredCapital 2분할
- `SubscriptionSummary`: 컴팩트일 때 4분할 → 2분할 (월 총액 + 검토 대상 칩), helper 숨김
- `RecentInsights`: 컴팩트일 때 actionItem 한 줄 line-clamp, 카드 padding 축소

검증: 컴팩트 모드 토글 시 Dashboard 한 화면에 핵심 정보가 압축돼 보임

### 단계 6 — 도메인 View / Card 컴팩트 적용

대상: Wants / Subscriptions / Insights / Regret / Notes / Calculator

- 각 View가 `useCompactMode()` 호출
- grid를 1열로 폴드, 카드 padding 축소
- 카드 내부에서 line-clamp 적용 (reason, body, keySentence 등)
- 보조 칩(예: tags 일부) 숨김
- Calculator는 입력 4개를 세로 정렬, 결과 카드 2분할

검증: 각 도메인에서 컴팩트 모드 진입 시 한 손 스크롤 가능, 텍스트 잘리지 않음

### 단계 7 — Modal 풀스크린화

대상: QuickAddModal / AddNoteModal / AddWantModal / AddSubscriptionModal / AddInsightModal / AddRegretItemModal

- 각 Modal이 `useCompactMode()` 호출
- 컨테이너 클래스 분기:
  - 일반: `max-w-2xl max-h-[90vh]`
  - 컴팩트: `w-full h-[100dvh] max-w-full rounded-none p-4`
- 입력 그리드 `sm:grid-cols-2` → 컴팩트에서는 강제로 1열
- 헤더/푸터 sticky 배치 검토 (긴 폼에서 상단 X 버튼, 하단 저장 버튼 항상 보이도록)

검증: 모바일에서 모달 열어도 가로/세로 스크롤 안전, 입력 후 키보드 가림 없음

### 단계 8 — 최종 검증

```bash
npx tsc --noEmit
npm run build
npm run dev
```

브라우저 시나리오는 §7.

## 6. 예상 위험도

- 낮음:
  - Context 신설, Header 버튼 교체
  - localStorage 영구 저장 (테마 모드와 동일 패턴)
- 중간:
  - 모든 도메인 View / Card / Modal에 컴팩트 분기 삽입 → 누락 시 시각 불일치
  - 하단 탭바 7개 항목이 좁은 화면(360px)에서 깨질 가능성 → 라벨 축소 또는 아이콘만 표시 fallback 필요
  - 모달 풀스크린화 시 입력 도중 키보드가 저장 버튼을 가리는 케이스 → sticky 푸터로 완화
- 중간:
  - 컴팩트 모드 토글 직후 layout shift / 스크롤 위치 점프 → 토글 핸들러에서 의도된 동작인지 확인
  - Sidebar ↔ BottomTabBar 전환 시 ARIA / 키보드 네비게이션 흐름 유지
- 높음: 없음

## 7. 확인 방법

실행 명령어:
```bash
npx tsc --noEmit
npm run build
npm run dev
```

브라우저 확인 (http://localhost:3000):
- Header 우측 알림 자리에 토글 아이콘 표시, 클릭 시 즉시 간단뷰 진입
- 간단뷰에서 Sidebar 사라지고 하단 탭바 등장, 7개 View 모두 탭바로 접근 가능
- 일반뷰 ↔ 간단뷰 토글 후 새로고침 → 마지막 상태 유지
- Dashboard 5개 카드/위젯이 간단뷰에서 helper text / 보조 위젯 숨겨진 형태로 표시
- 5개 도메인 View가 단일 컬럼 + 카드 압축으로 보임
- 6개 Add Modal이 간단뷰에서 풀스크린 형태로 표시, 저장 버튼 접근 가능
- 빠른 추가 → 카테고리 선택 → 도메인 Modal 풀스크린 → 저장 → 즉시 반영
- DevTools responsive 360px / 414px / 768px / 1024px / 1440px에서 깨짐 없음
- DevTools Application → Local Storage → `aiop-compact-mode` 값이 `true`/`false`로 저장됨

수동 체크리스트:
```txt
[ ] 알림 버튼 자리에 토글 아이콘 표시
[ ] 토글 클릭 시 즉시 전환, 새로고침 후 유지
[ ] Sidebar → 하단 탭바 전환 정상
[ ] 하단 탭바 7개 View 모두 접근 가능
[ ] iOS 노치/홈 인디케이터 안전 영역 보정
[ ] Dashboard helper text 숨김
[ ] Dashboard 보조 위젯(Decision note, actionItem 등) 숨김
[ ] 5개 도메인 View 단일 컬럼 / 카드 압축
[ ] 6개 Add Modal 풀스크린 / 저장 버튼 접근 가능
[ ] 빠른 추가 동선 정상
[ ] 360px 화면 깨짐 없음
[ ] 데스크탑에서도 토글 가능
[ ] tsc / build 통과
```

## 8. 구현 전 확인 질문

다음 항목은 답변에 따라 단계 3, 4의 세부 작업이 달라집니다. 한 번에 답해 주시면 단계대로 진행합니다.

1. **토글 아이콘 선택**:
   - 옵션 A: `Smartphone` (모바일 폰 모양) — 가장 직관적
   - 옵션 B: `Rows3` (가로 줄) — "간단하게 정리" 의미
   - 옵션 C: `Maximize2` ↔ `Minimize2` — 일반/간단을 동일 위치에서 토글
   - 옵션 D: 기타 (lucide 아이콘 이름 지정)

2. **하단 탭바 항목 수**:
   - 옵션 A: ViewKey 7개 모두 표시 (작은 아이콘 + 라벨, 360px에서도 가능하도록 라벨 텍스트 축소)
   - 옵션 B: 핵심 5개(Dashboard / Wants / Subscriptions / Insights / Notes) + "더보기" → Calculator / Regret을 시트로 분리
   - 옵션 C: 핵심 5개 + 중앙에 빠른 추가 FAB(Floating Action Button)

3. **간단뷰 컨테이너 폭**:
   - 옵션 A: 화면 전체 너비 사용 (데스크탑에서 컴팩트 켜면 횡으로 길게 보임)
   - 옵션 B: 데스크탑에서도 `max-w-md` 정도로 중앙 정렬 (모바일 폭 모사)
   - 옵션 C: 화면이 좁으면 전체, 넓으면 `max-w-md` (자동 분기 — 단 "순수 수동 토글" 원칙과는 살짝 어긋남)

4. **간단뷰에서 Header 검색바**:
   - 옵션 A: 숨김 (검색바는 placeholder라 동작 안 함)
   - 옵션 B: 아이콘만 남기고 펼치는 형태로 유지
   - 옵션 C: 그대로 표시 (좁은 화면에서 폭 차지)

위 4개에 답해 주시고 `진행해` / `구현해` / `그대로 해줘` 중 하나로 명령하면 §5 순서대로 단계 1부터 시작합니다.

## 부록 — v1.1 이후 후보

- **v1.2 검토 항목**:
  - 토글 직후 스크롤 위치 보존 / 부드러운 전환 애니메이션
  - 간단뷰에서 스와이프 제스처로 탭 전환
  - PWA 매니페스트 + 홈 화면 추가 (모바일 단독 사용 시나리오)
  - 빠른 추가 FAB(Floating Action Button)으로 항상 보이도록
  - 모달이 풀스크린일 때 키보드 sticky 푸터 정밀화
- **백엔드 도입 시 추가 고려**:
  - 컴팩트 모드 설정도 서버 동기화할지(계정별 UI 선호) 또는 디바이스 한정으로 유지할지
