# AIOP

**All-In-One Page / 개인 운영 대시보드**

AIOP는 한 페이지 안에서 사고 싶은 것, 자산 기준 구매 판단, 월 구독, 책/영상 인사이트, 빠른 메모, "그때 살걸" 기록, Todo, K.P.T 회고까지 한꺼번에 관리하기 위한 개인용 운영 대시보드입니다.

> 이 페이지 하나만 켜두면 내가 필요한 기능이 모두 들어있다.

대중 사용자가 아니라 **나 자신이 매일 켜두고 쓰는 화면**을 첫 목표로 만든 프로젝트입니다.

---

## 현재 상태

현재 버전은 **frontend-only personal MVP** 입니다.

- 백엔드, 인증, 데이터베이스, 외부 API, AI API는 사용하지 않습니다.
- 모든 사용자 데이터는 브라우저 `localStorage`에 저장됩니다.
- 9개 주요 화면(Dashboard / Wants / Calculator / Subscriptions / Insights / Notes / Regret / Todo / K.P.T 회고) + 주간 회고 롤업(`/retros/weekly`) — 총 10개 라우트가 동작합니다.
- Dashboard는 다른 화면이 쓰는 localStorage 데이터를 직접 읽어 갱신됩니다.
- Header의 **빠른 추가** 버튼으로 구매 목표 / 구독 / 인사이트 / 후회 기록 / 메모를 한 곳에서 추가합니다.
- **레이아웃 커스터마이징**: Dashboard 위젯과 Summary 카드의 위치 / 크기 / 표시 여부를 직접 조정하고 `localStorage`에 저장합니다.
- **컴팩트뷰**: 데스크탑에서도 모바일 레이아웃(하단 탭바, 1열 그리드)을 강제로 켤 수 있습니다.
- **라이트 / 다크 모드** 토글을 지원합니다.

---

## 주요 컨셉

AIOP는 가계부도, 투자 앱도, 메모 앱도 아닙니다.
**개인이 매일 보는 한 페이지짜리 운영 대시보드**를 목표로 합니다.

- 사고 싶다는 충동을 기록하고, 자산 수익률 기준으로 "이걸 사려면 얼마가 필요한가"를 즉시 계산합니다.
- 구독은 keep / review / cancel 상태로 분류해 매달 무엇이 빠져나가는지 한눈에 봅니다.
- 책 · 영상 · 아티클에서 얻은 인사이트는 행동 항목과 함께 보관합니다.
- 빠른 생각은 Inbox로 던져 두고, 나중에 Wants / Insights / Subscriptions로 정리합니다.
- "그때 살걸" 기록을 남겨 자기 의사결정 패턴을 되돌아봅니다.
- 오늘 처리할 일은 Todo로 가볍게 끊어둡니다.
- 하루의 K(Keep) / P(Problem) / T(Try)를 적고, Try는 Todo로 자동 연결해 다음 행동까지 이어둡니다.

---

## 구현된 기능

### Dashboard

`react-grid-layout` 기반 그리드 위에 6개 위젯과 1개 고정 헤로(Hero)가 배치됩니다.

- **Hero**: 고정 인사 카드 (편집 불가).
- **Summary Cards**: 구매 목표 / 월 구독비 / 계획 지출 합계 / 최근 인사이트 / 수집함 / Todo 6개 상세 카드. `@dnd-kit`으로 카드 순서를 직접 끌어 옮길 수 있습니다.
- **최근 구매 목표** (Wants Preview): 최근 추가한 구매 목표 5개를 카테고리 / 점수와 함께 표시.
- **자산 기준 구매 판단** (Asset Snapshot): 최신 구매 목표 기준으로 필요 자본을 동적으로 계산.
- **구독 요약** (Subscription Summary): 월 총액 + keep / review / cancel 카운트 + 검토 대상 칩.
- **최근 인사이트** (Recent Insights): 최근 인사이트 3개 + 행동 항목.
- **Todo 요약** (Todo Summary): 진행 전 / 진행 중 / 완료 카운트 + 진행 중 항목 미리보기.

모든 위젯이 `localStorage` 키 (`aiop:wants`, `aiop:subscriptions`, `aiop:insights`, `aiop:notes`, `aiop:todos`) 를 직접 읽어 실시간 반영하며, 데이터가 없으면 빈 상태 안내를 표시합니다.

