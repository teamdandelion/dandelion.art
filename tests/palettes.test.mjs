import assert from "node:assert/strict";
import test from "node:test";
import { hexToHsv, hsvToHex, parseHex } from "../src/lib/palette-color.ts";
import {
  DEFAULT_PALETTE,
  isPalette,
  PALETTES,
  paletteCss,
  withSignature,
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
        for (const background of [
          "page",
          "surface",
          "panel",
          "raised",
          "header",
        ])
          assert.ok(
            contrast(c[foreground], c[background]) >= 4.5,
            `${p.id}/${mode} ${foreground} on ${background}: ${contrast(c[foreground], c[background]).toFixed(2)}`,
          );
      assert.ok(contrast(c.onAccent, c.accentFill) >= 4.5);
      assert.ok(contrast(c.onSecondary, c.secondaryFill) >= 4.5);
      assert.ok(contrast(c.text, c.soft) >= 4.5);
    }
});

test("Sunlit uses identical signature fills in both modes", () => {
  const sunlit = PALETTES.find((p) => p.id === "tide-sunlit");
  assert.equal(sunlit.light.accentFill, sunlit.dark.accentFill);
  assert.equal(sunlit.light.secondaryFill, sunlit.dark.secondaryFill);
  assert.notEqual(sunlit.light.accent, sunlit.light.accentFill);
  assert.equal(sunlit.light.accentFill, "#ffa647");
  assert.equal(sunlit.light.secondaryFill, "#a8eae0");
});

test("Sunlit uses tangerine for foreground accents and teal for supporting surfaces", () => {
  const sunlit = PALETTES.find((p) => p.id === "tide-sunlit");
  const tuned = withSignature(sunlit.light, "light", {
    teal: "#a8eae0",
    tangerine: "#ffa647",
  });
  assert.equal(tuned.accentFill, "#ffa647");
  assert.equal(tuned.secondaryFill, "#a8eae0");
  assert.equal(tuned.header, tuned.soft);
  assert.equal(tuned.soft, "#d6f2e9");
  assert.equal(sunlit.dark.header, sunlit.dark.surface);
});

test("Sunlit keeps its warm light surfaces and uses Bright's cool dark foundation", () => {
  const sunlit = PALETTES.find((p) => p.id === "tide-sunlit");
  const bright = PALETTES.find((p) => p.id === "tide-bright");
  assert.equal(sunlit.light.page, "#f8f5eb");
  assert.equal(sunlit.light.surface, "#fffdf5");
  assert.equal(sunlit.light.panel, "#eeeee2");
  for (const role of [
    "page",
    "surface",
    "panel",
    "raised",
    "text",
    "muted",
    "border",
    "soft",
  ])
    assert.equal(sunlit.dark[role], bright.dark[role], role);
});

test("HSV conversion handles primaries, grayscale, hue wrap, and exact hex round trips", () => {
  for (const color of [
    "#a8eae0",
    "#ffa647",
    "#70ead7",
    "#ffb852",
    "#000000",
    "#ffffff",
    "#808080",
    "#ff0000",
    "#00ff00",
    "#0000ff",
  ])
    assert.equal(hsvToHex(hexToHsv(color)), color);
  assert.equal(hsvToHex({ h: 360, s: 100, v: 100 }), "#ff0000");
  assert.equal(hsvToHex({ h: -120, s: 100, v: 100 }), "#0000ff");
  assert.equal(parseHex("70EAD7"), "#70ead7");
  for (const bad of [null, {}, "red", "#fff", "000000;}", "12345678"])
    assert.equal(parseHex(bad), null);
});

test("tuned fills stay exact while text and labels stay readable, even at extremes", () => {
  const sunlit = PALETTES.find((p) => p.id === "tide-sunlit");
  for (const mode of ["light", "dark"])
    for (const hex of [
      "#000000",
      "#ffffff",
      "#808080",
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#70ead7",
      "#ffb852",
    ]) {
      const c = withSignature(sunlit[mode], mode, {
        teal: hex,
        tangerine: hex,
      });
      assert.equal(c.accentFill, hex);
      assert.equal(c.secondaryFill, hex);
      assert.ok(contrast(c.onAccent, hex) >= 4.5);
      assert.ok(contrast(c.onSecondary, hex) >= 4.5);
      for (const surface of [c.page, c.surface, c.panel, c.raised, c.soft]) {
        assert.ok(contrast(c.accent, surface) >= 4.5);
        assert.ok(contrast(c.secondary, surface) >= 4.5);
      }
    }
});
