# AIOP

**All-In-One Page / Personal Operating Dashboard**

AIOP는 한 페이지 안에서 사고 싶은 것, 자산 기준 구매 판단, 월 구독, 책/영상 인사이트, 빠른 메모, "그때 살걸" 기록까지 한꺼번에 관리하기 위한 개인용 운영 대시보드입니다.

> 이 페이지 하나만 켜두면 내가 필요한 기능이 모두 들어있다.

대중 사용자가 아니라 **나 자신이 매일 켜두고 쓰는 화면**을 첫 목표로 만든 프로젝트입니다.

---

## 현재 상태

현재 버전은 **frontend-only personal MVP (v1.0)** 입니다.

- 백엔드는 아직 구현하지 않았습니다.
- 인증 기능은 없습니다.
- 데이터베이스는 연결하지 않았습니다.
- 외부 API와 AI API는 사용하지 않습니다.
- 모든 데이터는 브라우저 `localStorage`에 저장됩니다.
- 7개 주요 화면 모두 최소 CRUD가 동작하며, Dashboard는 다른 화면이 쓰는 localStorage 데이터를 그대로 읽어 갱신됩니다.
- Header의 빠른 추가 버튼으로 구매 목표, 구독, 인사이트, 후회 기록, 메모를 바로 추가할 수 있습니다.
- 카드, 버튼, 입력창, 빈 상태 문구, 긴 텍스트 표시를 v1.0 기준으로 정리했습니다.

---

## 주요 컨셉

AIOP는 가계부도, 투자 앱도, 메모 앱도 아닙니다.
**개인이 매일 보는 한 페이지짜리 운영 대시보드**를 목표로 합니다.

- 사고 싶다는 충동을 기록하고, 자산 수익률 기준으로 "이걸 사려면 얼마가 필요한가"를 즉시 계산합니다.
- 구독은 keep / review / cancel 상태로 분류해 매달 무엇이 빠져나가는지 한눈에 봅니다.
- 책·영상·아티클에서 얻은 인사이트는 행동 항목과 함께 보관합니다.
- 빠른 생각은 Inbox로 던져 두고, 나중에 Wants/Insights/Subscriptions로 정리합니다.
- "그때 살걸" 기록을 남겨 자기 의사결정 패턴을 되돌아봅니다.

---

## 구현된 기능

### Dashboard (v0.9 + v1.0)

5개 카드와 4개 위젯이 다른 화면의 localStorage 데이터를 읽어 실시간으로 갱신됩니다.

- Summary Cards: 구매 목표 / 월 구독비 / 계획 지출 합계 / 최근 인사이트 / 수집함
- 최근 구매 목표: 최근 추가한 구매 목표 5개
- 자산 기준 구매 판단: 최신 구매 목표 기준으로 필요 자본 동적 계산
- 구독 요약: 월 총액 + keep / review / cancel 카운트 + 검토 대상 칩
- 최근 인사이트: 최근 인사이트 3개
- 데이터가 없으면 각 카드/위젯이 빈 상태 안내를 표시합니다.
- localStorage 값이 손상돼도 mock data로 fallback됩니다.

### Wants (v0.3 + v0.4)

- 사고 싶은 항목을 모달로 추가/삭제
- 입력값 검증 (이름 없음, 0원 이하 차단)
- `requiredCapital`, `monthlyCashflowNeeded` 자동 계산
- `aiop:wants` 키로 localStorage 저장, 새로고침 후에도 유지

### Asset Calculator (v0.2)

- 입력값(가격 / 목표 기간 / 예상 배당률 / 월 투자 가능 금액) 변경 시 실시간 계산
- `Required Capital` / `Monthly Cashflow Needed` / `Months to Buy` / `Purchase Decision` 표시
- 0, 음수, 빈 값 입력에도 깨지지 않습니다.

### Subscriptions (v0.5)

- 구독 서비스 추가/삭제 + 상태(`keep` / `review` / `cancel`) 변경
- 월 총 구독비, 상태별 카운트 자동 갱신
- `aiop:subscriptions` 키로 localStorage 저장

### Notes / Inbox (v0.6)

- 빠른 메모를 textarea로 입력해 상단에 추가
- 삭제
- `aiop:notes` 키로 localStorage 저장

### Book Insights (v0.7)

- 책 / 영상 / 아티클 / 생각 4가지 sourceType
- 제목, 핵심 인사이트, 행동 항목(`actionItem`), 태그 입력
- `aiop:insights` 키로 localStorage 저장

### Regret Tracker (v0.8)

- "그때 살걸" 항목 추가/삭제
- `watchedPrice`, `currentPrice`, `quantity` 입력 → `resultPercent`, `profitAmount` 자동 계산
- 상승/하락 색상 구분
- `aiop:regret-items` 키로 localStorage 저장

### 라이트 / 다크 모드 토글

- Header에서 테마 전환 가능
- 선택한 모드는 다음 방문 시에도 유지됩니다.

### 빠른 추가 (v1.0)

- Header의 `빠른 추가` 버튼으로 QuickAddModal을 엽니다.
- 구매 목표 / 구독 / 인사이트 / 후회 기록 / 메모 카테고리를 선택할 수 있습니다.
- 선택한 카테고리의 기존 Add Modal을 그대로 사용합니다.
- 저장 후 해당 화면과 Dashboard 데이터가 localStorage 기준으로 즉시 갱신됩니다.

---

## 앞으로 구현될 기능

다음 순서를 따릅니다. 앞 단계가 끝나야 다음 단계로 진행합니다.

