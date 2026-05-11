# AIOP 다음 작업 계획 (Stage 2)

> 작성일: 2026-05-11
> 기준: `aiop-implementation-log.md` 확인 후 워킹 트리 재점검 결과
> 짝 문서: `aiop-next-steps.md` (Stage 1, 대부분 처리됨)

---

## 0. Stage 1 진행 결과 요약

`aiop-implementation-log.md` 기준으로 처리 완료:

| 항목 | 결과 |
| --- | --- |
| P0-1 Regret 라벨 정상화 | ✅ `viewTitles.regret = "그때 살걸 기록장"`, navItems label `"후회 기록"` |
| P0-2 Wants 카테고리 필터 동작 | ✅ `selectedCategory` state + onClick + filteredItems |
| P1-1 컴팩트뷰 위젯 순서 변경 | ✅ `handleMoveNarrowWidget` + `WidgetFrame` 위/아래 버튼 |
| Bonus 1 — useLocalStorage 안정화 | ✅ `useRef`로 initialValue 고정 |
| Bonus 2 — 설정 드롭다운 z-index | ✅ Header/Sidebar stacking context + z-index 상향 |
| Bonus 3 — 위젯 overflow 정리 | ✅ `WidgetFrame` overflow-hidden + 목록 위젯 내부 스크롤 |
| Bonus 4 — SummaryCard 클릭 이동 | ✅ 비편집 모드 → `targetView`로 라우팅 |
| Bonus 5 — SPA 뒤로가기 (view query) | ✅ `?view=` 동기화 + popstate 복원 |
| Bonus 6 — SummaryCard hover/active 디자인 | ✅ translate / shadow / icon 반응 |
| Bonus 7 — Hero 문구 사용자 편집 | ✅ `aiop:hero-message` localStorage 저장 |

검증: `npm run lint`, `npm run build`, `npx tsc --noEmit` 모두 통과.

---

## 1. 남은 수동 QA (선행 조건)

implementation-log "남은 수동 확인" 섹션과 동일. 이 항목들이 통과되어야 Stage 2 신규 작업에 들어간다.

- [ ] Dashboard 설정 드롭다운이 모든 위젯/카드 위에 표시.
- [ ] 편집 모드에서 위젯 이동 / 저장 / 초기화 동작.
- [ ] 컴팩트뷰 위/아래 이동 후 저장 + 새로고침 유지.
- [ ] SummaryCard 클릭 → 대상 화면 이동 (편집 모드에선 동작 안 함).
- [ ] 브라우저 뒤로가기 / 앞으로가기 시 view query 와 화면 동기화.
- [ ] Hero 문구 편집 → 새로고침 후에도 유지.
- [ ] 라이트 / 다크 모드 양쪽에서 위 모든 인터랙션 정상.

---

## 2. Stage 2 신규 작업 (우선순위 순)

### S2-P0. URL 동기화 잔여 마무리 (작은 마무리 작업)

**상황**
`page.tsx` 가 `?view=` query 로 뷰를 동기화한다. 첫 마운트 시 `getViewFromUrl()` 로 초기 뷰를 설정하지만, **서버 렌더에서는 `dashboard` 로 시작 → 클라이언트에서 URL 기반으로 다시 set** 되는 구조라 초기 진입 시 깜빡임 가능성이 있다.

**작업**
- 새로고침으로 `?view=wants` 직진입 시 깜빡임 / 헤더 타이틀 잠시 어긋남 여부 수동 확인.
- 문제 있으면 다음 두 가지 중 선택:
  - 옵션 A: `Suspense` + `useSearchParams` 로 클라이언트 컴포넌트 분리.
  - 옵션 B: 초기 마운트 동안 일시적으로 본문을 빈 상태로 두기 (성능보다 깔끔함).
- 외부 링크 공유 / 북마크 사용성 측면이라 단순 옵션 B로 충분.

**verify**
- 새 탭에서 `http://localhost:3000/?view=insights` 직접 열기 → 헤더 타이틀이 처음부터 "인사이트 보관함".

---

### S2-P1. Hero 메시지 키를 데이터 portability 대상에 포함 (선결 작업)

**상황**
`aiop:hero-message` 가 신규 저장 키. v1.3 export / import 와 README 데이터 표에 누락돼 있다.

**작업**
- README "데이터 저장 방식" 표에 `aiop:hero-message` 행 추가.
- v1.3 export 유틸 설계 시 키 목록에 포함.

---

### S2-P2. v1.3 — 데이터 export / import 구현

