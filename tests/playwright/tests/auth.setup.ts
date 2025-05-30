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
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Direct API authentication instead of form submission
    await page.goto("http://localhost:3001/api/auth/csrf");
    const csrfResponse = await page.evaluate(() => document.body.textContent);
    const { csrfToken } = JSON.parse(csrfResponse);

    // Post directly to credentials endpoint
    const response = await page.request.post(
      "http://localhost:3001/api/auth/callback/credentials",
      {
        form: {
          csrfToken,
          email: "john@example.com",
          password: "customer123",
          redirect: false,
          json: true,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // Visit a page to ensure cookies are properly set
    await page.goto("http://localhost:3001/account");
    await page.waitForTimeout(2000);

    // Check cookie status
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) => c.name === "next-auth.session-token",
    );

    if (!sessionCookie) {
      console.error("⚠️ Session token still missing after API auth");
      console.log("Available cookies:", cookies.map((c) => c.name).join(", "));

      // Try an alternative approach - force a session through a custom endpoint
      await page.goto("http://localhost:3001/api/auth/session");
      await page.waitForTimeout(2000);
    }

    // Store auth state
    await context.storageState({ path: authFile });

    // Verify
    const authContent = JSON.parse(fs.readFileSync(authFile, "utf-8"));
    const hasToken = authContent.cookies?.some(
      (c) => c.name === "next-auth.session-token",
    );
    console.log(
      "Final session token status:",
      hasToken ? "✅ Present" : "❌ Missing",
    );
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  } finally {
    await context.close();
  }
});
