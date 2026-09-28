import { type FrettedInstrument, INSTRUMENTS } from "./index.ts";

export function voicingHref(
  instrument: FrettedInstrument,
  frets: readonly (number | null)[],
  chord?: string,
) {
  const params = new URLSearchParams({
    instrument: instrument.id,
    frets: frets.map((f) => f ?? "x").join(","),
  });
  if (chord) params.set("chord", chord);
  return `/music/fretboard?${params}`;
}

export function parseVoicingLink(params: URLSearchParams) {
  const instrument = INSTRUMENTS.find((i) => i.id === params.get("instrument"));
  const raw = params.get("frets");
  if (!instrument || !raw || !/^(x|\d+)(,(x|\d+))*$/.test(raw)) return null;
  const frets = raw.split(",").map((f) => (f === "x" ? null : Number(f)));
  if (
    frets.length !== instrument.courses.length ||
    frets.some((f) => f !== null && (f < 0 || f > 24))
  )
    return null;
  return { instrument, frets };
}

export function chordHref(
  instrument: FrettedInstrument,
  frets: readonly (number | null)[],
  chord: string,
) {
  return voicingHref(instrument, frets, chord).replace(
    "/music/fretboard?",
    "/music/chord?",
  );
}
