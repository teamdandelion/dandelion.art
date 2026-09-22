import { parseHex, type Signature, SUNLIT_SIGNATURE } from "./palette-color";
import { PALETTES, paletteVariables, withSignature } from "./palettes";

const STORAGE_KEY = "site.sunlit-signature.v1";
const sunlit = (() => {
  const palette = PALETTES.find((candidate) => candidate.id === "tide-sunlit");
  if (!palette) throw new Error("The signature tuner requires Sunlit");
  return palette;
})();
let current: Signature | undefined;

function validated(value: unknown): Signature | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const teal = parseHex(source.teal);
  const tangerine = parseHex(source.tangerine);
  return teal && tangerine ? { teal, tangerine } : null;
}

export function getSignature(): Signature {
  if (current) return { ...current };
  const params = new URLSearchParams(location.search);
  const requested = validated({
    teal: params.get("teal"),
    tangerine: params.get("tangerine"),
  });
  let stored: Signature | null = null;
  try {
    stored = validated(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    /* Storage is optional. */
  }
  current = requested ?? stored ?? { ...SUNLIT_SIGNATURE };
  if (requested) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      /* URL still works. */
    }
  }
  return { ...current };
}

function signatureUrl(url: URL, signature: Signature) {
  url.searchParams.set("teal", signature.teal.slice(1));
  url.searchParams.set("tangerine", signature.tangerine.slice(1));
  return url;
}

export function applySignature() {
  const signature = getSignature();
  let style = document.querySelector<HTMLStyleElement>(
    "[data-signature-style]",
  );
  if (!style) {
    style = document.createElement("style");
    style.dataset.signatureStyle = "true";
    document.head.append(style);
  }
  style.textContent = (["light", "dark"] as const)
    .map((mode) => {
      const variables = paletteVariables(
        withSignature(sunlit[mode], mode, signature),
      );
      for (const sample of document.querySelectorAll<HTMLElement>(
        `[data-sample-palette="tide-sunlit"][data-sample-mode="${mode}"]`,
      ))
        sample.style.cssText = variables;
      return `html[data-palette="tide-sunlit"][data-theme="${mode}"]{${variables}}`;
    })
    .join("\n");
  // Carry the exact experiment into actual-page previews, not just the cards.
  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    ".palette-lab a[href]",
  )) {
    const url = new URL(link.href);
    if (url.searchParams.get("palette") === "tide-sunlit")
      link.href = signatureUrl(url, signature).href;
  }
}

export function updateSignature(signature: Signature, updateAddress = true) {
  const valid = validated(signature);
  if (!valid) return;
  current = valid;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  } catch {
    /* Sliders still work. */
  }
  applySignature();
  if (updateAddress) syncSignatureAddress();
}

/** Commit on change/release, not every pointer event (Safari limits history writes). */
export function syncSignatureAddress() {
  const url = signatureUrl(new URL(location.href), getSignature());
  history.replaceState(null, "", url);
}

export function signatureShareUrl() {
  const url = signatureUrl(
    new URL("/design/palettes/", location.origin),
    getSignature(),
  );
  url.searchParams.set("palette", "tide-sunlit");
  url.searchParams.set(
    "theme",
    document.documentElement.dataset.theme ?? "light",
  );
  url.searchParams.set("paletteReview", "1");
  url.hash = "tide-sunlit";
  return url.href;
}

export function withSignatureParams(url: URL) {
  return url.searchParams.get("palette") === "tide-sunlit"
    ? signatureUrl(url, getSignature())
    : url;
}
