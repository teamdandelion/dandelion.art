import { SCROLL_PULSE_MS, scrollPulseProgress } from "./scroll-pulse.ts";

/** Browser-independent motion state. Times are milliseconds; positions are CSS pixels. */
export class SongScroll {
  private position = 0;
  private last: number | null = null;
  private speed = 12;
  private playing = false;
  private holding = false;
  private manualUntil = -Infinity;
  private pulses: { distance: number; elapsed: number; duration: number }[] =
    [];

  get running() {
    return this.playing;
  }
  get active() {
    return this.playing || this.pulses.length > 0;
  }
  setSpeed(pixelsPerSecond: number) {
    this.speed = pixelsPerSecond;
  }
  setRunning(enabled: boolean, now: number, position: number) {
    if (!this.active) this.position = position;
    this.playing = enabled;
    if (!enabled) {
      this.pulses = [];
      this.holding = false;
      this.manualUntil = -Infinity;
    }
    this.last = now;
  }
  nudge(
    distance: number,
    now: number,
    position: number,
    reducedMotion = false,
  ) {
    if (!this.active) {
      this.position = position;
      this.last = now;
    }
    this.holding = false;
    this.manualUntil = -Infinity;
    this.pulses.push({
      distance,
      elapsed: 0,
      duration: reducedMotion ? 0 : SCROLL_PULSE_MS,
    });
  }
  /** Only explicit user input starts manual control, never our own scroll events. */
  manual(now: number, position: number, holding = false) {
    this.pulses = [];
    this.position = position;
    this.holding = holding;
    this.manualUntil = now + 180;
    this.last = now;
  }
  observe(now: number, position: number) {
    if (this.holding || now < this.manualUntil) {
      if (position !== this.position) this.manualUntil = now + 180;
      this.position = position;
    }
  }
  advance(now: number, maximum: number): number | null {
    const dt = Math.max(0, Math.min(100, now - (this.last ?? now)));
    this.last = now;
    if (!this.active || this.holding || now < this.manualUntil) return null;
    if (this.playing) this.position += (dt * this.speed) / 1000;
    for (const pulse of this.pulses) {
      const before =
        pulse.duration === 0
          ? 0
          : scrollPulseProgress(pulse.elapsed, pulse.duration);
      pulse.elapsed += dt;
      this.position +=
        pulse.distance *
        (scrollPulseProgress(pulse.elapsed, pulse.duration) - before);
    }
    this.pulses = this.pulses.filter((pulse) => pulse.elapsed < pulse.duration);
    this.position = Math.max(0, Math.min(Math.max(0, maximum), this.position));
    if (this.position >= maximum && !this.pulses.length) this.playing = false;
    return this.position;
  }
}
