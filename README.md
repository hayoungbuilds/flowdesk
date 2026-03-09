# FlowDesk — 실시간 물류 운영 어드민

**[flowdesk-beryl.vercel.app](https://flowdesk-beryl.vercel.app)**

입고부터 출고·배송·정산·반품까지 물류 전 영역을 단일 화면에서 운영하는 풀스택 어드민 대시보드 포트폴리오 프로젝트입니다.

## 기획 의도

물류 현장에서 발생하는 병목(지연 주문, 부족 재고, 반품 급증, 재고 소진 임박)을 운영자가 단일 화면에서 즉시 인지하고 대응할 수 있도록 설계했습니다. 기존에 수기로 확인하던 주문 상태·작업자 KPI·재고 임계값·정산 현황을 실시간 데이터 시각화로 전환해 운영 안정성을 높이는 것이 목표입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| 상태관리 | Zustand v5 |
| 데이터 시각화 | Recharts v3 |
| UI | Tailwind CSS v4 + shadcn/ui |
| 단위 테스트 | Vitest v4 (jsdom + chromium 듀얼 프로젝트) |
| 컴포넌트 테스트 | Storybook v10 (@storybook/nextjs-vite + addon-vitest) |
| E2E 테스트 | Playwright |

## 화면 구성

### 대시보드
- 전체 / 처리 중 / 배송 완료 / 지연 요약 KPI 카드
- 시간대별 주문 유입량 라인 차트, 주문 상태 도넛 차트
- 시간대(06~23시) × 요일 피킹 작업량 히트맵
- 5초 간격 실시간 polling ON/OFF 토글

### 관제 센터
- 처리량·오류율·시스템 상태 KPI 카드
- 시간대별 입고·피킹·패킹·출고 실시간 운영 현황 라인 차트
- 긴급 / 주의 / 정보 3단계 활성 알림 리스트, 라이브 폴링 (5초)

### 입고 관리
- KPI 카드 5종 (예정·진행·검수·완료·완료율)
- 공급사별 입고 현황 스택 바 차트
- 상태 필터 탭 + 검색 + CSV 내보내기 테이블 (URL 쿼리 동기화)

### 재고 현황
- 카테고리별 현재 재고 vs 최소 기준 바 차트
- 부족 재고 경고 패널

### 발주 관리 (SCM)
- KPI 카드 4종, 공급업체별 발주 건수 바 차트
- 상태 필터 + CSV 내보내기 테이블

### 정산 관리
- KPI 카드 7종 (총액·완료액·오류 등)
- 공급사별 정산 금액 바 차트, 월별 정산 추이 라인 차트
- 상태 필터 + CSV 내보내기 테이블

### 주문 관리
- 상태 필터 탭 (URL 쿼리 동기화), 가상 스크롤 (200건+ DOM 최소화)
- 행 클릭 시 상세 드로어 (상태 타임라인, ESC 닫기)
- 상태별 배지, CSV 내보내기

### 작업자 실적
- KPI 카드 4종, 시간대별 스택 바 차트
- 역할 필터 + 달성률 프로그레스 바 테이블 (URL 쿼리 동기화)

### 포장재 관리
- KPI 카드 4종, 재고 소진일 바 차트, 부족 재고 알림 리스트
- 재고 상태(충분/부족/위험) 컬러 배지 + 인라인 진행바 테이블

### 권역 배송 현황
- 권역별 스택 바 차트, 상태 필터 + CSV 내보내기 테이블

### 간선 관리
- KPI 카드 5종 (전체·운행중·도착·지연·정시율)
- 허브별 물량 바 차트, 간선 상태 도넛 차트
- 상태·출발지 필터 + CSV 내보내기 테이블

### 회수/반품 관리
- KPI 카드 5종 (접수·수거·환불·반려·총환불액)
- 반품 사유 분포 파이 차트 (호버 툴팁에 건수·퍼센트), 일별 바 차트
- 사유·상태 필터 + CSV 내보내기 테이블

## 기술 포인트

### Zustand 무한루프 방지 패턴
```ts
// ❌ useShallow로 배열 반환 함수를 직접 호출하면 무한 루프
const data = useStore(useShallow((s) => s.getArrayData()));

// ✅ 기반 데이터를 구독하고 useMemo로 파생 데이터 계산
const items = useStore((s) => s.items);
const getData = useStore((s) => s.getData);
const data = useMemo(() => getData(), [items, getData]);
// → useSyncExternalStore가 안정적인 참조를 유지해 재렌더 루프 차단
```

### 테이블 내부 스크롤 레이아웃
```tsx
// 페이지 전체 스크롤 → 테이블 영역 내부 스크롤로 변환
<div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
  <div className="shrink-0"><KpiCards /></div>      {/* 고정 높이 */}
  <div className="shrink-0"><Charts /></div>         {/* 고정 높이 */}
  <div className="flex-1 min-h-60 flex flex-col">   {/* 남은 공간 채움 */}
    <Table />  {/* 내부에서 overflow-y-auto */}
  </div>
</div>
```

### 실시간 Polling + Toast 알림
```ts
// usePolling 커스텀 훅으로 인터벌 관리
// Zustand isPolling 플래그로 ON/OFF 제어
// 5초마다 주문 상태 갱신 + 신규 주문 시뮬레이션
// DELAYED로 전환된 주문을 감지해 실시간 Toast 알림 발행
```

### 가상 스크롤 (직접 구현)
```ts
// 라이브러리 미사용, 보이는 행만 렌더링
const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
const visibleOrders = filteredOrders.slice(startIndex, startIndex + VISIBLE_COUNT + 2);
// 200건 기준 DOM 노드 수: 200개 → ~12개 (94% 감소)
```

### URL 쿼리 동기화
```ts
// 필터 상태 ↔ URL query string 단방향 동기화 → 북마크·뒤로가기 지원
// router.replace() 150ms debounce: 연속 탭 클릭 시 history 누적 방지
if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current);
replaceTimerRef.current = setTimeout(() => {
  router.replace(`${pathname}${query ? `?${query}` : ""}`);
}, 150);
```

### Hydration Mismatch 방지
```ts
// Math.random() / new Date() 기반 mock 데이터의 SSR/CSR 불일치 해결
// ClientOnly 래퍼로 클라이언트 마운트 후 렌더링, 마운트 전 Skeleton 표시
```

### CSV 내보내기
```ts
// BOM(\uFEFF) 추가로 한글 깨짐 없이 Excel에서 직접 열림
// 입고·주문·작업자·정산·반품·포장재·배송·발주·간선 전 화면 지원
// 현재 필터 기준으로만 내보내기
```

## 테스트

### 단위 테스트 (Vitest + jsdom)
- `orderStore` — 주문 필터링, 요약 집계, polling 상태 관리
- `workerStore` — 역할 필터, KPI(평균 달성률·처리 시간) 계산
- `inventoryStore` — 재고 조회, 부족 항목 탐지
- `notificationStore` — add·markRead·markAllRead·remove, 최대 50개 유지
- `usePolling` — 인터벌 시작/중지, 언마운트 시 클리어

### 통합 테스트
- `orderStore ↔ toastStore` — 지연 주문 발생 시 Toast 전달 흐름, 중복 알림 방지

### 컴포넌트 테스트 (Storybook + addon-vitest)
- `Badge` — Default, StatusBadges, InboundStatus, AlertLevels
- `WorkloadHeatmap` — Default, DarkMode
- `NotificationPanel` — WithUnread, AllRead, Empty

### E2E 테스트 (Playwright)
- `navigation` — 사이드바 12개 라우트 전체 접근 검증
- `dashboard` — KPI 카드, 차트, 히트맵, 실시간 토글, 다크모드
- `orders` — 테이블, 탭 필터, URL 동기화, CSV, 드로어
- `search` — 글로벌 검색 모달, ⌘K 단축키, ESC, 알림 패널

## 로컬 실행

```bash
npm install
npm run dev              # http://localhost:3000
npm test                 # 단위 테스트 (watch mode)
npm run test:coverage    # 커버리지 포함
npm run storybook        # http://localhost:6006
npx playwright test      # E2E 테스트
```
