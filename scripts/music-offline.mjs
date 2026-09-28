import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Follow only assets referenced by music HTML and their module/CSS dependencies.
export default function musicOffline() {
  return {
    name: "music-offline",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const root = fileURLToPath(dir);
        const assets = new Map();
        const visit = async (url) => {
          if (assets.has(url)) return;
          const file = url.endsWith("/") ? `${url}index.html` : url;
          const data = await readFile(`${root}${file.slice(1)}`);
          assets.set(url, data);
          if (!/\.(?:js|css|html)$/.test(file)) return;
          const text = data.toString();
          for (const match of text.matchAll(
            /(?:["'(])((?:\/_astro\/|\/fonts\/|\.\/)[^"'()\s]+)["')]/g,
          )) {
            const dependency = new URL(match[1], `https://local${url}`)
              .pathname;
            if (
              dependency.startsWith("/_astro/") ||
              dependency.startsWith("/fonts/")
            )
              await visit(dependency);
          }
        };
        for (const entry of await readdir(`${root}music`, {
          withFileTypes: true,
        })) {
          if (entry.isDirectory()) await visit(`/music/${entry.name}/`);
        }
        await visit("/music/");
        for (const url of [
          "/music/manifest.webmanifest",
          "/music/icon-192.png",
          "/music/icon-512.png",
        ])
          await visit(url);
        const template = await readFile(
          new URL("./music-service-worker.js", import.meta.url),
          "utf8",
        );
        const hash = createHash("sha256").update(template);
        for (const [url, data] of assets) hash.update(url).update(data);
        const source = template
          .replace(
            '"BUILD_VERSION"',
            JSON.stringify(hash.digest("hex").slice(0, 16)),
          )
          .replace('"BUILD_FILES"', JSON.stringify([...assets.keys()]));
        await writeFile(`${root}music/sw.js`, source);
        console.log(
          `Music offline: ${assets.size} files, ${Math.ceil([...assets.values()].reduce((n, data) => n + data.length, 0) / 1024)} KB`,
        );
      },
    },
  };
}
