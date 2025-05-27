import { test as base, expect, Page } from "@playwright/test";

// Define our fixture types
type UserFixtures = {
  adminPage: Page;
  customerPage: Page;
  guestPage: Page;
};

// Create the extended test
export const test = base.extend<UserFixtures>({
  // Admin user fixture
  adminPage: async ({ browser }, use) => {
    // Create context with admin auth state
    const context = await browser.newContext({
      storageState: ".auth/admin.json",
    });

    // Create a page in this context
    const page = await context.newPage();

    try {
      await use(page);
    } finally {
      await context.close();
    }
  },

  // Customer user fixture
  customerPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: ".auth/customer.json",
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Guest user fixture (no auth)
  guestPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// Export expect as well for convenience
export { expect };
