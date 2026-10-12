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
import UkeDiagram from "./UkeDiagram";
import { useSongScroll } from "./useSongScroll";
import { PlayButton } from "./VoicingPlayback";
import VoicingWidget from "./VoicingWidget";
import "./chord-atlas.css";
import "./chord-cheat-sheet.css";
import "./songs.css";
import { rememberSong } from "../../lib/music/song-recents";

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
  const [preview, setPreview] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [speed, setSpeed] = useState(12);
  const { scrolling, setScrolling, skip } = useSongScroll(speed);
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
  }, [active, setScrolling]);
  function selectedVoicing(symbol: string) {
    const { chord, fingerings } = shapes[symbol];
    const index = Math.max(
      0,
      fingerings.findIndex(
        (shape) => shape.frets.join(",") === choices[symbol],
      ),
    );
    return { chord, fingerings, index, shape: fingerings[index] };
  }
  function renderVoicing(symbol: string, withPlayback = false) {
    const { chord, fingerings, index, shape } = selectedVoicing(symbol);
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
  const previewVoicing = preview ? selectedVoicing(preview) : null;
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
            disabled={speed === 4}
            onClick={() => setSpeed((value) => Math.max(4, value - 4))}
          >
            −
          </button>
          <output aria-live="polite" aria-label="Scroll speed level">
            {speed} px/s
          </output>
          <button
            type="button"
            aria-label="Faster autoscroll"
            disabled={speed === 60}
            onClick={() => setSpeed((value) => Math.min(60, value + 4))}
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
        onPreview={(symbol) => {
          setPreview(symbol);
          if (symbol) setScrolling(false);
        }}
        onChord={(symbol, button) => {
          trigger.current = button;
          setActive(symbol);
        }}
      />
      <fieldset className="song-page-skips" aria-label="Adjust song position">
        <button
          type="button"
          aria-label="Back half a page"
          title="Back half a page"
          onClick={() => skip(-1)}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Forward half a page"
          title="Forward half a page"
          onClick={() => skip(1)}
        >
          ↓
        </button>
      </fieldset>
      {preview && (
        <output
          className="song-hold-preview"
          aria-label={`${preview} voicing preview`}
        >
          <span className="song-preview-title">{preview}</span>
          {previewVoicing?.shape ? (
            <UkeDiagram
              chord={previewVoicing.chord}
              fingering={previewVoicing.shape}
              instrument={instrument}
              reference
            />
          ) : (
            <span>No shape available for this tuning.</span>
          )}
        </output>
      )}
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
  useEffect(() => {
    rememberSong(song.id);
  }, [song.id]);
  return (
    <article className="chord-atlas song-page">
      <nav aria-label="Music tools">
        <a href="/music/songs/">← Songs</a>
      </nav>
      <header className="song-heading">
        <p className="song-eyebrow">{song.artist}</p>
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