### Dashboard 레이아웃 커스터마이징 (v1.1 ~ v1.2)

- Header / Sidebar의 **설정** 버튼 → "레이아웃 편집"으로 편집 모드 진입.
- 데스크탑: 12-col 그리드, 위젯 위치 / 크기 자유 드래그 + 리사이즈 (`se` 핸들).
- 모바일 / 컴팩트뷰: 1열 강제, 높이만 조절.
- 위젯 및 Summary 카드 단위 표시 / 숨김 토글.
- 편집 모드 변경 사항은 draft로 보관 → **저장** 시 영속화, **저장 안 하고 종료** 시 폐기.
- **레이아웃 초기화** 로 기본 배치 복원.
- 저장 키: `aiop:layout`.

### Wants (구매 목표)

- 모달로 추가 / 카드 삭제.
- 입력값 검증 (이름 필수, 가격 > 0, 목표 기간 ≥ 1).
- `requiredCapital`, `monthlyCashflowNeeded`, `targetDate` 자동 계산.
- 우선순위 (low / medium / high) → 판단 점수 (55 / 70 / 85) 자동 환산.
- 저장 키: `aiop:wants`.

### Asset Calculator (자산 구매 계산기)

- 입력값(구매 가격 / 목표 기간 / 예상 수익률 / 월 투자 가능액) 변경 시 결과 실시간 갱신.
- `필요 자산`, `월 필요 현금흐름`, `구매까지 걸리는 기간`, `구매 판단` 표시.
- 구매 판단 로직:
  - 입력값 0 / 음수 → "입력값이 더 필요합니다"
  - 필요 자산 ≥ 1억 → "신중한 계획이 필요합니다"
  - 구매까지 ≤ 3개월 → "곧 구매 가능합니다"
  - 구매까지 ≤ 12개월 → "목표로 설정하세요"
  - 그 외 → "보류"

### Subscriptions (구독 관리)

- 구독 서비스 추가 / 삭제 / 상태(`keep` / `review` / `cancel`) 변경.
- 월 총 구독비, 상태별 카운트 자동 갱신.
- 가치 점수 0 ~ 100 자동 클램프.
- 저장 키: `aiop:subscriptions`.

### Notes / Inbox

- textarea에 빠른 메모 입력 → 상단에 추가.
- 4종 quick tag (구매목표 / 인사이트 / 구독 / 나중에) 다중 선택.
- 카드 삭제.
- 저장 키: `aiop:notes`.

### Book Insights (인사이트 보관함)

- 책 / 영상 / 글 / 생각 4종 sourceType.
- 제목, 핵심 인사이트, 행동 항목, 태그, 관련 목표 입력.
- 추가 / 삭제.
- 저장 키: `aiop:insights`.

### Regret Tracker (그때 살걸 기록장)

- 항목 추가 / 삭제.
- `watchedPrice`, `currentPrice`, `quantity` 입력 → `resultPercent`, `profitAmount` 자동 계산.
- 상승 / 하락에 따른 색상 구분.
- 저장 키: `aiop:regret-items`.

### Todo

- 빠른 입력 (Enter 또는 버튼) → 우선순위(low / medium / high) 선택 → 상태 사이클 (todo → doing → done).
- 진행 전 / 진행 중 / 완료 카운트 자동 갱신.
- 저장 키: `aiop:todos`.

### K.P.T 회고 (Retros)

- 라우트: `/retros` (오늘 회고 + 과거 회고 목록), `/retros/weekly` (주간 롤업).
- Keep / Problem / Try 세 칸에 항목을 추가 / 삭제하고, Try는 체크박스로 완료 토글합니다.
- **Try ↔ Todo 양방향 연동**: Try 추가 시 옵션으로 Todo를 동시에 생성하고, Todo가 `done`이 되면 Try도 자동 체크됩니다 (`syncTryWithTodos`).
- **어제 미완료 Try 이월**: 마지막으로 작성한 회고의 미완료 Try를 오늘 회고에 새 항목으로 옮길 수 있습니다 (`carryOverTryItems`).
- **연속 작성 Streak**: 연속으로 회고를 작성한 일수를 자동 계산합니다 (`calculateStreak`).
- **주간 롤업**: 월~일 7일치 회고를 모아 작성률, Try 완료율, Problem 키워드 Top 3를 보여줍니다 (`buildWeeklyRollup`).
- 과거 회고는 날짜 선택으로 편집 / 삭제 가능.
- 저장 키: `aiop:retros`.

