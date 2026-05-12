# 작업 계획 — AIOP v1.0 (Frontend-only Personal MVP 마무리)

작성일: 2026-05-11
범위: AGENTS.md Step 14 (UI 품질 정리) + Step 15 (README 업데이트) + v0.9 진행 기록의 후속 TODO
선행 작업: v0.1 ~ v0.9 완료, Header 빠른 추가 기능 구현 완료
대상 디렉토리: `C:/dev/AIOP/src/**`, `README.md`, 루트 설정 파일

## 1. 요구사항 요약

- 최종 목표: 백엔드 없이도 매일 켜두고 실사용 가능한 **frontend-only personal MVP v1.0** 완성
- 사용자가 제공한 요구사항:
  - 현재까지 구현된 기능을 정리해 README에 반영
  - UI 일관성/품질을 마무리해서 "개인 운영 대시보드" 톤 유지
  - 백엔드 도입 직전 단계까지 끌어올림
- 반드시 지켜야 할 조건:
  - 백엔드 / 인증 / DB / 외부 API / AI API 도입 금지 (v1.0 범위 유지)
  - 기존 데이터 흐름 (각 View가 useLocalStorage 직접 호출) 보존
  - 빠른 추가 동선 (QuickAddModal → 도메인 Modal → refreshKey)도 새 톤에 맞춰 정합
  - 디자인 톤 (zinc-900 / emerald-400 / rounded-2xl / shadow-soft) 보존
  - TypeScript 에러 0
- AGENTS.md Step 14 완료 기준 유지:
  - Dashboard가 복잡하지만 정돈되어 보임
  - 가계부처럼 보이지 않음 / 투자앱처럼만 보이지 않음
  - "개인 운영 대시보드" 느낌 유지

## 2. 현재 상황 판단

확인된 정보:
- v0.9 진행 기록(`aiop-v09-progress.md`)에 따라 Dashboard 일부 문구가 한글 인코딩 이슈 회피를 위해 영어로 임시 정리됨 — 복구 대상이 명확하게 존재
- v0.9 후속 TODO: ESLint 설정 결정 / localStorage item 단위 schema guard / storage 이벤트 listener / Dashboard 영문 문구 한글 복구
- 빠른 추가 기능 신설 파일:
  - `src/components/quick-add/QuickAddModal.tsx`
  - `src/components/notes/AddNoteModal.tsx`
  - 관련 수정: `Header.tsx`, `AppShell.tsx`, `app/page.tsx`
- 4개 도메인 Add Modal은 동일한 props 시그니처와 폼 구조(`TextField` / `NumberField` / `SelectField`)를 가지지만, 각 파일에 동일 코드가 중복 정의됨 — 다만 v1.0 범위에서 추상화 도입은 보류(스코프 외)
- 5개 View 모두 `useLocalStorage`로 hydrate, 빈 상태 UI는 v0.9에서 Dashboard에는 추가됐지만 각 도메인 View는 도메인별로 일관성 점검 미실시

부족한 정보:
- ESLint 설정 방향 (Next.js strict 채택 / 최소 룰셋 / ESLint 자체 미사용 중 선택)
- Dashboard 한글 복구 시 정확한 라벨 표기 (예: "Wants" → "구매 목표" / "사고 싶은 항목" 중 어느 쪽)
- 모바일 대응 깊이 (단순 깨짐 방지 vs 본격 반응형 정비)

확실하지 않은 부분:
- QuickAddModal/AddNoteModal 톤이 기존 4개 Add Modal과 미세하게 다를 가능성 → 점검 후 일치 작업 포함
- README "구현된 기능" 섹션의 영문 라벨(Target Spend, Recent Insights 등)도 Dashboard 한글 복구와 동시에 정합 필요

## 3. 작업 범위

### 수정 예상 파일

