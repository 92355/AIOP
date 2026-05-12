# AIOP Active Plan

> 목적: 현재 실행할 단일 계획 파일.
> Claude는 이 파일을 갱신하고, Codex는 이 파일을 읽고 실행한다.
> 새 active plan 파일을 만들지 않는다.

---

## 1. Current Goal

**D. 대시보드 전역 검색 → 페이지별 드롭다운 결과**

대시보드(`/`)에서 헤더 검색창에 입력하면, 검색어가 포함된 항목을 **페이지별로 그룹화**해서 드롭다운으로 표시한다. 결과를 클릭하면 해당 페이지로 이동한다.

근거: 사용자 요청 — "대시보드에서 검색시 해당 내용이있는 페이지를 드랍다운으로 표시되어야함 (여러개라면 드랍다운으로 각 페이지별로 나오게)".

이전 작업(A 금액 +버튼 / B 컴팩트뷰 모달 / C Header 검색창 노출)은 `aiop-archive.md` §0에 보관됨.

---

## 2. 결정 사항 (잠정 — §9에서 사용자 확인 필요)

| # | 결정 | 잠정 내용 |
|---|---|---|
| D1 | 드롭다운 노출 조건 | **대시보드(`/`)에서만**. 다른 페이지는 기존처럼 페이지 내 필터링만 동작. |
| D2 | 검색 대상 도메인 | Wants, Subscriptions, Insights, Notes, Todos, Retros (6개). Calculator/Regret 제외 (Regret도 추가 가능 — 확인 필요). |
| D3 | 페이지별 결과 갯수 제한 | 페이지당 **최대 3개**까지 표시, 초과 시 "외 N개 더 보기" 링크. |
| D4 | 결과 항목 렌더 | 핵심 텍스트 1줄(매칭 부분 강조) + 페이지명 라벨. |
| D5 | 클릭 시 동작 | 해당 페이지로 이동(`router.push`). 항목 자체 highlight는 v1차 작업 제외. |
| D6 | 페이지 그룹 헤더 | 페이지명 + 아이콘 + 그 페이지의 결과 갯수. 클릭 시 검색어 유지한 채 해당 페이지 이동. |
| D7 | 드롭다운 위치 | 검색창 바로 아래, absolute 위치. 폭은 검색창과 동일 또는 더 넓게(`w-96` 정도). |
| D8 | 키보드 네비게이션 | Arrow Up/Down으로 항목 이동, Enter로 선택, Escape로 닫기. |
| D9 | 드롭다운 닫기 | 외부 클릭, Escape, 검색어 비움, 항목 선택 후. |
| D10 | 빈 결과 처리 | "검색 결과 없음" 메시지 표시. |
| D11 | 검색어 최소 길이 | 1자 이상 입력 시 드롭다운 노출 (디바운스 없이 즉시). |
| D12 | 검색 로직 일원화 | `src/lib/globalSearch.ts` 신규 생성. 각 도메인 localStorage를 읽어 검색 결과 반환. |
| D13 | 컴팩트뷰 동작 | 대시보드 컴팩트뷰에서도 드롭다운 동일 동작. C에서 노출한 검색창 활용. |

---

## 3. Scope

### Include

- `src/lib/globalSearch.ts` 신규: 도메인별 검색 함수 + 통합 `searchAllDomains(query)` 반환.
- `SearchContext` 확장 또는 신규 컴포넌트 `<SearchResultsDropdown>`: 결과 렌더링 + 키보드 네비 + 외부 클릭 닫기.
- `Header.tsx`: 대시보드 라우트일 때 검색창 아래 드롭다운 마운트.
- 도메인별 검색 가능 필드는 기존 각 View의 `matchesSearchTerm`을 참고해 일원화.

### Exclude

- 검색 결과 항목 클릭 시 해당 항목 highlight / 스크롤
- 검색 히스토리 / 최근 검색어
- 디바운스 (즉시 검색)
- Fuzzy / 자모 매칭 (단순 `includes`)
- Calculator 페이지 검색 대상 추가
- 백엔드 / Supabase 작업
- 검색 결과 페이지(`/search`) 신설

---

## 4. Tasks

### 준비

- [x] **TD1. 현재 검색 동작 재확인** — 각 View의 `matchesSearchTerm` 시그니처와 검색 대상 필드 정리.
- [x] **TD2. `globalSearch.ts` 설계** — 도메인별 검색 결과 타입 (`SearchHit { domain, id, title, snippet, href }`), 통합 함수 시그니처 결정.

### 구현

