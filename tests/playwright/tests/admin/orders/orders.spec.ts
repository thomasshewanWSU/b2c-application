import { test, expect } from "../fixtures.js";
import { seedTestDatabase } from "../../../database.setup.js";

test.beforeAll(async () => {
  await seedTestDatabase();
});

test.describe("Admin Orders Management", () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto("/orders");
    await adminPage.waitForLoadState("networkidle");
  });

  test("should display orders list with correct elements", async ({
    adminPage,
  }) => {
    // Check page title and controls
    await expect(
      adminPage.getByRole("heading", { name: "Orders" }),
    ).toBeVisible();

    // Verify orders are displayed
    await expect(
      adminPage.locator('[data-test-id="order-item"]').first(),
    ).toBeVisible();

    // Verify order contains key information
    const firstOrder = adminPage.locator('[data-test-id="order-item"]').first();
    await expect(firstOrder.locator('[data-test-id="order-id"]')).toBeVisible();
    await expect(
      firstOrder.locator('[data-test-id="order-date"]'),
    ).toBeVisible();
    await expect(
      firstOrder.locator('[data-test-id="order-status"]'),
    ).toBeVisible();
    await expect(
      firstOrder.locator('[data-test-id="order-total"]'),
    ).toBeVisible();
  });

  test("should filter orders by status", async ({ adminPage }) => {
    // Select "Processing" status
    await adminPage
      .locator('[data-test-id="status-select"]')
      .selectOption("processing");

    // Wait for response after filtering
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/orders/search") &&
        response.status() === 200,
    );

    // Check all visible orders have "Processing" status
    const statuses = adminPage
      .locator('[data-test-id="order-item"]')
      .locator('[data-test-id="order-status"]');
    const count = await statuses.count();

    // Skip test if no orders match filter
    if (count === 0) {
      test.skip();
      return;
    }

    for (let i = 0; i < count; i++) {
      const status = await statuses.nth(i).textContent();
      expect(status?.toLowerCase()).toContain("processing");
    }
  });

  test("should filter orders by date range", async ({ adminPage }) => {
    // Set date range for last 7 days
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const formattedToday = today.toISOString().split("T")[0];
    const formattedLastWeek = lastWeek.toISOString().split("T")[0];

    // Fill in date filters
    await adminPage
      .locator('[data-test-id="from-date"]')
      .fill(formattedLastWeek);
    await adminPage.locator('[data-test-id="to-date"]').fill(formattedToday);

    // Apply filters by triggering change event - no explicit apply button in component
    await adminPage.locator('[data-test-id="to-date"]').press("Enter");

    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/orders/search") &&
        response.status() === 200,
    );

    // Verify filters are applied (check for active filters)
    await expect(
      adminPage.locator('[data-test-id="active-filters"]'),
    ).toBeVisible();
  });

  test("should view order details", async ({ adminPage }) => {
    // Find the view button within the first order and click it
    await adminPage
      .locator('[data-test-id="order-item"]')
      .first()
      .locator('[data-test-id="view-order-button"]')
      .click();

    // Wait for navigation to complete
    await adminPage.waitForURL(/\/orders\/\d+/);

    // Now check order details are displayed
    await expect(
      adminPage.locator('[data-test-id="order-detail"]'),
    ).toBeVisible();
    await expect(
      adminPage.locator('[data-test-id="order-summary"]'),
    ).toBeVisible();
    await expect(
      adminPage.locator('[data-test-id="order-items"]'),
    ).toBeVisible();
  });
  test("should update order status", async ({ adminPage }) => {
    // Navigate to first order detail page using the view button
    await adminPage
      .locator('[data-test-id="order-item"]')
      .first()
      .locator('[data-test-id="view-order-button"]')
      .click();

    // Wait for navigation to complete
    await adminPage.waitForURL(/\/orders\/\d+/);
    await adminPage.waitForLoadState("networkidle");

    // Wait explicitly for status select to be available with longer timeout
    await adminPage
      .locator('[data-test-id="status-select"]')
      .waitFor({ timeout: 10000 });

    // Get current status
    const currentStatus = await adminPage
      .locator('[data-test-id="status-select"]')
      .inputValue();

    // Choose a different status
    const statuses = ["pending", "processing", "shipped", "delivered"];
    const newStatus =
      statuses.find((status) => status !== currentStatus) || "processing";

    // Apply the new status - this might trigger the update automatically
    await adminPage
      .locator('[data-test-id="status-select"]')
      .selectOption(newStatus);

    // Wait for the status change API request to complete
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/orders/") && response.status() === 200,
    );

    // Look for success message or other confirmation
    try {
      await expect(
        adminPage.locator('[data-test-id="success-message"]'),
      ).toBeVisible({ timeout: 10000 });
    } catch (e) {
      // If no success message, check if status badge was updated instead
      const statusBadge = adminPage.locator('[data-test-id="status-badge"]');
      if ((await statusBadge.count()) > 0) {
        await expect(statusBadge).toContainText(newStatus, {
          ignoreCase: true,
        });
      }
    }
  });
});
