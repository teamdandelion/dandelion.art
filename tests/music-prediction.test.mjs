import assert from "node:assert/strict";
import test from "node:test";
import {
  fretboardPitches,
  identifyChords,
  predictFretboard,
} from "../src/lib/music/fretboard.ts";
import { BARITONE, parseNote } from "../src/lib/music/index.ts";

test("every prediction is the actual result of replacing only one string", () => {
  const key = { tonic: parseNote("G"), mode: "major" };
  const frets = [0, 0, 0, 0];
  const grid = predictFretboard(BARITONE, frets, key);
  grid.forEach((row, index) => {
    row.forEach(({ fret, matches }) => {
      const changed = frets.map((f, i) => (i === index ? fret : f));
      assert.deepEqual(
        matches,
        identifyChords(fretboardPitches(BARITONE, changed), key, true),
      );
    });
  });
  assert.ok(
    grid[3]
      .find((p) => p.fret === 3)
      .matches.some((m) => m.chord.symbol === "G"),
  );
  assert.deepEqual(frets, [0, 0, 0, 0]);
});
