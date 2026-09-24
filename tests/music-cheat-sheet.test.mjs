import assert from "node:assert/strict";
import test from "node:test";
import {
  allChordRows,
  CHEAT_SHEET_COLUMNS,
  practiceSheet,
} from "../src/lib/music/cheat-sheet.ts";
import { UKULELE_SHAPES } from "../src/lib/music/data/ukulele-shapes.ts";
import {
  CHORD_QUALITIES,
  findFingerings,
  INSTRUMENTS,
  KEY_OPTIONS,
  keyContext,
  keyScale,
  parseChord,
  pitchClassNumber,
} from "../src/lib/music/index.ts";

test("all-chords sheet covers 12 roots and major, minor, dominant seventh columns", () => {
  assert.deepEqual(
    allChordRows().map((row) => row.root),
    ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  );
  assert.deepEqual(
    CHEAT_SHEET_COLUMNS.map((column) => column.quality),
    ["major", "minor", "7"],
  );
  assert.equal(allChordRows().flatMap((row) => row.entries).length, 36);
});

test("all sheet diagrams use the first canonical shape on each instrument", () => {
  for (const instrument of INSTRUMENTS)
    for (const { entries } of CHORD_QUALITIES.filter((q) =>
      Object.hasOwn(UKULELE_SHAPES, `C:${q.id}`),
    ).flatMap((item) => allChordRows(item.id, instrument))) {
      for (const { chord, fingering, href } of entries) {
        assert.equal(fingering.source, "library");
        assert.equal(fingering.library.position, 1);
        const fourString = findFingerings(chord, instrument)[0];
        assert.deepEqual(fingering.frets, fourString.frets);
        assert.deepEqual(fingering.fingers, fourString.fingers);
        const requested = new URL(
          href,
          "https://dandelion.art",
        ).searchParams.get("chord");
        assert.equal(parseChord(requested).id, chord.id);
      }
    }
});

test("G-major practice sheet has correct pairs, outside chords, and practice loops", () => {
  const sheet = practiceSheet("G");
  assert.deepEqual(
    sheet.rows.map((row) => row.entries.map((entry) => entry.chord.symbol)),
    [
      ["G", "Gmaj7"],
      ["Am", "Am7"],
      ["Bm", "Bm7"],
      ["C", "Cmaj7"],
      ["D", "D7"],
      ["Em", "Em7"],
      ["F♯dim", "F♯m7♭5"],
    ],
  );
  assert.deepEqual(
    sheet.nearby
      .filter((e) => e.kind === "applied")
      .map((entry) => entry.chord.symbol),
    ["A7", "B7", "E7", "G7", "F♯7"],
  );
  assert.deepEqual(
    sheet.nearby.filter((e) => e.kind === "applied").map((entry) => entry.move),
    ["→ D", "→ Em", "→ Am", "→ C", "→ Bm"],
  );
  assert.deepEqual(sheet.loops[2], ["G", "B7", "Em", "C", "D7", "G"]);
});

test("every major-key sheet preserves diatonic spelling and meaningful outside relationships", () => {
  for (const tonic of KEY_OPTIONS) {
    const sheet = practiceSheet(tonic);
    const scale = keyScale(sheet.key);
    assert.equal(sheet.rows.length, 7);
    assert.ok(sheet.nearby.length > 20);
    assert.equal(
      new Set(sheet.nearby.map((e) => e.chord.id)).size,
      sheet.nearby.length,
    );
    for (const row of sheet.rows)
      for (const entry of row.entries) {
        assert.ok(keyContext(entry.chord, sheet.key).fitsPitchClasses);
        assert.deepEqual(entry.chord.root, scale[row.degree - 1]);
        assert.equal(entry.fingering.library.position, 1);
        assert.equal(parseChord(entry.chord.symbol).id, entry.chord.id);
      }
    for (const [i, entry] of sheet.nearby.entries()) {
      assert.equal(keyContext(entry.chord, sheet.key).fitsPitchClasses, false);
      assert.equal(entry.fingering.source, "library");
      if (i < 4) {
        const target = sheet.rows[[4, 5, 1, 3][i]].entries[0].chord;
        assert.equal(
          (pitchClassNumber(entry.chord.root) -
            pitchClassNumber(target.root) +
            12) %
            12,
          7,
        );
      }
    }
  }
});
