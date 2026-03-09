import { test, expect } from "@playwright/test";

test.describe("대시보드", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("주요 KPI 카드가 렌더링된다", async ({ page }) => {
    // 요약 카드들
    await expect(page.getByText("총 주문")).toBeVisible();
    await expect(page.getByText("처리 중")).toBeVisible();
    await expect(page.getByText("완료")).toBeVisible();
    await expect(page.getByText("지연")).toBeVisible();
  });

  test("시간대별 주문 차트가 렌더링된다", async ({ page }) => {
    await expect(page.getByText("시간대별 주문 유입")).toBeVisible();
  });

  test("주문 상태 분포 파이차트가 렌더링된다", async ({ page }) => {
    await expect(page.getByText("주문 상태 분포")).toBeVisible();
  });

  test("작업량 히트맵이 렌더링된다", async ({ page }) => {
    await expect(page.getByText("시간대별 작업량 히트맵")).toBeVisible();
  });

  test("실시간 토글 버튼이 동작한다", async ({ page }) => {
    const btn = page.getByText("○ 실시간 OFF");
    await btn.click();
    await expect(page.getByText("● 실시간 ON")).toBeVisible();
  });

  test("다크모드 토글이 동작한다", async ({ page }) => {
    // 다크모드 버튼 클릭
    const darkBtn = page.getByRole("button", { name: /다크 모드|라이트 모드/ });
    await darkBtn.click();
    // html에 dark 클래스가 적용되거나 버튼 텍스트가 변경
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