목적: v2.0 Supabase 이전 안전망. 기기 간 이동도 가능해진다.

**전체 키 목록 (v1.3 기준)**

| 키 | 형태 |
| --- | --- |
| `aiop:wants` | `WantItem[]` |
| `aiop:subscriptions` | `Subscription[]` |
| `aiop:insights` | `Insight[]` |
| `aiop:notes` | `Note[]` |
| `aiop:regret-items` | `RegretItem[]` |
| `aiop:todos` | `TodoItem[]` |
| `aiop:layout` | `DashboardLayout` |
| `aiop:hero-message` | `string` |
| `aiop-compact-mode` | `boolean` |
| `aiop-theme-mode` | `"light" \| "dark"` |

**작업 분해**

1. `src/lib/dataPortability.ts` 신규
   - `exportAll(): AiopExport` — 위 키들을 읽어 `{ version: 1, exportedAt, data }` 직렬화.
   - `importAll(payload, options): ImportResult` — `version` 확인 후 키별 normalize.
   - 도메인 normalizer 최소 (`Array.isArray` + 필수 필드 가드). `aiop:layout` 은 `useDashboardLayout.normalizeLayout` 재사용.
2. `src/components/layout/settings/DataPortabilitySection.tsx` 신규
   - "데이터 내보내기" 버튼 → JSON 파일 다운로드 (`aiop-export-YYYYMMDD.json`).
   - "데이터 가져오기" 버튼 → `<input type="file" accept=".json">` → 검증 → 덮어쓰기 확인 다이얼로그.
3. `SettingsMenu.tsx` 에 위 섹션 추가.
4. import 성공 시 페이지 자동 리로드 (`window.location.reload()`) — 가장 단순한 보장 방법.

**verify**
- 시크릿 창에서 export → 다른 시크릿 창에서 import → 모든 화면 정상.
- 잘못된 JSON / 잘못된 version → 사용자 친화적 에러 메시지, 기존 데이터 유지.
- 빈 localStorage 상태에서도 export 가능 (data 객체에 키가 모두 들어가되 빈 값).

---

### S2-P3. localStorage schema guard 강화 (S2-P2 와 묶어서)

도메인 데이터 normalizer를 export/import 유틸에 1차로 구현하면, 같은 함수를 각 View 의 hydration 단계에서도 재사용 가능.

**작업**
- `src/lib/storageNormalizers.ts` 신규 (또는 `dataPortability.ts` 내부).
  - `normalizeWants(value): WantItem[]`
  - `normalizeSubscriptions(value): Subscription[]`
  - `normalizeInsights(value): Insight[]`
  - `normalizeNotes(value): Note[]`
  - `normalizeRegretItems(value): RegretItem[]`
  - `normalizeTodos(value): TodoItem[]`
- 각 normalizer: 필수 필드 누락 시 해당 item 만 제거, 전체가 손상되면 mock fallback.
- `WantsView`, `SubscriptionsView` 등에서 `useLocalStorage` 결과를 normalizer 한 번 거쳐 사용.

**verify**
- 의도적으로 localStorage 에 깨진 JSON 삽입 → 화면이 정상 fallback.
- 일부 항목만 손상 → 손상되지 않은 항목은 그대로 표시.

---

### S2-P4. `useDashboardLayout` 의 `minY` 보정 로직 점검

**현재 동작**
`normalizeWidgetLayouts` 가 editable 위젯의 `minY > 0` 이면 전체를 `Math.max(0, layout.y - minY)` 만큼 위로 당긴다.

**점검 절차**
1. 모든 editable 위젯을 일부러 아래쪽으로 옮기고 저장.
2. 새로고침 후 의도한 위치가 유지되는지 확인.
3. 유지되지 않고 위로 끌어올려지면 다음 중 선택:
   - 보정 조건을 제거.
   - 보정 조건을 `minY < 0` (불가능 케이스 안전망) 로 좁힘.
   - 그대로 두고 코드 주석으로 의도 명시.

**verify**
- 직접 케이스 재현 + 결정 사항 코드 주석 한 줄.

---

### S2-P5. Header 검색창 동작 연결

**범위 결정 (작은 → 큰 순)**

- 옵션 A — 현재 뷰 한정 클라이언트 필터.
  - Dashboard에서는 동작 비활성 (placeholder만).
  - Wants / Subscriptions / Insights / Notes / Todo 각 화면에서 검색어 일치 항목만 표시.
  - 화면별 상태로 두면 간단, 헤더 입력이 화면별 검색 상태에 어떻게 닿을지 설계 필요.