### v1.1 ~ v1.2 — 레이아웃 드래그&드롭 커스터마이징 (프론트 마감)

- Dashboard 위젯의 위치 / 크기를 마우스 드래그로 조정
- 편집 모드 토글 (편집 ↔ 보기)
- 레이아웃 설정값을 localStorage (`aiop:layout`)에 저장
- 모바일은 1열 고정, 데스크탑/태블릿에서만 드래그 활성화
- 컴팩트 모드 / 다크 모드와 충돌 없이 동작
- 상세는 `.agent-notes/aiop-v11-drag-drop-layout.md` 참고

### v1.3 — 데이터 export / import (백엔드 이전 안전망)

- 모든 `aiop:*` localStorage 키를 JSON 1개 파일로 내보내기
- JSON 파일을 업로드해 복원
- v2.0 백엔드 마이그레이션 시 데이터 이관 경로 확보

### v1.x 보조 작업 (필요 시)

- localStorage item 단위 schema guard
- 모달 공통 컴포넌트 추상화
- 모바일 내비게이션 정비
- ESLint 설정을 Next.js 15 방식으로 재정리

### v2.0 — Supabase 백엔드 + 인증 + AI API 라우트 (한 번에)

다음을 한 묶음으로 도입합니다.

- Supabase Postgres + Auth (Google OAuth)
- 5개 도메인 테이블 + RLS 정책
- 클라이언트 localStorage → Supabase 데이터 흐름 교체
- AI API 호출용 Next.js Route Handler (OpenAI / Claude 등의 키는 서버에서만 사용)
- Vercel 배포
- 상세는 `.agent-notes/aiop-v20-backend-plan.md` 참고

### v2.1+ — AI 기능 4종

v2.0 백엔드 인프라가 자리 잡은 뒤 다음 순서로 도입합니다.

1. **입력 자동분류** — 사용자가 빠른 추가로 던진 텍스트를 Wants / Insights / Subscriptions / Notes 중 어디에 들어갈지 추천
2. **오늘의 할일 추천** — 최근 Wants / Insights / 메모 / 구매 목표를 기반으로 오늘 처리할 항목 제안
3. **AI 추천 투자종목** — 사용자가 관심 있는 분야 / 자산 비중 기반 추천 (참고용)
4. **AI 추천 뉴스기사** — 사용자 관심 키워드 기반 큐레이션

각 기능은 별도 단계로 진행하며, 매 단계마다 비용 / 응답 품질 / UX 검증 후 다음으로 넘어갑니다.

### v2.0 이전까지 도입하지 않습니다

- Supabase / PostgreSQL / 임의 DB
- 로그인 / 회원가입 / OAuth
- OpenAI API 등 AI API
- 실제 금융 / 주식 / 환율 API
- 결제, 권한 시스템, 서버 CRUD

---

## 기술 스택

- Next.js 15 (App Router)
- React 19
- TypeScript 5.7
- Tailwind CSS 3.4
- lucide-react (아이콘)
- 데이터 저장: 브라우저 `localStorage`

---

## 데이터 저장 방식

모든 사용자 데이터는 브라우저 `localStorage`에 저장되며, 서버로 전송되지 않습니다.

| Key | 저장 내용 |
|---|---|
| `aiop:wants` | 사고 싶은 항목 리스트 |
| `aiop:subscriptions` | 구독 서비스 리스트 |
| `aiop:insights` | 책 / 영상 / 아티클 인사이트 |
| `aiop:notes` | Quick Capture 메모 |
| `aiop:regret-items` | "그때 살걸" 기록 |
| `aiop-theme-mode` | 라이트 / 다크 테마 설정 |

각 키 값이 비어 있거나 손상되면 mock data로 자동 fallback됩니다. 초기화하고 싶으면 브라우저 DevTools → Application → Local Storage에서 해당 키를 삭제하면 됩니다.

---

## 실행 방법

패키지 설치:

```bash
npm install
```

개발 서버 실행:

```bash
npm run dev
```

기본 주소: [http://localhost:3000](http://localhost:3000)

프로덕션 빌드:

```bash
npm run build
npm run start
```

타입 체크:

```bash
npx tsc --noEmit
```

---

## 프로젝트 구조

```txt
src/
  app/                 Next.js App Router 페이지
  components/
    dashboard/         Dashboard 카드 / 위젯
    wants/             Wants View + Add Modal
    calculator/        Asset Calculator
    subscriptions/     Subscriptions View + Add Modal
    insights/          Book Insights View + Add Modal
    notes/             Notes / Inbox View
    regret/            Regret Tracker View + Add Modal
  data/
    mockData.ts        초기/Fallback mock data
  hooks/
    useLocalStorage.ts SSR-safe localStorage 훅
  lib/
    calculations.ts    Required Capital / Months to Buy 등 계산
    formatters.ts      KRW / USD / Percent / Date 포맷터
    labels.ts          enum → 한글 라벨 매핑
  types/
    index.ts           Want / Subscription / Insight / Note / RegretItem 타입
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
- v1.0 — UI 품질 정리 + README 최종화 (완료)
- v1.1 ~ v1.2 — 레이아웃 드래그&드롭 커스터마이징 (예정)
- v1.3 — 데이터 export / import (예정)
- v2.0 — Supabase 백엔드 + Google OAuth + AI API 라우트 (계획서 작성됨)
- v2.1+ — AI 기능 4종 (자동분류 → 오늘의 할일 추천 → 투자종목 추천 → 뉴스 추천)

상세 구현 순서와 단계별 작업 지시는 [`AGENTS.md`](./AGENTS.md)를 참고하세요.
