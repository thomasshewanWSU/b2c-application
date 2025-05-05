import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.describe("DETAIL SCREEN", () => {
  test.beforeEach(async () => {
    await seed();
  });

  test(
    "Detail view",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/post/boost-your-conversion-rate");

      // DETAIL SCREEN > Detail page shows the same items as list item, but the short description is replaced by formatted long description

      const item = await page.getByTestId("blog-post-1");
      await expect(item).toBeVisible();

      await expect(item.getByText("Boost your conversion rate")).toBeVisible();
      await expect(
        item.getByText("Boost your conversion rate"),
      ).toHaveAttribute("href", "/post/boost-your-conversion-rate");

      await expect(item.getByText("Node")).toBeVisible();
      await expect(item.getByText("#Back-End")).toBeVisible();
      await expect(item.getByText("#Databases")).toBeVisible();
      await expect(item.getByText("18 Apr 2022")).toBeVisible();
      await expect(item.getByText("321 views")).toBeVisible();
      await expect(item.getByText("3 likes")).toBeVisible();

      // DETAIL SCREEN > Detail text is stored as Markdown, which needs to be converted to HTML
      await expect(
        await page.getByTestId("content-markdown").innerHTML(),
      ).toContain("<strong>sint voluptas</strong>");
    },
  );

  test(
    "Views increase on each view",
    {
      tag: "@a3",
    },
    async ({ page }) => {
      // BACKEND / CLIENT > Each visit of the page increases the post "views" count by one

      await page.goto("/post/boost-your-conversion-rate");
      await expect(page.getByText("321 views")).toBeVisible();
      await page.goto("/post/boost-your-conversion-rate");
      await expect(page.getByText("322 views")).toBeVisible();
    },
  );

  test(
    "Like posts",
    {
      tag: "@a3",
    },
    async ({ page }) => {
      // BACKEND / CLIENT > User can "like" the post on the detail screen, NOT on the list

      // First visit
      await page.goto("/post/boost-your-conversion-rate");

      // Wait for initial page load and API calls to complete
      await page.waitForLoadState("networkidle");

      // Check initial like count
      await expect(page.getByText("3 likes")).toBeVisible();

      // Click the like button and wait for API response
      await page.getByTestId("like-button").click();
      try {
        await Promise.race([
          page.waitForResponse(
            (res) => res.url().includes("/api/likes") && res.status() === 200,
            { timeout: 10000 }
          ),
          page.waitForFunction(() => {
            // Look for visual confirmation that like was registered
            return document.querySelector('[data-testid="like-button"].liked') !== null;
          }, { timeout: 15000 })
        ]);
      } catch (e) {
        console.log("Could not detect API response, continuing with test...");
      }

      // Verify like count increased
      await expect(page.getByText("4 likes")).toBeVisible();

      // Second visit - make sure we use a completely new page load
      await page.goto("/");
      await page.goto("/post/boost-your-conversion-rate");

      // Wait for initial page load and status API call to complete
      await page.waitForResponse(
        (res) =>
          res.url().includes("/api/likes/status") && res.status() === 200,
      );

      // Verify like count persisted
      await expect(page.getByText("4 likes")).toBeVisible();

      // Click to unlike and wait for API response
      await page.getByTestId("like-button").click();
      await page.waitForResponse(
        (res) => res.url().includes("/api/likes") && res.status() === 200,
      );

      // Verify like count decreased
      await expect(page.getByText("3 likes")).toBeVisible();
    },
  );
});
