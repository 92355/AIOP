# AIOP v2.0 사전 결정 사항

> 작성일: 2026-05-11
> 짝 문서: `aiop-v20-backend-plan.md`
> 목적: v2.0 착수 전 모호한 결정들을 못 박아 후속 작업이 일관되게 진행되도록 한다.

---

## D1. 클라이언트 ↔ 서버 데이터 흐름

**결정: RSC + Server Actions**

- 페이지/위젯은 Server Component 로 데이터 fetch.
- mutation 은 Server Action 으로 처리.
- 캐시 무효화는 `revalidateTag` 사용.
- 클라이언트 hook (`useWants` 등) 은 만들지 않는다. 필요 시 컴포넌트 props 로 데이터를 받고, 인터랙티브 부분만 `"use client"`.

**근거**
- Next.js 15 App Router 네이티브 패턴.
- 단일 사용자 시나리오라 SWR 의 클라이언트 캐시 일관성 이점이 약하다.
- 옵티미스틱 업데이트가 필요한 케이스 (Wants 추가/삭제, Subscriptions status 변경 등) 는 React 19 의 `useOptimistic` 또는 form action 의 pending 상태로 충분히 처리 가능.
- 코드량 / 의존성이 줄어든다 (SWR 미도입).

**적용 범위**
- `src/app/page.tsx` 의 단일 페이지 + `ViewKey` 스위칭 구조는 **재검토 대상**. App Router 의 라우트 기반 페이지 (`/wants`, `/subscriptions/...`) 로 전환하는 게 자연스럽다.
- 다만 v1.x 의 `?view=` query 기반 SPA 동작을 유지할지, 진짜 라우트로 갈지는 D6 (별도 결정 항목)으로 추가.

---

## D2. 테이블 / 컬럼 네이밍

**결정: snake_case (DB) + camelCase (TS) + 매핑 함수**

- Postgres 컬럼은 모두 snake_case (예: `monthly_price`, `required_capital`, `result_percent`).
- TS 도메인 타입(`WantItem.monthlyPrice` 등)은 그대로 유지.
- 매핑은 도메인별 `rowToX` / `xToRow` 1쌍씩 작성. 위치 후보: `src/lib/db/mappers.ts` (v2.0 도입 시 신규).
- Server Action 안에서 input 검증 후 매핑 → DB insert / update.
- SELECT 후 매핑 → 도메인 타입 반환.

**근거**
- Supabase Studio / Postgres 클라이언트 / SQL 마이그레이션 모두 따옴표 없이 동작.
- TS 코드의 camelCase 관례 유지.
- 매핑 함수 1개의 비용은 작고, 경계가 명확해진다.

## D3. multi-currency 지원 범위

**결정: v2.0 에 환율 API + 자동 환산 포함**

- 사용자 입력은 KRW / USD 모두 허용 (기존 `Currency` 타입 그대로).
- 대시보드 카드 / 계산기 / 후회 기록 등 합계·비교 화면은 단일 기준통화(KRW)로 자동 환산.
- 환율 API 후보: **Frankfurter** (ECB 기반, 무료, 호출 한도 없음) 1순위. 부족 시 한국수출입은행 API.
- 환율은 하루 1회 fetch + Supabase `exchange_rates` 테이블 캐시 (또는 Vercel Runtime Cache, 24h TTL).
- 사용자 설정에 "기준 통화" 1개 두기 (기본 KRW). USD 사용자가 본인이라면 수동 토글 가능.
- 키 또는 토큰이 필요한 API 인 경우 서버 전용 환경변수.

**README 정책 갱신 필요**
- "v2.0 이전까지 도입하지 않습니다" 항목에서 "실제 금융 / 주식 / 환율 API" 줄을 분리:
  - **환율 API**: v2.0 에 포함.
  - **금융 / 주식 API**: 여전히 v2.x 후순위.
- 작업: README "v2.0 이전까지 도입하지 않습니다" 섹션 수정 + 백엔드 계획서에 환율 처리 섹션 추가.

**근거**
- 사용자가 NVDA / TSLA / BTC 같은 자산을 후회 기록 / 자산 계산기에 입력하는데, 가격이 KRW 만으로는 운영 시 한계가 있다.
- AI 기능(투자종목 추천, 뉴스) 이전에 환율이 자리 잡혀 있어야 일관성 있는 합계가 나온다.

## D4. 태그 컬럼 형태

**결정: `text[]` 단일 컬럼**

