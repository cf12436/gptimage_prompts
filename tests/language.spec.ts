import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("**/clarity.ms/**", (route) => route.abort());
  await page.route("**/img.aisaasgo.org/**", (route) => route.abort());
});

test("language switch preserves search, filters and bookmarks and survives navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".card-bookmark").first().click();
  await page
    .getByRole("textbox", { name: "搜索提示词", exact: true })
    .fill("3D");
  const count = await page.locator(".prompt-card").count();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("button", { name: "EN", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".library-search input")).toHaveValue("3D");
  await expect(page.locator(".prompt-card")).toHaveCount(count);
  await expect(page.locator(".saved-toggle")).toContainText("1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.locator('a[href^="/privacy/"]').click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Privacy notice",
  );
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("隐私说明");
  await page.getByRole("link", { name: "← 返回提示词库" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator(".saved-toggle")).toContainText("1");
});

test("English deep link preserves source prompt and share language", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?lang=en&prompt=544#library");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toHaveText("幼儿词汇拆解学习卡");
  const original = await page.locator(".prompt-text").innerText();
  await page.locator(".dialog-actions .white-button").click();
  await expect
    .poll(async () =>
      (await page.evaluate(() => navigator.clipboard.readText())).replace(
        /\r\n/g,
        "\n",
      ),
    )
    .toBe(original);
  await page.locator(".dialog-actions button").last().click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("lang=en");
  await page.locator(".dialog-close").click();
  await expect(page).toHaveURL(/lang=en/);
  expect(new URL(page.url()).searchParams.has("prompt")).toBe(false);
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.goto("/?lang=en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("English navigation fits narrow mobile screens", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/?lang=en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("button", { name: "EN", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.locator(".mobile-menu-button").click();
  await expect(page.locator(".mobile-nav")).toBeVisible();
  await expect(page.locator(".mobile-nav")).toContainText("Explore prompts");
});

test("language switching works when storage is blocked and on 404", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Storage blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/not-a-real-page/?lang=en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This inspiration hasn't been collected yet.",
  );
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "这个灵感，还未被收录。",
  );
});
