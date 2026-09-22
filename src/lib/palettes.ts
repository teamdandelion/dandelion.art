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
    accentFill: signature.teal,
    secondaryFill: signature.tangerine,
    onAccent: labelOn(signature.teal),
    onSecondary: labelOn(signature.tangerine),
    accent: readableAccent(signature.teal, surfaces, mode),
    secondary: readableAccent(signature.tangerine, surfaces, mode),
  };
}

export const PALETTES: Palette[] = [
  tide,
  ...TIDE_VARIATIONS,
  ...BASE_PALETTES.filter((p) => p.id !== "tide"),
].map((palette) => {
  const colors = (mode: "light" | "dark"): PaletteColors => {
    const base = palette[mode];
    const resolved = {
      ...base,
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

export const DEFAULT_PALETTE = "tide";
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
