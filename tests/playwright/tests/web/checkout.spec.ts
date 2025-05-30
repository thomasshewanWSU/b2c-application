import { test, expect } from "./fixtures.js";
import { Page } from "@playwright/test";

test.describe("Checkout Process", () => {
  test("should complete checkout successfully", async ({ customerPage }) => {
    // Use the helper function instead of inline login

    // Make sure cart has an item (crucial step that was missing)
    await customerPage.goto("/products/wireless-bluetooth-headphones");
    await customerPage.getByTestId("add-to-cart-button").click();

    // Wait for API response to confirm item was added
    await customerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") && response.status() === 200,
    );

    // Navigate to cart with longer timeout
    await customerPage.goto("/cart");
    await customerPage.waitForSelector("[data-test-id='cart-items']", {
      timeout: 10000,
    });

    // Proceed to checkout with explicit wait
    await customerPage.getByTestId("checkout-button").click();
    await customerPage.waitForURL("/checkout");

    // Fill out the form
    await customerPage.getByLabel("Full Name").fill("John Smith");
    await customerPage.getByLabel("Email").fill("john@example.com");
    await customerPage.getByLabel("Phone").fill("0412345678");

    // Fill shipping address
    await customerPage.getByLabel("Street Address").fill("123 Main St");
    await customerPage.getByLabel("City").fill("Sydney");
    await customerPage.getByLabel("State").fill("NSW");
    await customerPage.getByLabel("Post Code").fill("2000");

    // Submit the form with longer timeout
    const placeOrderButton = customerPage.getByRole("button", {
      name: "Place Order",
    });
    await expect(placeOrderButton).toBeEnabled();
    await placeOrderButton.click();

    // Wait for redirect to confirmation page with increased timeout
    await customerPage.waitForURL(/\/checkout\/confirmation\/\d+/, {
      timeout: 15000,
    });

    // Verify confirmation page elements
    await expect(customerPage.getByText("Order Confirmed")).toBeVisible({
      timeout: 10000,
    });
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
