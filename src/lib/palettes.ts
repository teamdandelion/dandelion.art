import {
  labelOn,
  readableAccent,
  type Signature,
  SUNLIT_SIGNATURE,
} from "./palette-color.ts";

type BaseColors = {
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
export type PaletteColors = BaseColors & {
  diagramLine: string;
  diagramNut: string;
  header: string;
  accentFill: string;
  secondaryFill: string;
  onSecondary: string;
};

export type Palette = {
  id: string;
  name: string;
  description: string;
  light: PaletteColors;
  dark: PaletteColors;
};
type BasePalette = Omit<Palette, "light" | "dark"> & {
  light: BaseColors;
  dark: BaseColors;
};

/** The only palette-specific values. Components consume semantic CSS variables. */
const BASE_PALETTES: BasePalette[] = [
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
    id: "tide",
    name: "Tide",
    description:
      "Teal and tangerine, with pale sea-glass by day and deep petrol at night. The signature starting point.",
    light: {
      page: "#eff5f2",
      surface: "#fafffc",
      panel: "#e0ece7",
      raised: "#fafffc",
      text: "#173b40",
      muted: "#4b6769",
      border: "#adc8c3",
      accent: "#006b67",
      soft: "#cef0e7",
      onAccent: "#ffffff",
      secondary: "#a4440b",
    },
    dark: {
      page: "#122e34",
      surface: "#1b3b42",
      panel: "#24464b",
      raised: "#294b50",
      text: "#ecf7ef",
      muted: "#b4cecc",
      border: "#50777b",
      accent: "#68e5d5",
      soft: "#205055",
      onAccent: "#122e34",
      secondary: "#ffb15c",
    },
  },
];

const tide = BASE_PALETTES.find((p) => p.id === "tide");
if (!tide) throw new Error("Tide variations require the original Tide palette");
const TIDE_VARIATIONS: BasePalette[] = [
  {
    id: "tide-bright",
    name: "Tide · Bright",
    description:
      "The same petrol and sea-glass surfaces, with sharper turquoise and a stronger orange contrast.",
    light: {
      ...tide.light,
      accent: "#006e75",
      soft: "#d8f0ec",
      secondary: "#ad4508",
    },
    dark: {
      ...tide.dark,
      accent: "#41efda",
      soft: "#20494c",
      secondary: "#ffa366",
    },
  },
  {
    id: "tide-sunlit",
    name: "Tide · Sunlit",
    description:
      "Warm cream by day, cooler petrol by night. The selected soft teal and tangerine stay the same in both.",
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
      soft: "#20494c",
    },
  },
  {
    id: "tide-surf",
    name: "Tide · Surf",
    description:
      "The cooler version: a stronger sea-glass tint, electric teal, and coral-tangerine.",
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

export function withSignature(
  colors: PaletteColors,
  mode: "light" | "dark",
  signature: Signature,
): PaletteColors {
  const surfaces = [
    colors.page,
    colors.surface,
    colors.panel,
    colors.raised,
    colors.soft,
  ];
  return {
    ...colors,
    header: mode === "light" ? colors.soft : colors.surface,
    accentFill: signature.tangerine,
    secondaryFill: signature.teal,
    onAccent: labelOn(signature.tangerine),
    onSecondary: labelOn(signature.teal),
    accent: readableAccent(signature.tangerine, surfaces, mode),
    secondary: readableAccent(signature.teal, surfaces, mode),
  };
}

const EXPERIMENT_PALETTES: Palette[] = [
  tide,
  ...TIDE_VARIATIONS,
  ...BASE_PALETTES.filter((p) => p.id !== "tide"),
].map((palette) => {
  const colors = (mode: "light" | "dark"): PaletteColors => {
    const base = palette[mode];
    const resolved = {
      ...base,
      diagramLine: base.muted,
      diagramNut: base.text,
      header: base.surface,
      accentFill: base.accent,
      secondaryFill: base.secondary,
      onSecondary: base.surface,
    };
    return palette.id === "tide-sunlit"
      ? withSignature(resolved, mode, SUNLIT_SIGNATURE)
      : resolved;
  };
  return { ...palette, light: colors("light"), dark: colors("dark") };
});

const IRIS: Palette = {
  id: "iris",
  name: "Iris",
  description:
    "Blue notes, lavender structure. Pale lilac and navy by day; charcoal and muted violet at night.",
  light: {
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

export const PALETTES: Palette[] = [IRIS, ...EXPERIMENT_PALETTES];
export const DEFAULT_PALETTE = "iris";
// Old experiment selections must not silently override the new site default.
// Explicit palette URLs and new lab selections still work; theme is preserved.
export const PALETTE_STORAGE_KEY = "site.palette.v2";
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
