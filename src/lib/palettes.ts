export const COLOR_ROLES = {
  page: "Page background",
  surface: "Card surface",
  panel: "Panel",
  raised: "Raised surface",
  header: "Header",
  soft: "Selected background",
  text: "Text",
  muted: "Muted text",
  border: "Borders",
  accent: "Primary links / outlines",
  accentFill: "Primary fill",
  onAccent: "Text on primary",
  secondary: "Secondary links / outlines",
  secondaryFill: "Secondary fill",
  onSecondary: "Text on secondary",
} as const;
export type ColorRole = keyof typeof COLOR_ROLES;
export type Mode = "light" | "dark";
export type PaletteColors = Record<ColorRole, string>;
export type Palette = {
  id: string;
  name: string;
  description: string;
  light: PaletteColors;
  dark: PaletteColors;
};
const IRIS: Palette = {
  id: "iris",
  name: "Iris",
  description:
    "Blue notes, lavender structure. Pale lilac and navy by day; charcoal and muted violet at night.",
  light: {
    page: "#f4f5fc",
    surface: "#f8f8ff",
    panel: "#e6e2f3",
    raised: "#ffffff",
    text: "#16215b",
    muted: "#504b66",
    border: "#c8c2db",
    header: "#bebaff",
    soft: "#ebe2fa",
    accent: "#674074",
    accentFill: "#c29cf7",
    onAccent: "#16215b",
    secondary: "#394994",
    secondaryFill: "#8ca1ff",
    onSecondary: "#16215b",
  },
  dark: {
    page: "#1c1b1b",
    surface: "#262525",
    panel: "#302d35",
    raised: "#35303e",
    text: "#e2e2f3",
    muted: "#b9b4c7",
    border: "#514b5a",
    header: "#322d52",
    soft: "#322d52",
    accent: "#ceb6ee",
    accentFill: "#c2a6de",
    onAccent: "#24182f",
    secondary: "#a2afff",
    secondaryFill: "#8595ed",
    onSecondary: "#151b3e",
  },
};

export const PALETTES: Palette[] = [IRIS];
export const DEFAULT_PALETTE = "iris";
export const PALETTE_STORAGE_KEY = "site.palette.v2";
export const isPalette = (id: string | null): id is string =>
  id === DEFAULT_PALETTE;
export function paletteVariables(colors: PaletteColors) {
  return Object.entries(colors)
    .map(([key, value]) => `--site-${key}:${value}`)
    .join(";");
}
export const paletteCss = (["light", "dark"] as const)
  .map(
    (mode) =>
      `html[data-palette="iris"][data-theme="${mode}"]{${paletteVariables(IRIS[mode])};color-scheme:${mode}}`,
  )
  .join("\n");