| 구분 | 파일 | 변경 종류 |
|---|---|---|
| Dashboard 한글화 | `src/components/dashboard/SummaryCards.tsx` | 5개 카드 label, helper 텍스트 한글 복구 |
| Dashboard 한글화 | `src/components/dashboard/WantPreview.tsx` | 제목/서브타이틀/빈 상태 한글 복구 |
| Dashboard 한글화 | `src/components/dashboard/AssetSnapshot.tsx` | 제목/서브타이틀/Decision note 한글 복구 |
| Dashboard 한글화 | `src/components/dashboard/SubscriptionSummary.tsx` | 제목/서브타이틀/카드 라벨/빈 상태 한글 복구 |
| Dashboard 한글화 | `src/components/dashboard/RecentInsights.tsx` | 제목/서브타이틀/빈 상태 한글 복구 |
| UI 일관성 | `src/components/wants/WantsView.tsx`, `WantCard.tsx`, `AddWantModal.tsx` | empty state 점검, overflow / line-clamp, 모바일 점검 |
| UI 일관성 | `src/components/subscriptions/*` | 동일 점검 |
| UI 일관성 | `src/components/insights/*` | 동일 점검 |
| UI 일관성 | `src/components/regret/*` | 동일 점검 |
| UI 일관성 | `src/components/notes/NotesInboxView.tsx`, `AddNoteModal.tsx` | 동일 점검 + QuickAdd 동선 톤 일관성 |
| UI 일관성 | `src/components/quick-add/QuickAddModal.tsx` | 기존 4개 Add Modal과 톤 일치 점검 |
| UI 일관성 | `src/components/calculator/AssetCalculatorView.tsx` | 입력/결과 카드 일관성, 모바일 |
| UI 일관성 | `src/components/layout/Header.tsx`, `Sidebar.tsx`, `AppShell.tsx` | 모바일 메뉴/검색바/빠른추가 버튼 너비 점검 |
| 글로벌 | `src/app/globals.css`, `tailwind.config.ts` | 필요 시 공통 토큰 / 유틸리티 보강 (예: `line-clamp`, `thin-scrollbar`) |
| 문서 | `README.md` | "구현된 기능" 라벨 한글화, 빠른 추가 섹션 추가, v1.0 완료 상태 반영 |
| 설정 | `.eslintrc.json` 또는 `eslint.config.mjs` (도입 시) | ESLint 설정 결정에 따름 |

### 추가될 기능

- 모든 도메인 View의 빈 상태 / 에러 메시지 일관성
- 모바일(≤ 640px)에서 주요 화면이 깨지지 않는 수준의 반응형
- 긴 텍스트 line-clamp 적용 (메모, 인사이트 요약 등)
- README에 v0.9 + 빠른 추가까지 정확히 반영, 영문으로 남아 있던 라벨 통일

### 수정하지 않을 범위

- 5개 도메인 데이터 모델 / localStorage 키 / 계산 로직
- `useLocalStorage` 훅 (storage 이벤트 listener는 v1.1+로 미룸)
- 백엔드 / 인증 / 외부 API / AI API
- Add Modal 4종의 폼 구조 / 검증 로직 (시각적 일관성만 점검)
- Context / 공용 store 도입 (v1.1+에서 검토)
- 다국어 (i18n) 시스템 도입

## 4. 구현 방향

선택한 방식:
- **단계별 정리**: 한글 복구 → 도메인별 UI 점검 → 글로벌 토큰 정리 → 모바일/overflow → ESLint 결정 → README → 검증 순으로 진행
- **시각적 점검은 도메인 단위로 일괄 진행**: 한 도메인 안의 View / Card / Add Modal을 함께 보면서 카드 padding, 버튼 변형, input 톤을 맞춤
- **추상화 도입은 미룸**: Add Modal 중복 컴포넌트(`TextField` 등)는 v1.0 범위에서 통합하지 않음. 시각적 일관성만 보장

