import assert from "node:assert/strict";
import test from "node:test";
import { chordRelations, harmonicMoves } from "../src/lib/music/harmony.ts";
import {
  CHORD_QUALITIES,
  formatNote,
  KEY_OPTIONS,
  keyContext,
  makeChord,
  parseNote,
  ROOT_OPTIONS,
} from "../src/lib/music/index.ts";

const cMajor = { tonic: parseNote("C"), mode: "major" };

test("shared tones and relative chords are not directional resolutions", () => {
  const c = makeChord("C", "major");
  const am = makeChord("A", "minor");
  const forward = chordRelations(c, am);
  assert.deepEqual(
    forward.map((edge) => edge.kind),
    ["relative", "shared-tones"],
  );
  assert.ok(forward.every((edge) => !edge.directed));
  assert.deepEqual(forward[0].sharedTones.map(formatNote), ["C", "E"]);
  assert.equal(chordRelations(am, c)[0].kind, "relative");
});

test("dominant and leading-tone resolutions have a direction and an explained destination", () => {
  for (const [from, to, kind] of [
    [makeChord("A", "7"), makeChord("D", "6"), "dominant-resolution"],
    [makeChord("E", "7"), makeChord("A", "minor"), "dominant-resolution"],
    [makeChord("B", "dim"), makeChord("C", "major"), "leading-tone-resolution"],
    [
      makeChord("C#", "dim7"),
      makeChord("D", "minor"),
      "leading-tone-resolution",
    ],
  ]) {
    assert.equal(chordRelations(from, to)[0].kind, kind);
    assert.equal(chordRelations(from, to)[0].directed, true);
    assert.ok(!chordRelations(to, from).some((edge) => edge.kind === kind));
  }
  assert.match(
    chordRelations(makeChord("A", "7"), makeChord("D", "6"))[0].explanation,
    /C♯.*semitone.*D/,
  );
  assert.ok(
    !chordRelations(makeChord("A", "major"), makeChord("D", "major")).some(
      (edge) => edge.kind === "dominant-resolution",
    ),
  );
});

test("demo trail explains both shared notes and the arrival on D6", () => {
  const trail = [
    makeChord("C", "major"),
    makeChord("E", "m7"),
    makeChord("A", "7"),
    makeChord("D", "6"),
  ];
  assert.equal(chordRelations(trail[0], trail[1])[0].kind, "shared-tones");
  assert.equal(chordRelations(trail[1], trail[2])[0].kind, "shared-tones");
  assert.equal(
    chordRelations(trail[2], trail[3])[0].kind,
    "dominant-resolution",
  );
  assert.deepEqual(
    trail.map((chord) => keyContext(chord, cMajor).fitsPitchClasses),
    [true, true, false, false],
  );
});

test("chromatic neighborhoods expose applied chords without weakening the in-key filter", () => {
  const c = makeChord("C", "major");
  assert.ok(
    harmonicMoves(c, cMajor, true).some(
      (move) => move.chord.id === makeChord("A", "7").id && !move.inKey,
    ),
  );
  assert.ok(
    harmonicMoves(makeChord("A", "7"), cMajor, true).some(
      (move) => move.chord.id === makeChord("D", "6").id,
    ),
  );
  for (const tonic of KEY_OPTIONS)
    for (const mode of ["major", "natural-minor"]) {
      const key = { tonic: parseNote(tonic), mode };
      for (const root of ROOT_OPTIONS)
        for (const quality of CHORD_QUALITIES) {
          const from = makeChord(root, quality.id);
          for (const chromatic of [false, true]) {
            const moves = harmonicMoves(from, key, chromatic);
            assert.ok(moves.length <= 6);
            assert.equal(
              new Set(moves.map((move) => move.chord.id)).size,
              moves.length,
            );
            for (const move of moves) {
              assert.ok(Math.abs(move.chord.root.alter) <= 2);
              assert.notEqual(move.chord.id, from.id);
              assert.ok(move.relations.length);
              assert.equal(
                move.inKey,
                keyContext(move.chord, key).fitsPitchClasses,
              );
              if (!chromatic) assert.ok(move.inKey);
            }
          }
        }
    }
});

test("exotic source spellings never produce roots the reference cannot edit", () => {
  for (const root of ["Cbb", "B##", "Dbb", "E##"])
    for (const quality of ["dim", "dim7", "7"])
      for (const move of harmonicMoves(
        makeChord(root, quality),
        cMajor,
        true,
      )) {
        assert.ok(Math.abs(move.chord.root.alter) <= 2);
      }
});