- [x] **TD3. `globalSearch.ts` 작성** — localStorage 키 6개에서 항목 읽고, 도메인별 검색 함수 호출, 페이지당 최대 3개 + 전체 갯수 반환.
- [x] **TD4. `<SearchResultsDropdown>` 컴포넌트 작성** — 페이지별 그룹화 렌더, 키보드 네비, 외부 클릭 닫기 hook.
- [x] **TD5. `Header.tsx` 통합** — 대시보드 라우트(`isDashboardPathname`)에서만 드롭다운 마운트. 검색창과 결합.
- [x] **TD6. 키보드 네비** — Arrow Up/Down, Enter, Escape 처리. 포커스 관리.
- [x] **TD7. 라우팅** — 항목 클릭 시 `router.push(href)`. 검색어 유지 정책 결정 (유지 vs 비움).
- [ ] **TD8. 컴팩트뷰 검증** — 대시보드 컴팩트뷰 검색창에서도 드롭다운 동작.
- [x] **TD9. 빈 결과 / 1자 미만 / 결과 0 처리**

### 공통

- [x] **TZ1. `tsc --noEmit`, `lint`, `build` 통과**
- [ ] **TZ2. 수동 QA 통과**
- [ ] **TZ3. 사용자 검토**

---

## 5. Files Expected to Change

```txt
src/lib/globalSearch.ts                            (신규)
src/components/layout/SearchResultsDropdown.tsx    (신규)
src/components/layout/Header.tsx                   (마운트 위치)
src/contexts/SearchContext.tsx                     (필요 시 확장)
```

영향 받지만 직접 수정은 없을 가능성 (확인 필요):

```txt
src/components/layout/AppShell.tsx
각 도메인 View의 matchesSearchTerm — 가능하면 globalSearch.ts에서 import해 일원화
```

---

## 6. Verification

```bash
npm exec tsc -- --noEmit
npm run lint
npm run build
```

### 수동 QA 체크리스트

- [x] 대시보드에서 검색어 입력 시 드롭다운 노출
- [x] 결과가 페이지별로 그룹화되어 표시 (페이지 헤더 + 항목 1~3개)
- [ x] 페이지당 결과가 3개 초과 시 "외 N개 더 보기" 노출
- [ x] 결과 항목 클릭 → 해당 페이지로 이동
- [ x] 페이지 헤더 클릭 → 해당 페이지로 이동 (검색어 유지)
- [ x] Arrow Up/Down으로 항목 간 이동
- [x ] Enter로 선택, Escape로 닫기
- [x ] 외부 클릭으로 닫기
- [ x] 검색어 비우면 드롭다운 닫힘
- [x ] 검색 결과 0건일 때 "결과 없음" 메시지
- [ x] 대시보드 이외 페이지(`/wants` 등)에서는 드롭다운 안 뜸 (기존 페이지 내 필터링만)
- [ x] 컴팩트뷰 대시보드에서도 드롭다운 동일 동작
- [ x] 검색 가능 필드: Wants(name/reason), Subs(service), Insights(title/keySentence), Notes(title/body), Todos(title), Retros(K/P/T 텍스트)

---

## 7. Done Criteria

- [ x] 4번 Tasks 모두 체크
- [x ] 6번 검증 모두 통과
- [ x] 사용자 검토 후 OK
- [ ] 본 plan 요약을 `aiop-archive.md`로 이전
- [ ] plan.md를 다음 작업 대기 상태로 정리

---

## 8. Next Plan 후보

- Dashboard / Calculator / Regret 페이지의 검색 대상 추가 (현재 검색 미연결 페이지들)
- 한글 자모 매칭 / 검색 성능 개선
- 대쉬보드 위젯 커스터마이징 (`aiop-status.md` §11.5)
- v2.0 Supabase 프로젝트 생성 / 스키마 SQL 작성 (`aiop-status.md` §11.6)

---

## 9. 구현 전 확인 질문

§2 잠정 결정 중 검토 필요한 항목:

1. **D1 노출 조건**: 대시보드(`/`)에서만 vs 모든 페이지에서 드롭다운 노출? (잠정: 대시보드만)
2. **D2 검색 대상**: 6개 도메인(Wants, Subs, Insights, Notes, Todos, Retros). **Regret도 추가**할지? (잠정: 제외)
3. **D3 갯수 제한**: 페이지당 최대 3개 + "외 N개" 링크. 다른 숫자(5개 등)가 좋은지?
4. **D7 드롭다운 폭**: 검색창과 동일(`w-80`) vs 더 넓게(`w-96` 또는 `w-[28rem]`)?
5. **D11 검색어 최소 길이**: 1자 이상이면 즉시 드롭다운, 디바운스 없이? 아니면 2자 이상 / 300ms 디바운스?
6. **클릭 후 검색어 정책**: 결과 클릭 시 검색어 유지 vs 비움?
