import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(
  new URL("../src/components/music/chord-atlas.css", import.meta.url),
  "utf8",
);

function declaration(selector, property) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `Missing selector ${selector}`);
  const block = css.slice(start, css.indexOf("}", start));
  const match = new RegExp(`${property}: (#[0-9a-f]{6});`).exec(block);
  assert.ok(match, `Missing color ${property} in ${selector}`);
  return match[1];
}

function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((value) => {
      const channel = Number.parseInt(value, 16) / 255;
      return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function checkContrast(foreground, background, label) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  const ratio = (light + 0.05) / (dark + 0.05);
  assert.ok(ratio >= 4.5, `${label}: ${ratio.toFixed(2)}:1 is below 4.5:1`);
}

test("atlas text colors remain readable on their light and dark surfaces", () => {
  for (const theme of [".chord-atlas", 'html[data-theme="dark"] .chord-atlas'])
    for (const foreground of ["ink", "muted", "accent", "coral"])
      for (const background of ["paper", "panel", "white", "accent-soft"])
        checkContrast(
          declaration(theme, `--ca-${foreground}`),
          declaration(theme, `--ca-${background}`),
          `${theme}: ${foreground} on ${background}`,
        );
  assert.match(
    css,
    /\.ca-search-input input::placeholder\s*\{[^}]*opacity: 1;/,
  );
});

test("piano labels remain readable on natural, highlighted, and root keys", () => {
  for (const [label, key] of [
    [".ca-key-label", ".ca-white-key"],
    [".ca-key-label--active", ".ca-white-key.ca-key-active"],
    [".ca-key-label--active", ".ca-white-key.ca-key-root"],
    [".ca-black-key-label", ".ca-black-key.ca-key-active"],
    [".ca-black-key-label", ".ca-black-key.ca-key-root"],
  ])
    checkContrast(
      declaration(label, "fill"),
      declaration(key, "fill"),
      `${label} on ${key}`,
    );
});
