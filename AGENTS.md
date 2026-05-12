# AIOP Agent Guide

> 목적: Claude가 계획을 작성하고, Codex가 그 계획을 실행할 때 사용하는 최소 공통 규칙.
> 이 파일은 길게 확장하지 않는다. 상세 상태와 실행 계획은 `.agent-notes/`를 본다.

---

## 1. 문서 역할

| 파일 | 역할 |
|---|---|
| `AGENTS.md` | 고정 작업 규칙. Claude / Codex 공통 기준 |
| `.agent-notes/aiop-status.md` | 현재 프로젝트 상태. 코드 구조, 도메인, localStorage, 미커밋 현황 |
| `.agent-notes/aiop-plan.md` | 현재 실행할 단일 계획. Claude가 작성하고 Codex가 실행 |
| `.agent-notes/aiop-archive.md` | 완료된 계획 / 과거 참고 기록 |

---

## 2. 반드시 먼저 읽을 문서

작업 시작 전 아래 순서로 읽는다.

```txt
1. AGENTS.md
2. .agent-notes/aiop-status.md
3. .agent-notes/aiop-plan.md
```

`aiop-archive.md`는 과거 맥락이 필요할 때만 읽는다.

---

## 3. 역할 분리

### Claude

- 코드 수정 전에 계획을 작성한다.
- 새 계획 파일을 만들지 않는다.
- 항상 `.agent-notes/aiop-plan.md`만 갱신한다.
- 계획에는 목표, 범위, 제외 범위, 수정 예상 파일, 작업 순서, 검증 방법을 포함한다.
- 코드 구현은 사용자가 명시하지 않으면 하지 않는다.

### Codex

- `AGENTS.md`, `aiop-status.md`, `aiop-plan.md`를 읽고 실행한다.
- 계획에 없는 대규모 리팩터링을 하지 않는다.
- 작업 후 수정 파일, 구현 요약, 검증 결과를 정리한다.
- 가능하면 `aiop-plan.md` 체크리스트를 갱신한다.
- 현재 상태가 바뀌면 `aiop-status.md`도 갱신한다.

---

## 4. 작업 원칙

- 기존 UI/UX를 임의로 갈아엎지 않는다.
- 한 번에 하나의 작업 단위만 처리한다.
- 작업 전 관련 파일을 먼저 확인한다.
- 타입, 파일 구조, 데이터 구조를 추측하지 않는다.
- 실제 코드와 문서가 다르면 실제 코드를 우선한다.
- `any` 사용을 피한다.
- `.env`, secret, key 파일은 출력하지 않는다.
- localStorage key는 임의로 변경하지 않는다.
- 백엔드 전환 전 기존 frontend-only 기능을 망가뜨리지 않는다.

---

## 5. AIOP 현재 방향

AIOP는 개인용 All-In-One Page 대시보드다.

현재 핵심 방향:

```txt
v1.x: frontend-only MVP + localStorage
v2.0: Supabase + Google OAuth + RSC/Server Actions + 환율 + AI Route Handler 기반 마련
v2.1+: AI 자동분류 / 오늘 할 일 추천 / 투자종목 추천 / 뉴스 추천
```

---

## 6. 고정 기술 기준

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- localStorage 기반 v1.x 데이터 유지
- v2.0 백엔드는 Supabase 기준
- DB 컬럼은 snake_case
- TypeScript 도메인 타입은 camelCase
- DB ↔ TS 변환은 mapper 계층에서 처리
- 삭제 정책은 hard delete
- 태그는 Postgres `text[]` + GIN index 기준

---

## 7. 검증 명령어

가능하면 작업 후 아래 순서로 실행한다.

```bash
npx tsc --noEmit
npm run lint
npm run build
```

개발 서버 확인이 필요한 경우:

```bash
npm run dev
```

실패한 명령이 있으면 성공한 것처럼 말하지 말고 실패 원인과 로그 요약을 남긴다.

---

## 8. 작업 완료 보고 형식

작업 완료 후 아래 형식으로 보고한다.

