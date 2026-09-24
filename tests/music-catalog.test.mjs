import assert from "node:assert/strict";
import test from "node:test";
import { chordFamily } from "../src/lib/music/harmony.ts";
import {
  CHORD_QUALITIES,
  chordFormula,
  makeChord,
  parseChord,
} from "../src/lib/music/index.ts";

test("every catalog symbol and alias round-trips to its quality", () => {
  const aliases = new Map();
  for (const formula of CHORD_QUALITIES) {
    for (const alias of [formula.suffix, ...formula.aliases]) {
      const normalized = alias.replaceAll("♭", "b");
      assert.ok(
        !aliases.has(normalized) || aliases.get(normalized) === formula.id,
      );
      aliases.set(normalized, formula.id);
      assert.equal(parseChord(`C${alias}`)?.quality, formula.id);
    }
    assert.equal(chordFormula(formula.id), formula);
  }
});

test("suspended and augmented chords are not mislabeled major", () => {
  assert.equal(chordFamily(makeChord("C", "sus2")), "suspended");
  assert.equal(chordFamily(makeChord("C", "sus4")), "suspended");
  assert.equal(chordFamily(makeChord("C", "aug")), "augmented");
});
