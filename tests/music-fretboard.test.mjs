import assert from "node:assert/strict";
import test from "node:test";
import { practiceSheet } from "../src/lib/music/cheat-sheet.ts";
import {
  fretboardPitches,
  identifyChords,
  noteAt,
  pitchAt,
} from "../src/lib/music/fretboard.ts";
import {
  BARITONE,
  formatPitch,
  GUITAR,
  INSTRUMENTS,
  midi,
  parseNote,
  pitchClassNumber,
  UKULELE,
} from "../src/lib/music/index.ts";
import {
  DEFAULT_PREFERENCES,
  KEY_ROOTS,
  parsePreferences,
} from "../src/lib/music/preferences.ts";

const key = { tonic: parseNote("G"), mode: "major" };

test("fretboard labels preserve octaves and key-aware spelling", () => {
  assert.deepEqual(
    fretboardPitches(BARITONE, [5, 4, 3, 3]).map((p) =>
      formatPitch(pitchAt(p, key)),
    ),
    ["G3", "B3", "D4", "G4"],
  );
  assert.equal(formatPitch(pitchAt(59, key)), "B3");
  assert.equal(formatPitch(pitchAt(60, key)), "C4");
  assert.equal(
    formatPitch(pitchAt(60, { tonic: parseNote("C#"), mode: "major" })),
    "B♯3",
  );
  assert.equal(
    formatPitch(pitchAt(59, { tonic: parseNote("Gb"), mode: "major" })),
    "C♭4",
  );
  for (const instrument of INSTRUMENTS)
    for (const course of instrument.courses)
      for (let fret = 0; fret <= 12; fret++) {
        const value = midi(course.strings[0].open) + fret;
        assert.equal(midi(pitchAt(value, key)), value);
      }
});

test("the first-string third-fret baritone example identifies G with a D bass", () => {
  const pitches = fretboardPitches(BARITONE, [0, 0, 0, 3]);
  assert.deepEqual(pitches, [50, 55, 59, 67]);
  const result = identifyChords(pitches, key);
  assert.equal(result[0].chord.symbol, "G");
  assert.equal(result[0].bass, "D");
});
test("standard guitar and reentrant ukulele are identified from sounding strings", () => {
  assert.equal(
    identifyChords(fretboardPitches(GUITAR, [null, 3, 2, 0, 1, 0]), key)[0]
      .chord.symbol,
    "C",
  );
  assert.equal(
    identifyChords(fretboardPitches(UKULELE, [0, 0, 0, 3]), key)[0].chord
      .symbol,
    "C",
  );
  assert.deepEqual(fretboardPitches(BARITONE, [null, null, null, null]), []);
  assert.deepEqual(identifyChords([], key), []);
  assert.deepEqual(identifyChords([60, 61], key), []);
  assert.throws(() => fretboardPitches(GUITAR, [0, 0, 0, 3]));
});
test("ambiguous sets keep multiple names, and omissions do not invent matches", () => {
  assert.deepEqual(
    new Set(identifyChords([60, 64, 67, 69], key).map((m) => m.chord.symbol)),
    new Set(["C6", "Am7"]),
  );
  assert.deepEqual(identifyChords([60, 64], key), []);
  assert.equal(
    pitchClassNumber(noteAt(61, { tonic: parseNote("Db"), mode: "major" })),
    1,
  );
});
test("preferences have safe defaults and reject removed or malformed settings", () => {
  assert.deepEqual(parsePreferences(null), DEFAULT_PREFERENCES);
  assert.deepEqual(parsePreferences("not json"), DEFAULT_PREFERENCES);
  assert.deepEqual(
    parsePreferences(
      '{"instrumentId":"old-six-string","tonic":"H","mode":"dorian"}',
    ),
    DEFAULT_PREFERENCES,
  );
  for (const ins of INSTRUMENTS)
    for (const mode of Object.keys(KEY_ROOTS))
      for (const tonic of KEY_ROOTS[mode]) {
        const value = { instrumentId: ins.id, tonic, mode };
        assert.deepEqual(parsePreferences(JSON.stringify(value)), value);
      }
});
test("every key and instrument has renderable diatonic and expanded related shapes", () => {
  for (const ins of INSTRUMENTS)
    for (const mode of Object.keys(KEY_ROOTS))
      for (const tonic of KEY_ROOTS[mode]) {
        const sheet = practiceSheet(tonic, ins, mode);
        for (const e of [
          ...sheet.rows.flatMap((r) => r.entries),
          ...sheet.nearby,
        ]) {
          assert.ok(
            e.fingering,
            `${ins.id} ${tonic} ${mode} ${e.chord.symbol}`,
          );
          assert.equal(e.fingering.frets.length, ins.courses.length);
        }
        assert.ok(sheet.nearby.length > 10);
      }
  const minor = practiceSheet("G", BARITONE, "natural-minor");
  assert.equal(minor.rows[0].entries[0].chord.symbol, "Gm");
  assert.ok(minor.nearby.some((e) => e.chord.symbol === "D7"));
});
