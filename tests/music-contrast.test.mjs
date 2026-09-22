import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PALETTES } from "../src/lib/palettes.ts";

const css = readFileSync(
  new URL("../src/components/music/chord-atlas.css", import.meta.url),
  "utf8",
);
const progressionCss = readFileSync(
  new URL("../src/components/music/progression-explorer.css", import.meta.url),
  "utf8",
);
const paletteCss = readFileSync(
  new URL("../src/styles/palette.css", import.meta.url),
  "utf8",
);
const themes = PALETTES.flatMap((p) =>
  ["light", "dark"].map((mode) => ({
    name: `${p.id}/${mode}`,
    mode,
    colors: p[mode],
  })),
);

function declaration(selector, property, source = css, theme) {
  const start = source.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `Missing selector ${selector}`);
  const block = source.slice(start, source.indexOf("}", start));
  const match = new RegExp(`${property}: ([^;]+);`).exec(block);
  assert.ok(match, `Missing color ${property} in ${selector}`);
  const value = match[1];
  if (value.startsWith("var(--site-")) {
    const key = value.slice(11, -1);
    assert.ok(theme.colors[key], `Missing site color ${key}`);
    return theme.colors[key];
  }
  if (value.startsWith("var(--ca-"))
    return declaration(".chord-atlas", value.slice(4, -1), css, theme);
  if (value.startsWith("var(--family-"))
    return declaration(
      `html[data-theme="${theme.mode}"]`,
      value.slice(4, -1),
      paletteCss,
      theme,
    );
  assert.match(value, /^#[0-9a-f]{6}$/);
  return value;
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
  for (const theme of themes)
    for (const foreground of ["ink", "muted", "accent", "coral"])
      for (const background of ["paper", "panel", "white", "accent-soft"])
        checkContrast(
          declaration(".chord-atlas", `--ca-${foreground}`, css, theme),
          declaration(".chord-atlas", `--ca-${background}`, css, theme),
          `${theme.name}: ${foreground} on ${background}`,
        );
  assert.match(
    css,
    /\.ca-search-input input::placeholder\s*\{[^}]*opacity: 1;/,
  );
});

test("progression chord families remain readable in both themes", () => {
  for (const theme of themes)
    for (const family of ["major", "minor", "dominant", "diminished"])
      for (const background of ["paper", "panel", "white", "accent-soft"])
        checkContrast(
          declaration(
            `.hp-family-${family}`,
            "--hp-color",
            progressionCss,
            theme,
          ),
          declaration(".chord-atlas", `--ca-${background}`, css, theme),
          `${theme.name} ${family} on ${background}`,
        );
});

test("piano labels remain readable on natural, highlighted, and root keys", () => {
  for (const theme of themes)
    for (const [label, key] of [
      [".ca-key-label", ".ca-white-key"],
      [".ca-key-label--active", ".ca-white-key.ca-key-active"],
      [".ca-key-root + text", ".ca-white-key.ca-key-root"],
      [".ca-black-key-label", ".ca-black-key.ca-key-active"],
      [".ca-key-root + text", ".ca-black-key.ca-key-root"],
    ])
      checkContrast(
        declaration(label, "fill", css, theme),
        declaration(key, "fill", css, theme),
        `${theme.name} ${label} on ${key}`,
      );
});

test("finger numbers remain readable on root and other finger dots", () => {
  for (const theme of themes)
    for (const [label, dot] of [
      [".ca-finger-label", ".ca-finger"],
      [".ca-finger.ca-root + .ca-finger-label", ".ca-finger.ca-root"],
    ])
      checkContrast(
        declaration(label, "fill", css, theme),
        declaration(dot, "fill", css, theme),
        `${theme.name}: finger on ${dot}`,
      );
});
