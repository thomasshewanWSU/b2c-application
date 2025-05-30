import { test, expect } from "./fixtures.js";
test.beforeEach(async ({ guestPage }) => {
  // Explicitly navigate to a blank page first to clear any previous state
  await guestPage.goto("about:blank");
});
test.describe("Admin Authentication", () => {
  test("unauthenticated users are redirected to login page", async ({
    guestPage,
  }) => {
    await guestPage.goto("/");
    await expect(guestPage).toHaveURL(/\/login/);
    await expect(
      guestPage.getByText("Enter your credentials to continue"),
    ).toBeVisible();
  });

  test("non-admin users cannot access admin dashboard", async ({
    customerPage,
  }) => {
    await customerPage.goto("/");
    await expect(customerPage).toHaveURL(/\/login/);
  });

  test("admin users can access dashboard", async ({ adminPage }) => {
    await adminPage.goto("/");
    await expect(adminPage.locator("h1")).toHaveText("Admin Dashboard");
  });
});

test.describe("Authentication for different admin routes", () => {
  const adminRoutes = ["/", "/products", "/products/1", "/orders", "/settings"];

  for (const route of adminRoutes) {
    test(`unauthenticated users cannot access ${route}`, async ({
      guestPage,
    }) => {
      // Navigate to the protected route
      await guestPage.goto(route);

      // Wait for any redirects to complete
      await guestPage.waitForLoadState("networkidle");

      // Verify we're on the login page
      await expect(guestPage).toHaveURL(/\/login/);

      // Additionally verify login page content is visible
      await expect(guestPage.getByText("Enter your credentials")).toBeVisible({
        timeout: 10000,
      });
    });
  }
});
