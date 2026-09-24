import { CHORD_QUALITIES, type ChordGroup } from "./catalog.ts";
import { CHROMATIC_ROOTS, sheetEntry } from "./cheat-sheet.ts";
import {
  type FrettedInstrument,
  type Key,
  keyChords,
  keyContext,
  makeChord,
} from "./index.ts";

export const PRACTICE_GROUPS: readonly { id: ChordGroup; label: string }[] = [
  { id: "triads", label: "Triads" },
  { id: "sevenths", label: "7ths" },
  { id: "sixths", label: "6ths" },
  { id: "sus2", label: "sus2" },
  { id: "sus4", label: "sus4" },
  { id: "added", label: "add9" },
  { id: "ninths", label: "9ths" },
];
export const DEFAULT_GROUPS: ChordGroup[] = ["triads", "sevenths"];
export function groupExample(group: ChordGroup) {
  const formula = CHORD_QUALITIES.find((f) => f.group === group);
  if (!formula) throw new Error(`No formula registered for ${group}`);
  return formula.id;
}
export const GROUP_STORAGE_KEY = "music.chord-groups.v1";
export function parseGroups(raw: string | null): ChordGroup[] {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!Array.isArray(value)) return [...DEFAULT_GROUPS];
    const groups = PRACTICE_GROUPS.filter((g) => value.includes(g.id)).map(
      (g) => g.id,
    );
    return groups.length ? groups : [...DEFAULT_GROUPS];
  } catch {
    return [...DEFAULT_GROUPS];
  }
}
export function practiceRows(
  key: Key,
  instrument: FrettedInstrument,
  groups: readonly ChordGroup[],
) {
  return keyChords(key).map((item) => ({
    degree: item.degree,
    roman: item.roman,
    entries: CHORD_QUALITIES.filter((f) => groups.includes(f.group))
      .map((f) => makeChord(item.chord.root, f.id))
      .filter((chord) => keyContext(chord, key).fitsPitchClasses)
      // A sus chord is not another diatonic seventh merely because it fits the scale.
      .filter((chord) => chord.quality !== "7sus4" || groups.includes("sus4"))
      .map((chord) => sheetEntry(chord, instrument)),
  }));
}
export function dictionaryRows(
  instrument: FrettedInstrument,
  groups: readonly ChordGroup[],
) {
  return CHROMATIC_ROOTS.map((root) => ({
    root,
    entries: CHORD_QUALITIES.filter((f) => groups.includes(f.group)).map((f) =>
      sheetEntry(makeChord(root, f.id), instrument),
    ),
  }));
}
