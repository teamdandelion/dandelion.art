import {
  type Chord,
  type Fingering,
  type FrettedInstrument,
  findFingerings,
  makeChord,
  parseNote,
  pitchClassNumber,
  realizeFingering,
} from "./index.ts";

export type VoicingQuery = { maxFret?: number; bass?: number };
const roots = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/** Only wholly stopped shapes are movable without changing finger technique. */
export function transposeShape(
  source: Fingering,
  semitones: number,
  chord: Chord,
  instrument: FrettedInstrument,
  maxFret = 24,
): Fingering | null {
  if (!Number.isInteger(semitones) || source.frets.some((f) => f === 0))
    return null;
  const frets = source.frets.map((f) => (f === null ? null : f + semitones));
  if (frets.some((f) => f !== null && (f <= 0 || f > maxFret))) return null;
  const result = realizeFingering(chord, frets, instrument);
  result.fingers = [...source.fingers];
  result.barres = source.barres.map((b) => ({
    ...b,
    fret: b.fret + semitones,
  }));
  result.source = "transposed";
  result.library = source.library;
  result.transposition = { sourceId: source.id, semitones };
  return result;
}

/** Library defaults first; deduplication never changes their relative order. */
export function movableFingerings(
  chord: Chord,
  instrument: FrettedInstrument,
  maxFret = 24,
): Fingering[] {
  if (!Number.isInteger(maxFret) || maxFret < 0 || maxFret > 24)
    throw new Error("Invalid fret limit");
  const result = new Map<string, Fingering>();
  const add = (shape: Fingering) => {
    const key = shape.frets.map((f) => f ?? "x").join(",");
    if (!result.has(key)) result.set(key, shape);
  };
  for (const shape of findFingerings(chord, instrument)) {
    if (shape.frets.every((f) => f === null || f <= maxFret)) add(shape);
  }
  for (const root of roots) {
    const sourceChord = makeChord(root, chord.quality);
    const delta =
      (pitchClassNumber(chord.root) - pitchClassNumber(parseNote(root)) + 12) %
      12;
    for (const source of findFingerings(sourceChord, instrument)) {
      if (source.source !== "library") continue;
      for (let shift = delta - 24; shift <= 24; shift += 12) {
        const shape = transposeShape(source, shift, chord, instrument, maxFret);
        if (shape) add(shape);
      }
    }
  }
  return [...result.values()];
}
