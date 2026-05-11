# AIOP 앞으로 진행할 작업 (Action Items)

> 작성일: 2026-05-11
> 대상 브랜치: `main`
> 기준: 코드 전체 재독 후 발견한 실제 격차
> 짝 문서: `.agent-notes/aiop-current-status-and-next-steps.md` (현재 상태 스냅샷)

---

## 0. 우선순위 한눈에 보기

| Pri | 항목 | 코드 변경 | 예상 난이도 |
| --- | --- | --- | --- |
| P0 | Regret 화면 라벨 정상화 (Sidebar / Header / BottomTabBar) | 1줄 수정 | 매우 낮음 |
| P0 | Wants 카테고리 필터 동작 연결 | 30줄 내외 | 낮음 |
| P1 | 컴팩트뷰 위젯 순서 변경 UX 확정 | 60~120줄 | 중간 |
| P1 | 편집 모드 / 저장 / 초기화 시각 검증 | 코드 변경 없음 (수동 QA) | 낮음 |
| P1 | Dashboard layout `minY` 보정 로직 재검토 | 검토 후 결정 | 낮음 |
| P2 | v1.3 export / import 기능 | 신규 컴포넌트 + 유틸 | 중간 |
| P3 | Notes status 변경 UI | 카드 / 뷰 확장 | 중간 |
| P3 | Header 검색창 동작 연결 | 글로벌 상태 + 필터링 | 중간 |
| P3 | localStorage schema guard 강화 | 도메인별 normalizer | 중간 |
| P4 | AGENTS.md 갱신 | 문서 | 낮음 |
| P4 | 기존 `current-status-and-structure.md` (v0.8 시점) 정리 | 문서 | 매우 낮음 |
| P5 | v2.0 Supabase + Auth + AI Route Handler 계획서 작성 | 문서 | 높음 |

---

## P0 — 즉시 처리 가능한 버그 / 누락

### P0-1. Regret 화면 라벨 정상화

**문제**
`src/components/layout/navItems.ts` 에서:

```ts
viewTitles.regret = "라고할때 살껄 이라고 할때 살껄"
navItems[3].label = "라고할때 살껄 이라고 할때 살껄"
```

이 텍스트가 그대로 Sidebar, Header(`viewTitles[selectedView]`), BottomTabBar에 노출된다. `RegretTrackerView` 내부 h2는 "그때 살걸 기록장"으로 정상이라 화면마다 명칭이 다르다.

**작업**
- `viewTitles.regret` → `"그때 살걸 기록장"` 또는 `"후회 기록장"` 으로 통일.
- `navItems` 의 `regret` 항목 `label` 도 같은 표기로 통일 (Sidebar는 짧은 별칭이 좋으면 `"후회 기록"` 등).

**verify**
- Sidebar / Header 타이틀 / BottomTabBar 세 곳 모두 정상 노출.
- `RegretTrackerView` 내부 h2와 충돌 없는지 확인.

---

### P0-2. Wants 카테고리 필터 동작 연결

**문제**
`src/components/wants/WantsView.tsx:46~58` — `filters` 배열을 렌더링하지만 버튼에 `onClick`이 없고, 활성 스타일이 `index === 0` 으로 강제돼 있다. 실제 필터링이 일어나지 않는다.

**작업**
- `selectedCategory` state 추가 (`"All" | WantItem["category"]`).
- 버튼 클릭 시 state 갱신, 활성 스타일은 `selectedCategory === filter` 로 판정.
- `items` 렌더링 전에 `selectedCategory === "All"` 이거나 `item.category === selectedCategory` 인 것만 통과.
- 빈 상태 안내 문구도 필터 결과 0건일 때 분기.

**verify**
- "Productivity" 클릭 시 Productivity 항목만 표시.
- "전체" 복귀 시 전체 표시.
- 추가 후 즉시 필터 결과에 반영.

---

## P1 — v1.1 ~ v1.2 마무리

### P1-1. 컴팩트뷰 / 모바일에서 위젯 순서 변경 UX 확정

**현재 상태**
- `WidgetFrame.tsx` 는 `onMoveUp` / `onMoveDown` props를 받도록 정의돼 있지만 `DashboardGrid.tsx` 에서 사용하지 않는다.
- 컴팩트뷰는 1-col 강제. `react-grid-layout`의 `Responsive` 컴포넌트가 narrow 모드에서 드래그 핸들로 위/아래 이동을 처리하지만, 모바일 / 컴팩트뷰에서 드래그 인터랙션이 자연스러운지 검증되지 않았다.

**선택지**

- A안: `react-grid-layout`의 narrow 드래그를 그대로 쓰고 위/아래 버튼 props를 제거.
- B안: narrow 모드에서는 드래그를 끄고 `WidgetFrame`의 위/아래 버튼만 사용. `useLayoutContext.setNarrowLayout` 을 버튼 이벤트와 연결.
- C안: 두 가지 모두 켜고 사용자가 편한 방식 선택.

