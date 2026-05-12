# 다른 기기 이전 체크리스트

> 새 기기 또는 초기화된 환경에서 작업 시작 전 이 문서를 순서대로 따른다.

---

## 1. 사전 요구사항

| 항목 | 버전 | 확인 명령 |
|---|---|---|
| Node.js | v24.x (현재 v24.11.0) | `node -v` |
| npm | v11.x (현재 v11.6.1) | `npm -v` |
| Git | 최신 | `git --version` |

---

## 2. 레포지토리 클론 & 의존성 설치

```bash
git clone <repo-url> aioP
cd aioP
npm install
```

---

## 3. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 직접 생성한다.

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://edpcvypiwokaunbmenyp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase 대시보드 → Project Settings → API → anon public>
```

- **URL**: `edpcvypiwokaunbmenyp.supabase.co` (고정)
- **anon key**: Supabase 대시보드에서 복사. `sb_publishable_...` 형태
- `.env.local`은 `.gitignore`에 포함 — 절대 커밋 안 됨

---

## 4. 실행 확인

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → Google 로그인 화면이 뜨면 정상.

로그인 후 대시보드가 보이고, 기존 데이터가 불러와지면 Supabase 연결 성공.

---

## 5. 현재 프로젝트 상태 (2026-05-12 기준)

- **v2.0 완료**: 모든 도메인(Wants, Subscriptions, Insights, Regret, Notes, Todos, Retros) Supabase DB 전환 완료
- **인증**: Google OAuth (Supabase Auth) — 미인증 시 `/login`으로 자동 redirect
- **데이터 흐름**: RSC `page.tsx` → Server Actions → Supabase Postgres
- **dashboard layout**: `user_settings` 테이블에 저장 (기기 간 공유됨)
- **localStorage 잔존**: 테마(`aiop-theme-mode`), 컴팩트 모드(`aiop-compact-mode`) 2개만

자세한 내용은 `aiop-status.md` 참고.

---

## 6. Supabase 대시보드 접근

- URL: `https://supabase.com/dashboard/project/edpcvypiwokaunbmenyp`
- 로그인 계정: qpqp92355@gmail.com
- 주요 메뉴:
  - **Table Editor**: 데이터 직접 확인/수정
  - **Authentication → Users**: 가입 유저 확인
  - **Authentication → URL Configuration**: 로컬/프로덕션 Redirect URL 등록
  - **Project Settings → API**: URL, anon key, service_role key 확인

---

## 7. Google OAuth Redirect URL 등록 (새 환경 추가 시)

새 기기에서 다른 포트나 도메인을 쓸 경우 Supabase에서 허용 URL을 추가해야 한다.

Supabase 대시보드 → **Authentication → URL Configuration → Redirect URLs**에 추가:

```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback   # 포트가 다를 경우
```

---

## 8. 타입 체크 / 빌드 확인

```bash
npx tsc --noEmit   # 타입 오류 확인
npm run build      # 프로덕션 빌드 확인
```

---

## 9. 작업 노트 위치

```
.agent-notes/
├── aiop-status.md      ← 프로젝트 현재 상태 단일 기준 문서
├── aiop-plan.md        ← 작업 계획
├── device-handoff.md   ← 이 문서
└── v2-backend-handoff.md
```

`.agent-notes/`는 전역 gitignore 등록됨 — 기기 간 공유 안 됨.  
→ 새 기기에서는 이 파일들을 수동으로 복사하거나 Claude에게 `aiop-status.md` 기준으로 브리핑을 요청한다.