- Header의 `Smartphone` 버튼으로 토글.
- 활성화 시 사이드바가 사라지고 하단 탭바(`BottomTabBar`)가 노출됩니다. 본문 최대 폭이 `max-w-md`로 좁아져 데스크탑에서도 모바일 레이아웃을 확인할 수 있습니다.
- 모든 모달이 풀스크린(`100dvh`)으로 표시됩니다.
- 저장 키: `aiop-compact-mode`.

### 라이트 / 다크 모드

- Header의 해 / 달 아이콘으로 토글.
- 선택한 모드는 다음 방문 시에도 유지됩니다 (`<html data-theme>` 활용).
- 저장 키: `aiop-theme-mode`.

### 빠른 추가 (QuickAdd)

- Header의 `빠른 추가` 버튼으로 QuickAddModal 오픈.
- 구매 목표 / 구독 / 인사이트 / 후회 기록 / 메모 / Todo / K.P.T 회고 — **총 7개 카테고리**.
- 선택한 카테고리의 기존 Add Modal을 그대로 사용 → 저장 시 localStorage에 prepend 되고 해당 App Router 라우트로 이동합니다.
- 회고 카테고리는 `AppShell.handleAddedRetro`가 오늘 날짜의 회고를 찾아 해당 섹션(Keep / Problem / Try)에 항목을 upsert 합니다 (없으면 새 회고 생성).

---

## 앞으로 구현될 기능

다음 순서를 따릅니다. 앞 단계가 끝나야 다음 단계로 진행합니다.

### v1.4 후보

상세 우선순위는 [`.agent-notes/aiop-status.md`](./.agent-notes/aiop-status.md) §11 참고.

- 회고 항목 인라인 텍스트 편집 (현재는 추가 / 삭제만 가능).
- K.P.T 회고 텍스트 입력칸 확장 (긴 글 작성 대응).
- Wants 카테고리 필터 실제 동작 연결 (현재 시각만 존재).
- Notes status 변경 UI (`inbox / processed / archived`).
- 대시보드 위젯 커스터마이징 — 위젯 삭제 / 추가 기능.
- Sidebar / Header / BottomTabBar에 노출되는 Regret 라벨 정상화.
- 컴팩트뷰에서 위젯 순서 변경 UX 확정 (위/아래 버튼 props는 정의돼 있으나 미연결).
- 모달 공통 컴포넌트 추상화 검토.

### v2.0 — Supabase 백엔드 + 인증 + AI API 라우트 (한 묶음)

- Supabase Postgres + Auth (Google OAuth).
- 5개 도메인 테이블 + RLS 정책.
- 클라이언트 localStorage → Supabase 데이터 흐름 교체.
- AI API 호출용 Next.js Route Handler (OpenAI / Claude 등의 키는 서버에서만 사용).
- Vercel 배포.

### v2.1+ — AI 기능 4종

v2.0 인프라가 자리 잡은 뒤 다음 순서로 도입합니다.

1. **입력 자동분류** — 빠른 추가 텍스트를 Wants / Insights / Subscriptions / Notes 중 어디에 넣을지 추천.
2. **오늘의 할일 추천** — 최근 Wants / Insights / 메모 / 구매 목표 기반 추천.
3. **AI 추천 투자종목** — 관심 분야 / 자산 비중 기반 (참고용).
4. **AI 추천 뉴스기사** — 관심 키워드 기반 큐레이션.

각 기능은 별도 단계로 진행하며, 매 단계마다 비용 / 응답 품질 / UX 검증 후 다음으로 넘어갑니다.

### v2.0 이전까지 도입하지 않습니다

- Supabase / PostgreSQL / 임의 DB.
- 로그인 / 회원가입 / OAuth.
- OpenAI API 등 AI API.
- 실제 금융 / 주식 API. (환율 API 는 v2.0 에 포함)
- 결제, 권한 시스템, 서버 CRUD.

---

## 기술 스택

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5.7** (strict)
- **Tailwind CSS 3.4** (`theme-dark` / `theme-light` data attribute)
- **lucide-react** (아이콘)
- **react-grid-layout 2.2.3** (Dashboard 위젯 드래그 / 리사이즈 — `Responsive` + `useContainerWidth` + `dragConfig` / `resizeConfig` API)
- **@dnd-kit/core + @dnd-kit/sortable** (Summary 카드 reorder)
- **데이터 저장**: 브라우저 `localStorage`

