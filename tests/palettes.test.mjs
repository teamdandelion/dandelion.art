import assert from "node:assert/strict";
import test from "node:test";
import { hexToHsv, hsvToHex, parseHex } from "../src/lib/palette-color.ts";
import {
  resolvedColors,
  validateOverrides,
} from "../src/lib/palette-overrides.ts";
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
  assert.deepEqual(
    PALETTES.map((p) => p.id),
    ["iris"],
  );
  assert.ok(isPalette(DEFAULT_PALETTE));
  assert.equal(isPalette("unknown"), false);
  assert.equal(isPalette(null), false);
  assert.equal(isPalette("gallery"), false);
  assert.equal(isPalette("grove"), false);
  assert.equal(DEFAULT_PALETTE, "iris");
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

test("custom colors validate, stay mode-specific, and reset without mutating defaults", () => {
  const original = structuredClone(PALETTES[0]);
  const custom = validateOverrides({
    light: { page: "123ABC", unknown: "bad" },
    dark: { accent: "#aabbcc" },
  });
  assert.deepEqual(custom, {
    light: { page: "#123abc" },
    dark: { accent: "#aabbcc" },
  });
  assert.equal(resolvedColors(custom, "light").page, "#123abc");
  assert.equal(resolvedColors(custom, "dark").page, original.dark.page);
  assert.deepEqual(resolvedColors({}, "light"), original.light);
  assert.deepEqual(PALETTES[0], original);
  assert.deepEqual(validateOverrides({ light: original.light }), {});
  assert.deepEqual(
    validateOverrides(JSON.parse(JSON.stringify(custom))),
    custom,
  );
  for (const bad of [
    null,
    [],
    { light: [] },
    { dark: { page: "red" } },
    { light: { page: "#ffffff;}body{display:none" } },
  ])
    assert.equal(validateOverrides(bad), null);
});

test("Iris is the default and music token roles stay in the shared design system", () => {
  const iris = PALETTES.find((p) => p.id === DEFAULT_PALETTE);
  assert.equal(iris.light.header, "#bebaff");
  assert.equal(iris.dark.header, "#322d52");
  assert.equal(iris.light.accentFill, "#c29cf7");
  assert.equal("diagramLine" in iris.light, false);
  assert.equal("familyMajor" in iris.light, false);
  assert.equal("pianoWhite" in iris.light, false);
  for (const mode of ["light", "dark"])
    assert.ok(contrast(iris[mode].muted, iris[mode].surface) >= 4.5);
});

// WCAG 2.x contrast calculation. This guards tokens, not whole-page conformance.

test("Iris maintains readable text, links, and selected labels", () => {
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
