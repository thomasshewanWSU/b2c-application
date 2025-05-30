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

    // Add to cart
    await guestPage.getByTestId("add-to-cart-button").click();

    // Go to cart page
    await guestPage.goto("/cart");
    // Get initial price
    const initialPrice = await guestPage
      .getByTestId("item-total")
      .textContent();

    // Increase quantity
    await guestPage.getByTestId("quantity-increase").click();

    // Wait for cart to update
    await guestPage.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
    );

    // Add explicit wait for UI to update
    await guestPage.waitForTimeout(500);

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

    // Add to cart
    await guestPage.getByTestId("add-to-cart-button").click();

    // Go to cart page
    await guestPage.goto("/cart");
    // Remove the item
    await guestPage.getByTestId("remove-item").click();

    // Wait for cart to update
    await guestPage.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
    );

    // Verify cart is empty
    await expect(guestPage.getByTestId("empty-cart")).toBeVisible();
  });

  test("should show stock warnings when appropriate", async ({ guestPage }) => {
    // This test requires setup to create a stock issue scenario
    await guestPage.goto("/cart?stockIssues=true");

    // Verify warning is shown
    await expect(guestPage.getByTestId("stock-warning")).toBeVisible();
  });
  test("should merge anonymous cart with user cart after login", async ({
    guestPage,
  }) => {
    // Add item to cart as anonymous user
    await guestPage.goto("/products/wireless-bluetooth-headphones");
    await guestPage.getByTestId("add-to-cart-button").click();

    // Verify item was added to anonymous cart
    await guestPage.goto("/cart");
    await expect(guestPage.getByTestId("cart-items")).toBeVisible();
    await expect(guestPage.getByTestId("product-name")).toContainText(
      "Wireless Bluetooth Headphones",
    );

    // Login
    await guestPage.goto("/login");
    await guestPage.getByLabel("Email").fill("john@example.com");
    await guestPage.getByLabel("Password").fill("customer123");
    await guestPage.getByRole("button", { name: "Sign In" }).click();

    // Don't wait for specific request, just wait for login to complete
    await guestPage.waitForURL((url) => !url.pathname.includes("/login"));

    // Verify item is still in cart after login (merged)
    await guestPage.goto("/cart");
    await expect(guestPage.getByTestId("cart-items")).toBeVisible();
    await expect(guestPage.getByTestId("product-name")).toContainText(
      "Wireless Bluetooth Headphones",
    );
  });
});