- 옵션 B — 글로벌 검색 + 결과 드롭다운.
  - 모든 도메인에서 매칭 결과를 헤더 아래 드롭다운에 묶어 표시.
  - 결과 항목 클릭 → 해당 화면으로 이동.

**추천**
- 첫 단계는 옵션 A 의 가장 약한 형태: Header 검색어를 `URLSearchParams`(`?q=`) 에 반영하고, 각 화면이 `useSearchParams` 로 읽어 필터링.
- 옵션 B 는 v2.x 또는 별도 단계.

---

### S2-P6. Notes status 변경 UI

`Note.status` 가 `inbox | processed | archived` 인데 현재 사용자가 변경할 수 없다. SummaryCards 의 "수집함" 카운트가 `inbox` 기준이므로, 상태 변경이 가능해야 의미가 살아난다.

**작업**
- `NotesInboxView` 의 카드에 상태 사이클 버튼 추가 (Inbox → Processed → Archived → Inbox).
- 상태별 색상 / 라벨은 `getNoteStatusLabel` 재사용.
- 필요시 "수집함만 보기" 필터 추가.

---

### S2-P7. 문서 동기화 마무리

- `AGENTS.md`
  - v1.0 / v1.1 / v1.3 항목 추가.
  - 신규 디렉토리 (`contexts/`, `quick-add/`, `todos/`, `layout/grid/`, `layout/settings/`) 반영.
  - 추가된 storage 키 (`aiop:todos`, `aiop:layout`, `aiop:hero-message`, `aiop-compact-mode`).
- `.agent-notes/current-status-and-structure.md` (v0.8 시점) — 최상단에 `> deprecated: 2026-05-11. 최신은 aiop-current-status-and-next-steps.md` 한 줄 추가 or 삭제.
- README 의 "데이터 저장 방식" 표에 `aiop:hero-message` 행 추가 (S2-P1 와 동일 작업).

---

### S2-P8. v2.0 백엔드 계획서 작성 (착수 직전 단계)

별도 파일 `.agent-notes/aiop-v20-backend-plan.md` 로 분리해 작성한다. v1.3 마무리 이후 시작.

**계획서에 담을 항목**

- Supabase 프로젝트 / 환경 변수 / 키 관리 (Vercel env, OIDC 토큰).
- Postgres 스키마 (도메인별 테이블, `user_id uuid` + RLS `auth.uid() = user_id`).
- 인증: Google OAuth, 첫 로그인 시 mock seed / 빈 시작 선택.
- 마이그레이션: 기존 localStorage 데이터를 v1.3 export 포맷으로 한 번에 import.
- Next.js Route Handler (`/api/sync/*`, `/api/ai/*`) — Fluid Compute (Node.js) 사용.
- 클라이언트 데이터 흐름: `useLocalStorage` 를 `useUserData` 로 추상화 (Supabase 클라이언트 + 옵티미스틱 업데이트).
- Vercel 배포 (Preview / Production 분리).
- AI API 키는 서버에서만 사용, 클라이언트 노출 금지.

---

## 3. 우선순위 / 진행 순서

```text
1. 수동 QA (선행) ............. implementation-log 의 6개 + 라이트/다크 양쪽
2. S2-P0  URL 동기화 마무리 ... 깜빡임 확인 (5분)
3. S2-P1  README 데이터 표 .... aiop:hero-message 추가 (5분)
4. S2-P3  schema guard 모듈 ... export/import 의 1차 빌딩블록 (1~2h)
5. S2-P2  v1.3 export/import .. P3 와 같은 PR (2~3h)
6. S2-P4  minY 보정 점검 ...... 30분
7. S2-P7  문서 동기화 ......... AGENTS.md 등 (30분)
8. S2-P6  Notes status UI ..... 별도 PR (1h)
9. S2-P5  Header 검색창 ....... 별도 PR (2~3h, 옵션 A 기준)
10. S2-P8 v2.0 계획서 작성 .... 별도 세션 (1h+)
```

각 단계 종료 후 `npm run lint`, `npm run build`, `npx tsc --noEmit` 통과 + 화면 수동 확인을 거친다.

---

## 4. 세션 이어가기

```text
.agent-notes/aiop-next-steps-stage2.md 읽고 S2-P0 부터 진행해줘
```

특정 항목만:

```text
.agent-notes/aiop-next-steps-stage2.md 의 S2-P2, S2-P3 진행해줘
```
