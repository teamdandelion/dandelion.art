import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [mdx(), react()],
  redirects: {
    "/polysome": "/art/polysome",
    "/music/cheat-sheet": "/music/chords/",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