- `insights.tags text[] not null default '{}'`
- `notes.tags text[] not null default '{}'`
- GIN 인덱스 추가: `create index ... on insights using gin (tags);`
- AI 자동 분류 (v2.1) 도 `tags` 배열에 string 을 push 하는 방식으로 단순화.
- 태그 명 변경이 필요해질 경우 마이그레이션 1회로 처리 (`update insights set tags = array_replace(tags, 'old', 'new')`).

**근거**
- 단일 사용자 시나리오 — 정규화의 이점(중복 제거, 무결성)이 약하다.
- 카운트 / 검색 쿼리도 `unnest` 또는 `tags @> array['x']` 로 충분히 처리.
- 조인 비용 / 트랜잭션 부담 없음.

## D5. 삭제 정책 (soft / hard)

**결정: Hard delete**

- `delete from wants where id = $1 and user_id = auth.uid();`
- soft delete 컬럼 없음. 모든 도메인 테이블 동일.
- 복구 시나리오는 사용자가 v1.3 호환 export 백업을 주기적으로 받아 두는 방식으로 처리.
- Server Action 안에서 삭제 후 `revalidateTag` 호출.

**근거**
- 단일 사용자 + 데이터 총량 적음.
- 모든 쿼리에 `deleted_at is null` 조건을 다는 인지 부담이 더 크다.
- 백업/복원 인프라(v1.3) 가 이미 마련돼 있다.

## D6. URL 구조 (단일 페이지 vs 라우트 분리)

**결정: 라우트 분리**

- App Router 의 정식 라우트 7개로 분리.
- `src/app/` 구조:
  ```
  page.tsx              -> Dashboard
  wants/page.tsx
  subscriptions/page.tsx
  insights/page.tsx
  notes/page.tsx
  regret/page.tsx
  todos/page.tsx
  calculator/page.tsx
  ```
- Sidebar / BottomTabBar 의 `onSelectView` → `<Link href="/wants">` 로 교체.
- `?view=` 쿼리 동기화 / `popstate` 핸들러는 v1.x 잔재 → 제거.
- AppShell 은 모든 라우트에 공통 → `src/app/layout.tsx` 에 배치 (또는 (app) route group).
- 각 라우트의 page.tsx 는 Server Component 로 데이터 fetch → 클라이언트 인터랙션 부분만 분리.

**적용 시점**
- v2.0 초기 단계 (Supabase 연결 직전 또는 직후) 에 라우트 분리 PR 한 번.
- 그 PR 이후 데이터 흐름이 RSC 로 바뀌므로 잔여 작업이 자연스럽게 따라온다.

**근거**
- RSC 의 라우트별 캐싱 / 스트리밍 이점 활용.
- URL 직진입 시 깜빡임 게이트(`hasHydratedView`) 불필요.
- Header 검색창 동작도 라우트별 컴포넌트가 자연스럽게 받는다.

---

## 정리: 결정 사항 한눈에 보기

| ID | 항목 | 결정 |
| --- | --- | --- |
| D1 | 데이터 흐름 | RSC + Server Actions |
| D2 | 네이밍 | snake_case (DB) + camelCase (TS) + 매핑 함수 |
| D3 | multi-currency | v2.0 에 환율 API + 자동 환산 포함 (Frankfurter 1순위) |
| D4 | 태그 컬럼 | `text[]` 단일 컬럼 + GIN 인덱스 |
| D5 | 삭제 정책 | Hard delete |
| D6 | URL 구조 | 라우트 분리 (App Router 정식 page.tsx 7개) |

---

## 후속 작업 (v2.0 착수 전에 코드 / 문서 측에서 반영)

1. **README 수정** — "v2.0 이전까지 도입하지 않습니다" 항목에서 "환율 API" 제외 (D3 반영).
2. **`aiop-v20-backend-plan.md` 갱신** — D3 (환율 처리 섹션), D6 (라우트 구조), 컬럼 네이밍 / mappers 파일 위치 등 결정 반영.
3. **외부 작업 가이드 문서 작성** — Supabase 프로비저닝 / Google OAuth / Vercel env / Frankfurter 호출 키 정리.
4. **`AGENTS.md` 의 v2.0 섹션 갱신** — 위 6개 결정을 짧게 요약.

위 후속 작업이 끝나면 v2.0 단계 1번(Supabase 프로젝트 생성 + 환경변수) 부터 실제 코드 작업 시작.
