import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("**/clarity.ms/**", (route) => route.abort());
  await page.route("**/img.aisaasgo.org/**", (route) => route.abort());
  await page.goto("/");
});

test("library filters, empty state, and load more", async ({ page }) => {
  await expect(page.locator(".prompt-card")).toHaveCount(24);
  await page.getByRole("button", { name: /探索更多灵感/ }).click();
  await expect(page.locator(".prompt-card")).toHaveCount(48);
  await page
    .getByRole("textbox", { name: "搜索提示词", exact: true })
    .fill("zzzz-no-matching-prompt");
  await expect(page.getByText("换一个关键词，发现新的灵感")).toBeVisible();
  await page
    .getByRole("button", { name: "浏览全部提示词", exact: true })
    .click();
  await expect(page.locator(".prompt-card")).toHaveCount(24);
  await page.getByRole("button", { name: /^产品电商/ }).click();
  await expect(
    page.locator(".prompt-card").first().locator(".card-meta"),
  ).toContainText("产品电商");
  await page.getByLabel("提示词排序").selectOption("oldest");
  await expect(page.locator(".prompt-card").first()).toBeVisible();
});

test("details, accessible close, clipboard, and bookmark persistence", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const firstTitle = await page.locator(".card-title").first().innerText();
  await page.locator(".card-open").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toHaveText(firstTitle.trim());
  const prompt = await page.locator(".prompt-text").innerText();
  await page.getByRole("button", { name: "复制提示词", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "已复制提示词", exact: true }),
  ).toBeVisible();
  expect(
    (await page.evaluate(() => navigator.clipboard.readText())).replace(
      /\r\n/g,
      "\n",
    ),
  ).toBe(prompt);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "收藏", exact: true })
    .click();
  await page.getByRole("button", { name: "关闭提示词详情" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /我的收藏/ }).click();
  await expect(page.locator(".prompt-card")).toHaveCount(1);
  await page.locator(".card-open").first().click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("direct prompt links, branding, head analytics and mobile overflow", async ({
  page,
}) => {
  await page.goto("/?prompt=544#library");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toHaveText("幼儿词汇拆解学习卡");
  await page.getByRole("button", { name: "关闭提示词详情" }).click();
  expect(await page.locator("head #microsoft-clarity").textContent()).toContain(
    "ygdxbc4avf",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://image.aisaasgo.org/",
  );
  await expect(
    page.getByRole("link", { name: "AISaasGo API" }),
  ).toHaveAttribute("href", "https://aisaasgo.org");
  await expect(
    page.getByRole("link", { name: /加入免费微信交流群/ }),
  ).toHaveAttribute("href", /qcn8akg1pg2d.feishu.cn/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  const images = page.locator(".card-open img");
  await images.first().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      images.first().evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.screenshot({
    path: `test-results/library-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test("privacy and real 404 response", async ({ page, request }) => {
  await page.getByRole("link", { name: "隐私说明", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("隐私说明");
  expect((await request.get("/missing-page-123/")).status()).toBe(404);
});
