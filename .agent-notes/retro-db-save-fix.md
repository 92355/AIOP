# 작업 계획

## 1. 요구사항 요약
- 최종 목표: RetroView의 `saveRetro` 호출을 async/await로 전환하고 DB 오류를 사용자에게 표시
- 사용자가 제공한 요구사항: KPT 회고 저장 시 DB 실패를 무시하는 문제 수정
- 반드시 지켜야 할 조건: UI 낙관적 업데이트(Optimistic Update) 패턴 유지, 기존 UX 흐름 변경 없음

## 2. 현재 상황 판단

### 확인된 정보

**파일**: `src/components/retros/RetroView.tsx`

**문제 지점 4곳** — 모두 `saveRetro()` 를 `await` 없이 호출 (fire-and-forget):

| 라인 | 호출 위치 | 설명 |
|------|----------|------|
| 183  | `handleDeleteRetro` | 삭제 후 빈 retro 저장 |
| 238  | `handleDeleteItem` | 아이템 삭제 후 저장 |
| 263  | `handleSaveEdit` | 아이템 텍스트 편집 후 저장 |
| 314  | `upsertRetroItems` | 아이템 추가 후 저장 |

**`upsertRetroItems` 호출 지점 3곳**:
- 라인 131: `handleAdd` → 새 KPT 아이템 추가
- 라인 196: `handleCarryOverAll` → 미완료 Try 항목 이월
- 라인 200: `handleCarryOverOne` → 단일 항목 이월

### 부족한 정보
- 토스트 알림 라이브러리 유무 (기존에 사용하는 라이브러리 확인 필요)
- 현재 에러 표시 방식 (로컬 state `errorMessage` 패턴 사용 중)

### 확실하지 않은 부분
- 실패 시 낙관적 업데이트를 롤백할지, 아니면 에러 메시지만 표시할지

## 3. 작업 범위

### 수정 예상 파일
- `src/components/retros/RetroView.tsx` — async/await 전환 + 에러 핸들링

### 추가될 기능
- DB 저장 실패 시 상단 에러 배너 표시 (자동 숨김 5초)
- 실패 시 변경사항 롤백 (선택 방법에 따라)

### 수정하지 않을 범위
- `src/app/retros/actions.ts` (saveRetro 자체는 이미 error throw 구현됨)
- 다른 컴포넌트

## 4. 구현 방향

### 선택한 방식: 방법 A — 에러만 표시, 롤백 없음

### 선택 이유
- 롤백 구현은 각 업데이트 전 상태를 저장해야 해 복잡도가 급증
- 현재 코드 스타일(`errorMessage` state)과 일관성 유지
- 네트워크 오류는 드문 케이스 — 에러 표시만으로 사용자 인지 가능

### 대안
- **방법 B: 롤백 포함**
  - 장점: 데이터 일관성 완벽 보장
  - 단점: 각 함수마다 `previousRetros` 스냅샷 저장 필요, 코드 복잡도 2배
- **방법 C: react-hot-toast 등 라이브러리 도입**
  - 장점: 토스트 UI 풍부
  - 단점: 의존성 추가, 현재 패턴과 이질감

## 5. 작업 순서

1. **`upsertRetroItems` async 전환**
   - `function upsertRetroItems(...)` → `async function upsertRetroItems(...)`
   - `saveRetro(updatedRetro)` → `await saveRetro(updatedRetro)` (라인 314)
   - try/catch 추가: catch에서 `setSaveError(error.message)`

2. **나머지 3곳 async 전환**
   - `handleDeleteRetro` (라인 183): 기존 async 함수에 `await` 추가
   - `handleDeleteItem` (라인 238): 기존 async 함수에 `await` 추가
   - `handleSaveEdit` (라인 263): 기존 async 함수에 `await` 추가
   - 각각 try/catch + `setSaveError` 추가

3. **에러 상태 및 UI 추가**
   - `const [saveError, setSaveError] = useState<string | null>(null)`
   - 에러 배너 JSX: 상단에 빨간 알림 (5초 후 자동 숨김 or X 버튼)
   - `useEffect`로 5초 타이머 자동 클리어

4. **`handleCarryOverAll` / `handleCarryOverOne` 처리**
   - 이 두 함수는 `upsertRetroItems`를 호출 — 이미 async로 전환되므로 `await` 추가

## 6. 예상 위험도

- **낮음**: `saveRetro` 자체는 이미 정상 작동 중, async 전환은 동작 방식 불변
- **중간**: `upsertRetroItems`가 동기 함수 → async로 바꾸면 호출 지점 3곳 모두 수정 필요 (누락 시 UnhandledPromiseRejection)
- **높음**: 없음

## 7. 확인 방법

```bash
# 빌드 타입 체크
npm run build

# 개발 서버 실행
npm run dev
```

**브라우저 확인 위치**: `/retros`
**테스트 방법**:
1. KPT 항목 추가 → Network 탭에서 supabase 요청 확인
2. 개발자 도구 → Network → Offline 모드 → 항목 추가 → 에러 배너 표시 확인
3. 편집 / 삭제 / 이월 기능도 동일하게 테스트

## 8. 구현 전 확인 질문
- 에러 표시 방식을 현재 사용 중인 `errorMessage` 스타일(빨간 텍스트)로 할지, 별도 배너로 할지 결정 필요
- 실패 시 롤백 여부 (방법 A vs B)
