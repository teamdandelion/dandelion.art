export type PaletteColors = {
  page: string;
  surface: string;
  panel: string;
  raised: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  soft: string;
  onAccent: string;
  secondary: string;
};

export type Palette = {
  id: string;
  name: string;
  description: string;
  light: PaletteColors;
  dark: PaletteColors;
};

/** The only palette-specific values. Components consume semantic CSS variables. */
export const PALETTES: Palette[] = [
  {
    id: "gallery",
    name: "Gallery",
    description:
      "Warm paper, charcoal, and a copper accent. Quiet around artwork.",
    light: {
      page: "#f5f2eb",
      surface: "#fffdf8",
      panel: "#ece7dd",
      raised: "#fffdf8",
      text: "#302d28",
      muted: "#696158",
      border: "#c5bdb1",
      accent: "#87472f",
      soft: "#eee2d6",
      onAccent: "#fffaf4",
      secondary: "#4c6553",
    },
    dark: {
      page: "#191a18",
      surface: "#222420",
      panel: "#2b2e28",
      raised: "#30342c",
      text: "#eeeae1",
      muted: "#bbb4a8",
      border: "#55584f",
      accent: "#e4ae8c",
      soft: "#45372e",
      onAccent: "#241c16",
      secondary: "#b0c5a5",
    },
  },
  {
    id: "tide",
    name: "Tide",
    description:
      "Cool porcelain, blue-black, and mineral blue. Crisp and restrained.",
    light: {
      page: "#f0f3f5",
      surface: "#fafcfd",
      panel: "#e4ebef",
      raised: "#ffffff",
      text: "#253541",
      muted: "#526776",
      border: "#b6c4cd",
      accent: "#285f88",
      soft: "#d7e6f0",
      onAccent: "#ffffff",
      secondary: "#785444",
    },
    dark: {
      page: "#151d24",
      surface: "#1d2932",
      panel: "#263540",
      raised: "#2c3c48",
      text: "#e5edf2",
      muted: "#acbfcd",
      border: "#506775",
      accent: "#97c7ea",
      soft: "#28465d",
      onAccent: "#172c3d",
      secondary: "#e3b499",
    },
  },
  {
    id: "grove",
    name: "Grove",
    description:
      "Pale stone, forest tones, and sage. Earthy without a saturated backdrop.",
    light: {
      page: "#f1f3ec",
      surface: "#fafbf6",
      panel: "#e4e9dc",
      raised: "#ffffff",
      text: "#2c382d",
      muted: "#5c6b57",
      border: "#bdc7b4",
      accent: "#446b3f",
      soft: "#e0ebda",
      onAccent: "#ffffff",
      secondary: "#82503e",
    },
    dark: {
      page: "#191f1a",
      surface: "#232c24",
      panel: "#2c372d",
      raised: "#334035",
      text: "#e9ede2",
      muted: "#b5c2ab",
      border: "#556650",
      accent: "#b5d69d",
      soft: "#35492e",
      onAccent: "#20311a",
      secondary: "#e2b39b",
    },
  },
];

export const DEFAULT_PALETTE = "gallery";
export const PALETTE_STORAGE_KEY = "site.palette.v1";
export const isPalette = (id: string | null): id is string =>
  PALETTES.some((p) => p.id === id);

export function paletteVariables(colors: PaletteColors) {
  return Object.entries(colors)
    .map(([key, value]) => `--site-${key}:${value}`)
    .join(";");
}

export const paletteCss = PALETTES.flatMap((p) =>
  (["light", "dark"] as const).map(
    (mode) =>
      `html[data-palette="${p.id}"][data-theme="${mode}"]{${paletteVariables(p[mode])};color-scheme:${mode}}`,
  ),
).join("\n");
