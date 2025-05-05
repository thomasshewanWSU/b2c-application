import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.beforeAll(async () => {
  await seed();
});

test.describe("ADMIN LIST SCREEN", () => {
  test.beforeAll(async () => {
    await seed();
  });

  test(
    "Show all posts",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      await expect(await userPage.locator("article").count()).toBe(6);
    },
  );

  test(
    "Filter by content",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > On the top is a filter screen that allows to filter posts by Title or content
      await userPage.getByLabel("Filter by Content:").fill("Boost");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      await userPage.waitForTimeout(1500);
      await expect(await userPage.locator("article").count()).toBe(1);
      await expect(
        userPage.getByText("Boost your conversion rate"),
      ).toBeVisible();

      await userPage.getByLabel("Filter by Content:").fill("post2");
      await expect(
        userPage.getByText("Better front ends with Fatboy Slim"),
      ).toBeVisible();

      await userPage.getByLabel("Filter by Content:").clear();
      await userPage.waitForSelector('[data-filter-status="complete"]');

      await expect(await userPage.locator("article").count()).toBe(6);
    },
  );

  test(
    "Filter by tag",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > On the top is a filter screen that allows to filter posts by tags
      await userPage.getByLabel("Filter by Tag:").fill("Front");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      await userPage.waitForTimeout(1500);
      await expect(await userPage.locator("article").count()).toBe(2);
      await expect(
        userPage.getByText("Better front ends with Fatboy Slim"),
      ).toBeVisible();
      await expect(
        userPage.getByText("No front end framework is the best"),
      ).toBeVisible();
      await userPage.getByLabel("Filter by Tag:").clear();
      await userPage.waitForSelector('[data-filter-status="complete"]');
    },
  );

  test(
    "Filter by date",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > On the top is a filter screen that allows to filter posts by date
      await userPage
        .getByLabel("Filter by Date Created:")
        .pressSequentially("01012022");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      // Wait explicitly for 2 articles to appear - the exact condition you're testing for
      await userPage.waitForFunction(() => {
        return document.querySelectorAll('article').length === 2;
      }, { timeout: 10000 }); 
      await expect(await userPage.locator("article").count()).toBe(2);
      await expect(
        userPage.getByText("Boost your conversion rate"),
      ).toBeVisible();
      await expect(
        userPage.getByText("No front end framework is the best"),
      ).toBeVisible();
      await userPage.getByLabel("Filter by Date Created:").clear();
      await userPage.waitForSelector('[data-filter-status="complete"]');
    },
  );
  test(
    "Combine Filters",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");
  
      // Filter by tag first
      await userPage.getByLabel("Filter by Tag:").fill("Front");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      
      // Wait explicitly for the tag filter to show 2 articles
      await userPage.waitForFunction(() => {
        return document.querySelectorAll('article').length === 2;
      }, { timeout: 10000 });
      
      // Now add date filter
      await userPage.getByLabel("Filter by Date Created:").pressSequentially("01012022");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      
      // Wait explicitly for combined filters to show exactly 1 article
      await userPage.waitForFunction(() => {
        return document.querySelectorAll('article').length === 1;
      }, { timeout: 10000 });
      
      // Now verify the results
      await expect(await userPage.locator("article").count()).toBe(1);
      await expect(
        userPage.getByText("No front end framework is the best")
      ).toBeVisible();
    },
  );

  test(
    "Sort items",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > Users can sort posts by name or creation date, both ascending and descending

      // title-asc
      await userPage.getByLabel("Sort By:").selectOption("title-asc");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      await userPage.waitForTimeout(1500);
      let articles = await userPage.locator("article").all();

      expect(await articles[0].innerText()).toContain(
        "Better front ends with Fatboy Slim",
      );
      expect(await articles[1].innerText()).toContain(
        "Boost your conversion rate",
      );
      expect(await articles[2].innerText()).toContain("DevOps Data");
      expect(await articles[3].innerText()).toContain("Mongo Data");

      // title-desc
      await userPage.getByLabel("Sort By:").selectOption("title-desc");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      await userPage.waitForTimeout(1500);
      articles = await userPage.locator("article").all();

      expect(await articles[3].innerText()).toContain("DevOps Data");
      expect(await articles[2].innerText()).toContain("Mongo Data");
      expect(await articles[1].innerText()).toContain(
        "No front end framework is the best",
      );
      expect(await articles[0].innerText()).toContain(
        "Visual Basic is the future",
      );

      // title-asc
      await userPage.getByLabel("Sort By:").selectOption("date-asc");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      await userPage.waitForTimeout(1500);
      articles = await userPage.locator("article").all();

      expect(await articles[1].innerText()).toContain("Mongo Data");
      expect(await articles[2].innerText()).toContain(
        "Visual Basic is the future",
      );
      expect(await articles[3].innerText()).toContain(
        "Better front ends with Fatboy Slim",
      );
      expect(await articles[0].innerText()).toContain("DevOps Data");

      // title-desc
      await userPage.getByLabel("Sort By:").selectOption("date-desc");
      await userPage.waitForSelector('[data-filter-status="complete"]');
      await userPage.waitForTimeout(1500);
      articles = await userPage.locator("article").all();

      expect(await articles[2].innerText()).toContain(
        "Better front ends with Fatboy Slim",
      );
      expect(await articles[1].innerText()).toContain(
        "Boost your conversion rate",
      );
      expect(await articles[0].innerText()).toContain(
        "No front end framework is the best",
      );
      expect(await articles[3].innerText()).toContain(
        "Visual Basic is the future",
      );
    },
  );

  test(
    "List items",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > The list post item displays the image, title of the post and metadata
      const article = await userPage.locator("article").first();
      await expect(
        article.getByText("No front end framework is the best"),
      ).toBeVisible();
      await expect(article.locator("img").first()).toBeVisible();

      // LIST SCREEN > The list post items display metadata such as category, tags, and "active" status
      await expect(article.getByText("#Front-End, #Dev Tools")).toBeVisible();
      await expect(article.getByText("Posted on Dec 16, 2024")).toBeVisible();
      await expect(article.getByText("React")).toBeVisible();
      await expect(article.getByText("Active")).toBeVisible();

      // LIST SCREEN > The active status is a button that, on click, just displays a message
      await expect(article.locator('button:has-text("Active")')).toBeVisible();
    },
  );

  test(
    "Move to detail screen",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > Clicking on the title takes the user to the MODIFY SCREEN, allowing the user to modify the current post
      await userPage.getByText("No front end framework is the best").click();
      await userPage.waitForTimeout(1500);
      await expect(userPage).toHaveURL(
        "/post/no-front-end-framework-is-the-best",
      );
    },
  );

  test(
    "Move to create post screen",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > There is a button to create new posts
      await expect(userPage.getByText("Create Post")).toBeVisible();

      // LIST SCREEN > Clicking on the "Create Post" button takes the user to the CREATE SCREEN
      await userPage.locator('a:has-text("Create Post")').click();
      await expect(userPage).toHaveURL("/post/create");
    },
  );

  test(
    "Can activate / deactivate posts",
    {
      tag: "@a3",
    },
    async ({ userPage }) => {
      await seed();
      await userPage.goto("/");

      //  BACKEND / ADMIN / LIST SCREEN > Logged in user can activate / deactivate a post clicking on the activate button, automatically saving changes

      let article = await userPage.locator("article").first();
      await expect(article.locator('button:has-text("Active")')).toBeVisible();
      await expect(
        article.locator('button:has-text("Inactive")'),
      ).not.toBeVisible();

      await article.locator('button:has-text("Active")').click();

      article = await userPage.locator("article").first();
      await expect(
        article.getByText("Active", { exact: true }),
      ).not.toBeVisible();
      await expect(
        article.getByText("Inactive", { exact: true }),
      ).toBeVisible();

      // reload page and check

      await userPage.reload();

      article = await userPage.locator("article").first();
      await expect(
        article.getByText("Active", { exact: true }),
      ).not.toBeVisible();
      await expect(
        article.getByText("Inactive", { exact: true }),
      ).toBeVisible();
    },
  );
});
