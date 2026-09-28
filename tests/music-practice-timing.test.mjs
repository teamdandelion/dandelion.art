import assert from "node:assert/strict";
import test from "node:test";
import { timingPosition } from "../src/lib/music/practice-timing.ts";

test("measure timing follows beats, not screen width or chord count", () => {
  assert.deepEqual(timingPosition([2, 1, 4], 4, 4), {
    line: 0,
    progress: 0.5,
    bar: 2,
    totalBars: 7,
    done: false,
  });
  assert.deepEqual(timingPosition([2, 1, 4], 4, 8), {
    line: 1,
    progress: 0,
    bar: 3,
    totalBars: 7,
    done: false,
  });
  assert.equal(timingPosition([2, 1, 4], 3, 6).line, 1);
  assert.deepEqual(timingPosition([2, 1, 4], 4, 100), {
    line: 2,
    progress: 1,
    bar: 7,
    totalBars: 7,
    done: true,
  });
  assert.equal(timingPosition([2], 4, -1).progress, 0);
  assert.equal(timingPosition([], 4, 0).done, true);
});
