export type Interval = { degree: number; semitones: number; label: string };
export type ChordGroup =
  | "triads"
  | "sevenths"
  | "sixths"
  | "sus2"
  | "sus4"
  | "added"
  | "ninths";
export type ChordFamily =
  | "major"
  | "minor"
  | "dominant"
  | "diminished"
  | "augmented"
  | "suspended";
type FormulaDefinition = {
  readonly id: string;
  readonly name: string;
  readonly suffix: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly family: ChordFamily;
  readonly group: ChordGroup;
  readonly optionalDegrees: readonly number[];
  readonly intervals: readonly Interval[];
};
const interval = (
  degree: number,
  semitones: number,
  label: string,
): Interval => ({ degree, semitones, label });
const R = interval(1, 0, "1");
const m3 = interval(3, 3, "♭3");
const M3 = interval(3, 4, "3");
const P5 = interval(5, 7, "5");
const d5 = interval(5, 6, "♭5");
const m7 = interval(7, 10, "♭7");
const M6 = interval(6, 9, "6");

export const CHORD_QUALITIES = [
  {
    id: "major",
    aliases: ["maj", "major", "M"],
    family: "major",
    group: "triads",
    optionalDegrees: [],
    name: "Major",
    suffix: "",
    description: "Root, major third, perfect fifth.",
    intervals: [R, M3, P5],
  },
  {
    id: "minor",
    aliases: ["min", "minor", "-"],
    family: "minor",
    group: "triads",
    optionalDegrees: [],
    name: "Minor",
    suffix: "m",
    description: "Root, minor third, perfect fifth.",
    intervals: [R, m3, P5],
  },
  {
    id: "7",
    aliases: ["dom7"],
    family: "dominant",
    group: "sevenths",
    optionalDegrees: [5],
    name: "Dominant seventh",
    suffix: "7",
    description:
      "A major triad with a minor seventh. Often resolves down a fifth.",
    intervals: [R, M3, P5, m7],
  },
  {
    id: "maj7",
    aliases: ["M7", "Δ7"],
    family: "major",
    group: "sevenths",
    optionalDegrees: [5],
    name: "Major seventh",
    suffix: "maj7",
    description:
      "A major triad with a major seventh, one semitone below the root.",
    intervals: [R, M3, P5, interval(7, 11, "7")],
  },
  {
    id: "m7",
    aliases: ["min7", "-7"],
    family: "minor",
    group: "sevenths",
    optionalDegrees: [5],
    name: "Minor seventh",
    suffix: "m7",
    description: "A minor triad with a minor seventh.",
    intervals: [R, m3, P5, m7],
  },
  {
    id: "6",
    aliases: ["maj6"],
    family: "major",
    group: "sixths",
    optionalDegrees: [5],
    name: "Major sixth",
    suffix: "6",
    description: "A major triad with an added major sixth. No seventh implied.",
    intervals: [R, M3, P5, M6],
  },
  {
    id: "m6",
    aliases: ["min6"],
    family: "minor",
    group: "sixths",
    optionalDegrees: [],
    name: "Minor sixth",
    suffix: "m6",
    description: "A minor triad with a major sixth—not a lowered sixth.",
    intervals: [R, m3, P5, M6],
  },
  {
    id: "sus2",
    aliases: [],
    family: "suspended",
    group: "sus2",
    optionalDegrees: [],
    name: "Suspended second",
    suffix: "sus2",
    description: "The second replaces the third; neither major nor minor.",
    intervals: [R, interval(2, 2, "2"), P5],
  },
  {
    id: "sus4",
    aliases: ["sus"],
    family: "suspended",
    group: "sus4",
    optionalDegrees: [],
    name: "Suspended fourth",
    suffix: "sus4",
    description: "The fourth replaces the third; neither major nor minor.",
    intervals: [R, interval(4, 5, "4"), P5],
  },
  {
    id: "add9",
    aliases: [],
    family: "major",
    group: "added",
    optionalDegrees: [5],
    name: "Added ninth",
    suffix: "add9",
    description:
      "A major triad with an added ninth. Unlike a 9 chord, there is no seventh.",
    intervals: [R, M3, P5, interval(9, 14, "9")],
  },
  {
    id: "dim",
    aliases: ["°"],
    family: "diminished",
    group: "triads",
    optionalDegrees: [],
    name: "Diminished",
    suffix: "dim",
    description: "A minor third and a diminished fifth above the root.",
    intervals: [R, m3, d5],
  },
  {
    id: "aug",
    aliases: ["+"],
    family: "augmented",
    group: "triads",
    optionalDegrees: [],
    name: "Augmented",
    suffix: "aug",
    description: "A major triad with a raised fifth.",
    intervals: [R, M3, interval(5, 8, "♯5")],
  },
  {
    id: "dim7",
    aliases: ["°7"],
    family: "diminished",
    group: "sevenths",
    optionalDegrees: [],
    name: "Diminished seventh",
    suffix: "dim7",
    description:
      "A diminished triad plus a diminished seventh, spelled as ♭♭7.",
    intervals: [R, m3, d5, interval(7, 9, "♭♭7")],
  },
  {
    id: "m7b5",
    aliases: ["m7b5", "ø", "ø7"],
    family: "diminished",
    group: "sevenths",
    optionalDegrees: [],
    name: "Half-diminished seventh",
    suffix: "m7♭5",
    description: "A diminished triad with a minor seventh; also written ø7.",
    intervals: [R, m3, d5, m7],
  },
  {
    id: "madd9",
    name: "Minor added ninth",
    suffix: "madd9",
    family: "minor",
    group: "added",
    aliases: [],
    intervals: [
      { degree: 1, semitones: 0, label: "1" },
      { degree: 3, semitones: 3, label: "♭3" },
      { degree: 5, semitones: 7, label: "5" },
      { degree: 9, semitones: 14, label: "9" },
    ],
    optionalDegrees: [],
    description:
      "A minor triad with an added ninth. The minor third stays; no seventh is implied.",
  },
  {
    id: "7sus4",
    name: "Suspended dominant seventh",
    suffix: "7sus4",
    family: "suspended",
    group: "sevenths",
    aliases: [],
    intervals: [
      { degree: 1, semitones: 0, label: "1" },
      { degree: 4, semitones: 5, label: "4" },
      { degree: 5, semitones: 7, label: "5" },
      { degree: 7, semitones: 10, label: "♭7" },
    ],
    optionalDegrees: [5],
    description:
      "The fourth replaces the third and a minor seventh is added. Try moving the fourth down to the major third.",
  },
  {
    id: "mMaj7",
    name: "Minor-major seventh",
    suffix: "mMaj7",
    family: "minor",
    group: "sevenths",
    aliases: [],
    intervals: [
      { degree: 1, semitones: 0, label: "1" },
      { degree: 3, semitones: 3, label: "♭3" },
      { degree: 5, semitones: 7, label: "5" },
      { degree: 7, semitones: 11, label: "7" },
    ],
    optionalDegrees: [5],
    description:
      "A minor triad with a major seventh. Compare m7: its seventh is one semitone lower.",
  },
  {
    id: "9",
    name: "Dominant ninth",
    suffix: "9",
    family: "dominant",
    group: "ninths",
    aliases: [],
    intervals: [
      { degree: 1, semitones: 0, label: "1" },
      { degree: 3, semitones: 4, label: "3" },
      { degree: 5, semitones: 7, label: "5" },
      { degree: 7, semitones: 10, label: "♭7" },
      { degree: 9, semitones: 14, label: "9" },
    ],
    optionalDegrees: [5],
    description:
      "A dominant seventh with a ninth. Unlike add9, it includes a minor seventh.",
  },
  {
    id: "maj9",
    name: "Major ninth",
    suffix: "maj9",
    family: "major",
    group: "ninths",
    aliases: [],
    intervals: [
      { degree: 1, semitones: 0, label: "1" },
      { degree: 3, semitones: 4, label: "3" },
      { degree: 5, semitones: 7, label: "5" },
      { degree: 7, semitones: 11, label: "7" },
      { degree: 9, semitones: 14, label: "9" },
    ],
    optionalDegrees: [5],
    description:
      "A major seventh with a ninth. Keep the major seventh: it distinguishes maj9 from add9 and 9.",
  },
  {
    id: "m9",
    name: "Minor ninth",
    suffix: "m9",
    family: "minor",
    group: "ninths",
    aliases: [],
    intervals: [
      { degree: 1, semitones: 0, label: "1" },
      { degree: 3, semitones: 3, label: "♭3" },
      { degree: 5, semitones: 7, label: "5" },
      { degree: 7, semitones: 10, label: "♭7" },
      { degree: 9, semitones: 14, label: "9" },
    ],
    optionalDegrees: [5],
    description:
      "A minor seventh with a ninth. Compare madd9, which does not include a seventh.",
  },
  {
    id: "6/9",
    name: "Sixth added ninth",
    suffix: "6/9",
    family: "major",
    group: "ninths",
    aliases: [],
    intervals: [
      { degree: 1, semitones: 0, label: "1" },
      { degree: 3, semitones: 4, label: "3" },
      { degree: 5, semitones: 7, label: "5" },
      { degree: 6, semitones: 9, label: "6" },
      { degree: 9, semitones: 14, label: "9" },
    ],
    optionalDegrees: [5],
    description:
      "A major triad with both a sixth and a ninth. There is no seventh; the slash here is not a bass note.",
  },
] as const satisfies readonly FormulaDefinition[];

export type ChordQuality = (typeof CHORD_QUALITIES)[number]["id"];
export type ChordFormula = FormulaDefinition & { readonly id: ChordQuality };
export function chordFormula(quality: ChordQuality): ChordFormula {
  const formula = CHORD_QUALITIES.find((entry) => entry.id === quality);
  if (!formula) throw new Error(`Unknown chord quality: ${quality}`);
  return formula;
}
export const QUALITY_ALIASES: Readonly<Record<string, ChordQuality>> =
  Object.freeze(
    Object.fromEntries(
      CHORD_QUALITIES.flatMap((formula) =>
        [formula.suffix, ...formula.aliases].map((alias) => [
          alias.replaceAll("♭", "b").replaceAll("♯", "#"),
          formula.id,
        ]),
      ),
    ),
  );
