import { test, expect } from "./fixtures.js";
import { Page } from "@playwright/test";

test.describe("Checkout Process", () => {
  test("should redirect to login for guest users", async ({ page }) => {
    await page.goto("/products/wireless-bluetooth-headphones");
    await page.getByTestId("add-to-cart-button").click();
    await page.goto("/cart");
    await page.getByTestId("checkout-button").click();

    // Verify redirect to login with return URL
    await expect(page).toHaveURL(/\/login\?returnUrl=%252Fcheckout/);
  });

  test("should complete checkout successfully", async ({ customerPage }) => {
    await customerPage.goto("/login");
    await customerPage.getByLabel("Email").fill("john@example.com");
    await customerPage.getByLabel("Password").fill("customer123");
    await customerPage.getByRole("button", { name: "Sign In" }).click();
    await customerPage.waitForTimeout(1000); // Wait for login to complete
    await customerPage.goto("/cart");
    await customerPage.getByTestId("checkout-button").click();

    // Fill out the form
    await customerPage.getByLabel("Full Name").fill("John Smith");
    await customerPage.getByLabel("Email").fill("john@example.com");
    await customerPage.getByLabel("Phone").fill("0412345678");

    // Fill shipping address
    await customerPage.getByLabel("Street Address").fill("123 Main St");
    await customerPage.getByLabel("City").fill("Sydney");
    await customerPage.getByLabel("State").fill("NSW");
    await customerPage.getByLabel("Post Code").fill("2000");

    // Submit the form
    await customerPage.getByRole("button", { name: "Place Order" }).click();

    // Wait for redirect to confirmation page
    await customerPage.waitForURL(/\/checkout\/confirmation\/\d+/);

    // Verify confirmation page elements
    await expect(customerPage.getByText("Order Confirmed")).toBeVisible();
    await expect(
      customerPage.getByText("Thank you for your purchase"),
    ).toBeVisible();

    // Verify order details are shown
    await expect(customerPage.getByText("Order Details")).toBeVisible();
    await expect(customerPage.getByText("Order Number:")).toBeVisible();

    // Check if "Continue Shopping" button is present
    await expect(customerPage.getByText("Continue Shopping")).toBeVisible();
  });
});
async function ensureLoggedIn(customerPage): Promise<void> {
  await customerPage.goto("/login");
  await customerPage.getByLabel("Email").fill("john@example.com");
  await customerPage.getByLabel("Password").fill("customer123");
  await customerPage.getByRole("button", { name: "Sign In" }).click();
}
