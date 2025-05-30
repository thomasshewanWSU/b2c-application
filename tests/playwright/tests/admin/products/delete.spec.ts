import { test, expect } from "../fixtures.js";
import { seedTestDatabase } from "../../../database.setup.js";

test.beforeAll(async () => {
  await seedTestDatabase();
});

test.describe("Admin Product Delete", () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto("/products");
    await adminPage.getByTestId("product-list").waitFor({ state: "visible" });
  });

  test("should not show deleted product in the list after refresh", async ({
    adminPage,
  }) => {
    // Delete the first product
    const firstProduct = adminPage.getByTestId("product-item").first();
    const productName = await firstProduct
      .locator(".product-name")
      .textContent();

    // Fix: Use proper selector for the delete button
    await firstProduct.locator('button[aria-label="Delete product"]').click();

    // Confirm deletion in modal
    await adminPage.locator("button").filter({ hasText: "Delete" }).click();

    await adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/products/") &&
        resp.request().method() === "DELETE",
    );

    // Reload and check product is gone
    await adminPage.reload();
    const names = await adminPage
      .getByTestId("product-item")
      .locator(".product-name")
      .allTextContents();
    expect(names).not.toContain(productName?.trim());
  });

  test("should cancel deletion when cancel is clicked in the modal", async ({
    adminPage,
  }) => {
    // Click delete on first product
    const firstDeleteBtn = adminPage
      .getByTestId("product-item")
      .first()
      .locator('button[aria-label="Delete product"]');
    await firstDeleteBtn.click();

    // Click cancel in modal
    await adminPage.getByRole("button", { name: /cancel/i }).click();

    // Modal should close, product should still be present
    await expect(adminPage.getByRole("dialog")).not.toBeVisible();
    const count = await adminPage.getByTestId("product-item").count();
    expect(count).toBeGreaterThan(0);
  });
});
