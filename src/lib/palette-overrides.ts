import { parseHex } from "./palette-color.ts";
import {
  COLOR_ROLES,
  type ColorRole,
  type Mode,
  PALETTES,
} from "./palettes.ts";

export type Overrides = Partial<
  Record<Mode, Partial<Record<ColorRole, string>>>
>;
export function validateOverrides(value: unknown): Overrides | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result: Overrides = {};
  for (const mode of ["light", "dark"] as const) {
    const source = (value as Record<string, unknown>)[mode];
    if (source === undefined) continue;
    if (!source || typeof source !== "object" || Array.isArray(source))
      return null;
    const colors: Partial<Record<ColorRole, string>> = {};
    for (const role of Object.keys(COLOR_ROLES) as ColorRole[]) {
      const raw = (source as Record<string, unknown>)[role];
      if (raw === undefined) continue;
      const hex = parseHex(raw);
      if (!hex) return null;
      if (hex !== PALETTES[0][mode][role]) colors[role] = hex;
    }
    if (Object.keys(colors).length) result[mode] = colors;
  }
  return result;
}
export function resolvedColors(overrides: Overrides, mode: Mode) {
  return { ...PALETTES[0][mode], ...overrides[mode] };
}
