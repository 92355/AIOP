# AIOP 투두리스트

작성일: 2026-05-11
상태 기준 시점: v1.1 코드 반영 완료(미커밋 추정), v2.0 백엔드 계획서 작성, 단계 1 진행 중

---

## 1. 지금 작업 중 (Now)

### v2.0 단계 1 — Supabase + Google OAuth 외부 설정 (사용자 직접 수행)

- [ ] 1-1. Supabase 프로젝트 생성 (region: Tokyo, name: `aiop`)
- [ ] 1-2. Google Cloud Console에서 OAuth 2.0 Client 발급
  - [ ] OAuth consent screen 작성 (External, AIOP)
  - [ ] Credentials → Web application Client 생성
  - [ ] Authorized JavaScript origins 2개 등록
  - [ ] Authorized redirect URI 1개 등록
- [ ] 1-3. Supabase → Authentication → Providers → Google 활성화 + Client ID/Secret 등록
- [ ] 1-4. Supabase → Authentication → URL Configuration → Site URL + Redirect URLs 등록
- [ ] Project URL / anon key 메모

완료 신호: "1단계 완료" + (선택) Project URL과 anon key 전달

---

## 2. 다음 작업 (Next — v2.0 단계 2~9 코드 작업)

계획서: `.agent-notes/aiop-v20-backend-plan.md` §5 참조

- [ ] 단계 2 — 의존성 설치 + `.env.local`
  - [ ] `npm install @supabase/supabase-js @supabase/ssr swr`
  - [ ] `.env.local` 작성 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - [ ] `.env.example` 작성
  - [ ] `.gitignore`에 `.env.local` 포함 확인
- [ ] 단계 3 — 스키마 마이그레이션
  - [ ] `supabase/migrations/0001_init_schema.sql` (6 테이블)
  - [ ] `supabase/migrations/0002_rls_policies.sql` (4종 정책 × 5개 테이블)
  - [ ] `handle_new_user` 트리거로 profiles 자동 생성
  - [ ] Supabase Dashboard SQL Editor에서 실행
  - [ ] `npx supabase gen types typescript ...` → `src/lib/supabase/types.ts`
- [ ] 단계 4 — Supabase 클라이언트 + Auth 인프라
  - [ ] `src/lib/supabase/client.ts` (browser client)
  - [ ] `src/lib/supabase/server.ts` (server client with cookies)
  - [ ] `src/middleware.ts` (세션 갱신 + 보호 라우트 리다이렉트)
  - [ ] `src/app/auth/callback/route.ts` (PKCE code 교환)
  - [ ] `src/app/login/page.tsx` (미니멀 + Google 버튼)
  - [ ] `src/contexts/AuthContext.tsx`
- [ ] 단계 5 — 도메인별 SWR 훅 5개
  - [ ] `src/hooks/useWants.ts` (+ useAddWant / useDeleteWant / useUpdateWant)
  - [ ] `src/hooks/useSubscriptions.ts`
  - [ ] `src/hooks/useInsights.ts`
  - [ ] `src/hooks/useRegretItems.ts`
  - [ ] `src/hooks/useNotes.ts`
  - [ ] `src/lib/supabase/mappers.ts` (snake_case ↔ camelCase)
- [ ] 단계 6 — View / Modal / Dashboard 교체
  - [ ] Wants 도메인 (View / Card / AddModal)
  - [ ] Subscriptions 도메인
  - [ ] Insights 도메인
  - [ ] Regret 도메인
  - [ ] Notes 도메인
  - [ ] Dashboard 5개 컴포넌트
  - [ ] 빠른 추가 흐름 (`refreshKey` 제거)
- [ ] 단계 7 — 인증 UI 보강
  - [ ] avatar / display_name 표시 (Sidebar 하단 또는 Header)
  - [ ] 로그아웃 메뉴
- [ ] 단계 8 — Vercel 배포
  - [ ] GitHub push (v10/v11 커밋 정리 선행 — 아래 §3 참조)
  - [ ] Vercel import + 환경 변수 등록
  - [ ] Supabase URL Configuration에 production URL 추가
  - [ ] Google Cloud Console에 production redirect URI 추가
- [ ] 단계 9 — 최종 검증
  - [ ] `npx tsc --noEmit` / `npm run build` / `npm run lint`
  - [ ] 두 개의 다른 구글 계정으로 데이터 격리 확인
  - [ ] §7 수동 체크리스트 14개 항목

---

## 3. 백엔드 도입 전 정리 (Backlog)

### 미커밋 변경분 정리 (가장 시급)

git log 마지막 커밋: `7933191 feat:한글화, 빠른추가 버튼`
v1.0 UI 마무리와 v1.1 간단뷰가 아직 미커밋

