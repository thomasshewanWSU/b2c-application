import { test, expect } from "../fixtures.js";
import { seedTestDatabase } from "../../../database.setup.js";

test.beforeAll(async () => {
  await seedTestDatabase();
});

test.describe("Admin Product Create & Edit", () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto("/products");
    await adminPage.waitForLoadState("networkidle");
    await adminPage.getByTestId("product-list").waitFor({ state: "visible" });
  });

  test("should create a new product", async ({ adminPage }) => {
    // Look for "New Product" link - matching your actual UI
    const createButton = adminPage.getByRole("link", { name: "New Product" });

    // Verify it's visible before clicking
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for the form to be visible
    await adminPage.waitForSelector("form", { state: "visible" });

    // Fill out the form with more specific label selectors
    await adminPage.getByLabel("Product Name").fill("Test Product");
    await adminPage.getByLabel("Brand").fill("Test Brand");

    // Fix: Use exact label text for the description fields
    await adminPage.getByLabel("Short Description").fill("A test product");
    await adminPage.getByLabel("Price").fill("123.45");
    await adminPage
      .getByLabel("Image URL")
      .fill("https://example.com/test.jpg");
    await adminPage.getByLabel("Stock").fill("10");
    await adminPage.getByLabel("Category").selectOption("Electronics");
    await adminPage.getByLabel("Specifications").fill("Specs");
    await adminPage.getByLabel("Detailed Description").fill("Detailed info");

    // Submit the form and wait for response
    const saveButton = adminPage.getByRole("button", {
      name: "Create Product",
    });
    await saveButton.click();
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Check product is added to the list
    await adminPage.goto("/products");
    await adminPage.waitForLoadState("networkidle");
    await adminPage.getByTestId("product-list").waitFor({ state: "visible" });

    const names = await adminPage
      .getByTestId("product-item")
      .locator(".product-name")
      .allTextContents();
    expect(names).toContain("Test Product");
  });
  test("should successfully edit an existing product", async ({
    adminPage,
  }) => {
    // Store original product name before editing
    const firstProduct = adminPage.getByTestId("product-item").first();
    const originalName = await firstProduct
      .locator(".product-name")
      .textContent();

    // Navigate to edit page by clicking the edit link
    await firstProduct.getByRole("link", { name: /edit/i }).click();

    // Wait for the form to load
    await adminPage.waitForSelector("form", { state: "visible" });

    // Verify we're on the edit page
    await expect(adminPage).toHaveURL(/\/products\/\d+\/edit$/);

    // Store current values to verify they're pre-filled
    const currentName = await adminPage.getByLabel("Product Name").inputValue();
    expect(currentName).toBeTruthy();

    // Modify product details
    const newName = "An Updated Product Name";
    const newDescription = "An Updated product description";
    const newPrice = "199.99";

    // Clear and update fields
    await adminPage.getByLabel("Product Name").fill(newName);
    await adminPage.getByLabel("Short Description").fill(newDescription);
    await adminPage.getByLabel("Price").fill(newPrice);

    // Submit the form and wait for response
    await adminPage.getByRole("button", { name: /save|update/i }).click();
    await adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/products") && response.status() === 200,
    );

    // Verify we're redirected back to the product detail page
    await expect(adminPage).toHaveURL(/\/products\/\d+$/);

    // Navigate back to products list
    await adminPage.goto("/products");
    await adminPage.waitForLoadState("networkidle");
    await adminPage.getByTestId("product-list").waitFor({ state: "visible" });

    // Verify product name has been updated
    const names = await adminPage
      .getByTestId("product-item")
      .locator(".product-name")
      .allTextContents();

    expect(names).toContain(newName);
    expect(names).not.toContain(originalName);

    const updatedProductElement = adminPage
      .getByTestId("product-item")
      .filter({ hasText: newName })
      .first();

    await expect(updatedProductElement).toBeVisible();
    await expect(updatedProductElement.locator(".product-name")).toContainText(
      newName,
    );
  });
});
