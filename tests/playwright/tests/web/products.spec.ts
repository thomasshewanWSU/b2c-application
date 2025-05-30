import { test, expect } from "@playwright/test";
test.describe("Products Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/products");
    // Wait for products to load using test ID
    await page.waitForSelector("[data-test-id='product-card']");
  });

  test("should display product cards with expected elements", async ({
    page,
  }) => {
    // Check that product cards are displayed
    const productCards = page.getByTestId("product-card");
    await expect(productCards.first()).toBeVisible();

    // Check basic product card elements
    const firstProduct = productCards.first();
    await expect(firstProduct.getByTestId("product-brand")).toBeVisible();
    await expect(firstProduct.getByTestId("product-name")).toBeVisible();
    await expect(firstProduct.getByTestId("product-price")).toBeVisible();
  });

  test("should filter products by brand", async ({ page }) => {
    // Find first brand checkbox and its name
    const firstBrandItem = page.getByTestId(/^brand-item-/).first();
    const brandCheckbox = firstBrandItem.getByTestId(/^brand-checkbox-/);

    // Get the brand name
    const brandNameEl = firstBrandItem.getByTestId(/^brand-name-/);
    const brandName = await brandNameEl.textContent();

    // Click the brand checkbox
    await brandCheckbox.click();

    // Wait for page to update
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Verify URL contains brand
    expect(page.url()).toContain(
      `brand=${encodeURIComponent(brandName || "")}`,
    );
  });

  test("should search for products using search bar", async ({ page }) => {
    // Type in search box (assuming you add data-test-id attributes)
    await page.getByTestId("search-input").fill("headphones");

    // Click search button
    await page.getByTestId("search-button").click();

    // Wait for page to update
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Verify URL contains search term
    expect(page.url()).toContain("search=headphones");

    // Verify product names contain the search term
    const productNames = await page.getByTestId("product-name").allInnerTexts();
    const hasMatchingProduct = productNames.some((name) =>
      name.toLowerCase().includes("headphone"),
    );
    expect(hasMatchingProduct).toBeTruthy();
  });

  test("should filter products by category", async ({ page }) => {
    // Get initial product count
    const initialCount = await page.getByTestId("product-card").count();

    // Find and click on a category button in the sidebar
    const categoryButtons = page
      .locator("[data-test-id^='category-']")
      .filter({ hasText: /^((?!All Departments).)*$/ });
    const firstCategoryButton = categoryButtons.first();

    // Get category name before clicking
    const categoryName = await firstCategoryButton.textContent();
    await firstCategoryButton.click();

    // Wait for page to update
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Verify URL contains the category
    expect(page.url()).toContain(
      `category=${encodeURIComponent(categoryName || "")}`,
    );

    // Verify product count has changed
    const newCount = await page.getByTestId("product-card").count();
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test("should filter products by price range using quick buttons", async ({
    page,
  }) => {
    // Click a price range button (e.g., $25 to $50)
    await page.getByTestId("price-25-50").click();

    // Wait for page to update
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Verify URL contains price range
    expect(page.url()).toContain("minPrice=25");
    expect(page.url()).toContain("maxPrice=50");
  });

  test("should filter by in-stock products", async ({ page }) => {
    // Click In Stock radio button
    await page.getByTestId("stock-status-in-stock").click();

    // Wait for page to update
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Verify URL contains stock filter
    expect(page.url()).toContain("stockStatus=inStock");
  });

  test("should reset all filters", async ({ page }) => {
    // First apply a filter
    await page.getByTestId("price-25-50").click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Click reset button
    await page.getByTestId("reset-filters-button").click();

    // Wait for page to update
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // URL should be clean or have minimal parameters
    expect(page.url()).not.toContain("minPrice=");
    expect(page.url()).not.toContain("maxPrice=");
  });

  test("should combine multiple filters", async ({ page }) => {
    // Apply category filter first
    const electronicsButton = page.getByTestId("category-electronics");

    if (await electronicsButton.isVisible()) {
      await electronicsButton.click();
    } else {
      // Try a different category if Electronics isn't available
      const anyCategory = page
        .locator("[data-test-id^='category-']")
        .filter({ hasText: /^((?!All Departments).)*$/ })
        .first();
      await anyCategory.click();
    }

    // Apply price range
    await page.getByTestId("price-25-50").click();

    // Apply in-stock filter
    await page.getByTestId("stock-status-in-stock").click();

    // Wait for final results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Verify URL contains all filters
    expect(page.url()).toContain("minPrice=25");
    expect(page.url()).toContain("maxPrice=50");
    expect(page.url()).toContain("stockStatus=inStock");
  });
});
