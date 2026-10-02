import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { parseChordSelection } from "../src/lib/music/analysis.ts";
import {
  bassPitch,
  INSTRUMENTS,
  pitchClassNumber,
} from "../src/lib/music/index.ts";
import { songChords } from "../src/lib/music/song.ts";
import { lyricWords } from "../src/lib/music/song-layout.ts";
import { SONGS } from "../src/lib/music/songs.ts";
import { searchVoicings } from "../src/lib/music/voicing-search.ts";

// Captured from the original PDF transcription before migrating the representation.
const sourceHashes = {
  "ocean-eyes": {
    lyrics: "d86ea02ab53d36d637a11664c6bec41f3cda1423a9fa24821f0a2a50c235517f",
    chords: "cc2c4377daa8cc217e798e52cc0d910c374b2d3a4100f541a87c8bc9cf749e9e",
  },
  hallelujah: {
    lyrics: "edf834fd488ee0a74fb55130e248574fd86b4092b14822dd1e6c1a22b44349fe",
    chords: "d8f7199a7b08d767d3f001ad696229d25cb82b47b9afe3eca0ede784c0ac80ac",
  },
};
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("uploaded practice charts retain sections, vocabulary and performance cues", () => {
  const expected = {
    stitches: {
      sections: [
        "Intro",
        "Verse 1",
        "Pre-Chorus",
        "Chorus",
        "Verse 2",
        "Pre-Chorus",
        "Chorus",
        "Bridge",
        "Chorus",
      ],
      chords: ["Em", "D", "G", "C"],
      lines: [1, 4, 4, 8, 5, 4, 9, 15, 12],
    },
    "fly-me-to-the-moon": {
      sections: ["Verse 1", "Verse 2", "Instrumental", "Verse 3"],
      chords: [
        "Am",
        "Dm7",
        "G7",
        "Cmaj7",
        "F",
        "Dm",
        "E7",
        "A7",
        "C",
        "E",
        "Fm",
        "Em",
        "G",
      ],
      lines: [4, 4, 1, 5],
    },
    "hey-there-delilah": {
      sections: [
        "Intro",
        "Verse 1",
        "Chorus",
        "Verse 2",
        "Chorus",
        "Bridge",
        "Verse 3",
        "Final Chorus",
      ],
      chords: ["C", "Em", "Am", "F", "G"],
      lines: [1, 8, 3, 8, 2, 6, 5, 4],
    },
  };
  assert.equal(new Set(SONGS.map((s) => s.id)).size, SONGS.length);
  for (const [id, chart] of Object.entries(expected)) {
    const song = SONGS.find((s) => s.id === id);
    assert.ok(song, id);
    assert.deepEqual(
      song.sections.map((s) => s.title),
      chart.sections,
    );
    assert.deepEqual(
      song.sections.map((s) => s.lines.length),
      chart.lines,
    );
    assert.deepEqual(songChords(song), chart.chords);
  }
  const text = (id) =>
    SONGS.find((s) => s.id === id)
      .sections.flatMap((s) => s.lines)
      .map((l) => l.segments.map((s) => s.text).join(""))
      .join("\n");
  assert.match(text("stitches"), /I thought that I've been hurt before/);
  assert.equal(text("stitches").match(/\(N\.C\.\)/g).length, 3);
  assert.match(
    text("fly-me-to-the-moon"),
    /Fly me to the moon, let me play among the stars,/,
  );
  assert.match(
    text("hey-there-delilah"),
    /Hey there Delilah, what’s it like in New York City\?/,
  );
  assert.match(text("hey-there-delilah"), /\(full strum\)/);
});

test("segment migration preserves original lyrics, chords and section order", () => {
  for (const song of SONGS) {
    const lyrics = song.sections.map((s) =>
      s.lines.map((l) =>
        l.segments.map((s) => (s.text === "(×3)" ? "" : s.text)).join(""),
      ),
    );
    const chords = song.sections.map((s) =>
      s.lines.map((l) => l.segments.flatMap((s) => (s.chord ? [s.chord] : []))),
    );
    if (sourceHashes[song.id]) {
      assert.equal(hash(lyrics), sourceHashes[song.id].lyrics);
      assert.equal(hash(chords), sourceHashes[song.id].chords);
    }
    assert.equal("turnaroundVoicings" in song, false);
    for (const line of song.sections.flatMap((s) => s.lines)) {
      assert.deepEqual(Object.keys(line), ["segments"]);
      for (const segment of line.segments) {
        assert.ok(
          Object.keys(segment).every((key) => ["text", "chord"].includes(key)),
        );
        if (segment.chord) assert.ok(parseChordSelection(segment.chord));
      }
    }
  }
  assert.deepEqual(songChords(SONGS[0]), ["C", "Dsus2", "Em", "G", "G/B"]);
  assert.deepEqual(songChords(SONGS[1]), ["C", "Am", "F", "G", "E7"]);
  assert.deepEqual(
    SONGS[0].sections.map((s) => s.title),
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
  assert.deepEqual(
    SONGS[1].sections.map((s) => s.title),
    [
      "Intro",
      "Verse 1",
      "Chorus",
      "Verse 2",
      "Chorus",
      "Verse 3",
      "Chorus",
      "Verse 4",
      "Chorus",
      "Verse 5",
      "Outro",
    ],
  );
});

test("word layout retains text and mid-word chord anchors without character measurement", () => {
  assert.deepEqual(
    lyricWords([
      { text: "hal" },
      { chord: "C", text: "lelujah " },
      { chord: "Am", text: "again" },
    ]),
    [
      [{ text: "hal" }, { chord: "C", text: "lelujah " }],
      [{ chord: "Am", text: "again" }],
    ],
  );
  assert.deepEqual(
    lyricWords([
      { chord: "C", text: "" },
      { chord: "Am", text: "" },
    ]),
    [[{ chord: "C", text: "" }], [{ chord: "Am", text: "" }]],
  );
  assert.deepEqual(lyricWords([]), []);
  for (const song of SONGS) {
    for (const line of song.sections.flatMap((s) => s.lines)) {
      const before = JSON.stringify(line.segments);
      const parts = lyricWords(line.segments).flat();
      assert.equal(
        parts.map((p) => p.text).join(""),
        line.segments.map((p) => p.text).join(""),
      );
      const anchors = (segments) => {
        let offset = 0;
        return segments.flatMap((segment) => {
          const anchor = segment.chord ? [[offset, segment.chord]] : [];
          offset += segment.text.length;
          return anchor;
        });
      };
      assert.deepEqual(anchors(parts), anchors(line.segments));
      assert.equal(JSON.stringify(line.segments), before);
    }
  }
});

test("song voicings are available on every instrument and preserve slash bass", () => {
  for (const symbol of new Set(SONGS.flatMap(songChords))) {
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
