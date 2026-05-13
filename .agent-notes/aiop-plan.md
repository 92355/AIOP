# AIOP Active Plan

> 목적: 현재 실행할 단일 계획 파일.
> Claude는 이 파일을 갱신하고, Codex는 이 파일을 읽고 실행한다.
> 새 active plan 파일을 만들지 않는다.

---

## 1. Current Goal

**v2.2 구매목표 AI 점수 MVP + 구독 결제 알림 MVP**

사용자 요청:

```txt
앞으로 구현하고 싶은 기능:
1. AI가 관심사 뉴스 토픽을 가져와 투자에 도움주기
2. AI가 구매 목표 점수 측정
2-1. 구매예정 혹은 위시 가격, 우선순위, 상태, 목표기간 등을 기반으로 AI가 구매점수 부여
2-2. 구매목표 기능은 아직 표현하고 싶은 방향이 불명확해서 대화 필요
3. 그때 살껄: 최초 목격 가격 대비 현재가격, 인지/미인지, 손익률 표출
4. 구독관리: 결제일 알림, 1일전/3일전/1주전 선택, 해당 일자에 모달 표시
5. 구독관리: 대출금 이자 납부일 기능 추가 검토
6. K.P.T 회고록: 타임박싱 등 시간관리 로직과 결합 검토
7. 일정관리 페이지: todo, 구매목표 등 일정을 관리하는 기능 검토
```

이번 v2.2는 범위를 좁혀 **구매목표 AI 점수 MVP**와 **구독 결제 알림 MVP**만 구현한다.

---

## 2. Scope

### Include

- 구매목표 기능 정의를 MVP 기준으로 정리
- 구매목표 AI 점수 산정 API Route Handler 추가
- 구매목표 항목의 가격, 우선순위, 상태, 목표기간, 이유를 입력으로 사용
- AI 응답은 점수, 판단 요약, 긍정 요인, 우려 요인, 다음 행동으로 제한
- AI 호출은 서버에서만 수행
- 로그인 사용자만 AI API 호출 가능
- AI 호출 입력 길이 제한
- 사용자별 호출 제한 또는 쿨다운 기본 구조 추가
- AI 실패 시 기존 구매목표 기능은 계속 사용 가능하게 fallback 처리
- 구독관리 결제 알림 필드 추가
- 결제 1일 전, 3일 전, 1주 전 알림 offset 선택 UI 추가
- 앱 진입 시 오늘 표시 대상 구독 알림을 모달로 표시
- 대출금 이자 납부일은 구독관리 모델에 확장 가능한 형태로만 반영
- `aiop-status.md`에 v2.2 변경 상태 반영

### Exclude

- AI 뉴스/투자 토픽 수집
- AI의 직접적인 투자 추천, 매수/매도 의견
- Regret 실시간 가격 추적
- 상품/주식/코인 가격 외부 API 연동
- K.P.T 타임박싱 고도화
- 별도 일정관리 페이지
- 브라우저에서 AI API 직접 호출
- 새 라이브러리 설치
- 대규모 UI 개편
- Supabase 원격 migration 직접 적용

---

## 3. Product Decisions

| # | 결정 | 내용 |
|---|---|---|
| V22-1 | 구매목표 방향 | 단순 위시리스트가 아니라 소비 의사결정 보조 도구로 본다 |
| V22-2 | AI 점수 | 0~100 숫자 + 짧은 판단 근거를 반환한다 |
| V22-3 | AI 표현 | 구매 강요/확정 표현을 피하고 의사결정 참고로 표시한다 |
| V22-4 | AI 입력 | 구매목표의 기존 필드를 우선 사용하고 필수 입력을 과도하게 늘리지 않는다 |
| V22-5 | AI 저장 | MVP는 즉시 분석 결과 표시를 우선하고, DB 저장은 구현 난이도 확인 후 결정한다 |
| V22-6 | 호출 제한 | 사용자별 일일 제한 또는 쿨다운 중 하나를 최소 구현한다 |
| V22-7 | 구독 알림 | 브라우저 푸시가 아니라 앱 진입 시 모달 알림으로 시작한다 |
| V22-8 | 알림 기준 | 결제일 기준 1일 전, 3일 전, 7일 전 선택 |
| V22-9 | 대출 이자 | v2.2에서는 `subscription`과 같은 반복 납부 항목으로 표현 가능하게 설계한다 |

---

## 4. Expected Files to Change

실제 조사 후 불필요한 파일은 수정하지 않는다.

