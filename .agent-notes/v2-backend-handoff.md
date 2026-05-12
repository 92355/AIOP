# v2.0 백엔드 작업 인계 노트

작성일: 2026-05-12  
작업자: Claude (Sonnet 4.6)  
상태: **6단계 진입 직전 — 집에서 바로 이어서 가능**

---

## 오늘 완료한 작업 (1~5단계)

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | Supabase 프로젝트 생성 + `.env.local` + 패키지 설치 | ✅ |
| 2 | `supabase/schema.sql` 작성 + SQL Editor 실행 | ✅ |
| 3 | Google OAuth 설정 (Supabase + Google Cloud Console) | ✅ |
| 4 | `src/middleware.ts` — 세션 쿠키 갱신 미들웨어 | ✅ |
| 5 | `src/lib/db/mappers.ts` — DB ↔ TS 변환 함수 | ✅ |

---

## 새로 추가된 파일

```
src/
├── middleware.ts                  # 세션 갱신 (모든 요청마다 실행)
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # 클라이언트 컴포넌트용 Supabase 클라이언트
│   │   └── server.ts              # 서버 컴포넌트 / Server Action용
│   └── db/
│       └── mappers.ts             # snake_case DB ↔ camelCase TS 변환 전체
supabase/
└── schema.sql                     # DB 스키마 전체 (참고용, 이미 실행 완료)
```

---

## 집에서 시작 전 체크리스트

1. `git pull` — 오늘 커밋 받기
2. `npm install` — 새 패키지 동기화 (`@supabase/supabase-js`, `@supabase/ssr`)
3. `.env.local` **재생성 필수** (gitignore 대상이라 pull에 포함 안 됨)
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   → Supabase 대시보드 **Settings → API** 에서 복사
4. `npm run dev` 실행 확인

---

## 다음 작업: 6단계 — Wants 도메인 RSC + Server Action 전환

### 목표
`/wants` 페이지를 localStorage → Supabase DB로 전환하는 첫 번째 시범 도메인.  
이 패턴이 나머지 7개 도메인에 그대로 반복된다.

### 작업 순서

#### 6-1. 인증 미연결 상태 먼저 처리
- 로그인 안 된 상태에서 앱 접근 시 로그인 페이지로 redirect
- `src/app/login/page.tsx` 신규 생성 — Google 로그인 버튼
- `src/middleware.ts` 에 미인증 redirect 로직 추가

#### 6-2. Wants Server Actions 작성
- `src/app/wants/actions.ts` 신규 생성
- 함수 목록:
  - `getWants()` — SELECT
  - `createWant(data)` — INSERT
  - `updateWant(id, data)` — UPDATE
  - `deleteWant(id)` — DELETE
- `src/lib/supabase/server.ts` + `src/lib/db/mappers.ts` 활용

#### 6-3. WantsView 컴포넌트 연결
- `src/app/wants/page.tsx` → RSC로 변경, `getWants()` 호출
- `WantsView.tsx` — `useLocalStorage` 제거, Server Action props로 교체
- `AddWantModal`, `WantCard` — action 함수 주입

### 핵심 결정 사항 (aiop-status.md §10)

| 항목 | 결정 |
|---|---|
| 데이터 흐름 | RSC + Server Actions (SWR 미사용) |
| 네이밍 | snake_case DB + camelCase TS + mappers.ts |
| 삭제 | Hard delete |
| Auth | Google OAuth (Supabase) |

### 참고 파일

- `src/lib/db/mappers.ts` — `dbToWant`, `wantToDb` 함수 있음
- `src/lib/supabase/server.ts` — Server Action에서 `createClient()` import
- `supabase/schema.sql` — wants 테이블 컬럼 확인용
- `src/types/index.ts` — `WantItem` 타입
- `src/components/wants/WantsView.tsx` — 현재 localStorage 기반 구현 (교체 대상)

---

## 전체 진행 순서 (참고)

```
✅ 1. Supabase 프로젝트 생성 + 환경변수
✅ 2. Postgres 스키마 + RLS
✅ 3. Google OAuth 설정
✅ 4. @supabase/ssr 미들웨어 세팅
✅ 5. DB ↔ TS mappers
▶  6. Wants 도메인 RSC + Server Action 전환  ← 여기서 시작
   7. 나머지 도메인 순차 전환
   8. exchange_rates 캐시 + Cron
   9. localStorage → Supabase import 도구
   10. 서버 기반 export
   11. dashboard layout / user_settings 동기화
   12. localStorage 코드 제거
   13. v2.1+ AI Route Handler
```
