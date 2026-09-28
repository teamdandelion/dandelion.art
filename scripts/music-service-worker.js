const VERSION = "BUILD_VERSION";
const FILES = "BUILD_FILES";
const PREFIX = "dandelion-music-";
const CACHE = PREFIX + VERSION;
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        await cache.addAll(FILES);
      } catch (error) {
        await caches.delete(CACHE);
        throw error;
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Other site caches and personal data are never touched.
      for (const name of await caches.keys()) {
        if (name.startsWith(PREFIX) && name !== CACHE)
          await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data === "APPLY_UPDATE") self.skipWaiting();
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  let key = url.pathname;
  // Query strings describe local chord/voicing state, not different HTML files.
  if (key === "/music" || key.startsWith("/music/")) {
    if (!key.split("/").pop().includes(".")) key = `${key.replace(/\/$/, "")}/`;
  }
  if (!FILES.includes(key)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(key)) || fetch(event.request);
    })(),
  );
});
