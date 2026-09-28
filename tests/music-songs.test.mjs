import assert from "node:assert/strict";
import test from "node:test";
import { parseChordSelection } from "../src/lib/music/analysis.ts";
import {
  bassPitch,
  INSTRUMENTS,
  pitchClassNumber,
} from "../src/lib/music/index.ts";
import { SONGS, songTokens } from "../src/lib/music/songs.ts";
import { searchVoicings } from "../src/lib/music/voicing-search.ts";

test("custom turnarounds apply only to baritone and only raise doubled endings", () => {
  const song = SONGS[0];
  for (const instrument of INSTRUMENTS.filter(
    (i) => i.id !== "baritone-dgbe",
  )) {
    song.sections.forEach((section, s) => {
      section.lines.forEach((line, l) => {
        const tokens = songTokens(song, instrument.id, s, l);
        assert.equal(tokens.map((t) => t.text).join(""), line.chords);
        assert.ok(tokens.every((t) => !t.frets));
      });
    });
  }
  const shapes = (s, l) =>
    songTokens(song, "baritone-dgbe", s, l)
      .filter((t) => t.frets)
      .map((t) => [t.symbol, t.frets]);
  const normal = [
    ["G", [0, 0, 0, 3]],
    ["G", [0, 0, 0, 7]],
    ["C", [2, 0, 1, 0]],
  ];
  const higher = [
    ["G", [0, 0, 0, 7]],
    ["G", [0, 0, 0, 10]],
    ["Cmaj7", [10, 12, 12, 12]],
  ];
  assert.deepEqual(shapes(0, 1), normal);
  for (const s of [1, 3]) {
    assert.deepEqual(shapes(s, 3), normal);
    assert.deepEqual(shapes(s, 4), higher);
  }
  for (const s of [2, 4, 6]) {
    assert.deepEqual(shapes(s, 5), normal);
    assert.deepEqual(shapes(s, 6), higher);
  }
  assert.deepEqual(shapes(5, 3), [...normal, ...higher]);
});

test("Ocean Eyes preserves the supplied section order and chord vocabulary", () => {
  const song = SONGS[0];
  assert.deepEqual(
    song.sections.map((s) => s.title),
    [
      "Intro",
      "Verse 1",
      "Chorus",
      "Verse 2",
      "Chorus",
      "Instrumental",
      "Chorus",
    ],
  );
  assert.deepEqual(song.chords, ["C", "Dsus2", "Em", "G", "G/B"]);
  for (const section of song.sections)
    for (const line of section.lines) {
      for (const token of line.chords.split(/\s+/).filter(Boolean)) {
        assert.ok(
          song.chords.includes(token) || token === "(×3)",
          `Unknown chord ${token}`,
        );
      }
    }
  assert.equal(song.sections.filter((s) => s.title === "Chorus").length, 3);
});

test("song voicings are available on each instrument and preserve slash bass", () => {
  for (const symbol of SONGS[0].chords) {
    const selection = parseChordSelection(symbol);
    assert.ok(selection);
    for (const instrument of INSTRUMENTS) {
      const shapes = searchVoicings(selection.chord, instrument, {
        bass: selection.bass ? pitchClassNumber(selection.bass) : undefined,
      });
      assert.ok(shapes.length, `${symbol} missing on ${instrument.name}`);
      if (selection.bass)
        for (const shape of shapes)
          assert.equal(
            pitchClassNumber(bassPitch(shape.voicing).note),
            pitchClassNumber(selection.bass),
          );
    }
  }
});
