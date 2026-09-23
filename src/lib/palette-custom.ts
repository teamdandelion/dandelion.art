import {
  type Overrides,
  resolvedColors,
  validateOverrides,
} from "./palette-overrides";
import { paletteVariables } from "./palettes";

const STORAGE_KEY = "site.iris-colors.v1";
let current: Overrides | undefined;
function parse(raw: string | null) {
  try {
    return validateOverrides(JSON.parse(raw ?? "null"));
  } catch {
    return null;
  }
}
export function getColors(): Overrides {
  if (!current) {
    const requested = parse(new URLSearchParams(location.search).get("colors"));
    let stored: Overrides | null = null;
    try {
      stored = parse(localStorage.getItem(STORAGE_KEY));
    } catch {}
    current = requested ?? stored ?? {};
    if (requested) save();
  }
  return structuredClone(current);
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}
}
export function withColorParams(url: URL) {
  url.searchParams.set("colors", JSON.stringify(getColors()));
  return url;
}
export function applyColors() {
  const overrides = getColors();
  let style = document.querySelector<HTMLStyleElement>("[data-tuned-colors]");
  if (!style) {
    style = document.createElement("style");
    style.dataset.tunedColors = "";
    document.head.append(style);
  }
  style.textContent = (["light", "dark"] as const)
    .map((mode) => {
      const variables = paletteVariables(resolvedColors(overrides, mode));
      for (const sample of document.querySelectorAll<HTMLElement>(
        `[data-sample-mode="${mode}"]`,
      ))
        sample.style.cssText = variables;
      return `html[data-palette="iris"][data-theme="${mode}"]{${variables}}`;
    })
    .join("\n");
  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    ".palette-lab a[href]",
  )) {
    const url = new URL(link.href);
    if (url.searchParams.has("palette")) link.href = withColorParams(url).href;
  }
}
export function updateColors(overrides: Overrides) {
  const valid = validateOverrides(overrides);
  if (!valid) return;
  current = valid;
  save();
  applyColors();
}
export function syncColorAddress() {
  history.replaceState(null, "", withColorParams(new URL(location.href)));
}
export function colorShareUrl() {
  const url = withColorParams(new URL("/design/palettes/", location.origin));
  url.searchParams.set(
    "theme",
    document.documentElement.dataset.theme ?? "light",
  );
  url.searchParams.set("paletteReview", "1");
  return url.href;
}
