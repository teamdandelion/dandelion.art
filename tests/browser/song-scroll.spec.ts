import { expect, test } from "@playwright/test";

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
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect(
    page.getByRole("button", { name: "Start autoscroll" }),
  ).toBeVisible();
});

test("manual corrections and smooth skips preserve autoscroll", async ({
  page,
}) => {
  await page.goto("/music/songs/hallelujah/");
  await page.getByRole("button", { name: "Start autoscroll" }).click();
  await page.evaluate(() => scrollTo(0, 900));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(905);
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(400);
  const corrected = await page.evaluate(() => scrollY);
  expect(corrected).toBeLessThan(800);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(corrected + 5);
  const before = await page.evaluate(() => scrollY);
  await page.getByRole("button", { name: "Forward half a page" }).click();
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(before + 410);
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => scrollY);
  expect(after - before).toBeLessThan(450);
  await page.getByRole("button", { name: "Back half a page" }).click();
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeLessThan(after - 400);
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
