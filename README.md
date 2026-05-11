# AIOP

**All-In-One Page / Personal Operating Dashboard**

AIOP는 한 페이지 안에서 사고 싶은 것, 자산 기준 구매 판단, 월 구독, 책/영상 인사이트, 빠른 메모, "그때 살걸" 기록까지 한꺼번에 관리하기 위한 개인용 운영 대시보드입니다.

> 이 페이지 하나만 켜두면 내가 필요한 기능이 모두 들어있다.

대중 사용자가 아니라 **나 자신이 매일 켜두고 쓰는 화면**을 첫 목표로 만든 프로젝트입니다.

---

## 현재 상태

현재 버전은 **frontend-only personal MVP (v0.9 완료)** 입니다.

- 백엔드는 아직 구현하지 않았습니다.
- 인증 기능은 없습니다.
- 데이터베이스는 연결하지 않았습니다.
- 외부 API와 AI API는 사용하지 않습니다.
- 모든 데이터는 브라우저 `localStorage`에 저장됩니다.
- 7개 주요 화면 모두 최소 CRUD가 동작하며, Dashboard는 다른 화면이 쓰는 localStorage 데이터를 그대로 읽어 갱신됩니다.

UI 일관성 정리(v1.0)와 README 최종 점검은 진행 중입니다.

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

### Dashboard (v0.9)

5개 카드와 4개 위젯이 다른 화면의 localStorage 데이터를 읽어 실시간으로 갱신됩니다.

- Summary Cards: Wants 개수 / 월 구독비 / Target Spend / Recent Insights / Notes Inbox
- Want Preview: 최근 추가한 Want 5개
- Asset Snapshot: 최신 Want 기준으로 `Required Capital` 동적 계산
- Subscription Summary: 월 총액 + keep / review / cancel 카운트 + 해지 후보 칩
- Recent Insights: 최근 인사이트 3개
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
- 삭제 / status 변경 (`inbox` → `processed` → `archived`)
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

- 사이드바에서 테마 전환 가능
- 선택한 모드는 다음 방문 시에도 유지됩니다.

---

## 앞으로 구현될 기능

### v1.0 — Frontend-only MVP 마무리

- UI 품질 정리: 카드 / 버튼 / input / modal 일관성, empty state 문구, 숫자 시각적 우선순위, overflow 및 line-clamp
- 모바일 환경에서 깨짐 방지
- 영문으로 임시 정리된 Dashboard 문구의 한글 복구
- ESLint 설정 정리
- README 최종 업데이트

### v1.1+ 검토 항목 (확정 아님)

- Context 또는 공용 store 도입으로 같은 탭 내 실시간 동기화
- `storage` 이벤트 기반 탭 간 동기화
- localStorage item 단위 schema guard
- 데이터 export / import (JSON)

### 백엔드 전환 기준 (그 전까지 미진행)

다음 조건이 충족되면 Supabase 등 백엔드를 검토합니다.

- localStorage만으로 부족함이 명확해졌을 때
- 모바일 앱 연동 필요성이 생겼을 때
- 데이터 백업이 필요해졌을 때
- 로그인 기반 사용자 분리가 필요해졌을 때

그 전까지 다음은 **도입하지 않습니다**:

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
- v1.0 — UI 품질 정리 + README 최종화 (진행 예정)

상세 구현 순서와 단계별 작업 지시는 [`AGENTS.md`](./AGENTS.md)를 참고하세요.
