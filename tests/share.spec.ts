import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/clarity.ms/**", (route) => route.abort());
  await page.route("**/img.aisaasgo.org/**", (route) => route.abort());
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

test("share confirms copy inside the modal and link opens same case", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?lang=en&prompt=544");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Link copied", exact: true }),
  ).toBeVisible();
  await expect(dialog.getByRole("status")).toContainText("Share link copied");
  const url = await dialog
    .getByLabel("Share link", { exact: true })
    .inputValue();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
  const target = new URL(url);
  await page.goto(target.pathname + target.search + target.hash);
  await expect(page.locator("#dialog-title")).toHaveText("幼儿词汇拆解学习卡");
  await expect(page.locator(".share-panel")).toHaveCount(0);
});

test("denied clipboard offers selectable link and visible copy error inside modal", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () =>
          Promise.reject(new DOMException("Denied", "NotAllowedError")),
      },
    });
  });
  await page.goto("/?prompt=544");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "分享", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("浏览器未允许复制");
  const link = dialog.getByLabel("分享链接", { exact: true });
  await expect(link).toHaveValue(
    "https://image.aisaasgo.org/?prompt=544&lang=zh#library",
  );
  await link.click();
  expect(
    await link.evaluate(
      (input: HTMLInputElement) => input.selectionEnd! - input.selectionStart!,
    ),
  ).toBe((await link.inputValue()).length);
  await dialog.getByRole("button", { name: "复制提示词", exact: true }).click();
  await expect(dialog.locator(".dialog-feedback")).toContainText("复制失败");
});
