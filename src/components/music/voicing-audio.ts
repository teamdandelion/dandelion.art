import { midi, type Voicing } from "../../lib/music/index.ts";

export type PlaybackState = {
  playing: boolean;
  message: string;
  step?: number;
};
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
type Sound = { oscillator: OscillatorNode; gain: GainNode; step: number };
// The reference and progression players must not sound over one another.
let releaseAudioFocus: (() => void) | null = null;

/** One pending or sounding performance, with cancellation across async resume. */
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
    if (releaseAudioFocus === cancel) releaseAudioFocus = null;
    for (const sound of sounds) release(sound, true);
    active = false;
    if (!disposed) onChange({ playing: false, message: "" });
  }

  async function start(
    voicings: Voicing[],
    duration: number,
    sequence: boolean,
  ) {
    if (active || disposed) return;
    if (!voicings.length || !Number.isFinite(duration) || duration < 0.2)
      return;
    releaseAudioFocus?.();
    releaseAudioFocus = cancel;
    // Lock synchronously: React may not have disabled the button before another tap.
    active = true;
    const request = ++generation;
    onChange({ playing: true, message: "", ...(sequence ? { step: 0 } : {}) });
    try {
      if (!context || context.state === "closed") context = createContext();
      if (!context) {
        active = false;
        if (releaseAudioFocus === cancel) releaseAudioFocus = null;
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
      for (const [step, voicing] of voicings.entries())
        for (const voice of voicing.voices) {
          const begins = now + step * duration;
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          const sound = { oscillator, gain, step };
          sounds.add(sound);
          oscillator.type = "triangle";
          oscillator.frequency.value =
            440 * 2 ** ((midi(voice.pitch) - 69) / 12);
          gain.gain.setValueAtTime(0, begins);
          gain.gain.linearRampToValueAtTime(
            0.2 / voicing.voices.length,
            begins + 0.025,
          );
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            begins + duration - 0.1,
          );
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.onended = () => {
            release(sound);
            if (!sounds.size && request === generation && !disposed) {
              active = false;
              if (releaseAudioFocus === cancel) releaseAudioFocus = null;
              onChange({ playing: false, message: "" });
            } else if (
              sequence &&
              request === generation &&
              !disposed &&
              ![...sounds].some((item) => item.step === step)
            ) {
              onChange({
                playing: true,
                message: "",
                step: Math.min(...[...sounds].map((item) => item.step)),
              });
            }
          };
          oscillator.start(begins);
          oscillator.stop(begins + duration);
        }
      if (!sounds.size) {
        active = false;
        if (releaseAudioFocus === cancel) releaseAudioFocus = null;
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

  return {
    play: (voicing: Voicing) => start([voicing], 1.7, false),
    playSequence: (voicings: Voicing[], secondsPerChord = 1.5) =>
      start(voicings, secondsPerChord, true),
    cancel,
    dispose,
  };
}
