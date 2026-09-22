import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PALETTE,
  isPalette,
  PALETTES,
  paletteCss,
} from "../src/lib/palettes.ts";

function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((n) => Number.parseInt(n, 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

test("palette IDs and every semantic color are valid", () => {
  assert.ok(isPalette(DEFAULT_PALETTE));
  assert.equal(isPalette("unknown"), false);
  assert.equal(isPalette(null), false);
  assert.equal(isPalette("gallery"), false);
  assert.equal(isPalette("grove"), false);
  assert.equal(DEFAULT_PALETTE, "tide");
  assert.equal(new Set(PALETTES.map((p) => p.id)).size, PALETTES.length);
  for (const p of PALETTES)
    for (const mode of ["light", "dark"]) {
      for (const value of Object.values(p[mode]))
        assert.match(value, /^#[\da-f]{6}$/);
      assert.ok(
        paletteCss.includes(
          `html[data-palette="${p.id}"][data-theme="${mode}"]`,
        ),
      );
    }
});

// WCAG 2.x contrast calculation. This guards tokens, not whole-page conformance.
test("Tide Bright isolates accent changes for a controlled comparison", () => {
  const tide = PALETTES.find((p) => p.id === "tide");
  const bright = PALETTES.find((p) => p.id === "tide-bright");
  for (const mode of ["light", "dark"]) {
    for (const role of [
      "page",
      "surface",
      "panel",
      "raised",
      "text",
      "muted",
      "border",
      "onAccent",
    ])
      assert.equal(bright[mode][role], tide[mode][role]);
    for (const role of ["accent", "secondary", "soft"])
      assert.notEqual(bright[mode][role], tide[mode][role]);
  }
});

test("all palettes maintain readable text, links, and selected labels", () => {
  for (const p of PALETTES)
    for (const mode of ["light", "dark"]) {
      const c = p[mode];
      for (const foreground of ["text", "muted", "accent", "secondary"])
        for (const background of ["page", "surface", "panel", "raised"])
          assert.ok(
            contrast(c[foreground], c[background]) >= 4.5,
            `${p.id}/${mode} ${foreground} on ${background}: ${contrast(c[foreground], c[background]).toFixed(2)}`,
          );
      assert.ok(contrast(c.onAccent, c.accent) >= 4.5);
      assert.ok(contrast(c.text, c.soft) >= 4.5);
      // Existing diagrams use the surface color as reversed text on colored notes.
      assert.ok(contrast(c.surface, c.accent) >= 4.5);
      assert.ok(contrast(c.surface, c.secondary) >= 4.5);
    }
});
