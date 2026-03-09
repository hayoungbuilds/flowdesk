import { test, expect } from "@playwright/test";

test.describe("주문 관리", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/orders");
  });

  test("주문 목록 테이블이 렌더링된다", async ({ page }) => {
    await expect(page.getByRole("grid", { name: "주문 목록" })).toBeVisible();
  });

  test("상태 필터 탭이 표시된다", async ({ page }) => {
    for (const tab of ["전체", "접수", "피킹", "패킹", "출고", "배송완료", "지연"]) {
      await expect(page.getByRole("tab", { name: tab })).toBeVisible();
    }
  });

  test("상태 필터 탭 클릭 시 URL 쿼리가 변경된다", async ({ page }) => {
    await page.getByRole("tab", { name: "피킹" }).click();
    await expect(page).toHaveURL(/status=PICKING/);
  });

  test("CSV 내보내기 버튼이 존재한다", async ({ page }) => {
    await expect(page.getByRole("button", { name: /CSV 내보내기/ })).toBeVisible();
  });

  test("주문 행 클릭 시 상세 드로어가 열린다", async ({ page }) => {
    // 첫 번째 주문 행 클릭
    const firstRow = page.getByRole("row").nth(1);
    if (await firstRow.isVisible()) {
      await firstRow.click();
      // 드로어 또는 상세 패널이 열림 확인
      await expect(page.getByRole("dialog").or(page.getByText("주문 상세"))).toBeVisible({ timeout: 3000 });
    }
  });
});
