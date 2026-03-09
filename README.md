# FlowDesk — 실시간 물류 운영 어드민

**[flowdesk-beryl.vercel.app](https://flowdesk-beryl.vercel.app)**

실시간 주문 흐름을 한눈에 파악하는 물류 운영 대시보드 포트폴리오 프로젝트입니다.
입고 → 피킹 → 패킹 → 출고 → 배송완료 흐름을 시각화하고, 작업자 실적과 재고 현황을 통합 관리합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| 상태관리 | Zustand |
| 데이터 시각화 | Recharts |
| UI | Tailwind CSS v4 + shadcn/ui |

## 화면 구성

### 1. 메인 대시보드
- 전체 / 처리 중 / 배송 완료 / 지연 요약 카드
- 시간대별 주문 유입량 라인 차트
- 주문 상태별 파이 차트 (도넛형)
- 헤더에서 실시간 polling ON/OFF 토글 (5초 간격)

### 2. 주문 관리
- 입고 → 피킹 → 패킹 → 출고 → 배송완료 / 지연 상태 필터 탭
- 가상 스크롤 (200건+ 주문을 DOM 최소화하여 렌더링)
- 상태별 색상 배지

### 3. 작업자 실적
- KPI 카드: 전체 작업자 / 비활동 / 평균 달성률 / 평균 처리 시간
- 피킹·패킹·출고 시간대별 스택 바 차트
- 역할 필터 + 달성률 프로그레스 바 테이블

### 4. 재고 현황
- 카테고리별 현재 재고 vs 최소 기준 바 차트
- 부족 재고 경고 패널 (임계값 미달 항목 목록)

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

### 실시간 Polling
```ts
// usePolling 커스텀 훅으로 인터벌 관리
// Zustand isPolling 플래그로 ON/OFF 제어
// 5초마다 주문 상태 갱신 + 신규 주문 1~3건 추가 시뮬레이션
// 배열 상한선 500건으로 메모리 누수 방지
```

### 가상 스크롤 (직접 구현)
```ts
// 라이브러리 미사용, 보이는 행만 렌더링
const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
const visibleOrders = filteredOrders.slice(startIndex, startIndex + VISIBLE_COUNT + 2);
// OrderRow는 React.memo로 불필요한 리렌더 차단
```

### Hydration Mismatch 방지
```ts
// Math.random() / new Date() 기반 mock 데이터의 SSR/CSR 불일치 해결
// ClientOnly 컴포넌트로 클라이언트 마운트 후 렌더링
// 마운트 전에는 Skeleton UI 표시
```

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```
