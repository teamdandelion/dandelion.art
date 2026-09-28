import { expect, test } from "@playwright/test";

test("songs omit filler copy while retaining useful chart notes", async ({
  page,
}) => {
  await page.goto("/music/songs/");
  await expect(page.getByText("A few songs to spend time with.")).toHaveCount(
    0,
  );
  await expect(page.getByText("Practice library")).toHaveCount(0);
  await page.getByRole("link", { name: /Hallelujah/ }).click();
  await expect(page.getByText(/Arrangement from/)).toHaveCount(0);
  await expect(page.getByText(/no capo for the original studio/)).toBeVisible();
  await expect(page.locator(".song-eyebrow")).toHaveText("Jeff Buckley");
});

test("long song lines wrap on phones with no internal scrollbars", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const song of ["hallelujah", "ocean-eyes"]) {
    await page.goto(`/music/songs/${song}/`);
    for (const width of [320, 390, 430, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      await expect
        .poll(() =>
          page
            .locator(".song-line")
            .evaluateAll(
              (rows) =>
                rows.length > 0 &&
                rows.every((row) => row.scrollWidth <= row.clientWidth + 1),
            ),
        )
        .toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.goto("/music/songs/hallelujah/");
  await page.setViewportSize({ width: 390, height: 844 });
  const chorus = page.locator(".song-score section").nth(2);
  await expect
    .poll(() =>
      chorus
        .locator(".song-word")
        .evaluateAll(
          (words) =>
            new Set(
              words.map((word) => Math.round(word.getBoundingClientRect().top)),
            ).size,
        ),
    )
    .toBeGreaterThan(1);
  await chorus.scrollIntoViewIfNeeded();
  await chorus.screenshot({ path: "/tmp/hallelujah-wrapped-chorus.png" });
  await chorus
    .getByRole("button", { name: "Show Am voicing", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("dialog", { name: "Am voicing", exact: true }),
  ).toBeVisible();
});

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

test("all instruments use the original chart and obsolete baritone overrides are discarded", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "music.song-shapes.v1:ocean-eyes:baritone-dgbe",
      JSON.stringify({
        "occurrence:1:4:0": "10,12,12,12",
        Cmaj7: "10,12,12,12",
      }),
    ),
  );
  await page.goto("/music/songs/ocean-eyes/");
  const instrument = page.getByRole("combobox", { name: "Song instrument" });
  for (const value of await instrument
    .locator("option")
    .evaluateAll((options) =>
      options
        .map((option) => option.getAttribute("value") ?? "")
        .filter(Boolean),
    )) {
    await instrument.selectOption(value);
    const trigger = page
      .getByRole("button", { name: "Show G/B voicing", exact: true })
      .first();
    await expect(trigger).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Show Cmaj7 voicing", exact: true }),
    ).toHaveCount(0);
    await trigger.click();
    await expect(
      page.getByRole("dialog", { name: "G/B voicing", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  }
  expect(
    await page.evaluate(() =>
      JSON.parse(
        localStorage.getItem("music.song-shapes.v1:ocean-eyes:baritone-dgbe") ??
          "{}",
      ),
    ),
  ).toEqual({});
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
  await expect(
    song.locator(".song-lyric").filter({ hasText: "been" }).first(),
  ).toBeVisible();
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
