import { expect, test } from "@playwright/test";

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