선택 이유:
- v1.0의 핵심 가치는 "써볼 수 있는 정돈된 화면"이지 코드 리팩토링이 아님
- 추상화는 백엔드 도입 시 데이터 fetching 추상화와 함께 결정하는 게 자연스러움
- 단계별로 끊어야 검증 비용이 작아짐 (한 단계 끝낼 때마다 tsc / dev 확인)

대안:
- **방법 A: 단계별 정리 (선택)**
  - 장점: 위험 분산, 단계별 검증, 검토 가능한 작은 변경
  - 단점: 일부 영역에서 중복 작업 가능 (글로벌 토큰 정의 후 개별 파일에서 다시 적용)
- **방법 B: 디자인 시스템 도입 (Button, Card, Modal, Input 공통 컴포넌트화)**
  - 장점: 진짜 일관성 보장, 향후 확장 쉬움
  - 단점: 변경 표면 매우 큼, v1.0 범위 초과, 시각 회귀 위험
- **방법 C: 최소 한글 복구 + README만**
  - 장점: 가장 빠름
  - 단점: AGENTS.md Step 14 체크리스트 미충족, v1.0 "정돈된 느낌" 달성 못함

## 5. 작업 순서

### 단계 1 — Dashboard 한글 문구 복구

대상: `src/components/dashboard/*` 5개

복구 매핑 (예시, 단계 8 질문 답변에 따라 확정):
- `"Wants"` → `"구매 목표"` (또는 `"사고 싶은 항목"`)
- `"Monthly subscriptions"` → `"월 구독비"`
- `"Target spend"` → `"계획 지출 합계"` (또는 `"구매 목표 총액"`)
- `"Recent insights"` → `"최근 인사이트"`
- `"Notes Inbox"` → `"수집함"` (또는 `"노트 수집함"`)
- `"Purchase Goal Preview"` → `"최근 구매 목표"`
- `"Asset Purchase Snapshot"` → `"자산 구매 스냅샷"`
- `"Subscription Summary"` → `"구독 요약"`
- `"Recent Insights"` → `"최근 인사이트"`
- 빈 상태 문구도 한국어로 통일

검증: tsc, dev에서 Dashboard 시각 확인. 인코딩 깨짐 재발 없도록 UTF-8 BOM 없는 저장 확인.

### 단계 2 — 도메인 View / Card / Modal 시각 일관성 점검

순서: Wants → Subscriptions → Insights → Regret → Notes → Calculator

각 도메인에서 점검 항목:
- 카드 border / radius / padding: `border border-zinc-800 / rounded-2xl / p-5 (또는 p-4)` 통일
- 버튼: 주요 버튼 `bg-emerald-400 text-zinc-950 rounded-2xl px-4 h-11`, 보조 버튼 `border-zinc-800 text-zinc-300 rounded-2xl`
- input / select / textarea: `bg-zinc-950/70 border-zinc-800 rounded-2xl p-4`
- empty state: 동일한 문구 톤 (`"~이 아직 없습니다."` 또는 `"등록된 ~이 없습니다."`)
- 숫자 시각적 우선순위: 큰 수 `text-2xl font-semibold text-zinc-50`, 보조 `text-sm text-zinc-500`
- 카드 헤더 타이포 통일 (`text-lg font-semibold text-zinc-50`)

검증: 각 도메인 진입 후 카드 정렬 / 숫자 크기 / 색상 / 버튼 hover 일관성 시각 확인.

### 단계 3 — 빠른 추가 모달 톤 일관성 점검

대상: `QuickAddModal.tsx`, `AddNoteModal.tsx`

- 4개 기존 Add Modal과 컨테이너 너비, padding, 헤더 타이포, 닫기 버튼 위치 일치 확인
- 카테고리 카드 그리드 hover/focus 상태 명시
- AddNoteModal의 textarea / 태그 토글이 NotesInboxView의 quickTags와 시각적으로 동일한 톤인지 확인

### 단계 4 — 글로벌 토큰 / overflow / line-clamp

