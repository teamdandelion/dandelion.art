import { analyzeCoverage } from "./analysis.ts";
import {
  type Chord,
  type Fingering,
  type FrettedInstrument,
  midi,
  pitchClassNumber,
  realizeFingering,
} from "./index.ts";

/** Bounded candidate search, not a claim of human-verified playability. */
export function generateFingerings(
  chord: Chord,
  instrument: FrettedInstrument,
  maxFret = 24,
): Fingering[] {
  if (
    !Number.isInteger(maxFret) ||
    maxFret < 0 ||
    maxFret > 24 ||
    instrument.courses.length > 6
  )
    throw new Error("Unsupported search range");
  const allowed = new Set(chord.tones.map((t) => pitchClassNumber(t.note)));
  const choices = instrument.courses.map((course) =>
    Array.from({ length: maxFret + 1 }, (_, f) => f).filter((f) =>
      course.strings.every((s) => allowed.has((midi(s.open) + f) % 12)),
    ),
  );
  const result: Fingering[] = [];
  const visit = (
    frets: (number | null)[],
    low: number,
    high: number,
    ended: boolean,
  ) => {
    if (frets.length === choices.length) {
      if (frets.every((f) => f === null)) return;
      const shape = realizeFingering(chord, frets, instrument);
      if (
        !analyzeCoverage(
          chord,
          shape.voicing.voices.map((v) => midi(v.pitch)),
        )
      )
        return;
      const stopped = frets.filter((f): f is number => f !== null && f > 0);
      // More than four independent stopped positions needs an unmodeled technique.
      if (new Set(stopped).size > 4) return;
      shape.score =
        Math.max(0, ...stopped) * 2 +
        (stopped.length ? Math.max(...stopped) - Math.min(...stopped) : 0) * 3 +
        stopped.length +
        frets.filter((f) => f === null).length * 8;
      result.push(shape);
      return;
    }
    // Only leading/trailing mutes: avoid hidden inner-string muting assumptions.
    visit([...frets, null], low, high, ended || frets.some((f) => f !== null));
    if (ended) return;
    for (const fret of choices[frets.length]) {
      const nextLow = fret > 0 ? Math.min(low, fret) : low;
      const nextHigh = fret > 0 ? Math.max(high, fret) : high;
      if (nextHigh - nextLow > 3) continue;
      visit([...frets, fret], nextLow, nextHigh, false);
    }
  };
  visit([], Infinity, 0, false);
  return result.sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));
}