---

## 데이터 저장 방식

모든 사용자 데이터는 브라우저 `localStorage`에 저장되며, 서버로 전송되지 않습니다.

| Key | 저장 내용 |
| --- | --- |
| `aiop:wants` | 사고 싶은 항목 리스트 |
| `aiop:subscriptions` | 구독 서비스 리스트 |
| `aiop:insights` | 책 / 영상 / 아티클 인사이트 |
| `aiop:notes` | Quick Capture 메모 |
| `aiop:regret-items` | "그때 살걸" 기록 |
| `aiop:todos` | Todo 항목 |
| `aiop:retros` | K.P.T 회고 (날짜별 Keep / Problem / Try) |
| `aiop:layout` | Dashboard 위젯 배치 / 표시 여부 |
| `aiop:hero-message` | Hero 위젯 제목 문구 |
| `aiop-compact-mode` | 컴팩트뷰 토글 (`true` / `false`) |
| `aiop-theme-mode` | 라이트 / 다크 테마 (`light` / `dark`) |

`aiop:*` 도메인 데이터는 비어 있거나 손상되면 mock data로 자동 fallback됩니다. 모든 도메인 데이터는 `src/lib/storageNormalizers.ts`의 normalizer를 통과한 결과만 저장됩니다. `aiop:layout`은 별도 schema 정규화 로직(`useDashboardLayout`)을 거칩니다. 11개 키 전체는 설정 메뉴의 "데이터 내보내기 / 가져오기"로 JSON 1개 파일로 백업 / 복원할 수 있습니다 (`src/lib/dataPortability.ts`). 초기화하고 싶으면 브라우저 DevTools → Application → Local Storage에서 해당 키를 삭제하세요.

---

