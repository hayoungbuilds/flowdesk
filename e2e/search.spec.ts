import { test, expect } from "@playwright/test";

test.describe("글로벌 검색", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("검색 트리거 버튼이 표시된다", async ({ page }) => {
    await expect(page.getByLabel("전체 검색 (Cmd+K)")).toBeVisible();
  });

  test("검색 버튼 클릭 시 모달이 열린다", async ({ page }) => {
    await page.getByLabel("전체 검색 (Cmd+K)").click();
    await expect(page.getByRole("dialog", { name: "전체 검색" })).toBeVisible();
  });

  test("Cmd+K 단축키로 검색 모달이 열린다", async ({ page }) => {
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog", { name: "전체 검색" })).toBeVisible();
  });

  test("ESC 키로 검색 모달이 닫힌다", async ({ page }) => {
    await page.getByLabel("전체 검색 (Cmd+K)").click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "전체 검색" })).not.toBeVisible();
  });

  test("검색어 입력 시 결과가 표시된다", async ({ page }) => {
    await page.getByLabel("전체 검색 (Cmd+K)").click();
    await page.getByPlaceholder(/검색/).fill("ORD");
    // 주문 카테고리 결과 확인
    await expect(page.getByText("주문").first()).toBeVisible({ timeout: 2000 });
  });

  test("빠른 이동 링크들이 표시된다", async ({ page }) => {
    await page.getByLabel("전체 검색 (Cmd+K)").click();
    await expect(page.getByText("빠른 이동")).toBeVisible();
    await expect(page.getByText("주문 관리")).toBeVisible();
    await expect(page.getByText("관제 센터")).toBeVisible();
  });
});

test.describe("알림 센터", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("알림 벨 버튼이 표시된다", async ({ page }) => {
    await expect(page.getByLabel(/알림/)).toBeVisible();
  });

  test("알림 벨 클릭 시 패널이 열린다", async ({ page }) => {
    await page.getByLabel(/알림/).click();
    await expect(page.getByRole("dialog", { name: "알림 목록" })).toBeVisible();
  });

  test("알림 패널에 알림 목록이 표시된다", async ({ page }) => {
    await page.getByLabel(/알림/).click();
    await expect(page.getByText("피킹 지연 감지").or(page.getByText("배송 지연 주문 발생"))).toBeVisible();
  });

  test("모두 읽음 버튼이 동작한다", async ({ page }) => {
    await page.getByLabel(/알림/).click();
    const panel = page.getByRole("dialog", { name: "알림 목록" });
    const markAllBtn = panel.getByText("모두 읽음");
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      // 버튼이 사라짐 (읽지 않은 알림이 없으면)
      await expect(markAllBtn).not.toBeVisible({ timeout: 1000 });
    }
  });
});
