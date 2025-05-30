import { test as setup } from "@playwright/test";
import fs from "fs";

// Make sure auth directory exists
if (!fs.existsSync(".auth")) {
  fs.mkdirSync(".auth");
}

// BROWSER-BASED Admin authentication
setup("authenticate as admin", { tag: "@admin" }, async ({ browser }) => {
  const authFile = ".auth/admin.json";

  // Create a browser context
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Go to login page
    await page.goto("http://localhost:3002/login");

    // Fill the login form
    await page.fill('input[id="email"]', "admin@store.com");
    await page.fill('input[id="password"]', "admin123");

    // Submit form and wait for navigation
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL("http://localhost:3002/").catch((e) => {
      console.error("⚠️ Navigation error:", e.message);
    });

    // Save authentication state
    await context.storageState({ path: authFile });

    // Verify auth file was created
    if (fs.existsSync(authFile)) {
      const stats = fs.statSync(authFile);
    }
  } catch (error) {
    throw error;
  } finally {
    await context.close();
  }
});
// BROWSER-BASED Customer authentication
setup("authenticate as customer", { tag: "@customer" }, async ({ browser }) => {
  const authFile = ".auth/customer.json";

  // Create a browser context
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Go to login page
    await page.goto("http://localhost:3001/login");

    // Fill the login form
    await page.fill('input[id="email"]', "john@example.com");
    await page.fill('input[id="password"]', "customer123");

    // Submit form and wait for navigation
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL("http://localhost:3001/products").catch((e) => {
      console.error("⚠️ Navigation error:", e.message);
    });

    // Save authentication state
    await context.storageState({ path: authFile });

    // Verify auth file was created
    if (fs.existsSync(authFile)) {
      const stats = fs.statSync(authFile);
    }
  } catch (error) {
    throw error;
  } finally {
    await context.close();
  }
});