```txt
.agent-notes/aiop-plan.md
.agent-notes/aiop-status.md
supabase/schema.sql
src/app/api/ai/want-score/route.ts              (신규)
src/lib/ai/wantScore.ts                         (신규 가능)
src/hooks/useWantScore.ts                       (신규 가능)
src/components/wants/WantsView.tsx
src/components/wants/AddWantModal.tsx
src/components/wants/WantScorePanel.tsx         (신규 가능)
src/app/wants/actions.ts
src/components/subscriptions/SubscriptionsView.tsx
src/components/subscriptions/AddSubscriptionModal.tsx
src/components/subscriptions/SubscriptionReminderModal.tsx (신규 가능)
src/app/subscriptions/actions.ts
src/lib/db/mappers.ts
src/types/index.ts
```

주의:

- 계획서에 없는 파일을 3개 이상 추가/수정해야 하면 먼저 이유를 확인한다.
- AI API provider 연동 방식은 기존 환경 변수와 배포 환경을 확인한 뒤 결정한다.

---

## 5. Tasks

### 준비 / 조사

- [ ] **T1. Wants 현재 데이터 구조 확인** — 가격, 우선순위, 상태, 목표기간, reason 필드 확인
- [ ] **T2. Subscriptions 현재 데이터 구조 확인** — 결제일/가격/상태 필드와 mapper 확인
- [ ] **T3. AI 환경 변수 확인** — 서버 전용 키 이름과 배포 환경 변수 정책 확인
- [ ] **T4. 호출 제한 저장 방식 결정** — DB 테이블, 기존 테이블 필드, 또는 단순 쿨다운 중 선택

### 구매목표 AI 점수 MVP

- [ ] **T5. AI 점수 입력 타입 정의** — 구매목표 항목에서 AI에 보낼 최소 필드 확정
- [ ] **T6. AI 점수 출력 타입 정의** — score, summary, pros, cons, nextAction
- [ ] **T7. `POST /api/ai/want-score` 작성** — 인증, 입력 검증, 호출 제한, 안전한 에러 반환
- [ ] **T8. Wants UI 연결** — 구매목표 항목에서 AI 점수 요청 버튼/패널 추가
- [ ] **T9. 실패 fallback 처리** — AI 실패 시 사용자에게 안전한 안내 표시

### 구독 결제 알림 MVP

- [ ] **T10. 구독 스키마 확장 SQL 작성** — 결제일, 알림 offset, 납부 유형 필드 검토 및 추가
- [ ] **T11. Subscription 타입/mapper 확장** — DB snake_case와 TS camelCase 변환 유지
- [ ] **T12. 구독 추가/수정 UI 확장** — 결제일, 알림 기준 선택 추가
- [ ] **T13. 앱 진입 알림 모달 추가** — 오늘 표시할 결제 알림을 모달로 표시
- [ ] **T14. 대출 이자 납부 항목 표현 검토** — 구독/대출이 같은 반복 납부 UI에서 어색하지 않은지 확인

### 문서 / 검증

- [ ] **T15. `aiop-status.md` 업데이트** — v2.2 변경사항 반영
- [ ] **T16. TypeScript 확인** — `npx tsc --noEmit`
- [ ] **T17. lint 확인** — `npm run lint`
- [ ] **T18. build 확인** — `npm run build`

---

## 6. Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

수동 QA:

- [ ] 로그인 상태에서 `/wants` 접근
- [ ] 구매목표 항목에서 AI 점수 요청
- [ ] AI 응답이 점수/요약/긍정 요인/우려 요인/다음 행동으로 표시
- [ ] AI API 실패 시 기존 구매목표 화면이 깨지지 않음
- [ ] 미인증 상태에서 AI API 요청 시 401
- [ ] 호출 제한 초과 시 안전한 메시지 표시
- [ ] 로그인 상태에서 `/subscriptions` 접근
- [ ] 결제일과 알림 기준 저장
- [ ] 오늘 알림 대상 구독이 모달로 표시
- [ ] 알림 모달 닫기 후 화면 사용 가능
- [ ] 기존 구독 항목이 마이그레이션 후에도 표시 유지

---

## 7. Done Criteria

- [ ] 구매목표 AI 점수 MVP 동작
- [ ] AI API가 서버 Route Handler에서만 호출됨
- [ ] AI API 인증/입력 제한/호출 제한 적용
- [ ] 구독 결제 알림 MVP 동작
- [ ] 기존 구독/구매목표 데이터 표시 유지
- [ ] `aiop-status.md`에 v2.2 상태 반영
- [ ] `tsc`, `lint`, `build` 통과

---

## 8. v2.3+ 후보

- AI 관심사 뉴스 토픽 수집
- 투자 관련 뉴스 요약/리스크/기회 정리
- Regret 가격 추적
- 주식/코인/상품 가격 provider 분리
- Wants / Regret 환율 환산 표시 확장
- K.P.T 타임박싱 결합
- Todo, 구매목표, 구독, 회고를 묶는 일정관리 페이지
- 결제 알림을 브라우저 Notification 또는 이메일로 확장
- 환율 API `429` 응답의 `cooldownRemainingMs`를 패널 UI에 직접 표시
