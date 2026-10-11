import { expect, test } from "@playwright/test";

test("tap stays open; a mouse hold previews the selected shape only until release", async ({
  page,
}) => {
  await page.goto("/music/songs/let-it-be/");
  const button = page
    .getByRole("button", { name: "Show C voicing", exact: true })
    .first();
  await button.click();
  const modal = page.getByRole("dialog", { name: "C voicing", exact: true });
  await expect(modal).toBeVisible();
  await modal
    .getByRole("button", { name: "Next C voicing", exact: true })
    .click();
  const shape = await modal.locator("svg.ca-uke-diagram title").textContent();
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  await button.hover();
  await page.mouse.down();
  const preview = page.getByRole("status", {
    name: "C voicing preview",
    exact: true,
  });
  await expect(preview).toBeVisible();
  await expect(preview.locator("svg title")).toHaveText(shape ?? "");
  await expect(modal).not.toBeVisible();
  await expect(preview.getByRole("button")).toHaveCount(0);
  await page.screenshot({ path: "/tmp/song-hold-preview.png" });
  await page.mouse.up();
  await expect(preview).toHaveCount(0);
  await expect(modal).not.toBeVisible();
  await button.click();
  await expect(modal).toBeVisible();
  await page.keyboard.press("Escape");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(modal).toBeVisible();
});

test("movement, cancellation, Escape and focus loss never leave a preview stuck", async ({
  page,
}) => {
  await page.goto("/music/songs/let-it-be/");
  const button = page
    .getByRole("button", { name: "Show C voicing", exact: true })
    .first();
  const down = {
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    button: 0,
    clientX: 100,
    clientY: 200,
  };
  const preview = page.getByRole("status", {
    name: "C voicing preview",
    exact: true,
  });
  for (const event of ["pointercancel", "blur", "scroll", "keydown"]) {
    await button.dispatchEvent("pointerdown", down);
    await expect(preview).toBeVisible();
    await page.evaluate((event) => {
      if (event === "keydown")
        window.dispatchEvent(new KeyboardEvent(event, { key: "Escape" }));
      else window.dispatchEvent(new Event(event));
    }, event);
    await expect(preview).toHaveCount(0);
    await button.dispatchEvent("click", { detail: 1 });
    await expect(
      page.getByRole("dialog", { name: "C voicing", exact: true }),
    ).not.toBeVisible();
  }
  await button.dispatchEvent("pointerdown", down);
  await button.dispatchEvent("pointermove", { ...down, clientY: 240 });
  await page.waitForTimeout(550); // Longer than the hold threshold: cancelled timers must stay cancelled.
  await expect(preview).toHaveCount(0);
  await button.dispatchEvent("pointerup", down);
  await button.dispatchEvent("click", { detail: 1 });
  await expect(
    page.getByRole("dialog", { name: "C voicing", exact: true }),
  ).not.toBeVisible();
});

test("real touch hold dismisses on release without opening a modal or blocking a swipe", async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Real touch sequences use Chromium CDP; pointer lifecycle also runs in WebKit.",
  );
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4342/music/songs/let-it-be/");
  const button = page
    .getByRole("button", { name: "Show C voicing", exact: true })
    .first();
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  if (!box) throw new Error("Missing chord");
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await expect(
    page.getByRole("status", { name: "C voicing preview", exact: true }),
  ).toBeVisible();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator(".song-hold-preview")).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "C voicing", exact: true }),
  ).not.toBeVisible();
  const before = await page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  for (const dy of [20, 40, 80, 120])
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: point.x, y: point.y - dy }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  await expect(page.locator(".song-hold-preview")).toHaveCount(0);
  await context.close();
});
