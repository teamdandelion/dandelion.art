import assert from "node:assert/strict";
import test from "node:test";
import {
  BARITONE,
  findFingerings,
  makeChord,
  midi,
} from "../src/lib/music/index.ts";
import {
  movableFingerings,
  transposeShape,
} from "../src/lib/music/voicing-search.ts";

test("movable search preserves canonical order and deduplicates physical positions", () => {
  const chord = makeChord("G", "major");
  const original = findFingerings(chord, BARITONE);
  const expanded = movableFingerings(chord, BARITONE);
  assert.deepEqual(expanded.slice(0, original.length), original);
  assert.ok(expanded.length > original.length);
  assert.equal(
    new Set(expanded.map((s) => s.frets.join(","))).size,
    expanded.length,
  );
});
test("movable transposition shifts every voice equally, never open strings", () => {
  const chord = makeChord("G", "major");
  for (const shape of findFingerings(chord, BARITONE)) {
    const shifted = transposeShape(
      shape,
      1,
      makeChord("Ab", "major"),
      BARITONE,
    );
    if (shape.frets.includes(0)) assert.equal(shifted, null);
    else
      assert.deepEqual(
        shifted.voicing.voices.map((v) => midi(v.pitch)),
        shape.voicing.voices.map((v) => midi(v.pitch) + 1),
      );
  }
});
