import assert from "node:assert/strict";
import test from "node:test";
import { BARITONE, keyContext, parseNote } from "../src/lib/music/index.ts";
import {
  DEFAULT_GROUPS,
  dictionaryRows,
  parseGroups,
  practiceRows,
} from "../src/lib/music/practice.ts";

test("all-chord practice teaches the 24 major/minor chords before seventh families", () => {
  const families = dictionaryRows(BARITONE, DEFAULT_GROUPS);
  assert.deepEqual(
    families.slice(0, 5).map((f) => f.quality),
    ["major", "minor", "7", "maj7", "m7"],
  );
  for (const family of families) {
    assert.equal(family.entries.length, 12);
    assert.ok(
      family.entries.every((entry) => entry.chord.quality === family.quality),
    );
    assert.equal(
      new Set(family.entries.map((entry) => entry.chord.id)).size,
      12,
    );
  }
  assert.deepEqual(
    families[0].entries.map((entry) => entry.chord.symbol),
    ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"],
  );
  assert.deepEqual(
    dictionaryRows(BARITONE, ["sus2"]).map((f) => f.quality),
    ["sus2"],
  );
});

test("default practice remains seven diatonic triad/seventh pairs", () => {
  const key = { tonic: parseNote("G"), mode: "major" };
  const rows = practiceRows(key, BARITONE, DEFAULT_GROUPS);
  assert.equal(rows.length, 7);
  for (const row of rows) assert.equal(row.entries.length, 2);
});
test("expanded in-key choices stay inside the selected scale", () => {
  const key = { tonic: parseNote("G"), mode: "major" };
  for (const row of practiceRows(key, BARITONE, [
    "sixths",
    "sus2",
    "sus4",
    "added",
    "ninths",
  ])) {
    for (const { chord } of row.entries)
      assert.ok(keyContext(chord, key).fitsPitchClasses);
  }
  assert.deepEqual(parseGroups("[]"), DEFAULT_GROUPS);
  assert.deepEqual(parseGroups('["sus2","unknown"]'), ["sus2"]);
});
