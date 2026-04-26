import { expect, test } from "@playwright/test";

test("main page loads and can equip an item", async ({ page }) => {
  await page.goto("/index.html");

  await expect(page.locator("#profile-select")).toBeVisible();
  await expect(page.locator("#slot-grid .slot-cell")).toHaveCount(12);

  const firstEquipButton = page.locator("#category-list .equip-btn").first();
  await expect(firstEquipButton).toBeVisible();
  await firstEquipButton.click();

  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await expect(page.locator("#board-main-stats .board-stat-row, #board-main-stats .board-stats-empty").first()).toBeVisible();
});

test("compare page opens with a second profile", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#profile-new-button").click();
  await page.locator('a[href="compare.html"]').click();

  await expect(page).toHaveURL(/compare\.html$/);
  await expect(page.locator("#compare-primary-select")).toBeVisible();
  await expect(page.locator("#compare-secondary-select")).toBeVisible();
  await expect(page.locator("#compare-primary-editor .compare-editor-shell")).toBeVisible();
  await expect(page.locator("#compare-secondary-editor")).toBeVisible();
});
