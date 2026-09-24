import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("music.preferences.v1"))
      localStorage.setItem(
        "music.preferences.v1",
        JSON.stringify({
          instrumentId: "baritone-dgbe",
          tonic: "G",
          mode: "major",
        }),
      );
  });
});

test("server default stays hidden until saved preferences are ready", async ({
  browser,
  page,
}) => {
  const noScript = await browser.newContext({ javaScriptEnabled: false });
  const serverPage = await noScript.newPage();
  await serverPage.goto("/music/cheat-sheet");
  await expect(serverPage.locator(".chord-sheet")).toBeHidden();
  await expect(serverPage.locator(".chord-sheet")).toHaveAttribute("inert", "");
  await noScript.close();
  await page.goto("/music/cheat-sheet");
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-instrument",
    "baritone-dgbe",
  );
  await expect(page.locator(".chord-sheet")).toBeVisible();
  await page.reload();
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(page.locator(".cs-title select")).toHaveValue("baritone-dgbe");
});

test("new visitors get guitar and heading selection persists", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/music/cheat-sheet");
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  await expect(page.locator(".cs-title select")).toHaveValue("guitar-eadgbe");
  await page.locator(".cs-title select").selectOption("baritone-dgbe");
  await page.reload();
  await expect(page.locator(".cs-title select")).toHaveValue("baritone-dgbe");
  await context.close();
});

test("fretboard chord link preserves the exact open and muted positions", async ({
  page,
}) => {
  await page.goto("/music/fretboard");
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "String 2, mute", exact: true })
    .click();
  const match = page.locator(".fb-matches a").first();
  await expect(match).toHaveAttribute("href", /frets=0%2C0%2Cx%2C0/);
  await match.click();
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  await expect(
    page.locator('[title="Fret pattern: 0, 0, muted, 0"]'),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.locator('[title="Fret pattern: 0, 0, muted, 0"]'),
  ).toBeVisible();
});

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
  await page
    .getByRole("button", { name: "Mute all strings", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Chord matches" }),
  ).toContainText("All strings muted");
  await page
    .getByRole("button", { name: "Open all strings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "String 2, mute", exact: true })
    .click();
  await expect(page.locator(".fb-matches")).toContainText("fifth omitted");
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
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  const filters = page.getByRole("group", { name: "Chord families" });
  await expect(filters).not.toBeVisible();
  await page.getByRole("button", { name: "Cheat sheet settings" }).click();
  await filters.getByRole("button", { name: "sus2", exact: true }).click();
  await expect(
    page.locator(".cs-chord h3").filter({ hasText: "Gsus2" }).first(),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Cheat sheet settings" }).click();
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

test("heading bass controls and slash link work on mobile", async ({
  page,
}) => {
  await page.goto("/music/cheat-sheet");
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(
    page.locator('astro-island[component-export="default"][ssr]'),
  ).toHaveCount(0);
  const card = page.locator(".cs-chord").first();
  await expect(card.locator("h3")).toHaveText("G");
  await card.getByRole("button", { name: "B bass for G", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "B bass for G", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await card.getByRole("button", { name: "B bass for G", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "B bass for G", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await card.getByRole("button", { name: "B bass for G", exact: true }).click();
  await expect(card.locator(".cs-card-heading .cs-bass-notes")).toBeVisible();
  await expect(
    card.getByRole("button", { name: "About major", exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await card.getByRole("link", { name: "G", exact: true }).click();
  await expect(page.locator(".ca-explorer h2").first()).toContainText("G/B");
});

test("compact sheet layout at phone and tablet widths", async ({ page }) => {
  await page.goto("/music/cheat-sheet");
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  for (const width of [390, 661]) {
    await page.setViewportSize({ width, height: 850 });
    await expect(page.locator(".cs-family-filters")).not.toBeVisible();
    const card = page.locator(".cs-chord").first();
    await expect(card).toBeVisible();
    expect((await card.boundingBox())?.width).toBeLessThanOrEqual(300);
    await expect
      .poll(async () => (await card.boundingBox())?.y ?? Infinity)
      .toBeLessThan(400);
    await expect(card.locator("svg circle[r='2.5']")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `/tmp/chord-sheet-review-${width}.png` });
  }
});
