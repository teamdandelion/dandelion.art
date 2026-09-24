import assert from "node:assert/strict";
import test from "node:test";
import { BARITONE, keyContext, parseNote } from "../src/lib/music/index.ts";
import {
  DEFAULT_GROUPS,
  parseGroups,
  practiceRows,
} from "../src/lib/music/practice.ts";

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