대상: `src/app/globals.css`, `tailwind.config.ts`, 각 View

- `line-clamp-2`, `line-clamp-3` 적용: 인사이트 keySentence / actionItem, 노트 body, Want reason 등 긴 텍스트
- `overflow-hidden`, `min-w-0`, `truncate` 점검: flex 자식이 textcontent로 컨테이너를 밀고 나가지 않게
- `thin-scrollbar` 사용처 확장 검토
- Tailwind 플러그인 `@tailwindcss/line-clamp`가 필요 없으면 utility만 직접 작성 (Tailwind 3.4부터 line-clamp 내장)

### 단계 5 — 모바일 깨짐 방지

대상: 전체

- Sidebar: ≤ 768px에서 햄버거 메뉴 또는 상단 탭으로 폴드 (현재 `md:flex`이므로 모바일에서 어떻게 보이는지 확인 필요)
- Header: 검색바 / 빠른추가 / 알림 / 테마 토글이 좁은 화면에서 줄바꿈 또는 일부 숨김
- Dashboard grid: `xl:grid-cols-5` → 작은 화면에서 1~2열, 카드 padding 축소
- AddModal: `max-h-[90vh] overflow-y-auto`로 이미 안전, 입력 폼 1열 폴드 확인

목표 해상도: 360px / 414px / 768px / 1024px / 1440px에서 깨지지 않음

### 단계 6 — ESLint 설정 결정 (단계 8 질문 답변에 따라)

세 가지 옵션:
- **A. Next.js 기본 strict 채택**: `npm run lint` 시 첫 실행 안내에 따라 `eslint-config-next` strict 적용. 가장 합리적
- **B. 최소 룰셋**: `next/core-web-vitals` 끄고 `next` 만. CI 부담 최소
- **C. 미사용**: `package.json` scripts에서 `lint` 제거 또는 그대로 두고 사용 안 함

검증: 설정 적용 후 `npm run lint` 통과, 기존 코드의 룰 위반 수정

### 단계 7 — README 최종 업데이트

대상: `README.md`

- "구현된 기능" 라벨을 단계 1의 한글 매핑과 정합
- "빠른 추가" 섹션 추가 (Header → QuickAddModal → 카테고리 → 도메인 Add Modal → refreshKey 흐름)
- v1.0 완료 상태로 갱신 (현재는 "v1.0 진행 예정"으로 표기)
- 영어 표기로 남아있던 부분 정리
- localStorage 키 표는 6번째 행으로 `aiop-theme-mode` 포함
- 검증: 마크다운 렌더 시 깨짐 없음

### 단계 8 — 최종 검증

```bash
npx tsc --noEmit
npm run build
npm run lint  # 단계 6 결정에 따라
npm run dev
```

브라우저 시나리오는 §7에 정의.

## 6. 예상 위험도

- 낮음:
  - Dashboard 한글 복구 (텍스트 변경만)
  - README 갱신
- 중간:
  - 도메인 단위 시각 일관성 점검 — 의도하지 않은 디자인 회귀 가능, 단계별 시각 확인 필수
  - line-clamp / overflow 적용 — flex 컨테이너의 `min-w-0` 누락 시 의도와 다른 동작
- 중간:
  - 모바일 반응형 정비 — Sidebar 햄버거화 등 구조적 변경 시 영향 큼. 단순 깨짐 방지만 할지 결정 필요 (단계 8 질문)
- 낮음:
  - ESLint 도입 시 기존 코드의 일부 룰 위반 — 자동 fix로 대부분 해결, 수동 처리 항목은 PR 단위로 작음
- 높음: 없음

## 7. 확인 방법

실행 명령어 (Git Bash):
```bash
npx tsc --noEmit
npm run build
npm run lint   # ESLint 설정 후
npm run dev
```

