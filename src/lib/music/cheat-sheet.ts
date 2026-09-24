import {
  BARITONE,
  type Chord,
  type ChordQuality,
  type FrettedInstrument,
  findFingerings,
  type Key,
  keyChords,
  keyContext,
  makeChord,
  parseNote,
  transpose,
} from "./index.ts";

export function sheetEntry(
  chord: Chord,
  instrument: FrettedInstrument = BARITONE,
) {
  return {
    chord,
    instrument,
    fingering: findFingerings(chord, instrument)[0] ?? null,
    href: `/music/atlas?chord=${encodeURIComponent(chord.symbol)}`,
  };
}
export type SheetEntry = ReturnType<typeof sheetEntry>;

export const CHEAT_SHEET_COLUMNS = [
  { quality: "major", label: "Major" },
  { quality: "minor", label: "Minor" },
  { quality: "7", label: "Dominant 7" },
] as const;

export const CHROMATIC_ROOTS = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];
export const ROOT_ALIASES: Record<string, string> = {
  Db: "C♯ / D♭",
  Eb: "D♯ / E♭",
  Gb: "F♯ / G♭",
  Ab: "G♯ / A♭",
  Bb: "A♯ / B♭",
};

export function allChordRows(
  quality: ChordQuality | "common" = "common",
  instrument: FrettedInstrument = BARITONE,
) {
  return CHROMATIC_ROOTS.map((root) => ({
    root,
    entries: (quality === "common"
      ? CHEAT_SHEET_COLUMNS.map((column) => column.quality)
      : [quality]
    ).map((quality) => sheetEntry(makeChord(root, quality), instrument)),
  }));
}

export function practiceSheet(
  tonic: string,
  instrument: FrettedInstrument = BARITONE,
  mode: Key["mode"] = "major",
) {
  const key: Key = { tonic: parseNote(tonic), mode };
  const triads = keyChords(key);
  const sevenths = keyChords(key, true);
  const rows = triads.map((item, index) => ({
    degree: item.degree,
    roman: item.roman,
    entries: [
      sheetEntry(item.chord, instrument),
      sheetEntry(sevenths[index].chord, instrument),
    ],
  }));
  // A deliberately small practice vocabulary, not a universal ranking of harmony.
  const targets = [4, 5, 1, 3, 2, 0, 6].filter((i) =>
    ["major", "minor"].includes(triads[i].chord.quality),
  );
  const applied = targets.map((index) => {
    const target = triads[index];
    const root = transpose(target.chord.root, {
      degree: 5,
      semitones: 7,
      label: "5",
    });
    return {
      ...sheetEntry(makeChord(root, "7"), instrument),
      roman: `V7/${target.roman}`,
      move: `→ ${target.chord.symbol}`,
      kind: "applied" as const,
    };
  });
  const home = triads[0].chord.symbol;
  const fourth = triads[3].chord.symbol;
  const related = targets.map((index) => ({
    ...sheetEntry(
      makeChord(
        transpose(triads[index].chord.root, {
          degree: 2,
          semitones: 2,
          label: "2",
        }),
        triads[index].chord.quality === "minor" ? "m7b5" : "m7",
      ),
      instrument,
    ),
    roman: `${triads[index].chord.quality === "minor" ? "iiø7" : "ii7"}/${triads[index].roman}`,
    move: `→ ${applied[targets.indexOf(index)].chord.symbol} → ${triads[index].chord.symbol}`,
    kind: "ii-v" as const,
  }));
  const diminished = targets.map((index) => ({
    ...sheetEntry(
      makeChord(
        transpose(triads[index].chord.root, {
          degree: 7,
          semitones: 11,
          label: "7",
        }),
        "dim7",
      ),
      instrument,
    ),
    roman: `vii°7/${triads[index].roman}`,
    move: `→ ${triads[index].chord.symbol}`,
    kind: "diminished" as const,
  }));
  const parallel: Key = {
    tonic: key.tonic,
    mode: mode === "major" ? "natural-minor" : "major",
  };
  const borrowed = [false, true].flatMap((sevenths) =>
    keyChords(parallel, sevenths).map((item, index) => ({
      ...sheetEntry(item.chord, instrument),
      roman: `${[2, 5, 6].includes(index) ? (mode === "major" ? "♭" : "♯") : ""}${item.roman}`,
      move: "",
      kind: "borrowed" as const,
    })),
  );
  const seen = new Set<string>();
  const nearby = [...applied, ...related, ...borrowed, ...diminished].filter(
    (entry) => {
      if (
        keyContext(entry.chord, key).fitsPitchClasses ||
        seen.has(entry.chord.id)
      )
        return false;
      seen.add(entry.chord.id);
      return true;
    },
  );
  const symbol = (i: number) => triads[i].chord.symbol;
  const dominant = makeChord(triads[4].chord.root, "7").symbol;
  const loops = [
    [home, fourth, dominant, home],
    [home, symbol(5), symbol(1), dominant, home],
    [home, applied[1].chord.symbol, symbol(5), fourth, dominant, home],
  ];
  return { key, rows, nearby, loops };
}
