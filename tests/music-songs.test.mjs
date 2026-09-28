import assert from "node:assert/strict";
import test from "node:test";
import { parseChordSelection } from "../src/lib/music/analysis.ts";
import {
  bassPitch,
  INSTRUMENTS,
  pitchClassNumber,
} from "../src/lib/music/index.ts";
import { SONGS } from "../src/lib/music/songs.ts";
import { searchVoicings } from "../src/lib/music/voicing-search.ts";

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