```md
## 수정 파일

- `src/...`

## 구현 내용

- ...

## 검증

```bash
npx tsc --noEmit
npm run lint
npm run build
```

결과:
- tsc: 통과 / 실패
- lint: 통과 / 실패
- build: 통과 / 실패

## 남은 작업

- ...



## 9. 문서 관리 규칙

- 새 active 계획 파일을 만들지 않는다.
- 현재 계획은 항상 `.agent-notes/aiop-plan.md`에만 둔다.
- 완료된 계획은 필요한 요약만 `.agent-notes/aiop-archive.md`로 옮긴다.
- 현재 상태 변경은 `.agent-notes/aiop-status.md`에 반영한다.
- `AGENTS.md`는 300줄 이하로 유지한다.

# AIOP 배포 전 확인 단계

## 10. 배포 전 확인 단계

배포 전에는 아래 항목을 반드시 확인한다.

### 10.1 기본 검증

```bash
git status --short
npx tsc --noEmit
npm run lint
npm run build
```

- 실패한 명령이 있으면 배포하지 않는다.
- 실패 로그를 요약하고 원인 수정 후 다시 실행한다.
- `npm run build` 통과만으로 실제 기능 검증이 끝난 것으로 보지 않는다.

### 10.2 Git 상태

- 의도하지 않은 파일이 포함되지 않았는지 확인한다.
- `.env`, `.env.local`, secret, key 파일은 절대 커밋하지 않는다.
- `node_modules`, `.next`, `.vercel`, 로그 파일은 커밋하지 않는다.
- 배포 전 커밋 단위를 작게 유지한다.
- 큰 기능은 가능하면 별도 브랜치에서 작업하고 Preview 배포로 먼저 확인한다.

### 10.3 환경 변수 / Secret

- 브라우저에 노출되어도 되는 값만 `NEXT_PUBLIC_` prefix를 사용한다.
- 서버 전용 키는 Client Component에서 사용하지 않는다.
- 아래 값은 서버 전용으로만 다룬다.

```txt
SUPABASE_SERVICE_ROLE_KEY
AI_GATEWAY_API_KEY
OPENAI_API_KEY
OAUTH_GOOGLE_CLIENT_SECRET
```

- 코드에서 secret이 노출되지 않았는지 확인한다.

```bash
git grep "SERVICE_ROLE"
git grep "OPENAI_API_KEY"
git grep "sk-"
```

### 10.4 인증 / 권한

v2.0 백엔드 작업 이후에는 다음을 확인한다.

- 로그인하지 않은 사용자는 보호 라우트에 접근할 수 없어야 한다.
- Supabase 테이블은 RLS가 활성화되어야 한다.
- 개인 데이터 테이블은 `auth.uid() = user_id` 정책을 가져야 한다.
- 다른 Google 계정으로 로그인했을 때 데이터가 분리되어야 한다.
- Service Role Key를 클라이언트에서 사용하지 않는다.

### 10.5 DB / 마이그레이션

- DB 스키마 변경은 SQL 또는 migration 파일로 관리한다.
- DB 컬럼은 snake_case를 유지한다.
- TypeScript 타입은 camelCase를 유지한다.
- DB ↔ TS 변환은 mapper 계층에서 처리한다.
- 컬럼명 변경, nullable 변경, enum 변경은 기존 데이터 영향도를 확인한다.
- 배포 전 migration 적용 순서를 문서화한다.

### 10.6 수동 QA

최소 아래 경로는 직접 확인한다.

```txt
/
/wants
/calculator
/regret
/subscriptions
/insights
/notes
/todos
/retros
/retros/weekly
```

확인 항목:

- 새로고침 후 현재 라우트가 유지되는지
- Sidebar / BottomTabBar 이동이 정상인지
- QuickAdd 저장 후 해당 화면에 반영되는지
- localStorage 데이터가 유지되는지
- export / import가 깨지지 않는지
- 다크 / 라이트 모드가 정상인지
- 컴팩트뷰가 깨지지 않는지
- 모바일 375px 기준으로 overflow가 없는지
- 모달 저장 버튼이 모바일 키보드에 가려지지 않는지

### 10.7 비용 / API 제한

AI Route Handler 또는 외부 API를 추가할 때는 다음을 지킨다.

- API Route는 로그인 사용자만 호출할 수 있게 한다.
- AI API 호출은 서버에서만 수행한다.
- 입력 길이 제한을 둔다.
- 사용자별 일일 호출 제한을 둔다.
- 실패 시 사용자에게 안전한 에러 메시지를 반환한다.
- 외부 API 장애 시 fallback UI를 제공한다.

### 10.8 배포 환경

Vercel 배포 시 확인한다.

- Production / Preview / Development 환경 변수를 구분한다.
- Production URL을 Supabase Auth Redirect URL에 등록한다.
- Google OAuth Authorized Redirect URI를 환경별로 등록한다.
- Preview 배포에서 먼저 수동 QA를 수행한다.
- Production 배포 후 핵심 라우트와 로그인 흐름을 다시 확인한다.

### 10.9 롤백 기준

아래 문제가 있으면 즉시 롤백하거나 배포를 중단한다.

- 로그인 불가
- 데이터 생성 / 삭제 불가
- 다른 사용자 데이터 접근 가능성
- build는 통과했지만 주요 라우트 런타임 에러 발생
- 환경 변수 누락으로 API 전체 실패
- 모바일에서 핵심 기능 사용 불가

배포는 “일단 올리기”보다 “문제 발생 시 되돌릴 수 있게 올리기”를 우선한다.
