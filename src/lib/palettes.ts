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
const BASE_PALETTES: Palette[] = [
  {
    id: "zest",
    name: "Zest",
    description:
      "Soft cyan and tangerine over warm paper or deep blue. Bright accents, quiet surfaces.",
    light: {
      page: "#f7f4eb",
      surface: "#fffdf5",
      panel: "#eaece3",
      raised: "#fffdf5",
      text: "#263b40",
      muted: "#566764",
      border: "#b7c8c3",
      accent: "#006765",
      soft: "#d6f4ed",
      onAccent: "#fffdf5",
      secondary: "#934221",
    },
    dark: {
      page: "#12232a",
      surface: "#1b3038",
      panel: "#243d45",
      raised: "#29464f",
      text: "#eef5ef",
      muted: "#b4ccc9",
      border: "#507078",
      accent: "#a9fff7",
      soft: "#224b50",
      onAccent: "#122d33",
      secondary: "#ff9b71",
    },
  },
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

const tide = BASE_PALETTES.find((p) => p.id === "tide");
if (!tide) throw new Error("Tide variations require the original Tide palette");
const TIDE_VARIATIONS: Palette[] = [
  {
    id: "tide-bright",
    name: "Tide · Bright",
    description:
      "The same cool surfaces as Tide, with livelier teal and mandarin accents. The closest comparison.",
    light: {
      ...tide.light,
      accent: "#00716e",
      soft: "#d8f0ec",
      secondary: "#ad4508",
    },
    dark: {
      ...tide.dark,
      accent: "#5ee3d5",
      soft: "#20494c",
      secondary: "#ffac63",
    },
  },
  {
    id: "tide-sunlit",
    name: "Tide · Sunlit",
    description:
      "Creamier daylight, warm orange, and clear turquoise. A little more sunshine without a louder background.",
    light: {
      ...tide.light,
      page: "#f8f5eb",
      surface: "#fffdf5",
      panel: "#eeeee2",
      raised: "#fffdf5",
      text: "#263d43",
      muted: "#536765",
      border: "#bdcec5",
      accent: "#006f72",
      soft: "#d6f2e9",
      secondary: "#ae4900",
    },
    dark: {
      ...tide.dark,
      page: "#15272d",
      surface: "#1d343a",
      panel: "#274048",
      raised: "#2a434a",
      text: "#f5f3e5",
      muted: "#b6cbc4",
      border: "#536f70",
      accent: "#70ead7",
      soft: "#20494b",
      secondary: "#ffb15c",
    },
  },
  {
    id: "tide-surf",
    name: "Tide · Surf",
    description:
      "A sea-glass tint, bright aqua, and coral-orange. The most colorful of the three.",
    light: {
      ...tide.light,
      page: "#eaf5f3",
      surface: "#f8fffc",
      panel: "#dceee8",
      raised: "#f8fffc",
      text: "#213b43",
      muted: "#496460",
      border: "#a8c9c3",
      accent: "#006b74",
      soft: "#cff0e9",
      secondary: "#ad3e1a",
    },
    dark: {
      ...tide.dark,
      page: "#102b33",
      surface: "#163942",
      panel: "#20434c",
      raised: "#23474e",
      text: "#e9f8f2",
      muted: "#b3d0cd",
      border: "#4a7880",
      accent: "#54efdc",
      soft: "#144c51",
      secondary: "#ffac83",
    },
  },
];

export const PALETTES: Palette[] = BASE_PALETTES.flatMap((p) =>
  p.id === "tide" ? [p, ...TIDE_VARIATIONS] : [p],
);

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
