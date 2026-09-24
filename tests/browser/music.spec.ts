import { expect, test } from "@playwright/test";

test("voicing controls, theory help and slash link work on mobile", async ({
  page,
}) => {
  await page.goto("/music/cheat-sheet");
  await expect(
    page.locator('astro-island[component-export="default"][ssr]'),
  ).toHaveCount(0);
  const card = page.locator(".cs-chord").first();
  await expect(card.locator("h3")).toHaveText("G/D");
  await card.getByLabel("Bass note for G", { exact: true }).selectOption("11");
  await expect(card.locator("h3")).toHaveText("G/B");
  await card.getByRole("button", { name: "About major", exact: true }).click();
  await expect(card.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(card.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await card.getByRole("link", { name: "G/B", exact: true }).click();
  await expect(page.locator(".ca-explorer h2").first()).toContainText("G/B");
});
