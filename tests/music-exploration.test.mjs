import assert from "node:assert/strict";
import test from "node:test";
import { explorationSections } from "../src/lib/music/exploration.ts";
import { BARITONE, keyContext, parseNote } from "../src/lib/music/index.ts";

test("exploration has stable chapters, diatonic colors and no duplicate chords", () => {
  for (const tonic of ["C", "G", "Db", "F#"])
    for (const mode of ["major", "natural-minor"]) {
      const key = { tonic: parseNote(tonic), mode };
      const sections = explorationSections(key, BARITONE);
      assert.deepEqual(
        sections.map((s) => s.id),
        ["home", "sevenths", "colors", "pull", "borrow"],
      );
      const entries = sections.flatMap((s) => s.entries);
      assert.equal(
        new Set(entries.map((e) => e.chord.id)).size,
        entries.length,
      );
      assert.ok(
        sections[2].entries.every(
          (e) => keyContext(e.chord, key).fitsPitchClasses,
        ),
      );
      assert.ok(sections[3].entries.every((e) => e.progression.includes("→")));
    }
});
test("C starts in scale order and A minor introduces E7 early", () => {
  const c = explorationSections(
    { tonic: parseNote("C"), mode: "major" },
    BARITONE,
  );
  assert.deepEqual(
    c[0].entries.map((e) => e.chord.symbol),
    ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
  );
  const a = explorationSections(
    { tonic: parseNote("A"), mode: "natural-minor" },
    BARITONE,
  );
  assert.ok(
    a[0].entries.some(
      (e) => e.chord.symbol === "E7" && e.progression === "E7 → Am",
    ),
  );
});
