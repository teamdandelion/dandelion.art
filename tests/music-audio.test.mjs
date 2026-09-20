import assert from "node:assert/strict";
import test from "node:test";
import { createVoicingPlayer } from "../src/components/music/voicing-audio.ts";
import { makeChord, midi, pianoVoicing } from "../src/lib/music/index.ts";

const c = pianoVoicing(makeChord("C", "major"), 0);
const d = pianoVoicing(makeChord("D", "major"), 0);

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function fakeContext() {
  const oscillators = [];
  const gains = [];
  return {
    currentTime: 10,
    state: "suspended",
    destination: {},
    oscillators,
    gains,
    resumeCalls: 0,
    closeCalls: 0,
    resume() {
      this.resumeCalls++;
      return Promise.resolve();
    },
    close() {
      this.closeCalls++;
      this.state = "closed";
      return Promise.resolve();
    },
    createOscillator() {
      const oscillator = {
        frequency: { value: 0 },
        onended: null,
        starts: [],
        stops: [],
        disconnected: false,
        connect() {},
        disconnect() {
          this.disconnected = true;
        },
        start(time) {
          this.starts.push(time);
        },
        stop(time) {
          this.stops.push(time);
        },
        finish() {
          this.onended?.();
        },
      };
      oscillators.push(oscillator);
      return oscillator;
    },
    createGain() {
      const gain = {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        disconnected: false,
        connect() {},
        disconnect() {
          this.disconnected = true;
        },
      };
      gains.push(gain);
      return gain;
    },
  };
}

function setup(context = fakeContext()) {
  const states = [];
  const player = createVoicingPlayer(
    () => context,
    (state) => states.push(state),
  );
  return { context, player, states };
}

test("rapid taps share a synchronous lock while audio resumes", async () => {
  const { context, player, states } = setup();
  const pending = deferred();
  context.resume = () => {
    context.resumeCalls++;
    return pending.promise;
  };
  const first = player.play(c);
  const duplicate = player.play(c);
  assert.equal(states.at(-1).playing, true);
  assert.equal(context.resumeCalls, 1);
  assert.equal(context.oscillators.length, 0);
  pending.resolve();
  await Promise.all([first, duplicate]);
  assert.equal(context.oscillators.length, c.voices.length);
  assert.deepEqual(
    context.oscillators.map((oscillator) => oscillator.frequency.value),
    c.voices.map((voice) => 440 * 2 ** ((midi(voice.pitch) - 69) / 12)),
  );
  player.dispose();
});

test("a changed voicing cancels pending audio without reviving it after resume", async () => {
  const { context, player, states } = setup();
  const firstResume = deferred();
  const nextResume = deferred();
  context.resume = () =>
    context.resumeCalls++ === 0 ? firstResume.promise : nextResume.promise;
  const first = player.play(c);
  player.cancel();
  assert.equal(states.at(-1).playing, false);
  const next = player.play(d);
  firstResume.resolve();
  await first;
  assert.equal(context.oscillators.length, 0);
  assert.equal(states.at(-1).playing, true);
  nextResume.resolve();
  await next;
  assert.deepEqual(
    context.oscillators.map((oscillator) => oscillator.frequency.value),
    d.voices.map((voice) => 440 * 2 ** ((midi(voice.pitch) - 69) / 12)),
  );
  player.dispose();
});

test("cancellation stops and disconnects active sounds and permits immediate replay", async () => {
  const { context, player, states } = setup();
  await player.play(c);
  const obsoleteEnd = context.oscillators[0].onended;
  player.cancel();
  assert.equal(states.at(-1).playing, false);
  for (const oscillator of context.oscillators) {
    assert.deepEqual(oscillator.stops, [11.7, undefined]);
    assert.equal(oscillator.disconnected, true);
    assert.equal(oscillator.onended, null);
  }
  assert.ok(context.gains.every((gain) => gain.disconnected));
  await player.play(d);
  obsoleteEnd();
  assert.equal(states.at(-1).playing, true);
  assert.equal(context.closeCalls, 0);
  player.dispose();
});

test("playback unlocks only when its final sounding voice ends", async () => {
  const { context, player, states } = setup();
  await player.play(c);
  context.oscillators[0].finish();
  assert.equal(states.at(-1).playing, true);
  for (const oscillator of context.oscillators.slice(1)) oscillator.finish();
  assert.equal(states.at(-1).playing, false);
  assert.ok(context.oscillators.every((oscillator) => oscillator.disconnected));
  assert.ok(context.gains.every((gain) => gain.disconnected));
  await player.play(c);
  assert.equal(context.oscillators.length, c.voices.length * 2);
  player.dispose();
});

