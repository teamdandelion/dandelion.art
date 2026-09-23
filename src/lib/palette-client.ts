import { DEFAULT_PALETTE, isPalette, PALETTE_STORAGE_KEY } from "./palettes";

export function setAppearance(patch: {
  palette?: string;
  theme?: "light" | "dark";
}) {
  const root = document.documentElement;
  if (patch.palette && isPalette(patch.palette))
    root.dataset.palette = patch.palette;
  if (patch.theme) root.dataset.theme = patch.theme;
  try {
    if (patch.palette)
      localStorage.setItem(PALETTE_STORAGE_KEY, root.dataset.palette ?? "");
    if (patch.theme)
      localStorage.setItem("theme", root.dataset.theme ?? "light");
  } catch {
    /* Preferences still work for the current page without storage. */
  }
  const url = new URL(location.href);
  if (
    url.searchParams.has("palette") ||
    url.searchParams.has("theme") ||
    root.dataset.paletteReview
  ) {
    url.searchParams.set("palette", root.dataset.palette ?? DEFAULT_PALETTE);
    url.searchParams.set("theme", root.dataset.theme ?? "light");
    history.replaceState(null, "", url);
  }
  const toggle = document.querySelector<HTMLInputElement>(
    "[data-theme-toggle]",
  );
  if (toggle) toggle.checked = root.dataset.theme === "light";
  window.dispatchEvent(new Event("appearance-change"));
}