**추천**
- B안. 모바일 터치에서 드래그가 스크롤과 충돌하기 쉽고, 위/아래 버튼은 직관적이며 props가 이미 준비돼 있다.
- 데스크탑은 현행 그대로 드래그 유지.

**작업 (B안 기준)**
1. `DashboardGrid.tsx` 에서 `isNarrowLayout` 이면 `dragConfig.enabled = false`.
2. `WidgetFrame` 에 `canMoveUp / canMoveDown / onMoveUp / onMoveDown` 를 narrow 모드 한정으로 주입.
3. 핸들러는 `narrowWidgetsOrder` 배열을 슬라이스해 위/아래로 위치 교환 후 `setNarrowLayout` 호출.

**verify**
- 폭 < 768px 에서 위/아래 버튼만 노출, 드래그 동작 안 함.
- 순서 변경 → 저장 → 새로고침 후 유지.
- 데스크탑(폭 ≥ 768px) 동작은 영향 없음.

---

### P1-2. 편집 모드 / 저장 / 초기화 시각 검증

코드 변경 없음, **수동 QA 체크리스트**.

- [ ] 편집 모드 진입 시 위젯 외곽선(`outline-emerald-400/40`) 표시.
- [ ] 드래그 핸들 칩(좌상단 `GripHorizontal`) 표시 + `cursor-grab` / `active:cursor-grabbing`.
- [ ] 리사이즈 핸들이 편집 모드일 때 상시 노출 (`.dashboard-grid-edit .react-resizable-handle { opacity: 1 }`).
- [ ] "저장 안 하고 종료" 시 변경 사항이 폐기되고 직전 저장 상태로 복귀.
- [ ] "저장" 시 `aiop:layout` 업데이트 + 편집 모드 해제.
- [ ] "레이아웃 초기화" 시 확인 다이얼로그 → 확인 시 `defaultDashboardLayout` 복원.
- [ ] 라이트 모드 / 다크 모드 양쪽에서 위 모든 인터랙션 정상.

---

### P1-3. `useDashboardLayout` 의 `minY` 보정 로직 재검토

**현재 동작**
`normalizeWidgetLayouts` 안에서 editable 위젯들의 `minY > 0` 이면 전체를 `Math.max(0, layout.y - minY)` 로 위로 당긴다.

**의심되는 케이스**
- 사용자가 의도적으로 모든 위젯을 Hero 아래로 옮긴 경우(예: `y >= 3`) 새로고침 시 위치가 위로 끌어올려진다.
- Hero(y=0) 가 항상 위에 있으므로 editable 의 `y` 가 음수가 아니어야 하지만, 0보다 큰 값을 다시 0으로 당기는 것이 의도된 동작인지 명세 확인 필요.

**작업**
- 위 시나리오를 재현해 동작 확인.
- 의도된 동작이면 코드 주석에 한 줄 메모(왜 보정하는지).
- 의도와 다르면 보정 조건을 `minY < 0` 으로 좁히는 등 수정.

---

## P2 — v1.3 데이터 export / import

**목표**
v2.0 Supabase 이전 안전망. 모든 `aiop:*` 키를 JSON 1개 파일로 묶어 내보내고, 같은 형식의 파일을 업로드해 복원.

**작업 분해**

1. **export 유틸** (`src/lib/dataPortability.ts` 신규)
   - 키 목록: `aiop:wants`, `aiop:subscriptions`, `aiop:insights`, `aiop:notes`, `aiop:regret-items`, `aiop:todos`, `aiop:layout`, `aiop-compact-mode`, `aiop-theme-mode`.
   - 각 키의 현재 값을 읽어 `{ version: 1, exportedAt: ISO string, data: { ... } }` 로 직렬화.
   - Blob 만들어 다운로드 트리거.
2. **import 유틸**
   - 파일 선택 → JSON parse → `version === 1` 확인.
   - 키별로 schema validation (최소 타입 가드 — Array 여부, 객체 여부).
   - "덮어쓰기" / "머지" 선택 (머지는 v1.3 범위 밖이면 덮어쓰기만 우선).
   - 적용 후 페이지 리로드 또는 `refreshKey` 갱신.
3. **UI 진입점**
   - Settings 메뉴 하단에 "데이터 내보내기" / "데이터 가져오기" 두 항목 추가.
4. **에러 처리**
   - 잘못된 JSON / 잘못된 version → 사용자에게 명확한 메시지.

**verify**
- export → 다른 브라우저 / 시크릿 창에서 import → 모든 화면 정상.
- 잘못된 파일 업로드 시 데이터 손상 없음.
- 빈 localStorage 상태에서도 export 가능 (빈 데이터로 떨어짐).

