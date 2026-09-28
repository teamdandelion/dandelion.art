import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import musicOffline from "./scripts/music-offline.mjs";

export default defineConfig({
  integrations: [mdx(), react(), musicOffline()],
  redirects: {
    "/polysome": "/art/polysome",
    "/music/cheat-sheet": "/music/chords/",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
