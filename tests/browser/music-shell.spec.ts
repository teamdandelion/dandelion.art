import { expect, test } from "@playwright/test";

test("song index remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4342/music/songs/");
  await expect(page.locator(".song-index-card").first()).toBeVisible();
  await context.close();
});

test("music navigation stays in-app, settings are compact and theme survives navigation", async ({
  page,
}) => {
  await page.goto("/music/chords/");
  await page.evaluate(() => Object.assign(window, { shellMarker: 123 }));
  const nav = page.getByRole("navigation", { name: "Music navigation" });
  await expect(nav.getByRole("link")).toHaveCount(3);
  await expect(page.locator("[data-site-header]")).toHaveCount(0);
  await expect(page.locator(".music-offline output")).toHaveText(
    "Available offline",
  );
  await expect(page.locator(".music-offline output")).not.toBeVisible();
  for (const [name, path] of [
    ["Songs", "/music/songs/"],
    ["Fretboard", "/music/fretboard/"],
    ["Chords", "/music/chords/"],
  ]) {
    await nav.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(
      (url) => url.pathname.replace(/\/$/, "") === path.replace(/\/$/, ""),
    );
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await page.evaluate(() => Reflect.get(window, "shellMarker"))).toBe(
      123,
    );
  }
  const settings = page.getByRole("button", { name: /^Music settings:/ });
  await settings.click();
  const dialog = page.getByRole("dialog", {
    name: "Music settings",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".music-offline output")).toBeVisible();
  await dialog.screenshot({ path: "/tmp/music-settings.png" });
  await dialog.getByRole("checkbox", { name: "Toggle theme" }).uncheck();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.keyboard.press("Escape");
  await expect(settings).toBeFocused();
  await nav.getByRole("link", { name: "Songs", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("link", { name: /Let It Be/ }).click();
  await expect(page.locator(".song-page h1")).toHaveText("Let It Be");
  await expect(
    nav.getByRole("link", { name: "Songs", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `/tmp/music-shell-${width}.png` });
  }
  await settings.click();
  await dialog.getByRole("link", { name: /Visit dandelion.art/ }).click();
  await expect(page.locator("[data-site-header]")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Art", exact: true }),
  ).toBeVisible();
});

test("songs float to the top after opening, persist on reload and tolerate corrupt history", async ({
  page,
}) => {
  await page.goto("/music/songs/");
  const titles = page.locator(".song-index-card h2");
  await expect(titles.first()).toHaveText("Fly Me to the Moon");
  await expect(page.locator(".music-offline output")).toHaveText(
    "Available offline",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("music.song-recents.v1")),
  ).toBeNull();
  for (const title of ["Stitches", "Let It Be"]) {
    await page.getByRole("link", { name: new RegExp(title) }).click();
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("music.song-recents.v1")),
      )
      .not.toBeNull();
    await page.getByRole("link", { name: "← Songs", exact: true }).click();
    await expect(titles.first()).toHaveText(title);
  }
  await expect(titles.nth(1)).toHaveText("Stitches");
  await page.reload();
  await expect(titles.first()).toHaveText("Let It Be");
  await page.evaluate(() =>
    localStorage.setItem("music.song-recents.v1", "broken"),
  );
  await page.reload();
  await expect(titles.first()).toHaveText("Fly Me to the Moon");
});

test("songs and navigation work with local storage blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await page.goto("/music/songs/");
  await expect(page.locator(".song-index-card")).toHaveCount(6);
  await page.getByRole("link", { name: /Stitches/ }).click();
  await expect(page.locator(".song-score")).toBeVisible();
  await page.getByRole("link", { name: "← Songs", exact: true }).click();
  await expect(page.locator(".song-index-card h2").first()).toHaveText(
    "Stitches",
  );
});
