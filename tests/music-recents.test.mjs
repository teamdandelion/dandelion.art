import assert from "node:assert/strict";
import test from "node:test";
import { orderSongs, parseSongRecents } from "../src/lib/music/song-recents.ts";

test("song recency validates stored data and sorts without changing the source", () => {
  for (const raw of [null, "oops", "null", "[]", "3"])
    assert.deepEqual(parseSongRecents(raw), {});
  assert.deepEqual(
    parseSongRecents('{"a":10,"b":"12","c":-1,"d":null,"e":1e400}'),
    { a: 10 },
  );
  const songs = [
    { id: "b", title: "B" },
    { id: "c", title: "C" },
    { id: "a", title: "A" },
  ];
  assert.deepEqual(
    orderSongs(songs, {}).map((s) => s.id),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    orderSongs(songs, { c: 1, b: 2, removed: 3 }).map((s) => s.id),
    ["b", "c", "a"],
  );
  assert.deepEqual(
    orderSongs(songs, { a: 1, c: 1 }).map((s) => s.id),
    ["a", "c", "b"],
  );
  assert.deepEqual(
    songs.map((s) => s.id),
    ["b", "c", "a"],
  );
});
