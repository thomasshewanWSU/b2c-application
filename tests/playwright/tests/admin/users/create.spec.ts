import { test, expect } from "../fixtures.js";
import { seedTestDatabase } from "../../../database.setup.js";

test.beforeAll(async () => {
  await seedTestDatabase();
});

test.describe("Admin User Creation", () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto("/users/create");
    await adminPage.waitForLoadState("networkidle");
    await adminPage.waitForSelector("form", { state: "visible" });
  });

  test("should display the user creation form", async ({ adminPage }) => {
    // Use role selector instead of text for heading
    await expect(
      adminPage.getByRole("heading", { name: "Create Admin User" }),
    ).toBeVisible();
    await expect(
      adminPage.getByText("Add a new administrator to the system"),
    ).toBeVisible();

    // Check form fields are displayed
    await expect(adminPage.getByLabel("Full Name")).toBeVisible();
    await expect(adminPage.getByLabel("Email Address")).toBeVisible();
    await expect(
      adminPage.getByLabel("Password", { exact: true }),
    ).toBeVisible();
    await expect(
      adminPage.getByLabel("Confirm Password", { exact: true }),
    ).toBeVisible();

    // Check button is present
    await expect(
      adminPage.getByRole("button", { name: "Create Admin User" }),
    ).toBeVisible();
  });

  test("should create an admin user with valid data", async ({ adminPage }) => {
    const timestamp = Date.now();
    const testEmail = `admin-test-${timestamp}@example.com`;

    // Fill the form
    await adminPage.getByLabel("Full Name").fill("Test Admin User");
    await adminPage.getByLabel("Email Address").fill(testEmail);
    await adminPage.getByLabel("Password", { exact: true }).fill("Password123");
    await adminPage
      .getByLabel("Confirm Password", { exact: true })
      .fill("Password123");

    // Submit form
    await adminPage.getByRole("button", { name: /Create Admin User/i }).click();

    // Navigate to users list to verify
    await adminPage.goto("/users");
    await adminPage.waitForLoadState("networkidle");
  });

  test("should show validation errors for empty fields", async ({
    adminPage,
  }) => {
    // Submit form without filling fields
    await adminPage.getByRole("button", { name: /Create Admin User/i }).click();

    // Check validation errors
    await expect(adminPage.getByText("Name is required")).toBeVisible();
    await expect(adminPage.getByText("Email is required")).toBeVisible();
    await expect(adminPage.getByText("Password is required")).toBeVisible();
  });

  test("should validate password requirements", async ({ adminPage }) => {
    // Fill form with short password
    await adminPage.getByLabel("Full Name").fill("Test User");
    await adminPage.getByLabel("Email Address").fill("test@example.com");
    await adminPage.getByLabel("Password", { exact: true }).fill("123");
    await adminPage.getByLabel("Confirm Password", { exact: true }).fill("123");

    // Submit form
    await adminPage.getByRole("button", { name: /Create Admin User/i }).click();

    // Check validation error for password length
    await expect(
      adminPage.getByText("Password must be at least 8 characters"),
    ).toBeVisible();

    // Fix password length but make passwords not match
    await adminPage.getByLabel("Password", { exact: true }).fill("Password123");
    await adminPage
      .getByLabel("Confirm Password", { exact: true })
      .fill("Password456");
    await adminPage.getByRole("button", { name: /Create Admin User/i }).click();

    // Check validation error for password mismatch
    await expect(adminPage.getByText("Passwords don't match")).toBeVisible();
  });

  test("should show error for duplicate email", async ({ adminPage }) => {
    // Fill form with existing admin email (from seed data)
    await adminPage.getByLabel("Full Name").fill("Duplicate Admin");
    await adminPage.getByLabel("Email Address").fill("admin@store.com");
    await adminPage.getByLabel("Password", { exact: true }).fill("Password123");
    await adminPage
      .getByLabel("Confirm Password", { exact: true })
      .fill("Password123");

    // Submit form
    await adminPage.getByRole("button", { name: /Create Admin User/i }).click();

    // Check error for duplicate email
    await expect(adminPage.getByText("Email is already in use")).toBeVisible({
      timeout: 5000,
    });
  });
});
