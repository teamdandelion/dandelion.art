import { BARITONE, INSTRUMENTS, type Key } from "./index.ts";

export const MUSIC_STORAGE_KEY = "music.preferences.v1";
export const KEY_ROOTS = {
  major: ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"],
  "natural-minor": [
    "A",
    "E",
    "B",
    "F#",
    "C#",
    "G#",
    "Eb",
    "Bb",
    "F",
    "C",
    "G",
    "D",
  ],
};
export type MusicPreferences = {
  instrumentId: string;
  tonic: string;
  mode: Key["mode"];
};
export const DEFAULT_PREFERENCES: MusicPreferences = {
  instrumentId: BARITONE.id,
  tonic: "G",
  mode: "major",
};

export function parsePreferences(raw: string | null): MusicPreferences {
  try {
    const value = JSON.parse(raw ?? "null");
    const mode = value?.mode === "natural-minor" ? "natural-minor" : "major";
    return {
      instrumentId: INSTRUMENTS.some((i) => i.id === value?.instrumentId)
        ? value.instrumentId
        : BARITONE.id,
      tonic: KEY_ROOTS[mode].includes(value?.tonic) ? value.tonic : "G",
      mode,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
