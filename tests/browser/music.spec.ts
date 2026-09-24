import { expect, test } from "@playwright/test";

test("predictive fretboard advertises the chord that tapping produces", async ({
  page,
}) => {
  await page.goto("/music/fretboard");
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  const fret = page.getByRole("button", {
    name: "String 1, fret 3, G4",
    exact: true,
  });
  await expect(fret).toHaveClass(/fb-in-chord/);
  await expect(fret).toHaveAttribute("title", /G\/D/);
  await fret.click();
  await expect(fret).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".fb-matches")).toContainText("G");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("family filters persist and wrap on phone and desktop", async ({
  page,
}) => {
  await page.goto("/music/cheat-sheet");
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  const filters = page.getByRole("group", { name: "Chord families" });
  await filters.getByRole("button", { name: "sus2", exact: true }).click();
  await expect(
    page.locator(".cs-chord h3").filter({ hasText: "Gsus2" }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    filters.getByRole("button", { name: "sus2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

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
