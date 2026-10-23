import { useCallback, useEffect, useRef, useState } from "react";
import {
  SCROLL_PULSE_MS,
  scrollPulseProgress,
} from "../../lib/music/scroll-pulse";

/** One animation owns both steady scrolling and half-page corrections. */
export function useSongScroll(speed: number) {
  const [scrolling, updateScrolling] = useState(false);
  const pulses = useRef<
    { distance: number; elapsed: number; duration: number }[]
  >([]);
  const [wake, setWake] = useState(0);
  const setScrolling = useCallback((enabled: boolean) => {
    if (!enabled) pulses.current = [];
    updateScrolling(enabled);
  }, []);
  useEffect(() => {
    // A new request wakes an idle loop without restarting existing pulses.
    void wake;
    if (!scrolling && !pulses.current.length) return;
    let frame = 0;
    let last = performance.now();
    let position = window.scrollY;
    let written = position;
    let touching = false;
    let resumeAt = 0;
    const manual = () => {
      pulses.current = [];
      resumeAt = performance.now() + 180;
    };
    const isControl = (event: Event) =>
      event.target instanceof Element &&
      Boolean(event.target.closest(".song-practice-controls"));
    const touchStart = (event: Event) => {
      if (isControl(event)) return;
      touching = true;
      manual();
    };
    const touchEnd = () => {
      if (!touching) return;
      touching = false;
      manual();
    };
    const scroll = () => {
      // Native scroll events also fire for our writes. Only external movement
      // should suspend animation, including momentum after a finger lifts.
      if (Math.abs(window.scrollY - written) > 1) manual();
    };
    const stop = () => {
      setScrolling(false);
      pulses.current = [];
    };
    const tick = (now: number) => {
      if (document.querySelector("dialog[open]")) {
        stop();
        return;
      }
      if (Math.abs(window.scrollY - written) > 1) {
        position = window.scrollY;
        written = position;
        manual();
      }
      if (touching || now < resumeAt) {
        position = window.scrollY;
      } else {
        const dt = Math.min(now - last, 100);
        if (scrolling) position += (dt * speed) / 1000;
        for (const pulse of pulses.current) {
          const previous =
            pulse.duration === 0
              ? 0
              : scrollPulseProgress(pulse.elapsed, pulse.duration);
          pulse.elapsed += dt;
          position +=
            pulse.distance *
            (scrollPulseProgress(pulse.elapsed, pulse.duration) - previous);
        }
        pulses.current = pulses.current.filter(
          (pulse) => pulse.elapsed < pulse.duration,
        );
      }
      last = now;
      if (!touching && now >= resumeAt) {
        const max = Math.max(
          0,
          document.documentElement.scrollHeight - innerHeight,
        );
        position = Math.max(0, Math.min(max, position));
        window.scrollTo({ top: position, behavior: "instant" });
        written = window.scrollY;
        if (scrolling && !pulses.current.length && position >= max) {
          stop();
          return;
        }
      }
      if (scrolling || pulses.current.length)
        frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("wheel", manual, { passive: true });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("touchcancel", touchEnd, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", stop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", manual);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [scrolling, speed, wake, setScrolling]);
  return {
    scrolling,
    setScrolling,
    skip: (direction: number) => {
      pulses.current.push({
        distance: direction * innerHeight * 0.5,
        elapsed: 0,
        duration: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : SCROLL_PULSE_MS,
      });
      setWake((value) => value + 1);
    },
  };
}
