import { analyzeCoverage } from "./analysis.ts";
import {
  CHORD_QUALITIES,
  type Chord,
  type FrettedInstrument,
  formatNote,
  type Key,
  keyContext,
  keyScale,
  makeChord,
  midi,
  type Pitch,
  type PitchClass,
  parseNote,
  pitchClassNumber,
} from "./index.ts";
import { realizePosition } from "./positions.ts";

export const FRET_MARKERS = [3, 5, 7, 10, 12] as const;

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

/** Preserve the written octave, including spellings such as B♯3 = C4. */
export function pitchAt(value: number, key: Key): Pitch {
  const note = noteAt(value, key);
  return { note, octave: (value - midi({ note, octave: 0 })) / 12 };
}

/** Unmarked strings stay open; null explicitly mutes a string. */
export function fretboardPitches(
  instrument: FrettedInstrument,
  frets: (number | null)[],
) {
  return realizePosition(instrument, frets).flatMap((position) =>
    position.midi === null ? [] : [position.midi],
  );
}

const catalogs = new Map<string, Chord[]>();
function recognitionCatalog(key: Key) {
  const id = `${formatNote(key.tonic)}/${key.mode}`;
  let chords = catalogs.get(id);
  if (!chords) {
    chords = Array.from({ length: 12 }, (_, pc) => noteAt(pc, key)).flatMap(
      (root) => CHORD_QUALITIES.map((quality) => makeChord(root, quality.id)),
    );
    if (catalogs.size >= 32)
      catalogs.delete(catalogs.keys().next().value as string);
    catalogs.set(id, chords);
  }
  return chords;
}

/** Exact matches rank first; permitted omissions must be requested explicitly. */
export function identifyChords(
  pitches: number[],
  key: Key,
  allowOmissions = false,
) {
  if (!pitches.length) return [];
  const bass = Math.min(...pitches) % 12;
  return recognitionCatalog(key)
    .filter((chord) => {
      const coverage = analyzeCoverage(chord, pitches);
      return coverage && (allowOmissions || coverage.kind === "exact");
    })
    .sort(
      (a, b) =>
        Number(analyzeCoverage(a, pitches)?.kind === "omitted") -
          Number(analyzeCoverage(b, pitches)?.kind === "omitted") ||
        Number(pitchClassNumber(b.root) === bass) -
          Number(pitchClassNumber(a.root) === bass) ||
        Number(keyContext(b, key).fitsPitchClasses) -
          Number(keyContext(a, key).fitsPitchClasses),
    )
    .map((chord) => ({
      chord,
      coverage: analyzeCoverage(chord, pitches),
      bass: formatNote(
        chord.tones.find((t) => pitchClassNumber(t.note) === bass)?.note ??
          noteAt(bass, key),
      ),
    }));
}

export function predictFretboard(
  instrument: FrettedInstrument,
  frets: (number | null)[],
  key: Key,
  maxFret = 12,
) {
  if (!Number.isInteger(maxFret) || maxFret < 0 || maxFret > 24)
    throw new Error("Invalid fret limit");
  return instrument.courses.map((_, index) =>
    [null, ...Array.from({ length: maxFret + 1 }, (_, f) => f)].map((fret) => {
      const candidate = frets.map((current, i) =>
        i === index ? fret : current,
      );
      return {
        fret,
        matches: identifyChords(
          fretboardPitches(instrument, candidate),
          key,
          true,
        ),
      };
    }),
  );
}
