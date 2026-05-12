# AIOP Status

> 목적: 현재 프로젝트 상태 단일 기준 문서.
> Claude와 Codex는 작업 전 이 문서를 읽고, 문서와 실제 코드가 다르면 실제 코드를 우선한다.

---

## 1. 한눈에 요약

- 버전: v1.3 + K.P.T 회고 도메인 반영 중, v1.4 후보
- 상태: frontend-only MVP
- 데이터: localStorage 영속화
- 백엔드: 아직 미연결
- 인증: 아직 없음
- 외부 API: 아직 없음
- 자동 테스트: 없음. 수동 QA 중심
- 다음 큰 목표: v2.0 Supabase 백엔드 + Google OAuth + RSC/Server Actions

---

## 2. 현재 라우트

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

`AppShell`은 `src/app/layout.tsx`에서 공통 shell로 감싼다.

---

## 3. 주요 도메인 상태

| 도메인 | CRUD | localStorage | 검색 | 비고 |
|---|---:|---|---:|---|
| Dashboard | - | `aiop:layout`, `aiop:hero-message` | - | 위젯 드래그/리사이즈/visibility |
| Wants | ✅ | `aiop:wants` | ✅ | 구매 목표 |
| Calculator | - | - | - | 계산 전용 |
| Regret | ✅ | `aiop:regret-items` | - | 후회 기록 |
| Subscriptions | ✅ | `aiop:subscriptions` | ✅ | 구독 관리 |
| Insights | ✅ | `aiop:insights` | ✅ | 인사이트 보관 |
| Notes | ✅ | `aiop:notes` | ✅ | inbox → processed → archived |
| Todos | ✅ | `aiop:todos` | ✅ | 할 일 |
| Retros | ✅ | `aiop:retros` | ✅ | K.P.T, Try↔Todo, 이월, Streak, 주간 롤업 |

---

## 4. 기술 스택

| 영역 | 사용 |
|---|---|
| Framework | Next.js App Router |
| UI | React + TypeScript + Tailwind CSS |
| Icons | `lucide-react` |
| Dashboard grid | `react-grid-layout` |
| Summary card reorder | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Persistence | `window.localStorage`, custom `useLocalStorage` |
| Backend/Auth | 없음 |
| Test | 자동화 없음 |

---

## 5. localStorage 키

| Key | Value |
|---|---|
| `aiop:wants` | `WantItem[]` |
| `aiop:subscriptions` | `Subscription[]` |
| `aiop:insights` | `Insight[]` |
| `aiop:notes` | `Note[]` |
| `aiop:regret-items` | `RegretItem[]` |
| `aiop:todos` | `TodoItem[]` |
| `aiop:retros` | `KptRetro[]` |
| `aiop:layout` | `DashboardLayout` |
| `aiop:hero-message` | `string` |
| `aiop-compact-mode` | `boolean` |
| `aiop-theme-mode` | `"light" | "dark"` |

Export / Import은 위 키들을 기준으로 관리한다.

---

## 6. 핵심 타입

위치는 주로 `src/types/index.ts`, `src/types/layout.ts`.

```txt
WantItem
RegretItem
Subscription
Insight
Note
TodoItem
RetroItem
KptRetro
WidgetId
SummaryCardId
DashboardLayout
```

현재 실제 타입명과 과거 명세가 다를 수 있다.  
항상 현재 코드의 타입 정의를 우선한다.

---

## 7. K.P.T 회고 기능 상태

구현된 기능:

- `/retros` 오늘 회고 + 과거 회고 목록
- `/retros/weekly` 주간 롤업
- Keep / Problem / Try 항목 추가, 삭제
- Try 체크박스 토글
- Try → Todo 자동 연동
- 어제 미완료 Try 이월
- Streak 계산
- Problem 키워드 Top 3
- 검색 통합
- 과거 회고 날짜 선택 / 편집 / 삭제

핵심 파일 후보:

```txt
src/app/retros/
src/components/retros/
src/lib/retros.ts
src/lib/storageNormalizers.ts
src/lib/dataPortability.ts
src/types/index.ts
```

---

## 8. 금액 입력 상태

공통 금액 입력 컴포넌트가 있다.

적용 위치:

```txt
구매 목표 추가
구독 추가
후회 기록 추가
자산 구매 계산기
```

현재 판단:

- KRW 입력 시 `원 / 천 / 만 / 억` 단위 버튼을 제공한다.
- 입력값은 내부적으로 원 단위 숫자로 유지한다.
- UX는 개선 여지가 있다.
- 단위 버튼과 입력값의 관계가 초보 사용자에게 약간 헷갈릴 수 있다.
- 다음 개선 후보는 입력 내부에 단위 선택을 더 밀착시키는 것.

---

## 9. v2.0 확정 방향

| 항목 | 결정 |
|---|---|
| Backend/Auth | Supabase |
| Auth provider | Google OAuth |
| Data flow | RSC + Server Actions |
| DB naming | snake_case |
| TS naming | camelCase |
| Mapper | `src/lib/db/mappers.ts` |
| Currency | KRW 기준 자동 환산 |
| FX API | Frankfurter 1순위 |
| Tags | Postgres `text[]` + GIN index |
| Delete | Hard delete |
| URL | App Router route-based pages |

---

## 10. v2.0 진행 순서 요약

1. Supabase 프로젝트 생성 + 환경변수
2. Postgres 스키마 + RLS
3. Google OAuth
4. `@supabase/ssr` 서버/클라이언트 세팅
5. DB ↔ TS mappers
6. Wants 도메인부터 Server Component + Server Action으로 전환
7. 나머지 도메인 순차 전환
8. 환율 캐시 테이블 + Cron
9. localStorage export JSON import 도구
10. 서버 기반 export
11. dashboard layout / user settings 동기화
12. localStorage 사용 코드 제거
13. v2.1+ AI Route Handler 추가

---

## 11. 현재 우선순위

1. 미커밋 변경분 정리
2. 라우트 분리 / K.P.T / 금액 입력 수동 QA
3. README 현재 상태 반영
4. `tsconfig.tsbuildinfo` gitignore 여부 확인
5. v2.0 Supabase 외부 설정
6. v2.0 스키마 SQL 작성

---

## 12. 주의사항

- 백엔드 연결 전에는 기존 localStorage 동작을 깨지 않는다.
- 라우트는 이미 App Router 구조로 분리된 것으로 본다.
- v2.0 문서에 SWR 흔적이 있으면 RSC + Server Actions 결정을 우선한다.
- `Retros` 신규 도메인이 v2.0 스키마에도 포함되어야 한다.
