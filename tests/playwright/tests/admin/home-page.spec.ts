import { test, expect } from "./fixtures.js";
import * as fs from "fs";

test.describe("Admin Dashboard Home Page", () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto("/");
  });

  test("should display the admin dashboard title and metadata", async ({
    adminPage,
  }) => {
    // Check heading text
    await expect(adminPage.locator("h1")).toHaveText("Admin Dashboard");

    // Verify page title (metadata)
    const title = await adminPage.title();
    expect(title).toBe("Admin Dashboard");

    // Check metadata description is set (can't directly check content)
    const metaDescription = await adminPage
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(metaDescription).toBeTruthy();
  });

  test("should display three admin navigation cards", async ({ adminPage }) => {
    // Check all cards are present
    const cards = adminPage.locator("div.grid > a");
    await expect(cards).toHaveCount(3);

    // Verify cards have correct styling class
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i).locator("div").first()).toHaveClass(
        new RegExp("dashboardCard"),
      );
    }
  });

  test("should display correct card titles and descriptions", async ({
    adminPage,
  }) => {
    const expectedCards = [
      {
        title: "Products",
        description: "Manage your product catalog, prices, and inventory",
      },
      {
        title: "Users",
        description: "View and manage customer accounts and profiles",
      },
      {
        title: "Orders",
        description: "Process customer orders and manage shipments",
      },
    ];

    const cards = adminPage.locator("div.grid > a");

    for (let i = 0; i < expectedCards.length; i++) {
      // Check card title
      await expect(cards.nth(i).locator("h2")).toHaveText(
        expectedCards[i].title,
      );

      // Check card description
      await expect(cards.nth(i).locator("p")).toHaveText(
        expectedCards[i].description,
      );

      // Check that each card has an icon
      await expect(cards.nth(i).locator("svg")).toBeVisible();
    }
  });

  test("should navigate to correct pages when cards are clicked", async ({
    adminPage,
  }) => {
    const cardDetails = [
      { index: 0, path: "/products" },
      { index: 1, path: "/users" },
      { index: 2, path: "/orders" },
    ];

    for (const { index, path } of cardDetails) {
      // Start fresh for each test
      await adminPage.goto("/");

      // Get the card and click it
      const cards = adminPage.locator("div.grid > a");
      await cards.nth(index).click();

      // Check that we navigated to the correct URL
      await expect(adminPage).toHaveURL(new RegExp(path));

      // Wait for page to load
      await adminPage.waitForLoadState("networkidle");
    }
  });

  test("should be responsive", async ({ adminPage }) => {
    // Set viewport to mobile size
    await adminPage.setViewportSize({ width: 375, height: 667 });

    // Check that cards stack vertically on mobile
    const gridElement = adminPage.locator("div.grid");
    await expect(gridElement).toHaveClass(/grid-cols-1/);

    // Set viewport to desktop size
    await adminPage.setViewportSize({ width: 1280, height: 720 });

    // Check that cards display in 3 columns on desktop
    await expect(gridElement).toHaveClass(/md:grid-cols-3/);
  });
});
