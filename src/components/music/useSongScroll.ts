import { useCallback, useEffect, useRef, useState } from "react";
import { SongScroll } from "../../lib/music/song-scroll";

/** DOM adapter: input and animation lifecycle only; motion lives in SongScroll. */
export function useSongScroll(speed: number) {
  const model = useRef(new SongScroll());
  const wake = useRef(() => {});
  const [scrolling, updateScrolling] = useState(false);
  const setScrolling = useCallback((enabled: boolean) => {
    model.current.setRunning(enabled, performance.now(), window.scrollY);
    updateScrolling(enabled);
    wake.current();
  }, []);
  useEffect(() => {
    model.current.setSpeed(speed);
  }, [speed]);
  useEffect(() => {
    const motion = model.current;
    let frame = 0;
    let touching = false;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const restore = () => {
      root.style.scrollBehavior = previousBehavior;
    };
    const tick = (now: number) => {
      frame = 0;
      if (document.querySelector("dialog[open]")) {
        setScrolling(false);
        restore();
        return;
      }
      motion.observe(now, window.scrollY);
      const position = motion.advance(now, root.scrollHeight - innerHeight);
      if (position !== null)
        window.scrollTo({ top: position, behavior: "auto" });
      updateScrolling(motion.running);
      if (motion.active) frame = requestAnimationFrame(tick);
      else restore();
    };
    wake.current = () => {
      if (!frame && motion.active) {
        // Avoid browser/CSS smooth scrolling competing with our animation.
        root.style.scrollBehavior = "auto";
        frame = requestAnimationFrame(tick);
      }
    };
    const control = (event: Event) =>
      event.target instanceof Element &&
      Boolean(event.target.closest(".song-practice-controls"));
    const manual = () =>
      motion.manual(performance.now(), window.scrollY, touching);
    const touchStart = (event: Event) => {
      if (control(event)) return;
      touching = true;
      manual();
    };
    const touchEnd = () => {
      if (touching) {
        touching = false;
        manual();
      }
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && !control(event)) manual();
    };
    const keydown = (event: KeyboardEvent) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key) &&
        !(event.key === " " && control(event))
      )
        manual();
    };
    const observe = () => motion.observe(performance.now(), window.scrollY);
    const stop = () => setScrolling(false);
    window.addEventListener("wheel", manual, { passive: true });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("touchcancel", touchEnd, { passive: true });
    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("keydown", keydown);
    window.addEventListener("scroll", observe, { passive: true });
    document.addEventListener("visibilitychange", stop);
    return () => {
      cancelAnimationFrame(frame);
      restore();
      wake.current = () => {};
      window.removeEventListener("wheel", manual);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("scroll", observe);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [setScrolling]);
  return {
    scrolling,
    setScrolling,
    skip: (direction: number) => {
      model.current.nudge(
        (direction * innerHeight) / 2,
        performance.now(),
        window.scrollY,
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      wake.current();
    },
  };
}
