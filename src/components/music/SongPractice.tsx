import { useEffect, useMemo, useRef, useState } from "react";
import {
  type FrettedInstrument,
  INSTRUMENTS,
  pitchClassNumber,
} from "../../lib/music";
import { parseChordSelection } from "../../lib/music/analysis";
import { type Song, songChords } from "../../lib/music/song";
import { chordHref } from "../../lib/music/voicing-link";
import { searchVoicings } from "../../lib/music/voicing-search";
import { useMusicPreferences } from "./MusicSettings";
import SongScore from "./SongScore";
import { PlayButton } from "./VoicingPlayback";
import VoicingWidget from "./VoicingWidget";
import "./chord-atlas.css";
import "./chord-cheat-sheet.css";
import "./songs.css";

function Practice({
  song,
  instrument,
}: {
  song: Song;
  instrument: FrettedInstrument;
}) {
  const symbols = useMemo(() => songChords(song), [song]);
  const storageKey = `music.song-shapes.v1:${song.id}:${instrument.id}`;
  const [choices, setChoices] = useState<Record<string, string>>(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? "{}",
      );
      if (saved && typeof saved === "object" && !Array.isArray(saved))
        return Object.fromEntries(
          Object.entries(saved).filter(
            ([symbol, value]) =>
              symbols.includes(symbol) && typeof value === "string",
          ),
        );
    } catch {
      /* Defaults also work when storage is unavailable. */
    }
    return {};
  });
  const [active, setActive] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [scrolling, setScrolling] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(2);
  const speed = speedLevel * 8;
  const shapes = useMemo(
    () =>
      Object.fromEntries(
        symbols.map((symbol) => {
          const selection = parseChordSelection(symbol);
          if (!selection) throw new Error(`Invalid song chord: ${symbol}`);
          return [
            symbol,
            {
              chord: selection.chord,
              fingerings: searchVoicings(selection.chord, instrument, {
                bass: selection.bass
                  ? pitchClassNumber(selection.bass)
                  : undefined,
              }),
            },
          ];
        }),
      ),
    [symbols, instrument],
  );
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(choices));
    } catch {
      /* Session-only fallback. */
    }
  }, [choices, storageKey]);
  useEffect(() => {
    if (!active) return;
    setScrolling(false);
    const node = dialog.current;
    const previous = document.documentElement.style.overflow;
    node?.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      node?.close();
      document.documentElement.style.overflow = previous;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [active]);
  useEffect(() => {
    if (!scrolling) return;
    let frame = 0;
    let last = performance.now();
    let position = window.scrollY;
    const tick = (now: number) => {
      if (document.querySelector("dialog[open]")) {
        setScrolling(false);
        return;
      }
      position += (Math.min(now - last, 100) * speed) / 1000;
      last = now;
      window.scrollTo(0, position);
      if (
        window.scrollY + innerHeight >=
        document.documentElement.scrollHeight - 2
      )
        setScrolling(false);
      else frame = requestAnimationFrame(tick);
    };
    const stop = () => setScrolling(false);
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
  }, [scrolling, speed]);
  function renderVoicing(symbol: string, withPlayback = false) {
    const { chord, fingerings } = shapes[symbol];
    const index = Math.max(
      0,
      fingerings.findIndex(
        (shape) => shape.frets.join(",") === choices[symbol],
      ),
    );
    const shape = fingerings[index];
    if (!shape) return <p>No {symbol} shape available for this tuning.</p>;
    const choose = (next: number) =>
      setChoices((current) => ({
        ...current,
        [symbol]: fingerings[next].frets.join(","),
      }));
    return (
      <>
        <VoicingWidget
          title={symbol}
          chord={chord}
          fingering={shape}
          instrument={instrument}
          diagramHref={chordHref(instrument, shape.frets, symbol)}
          navigation={{
            index,
            count: fingerings.length,
            previous: () =>
              choose((index - 1 + fingerings.length) % fingerings.length),
            next: () => choose((index + 1) % fingerings.length),
          }}
        />
        {withPlayback && <PlayButton voicing={shape.voicing} />}
      </>
    );
  }
  return (
    <>
      <div className="song-practice-controls">
        <button
          type="button"
          aria-pressed={scrolling}
          onClick={() => setScrolling(!scrolling)}
        >
          {scrolling ? "Pause autoscroll" : "Start autoscroll"}
        </button>
        <fieldset className="song-speed" aria-label="Scroll speed">
          <button
            type="button"
            aria-label="Slower autoscroll"
            disabled={speedLevel === 1}
            onClick={() => setSpeedLevel((level) => Math.max(1, level - 1))}
          >
            −
          </button>
          <output aria-live="polite" aria-label="Scroll speed level">
            Speed {speedLevel}
          </output>
          <button
            type="button"
            aria-label="Faster autoscroll"
            disabled={speedLevel === 7}
            onClick={() => setSpeedLevel((level) => Math.min(7, level + 1))}
          >
            +
          </button>
        </fieldset>
      </div>
      <details className="song-voicings">
        <summary>Voicings · {symbols.join(" · ")}</summary>
        <div className="song-shapes">
          {symbols.map((symbol) => (
            <div className="song-shape" key={symbol}>
              {renderVoicing(symbol)}
            </div>
          ))}
        </div>
      </details>
      <SongScore
        song={song}
        onChord={(symbol, button) => {
          trigger.current = button;
          setActive(symbol);
        }}
      />
      <p className="song-source">
        Arrangement from {song.source.toLowerCase()}. Chord placement follows
        the supplied chart; autoscroll speed is not a tempo marking.
      </p>
      <dialog
        className="cs-modal song-modal"
        ref={dialog}
        aria-label={`${active ?? "Chord"} voicing`}
        onCancel={(event) => {
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          setActive(null);
        }}
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            setActive(null);
        }}
      >
        {active && (
          <div className="cs-modal-content">
            <header>
              <p>{instrument.name}</p>
              <button
                className="cs-close"
                type="button"
                aria-label="Close chord voicing"
                onClick={() => setActive(null)}
              >
                ×
              </button>
            </header>
            {renderVoicing(active, true)}
          </div>
        )}
      </dialog>
    </>
  );
}

export default function SongPractice({ song }: { song: Song }) {
  const { ready, instrument, update } = useMusicPreferences();
  return (
    <article className="chord-atlas song-page">
      <nav aria-label="Music tools">
        <a href="/music/songs/">← Songs</a>
        <a href="/music/chords/">Chords ↗</a>
      </nav>
      <header className="song-heading">
        <p className="song-eyebrow">Practice / {song.artist}</p>
        <h1>{song.title}</h1>
        {song.note && <p className="song-source">{song.note}</p>}
        <label className="song-instrument">
          Instrument{" "}
          <select
            aria-label="Song instrument"
            value={ready ? instrument.id : ""}
            disabled={!ready}
            onChange={(event) => update({ instrumentId: event.target.value })}
          >
            {!ready && <option value="">Loading…</option>}
            {INSTRUMENTS.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      {ready ? (
        <Practice
          key={`${song.id}:${instrument.id}`}
          song={song}
          instrument={instrument}
        />
      ) : (
        <p>Loading your instrument…</p>
      )}
    </article>
  );
}
