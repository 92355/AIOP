# AIOP v2.0 — 라우트 분리 이후 다음 진행사항

> 작성일: 2026-05-11
> 직전 단계: `.agent-notes/aiop-v20-route-split-progress.md` (라우트 분리 완료, 빌드 / 타입 / lint 통과)
> 짝 문서: `aiop-v20-decisions.md` (D1~D6 확정), `aiop-v20-backend-plan.md` (전체 계획)

---

## 0. 현재 상태 한눈에

### 완료

- v1.0 ~ v1.3 프론트엔드 단계.
- v2.0 사전 결정 D1~D6 확정.
- **App Router 라우트 분리** — 7개 라우트, AppShell 을 layout.tsx 로 이동, Link 기반 내비게이션, QuickAdd wiring 흡수, `useLocalStorage` same-tab broadcast.

### 다음 차례 (Backend 본 작업)

`aiop-v20-backend-plan.md` 의 구현 순서 13단계 중 라우트 분리(5번)는 끝났고, **1 ~ 4번이 남은 선행 작업**, 그 뒤가 도메인 마이그레이션(6 ~ 12번), 마지막이 AI Route Handler(13번).

---

## 1. 우선순위 갈래

### A. 라우트 분리 수동 QA 마무리 (선행 정리)

10~30분.

- 브라우저에서 9개 시나리오 확인 (`aiop-v20-route-split-progress.md` §수동 확인 필요).
- `npm run dev` 실행 시 PowerShell 환경에서 3001/3002 포트 충돌 + Invoke-WebRequest 연결 거부가 보고됨 → dev 환경 자체 점검 (방화벽 / 다른 프로세스 점유 / IPv6 vs IPv4).
- `tsconfig.tsbuildinfo` 커밋 여부 결정 (관행: `.gitignore` 에 추가).

### B. v2.0 단계 1번 — Supabase 외부 준비 (사용자가 직접 / 가이드 필요)

30~60분. 외부 클릭 작업 중심.

1. **Vercel CLI 설치** — `npm i -g vercel`.
2. **Vercel 프로젝트 연결** — `vercel link`. main 브랜치 git remote 가 필요. 단일 사용자라 깃허브 push 안 해도 `vercel deploy` 만으로 시작 가능.
3. **Supabase 프로비저닝** — Vercel Marketplace 검색 → Add Integration → 프로젝트 선택 → 무료 티어. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 자동 주입.
4. **Google OAuth Client ID/Secret 발급** — Google Cloud Console → APIs & Services → OAuth Client ID (Web). Authorized redirect URI 에 Supabase 콜백 URL 등록. Client ID/Secret 를 Supabase Auth → Providers → Google 에 입력.
5. **로컬 동기화** — `vercel env pull .env.local`. `.env.local` 에 위 환경 변수 모두 들어오는지 확인.
6. **테스트** — Supabase 대시보드에서 SQL editor 열고 `select auth.uid();` 확인.

이 단계가 끝나야 코드 작업이 의미를 갖는다. 가이드 분량 큰 외부 작업이므로 본인이 직접 수행. 막히면 그때그때 도움 요청.

### C. v2.0 단계 2번 — Postgres 스키마 + RLS (코드 작업)

1~2시간.

- `supabase/migrations/0001_init.sql` 파일 작성 (또는 Supabase Studio Migration 기능 사용).
- 도메인 테이블 8개 + RLS + 인덱스 + GIN(tags).
- `exchange_rates`, `user_settings`, `dashboard_layouts` 동시 작성 (환율 처리 / 환경 키 / 레이아웃).
- 적용은 사용자가 Supabase Studio 에서 한 번에 실행.

### D. v2.0 단계 3번 — Google OAuth + `/auth/callback` (코드 작업)

1~2시간.

- `src/app/auth/callback/route.ts` — `@supabase/ssr` 의 `exchangeCodeForSession`.
- `src/app/auth/sign-out/route.ts`.
- 로그인 화면: 미로그인 시 모든 라우트가 로그인 화면으로 리다이렉트. AppShell 또는 middleware 에서 처리.
- 단일 사용자 가정이라 자가 가입 차단 (Supabase Auth 설정에서 sign-up 제한 또는 Google 이메일 화이트리스트).

### E. v2.0 단계 4번 — @supabase/ssr 클라이언트 세팅 + mappers.ts (코드 작업)

1시간.

- `src/lib/supabase/server.ts` (서버 클라이언트, 쿠키 기반).
- `src/lib/supabase/client.ts` (클라이언트 컴포넌트용).
- `src/lib/db/mappers.ts` — `rowToWant`, `wantToRow`, ... 8쌍.
- 빌드 통과 + 미사용 경고 없게 도메인 1개 실제 호출 코드 추가 (Wants 가 시범 도메인).

---

## 2. 권장 진행 순서

```text
1. A (라우트 분리 수동 QA, 10~30분)
2. B (Supabase 외부 준비, 30~60분, 사용자가 직접)
3. C (스키마 SQL 파일 작성, 1~2시간) — B 완료되어야 의미 있음
4. D (OAuth + auth route, 1~2시간)
5. E (Supabase 클라이언트 + mappers, 1시간)
6. 시범 도메인 (Wants) Server Component + Server Action 마이그레이션 — 별도 PR
7. 나머지 도메인 확장
```

A 와 B는 의존성 없음 (병렬). C부터는 B의 결과(환경 변수, Supabase 프로젝트 ID) 가 필요.

---

## 3. 결정 / 확인 필요한 항목

- **A의 dev server 연결 문제**가 v2.0 코드 작업에 지장을 주는지 — 빌드/타입 통과는 됐으니 v2.0 진행 자체는 막히지 않음. 다만 시범 도메인 동작 검증할 때 dev server 필요.
- **B를 사용자가 직접 수행할지, 가이드 문서만 작성하고 사용자 직접 진행할지**.
- **C의 마이그레이션 도구** — `supabase/migrations/*.sql` (Supabase CLI 사용) vs Supabase Studio SQL editor 에서 수동 실행. 단일 사용자라 후자도 가능.

---

## 4. 즉시 만들 수 있는 산출물 (외부 작업 없이도 가능)

코드/문서 단에서 외부 작업과 무관하게 미리 준비 가능한 것들:

1. **단계 2 SQL 초안** — `supabase/migrations/0001_init.sql` 본문 작성. 적용은 Supabase 준비 후 사용자가.
2. **`src/lib/db/mappers.ts` 스켈레톤** — 도메인 타입 매핑 1쌍씩.
3. **`src/lib/supabase/*` 보일러플레이트** — `@supabase/ssr` 가 설치되면 바로 동작하도록 타입 + 함수만.
4. **`.env.example`** — 필요한 환경변수 키만 비워 둔 파일 (값은 사용자가 채움).
5. **외부 작업 가이드 단독 문서** — 위 B를 사용자가 순서대로 따라할 수 있게 정리한 별도 md (`aiop-v20-step1-external-setup.md`). 스크린샷 위치, 막힐 만한 지점, 검증 SQL 까지.

위 1~5는 외부 작업이 끝나기 전에도 진행 가능. 6번부터는 외부 작업 완료가 전제.

---

## 5. 세션 이어가기

```text
.agent-notes/aiop-v20-next-steps.md 읽고 §4 의 산출물 4번까지 만들어줘
```

또는:

```text
.agent-notes/aiop-v20-next-steps.md 의 단계 C (스키마 SQL) 진행해줘
```

또는 외부 작업 가이드만:

```text
.agent-notes/aiop-v20-next-steps.md 의 §1.B 를 단독 가이드 md 로 만들어줘
```