## 실행 방법

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 프로덕션 빌드 (타입 체크 포함)
npm run start        # 프로덕션 서버
npm run lint         # ESLint
npx tsc --noEmit     # 타입 체크만
```

---

## 프로젝트 구조

```text
src/
├── app/
│   ├── calculator/page.tsx
│   ├── globals.css
│   ├── insights/page.tsx
│   ├── layout.tsx                      # AppShell로 감싸는 root layout
│   ├── notes/page.tsx
│   ├── page.tsx                        # Dashboard 라우트
│   ├── regret/page.tsx
│   ├── retros/
│   │   ├── page.tsx                    # 오늘 회고 + 과거 회고
│   │   └── weekly/page.tsx             # 주간 회고 롤업
│   ├── subscriptions/page.tsx
│   ├── todos/page.tsx
│   └── wants/page.tsx
├── components/
│   ├── calculator/
│   │   └── AssetCalculatorView.tsx
│   ├── dashboard/
│   │   ├── AssetSnapshot.tsx
│   │   ├── HeroWidget.tsx
│   │   ├── RecentInsights.tsx
│   │   ├── SubscriptionSummary.tsx
│   │   ├── SummaryCards.tsx            # dnd-kit 기반 카드 reorder + visibility
│   │   ├── TodoSummary.tsx
│   │   └── WantPreview.tsx
│   ├── inputs/
│   │   └── MoneyInputField.tsx         # KRW 원/천/만/억 단위 버튼 + USD 입력 공용
│   ├── insights/
│   │   ├── AddInsightModal.tsx
│   │   ├── BookInsightsView.tsx
│   │   └── InsightCard.tsx
│   ├── layout/
│   │   ├── AppShell.tsx                # 테마 / 컴팩트 / 레이아웃 / QuickAdd Provider wiring
│   │   ├── BottomTabBar.tsx            # 컴팩트뷰 전용 하단 탭
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── UpdateNoticeModal.tsx       # 업데이트 안내 모달
│   │   ├── navItems.ts
│   │   ├── grid/
│   │   │   ├── DashboardGrid.tsx       # react-grid-layout Responsive 래퍼
│   │   │   ├── WidgetFrame.tsx         # 편집 모드 외곽선 + 드래그 핸들
│   │   │   └── defaultLayout.ts        # 기본 widget / summary card 배치
│   │   └── settings/
│   │       ├── HeaderSettingsButton.tsx
│   │       ├── SettingsMenu.tsx        # 편집 / 저장 / 초기화 / visibility / export·import
│   │       └── SidebarSettingsButton.tsx
│   ├── notes/
│   │   ├── AddNoteModal.tsx
│   │   └── NotesInboxView.tsx
│   ├── quick-add/
│   │   └── QuickAddModal.tsx           # 7개 카테고리 진입점
│   ├── regret/
│   │   ├── AddRegretItemModal.tsx
│   │   ├── RegretCard.tsx
│   │   └── RegretTrackerView.tsx
│   ├── retros/
│   │   ├── AddRetroModal.tsx           # QuickAdd 진입 시 K/P/T 섹션 + Todo 동시생성 옵션
│   │   ├── RetroView.tsx               # 오늘 회고 + 과거 회고 + Streak + 이월
│   │   └── WeeklyRollupView.tsx        # 7일 작성률 + Try 완료율 + Problem 키워드
│   ├── subscriptions/
│   │   ├── AddSubscriptionModal.tsx
│   │   ├── SubscriptionCard.tsx
│   │   └── SubscriptionsView.tsx
│   ├── todos/
│   │   ├── AddTodoModal.tsx            # QuickAdd 진입 시 Todo 추가
│   │   └── TodoView.tsx
│   └── wants/
│       ├── AddWantModal.tsx
│       ├── WantCard.tsx
│       └── WantsView.tsx
├── contexts/
│   ├── CompactModeContext.tsx          # 간단뷰 토글
│   ├── LayoutContext.tsx               # 편집 모드 + draft layout + visibility
│   └── SearchContext.tsx               # 통합 검색
├── data/
│   └── mockData.ts                     # 초기 / fallback mock data
├── hooks/
│   ├── useDashboardLayout.ts           # layout 정규화 + localStorage 영속화
│   ├── useEscapeKey.ts
│   └── useLocalStorage.ts              # SSR-safe 제네릭 훅 (same-tab event 처리 포함)
├── lib/
│   ├── calculations.ts                 # Required Capital / Months to Buy / Regret %
│   ├── dataPortability.ts              # 11개 localStorage 키 export / import (JSON v1)
│   ├── formatters.ts                   # KRW / USD / Compact / Percent / Date
│   ├── labels.ts                       # enum → 한국어 라벨
│   ├── retros.ts                       # K.P.T 헬퍼 (Streak, 이월, 주간 롤업, Try↔Todo)
│   ├── storage.ts                      # localStorage prepend helper
│   └── storageNormalizers.ts           # 도메인별 schema guard
└── types/
    ├── index.ts                        # 도메인 타입 (WantItem, Subscription, Insight, Note, RegretItem, TodoItem, RetroItem, KptRetro, ViewKey)
    └── layout.ts                       # WidgetId, SummaryCardId, DashboardLayout
```

---

## 로드맵 요약

- v0.1 — Frontend Layout MVP (완료)
- v0.2 — Asset Calculator 실제 동작 (완료)
- v0.3 — Wants 로컬 CRUD (완료)
- v0.4 — localStorage 저장 + `useLocalStorage` 훅 (완료)
- v0.5 — Subscriptions 로컬 CRUD (완료)
- v0.6 — Notes / Inbox 로컬 CRUD (완료)
- v0.7 — Book Insights 로컬 CRUD (완료)
- v0.8 — Regret Tracker 로컬 계산 (완료)
- v0.9 — Dashboard 데이터 통합 (완료)
- v1.0 — UI 품질 정리 + 빠른 추가 + 컴팩트뷰 + Todo + 라이트/다크 (완료)
- v1.1 ~ v1.2 — Dashboard 레이아웃 드래그&드롭 + visibility (완료)
- v1.3 — 데이터 export / import + localStorage schema guard (완료)
- v1.4 후보 — K.P.T 회고 도메인 추가 (완료) + 회고 / 위젯 UX 정리 (진행)
- v2.0 — Supabase 백엔드 + Google OAuth + RSC/Server Actions + 환율 API + AI Route Handler 기반 (예정)
- v2.1+ — AI 기능 4종 (자동분류 → 오늘의 할일 추천 → 투자종목 추천 → 뉴스 추천)

상세 작업 항목과 진행 순서는 [`AGENTS.md`](./AGENTS.md), [`.agent-notes/aiop-status.md`](./.agent-notes/aiop-status.md), [`.agent-notes/aiop-plan.md`](./.agent-notes/aiop-plan.md) 를 참고하세요.