---

## P3 — UX 보강

### P3-1. Notes status 변경 UI

- `Note.status` 는 `inbox | processed | archived` 인데 현재 화면은 추가 시 `inbox` 만 설정하고 상태 변경 UI가 없다.
- 카드에 상태 토글 버튼(또는 사이클 버튼) 추가.
- `SummaryCards` 의 "수집함" 카운트가 `status === "inbox"` 기준이라, 상태 변경이 가능해야 의미를 갖는다.

### P3-2. Header 검색창 동작 연결

- 현재 `<input>` 만 있고 동작 없음.
- 후보 동작:
  - 단순: 현재 보고 있는 뷰 한정 클라이언트 사이드 필터.
  - 확장: 전체 도메인(`wants / subscriptions / insights / notes / regret / todos`) 통합 검색 + 뷰 전환.
- 후자가 의미 있지만 v1.x 범위가 커질 수 있음. **추천: 일단 단순 버전으로 시작**, 검색 결과 0건이면 안내 노출.

### P3-3. localStorage schema guard 강화

- `aiop:layout` 만 정규화 로직 존재 (`useDashboardLayout`).
- `aiop:wants` 등은 `Array.isArray` 만 체크하고 필드 검증 없음 → 외부 import / 잘못된 파일 복원 시 런타임 에러 가능.
- 각 도메인 타입별 최소 normalizer 작성 (필수 필드 확인 + 누락 시 default 채움 + 잘못된 타입은 mock fallback).

---

## P4 — 문서 정리

### P4-1. AGENTS.md 갱신

- 현재 AGENTS.md 는 v0.8 시점 기준.
- 다음 항목 추가:
  - v1.0 완료 (UI 품질 정리, 빠른 추가, 컴팩트뷰, Todo, 라이트/다크).
  - v1.1 ~ v1.2 부분 완료 (드래그&드롭, visibility 토글, draft 패턴).
  - 신규 디렉토리 (`contexts/`, `todos/`, `quick-add/`, `layout/grid/`, `layout/settings/`).
  - 추가된 storage 키 (`aiop:todos`, `aiop:layout`, `aiop-compact-mode`).
  - `WantItem.score` vs 명세 `aiScore` 등 필드명 불일치 정리 (현 코드를 정설로 보고 명세 갱신).

### P4-2. 기존 `current-status-and-structure.md` 정리

- v0.8 시점 outdated.
- 옵션 1: 최상단에 `> deprecated: 2026-05-11. 최신 정보는 aiop-current-status-and-next-steps.md 참고` 한 줄 추가.
- 옵션 2: 삭제.
- 추천: 옵션 1 — 작업 이력 보존 + 혼동 방지.

---

## P5 — v2.0 백엔드 계획 (준비)

본격 시작 전 다음 항목을 별도 계획서로 작성:

- 도메인 테이블 스키마 (Postgres): `wants`, `subscriptions`, `insights`, `notes`, `regret_items`, `todos`, `dashboard_layouts`.
- RLS 정책: `auth.uid() = user_id`.
- Supabase 클라이언트 / 서버 분리 (`@supabase/ssr`).
- 인증 흐름: Google OAuth → `auth.users` → 첫 로그인 시 mock data seed 여부.
- 마이그레이션 전략: 기존 localStorage 데이터를 v1.3 export 포맷으로 묶은 뒤 서버에 일괄 import.
- AI Route Handler: `/api/ai/*` — 키는 `process.env`만, 클라이언트 노출 금지.
- Vercel 배포 (Fluid Compute 기본, AI Gateway 사용 고려).

위 항목은 v1.1 ~ v1.3 마무리 후 별도 `aiop-v20-backend-plan.md` 로 분리해 작성한다.

---

## 작업 진행 순서 제안

```text
1. P0-1, P0-2  → 한 PR (라벨/필터, 5~10분)
2. P1-1, P1-2  → 한 PR (컴팩트뷰 위젯 순서 + 수동 QA, 1~2시간)
3. P1-3        → 별도 점검 후 코드 또는 주석 (30분)
4. P4-1, P4-2  → 문서 PR (30분)
5. P2 (v1.3)   → 단독 PR (2~3시간)
6. P3 시리즈   → 우선순위에 따라 분리 진행
7. P5 계획서   → P2 끝난 뒤 별도 세션
```

각 단계는 README의 "다음 단계로 진행하기 전 검증" 정책에 따라, 빌드 / 타입 체크 / 수동 동작 확인을 통과해야 다음으로 넘어간다.

---

## 세션 이어가기

```text
.agent-notes/aiop-next-steps.md 읽고 P0 부터 진행해줘
```

또는 특정 항목만:

```text
.agent-notes/aiop-next-steps.md 의 P0-1, P0-2 진행해줘
```