test("resume errors unlock playback and obsolete rejections do not cancel a newer chord", async () => {
  const { context, player, states } = setup();
  context.resume = () => Promise.reject(new Error("blocked"));
  await player.play(c);
  assert.equal(states.at(-1).playing, false);
  assert.match(states.at(-1).message, /retry/);
  const old = deferred();
  context.resume = () => old.promise;
  const obsolete = player.play(c);
  player.cancel();
  context.resume = () => Promise.resolve();
  await player.play(d);
  old.reject(new Error("obsolete"));
  await obsolete;
  assert.deepEqual(states.at(-1), { playing: true, message: "" });
  player.dispose();
});

test("partially scheduled audio is stopped if setup fails", async () => {
  const { context, player, states } = setup();
  const create = context.createOscillator.bind(context);
  context.createOscillator = () => {
    if (context.oscillators.length === 1) throw new Error("setup failed");
    return create();
  };
  await player.play(c);
  assert.equal(states.at(-1).playing, false);
  assert.match(states.at(-1).message, /retry/);
  assert.equal(context.oscillators[0].disconnected, true);
  assert.deepEqual(context.oscillators[0].stops, [11.7, undefined]);
  assert.equal(context.gains[0].disconnected, true);
  player.dispose();
});

test("unavailable audio and factory errors do not leave the player locked", async () => {
  let attempts = 0;
  const states = [];
  const player = createVoicingPlayer(
    () => {
      if (attempts++ === 0) return null;
      throw new Error("unavailable");
    },
    (state) => states.push(state),
  );
  await player.play(c);
  assert.equal(states.at(-1).playing, false);
  assert.match(states.at(-1).message, /available/);
  await player.play(c);
  assert.equal(attempts, 2);
  assert.equal(states.at(-1).playing, false);
  assert.match(states.at(-1).message, /retry/);
  player.dispose();
});

test("unmount closes the context and suppresses pending work and further state updates", async () => {
  const { context, player, states } = setup();
  const pending = deferred();
  context.resume = () => pending.promise;
  context.close = () => {
    context.closeCalls++;
    return Promise.reject(new Error("already closed"));
  };
  const play = player.play(c);
  const before = states.length;
  player.dispose();
  player.dispose();
  pending.resolve();
  await play;
  await player.play(d);
  assert.equal(context.closeCalls, 1);
  assert.equal(context.oscillators.length, 0);
  assert.equal(states.length, before);
});

test("a progression schedules its chord boundaries on the audio clock and advances the active step", async () => {
  const { context, player, states } = setup();
  await player.playSequence([c, d], 1.5);
  assert.deepEqual(
    context.oscillators.map((node) => node.starts[0]),
    [10, 10, 10, 11.5, 11.5, 11.5],
  );
  assert.deepEqual(
    context.oscillators.map((node) => node.stops[0]),
    [11.5, 11.5, 11.5, 13, 13, 13],
  );
  assert.equal(states.at(-1).step, 0);
  for (const node of context.oscillators.slice(0, 3)) node.finish();
  assert.equal(states.at(-1).step, 1);
  for (const node of context.oscillators.slice(3)) node.finish();
  assert.equal(states.at(-1).playing, false);
  player.dispose();
});

test("stopping a progression cancels future notes as well as the current chord", async () => {
  const { context, player, states } = setup();
  await player.playSequence([c, d]);
  player.cancel();
  assert.equal(states.at(-1).playing, false);
  assert.ok(
    context.oscillators.every(
      (node) => node.disconnected && node.stops.at(-1) === undefined,
    ),
  );
  assert.ok(context.oscillators.every((node) => node.onended === null));
  player.dispose();
});

test("reference and progression players cancel one another rather than overlap", async () => {
  const first = setup();
  const second = setup();
  await first.player.playSequence([c, d]);
  await second.player.play(c);
  assert.equal(first.states.at(-1).playing, false);
  assert.ok(first.context.oscillators.every((node) => node.disconnected));
  assert.equal(second.states.at(-1).playing, true);
  first.player.dispose();
  second.player.dispose();
});
