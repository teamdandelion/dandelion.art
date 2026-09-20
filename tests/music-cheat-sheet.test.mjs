import assert from "node:assert/strict";
import test from "node:test";
import {
  CHEAT_SHEET_COLUMNS,
  CHEAT_SHEET_ROWS,
} from "../src/lib/music/cheat-sheet.ts";
import {
  BARITONE,
  findFingerings,
  parseChord,
} from "../src/lib/music/index.ts";

test("cheat sheet has C–B rows and major, minor, dominant seventh columns", () => {
  assert.deepEqual(
    CHEAT_SHEET_ROWS.map((row) => row.root),
    ["C", "D", "E", "F", "G", "A", "B"],
  );
  assert.deepEqual(
    CHEAT_SHEET_COLUMNS.map((column) => column.quality),
    ["major", "minor", "7"],
  );
  assert.equal(CHEAT_SHEET_ROWS.flatMap((row) => row.entries).length, 21);
});

test("all sheet diagrams use the first canonical shape and work on both baritones", () => {
  for (const { entries } of CHEAT_SHEET_ROWS) {
    for (const { chord, fingering, href } of entries) {
      assert.equal(fingering.source, "library");
      assert.equal(fingering.library.position, 1);
      const fourString = findFingerings(chord, BARITONE)[0];
      assert.deepEqual(fingering.frets, fourString.frets);
      assert.deepEqual(fingering.fingers, fourString.fingers);
      const requested = new URL(href, "https://dandelion.art").searchParams.get(
        "chord",
      );
      assert.equal(parseChord(requested).id, chord.id);
    }
  }
});
