import {
  CHORD_QUALITIES,
  type ChordQuality,
  type Interval,
  QUALITY_ALIASES,
} from "./catalog.ts";
import { generateFingerings } from "./generation.ts";

export {
  CHORD_QUALITIES,
  type ChordFormula,
  type ChordGroup,
  type ChordQuality,
  chordFormula,
  type Interval,
} from "./catalog.ts";

import { GUITAR_SHAPES } from "./data/guitar-shapes.ts";
import { LIBRARY_REVISION, UKULELE_SHAPES } from "./data/ukulele-shapes.ts";
import { realizePosition } from "./positions.ts";

/** Small, instrument-independent music model. All pitches use 12-tone equal temperament. */
export type Letter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type PitchClass = { step: Letter; alter: number };
export type Pitch = { note: PitchClass; octave: number };
export type Chord = {
  id: string;
  root: PitchClass;
  quality: ChordQuality;
  symbol: string;
  name: string;
  tones: { degree: number; label: string; note: PitchClass }[];
};
export type Voice = { id: string; pitch: Pitch; toneDegree: number };
export type Voicing = { id: string; chordId: string; voices: Voice[] };
export type FrettedCourse = {
  number: number;
  strings: { number: number; open: Pitch }[];
};
export type FrettedInstrument = {
  id: string;
  name: string;
  courses: FrettedCourse[];
};
export type Fingering = {
  id: string;
  chordId: string;
  instrumentId: string;
  frets: (number | null)[];
  fingers: (1 | 2 | 3 | 4 | null)[];
  barres: {
    fret: number;
    finger: 1 | 2 | 3 | 4;
    fromCourse: number;
    toCourse: number;
  }[];
  strings: {
    courseNumber: number;
    stringNumber: number;
    fret: number | null;
    voiceId: string | null;
  }[];
  voicing: Voicing;
  startFret: number;
  source: "library" | "transposed" | "generated";
  transposition?: { sourceId: string; semitones: number };
  library?: { chord: string; position: number; revision: string };
  score: number;
};
export type Key = { tonic: PitchClass; mode: "major" | "natural-minor" };
export type KeyChord = { chord: Chord; degree: number; roman: string };
export type KeyGraph = {
  context: Key;
  nodes: KeyChord[];
  edges: {
    source: string;
    target: string;
    kind: "shared-tones";
    sharedTones: PitchClass[];
  }[];
};

const LETTERS: Letter[] = ["C", "D", "E", "F", "G", "A", "B"];
const NATURAL: Record<Letter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];
const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

export const ROOT_OPTIONS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];
export const KEY_OPTIONS = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "F",
  "Bb",
  "Eb",
  "Ab",
  "Db",
];

