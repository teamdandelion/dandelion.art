import {
  CHORD_QUALITIES,
  type FrettedInstrument,
  formatNote,
  type Key,
  keyContext,
  keyScale,
  makeChord,
  midi,
  type PitchClass,
  parseNote,
  pitchClassNumber,
} from "./index.ts";

export function noteAt(value: number, key: Key): PitchClass {
  const pc = ((value % 12) + 12) % 12;
  const scale = keyScale(key);
  return (
    scale.find((note) => pitchClassNumber(note) === pc) ??
    parseNote(
      (scale.some((note) => note.alter < 0)
        ? ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
        : ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])[
        pc
      ],
    )
  );
}

/** Unmarked strings stay open; null explicitly mutes a string. */
export function fretboardPitches(
  instrument: FrettedInstrument,
  frets: (number | null)[],
) {
  if (
    frets.length !== instrument.courses.length ||
    frets.some((f) => f !== null && (!Number.isInteger(f) || f < 0 || f > 24))
  )
    throw new Error("Invalid fretboard positions");
  return instrument.courses.flatMap((course, i) =>
    frets[i] === null
      ? []
      : course.strings.map(
          (string) => midi(string.open) + (frets[i] as number),
        ),
  );
}

/** Exact pitch-class matches only: no implied roots, omitted notes, or guessed extensions. */
export function identifyChords(pitches: number[], key: Key) {
  if (!pitches.length) return [];
  const pcs = new Set(pitches.map((p) => ((p % 12) + 12) % 12));
  const bass = Math.min(...pitches) % 12;
  return Array.from({ length: 12 }, (_, pc) => noteAt(pc, key))
    .flatMap((root) =>
      CHORD_QUALITIES.map((quality) => makeChord(root, quality.id)),
    )
    .filter(
      (chord) =>
        chord.tones.length === pcs.size &&
        chord.tones.every((tone) => pcs.has(pitchClassNumber(tone.note))),
    )
    .sort(
      (a, b) =>
        Number(pitchClassNumber(b.root) === bass) -
          Number(pitchClassNumber(a.root) === bass) ||
        Number(keyContext(b, key).fitsPitchClasses) -
          Number(keyContext(a, key).fitsPitchClasses),
    )
    .map((chord) => ({
      chord,
      bass: formatNote(
        chord.tones.find((t) => pitchClassNumber(t.note) === bass)?.note ??
          noteAt(bass, key),
      ),
    }));
}
