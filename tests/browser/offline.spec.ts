import { createServer } from "node:http";
import { expect, test } from "@playwright/test";

test("offline updates wait for approval and failed downloads preserve the working app", async ({
  page,
  browserName,
}) => {
  let stopped = false;
  let revision = "initial-failure";
  let broken = true;
  const server = createServer(async (request, response) => {
    try {
      if (request.url === "/music/unavailable.js") {
        response.writeHead(503).end();
        return;
      }
      const upstream = await fetch(`http://127.0.0.1:4342${request.url}`);
      response.setHeader(
        "Content-Type",
        upstream.headers.get("content-type") || "text/plain",
      );
      response.setHeader("Cache-Control", "no-store");
      if (request.url === "/music/sw.js") {
        let source = (await upstream.text()).replace(
          /const VERSION = "[^"]+"/,
          `const VERSION = "${revision}"`,
        );
        if (broken)
          source = source.replace(
            "const FILES = [",
            'const FILES = ["/music/unavailable.js",',
          );
        response.end(source);
      } else response.end(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      response.writeHead(500).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing test server address");
  try {
    await page.goto(`http://127.0.0.1:${address.port}/music/chords/`);
    await expect(page.locator(".music-offline output")).toContainText(
      /Offline download (failed|unavailable)/,
    );
    expect(await page.evaluate(() => caches.keys())).not.toContain(
      "dandelion-music-initial-failure",
    );
    revision = "first";
    broken = false;
    await page.reload();
    await expect(page.locator(".music-offline output")).toHaveText(
      "Available offline",
    );
    await page.evaluate(() => {
      Object.assign(window, { updateMarker: true });
    });
    revision = "second";
    await page.evaluate(async () =>
      (await navigator.serviceWorker.ready).update(),
    );
    const update = page.getByRole("button", {
      name: "Update available · reload",
    });
    await expect(update).toBeVisible();
    expect(await page.evaluate(() => Reflect.get(window, "updateMarker"))).toBe(
      true,
    );
    await update.click();
    await expect(page.locator(".music-offline output")).toHaveText(
      "Available offline",
    );
    await expect
      .poll(() => page.evaluate(() => Reflect.get(window, "updateMarker")))
      .toBeUndefined();
    revision = "broken";
    broken = true;
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      await new Promise<void>((resolve) => {
        reg.addEventListener(
          "updatefound",
          () => {
            const worker = reg.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "redundant") resolve();
            });
          },
          { once: true },
        );
        void reg.update();
      });
    });
    await expect(update).not.toBeVisible();
    const names = await page.evaluate(() => caches.keys());
    expect(names).toContain("dandelion-music-second");
    expect(names).not.toContain("dandelion-music-broken");
    // Playwright 1.63 WebKit offline emulation rejects even literal worker
    // responses (#42775). Stop the origin instead to test real cache-only use.
    if (browserName === "webkit") {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      stopped = true;
    } else await page.context().setOffline(true);
    await page.reload();
    await expect(page.locator(".vw-diagram").first()).toBeVisible();
    const context = page.context();
    await page.close();
    const cold = await context.newPage();
    await cold.goto(
      `http://127.0.0.1:${address.port}/music/chord?chord=C&instrument=guitar-eadgbe&frets=x,3,2,0,1,0`,
    );
    const selected = cold.getByRole("region", { name: "Selected voicing" });
    await expect(selected).toBeVisible();
    await selected.locator(".vw-piano").click();
    await expect(cold.getByRole("dialog")).toBeVisible();
    const playback = cold.getByRole("dialog").getByRole("button", {
      name: "Hear this voicing as a synthesized chord",
    });
    await playback.click();
    await expect(playback).toBeDisabled();
    await cold.getByRole("button", { name: "Close piano voicing" }).click();
    await selected.locator(".vw-fretboard").click();
    await expect(
      cold.getByRole("region", { name: "Fretboard", exact: true }),
    ).toBeVisible();
  } finally {
    if (!stopped) {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
});

test("music cold-starts offline and navigates without document reloads", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "Offline-emulation bug #42775; origin-stopped coverage above exercises WebKit.",
  );
  await page.goto("/music/chords/");
  await expect(page.locator(".music-offline output")).toHaveText(
    "Available offline",
  );
  await page.evaluate(() => navigator.serviceWorker.ready);
  const cached = await page.evaluate(async () => {
    const names = await caches.keys();
    const cache = await caches.open(
      names.find((name) => name.startsWith("dandelion-music-")) || "missing",
    );
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  expect(cached).toContain("/music/fretboard/");
  expect(cached.some((path) => path.startsWith("/fonts/"))).toBe(true);
  expect(cached.some((path) => path.startsWith("/art/"))).toBe(false);
  await context.setOffline(true);
  await page.close();
  const offline = await context.newPage();
  const errors: string[] = [];
  offline.on("pageerror", (error) => errors.push(error.message));
  await offline.goto("/music/chords/");
  await expect(offline.locator(".vw-diagram").first()).toBeVisible();
  await expect(offline.locator(".music-offline output")).toHaveText(
    "Offline · reference ready",
  );
  await offline.evaluate(() => {
    Object.assign(window, { offlineNavigationMarker: 42 });
  });
  await offline.locator(".vw-diagram").first().click();
  await expect(
    offline.getByRole("region", { name: "Voicing library" }),
  ).toBeVisible();
  expect(
    await offline.evaluate(() =>
      Reflect.get(window, "offlineNavigationMarker"),
    ),
  ).toBe(42);
  const selected = offline.getByRole("region", { name: "Selected voicing" });
  await selected.locator(".vw-piano").click();
  await expect(offline.getByRole("dialog")).toBeVisible();
  await offline.getByRole("button", { name: "Close piano voicing" }).click();
  await selected.locator(".vw-fretboard").click();
  await expect(
    offline.getByRole("button", { name: "Mute all strings", exact: true }),
  ).toBeVisible();
  expect(
    await offline.evaluate(() =>
      Reflect.get(window, "offlineNavigationMarker"),
    ),
  ).toBe(42);
  await offline.getByRole("checkbox", { name: "Toggle theme" }).check();
  await expect(offline.locator("html")).toHaveAttribute("data-theme", "light");
  await offline.goBack();
  await expect(
    offline.getByRole("region", { name: "Voicing library" }),
  ).toBeVisible();
  await offline.goto(
    "/music/chord?chord=F%23m7&instrument=baritone-dgbe&frets=4,2,2,2",
  );
  await expect(
    offline.getByRole("region", { name: "Selected voicing" }),
  ).toBeVisible();
  await offline.reload();
  await expect(offline.locator(".vw-piano").first()).toBeVisible();
  expect(errors).toEqual([]);
});
