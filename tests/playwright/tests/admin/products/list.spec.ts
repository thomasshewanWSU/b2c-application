import { test, expect } from "../fixtures.js";
import { seedTestDatabase } from "../../../database.setup.js";

test.beforeAll(async () => {
  await seedTestDatabase();
});

test.describe("Admin Product List Page", () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto("/products");
    // Wait for the product list to load with getByTestId
    await adminPage.getByTestId("product-list").waitFor({ state: "visible" });
  });

  test("should display product list with correct elements", async ({
    adminPage,
  }) => {
    // Check page title
    await expect(adminPage.getByTestId("product-title")).toBeVisible();

    // Verify filter section exists
    await expect(adminPage.getByTestId("filter-section")).toBeVisible();

    // Verify view toggle exists
    await expect(adminPage.getByTestId("view-toggle")).toBeVisible();

    await expect(adminPage.getByTestId("product-item")).toHaveCount(8);
  });

  test("should toggle between card and table views", async ({ adminPage }) => {
    // Check initial view (likely table)
    await expect(adminPage.getByTestId("product-table")).toBeVisible();

    // Click card view button
    await adminPage.getByTestId("card-view-btn").click();
    await expect(adminPage.getByTestId("product-cards")).toBeVisible();
    await expect(adminPage.getByTestId("product-table")).not.toBeVisible();

    // Click table view button
    await adminPage.getByTestId("table-view-btn").click();
    await expect(adminPage.getByTestId("product-table")).toBeVisible();
    await expect(adminPage.getByTestId("product-cards")).not.toBeVisible();
  });

  test("should filter products by search term", async ({ adminPage }) => {
    // Type a search term
    await adminPage.getByTestId("search-input").fill("laptop");
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Verify filtered results - only 1 product contains "laptop" in seed data
    await expect(adminPage.getByTestId("product-item")).toHaveCount(1);

    // Check each visible product contains the search term (case insensitive)
    const products = adminPage
      .getByTestId("product-item")
      .locator(".product-name");
    await expect(products).toHaveCount(1);
    expect(await products.first().textContent()).toContain("MacBook Pro");

    // Clear search and verify all products return
    await adminPage.getByTestId("search-input").clear();
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );
    await expect(adminPage.getByTestId("product-item")).toHaveCount(8);
  });

  test("should filter products by category", async ({ adminPage }) => {
    // Select a specific category
    await adminPage.getByTestId("category-select").selectOption("Electronics");
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    await expect(adminPage.getByTestId("product-item")).toHaveCount(7);

    // Check all visible products are in the selected category
    const categories = adminPage
      .getByTestId("product-item")
      .locator(".product-category");
    for (let i = 0; i < 6; i++) {
      const text = await categories.nth(i).textContent();
      expect(text).toBe("Electronics");
    }
  });

  test("should filter products by price range", async ({ adminPage }) => {
    // Set min and max price
    const minPrice = "50";
    const maxPrice = "200";

    await adminPage.getByTestId("min-price-input").fill(minPrice);
    await adminPage.getByTestId("max-price-input").fill(maxPrice);

    // Wait for the filter to apply
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    await expect(adminPage.getByTestId("product-item")).toHaveCount(4);

    // Check each visible product price is within range
    const prices = adminPage
      .getByTestId("product-item")
      .locator(".product-price");
    for (let i = 0; i < 4; i++) {
      const priceText = await prices.nth(i).textContent();
      // Extract numeric value from price (e.g., "$99.99" -> 99.99)
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
      expect(price).toBeGreaterThanOrEqual(parseFloat(minPrice));
      expect(price).toBeLessThanOrEqual(parseFloat(maxPrice));
    }
  });

  test("should filter products by stock status", async ({ adminPage }) => {
    // Select "In Stock" option
    await adminPage.getByTestId("stock-status-select").selectOption("inStock");
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    await expect(adminPage.getByTestId("product-item")).toHaveCount(7);

    // Check each visible product shows as in stock
    const stockIndicators = adminPage
      .getByTestId("product-item")
      .locator(".stock-indicator");
    for (let i = 0; i < 7; i++) {
      const text = await stockIndicators.nth(i).textContent();
      expect(text).toMatch(/In Stock|Low Stock \(\d+\)/i);
    }

    // Now check "Out of Stock" filter
    await adminPage
      .getByTestId("stock-status-select")
      .selectOption("outOfStock");
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Verify filtered results - 2 products are out of stock in seed data
    await expect(adminPage.getByTestId("product-item")).toHaveCount(2);

    // Check each visible product shows as out of stock
    const outOfStockIndicators = adminPage
      .getByTestId("product-item")
      .locator(".stock-indicator");
    for (let i = 0; i < 2; i++) {
      const text = await outOfStockIndicators.nth(i).textContent();
      expect(text).toMatch(/Out of Stock/i);
    }

    await adminPage.getByTestId("stock-status-select").selectOption("lowStock");
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Verify filtered results - 2 products are out of stock in seed data
    await expect(adminPage.getByTestId("product-item")).toHaveCount(2);
  });

  test("should sort products by different criteria", async ({ adminPage }) => {
    // Test price sorting: low to high
    await adminPage.getByTestId("sort-by-select").selectOption("priceLow");
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Verify products are sorted by price (low to high)
    const productPrices = adminPage
      .getByTestId("product-item")
      .locator(".product-price");
    const priceCount = await productPrices.count();
    let prevPrice = 0;
    const allPrices = [];
    for (let i = 0; i < priceCount; i++) {
      const priceText = await productPrices.nth(i).textContent();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
      allPrices.push(price);
    }
    for (let i = 1; i < priceCount; i++) {
      const priceText = await productPrices.nth(i).textContent();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

      if (i > 0) {
        expect(price).toBeGreaterThanOrEqual(prevPrice);
      }
      prevPrice = price;
    }

    // Test name sorting: A to Z
    await adminPage.getByTestId("sort-by-select").selectOption("nameAZ");
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Verify products are sorted alphabetically - check first and last items
    const productNames = adminPage
      .getByTestId("product-item")
      .locator(".product-name");

    // First product should be iPhone (alphabetically first in seed data)
    expect(await productNames.first().textContent()).toContain(
      "Organic Cotton T-Shirt",
    );
  });

  test("should combine multiple filters", async ({ adminPage }) => {
    // Apply category filter
    await adminPage.getByTestId("category-select").selectOption("Electronics");

    // Apply price range filter
    await adminPage.getByTestId("min-price-input").fill("100");
    await adminPage.getByTestId("max-price-input").fill("500");

    // Apply in-stock filter
    await adminPage.getByTestId("stock-status-select").selectOption("inStock");

    // Wait for all filters to apply
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Verify filtered results - should be 3 products that match all criteria
    await expect(adminPage.getByTestId("product-item")).toHaveCount(2);

    // Check each product meets all criteria
    const products = adminPage.getByTestId("product-item");
    for (let i = 0; i < 2; i++) {
      const product = products.nth(i);

      // Check category
      const category = await product.locator(".product-category").textContent();
      expect(category).toBe("Electronics");

      // Check price
      const priceText = await product.locator(".product-price").textContent();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
      expect(price).toBeGreaterThanOrEqual(100);
      expect(price).toBeLessThanOrEqual(500);

      // Check stock status
      const stockStatus = await product
        .locator(".stock-indicator")
        .textContent();
      expect(stockStatus).toMatch(/In Stock|Low Stock \(\d+\)/i);
    }
  });

  test("should reset all filters", async ({ adminPage }) => {
    // First apply some filters
    await adminPage.getByTestId("search-input").fill("laptop");
    await adminPage.getByTestId("category-select").selectOption("Electronics");

    // Wait for filters to apply
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Should be 1 product with "laptop" in the name and in Electronics category
    await expect(adminPage.getByTestId("product-item")).toHaveCount(1);

    // Click reset button
    await adminPage.getByTestId("reset-button").click();

    // Wait for reset to complete
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Verify filters are cleared
    expect(await adminPage.getByTestId("search-input").inputValue()).toBe("");
    expect(await adminPage.getByTestId("category-select").inputValue()).toBe(
      "",
    );

    // Verify we have all active products now (8)
    await expect(adminPage.getByTestId("product-item")).toHaveCount(8);
  });

  test("should paginate through products", async ({ adminPage }) => {
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Check if pagination exists - we should have pagination with 8 products (assuming 5-6 per page)
    await expect(adminPage.getByTestId("pagination")).toBeVisible();

    // Get first page products
    const firstPageProducts = await adminPage
      .getByTestId("product-item")
      .locator(".product-name")
      .allTextContents();

    expect(firstPageProducts.length).toBe(8);

    // Go to second page
    await adminPage.getByTestId("pagination").getByText("2").click();
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Get second page products
    const secondPageProducts = await adminPage
      .getByTestId("product-item")
      .locator(".product-name")
      .allTextContents();

    // Should be 3 products on second page (8 total - 5 on first page = 3)
    expect(secondPageProducts.length).toBe(1);

    // Verify different products are shown
    expect(firstPageProducts).not.toEqual(secondPageProducts);

    // Check URL contains page parameter
    expect(adminPage.url()).toContain("page=2");
  });

  test("should show empty state when no products match filters", async ({
    adminPage,
  }) => {
    // Apply impossible filter combination
    await adminPage
      .getByTestId("search-input")
      .fill("xyznonexistentproduct123");

    // Wait for filter to apply
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products/search") &&
        response.status() === 200,
    );

    // Check empty state is displayed
    await expect(adminPage.getByTestId("empty-state")).toBeVisible();
    await expect(adminPage.getByTestId("empty-state")).toContainText(
      "No products found",
    );

    // Verify product list is empty
    await expect(adminPage.getByTestId("product-item")).toHaveCount(0);
  });
});
