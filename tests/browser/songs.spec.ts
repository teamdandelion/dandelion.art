import { expect, test } from "@playwright/test";

test("Hallelujah is linked, responsive, playable and available offline", async ({
  page,
  context,
}) => {
  await page.goto("/music/songs/");
  await page.getByRole("link", { name: /Hallelujah/ }).click();
  await expect(
    page.getByRole("heading", { name: "Hallelujah", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".song-score section")).toHaveCount(11);
  await expect(page.getByText(/no capo for the original studio/)).toBeVisible();
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.screenshot({
      path: `/tmp/song-hallelujah-${width}.png`,
      animations: "disabled",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("button", { name: "Show E7 voicing", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "E7 voicing", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").locator(".vw-fretboard"),
  ).toHaveAttribute("href", /frets=/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".music-offline output")).toHaveText(
    "Available offline",
  );
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Hallelujah", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start autoscroll" }).click();
  await expect(
    page.getByRole("button", { name: "Pause autoscroll" }),
  ).toBeVisible();
});

test("autoscroll has slower defaults and bounded discrete speed buttons", async ({
  page,
}) => {
  await page.goto("/music/songs/ocean-eyes/");
  const speed = page.getByLabel("Scroll speed level");
  const slower = page.getByRole("button", { name: "Slower autoscroll" });
  const faster = page.getByRole("button", { name: "Faster autoscroll" });
  await expect(speed).toHaveText("Speed 2");
  await expect(page.getByRole("slider")).toHaveCount(0);
  await slower.click();
  await expect(speed).toHaveText("Speed 1");
  await expect(slower).toBeDisabled();
  for (let level = 2; level <= 7; level++) {
    await faster.click();
    await expect(speed).toHaveText(`Speed ${level}`);
  }
  await expect(faster).toBeDisabled();
  await page.getByRole("button", { name: "Start autoscroll" }).click();
  await slower.click();
  await expect(
    page.getByRole("button", { name: "Pause autoscroll" }),
  ).toBeVisible();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("baritone turnaround taps load exact per-occurrence shapes without changing other instruments", async ({
  page,
}) => {
  await page.goto("/music/songs/ocean-eyes/");
  const instrument = page.getByRole("combobox", { name: "Song instrument" });
  await instrument.selectOption("baritone-dgbe");
  const intro = page.locator(".song-score section").first();
  for (const frets of ["0,0,0,3", "0,0,0,7", "2,0,1,0"]) {
    await intro.locator(`[data-voicing="${frets}"]`).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const href = await dialog.locator(".vw-fretboard").getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain(frets);
    await page.keyboard.press("Escape");
  }
  await page
    .getByRole("button", { name: "Show Cmaj7 voicing", exact: true })
    .first()
    .click();
  expect(
    decodeURIComponent(
      (await page
        .getByRole("dialog")
        .locator(".vw-fretboard")
        .getAttribute("href")) ?? "",
    ),
  ).toContain("10,12,12,12");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(instrument).toHaveValue("baritone-dgbe");
  await expect(intro.locator('[data-voicing="2,0,1,0"]')).toBeVisible();
  await instrument.selectOption("guitar-eadgbe");
  await expect(
    page.getByRole("button", { name: "Show G/B voicing", exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator("[data-voicing]")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Show Cmaj7 voicing", exact: true }),
  ).toHaveCount(0);
});

test("song chart has responsive lyrics, persistent voicings, piano and exact fretboard links", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/music/songs/");
  await page.getByRole("link", { name: /Ocean Eyes/ }).click();
  await expect(page.getByRole("heading", { name: "Ocean Eyes" })).toBeVisible();
  await expect(page.locator(".song-score section")).toHaveCount(7);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/song-ocean-eyes-${width}.png`,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const trigger = page
    .getByRole("button", { name: "Show G/B voicing", exact: true })
    .first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "G/B voicing", exact: true });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("button", { name: "Next G voicing", exact: true })
    .click();
  const href = await dialog.locator(".vw-fretboard").getAttribute("href");
  await dialog.locator(".vw-piano").click();
  await expect(page.getByRole("dialog", { name: "G · piano" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.reload();
  await trigger.click();
  await expect(dialog.locator(".vw-fretboard")).toHaveAttribute(
    "href",
    href ?? "",
  );
  await dialog.locator(".vw-fretboard").click();
  await expect(
    page.getByRole("region", { name: "Fretboard", exact: true }),
  ).toBeVisible();
});

test("songs cold-open offline and autoscroll pauses on interaction", async ({
  page,
  context,
}) => {
  await page.goto("/music/chords/");
  await expect(page.locator(".music-offline output")).toHaveText(
    "Available offline",
  );
  await context.setOffline(true);
  await page.close();
  const song = await context.newPage();
  await song.goto("/music/songs/ocean-eyes/");
  await expect(song.getByRole("heading", { name: "Ocean Eyes" })).toBeVisible();
  await expect(song.locator(".song-line p").first()).toBeVisible();
  await song.getByRole("button", { name: "Start autoscroll" }).click();
  const before = await song.evaluate(() => scrollY);
  await expect
    .poll(() => song.evaluate(() => scrollY))
    .toBeGreaterThan(before + 5);
  await song.mouse.wheel(0, 40);
  await expect(
    song.getByRole("button", { name: "Start autoscroll" }),
  ).toBeVisible();
  await song
    .getByRole("button", { name: "Show C voicing", exact: true })
    .first()
    .click();
  await expect(
    song.getByRole("dialog", { name: "C voicing", exact: true }),
  ).toBeVisible();
});
