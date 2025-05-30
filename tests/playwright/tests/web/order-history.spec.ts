import { test, expect } from "./fixtures.js";

test.describe("Order History", () => {
  test("should redirect to login when not authenticated", async ({
    guestPage,
  }) => {
    // Try to access order history as a guest
    await guestPage.goto("/orders");

    // Should redirect to login with return URL
    await expect(guestPage).toHaveURL(/\/login\?returnUrl=%252Forders/);
  });

  test("should display order history for authenticated users", async ({
    customerPage,
  }) => {
    // Ensure logged in

    // Go to order history page
    await customerPage.goto("/orders");

    // Check page title/heading is visible
    await expect(customerPage.getByText("Your Orders")).toBeVisible();

    await expect(customerPage.getByTestId("orders-list")).toBeVisible();
  });

  test("should display order details correctly", async ({ customerPage }) => {
    await customerPage.goto("/orders");

    const firstOrder = customerPage.getByTestId("order-item").first();

    const totalText = await firstOrder.getByTestId("order-total").textContent();
    expect(totalText).toMatch(/\$\d+\.\d{2}/); // Should match format $XX.XX
  });

  test("should navigate to order details page", async ({ customerPage }) => {
    await customerPage.goto("/orders");

    await customerPage.getByText("View Details").first().click();

    // Should navigate to order details page
    await expect(customerPage).toHaveURL(/\/orders\/\d+/);

    // Check order details content is visible
    await expect(customerPage.getByTestId("order-details")).toBeVisible();
    await expect(customerPage.getByTestId("order-items")).toBeVisible();
  });
});