- [ ] v1.0 변경분 커밋 (UI 한글화 / Esc 모달 닫기 / 로고 클릭 이동 / ESLint 설정)
  - 출처: `.agent-notes/aiop-v10-ui-esc-logo-review.md` §7
- [ ] v1.1 변경분 커밋 (간단뷰 / CompactModeContext / BottomTabBar / 도메인 압축)
  - 출처: `.agent-notes/aiop-v11-compact-mode-progress.md` §6
- [ ] `tsconfig.tsbuildinfo` 커밋 여부 결정 (gitignore 권장)

### 수동 시각 검증 (v1.1 후속 TODO)

- [ ] 360px / 414px / 768px / 1024px / 1440px responsive 확인
- [ ] 하단 탭바 7개 라벨 가독성 실제 기기 확인
- [ ] 모달 풀스크린 상태에서 모바일 키보드 + 저장 버튼 접근성

### v1.0 후속 TODO

- [ ] 모달 포커스 트랩 + 첫 input autofocus + 배경 스크롤 잠금
- [ ] Esc로 모달 닫을 때 입력 손실 confirm
- [ ] Next.js 15 `next lint` deprecated → ESLint CLI 방식 migration

---

## 4. v2.0 이후 (v2.1+ 후보)

계획서: `.agent-notes/aiop-v20-backend-plan.md` 부록 참조

### v2.1 — Realtime + 데이터 안전성

- [ ] Supabase Realtime 도입 (여러 디바이스 즉시 반영)
- [ ] 데이터 export / import (JSON 다운로드)
- [ ] 토글 직후 스크롤 위치 보존 / 부드러운 전환 애니메이션

### v2.2 — UX 정밀화

- [ ] 빠른 추가 FAB(Floating Action Button) — 간단뷰에서 항상 보이도록
- [ ] 간단뷰에서 스와이프 제스처로 탭 전환
- [ ] PWA 매니페스트 + 홈 화면 추가

### v2.3+ — 확장

- [ ] Supabase Storage 사용 (Want 이미지 첨부 등)
- [ ] 다국어(i18n)
- [ ] 다중 OAuth provider (Apple / GitHub 추가)
- [ ] 가족 / 팀 공유 기능 (multi-tenant)

---

## 5. 장기 / 선택적

- [ ] Row-level encryption (민감 데이터 별도 암호화)
- [ ] 모바일 앱(React Native 또는 Expo)
- [ ] 자동 백업 (Supabase → 외부 스토리지)
- [ ] 결제 / 권한 시스템 (필요해질 때)

---

## 6. 참고 문서

| 문서 | 용도 |
|---|---|
| `.agent-notes/aiop-v20-backend-plan.md` | 백엔드 도입 상세 계획 (현재 작업) |
| `.agent-notes/aiop-v11-compact-mode-plan.md` | v1.1 간단뷰 계획 |
| `.agent-notes/aiop-v11-compact-mode-progress.md` | v1.1 진행 기록 + 후속 TODO |
| `.agent-notes/aiop-v10-plan.md` | v1.0 UI 마무리 계획 |
| `.agent-notes/aiop-v10-ui-esc-logo-review.md` | v1.0 + Esc + 로고 진행 기록 |
| `.agent-notes/aiop-v09-plan.md`, `aiop-v09-progress.md` | v0.9 Dashboard 통합 |
| `.agent-notes/aiop-v07-v08-plan.md` | v0.7 Insights + v0.8 Regret |
| `.agent-notes/aiop-v04-v06-plan.md` | localStorage + Subscriptions + Notes |
| `.agent-notes/aiop-v02-v03-plan.md` | 계산 로직 + Wants 로컬 CRUD |
| `.agent-notes/aiop-quick-add-plan.md` | 빠른 추가 구현 계획 |
| `.agent-notes/aiop-project-structure.md` | 프로젝트 구조 스냅샷 |
| `README.md` | 사용자용 소개 + 현재 구현 / 앞으로 구현 |
| `AGENTS.md` | v0.1~v1.0 단계별 구현 명세 |

---

## 7. 결정된 정책 메모 (참고)

- 백엔드 스택: **Supabase(Postgres + Auth) + Vercel**
- 인증: **Google OAuth 첫날부터**
- 가입 정책: **누구나 가입 가능 + RLS로 격리**
- 기존 localStorage 데이터: **무시, 새로 시작**
- 데이터 fetching: **SWR**
- Realtime: **v2.1로 미룸**
- 비로그인 사용자: **/login 강제 리다이렉트**
- 로그인 페이지: **미니멀 (배경 + 로고 + Google 버튼)**
