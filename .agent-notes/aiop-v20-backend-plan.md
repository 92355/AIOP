# AIOP v2.0 — Supabase 백엔드 + 인증 + AI Route Handler 계획서

> 작성일: 2026-05-11
> 전제: v1.0 ~ v1.3 마무리 후 착수
> 정책: 본 단계는 **한 묶음**으로 도입한다. 인증 / DB / AI Route Handler 는 분리해서 진행하지 않는다.

---

## 1. 목적

- 브라우저 localStorage 의존을 끊고, 어디서든 동일한 데이터를 사용한다.
- 기기 간 이동 (PC ↔ 모바일) + 데이터 백업 영속성 확보.
- AI 기능 (v2.1+) 도입의 전제 인프라를 한 번에 마련한다.
- 키 노출 없이 AI API 를 사용할 서버 경로를 만든다.

---

## 2. 전제 / 제약

- 사용자: **본인 1명** (단일 사용자). 다중 사용자 시나리오는 v2.x 후순위.
- 비용: 무료 티어 안에서 운영 (Supabase Free, Vercel Hobby, AI API 종량제).
- 인증: Google OAuth 1개만. 이메일/비번 폼은 만들지 않는다.
- 기존 사용자 데이터(브라우저 localStorage) 는 **v1.3 export JSON 으로 일괄 import** 한다.
- 외부 클라이언트에서 직접 Supabase 를 호출하지 않는다. 모든 데이터 흐름은 Next.js Route Handler 또는 Supabase 클라이언트 SDK (`@supabase/ssr`) 를 거친다.

---

## 3. 인프라 / 외부 서비스

| 항목 | 선택 | 비고 |
| --- | --- | --- |
| DB / Auth | Supabase | Vercel Marketplace 에서 프로비저닝 |
| 호스팅 | Vercel | Next.js 15 Fluid Compute (Node.js 24 LTS) |
| AI Gateway | Vercel AI Gateway | `provider/model` 문자열로 단일화 |
| 환경 변수 | `vercel env` + `vercel env pull` | 로컬 `.env.local` 동기화 |
| 도메인 | 임시 `*.vercel.app` 우선 | 커스텀 도메인은 안정화 후 |

---

## 4. 데이터 모델 (Postgres)

모든 테이블은 `user_id uuid not null references auth.users(id) on delete cascade` 를 포함하고, RLS 정책은 `auth.uid() = user_id` 단일 조건.

### 4.1 도메인 테이블

| 테이블 | PK | 주요 컬럼 | 참고 |
| --- | --- | --- | --- |
| `wants` | id uuid | name, price, currency, category, reason, status, score, required_capital, target_date, priority?, target_months?, expected_yield?, monthly_cashflow_needed?, created_at | `WantItem` |
| `subscriptions` | id uuid | service, monthly_price, category, usage, value_score, status, created_at | `Subscription` |
| `insights` | id uuid | title, source_type, key_sentence, action_item, related_goal, created_at | tags 는 `text[]` 또는 별도 `insight_tags` |
| `notes` | id uuid | title?, body, status, tags, created_at | `Note` |
| `regret_items` | id uuid | name, asset_type, symbol?, watched_price, current_price, currency, quantity, watched_at?, note, result_percent, profit_amount, created_at | `RegretItem` |
| `todos` | id uuid | title, status, priority, due_date?, created_at | `TodoItem` |
| `dashboard_layouts` | user_id PK | layout jsonb | `DashboardLayout` 그대로 저장 |
| `user_settings` | user_id PK | hero_message text, compact_mode boolean, theme_mode text | 환경 키 묶음 |

### 4.2 인덱스

- 모든 도메인 테이블에 `(user_id, created_at desc)` 인덱스.
- `notes.status`, `subscriptions.status` 빈도가 높으면 추가 인덱스.

### 4.3 RLS 정책

```sql
alter table wants enable row level security;
create policy "users access own rows" on wants
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- 다른 테이블도 동일 패턴
```

`dashboard_layouts`, `user_settings` 도 동일.

---

## 5. 인증 흐름

- 단일 OAuth provider: Google.
- 로그인 / 로그아웃 라우트: `/auth/callback`, `/auth/sign-out`.
- 세션은 Supabase `@supabase/ssr` 기반 쿠키.
- 첫 로그인 시:
  1. `wants` 등 도메인 테이블이 비어 있는지 확인.
  2. UI 에서 "기존 localStorage 데이터를 가져올까요?" 다이얼로그 노출.
  3. 동의 시 v1.3 export JSON 을 그대로 서버 import 엔드포인트로 전송.
- 미로그인 사용자는 모든 화면을 보지 못한다. 단일 사용자 가정이라 게이트가 깔끔하다.

---

## 6. 데이터 흐름

### 6.1 클라이언트 추상화

`useLocalStorage` 를 그대로 두지 말고, **도메인 훅** 으로 일원화:

```ts
// 예: src/hooks/useWants.ts
export function useWants() {
  // SWR 또는 RSC + Server Action 기반
  // optimistic update 지원
}
```

