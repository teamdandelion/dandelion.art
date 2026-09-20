import { LIBRARY_REVISION, UKULELE_SHAPES } from "./data/ukulele-shapes.ts";

/** Small, instrument-independent music model. All pitches use 12-tone equal temperament. */
export type Letter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type PitchClass = { step: Letter; alter: number };
export type Pitch = { note: PitchClass; octave: number };
export type Interval = { degree: number; semitones: number; label: string };
export type ChordQuality =
  | "major"
  | "minor"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4"
  | "7"
  | "maj7"
  | "m7"
  | "dim7"
  | "m7b5"
  | "6"
  | "m6"
  | "add9";
export type ChordFormula = {
  id: ChordQuality;
  name: string;
  suffix: string;
  description: string;
  intervals: Interval[];
};
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
  source: "library" | "generated";
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

export const CHORD_QUALITIES: ChordFormula[] = [
  {
    id: "major",
    name: "Major",
    suffix: "",
    description: "Root, major third, perfect fifth.",
    intervals: [R, M3, P5],
  },
  {
    id: "minor",
    name: "Minor",
    suffix: "m",
    description: "Root, minor third, perfect fifth.",
    intervals: [R, m3, P5],
  },
  {
    id: "7",
    name: "Dominant seventh",
    suffix: "7",
    description:
      "A major triad with a minor seventh. Often resolves down a fifth.",
    intervals: [R, M3, P5, m7],
  },
  {
    id: "maj7",
    name: "Major seventh",
    suffix: "maj7",
    description:
      "A major triad with a major seventh, one semitone below the root.",
    intervals: [R, M3, P5, interval(7, 11, "7")],
  },
  {
    id: "m7",
    name: "Minor seventh",
    suffix: "m7",
    description: "A minor triad with a minor seventh.",
    intervals: [R, m3, P5, m7],
  },
  {
    id: "6",
    name: "Major sixth",
    suffix: "6",
    description: "A major triad with an added major sixth. No seventh implied.",
    intervals: [R, M3, P5, M6],
  },
  {
    id: "m6",
    name: "Minor sixth",
    suffix: "m6",
    description: "A minor triad with a major sixth—not a lowered sixth.",
    intervals: [R, m3, P5, M6],
  },
  {
    id: "sus2",
    name: "Suspended second",
    suffix: "sus2",
    description: "The second replaces the third; neither major nor minor.",
    intervals: [R, interval(2, 2, "2"), P5],
  },
  {
    id: "sus4",
    name: "Suspended fourth",
    suffix: "sus4",
    description: "The fourth replaces the third; neither major nor minor.",
    intervals: [R, interval(4, 5, "4"), P5],
  },
  {
    id: "add9",
    name: "Added ninth",
    suffix: "add9",
    description:
      "A major triad with an added ninth. Unlike a 9 chord, there is no seventh.",
    intervals: [R, M3, P5, interval(9, 14, "9")],
  },
  {
    id: "dim",
    name: "Diminished",
    suffix: "dim",
    description: "A minor third and a diminished fifth above the root.",
    intervals: [R, m3, d5],
  },
  {
    id: "aug",
    name: "Augmented",
    suffix: "aug",
    description: "A major triad with a raised fifth.",
    intervals: [R, M3, interval(5, 8, "♯5")],
  },
  {
    id: "dim7",
    name: "Diminished seventh",
    suffix: "dim7",
    description:
      "A diminished triad plus a diminished seventh, spelled as ♭♭7.",
    intervals: [R, m3, d5, interval(7, 9, "♭♭7")],
  },
  {
    id: "m7b5",
    name: "Half-diminished seventh",
    suffix: "m7♭5",
    description: "A diminished triad with a minor seventh; also written ø7.",
    intervals: [R, m3, d5, m7],
  },
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

const QUALITY_ALIASES: Record<string, ChordQuality> = {
  "": "major",
  maj: "major",
  major: "major",
  M: "major",
  m: "minor",
  min: "minor",
  minor: "minor",
  "-": "minor",
  "7": "7",
  dom7: "7",
  maj7: "maj7",
  M7: "maj7",
  Δ7: "maj7",
  m7: "m7",
  min7: "m7",
  "-7": "m7",
  "6": "6",
  maj6: "6",
  m6: "m6",
  min6: "m6",
  sus2: "sus2",
  sus4: "sus4",
  sus: "sus4",
  add9: "add9",
  dim: "dim",
  "°": "dim",
  aug: "aug",
  "+": "aug",
  dim7: "dim7",
  "°7": "dim7",
  m7b5: "m7b5",
  ø: "m7b5",
  ø7: "m7b5",
};

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

/** Four fretted courses, six physical strings. The G course doubles at the octave. */
export const SIX_STRING_BARITONE: FrettedInstrument = {
  id: "baritone-six-string-dg-gbe-e",
  name: "6-string baritone ukulele",
  courses: [
    {
      number: 4,
      strings: [{ number: 6, open: { note: parseNote("D"), octave: 3 } }],
    },
    {
      number: 3,
      strings: [
        { number: 5, open: { note: parseNote("G"), octave: 3 } },
        { number: 4, open: { note: parseNote("G"), octave: 4 } },
      ],
    },
    {
      number: 2,
      strings: [{ number: 3, open: { note: parseNote("B"), octave: 3 } }],
    },
    {
      number: 1,
      strings: [
        { number: 2, open: { note: parseNote("E"), octave: 4 } },
        { number: 1, open: { note: parseNote("E"), octave: 4 } },
      ],
    },
  ],
};

export const INSTRUMENTS = [BARITONE, SIX_STRING_BARITONE];

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
  if (frets.length !== instrument.courses.length)
    throw new Error("One fret or mute is required per course.");
  const id = `${instrument.id}/${chord.id}/${frets.map((fret) => fret ?? "x").join("-")}`;
  const voices: Voice[] = [];
  const strings = instrument.courses.flatMap((course, index) => {
    const fret = frets[index];
    if (fret !== null && (!Number.isInteger(fret) || fret < 0))
      throw new Error("Frets must be non-negative integers or null.");
    return course.strings.map((string) => {
      const position = {
        courseNumber: course.number,
        stringNumber: string.number,
        fret,
      };
      if (fret === null) return { ...position, voiceId: null };
      const value = midi(string.open) + fret;
      const tone = chord.tones.find(
        (candidate) => pitchClassNumber(candidate.note) === mod(value, 12),
      );
      if (!tone)
        throw new Error(
          `String ${string.number} is not a tone of ${chord.symbol}.`,
        );
      const voiceId = `string-${string.number}`;
      voices.push({
        id: voiceId,
        pitch: pitchAtMidi(tone.note, value),
        toneDegree: tone.degree,
      });
      return { ...position, voiceId };
    });
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

/** Canonical library positions for DGBE courses; generated fallback for other tunings. */
export function findFingerings(
  chord: Chord,
  instrument: FrettedInstrument = BARITONE,
): Fingering[] {
  const cacheKey = `${instrument.id}/${chord.id}`;
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
  if (isBaritone) {
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
    ][mod(pitchClassNumber(chord.root) + 5, 12)];
    const libraryChord = `${root}:${chord.quality}`;
    const result = (UKULELE_SHAPES[libraryChord] ?? []).map(
      (position, index) => {
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
            throw new Error(
              `Missing barre finger: ${libraryChord}/${index + 1}`,
            );
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
      },
    );
    fingeringCache.set(cacheKey, result);
    return result;
  }
  const allowed = new Set(
    chord.tones.map((tone) => pitchClassNumber(tone.note)),
  );
  const choices = instrument.courses.map((course, index) => {
    const frets: (number | null)[] = [];
    for (let fret = 0; fret <= 12; fret++)
      if (
        course.strings.every((string) =>
          allowed.has(mod(midi(string.open) + fret, 12)),
        )
      )
        frets.push(fret);
    // Only mute the lowest string; inner mutes make strumming harder to interpret.
    if (index === 0) frets.push(null);
    return frets;
  });
  const candidates: Fingering[] = [];
  const visit = (frets: (number | null)[]) => {
    if (frets.length < instrument.courses.length) {
      for (const fret of choices[frets.length]) visit([...frets, fret]);
      return;
    }
    const stopped = frets.filter(
      (fret): fret is number => fret !== null && fret > 0,
    );
    const min = stopped.length ? Math.min(...stopped) : 0;
    const max = stopped.length ? Math.max(...stopped) : 0;
    if (max - min > 3) return;
    const shape = realizeFingering(chord, frets, instrument);
    if (voicingCoverage(shape.voicing, chord).omitted.length) return;
    shape.score =
      max * 2 +
      (max - min) * 3 +
      stopped.length +
      (frets.includes(null) ? 8 : 0);
    candidates.push(shape);
  };
  visit([]);
  candidates.sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));
  const result = candidates.slice(0, 12);
  fingeringCache.set(cacheKey, result);
  return result;
}

export function keyScale(key: Key): PitchClass[] {
  return (key.mode === "major" ? MAJOR : MINOR).map((semitones, index) =>
    transpose(key.tonic, interval(index + 1, semitones, "")),
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
