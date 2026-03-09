# FlowDesk — 실시간 물류 운영 어드민

**[flowdesk-beryl.vercel.app](https://flowdesk-beryl.vercel.app)**

실시간 주문 흐름을 한눈에 파악하는 물류 운영 대시보드 포트폴리오 프로젝트입니다.
입고 → 피킹 → 패킹 → 출고 → 배송완료 흐름을 시각화하고, 작업자 실적과 재고 현황을 통합 관리합니다.

## 기획 의도

물류 현장에서 발생하는 병목(지연 주문 식별, 작업자 실적 편차, 부족 재고 파악)을 운영자가 단일 화면에서 즉시 인지하고 대응할 수 있도록 설계했습니다. 수기로 확인하던 주문 상태·작업자 KPI·재고 임계값을 실시간 데이터 시각화로 전환해 운영 안정성을 높이는 것이 목표입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| 상태관리 | Zustand v5 |
| 데이터 시각화 | Recharts v3 |
| UI | Tailwind CSS v4 + shadcn/ui + @base-ui/react |
| 테스트 | Vitest + Testing Library |

## 화면 구성

### 1. 메인 대시보드
- 전체 / 처리 중 / 배송 완료 / 지연 요약 카드
- 시간대별 주문 유입량 라인 차트
- 주문 상태별 파이 차트 (도넛형)
- 헤더에서 실시간 polling ON/OFF 토글 (5초 간격)

### 2. 주문 관리
- 입고 → 피킹 → 패킹 → 출고 → 배송완료 / 지연 상태 필터 탭 (URL 쿼리 동기화)
- 가상 스크롤 (200건+ 주문을 DOM 최소화하여 렌더링)
- 행 클릭 시 상세 드로어 (상태 타임라인, 처리 이력, ESC 닫기)
- 상태별 색상 배지, CSV 내보내기

### 3. 작업자 실적
- KPI 카드: 전체 작업자 / 비활동 / 평균 달성률 / 평균 처리 시간
- 피킹·패킹·출고 시간대별 스택 바 차트
- 역할 필터 + 달성률 프로그레스 바 테이블 (URL 쿼리 동기화)
- CSV 내보내기

### 4. 재고 현황
- 카테고리별 현재 재고 vs 최소 기준 바 차트
- 부족 재고 경고 패널 (임계값 미달 항목 목록)

### 5. 발주 관리 (SCM)
- KPI 카드: 전체 발주 / 승인 대기 / 입고 진행 / 총 발주 금액
- 공급업체별 발주 건수 바 차트
- 발주 목록 (상태 필터, CSV 내보내기): 발주번호·공급업체·상품·수량·단가·총액·입고예정일

### 6. 권역 배송 현황
- KPI 카드: 전체 배송 / 완료 / 배송 중 / 실패
- 권역별 (수도권·강원·충청·전라·경상·제주) 스택 바 차트
- 배송 목록 (권역 필터, CSV 내보내기): 배송번호·주문번호·기사명·상태·예정/완료 시각

## 기술 포인트

### Zustand 상태관리
```ts
// 스토어 내 selector 패턴으로 불필요한 리렌더 방지
const summary = useOrderStore((s) => s.getSummary);

// 단일 순회로 여러 카운트 집계
const acc = orders.reduce((a, o) => {
  if (o.status === "DELIVERED") a.completed++;
  else if (o.status === "DELAYED") a.delayed++;
  else a.processing++;
  return a;
}, { processing: 0, completed: 0, delayed: 0 });
```

### 실시간 Polling + Toast 알림
```ts
// usePolling 커스텀 훅으로 인터벌 관리
// Zustand isPolling 플래그로 ON/OFF 제어
// 5초마다 주문 상태 갱신 + 신규 주문 1~3건 추가 시뮬레이션
// 배열 상한선 500건으로 메모리 누수 방지
// 폴링 중 DELAYED로 전환된 주문을 감지해 실시간 Toast 알림 발행
```

### 가상 스크롤 (직접 구현)
```ts
// 라이브러리 미사용, 보이는 행만 렌더링
const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
const visibleOrders = filteredOrders.slice(startIndex, startIndex + VISIBLE_COUNT + 2);
// 200건 기준 DOM 노드 수: 200개 → ~12개 (94% 감소)
// OrderRow는 React.memo로 불필요한 리렌더 차단
```

### URL 쿼리 동기화
```ts
// 필터 상태를 URL query string에 동기화 → 북마크·공유·뒤로가기 지원
// 마운트 시 URL → 스토어, 탭 클릭 시 스토어 → URL 방향으로 단방향 동기화
router.replace(`${pathname}?status=${status}`);
```

### Hydration Mismatch 방지
```ts
// Math.random() / new Date() 기반 mock 데이터의 SSR/CSR 불일치 해결
// ClientOnly 컴포넌트로 클라이언트 마운트 후 렌더링
// 마운트 전에는 Skeleton UI 표시
```

### UI 컴포넌트 설계
```ts
// @base-ui/react (headless) + shadcn/ui 패턴으로
// 접근성과 스타일 커스터마이징을 분리해 관리
// 주문 상세 드로어: CSS transform transition으로 구현 (라이브러리 미사용)
```

### 다크모드
```ts
// localStorage 기반 테마 설정 영속화
// useDarkMode 훅에서 <html> 클래스 직접 조작 → Tailwind dark: variant 적용
// SSR hydration mismatch 방지를 위해 마운트 후 토글 버튼 렌더링
```

### CSV 내보내기
```ts
// BOM(\uFEFF) 추가로 한글 깨짐 없이 Excel에서 직접 열림
// 주문·작업자·발주·배송 4개 화면 모두 현재 필터 기준으로 내보내기
```

## 테스트

Zustand 스토어 및 커스텀 훅에 대한 단위 테스트를 Vitest로 작성했습니다.

- `orderStore` — 주문 필터링, 요약 집계, polling 상태 관리
- `workerStore` — 역할 필터, KPI(평균 달성률·처리 시간) 계산
- `inventoryStore` — 재고 조회, 부족 항목 탐지
- `usePolling` — 인터벌 시작/중지, 컴포넌트 언마운트 시 클리어

## 로컬 실행

```bash
npm install
npm run dev              # http://localhost:3000
npm run test             # 단위 테스트 (watch mode)
npm run test:coverage    # 커버리지 포함 실행
```
