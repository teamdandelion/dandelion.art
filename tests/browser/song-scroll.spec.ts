import { expect, test } from "@playwright/test";

test("touch nudges survive delayed browser scroll reports without jitter", async ({
  browser,
}) => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  await page.goto("http://127.0.0.1:4342/music/songs/hallelujah/");
  await expect(
    page.getByRole("button", { name: "Start autoscroll" }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, 800);
    const original = window.scrollTo.bind(window);
    // Model compositor lag: the visible offset trails the commanded position.
    window.scrollTo = ((options: ScrollToOptions) => {
      setTimeout(() => original(options), 80);
    }) as typeof window.scrollTo;
  });
  const down = page.getByRole("button", { name: "Forward half a page" });
  await down.tap();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1222);
  await page.getByRole("button", { name: "Back half a page" }).tap();
  await expect
    .poll(() => page.evaluate(() => Math.abs(scrollY - 800)))
    .toBeLessThanOrEqual(1);
  await page.close();
});

test("controls have large ordered targets and repeated pulses retain every half-page", async ({
  page,
}) => {
  await page.goto("/music/songs/hallelujah/");
  const play = page.getByRole("button", { name: "Start autoscroll" });
  const minus = page.getByRole("button", { name: "Slower autoscroll" });
  const down = page.getByRole("button", { name: "Forward half a page" });
  const p = await play.boundingBox();
  const m = await minus.boundingBox();
  const d = await down.boundingBox();
  if (!p || !m || !d) throw new Error("Missing scroll controls");
  expect(p.width).toBeGreaterThan(m.width);
  expect(p.height).toBeGreaterThan(m.height);
  expect(m.width).toBeGreaterThanOrEqual(44);
  expect(m.height).toBeGreaterThanOrEqual(44);
  const panel = await page.locator(".song-practice-controls").boundingBox();
  expect(panel?.height).toBeLessThanOrEqual(144);
  expect(
    await page
      .locator(".song-practice-controls")
      .evaluate((el) => getComputedStyle(el).borderWidth),
  ).toBe("0px");
  expect(m.y).toBeGreaterThan(p.y + p.height);
  expect(d.y).toBeGreaterThan(m.y + m.height);
  await page.evaluate(() => scrollTo(0, 800));
  await page.screenshot({ path: "/tmp/song-flight-controls.png" });
  await down.click();
  await page.waitForTimeout(200);
  // Starts gently, not with the old maximum-velocity jump.
  expect(await page.evaluate(() => scrollY)).toBeLessThan(880);
  await down.dispatchEvent("touchstart");
  await down.dispatchEvent("touchend");
  await down.click();
  // Browsers round scroll offsets to physical pixels between requests.
  await expect
    .poll(() => page.evaluate(() => Math.abs(scrollY - 1644)))
    .toBeLessThanOrEqual(1);
  await page.waitForTimeout(150);
  expect(
    await page.evaluate(() => Math.abs(scrollY - 1644)),
  ).toBeLessThanOrEqual(1);
  await play.click();
  await down.click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Pause autoscroll" }).click();
  const stopped = await page.evaluate(() => scrollY);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(stopped);
});

test("touch corrections keep running, then stop at the end of the page", async ({
  page,
}) => {
  await page.goto("/music/songs/hallelujah/");
  await page.getByRole("button", { name: "Start autoscroll" }).click();
  await page.evaluate(() => {
    window.dispatchEvent(new Event("touchstart"));
    scrollTo(0, 650);
  });
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => scrollY)).toBe(650);
  await page.evaluate(() => window.dispatchEvent(new Event("touchend")));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(655);
  await expect(
    page.getByRole("button", { name: "Pause autoscroll" }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.dispatchEvent(new Event("wheel"));
    scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect(
    page.getByRole("button", { name: "Start autoscroll" }),
  ).toBeVisible();
});

test("manual corrections and smooth skips preserve autoscroll", async ({
  page,
}) => {
  await page.goto("/music/songs/hallelujah/");
  await expect(
    page.getByRole("button", { name: "Start autoscroll" }),
  ).toBeVisible();
  await page.evaluate(() => scrollTo(0, 900));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(900);
  await page.getByRole("button", { name: "Start autoscroll" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(905);
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(400);
  const corrected = await page.evaluate(() => scrollY);
  expect(corrected).toBeLessThan(800);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(corrected + 5);
  const before = await page.evaluate(() => scrollY);
  const began = Date.now();
  await page.getByRole("button", { name: "Forward half a page" }).click();
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(before + 410);
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => scrollY);
  expect(
    Math.abs(after - before - 422 - (Date.now() - began) * 0.012),
  ).toBeLessThan(5);
  await page.getByRole("button", { name: "Back half a page" }).click();
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeLessThan(after - 380);
  await expect(
    page.getByRole("button", { name: "Pause autoscroll" }),
  ).toBeVisible();
  await page.waitForTimeout(400);
  const resumed = await page.evaluate(() => scrollY);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(resumed + 5);
  await page.getByRole("button", { name: "Pause autoscroll" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const paused = await page.evaluate(() => scrollY);
  await page.getByRole("button", { name: "Forward half a page" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(paused + 422);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(paused + 422);
  await expect(
    page.getByRole("button", { name: "Start autoscroll" }),
  ).toBeVisible();
});

test("landscape keeps lyrics and skip controls inside simulated notch insets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 852, height: 393 });
  await page.goto("/music/songs/hallelujah/");
  // Desktop engines expose zero safe-area insets. Substitute a phone's inset
  // into the actual stylesheets to check their layout at both notch edges.
  await page.evaluate(() => {
    for (const sheet of [...document.styleSheets]) {
      const css = [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
      if (!css.includes("safe-area-inset")) continue;
      const style = document.createElement("style");
      style.textContent = css.replace(
        /env\(safe-area-inset-(left|right)(?:,\s*0px)?\)/g,
        "59px",
      );
      document.head.append(style);
    }
  });
  const score = await page.locator(".song-score").boundingBox();
  expect(score?.x).toBeGreaterThanOrEqual(79);
  expect((score?.x ?? 0) + (score?.width ?? 0)).toBeLessThanOrEqual(773);
  const controls = await page
    .getByRole("group", { name: "Adjust song position" })
    .boundingBox();
  expect((controls?.x ?? 0) + (controls?.width ?? 0)).toBeLessThanOrEqual(781);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    852,
  );
  await page.screenshot({ path: "/tmp/song-landscape-safe.png" });
});