브라우저 확인 (http://localhost:3000):
- Dashboard에서 모든 카드/위젯 한글 표기 확인, 빈 상태/데이터 있을 때 모두 시각 확인
- Wants/Subscriptions/Insights/Regret/Notes 진입 → 카드 padding/숫자 크기/버튼 톤 일관성
- 각 도메인에서 항목 0개 상태 → empty state 문구 일관성
- 긴 텍스트(메모 1000자, 인사이트 keySentence 500자) 입력 후 카드 깨지지 않음, line-clamp 적용
- Header 빠른 추가 → QuickAddModal → 5개 카테고리 모두 동작 (Note 포함), 저장 후 즉시 반영
- DevTools responsive에서 360px / 768px / 1440px 화면 깨짐 점검
- DevTools Application → Local Storage → 각 키 값 정상 저장 확인
- `aiop:wants`를 `"invalid"`로 손상시킨 후 새로고침 → mock fallback 정상

수동 체크리스트 (수행 후 표시):
```txt
[ ] Dashboard 5개 카드 한글 라벨 정상
[ ] WantPreview / AssetSnapshot / SubscriptionSummary / RecentInsights 한글 정상
[ ] 5개 도메인 View 카드 일관성
[ ] 5개 도메인 View 버튼 톤 일관성
[ ] 5개 도메인 View 빈 상태 문구 일관성
[ ] 긴 텍스트 line-clamp 동작
[ ] 모바일 360px / 414px / 768px 깨짐 없음
[ ] 빠른 추가 5개 카테고리 모두 저장 + 즉시 반영
[ ] tsc / build 통과
[ ] (옵션) lint 통과
[ ] README v1.0 상태 반영
[ ] localStorage 손상 시 mock fallback 정상
```

## 8. 구현 전 확인 질문

다음 항목들은 답변에 따라 단계 1, 5, 6의 세부 작업이 달라집니다. 한 번에 모두 답해 주시면 단계대로 진행합니다.

1. **Dashboard 라벨 한글 표기 톤**:
   - 옵션 A: `"구매 목표"` / `"월 구독비"` / `"계획 지출 합계"` / `"최근 인사이트"` / `"수집함"`
   - 옵션 B: `"사고 싶은 항목"` / `"이번 달 구독비"` / `"자산 커버 소비"` / `"최근 인사이트"` / `"Notes Inbox"`
   - 옵션 C: 기타 (예시 제공)

2. **모바일 반응형 깊이**:
   - 옵션 A: 단순 깨짐 방지 (overflow, line-clamp, grid 폴드)
   - 옵션 B: 본격 반응형 (Sidebar 햄버거 메뉴, Header 좁은 화면 정비, Modal 풀스크린)

3. **ESLint 처리**:
   - 옵션 A: Next.js strict (`eslint-config-next` 기본)
   - 옵션 B: 최소 룰셋 (`next` 만)
   - 옵션 C: ESLint 사용 안 함 (`package.json`의 `lint` script 제거)

위 세 가지에 답해 주시고 `진행해` / `구현해` / `그대로 해줘` 중 하나로 명령하면 §5 순서대로 단계 1부터 시작합니다.

## 부록 — v1.0 이후 후보

- **v1.1+ 검토 항목**:
  - `useLocalStorage`에 `storage` 이벤트 listener 추가 → 같은 탭/탭 간 동기화
  - Esc 키로 모달 닫기, 첫 input autofocus 공통 훅
  - Add Modal 공통 컴포넌트 추상화 (`TextField` / `NumberField` / `SelectField`)
  - localStorage item 단위 schema guard (zod 또는 수동 type guard)
  - 데이터 export / import (JSON 다운로드 / 업로드)
- **백엔드 전환 단계 (v1.1 또는 v2.0+)**:
  - 스택 선택 (Supabase 1순위), Auth 방식, 환경 변수, RLS 정책
  - localStorage 데이터의 server migration 전략
  - 데이터 fetching 추상화 (SWR / React Query 등) 도입 위치
  - 단일 도메인부터 마이그레이션 (Wants 먼저 권장)
