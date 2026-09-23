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
  diagramLine: "Strings and frets",
  diagramNut: "Nut",
  familyMajor: "Major chords",
  familyMinor: "Minor chords",
  familyDominant: "Dominant chords",
  familyDiminished: "Diminished chords",
  pianoWhite: "Piano white keys",
  pianoWhiteBorder: "White key borders",
  pianoBlack: "Piano black keys",
  pianoBlackBorder: "Black key borders",
  pianoLabel: "Piano note labels",
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
    familyMajor: "#925035",
    familyMinor: "#366956",
    familyDominant: "#796009",
    familyDiminished: "#7b4773",
    pianoWhite: "#faf9f5",
    pianoWhiteBorder: "#bcbcb5",
    pianoBlack: "#272825",
    pianoBlackBorder: "#161715",
    pianoLabel: "#60635b",
    page: "#ebecfc",
    surface: "#f8f8ff",
    panel: "#e6e2f3",
    raised: "#ffffff",
    text: "#16215b",
    muted: "#605b79",
    border: "#c8c2db",
    header: "#e0d1ff",
    soft: "#ebe2fa",
    accent: "#3f50a6",
    accentFill: "#5369cf",
    onAccent: "#ffffff",
    secondary: "#714881",
    secondaryFill: "#795391",
    onSecondary: "#ffffff",
    diagramLine: "#8b799f",
    diagramNut: "#78658f",
  },
  dark: {
    familyMajor: "#e4af93",
    familyMinor: "#a5cbb6",
    familyDominant: "#dfc788",
    familyDiminished: "#d2aed0",
    pianoWhite: "#faf9f5",
    pianoWhiteBorder: "#bcbcb5",
    pianoBlack: "#272825",
    pianoBlackBorder: "#161715",
    pianoLabel: "#60635b",
    page: "#1c1b1b",
    surface: "#262525",
    panel: "#302d35",
    raised: "#35303e",
    text: "#e2e2f3",
    muted: "#b9b4c7",
    border: "#514b5a",
    header: "#322d52",
    soft: "#322d52",
    accent: "#a2afff",
    accentFill: "#8595ed",
    onAccent: "#151b3e",
    secondary: "#ceb6ee",
    secondaryFill: "#c2a6de",
    onSecondary: "#24182f",
    diagramLine: "#8f829e",
    diagramNut: "#b6a6c6",
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
