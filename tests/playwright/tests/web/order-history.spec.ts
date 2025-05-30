import { test, expect } from "./fixtures.js";

test.describe("Order History", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    // Try to access order history as a guest
    await page.goto("/orders");

    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login\?returnUrl=%252Forders/);
  });

  test("should display order history for authenticated users", async ({
    customerPage,
  }) => {
    // Ensure logged in
    await ensureLoggedIn(customerPage);

    // Go to order history page
    await customerPage.goto("/orders");

    // Check page title/heading is visible
    await expect(customerPage.getByText("Your Orders")).toBeVisible();

    await expect(customerPage.getByTestId("orders-list")).toBeVisible();
  });

  test("should display order details correctly", async ({ customerPage }) => {
    await ensureLoggedIn(customerPage);
    await customerPage.goto("/orders");

    const firstOrder = customerPage.getByTestId("order-item").first();

    const totalText = await firstOrder.getByTestId("order-total").textContent();
    expect(totalText).toMatch(/\$\d+\.\d{2}/); // Should match format $XX.XX
  });

  test("should navigate to order details page", async ({ customerPage }) => {
    await ensureLoggedIn(customerPage);
    await customerPage.goto("/orders");

    await customerPage.getByText("View Details").first().click();

    // Should navigate to order details page
    await expect(customerPage).toHaveURL(/\/orders\/\d+/);

    // Check order details content is visible
    await expect(customerPage.getByTestId("order-details")).toBeVisible();
    await expect(customerPage.getByTestId("order-items")).toBeVisible();
  });
});

// Helper function for login
async function ensureLoggedIn(customerPage): Promise<void> {
  await customerPage.goto("/login");
  await customerPage.getByLabel("Email").fill("john@example.com");
  await customerPage.getByLabel("Password").fill("customer123");
  await customerPage.getByRole("button", { name: "Sign In" }).click();
  await customerPage.waitForURL("/");
}
