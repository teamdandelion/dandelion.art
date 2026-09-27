import assert from "node:assert/strict";
import test from "node:test";
import { BARITONE, GUITAR } from "../src/lib/music/index.ts";
import {
  parseVoicingLink,
  voicingHref,
} from "../src/lib/music/voicing-link.ts";

test("voicing links round trip exact pitches including open and muted strings", () => {
  for (const [instrument, frets] of [
    [GUITAR, [null, 3, 2, 0, 1, 0]],
    [BARITONE, [12, 14, 0, 14]],
  ]) {
    const url = new URL(
      voicingHref(instrument, frets, "C"),
      "https://example.com",
    );
    assert.deepEqual(parseVoicingLink(url.searchParams), { instrument, frets });
  }
  for (const frets of ["1,2", "-1,0,0,0", "25,0,0,0", "NaN,0,0,0", "1.5,0,0,0"])
    assert.equal(
      parseVoicingLink(new URLSearchParams({ instrument: BARITONE.id, frets })),
      null,
    );
});