- 후보 1: **Server Components + Server Actions** — 데이터 fetch 는 RSC, mutation 은 Server Action. 캐시 무효화는 `revalidateTag`.
- 후보 2: **SWR + Route Handler** — 클라이언트 hook, JSON API.
- 추천: 후보 1. App Router 네이티브, 캐시/스트리밍 이점.

### 6.2 마이그레이션 엔드포인트

- `POST /api/sync/import` — v1.3 export payload 받아서 각 테이블에 upsert.
- `version === 1` 확인 + 사용자별 멱등성 (idempotency key).

### 6.3 백업 / 내보내기

- v1.3 UI 는 그대로 두되, export 시 데이터를 localStorage 대신 서버에서 묶어 다운로드.
- `GET /api/sync/export` — 현재 사용자의 모든 도메인 row 를 JSON 으로 반환.

---

## 7. AI Route Handler

- Path: `/api/ai/classify`, `/api/ai/today-actions`, `/api/ai/investment-ideas`, `/api/ai/news-curation` (v2.1+ 단계별 추가).
- 모델 호출은 **Vercel AI Gateway** 경유. `"provider/model"` 문자열로 단일화 (예: `"anthropic/claude-sonnet-4-6"`, `"openai/gpt-4o-mini"`).
- 인증 미들웨어: 로그인된 사용자만 접근.
- 입력 검증: zod 또는 직접 가드.
- 비용 보호: 사용자별 일일 호출 한도 (KV/Redis 또는 Postgres 카운터).

---

## 8. 환경 변수

| 키 | 위치 | 비고 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 모든 환경 | 클라이언트 노출 OK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 모든 환경 | RLS 로 보호됨 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 | 마이그레이션 / 관리자 작업 |
| `AI_GATEWAY_API_KEY` | 서버 전용 | Vercel AI Gateway |
| `OAUTH_GOOGLE_CLIENT_ID` | 서버 전용 | Supabase 측에 등록 |
| `OAUTH_GOOGLE_CLIENT_SECRET` | 서버 전용 | 동일 |

`vercel env pull .env.local` 로 동기화.

---

## 9. Vercel 배포 / 운영

- Preview / Production 분리. Production 은 main 브랜치.
- Fluid Compute 기본 (Node.js).
- Rolling Releases 활성화 (점진적 배포, 문제 발생 시 빠른 롤백).
- Vercel Agent 로 PR 자동 리뷰 (선택).

---

## 10. 마이그레이션 절차 (사용자 입장)

1. v1.3 빌드된 AIOP 에서 **데이터 내보내기** → `aiop-export-YYYYMMDD.json` 다운로드.
2. v2.0 배포된 페이지에서 Google 로그인.
3. 첫 진입 다이얼로그에서 위 JSON 업로드 → 서버로 전송 → 도메인 테이블 채워짐.
4. 이후 로컬 localStorage 는 사용하지 않는다. 도메인 훅이 서버 상태를 본다.
5. 안전성 확인 후 localStorage 정리 (`localStorage.clear()` 옵션 제공).

---

## 11. 구현 순서

```text
1. Supabase 프로젝트 생성 + 환경 변수 설정 + Vercel 연결
2. Postgres 스키마 + RLS 정책 적용 (SQL 파일로 버전 관리)
3. Google OAuth provider 등록 + /auth/callback 구현
4. @supabase/ssr 서버/클라이언트 세팅
5. 도메인별 Server Component 또는 hook 1개 (예: wants) 구현 + 화면 연결
6. 5번이 검증되면 나머지 도메인으로 확장
7. /api/sync/import + 첫 로그인 다이얼로그
8. /api/sync/export (선택)
9. dashboard_layouts, user_settings 동기화
10. localStorage 사용 코드 제거 + README/AGENTS.md 갱신
11. v2.1+ AI Route Handler 단계별 추가
```

---

## 12. 사전 확정 필요 사항

다음 항목은 v2.0 착수 직전에 결정.

- **데이터 흐름**: RSC + Server Actions vs SWR + Route Handler — 추천: RSC + Server Actions.
- **테이블 컬럼 네이밍**: snake_case 통일 (Postgres 관습). 코드 레이어 ↔ DB 매핑 함수 1개로 처리.
- **multi-currency**: 현재 KRW 위주. USD 지원은 컬럼은 두되 포맷팅만 분기.
- **태그**: `text[]` 인지 별도 테이블인지 → 단일 사용자라 `text[]` 로 충분.
- **삭제 정책**: soft delete (`deleted_at`) 도입 여부 — 가족/공동 사용이 아니므로 hard delete 로 충분.

---

## 13. v2.0 이전까지 도입하지 않는다

- 임의의 DB (Neon Postgres 등 Marketplace 외) — Supabase 로 단일화.
- 자체 백엔드 서버 (Express, FastAPI 등).
- OAuth 외 인증 방식 (이메일/패스워드, magic link).
- AI 외 외부 API (금융, 환율, 주식 — v2.x 후순위).
- 결제, 권한 시스템, 멀티 테넌시.

본 계획은 v1.0 ~ v1.3 마무리 후 별도 세션에서 단계 1번부터 진행한다.
