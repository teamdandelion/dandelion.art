import { type FrettedInstrument, midi } from "./index.ts";

export type FrettedPosition = readonly (number | null)[];
export type SoundingString = {
  readonly courseNumber: number;
  readonly stringNumber: number;
  readonly fret: number | null;
  readonly midi: number | null;
};

/** Physical sound is independent of any chord interpretation. */
export function realizePosition(
  instrument: FrettedInstrument,
  frets: FrettedPosition,
  maxFret = 24,
): SoundingString[] {
  if (
    frets.length !== instrument.courses.length ||
    frets.some(
      (fret) =>
        fret !== null &&
        (!Number.isInteger(fret) || fret < 0 || fret > maxFret),
    )
  ) {
    throw new Error("Invalid fretboard positions");
  }
  return instrument.courses.flatMap((course, index) =>
    course.strings.map((string) => ({
      courseNumber: course.number,
      stringNumber: string.number,
      fret: frets[index],
      midi: frets[index] === null ? null : midi(string.open) + frets[index],
    })),
  );
}
