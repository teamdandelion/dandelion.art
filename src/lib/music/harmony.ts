import {
  type Chord,
  formatNote,
  type Key,
  keyChords,
  keyContext,
  makeChord,
  type PitchClass,
  pitchClassNumber,
  transpose,
} from "./index.ts";

export type HarmonicRelation = {
  kind:
    | "shared-tones"
    | "relative"
    | "dominant-resolution"
    | "leading-tone-resolution";
  directed: boolean;
  label: string;
  explanation: string;
  sharedTones: PitchClass[];
};

export function chordFamily(chord: Chord) {
  if (chord.quality === "7") return "dominant";
  if (["dim", "dim7", "m7b5"].includes(chord.quality)) return "diminished";
  if (["minor", "m7", "m6"].includes(chord.quality)) return "minor";
  return "major";
}

/** Structural similarity and directional harmonic function are separate edges. */
export function chordRelations(from: Chord, to: Chord): HarmonicRelation[] {
  const other = new Set(to.tones.map((tone) => pitchClassNumber(tone.note)));
  const sharedTones = from.tones
    .filter((tone) => other.has(pitchClassNumber(tone.note)))
    .map((tone) => tone.note);
  const relations: HarmonicRelation[] = [];
  const distance =
    (pitchClassNumber(to.root) - pitchClassNumber(from.root) + 12) % 12;
  const stableDestination = [
    "major",
    "minor",
    "maj7",
    "m7",
    "6",
    "m6",
    "add9",
  ].includes(to.quality);
  if (from.quality === "7" && distance === 5 && stableDestination) {
    const leadingTone = transpose(from.root, {
      degree: 3,
      semitones: 4,
      label: "3",
    });
    relations.push({
      kind: "dominant-resolution",
      directed: true,
      label: "Dominant → destination",
      explanation: `${from.symbol} is the dominant seventh of ${formatNote(to.root)}. Its ${formatNote(leadingTone)} can rise a semitone to ${formatNote(to.root)}.`,
      sharedTones,
    });
  }
  if (
    ["dim", "dim7", "m7b5"].includes(from.quality) &&
    distance === 1 &&
    stableDestination
  ) {
    relations.push({
      kind: "leading-tone-resolution",
      directed: true,
      label: "Leading-tone resolution",
      explanation: `${from.symbol} can approach ${to.symbol}: its root ${formatNote(from.root)} rises a semitone to ${formatNote(to.root)}.`,
      sharedTones,
    });
  }
  if (
    (from.quality === "major" && to.quality === "minor" && distance === 9) ||
    (from.quality === "minor" && to.quality === "major" && distance === 3)
  ) {
    relations.push({
      kind: "relative",
      directed: false,
      label: "Relative major / minor",
      explanation: `${from.symbol} and ${to.symbol} are relative major/minor triads, sharing ${sharedTones.map(formatNote).join(" and ")}.`,
      sharedTones,
    });
  }
  if (sharedTones.length)
    relations.push({
      kind: "shared-tones",
      directed: false,
      label: `${sharedTones.length} shared ${sharedTones.length === 1 ? "note" : "notes"}`,
      explanation: `Both chords contain ${sharedTones.map(formatNote).join(" · ")}. A shared note can stay while the harmony changes; this is not a prescribed resolution.`,
      sharedTones,
    });
  return relations;
}

export type HarmonicMove = {
  chord: Chord;
  relations: HarmonicRelation[];
  inKey: boolean;
};

/** A small, varied neighborhood, not an exhaustive list of allowed progressions. */
export function harmonicMoves(
  from: Chord,
  key: Key,
  allowChromatic: boolean,
): HarmonicMove[] {
  const diatonic = [...keyChords(key), ...keyChords(key, true)].map(
    (node) => node.chord,
  );
  const pool = [...diatonic];
  if (allowChromatic) {
    for (const target of keyChords(key).map((node) => node.chord)) {
      if (target.quality === "dim") continue;
      pool.push(
        makeChord(
          transpose(target.root, { degree: 5, semitones: 7, label: "5" }),
          "7",
        ),
      );
      pool.push(
        makeChord(
          transpose(target.root, { degree: 7, semitones: 11, label: "7" }),
          "dim",
        ),
      );
    }
  }
  const destination =
    from.quality === "7"
      ? transpose(from.root, { degree: 4, semitones: 5, label: "4" })
      : ["dim", "dim7", "m7b5"].includes(from.quality)
        ? transpose(from.root, { degree: 2, semitones: 1, label: "♭2" })
        : null;
  if (destination)
    for (const quality of ["major", "minor", "6"] as const)
      pool.push(makeChord(destination, quality));

  const candidates = [
    ...new Map(pool.map((chord) => [chord.id, chord])).values(),
  ]
    // The reference's editable note field supports up to double accidentals.
    .filter((chord) => chord.id !== from.id && Math.abs(chord.root.alter) <= 2)
    .map((chord) => ({
      chord,
      relations: chordRelations(from, chord),
      inKey: keyContext(chord, key).fitsPitchClasses,
    }))
    .filter((move) => move.relations.length && (allowChromatic || move.inKey));
  const score = (move: HarmonicMove) => {
    if (move.relations.some((edge) => edge.directed))
      return -100 + (move.inKey ? 0 : 2);
    if (move.relations.some((edge) => edge.kind === "relative")) return -50;
    const shared = move.relations[0].sharedTones.length;
    return (
      -shared * 5 +
      (move.chord.tones.length > 3 ? 1 : 0) +
      (move.inKey ? 0 : 2) +
      (pitchClassNumber(move.chord.root) === pitchClassNumber(from.root)
        ? 20
        : 0)
    );
  };
  candidates.sort(
    (a, b) => score(a) - score(b) || a.chord.id.localeCompare(b.chord.id),
  );
  const selected: HarmonicMove[] = [];
  const counts = new Map<string, number>();
  const roots = new Set<string>();
  for (const move of candidates) {
    const family = chordFamily(move.chord);
    if ((counts.get(family) ?? 0) >= 2) continue;
    const root = `${pitchClassNumber(move.chord.root)}:${family}`;
    // Prefer different destinations over many extensions of the same chord,
    // but keep major/minor/sixth alternatives for an explicit resolution.
    if (roots.has(root) && !move.relations.some((edge) => edge.directed))
      continue;
    selected.push(move);
    roots.add(root);
    counts.set(family, (counts.get(family) ?? 0) + 1);
    if (selected.length === 6) break;
  }
  for (const move of candidates) {
    if (selected.length === 6) break;
    if (!selected.includes(move)) selected.push(move);
  }
  return selected;
}
