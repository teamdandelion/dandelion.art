import assert from "node:assert/strict";
import test from "node:test";
import { SongScroll } from "../src/lib/music/song-scroll.ts";

const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);
function advance(model, from, to, step = 20, observe = () => {}) {
  let position;
  for (let now = from + step; now <= to; now += step) {
    observe(now);
    position = model.advance(now, 10000);
  }
  return position;
}
test("delayed/stale browser positions cannot cancel an additive half-page pulse", () => {
  for (const direction of [-1, 1]) {
    const model = new SongScroll();
    model.setRunning(true, 0, 1000);
    model.nudge(direction * 400, 0, 1000);
    close(
      advance(model, 0, 1200, 20, (now) => model.observe(now, 1000)),
      1000 + direction * 400 + 14.4,
    );
    close(advance(model, 1200, 2200), 1000 + direction * 400 + 26.4);
    assert.equal(model.running, true);
  }
});
test("repeated taps and speed changes preserve fractional position and existing pulses", () => {
  const model = new SongScroll();
  model.nudge(400, 0, 1000);
  advance(model, 0, 200);
  model.nudge(400, 200, 1022); // Rounded/stale DOM value must not reset motion.
  close(advance(model, 200, 1400), 1800);
  assert.equal(model.active, false);
  model.setRunning(true, 1400, 1800);
  model.nudge(-400, 1400, 1800);
  advance(model, 1400, 2000);
  model.setSpeed(20);
  close(advance(model, 2000, 2600), 1419.2);
});
test("manual drag cancels pulses, follows momentum and resumes from corrected location", () => {
  const model = new SongScroll();
  model.setRunning(true, 0, 1000);
  model.nudge(400, 0, 1000);
  advance(model, 0, 200);
  model.manual(200, 700, true);
  assert.equal(model.advance(300, 10000), null);
  model.observe(350, 600);
  model.manual(400, 600);
  model.observe(500, 550);
  assert.equal(model.advance(650, 10000), null);
  close(model.advance(700, 10000), 550.6);
  close(model.advance(800, 10000), 551.8);
});
test("pause, reduced motion, opposite pulses and boundaries are deterministic", () => {
  const model = new SongScroll();
  model.nudge(400, 0, 1000);
  model.nudge(-400, 0, 1000);
  close(advance(model, 0, 1200), 1000);
  model.nudge(400, 1300, 1000, true);
  close(model.advance(1310, 10000), 1400);
  model.setRunning(true, 1400, 1400);
  model.nudge(400, 1400, 1400);
  advance(model, 1400, 1500);
  model.setRunning(false, 1500, 1400);
  assert.equal(model.active, false);
  assert.equal(model.advance(1600, 10000), null);
  model.nudge(-400, 1700, 10, true);
  close(model.advance(1710, 10000), 0);
  model.setRunning(true, 1800, 9999);
  close(model.advance(1900, 10000), 10000);
  assert.equal(model.running, false);
});
test("different frame rates integrate the same distance", () => {
  for (const step of [5, 10, 20, 40, 100]) {
    const model = new SongScroll();
    model.setRunning(true, 0, 500);
    model.nudge(422, 0, 500);
    close(advance(model, 0, 1200, step), 936.4);
  }
});
