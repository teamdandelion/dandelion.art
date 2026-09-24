import { chordFormula } from "./catalog.ts";
import {
  bassPitch,
  type Chord,
  formatNote,
  type PitchClass,
  parseChord,
  parseNote,
  pitchClassNumber,
  type Voicing,
} from "./index.ts";

export type ChordSelection = { chord: Chord; bass?: PitchClass };
export type ChordCoverage = {
  kind: "exact" | "omitted";
  omittedDegrees: number[];
};

/** Root and defining tones are required; only catalog-declared omissions qualify. */
export function analyzeCoverage(
  chord: Chord,
  pitches: readonly number[],
): ChordCoverage | null {
  if (!pitches.length) return null;
  const pcs = new Set(pitches.map((p) => ((p % 12) + 12) % 12));
  if (
    [...pcs].some(
      (pc) => !chord.tones.some((t) => pitchClassNumber(t.note) === pc),
    )
  )
    return null;
  const missing = chord.tones.filter((t) => !pcs.has(pitchClassNumber(t.note)));
  if (
    missing.some(
      (t) => !chordFormula(chord.quality).optionalDegrees.includes(t.degree),
    )
  )
    return null;
  return {
    kind: missing.length ? "omitted" : "exact",
    omittedDegrees: missing.map((t) => t.degree),
  };
}

export function parseChordSelection(value: string): ChordSelection | null {
  // The suffix may itself contain a slash (6/9); only a final note is a bass request.
  const match = /^(.*)\/([A-Ga-g][#b♯♭]{0,2})$/.exec(value.trim());
  const chord = parseChord(match ? match[1] : value);
  if (!chord) return null;
  if (!match) return { chord };
  try {
    const bass = parseNote(match[2]);
    if (
      !chord.tones.some(
        (t) => pitchClassNumber(t.note) === pitchClassNumber(bass),
      )
    )
      return null;
    return { chord, bass };
  } catch {
    return null;
  }
}

export function voicingSymbol(chord: Chord, voicing: Voicing): string {
  const bass = bassPitch(voicing).note;
  return (
    chord.symbol +
    (pitchClassNumber(bass) === pitchClassNumber(chord.root)
      ? ""
      : `/${formatNote(bass)}`)
  );
}
