import { expect, test } from "@playwright/test";

test("exploration scrolls through chapters and resets for a new key", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/music/chords");
  const home = page.getByRole("region", { name: "Your key", exact: true });
  await expect(home.locator(".cs-chord")).toHaveCount(7);
  const cards = home.locator(".cs-chord");
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  if (!first || !second) throw new Error("Expected visible chord cards");
  expect(Math.abs(first.y - second.y)).toBeLessThan(2);
  await page.screenshot({ path: "/tmp/chords-explore-first-screen.png" });
  await page
    .getByRole("button", { name: "Explore more ↓" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("region", { name: "Add sevenths", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Borrow a different mood", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Borrow a different mood", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".cs-explore")).toContainText("Try:");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/chords-explore-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("combobox", { name: "Key", exact: true })
    .selectOption("natural-minor:A");
  await expect(
    page.getByRole("region", { name: "Your key", exact: true }),
  ).toContainText("E7");
  await expect(
    page.getByRole("region", { name: "Borrow a different mood", exact: true }),
  ).toHaveCount(0);
});

test("music links to Chords and the old sheet address redirects", async ({
  page,
}) => {
  await page.goto("/music");
  await page.getByRole("link", { name: /Chords by key/ }).click();
  await expect(page).toHaveURL(/\/music\/chords\/?$/);
  await expect(page).toHaveTitle("Chords — dandelion.art");
  await page.goto("/music/cheat-sheet");
  await expect(page).toHaveURL(/\/music\/chords\/?$/);
  await expect(page.locator(".chord-sheet")).toBeVisible();
  await page.getByRole("link", { name: "Chord atlas ↗" }).click();
  await expect(page).toHaveURL(/\/music\/atlas\/?$/);
  await expect(page).toHaveTitle("Chord atlas — dandelion.art");
});

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
  await serverPage.goto("/music/chords?view=reference");
  await expect(serverPage.locator(".chord-sheet")).toBeHidden();
  await expect(serverPage.locator(".chord-sheet")).toHaveAttribute("inert", "");
  await noScript.close();
  await page.goto("/music/chords?view=reference");
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
  await expect(
    page.locator('.cs-title select[aria-label="Instrument"]'),
  ).toHaveValue("baritone-dgbe");
});

test("new visitors get guitar and heading selection persists", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/music/chords?view=reference");
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  await expect(
    page.locator('.cs-title select[aria-label="Instrument"]'),
  ).toHaveValue("guitar-eadgbe");
  await page
    .locator('.cs-title select[aria-label="Instrument"]')
    .selectOption("baritone-dgbe");
  await page.reload();
  await expect(
    page.locator('.cs-title select[aria-label="Instrument"]'),
  ).toHaveValue("baritone-dgbe");
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
  await page.goto("/music/chords?view=reference");
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  const filters = page.getByRole("group", { name: "Chord families" });
  await expect(filters).not.toBeVisible();
  await page.getByRole("button", { name: "Chords settings" }).click();
  await filters.getByRole("button", { name: "sus2", exact: true }).click();
  await expect(
    page.locator(".cs-chord h3").filter({ hasText: "Gsus2" }).first(),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Chords settings" }).click();
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
  await page.goto("/music/chords?view=reference");
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
  await page.goto("/music/chords?view=reference");
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
    if (width > 640)
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

test("guitar cards use two phone columns without clipping controls", async ({
  browser,
}) => {
  const context = await browser.newContext({ isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/music/chords?view=reference&theme=dark");
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  await expect(
    page.locator('.cs-title select[aria-label="Instrument"]'),
  ).toHaveValue("guitar-eadgbe");
  for (const width of [375, 390, 430]) {
    await page.setViewportSize({ width, height: 760 });
    const cards = page.locator(".cs-chord");
    const grid = await page.locator(".cs-chords").first().boundingBox();
    for (const index of [0, 1]) {
      const card = cards.nth(index);
      const bounds = await card.boundingBox();
      expect(
        Math.abs((bounds?.width ?? 0) * 2 + 6 - (grid?.width ?? 0)),
      ).toBeLessThan(1);
      for (const button of await card.locator("button").all()) {
        const box = await button.boundingBox();
        expect(box?.x).toBeGreaterThanOrEqual(bounds?.x ?? 0);
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
          (bounds?.x ?? 0) + (bounds?.width ?? 0),
        );
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/guitar-mobile-${width}.png`,
      fullPage: false,
    });
  }
  await page
    .locator(".cs-chord")
    .first()
    .getByRole("button", { name: "B bass for G", exact: true })
    .tap();
  await expect(
    page
      .locator(".cs-chord")
      .first()
      .getByRole("button", { name: "B bass for G", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await context.close();
});

test("heading key selector persists key and offers all chords", async ({
  page,
}) => {
  await page.goto("/music/chords?view=reference");
  await expect(page.locator(".chord-sheet")).toHaveAttribute(
    "data-preferences-ready",
    "true",
  );
  const key = page.getByRole("combobox", { name: "Key", exact: true });
  await key.selectOption("major:C");
  await expect(page.locator(".cs-chord h3").first()).toHaveText("C");
  await page.reload();
  await expect(key).toHaveValue("major:C");
  await key.selectOption("all");
  await expect(
    page.getByRole("navigation", { name: "Jump to chord root" }),
  ).toBeVisible();
  await key.selectOption("natural-minor:C#");
  await expect(page.locator(".cs-section-heading").first()).toContainText(
    "C♯ minor",
  );
});
