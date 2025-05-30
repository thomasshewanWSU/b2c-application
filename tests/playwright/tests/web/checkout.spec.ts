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

  test("should show empty form for authenticated users", async ({
    customerPage,
  }) => {
    await ensureLoggedIn(customerPage);

    // Go to cart and proceed to checkout
    await customerPage.goto("/cart");
    await customerPage.getByTestId("checkout-button").click();

    // Verify we're on checkout page
    await expect(customerPage).toHaveURL("/checkout");

    // Verify form elements exist
    await expect(customerPage.getByText("Contact Information")).toBeVisible();
    await expect(customerPage.getByLabel("Full Name")).toBeVisible();
    await expect(customerPage.getByLabel("Email")).toBeVisible();
    await expect(customerPage.getByLabel("Phone")).toBeVisible();
    await expect(customerPage.getByText("Shipping Address")).toBeVisible();
  });

  test("should validate form fields", async ({ customerPage }) => {
    await ensureLoggedIn(customerPage);

    await customerPage.goto("/cart");
    await customerPage.getByTestId("checkout-button").click();

    // Try to submit without filling the form
    await customerPage.getByRole("button", { name: "Place Order" }).click();

    // Check validation errors
    await expect(customerPage.getByText("Full name is required")).toBeVisible();
    await expect(customerPage.getByText("Email is required")).toBeVisible();
    await expect(
      customerPage.getByText("Phone number is required"),
    ).toBeVisible();
    await expect(
      customerPage.getByText("Street address is required"),
    ).toBeVisible();
  });

  test("should toggle billing address form when checkbox is clicked", async ({
    customerPage,
  }) => {
    await ensureLoggedIn(customerPage);

    await customerPage.goto("/cart");
    await customerPage.getByTestId("checkout-button").click();

    // Initially billing address form should not be visible
    await expect(customerPage.getByText("Billing Address")).not.toBeVisible();

    // Uncheck the "Same as shipping" checkbox
    await customerPage.getByLabel("Billing address same as shipping").uncheck();

    // Billing address form should now be visible
    await expect(
      customerPage.getByText("Billing Address", { exact: true }),
    ).toBeVisible();

    // Check it again
    await customerPage.getByLabel("Billing address same as shipping").check();

    // Billing address form should be hidden again
    await expect(
      customerPage.getByText("Billing Address", { exact: true }),
    ).not.toBeVisible();
  });

  test("should complete checkout successfully", async ({ customerPage }) => {
    await ensureLoggedIn(customerPage);

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
  await customerPage.waitForURL("/");
}
