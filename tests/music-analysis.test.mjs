import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeCoverage,
  parseChordSelection,
  voicingSymbol,
} from "../src/lib/music/analysis.ts";
import {
  BARITONE,
  CHORD_QUALITIES,
  findFingerings,
  INSTRUMENTS,
  makeChord,
  midi,
  realizeFingering,
  UKULELE,
} from "../src/lib/music/index.ts";

test("every offered fingering satisfies the shared recognition coverage policy", () => {
  for (const instrument of INSTRUMENTS)
    for (const formula of CHORD_QUALITIES)
      for (const root of [
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
      ]) {
        const chord = makeChord(root, formula.id);
        for (const shape of findFingerings(chord, instrument))
          assert.ok(
            analyzeCoverage(
              chord,
              shape.voicing.voices.map((v) => midi(v.pitch)),
            ),
            shape.id,
          );
      }
});

import { realizePosition } from "../src/lib/music/positions.ts";

test("physical and harmonic realizations sound exactly the same pitches", () => {
  for (const instrument of [BARITONE, UKULELE]) {
    const chord = makeChord(instrument === BARITONE ? "C" : "F", "major");
    const frets = [2, 0, 1, 0];
    const shape = realizeFingering(chord, frets, instrument);
    assert.deepEqual(
      shape.voicing.voices.map((v) => midi(v.pitch)),
      realizePosition(instrument, frets).map((s) => s.midi),
    );
  }
});
test("slash names describe actual bass and parse without changing chord identity", () => {
  const chord = makeChord("G", "major");
  assert.equal(
    voicingSymbol(chord, realizeFingering(chord, [0, 0, 0, 3]).voicing),
    "G/D",
  );
  assert.equal(parseChordSelection("G/B").chord.id, chord.id);
  assert.equal(parseChordSelection("G/F"), null);
});
test("omissions are explicit and never permit losing the root or defining third", () => {
  const chord = makeChord("C", "7");
  assert.equal(analyzeCoverage(chord, [60, 64, 70]).kind, "omitted");
  assert.equal(analyzeCoverage(chord, [64, 67, 70]), null);
  assert.equal(analyzeCoverage(chord, [60, 67, 70]), null);
});
