import { test, expect } from "./fixtures.js";
import { seedTestDatabase } from "../../database.setup.js";

test.beforeAll(async () => {
  await seedTestDatabase();
});

test.describe("Shopping Cart Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display empty cart state", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByTestId("empty-cart")).toBeVisible();
    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expect(page.getByText("Continue Shopping")).toBeVisible();
  });

  test("should add item to cart from product page", async ({ page }) => {
    // Navigate to a product page
    await page.goto("/products/wireless-bluetooth-headphones");

    // Add to cart
    await page.getByTestId("add-to-cart-button").click();

    // Go to cart page
    await page.goto("/cart");

    // Verify item is in cart
    await expect(page.getByTestId("cart-items")).toBeVisible();
    await expect(page.getByTestId("product-name")).toContainText(
      "Wireless Bluetooth Headphones",
    );
  });
  test("should update quantity and recalculate totals", async ({ page }) => {
    await page.goto("/cart");

    // Get initial price
    const initialPrice = await page.getByTestId("item-total").textContent();

    // Increase quantity
    await page.getByTestId("quantity-increase").click();

    // Wait for cart to update
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
    );

    // Add explicit wait for UI to update
    await page.waitForTimeout(500);

    // Get new price
    const updatedPrice = await page.getByTestId("item-total").textContent();

    // Verify price has increased
    expect(parseFloat(updatedPrice.replace(/[^0-9.]/g, ""))).toBeGreaterThan(
      parseFloat(initialPrice.replace(/[^0-9.]/g, "")),
    );
  });

  test("should remove item from cart", async ({ page }) => {
    await page.goto("/cart");

    // Remove the item
    await page.getByTestId("remove-item").click();

    // Wait for cart to update
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
    );

    // Verify cart is empty
    await expect(page.getByTestId("empty-cart")).toBeVisible();
  });

  test("should proceed to checkout", async ({ customerPage }) => {
    await customerPage.goto("/login");
    await customerPage.getByLabel("Email").fill("john@example.com");
    await customerPage.getByLabel("Password").fill("customer123");
    await customerPage.getByRole("button", { name: "Sign In" }).click();
    await customerPage.waitForURL("/");
    // Add item to cart first
    await customerPage.goto("/products/wireless-bluetooth-headphones");
    await customerPage.getByTestId("add-to-cart-button").click();
    await customerPage.goto("/cart");

    // Go to checkout
    await customerPage.getByTestId("checkout-button").click();

    // Verify we're on checkout page
    await expect(customerPage).toHaveURL("/checkout");
  });

  test("should show stock warnings when appropriate", async ({ page }) => {
    // This test requires setup to create a stock issue scenario
    await page.goto("/cart?stockIssues=true");

    // Verify warning is shown
    await expect(page.getByTestId("stock-warning")).toBeVisible();
  });
  test("should merge anonymous cart with user cart after login", async ({
    page,
  }) => {
    // Add item to cart as anonymous user
    await page.goto("/products/wireless-bluetooth-headphones");
    await page.getByTestId("add-to-cart-button").click();

    // Verify item was added to anonymous cart
    await page.goto("/cart");
    await expect(page.getByTestId("cart-items")).toBeVisible();
    await expect(page.getByTestId("product-name")).toContainText(
      "Wireless Bluetooth Headphones",
    );

    // Login
    await page.goto("/login");
    await page.getByLabel("Email").fill("john@example.com");
    await page.getByLabel("Password").fill("customer123");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Don't wait for specific request, just wait for login to complete
    await page.waitForURL((url) => !url.pathname.includes("/login"));

    // Verify item is still in cart after login (merged)
    await page.goto("/cart");
    await expect(page.getByTestId("cart-items")).toBeVisible();
    await expect(page.getByTestId("product-name")).toContainText(
      "Wireless Bluetooth Headphones",
    );
  });
});
