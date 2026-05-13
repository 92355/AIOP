# AIOP Active Plan

> 목적: 현재 실행할 단일 계획 파일.
> Claude는 이 파일을 갱신하고, Codex는 이 파일을 읽고 실행한다.
> 새 active plan 파일을 만들지 않는다.

---

## 1. Current Goal

**v2.1 데이터 로딩 / 페이지 이동 성능 진단 및 개선 + 환율 캐시 테이블 / API 연동**

사용자 요청:

```txt
v 2.1 로 데이터 로딩 / 페이지 이동성능 진단 및 개선 , 환융 캐시 테이블 /api 연동 진행해보자
AI 기능은 v2.2 때 구현. aiop-plan에 작성해서 진행시켜
```

AI 기능은 v2.2로 미룬다. 이번 v2.1 범위에는 포함하지 않는다.

---

## 2. Scope

### Include

- 현재 데이터 로딩 / 페이지 이동 병목 가능 지점 점검
- 코드만으로 개선 가능한 초기 로딩 중복 제거
- 대시보드 초기 데이터 로딩과 위젯 렌더 흐름 정리
- 환율 캐시 테이블 스키마 추가
- Frankfurter API 연동 서버 Route Handler 추가
- 캐시 우선 조회, stale 시 외부 API fetch 후 DB upsert
- KRW/USD 환율을 UI에서 사용할 수 있는 최소 클라이언트 훅/컴포넌트 추가
- `aiop-status.md`에 v2.1 변경 상태 반영

### Exclude

- AI 자동분류 / 추천 기능
- 새 라이브러리 설치
- Supabase 프로젝트 원격 migration 직접 적용
- 대규모 라우트 구조 변경
- Vercel / Supabase 리전 변경
- 전체 앱 디자인 개편
- 레거시 export/import 전환

---

## 3. Decisions

| # | 결정 | 내용 |
|---|---|---|
| V21-1 | AI 기능 | v2.2에서 구현 |
| V21-2 | 환율 API | Frankfurter v2 API 사용 |
| V21-3 | 기본 환율쌍 | `USD` → `KRW` 우선 |
| V21-4 | 캐시 기준 | 같은 `base_currency`, `quote_currency`, `rate_date`는 1행 |
| V21-5 | 캐시 TTL | 12시간 이내 `fetched_at`이면 DB 캐시 사용 |
| V21-6 | 외부 API 호출 위치 | 브라우저 직접 호출 금지, Next.js Route Handler에서 호출 |
| V21-7 | API 인증 | 미인증 요청은 401 |
| V21-8 | 성능 개선 우선순위 | 중복 로딩 제거 → 불필요한 refresh 축소 → prefetch 적용 |

Frankfurter 최신 문서 확인:

- 공식 문서: `https://frankfurter.dev/docs/`
- v2 단일 환율 예시: `https://api.frankfurter.dev/v2/rate/EUR/USD`

---

## 4. Files Expected to Change

```txt
.agent-notes/aiop-plan.md
.agent-notes/aiop-status.md
supabase/schema.sql
src/app/api/exchange-rates/route.ts              (신규)
src/lib/exchangeRates.ts                         (신규)
src/hooks/useExchangeRate.ts                     (신규)
src/components/calculator/ExchangeRatePanel.tsx  (신규)
src/components/calculator/AssetCalculatorView.tsx
src/app/(app)/layout.tsx
src/components/layout/AppShell.tsx
src/contexts/LayoutContext.tsx
src/hooks/useDashboardLayout.ts
src/components/dashboard/TodoSummary.tsx
```

실제 조사 후 불필요한 파일은 수정하지 않는다.

---

## 5. Tasks

### 준비 / 진단

- [x] **T1. 성능 병목 후보 확인** — Dashboard RSC, Search dropdown, QuickAdd refresh, layout load, nav 이동 흐름 확인
- [x] **T2. 환율 사용 지점 확인** — Calculator, Wants, Regret의 currency 필드와 UI 연결 가능성 확인

### 성능 개선

- [x] **T3. 페이지 이동 prefetch 적용** — Sidebar / BottomTabBar / 주요 Link에 명시적 prefetch 적용 여부 확인 및 개선
- [x] **T4. QuickAdd 후 refresh 범위 점검** — optimistic 적용 도메인과 전체 refresh가 겹치는 부분 최소화 가능성 검토
- [x] **T5. Dashboard 초기 데이터 중복 로딩 점검** — 위젯이 initialData 대신 중복 fetch하는 부분이 있으면 제거

### 환율 캐시 / API

- [x] **T6. `exchange_rates` 스키마 추가** — 캐시 테이블, unique key, index, RLS policy 작성
- [x] **T7. 환율 유틸 작성** — currency pair 검증, cache freshness, 응답 타입 정의
- [x] **T8. Route Handler 작성** — `GET /api/exchange-rates?base=USD&quote=KRW`
- [x] **T9. Calculator UI 연결** — 계산기에서 현재 USD/KRW 환율 표시 및 수동 새로고침

### 문서 / 검증

- [x] **T10. `aiop-status.md` 업데이트** — v2.1 변경사항 반영
- [x] **T11. TypeScript 확인** — `npx tsc --noEmit`
- [x] **T12. lint 확인** — `npm run lint`
- [x] **T13. build 확인** — `npm run build`

---

## 6. Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

결과:

- `npm run build`: 통과
- `npx tsc --noEmit`: 통과
- `npm run lint`: 통과
- `git diff --check`: 통과 (CRLF 경고만 표시)

수동 QA:

- [ ] 로그인 상태에서 `/calculator` 접근
- [ ] USD/KRW 환율 패널 표시
- [ ] 캐시가 없을 때 Frankfurter API 호출 후 DB upsert
- [ ] 캐시가 있을 때 DB 캐시 우선 반환
- [ ] 미인증 상태에서 `/api/exchange-rates` 요청 시 401
- [ ] 주요 페이지 이동이 정상 동작
- [ ] 대시보드 위젯 데이터 표시 유지

---

## 7. Done Criteria

- [x] v2.1 범위 코드 반영
- [x] 환율 캐시 스키마 작성 완료
- [x] Route Handler 동작 타입 검증 완료
- [x] 계산기 UI에서 환율 확인 가능
- [x] `tsc`, `lint`, `build` 결과 기록
- [x] AI 기능이 v2.2 범위로 남아 있음을 문서에 명시

---

## 8. Next Plan 후보

- v2.1 후속: 실제 Supabase migration 적용 및 운영 DB 확인
- v2.1 후속: Vercel / Supabase 리전 확인, Speed Insights 기반 추가 진단
- v2.1 후속: Wants / Regret에 환율 환산 표시 확장
- v2.1 후속: 환율 API `429` 응답의 `cooldownRemainingMs`를 패널 UI에 직접 표시
- v2.2: AI 자동분류 / 오늘 할 일 추천 / 투자종목 추천 / 뉴스 추천
