import assert from "node:assert/strict";
import test from "node:test";
import {
  SCROLL_PULSE_MS,
  scrollPulseProgress,
} from "../src/lib/music/scroll-pulse.ts";

test("flip-and-burn displacement has symmetric constant acceleration and zero endpoint velocity", () => {
  const T = SCROLL_PULSE_MS;
  assert.equal(scrollPulseProgress(0), 0);
  assert.equal(scrollPulseProgress(T / 4), 0.125);
  assert.equal(scrollPulseProgress(T / 2), 0.5);
  assert.equal(scrollPulseProgress((3 * T) / 4), 0.875);
  assert.equal(scrollPulseProgress(T), 1);
  assert.equal(scrollPulseProgress(T * 2), 1);
  const velocity = (t) =>
    (scrollPulseProgress(t + 0.01) - scrollPulseProgress(t)) / 0.01;
  assert.ok(Math.abs(velocity(0)) < 0.000001);
  assert.ok(Math.abs(velocity(T - 0.01)) < 0.000001);
  assert.ok(Math.abs(velocity(T / 2) - 2 / T) < 0.000001);
  for (const direction of [-1, 1]) {
    let displacement = 0;
    for (let time = 0; time < T; time += 16) {
      displacement +=
        direction *
        422 *
        (scrollPulseProgress(time + 16) - scrollPulseProgress(time));
    }
    assert.ok(Math.abs(displacement - direction * 422) < 1e-9);
  }
  assert.equal(scrollPulseProgress(0, 0), 1);
});
