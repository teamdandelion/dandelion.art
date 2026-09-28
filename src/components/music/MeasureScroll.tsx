import { type RefObject, useEffect, useRef, useState } from "react";
import { timingPosition } from "../../lib/music/practice-timing";

export default function MeasureScroll({
  score,
  bars,
  onActiveLine,
}: {
  score: RefObject<HTMLDivElement | null>;
  bars: number[];
  onActiveLine: (line: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(72);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const beat = useRef(0);
  const [currentBar, setCurrentBar] = useState(1);
  const totalBars = bars.reduce((sum, count) => sum + count, 0);
  // Editing the draft map starts a fresh pass rather than silently changing position.
  useEffect(() => {
    setPlaying(false);
    beat.current = 0;
    const start = timingPosition(bars, beatsPerBar, 0);
    setCurrentBar(start.bar);
    onActiveLine(start.line);
  }, [bars, beatsPerBar, onActiveLine]);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = 0;
    const stop = () => setPlaying(false);
    const tick = (now: number) => {
      if (document.hidden || document.querySelector("dialog[open]")) {
        stop();
        return;
      }
      beat.current += (((now - last) / 1000) * bpm) / 60;
      last = now;
      const position = timingPosition(bars, beatsPerBar, beat.current);
      setCurrentBar(position.bar);
      onActiveLine(position.line);
      const lines = score.current?.querySelectorAll<HTMLElement>(".song-line");
      const current = lines?.[position.line];
      const next = lines?.[position.line + 1];
      if (current) {
        const from = current.getBoundingClientRect().top + window.scrollY;
        const to = next
          ? next.getBoundingClientRect().top + window.scrollY
          : from + current.offsetHeight;
        // Musical time is independent of pixel distance and responsive wrapping.
        window.scrollTo(
          0,
          Math.max(
            0,
            from + (to - from) * position.progress - innerHeight * 0.4,
          ),
        );
      }
      if (position.done) stop();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    document.addEventListener("visibilitychange", stop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [playing, bpm, beatsPerBar, bars, score, onActiveLine]);
  return (
    <>
      <div className="song-practice-controls">
        <button
          type="button"
          aria-pressed={playing}
          onClick={() => {
            if (timingPosition(bars, beatsPerBar, beat.current).done)
              beat.current = 0;
            setPlaying(!playing);
          }}
        >
          {playing ? "Pause measures" : "Start measures"}
        </button>
        <fieldset className="song-speed" aria-label="Practice tempo">
          <button
            type="button"
            aria-label="Slower tempo"
            disabled={bpm === 24}
            onClick={() => setBpm((value) => Math.max(24, value - 4))}
          >
            −
          </button>
          <output aria-label="Practice BPM">{bpm} BPM</output>
          <button
            type="button"
            aria-label="Faster tempo"
            disabled={bpm === 200}
            onClick={() => setBpm((value) => Math.min(200, value + 4))}
          >
            +
          </button>
        </fieldset>
      </div>
      <div className="song-timing-options">
        <label>
          Beats/bar{" "}
          <select
            aria-label="Beats per bar"
            value={beatsPerBar}
            onChange={(event) => setBeatsPerBar(Number(event.target.value))}
          >
            {[2, 3, 4, 6].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <output aria-label="Current measure">
          Bar {currentBar}/{totalBars}
        </output>
        <button
          type="button"
          aria-label="Restart measures"
          onClick={() => {
            setPlaying(false);
            beat.current = 0;
            setCurrentBar(1);
            onActiveLine(0);
          }}
        >
          ↺
        </button>
        <small>Draft timing · adjust bars beside each line</small>
      </div>
    </>
  );
}
