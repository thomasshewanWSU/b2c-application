import { test, expect } from "./fixtures.js";
import { seedTestDatabase } from "../../database.setup.js";

test.beforeAll(async () => {
  await seedTestDatabase();
});

test.describe("Shopping Cart Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display empty cart state", async ({ guestPage }) => {
    await guestPage.goto("/cart");
    await expect(guestPage.getByTestId("empty-cart")).toBeVisible();
    await expect(guestPage.getByText("Your cart is empty")).toBeVisible();
    await expect(guestPage.getByText("Continue Shopping")).toBeVisible();
  });

  test("should add item to cart from product page", async ({ guestPage }) => {
    // Navigate to a product page
    await guestPage.goto("/products/wireless-bluetooth-headphones");

    // Add to cart
    await guestPage.getByTestId("add-to-cart-button").click();
    // Wait for add-to-cart operation to complete
    await guestPage.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
    );
    // Go to cart page
    await guestPage.goto("/cart");

    // Verify item is in cart
    await expect(guestPage.getByTestId("cart-items")).toBeVisible();
    await expect(guestPage.getByTestId("product-name")).toContainText(
      "Wireless Bluetooth Headphones",
    );
  });

  test("should update quantity and recalculate totals", async ({
    guestPage,
  }) => {
    // Navigate to a product page
    await guestPage.goto("/products/wireless-bluetooth-headphones");

    // Add to cart and wait for completion
    await guestPage.getByTestId("add-to-cart-button").click();

    // Wait for add-to-cart operation to complete
    await guestPage.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
    );

    // Go to cart page with explicit wait for navigation
    await guestPage.goto("/cart");
    await guestPage.waitForSelector("[data-test-id='cart-items']", {
      timeout: 10000,
    });

    // Wait specifically for the price element before trying to get content
    await guestPage.waitForSelector("[data-test-id='item-total']", {
      timeout: 5000,
    });

    // Get initial price
    const initialPrice = await guestPage
      .getByTestId("item-total")
      .textContent();

    // Increase quantity
    await guestPage.getByTestId("quantity-increase").click();

    // Wait for cart to update with longer timeout
    await guestPage.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
      { timeout: 10000 },
    );

    // More explicit wait for UI update
    await guestPage.waitForTimeout(1000);

    // Get new price
    const updatedPrice = await guestPage
      .getByTestId("item-total")
      .textContent();

    // Verify price has increased
    expect(parseFloat(updatedPrice.replace(/[^0-9.]/g, ""))).toBeGreaterThan(
      parseFloat(initialPrice.replace(/[^0-9.]/g, "")),
    );
  });
  test("should remove item from cart", async ({ guestPage }) => {
    // Navigate to a product page
    await guestPage.goto("/products/wireless-bluetooth-headphones");

    // Add to cart with explicit wait for completion
    await guestPage.getByTestId("add-to-cart-button").click();
    await guestPage.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
    );

    // Go to cart page with explicit wait for navigation and elements
    await guestPage.goto("/cart");
    await guestPage.waitForSelector("[data-test-id='cart-items']", {
      timeout: 10000,
    });
    await guestPage.waitForSelector("[data-test-id='remove-item']", {
      timeout: 5000,
    });

    // Remove the item
    await guestPage.getByTestId("remove-item").click();

    // Wait for cart to update with longer timeout
    await guestPage.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
      { timeout: 10000 },
    );

    // Wait for UI update
    await guestPage.waitForTimeout(1000);

    // Verify cart is empty
    await expect(guestPage.getByTestId("empty-cart")).toBeVisible({
      timeout: 10000,
    });
  });
});
