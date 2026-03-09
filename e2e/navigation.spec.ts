import { test, expect } from "@playwright/test";

test.describe("사이드바 네비게이션", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("FlowDesk 로고가 표시된다", async ({ page }) => {
    await expect(page.getByText("FlowDesk").or(page.getByText("Flow"))).toBeVisible();
  });

  const pages = [
    { label: "대시보드", path: "/", heading: "대시보드" },
    { label: "관제 센터", path: "/control", heading: "관제 센터" },
    { label: "입고 관리", path: "/inbound", heading: "입고 관리" },
    { label: "재고 현황", path: "/inventory", heading: "재고 현황" },
    { label: "발주 관리", path: "/purchase-orders", heading: "발주 관리" },
    { label: "정산 관리", path: "/settlement", heading: "정산 관리" },
    { label: "주문 관리", path: "/orders", heading: "주문 관리" },
    { label: "작업자 실적", path: "/workers", heading: "작업자 실적" },
    { label: "포장재 관리", path: "/packaging", heading: "포장재 관리" },
    { label: "권역 배송", path: "/zones", heading: "권역 배송" },
    { label: "간선 관리", path: "/trunk", heading: "간선 관리" },
    { label: "회수/반품", path: "/returns", heading: "회수/반품 관리" },
  ];

  for (const { label, path, heading } of pages) {
    test(`"${label}" 메뉴 클릭 시 해당 페이지로 이동한다`, async ({ page }) => {
      await page.click(`text=${label}`);
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    });
  }
});
