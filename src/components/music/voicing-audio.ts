import { midi, type Voicing } from "../../lib/music/index.ts";

export type PlaybackState = { playing: boolean; message: string };
type PlaybackContext = Pick<
  AudioContext,
  | "currentTime"
  | "destination"
  | "state"
  | "resume"
  | "close"
  | "createOscillator"
  | "createGain"
>;
type Sound = { oscillator: OscillatorNode; gain: GainNode };

/** One pending or sounding voicing at a time, with cancellation across async resume. */
export function createVoicingPlayer(
  createContext: () => PlaybackContext | null,
  onChange: (state: PlaybackState) => void,
) {
  let context: PlaybackContext | null = null;
  let generation = 0;
  let active = false;
  let disposed = false;
  const sounds = new Set<Sound>();

  function release(sound: Sound, stop = false) {
    sounds.delete(sound);
    sound.oscillator.onended = null;
    if (stop) {
      try {
        sound.oscillator.stop();
      } catch {
        // A partially initialized oscillator may not have started yet.
      }
    }
    sound.oscillator.disconnect();
    sound.gain.disconnect();
  }

  function cancel() {
    generation++;
    for (const sound of sounds) release(sound, true);
    active = false;
    if (!disposed) onChange({ playing: false, message: "" });
  }

  async function play(voicing: Voicing) {
    if (active || disposed) return;
    // Lock synchronously: React may not have disabled the button before another tap.
    active = true;
    const request = ++generation;
    onChange({ playing: true, message: "" });
    try {
      if (!context || context.state === "closed") context = createContext();
      if (!context) {
        active = false;
        onChange({
          playing: false,
          message: "Audio isn’t available in this browser.",
        });
        return;
      }
      const ctx = context;
      await ctx.resume();
      if (request !== generation || disposed) return;
      const now = ctx.currentTime;
      for (const voice of voicing.voices) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const sound = { oscillator, gain };
        sounds.add(sound);
        oscillator.type = "triangle";
        oscillator.frequency.value = 440 * 2 ** ((midi(voice.pitch) - 69) / 12);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(
          0.2 / voicing.voices.length,
          now + 0.025,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.onended = () => {
          release(sound);
          if (!sounds.size && request === generation && !disposed) {
            active = false;
            onChange({ playing: false, message: "" });
          }
        };
        oscillator.start(now);
        oscillator.stop(now + 1.7);
      }
      if (!sounds.size) {
        active = false;
        onChange({ playing: false, message: "" });
      }
    } catch {
      if (request !== generation || disposed) return;
      cancel();
      onChange({
        playing: false,
        message: "Couldn’t start audio. Tap again to retry.",
      });
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancel();
    // Closing a browser context can reject; teardown must not leak that rejection.
    if (context) void context.close().catch(() => {});
    context = null;
  }

  return { play, cancel, dispose };
}