export function parseNote(value: string): PitchClass {
  const match = /^([A-Ga-g])([#b]{0,2})$/.exec(
    value.trim().replaceAll("♯", "#").replaceAll("♭", "b"),
  );
  if (!match || (match[2].includes("#") && match[2].includes("b")))
    throw new Error(`Invalid note: ${value}`);
  return {
    step: match[1].toUpperCase() as Letter,
    alter: [...match[2]].reduce(
      (sum, mark) => sum + (mark === "#" ? 1 : -1),
      0,
    ),
  };
}

export function formatNote(note: PitchClass): string {
  return (
    note.step +
    (note.alter > 0 ? "♯".repeat(note.alter) : "♭".repeat(-note.alter))
  );
}

export function formatPitch(pitch: Pitch): string {
  return `${formatNote(pitch.note)}${pitch.octave}`;
}

export function pitchClassNumber(note: PitchClass): number {
  return mod(NATURAL[note.step] + note.alter, 12);
}

export function midi(pitch: Pitch): number {
  // Do not reduce to pitch class first: B♯3 is C4, while C♭4 is B3.
  return 12 * (pitch.octave + 1) + NATURAL[pitch.note.step] + pitch.note.alter;
}

export function transpose(root: PitchClass, distance: Interval): PitchClass {
  const start = LETTERS.indexOf(root.step);
  const steps = start + distance.degree - 1;
  const step = LETTERS[mod(steps, 7)];
  const naturalTarget = NATURAL[step] + 12 * Math.floor(steps / 7);
  return {
    step,
    alter: NATURAL[root.step] + root.alter + distance.semitones - naturalTarget,
  };
}

export function makeChord(
  root: string | PitchClass,
  quality: ChordQuality,
): Chord {
  const note = typeof root === "string" ? parseNote(root) : root;
  const formula = CHORD_QUALITIES.find((entry) => entry.id === quality);
  if (!formula) throw new Error(`Unknown chord quality: ${quality}`);
  return {
    id: `${note.step}${note.alter}:${quality}`,
    root: { ...note },
    quality,
    symbol: formatNote(note) + formula.suffix,
    name: `${formatNote(note)} ${formula.name.toLowerCase()}`,
    tones: formula.intervals.map((tone) => ({
      degree: tone.degree,
      label: tone.label,
      note: transpose(note, tone),
    })),
  };
}

export function parseChord(query: string): Chord | null {
  const value = query
    .trim()
    .replaceAll("♯", "#")
    .replaceAll("♭", "b")
    .replace(/\s+/g, "");
  const match = /^([A-Ga-g](?:#{1,2}|b{1,2})?)(.*)$/.exec(value);
  if (!match) return null;
  const quality = Object.hasOwn(QUALITY_ALIASES, match[2])
    ? QUALITY_ALIASES[match[2]]
    : undefined;
  return quality ? makeChord(match[1], quality) : null;
}

export const BARITONE: FrettedInstrument = {
  id: "baritone-dgbe",
  name: "Baritone ukulele",
  courses: [
    {
      number: 4,
      strings: [{ number: 4, open: { note: parseNote("D"), octave: 3 } }],
    },
    {
      number: 3,
      strings: [{ number: 3, open: { note: parseNote("G"), octave: 3 } }],
    },
    {
      number: 2,
      strings: [{ number: 2, open: { note: parseNote("B"), octave: 3 } }],
    },
    {
      number: 1,
      strings: [{ number: 1, open: { note: parseNote("E"), octave: 4 } }],
    },
  ],
};

function standardInstrument(
  id: string,
  name: string,
  tuning: [string, number][],
): FrettedInstrument {
  return {
    id,
    name,
    courses: tuning.map(([note, octave], i) => ({
      number: tuning.length - i,
      strings: [
        { number: tuning.length - i, open: { note: parseNote(note), octave } },
      ],
    })),
  };
}
export const UKULELE = standardInstrument("ukulele-gcea", "Ukulele", [
  ["G", 4],
  ["C", 4],
  ["E", 4],
  ["A", 4],
]);
export const GUITAR = standardInstrument("guitar-eadgbe", "Guitar", [
  ["E", 2],
  ["A", 2],
  ["D", 3],
  ["G", 3],
  ["B", 3],
  ["E", 4],
]);
export const INSTRUMENTS = [GUITAR, UKULELE, BARITONE];

function pitchAtMidi(note: PitchClass, value: number): Pitch {
  return {
    note: { ...note },
    octave: (value - NATURAL[note.step] - note.alter) / 12 - 1,
  };
}

/** One fret applies to a whole course; every sounding physical string has its own voice. */
export function realizeFingering(
  chord: Chord,
  frets: (number | null)[],
  instrument: FrettedInstrument = BARITONE,
): Fingering {
  const id = `${instrument.id}/${chord.id}/${frets.map((fret) => fret ?? "x").join("-")}`;
  const voices: Voice[] = [];
  const strings = realizePosition(instrument, frets).map((position) => {
    if (position.midi === null)
      return {
        courseNumber: position.courseNumber,
        stringNumber: position.stringNumber,
        fret: position.fret,
        voiceId: null,
      };
    const tone = chord.tones.find(
      (t) => pitchClassNumber(t.note) === mod(position.midi as number, 12),
    );
    if (!tone)
      throw new Error(
        `String ${position.stringNumber} is not a tone of ${chord.symbol}.`,
      );
    const voiceId = `string-${position.stringNumber}`;
    voices.push({
      id: voiceId,
      pitch: pitchAtMidi(tone.note, position.midi),
      toneDegree: tone.degree,
    });
    return {
      courseNumber: position.courseNumber,
      stringNumber: position.stringNumber,
      fret: position.fret,
      voiceId,
    };
  });
  if (!voices.length)
    throw new Error("A voicing must sound at least one note.");
  const stopped = frets.filter(
    (fret): fret is number => fret !== null && fret > 0,
  );
  return {
    id,
    chordId: chord.id,
    instrumentId: instrument.id,
    frets: [...frets],
    fingers: frets.map(() => null),
    barres: [],
    strings,
    voicing: { id: `${id}/voicing`, chordId: chord.id, voices },
    startFret:
      stopped.length && Math.max(...stopped) > 4 ? Math.min(...stopped) : 1,
    source: "generated",
    score: 0,
  };
}

export function voicingCoverage(voicing: Voicing, chord: Chord) {
  const counts = new Map<number, number>();
  for (const voice of voicing.voices)
    counts.set(voice.toneDegree, (counts.get(voice.toneDegree) ?? 0) + 1);
  return {
    present: chord.tones
      .filter((tone) => counts.has(tone.degree))
      .map((tone) => tone.degree),
    omitted: chord.tones
      .filter((tone) => !counts.has(tone.degree))
      .map((tone) => tone.degree),
    doubled: chord.tones
      .filter((tone) => (counts.get(tone.degree) ?? 0) > 1)
      .map((tone) => tone.degree),
  };
}

export function bassPitch(voicing: Voicing): Pitch {
  if (!voicing.voices.length)
    throw new Error("Cannot find the bass of an empty voicing.");
  return voicing.voices.reduce((lowest, voice) =>
    midi(voice.pitch) < midi(lowest.pitch) ? voice : lowest,
  ).pitch;
}

export function inversionName(voicing: Voicing, chord: Chord): string {
  const bass = bassPitch(voicing);
  const index = chord.tones.findIndex(
    (tone) => pitchClassNumber(tone.note) === pitchClassNumber(bass.note),
  );
  if (index === 0) return "Root position";
  if (index < 0) return `${formatNote(bass.note)} bass (non-chord tone)`;
  if (![1, 3, 5, 7].includes(chord.tones[index].degree))
    return `${formatNote(bass.note)} in the bass`;
  return (
    ["Root position", "First inversion", "Second inversion", "Third inversion"][
      index
    ] ?? `${formatNote(bass.note)} in the bass`
  );
}

/** Separate piano realization; do not silently replace an instrument's actual voicing. */
export function pianoVoicing(
  chord: Chord,
  inversion: number,
  baseOctave = 4,
): Voicing {
  if (
    !Number.isInteger(inversion) ||
    inversion < 0 ||
    inversion >= chord.tones.length
  )
    throw new Error("Invalid inversion.");
  const bassClass = pitchClassNumber(chord.tones[inversion].note);
  const ordered = [...chord.tones].sort(
    (a, b) =>
      mod(pitchClassNumber(a.note) - bassClass, 12) -
      mod(pitchClassNumber(b.note) - bassClass, 12),
  );
  let last = midi({ note: chord.root, octave: baseOctave }) - 1;
  const voices = ordered.map((tone, index) => {
    let value = pitchClassNumber(tone.note) + 12 * Math.floor((last + 1) / 12);
    if (value <= last) value += 12;
    last = value;
    return {
      id: `piano-${index}`,
      pitch: pitchAtMidi(tone.note, value),
      toneDegree: tone.degree,
    };
  });
  return {
    id: `${chord.id}/piano/${baseOctave}/${inversion}`,
    chordId: chord.id,
    voices,
  };
}

const fingeringCache = new Map<string, Fingering[]>();

/** Canonical library positions for standard tunings; generated fallback for other tunings. */
export function findFingerings(
  chord: Chord,
  instrument: FrettedInstrument = BARITONE,
): Fingering[] {
  const cacheKey = `${JSON.stringify(instrument)}/${chord.id}`;
  const cached = fingeringCache.get(cacheKey);
  if (cached) return cached;
  const isBaritone =
    instrument.courses.length === 4 &&
    instrument.courses.every(
      (course, index) =>
        course.strings.length > 0 &&
        course.strings.every(
          (string) =>
            pitchClassNumber(string.open.note) === [2, 7, 11, 4][index],
        ),
    );
  const hasTuning = (notes: number[]) =>
    instrument.courses.length === notes.length &&
    instrument.courses.every((course, i) =>
      course.strings.every((s) => pitchClassNumber(s.open.note) === notes[i]),
    );
  const isUkulele = hasTuning([7, 0, 4, 9]);
  const isGuitar = hasTuning([4, 9, 2, 7, 11, 4]);
  if (isBaritone || isUkulele || isGuitar) {
    // GCEA chord names are a fourth above the same physical shape on DGBE.
    // Recompute every voice from the real instrument, not upstream MIDI/bass data.
    const root = [
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
    ][mod(pitchClassNumber(chord.root) + (isBaritone ? 5 : 0), 12)];
    const libraryChord = `${root}:${chord.quality}`;
    const result = (
      (isGuitar ? GUITAR_SHAPES : UKULELE_SHAPES)[libraryChord] ?? []
    ).map((position, index) => {
      const shape = realizeFingering(chord, position.frets, instrument);
      shape.source = "library";
      shape.library = {
        chord: libraryChord,
        position: index + 1,
        revision: LIBRARY_REVISION,
      };
      shape.fingers = position.fingers.map((finger) =>
        finger === 0 ? null : (finger as 1 | 2 | 3 | 4),
      );
      shape.barres = position.barres.map((fret) => {
        const finger = position.fingers.find(
          (finger, i) =>
            finger > 0 &&
            position.frets[i] === fret &&
            position.fingers.filter(
              (other, j) => other === finger && position.frets[j] === fret,
            ).length > 1,
        );
        if (!finger)
          throw new Error(`Missing barre finger: ${libraryChord}/${index + 1}`);
        const courses = position.frets.flatMap((value, i) =>
          value === fret && position.fingers[i] === finger
            ? [instrument.courses[i].number]
            : [],
        );
        return {
          fret,
          finger: finger as 1 | 2 | 3 | 4,
          fromCourse: courses[0],
          toCourse: courses[courses.length - 1],
        };
      });
      return shape;
    });
    const available = result.length
      ? result
      : generateFingerings(chord, instrument, 12).slice(0, 12);
    fingeringCache.set(cacheKey, available);
    return available;
  }
  const result = generateFingerings(chord, instrument, 12).slice(0, 12);
  fingeringCache.set(cacheKey, result);
  return result;
}

export function keyScale(key: Key): PitchClass[] {
  return (key.mode === "major" ? MAJOR : MINOR).map((semitones, index) =>
    transpose(key.tonic, { degree: index + 1, semitones, label: "" }),
  );
}

export function keyContext(chord: Chord, key: Key) {
  const scale = new Set(keyScale(key).map(pitchClassNumber));
  const outside = chord.tones
    .filter((tone) => !scale.has(pitchClassNumber(tone.note)))
    .map((tone) => tone.note);
  // Enharmonic spellings can fit sonically without being the key's written chord.
  return { fitsPitchClasses: outside.length === 0, outside };
}

export function keyChords(key: Key, sevenths = false): KeyChord[] {
  const scale = keyScale(key);
  const qualities: ChordQuality[] =
    key.mode === "major"
      ? sevenths
        ? ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"]
        : ["major", "minor", "minor", "major", "major", "minor", "dim"]
      : sevenths
        ? ["m7", "m7b5", "maj7", "m7", "m7", "maj7", "7"]
        : ["minor", "dim", "major", "minor", "minor", "major", "major"];
  const roman =
    key.mode === "major"
      ? sevenths
        ? ["Imaj7", "ii7", "iii7", "IVmaj7", "V7", "vi7", "viiø7"]
        : ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
      : sevenths
        ? ["i7", "iiø7", "IIImaj7", "iv7", "v7", "VImaj7", "VII7"]
        : ["i", "ii°", "III", "iv", "v", "VI", "VII"];
  return scale.map((note, index) => ({
    chord: makeChord(note, qualities[index]),
    degree: index + 1,
    roman: roman[index],
  }));
}

/** Undirected structural relations. These edges do not claim harmonic resolution. */
export function keyGraph(key: Key, sevenths = false): KeyGraph {
  const nodes = keyChords(key, sevenths);
  const edges: KeyGraph["edges"] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const other = new Set(
        nodes[j].chord.tones.map((tone) => pitchClassNumber(tone.note)),
      );
      const sharedTones = nodes[i].chord.tones
        .filter((tone) => other.has(pitchClassNumber(tone.note)))
        .map((tone) => tone.note);
      if (sharedTones.length)
        edges.push({
          source: nodes[i].chord.id,
          target: nodes[j].chord.id,
          kind: "shared-tones",
          sharedTones,
        });
    }
  }
  return { context: key, nodes, edges };
}
