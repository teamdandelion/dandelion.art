import { useEffect, useState } from "react";

/** One animation owns both steady scrolling and half-page corrections. */
export function useSongScroll(speed: number) {
  const [scrolling, setScrolling] = useState(false);
  const [jump, setJump] = useState<{ direction: number } | null>(null);
  useEffect(() => {
    if (!scrolling && !jump) return;
    let frame = 0;
    let last = performance.now();
    let position = window.scrollY;
    let written = position;
    let touching = false;
    let resumeAt = 0;
    const start = position;
    const distance = (jump?.direction ?? 0) * window.innerHeight * 0.5;
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 320;
    const began = last;
    let jumping = Boolean(jump);
    const manual = () => {
      jumping = false;
      resumeAt = performance.now() + 180;
    };
    const touchStart = () => {
      touching = true;
      manual();
    };
    const touchEnd = () => {
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
      setJump(null);
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
      } else if (jumping) {
        const progress = duration ? Math.min(1, (now - began) / duration) : 1;
        position = start + distance * (1 - (1 - progress) ** 3);
        if (progress === 1) jumping = false;
      } else if (scrolling) {
        position += (Math.min(now - last, 100) * speed) / 1000;
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
        if (scrolling && !jumping && position >= max) {
          stop();
          return;
        }
      }
      if (!jumping && jump) {
        setJump(null);
        return;
      }
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
  }, [scrolling, speed, jump]);
  return {
    scrolling,
    setScrolling,
    skip: (direction: number) => setJump({ direction }),
  };
}
