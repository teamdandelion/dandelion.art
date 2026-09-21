import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type FrettedInstrument,
  formatNote,
  type Key,
  keyScale,
  midi,
  parseNote,
  pitchClassNumber,
} from "../../lib/music";
import {
  fretboardPitches,
  identifyChords,
  noteAt,
} from "../../lib/music/fretboard";
import MusicSettings, { useMusicPreferences } from "./MusicSettings";
import "./chord-atlas.css";
import "./chord-cheat-sheet.css";
import "./fretboard.css";

function Board({
  instrument,
  tonalKey,
}: {
  instrument: FrettedInstrument;
  tonalKey: Key;
}) {
  const [frets, setFrets] = useState<(number | null)[]>(
    instrument.courses.map(() => 0),
  );
  const help = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    if (!helpOpen) return;
    const dialog = help.current;
    const previous = document.documentElement.style.overflow;
    dialog?.showModal();
    if (dialog) dialog.scrollTop = 0;
    document.documentElement.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.documentElement.style.overflow = previous;
      opener.current?.focus({ preventScroll: true });
    };
  }, [helpOpen]);
  const pitches = fretboardPitches(instrument, frets);
  const matches = identifyChords(pitches, tonalKey);
  const scale = new Set(keyScale(tonalKey).map(pitchClassNumber));
  const positions = [null, ...Array.from({ length: 13 }, (_, i) => i)];
  const select = (index: number, fret: number | null) =>
    setFrets((current) =>
      current.map((value, i) => (index === i ? fret : value)),
    );
  return (
    <>
      <div className="fb-toolbar">
        <button
          className="ca-button"
          type="button"
          onClick={() => setFrets(instrument.courses.map(() => 0))}
        >
          Open strings
        </button>
        <button
          className="ca-button"
          type="button"
          onClick={() => setFrets(instrument.courses.map(() => null))}
        >
          Mute all
        </button>
        <button
          className="cs-help-button"
          ref={opener}
          type="button"
          aria-label="How to use the fretboard"
          aria-haspopup="dialog"
          onClick={() => setHelpOpen(true)}
        >
          ?
        </button>
      </div>
      <section
        className="fb-results"
        aria-label="Chord matches"
        aria-live="polite"
      >
        {matches.length ? (
          <>
            <div className="fb-matches">
              {matches.map(({ chord, bass }) => (
                <a
                  key={chord.id}
                  href={`/music/chords?chord=${encodeURIComponent(chord.symbol)}`}
                >
                  <strong>{chord.symbol}</strong>
                  {pitchClassNumber(chord.root) !==
                    pitchClassNumber(parseNote(bass)) && <span> / {bass}</span>}
                </a>
              ))}
            </div>
            <p>
              {[
                ...new Set(pitches.map((p) => formatNote(noteAt(p, tonalKey)))),
              ].join(" · ")}
            </p>
          </>
        ) : (
          <>
            <strong>
              {pitches.length ? "No exact chord match" : "All strings muted"}
            </strong>
            <p>
              {pitches.length
                ? [
                    ...new Set(
                      pitches.map((p) => formatNote(noteAt(p, tonalKey))),
                    ),
                  ].join(" · ")
                : "—"}
            </p>
          </>
        )}
      </section>
      <section className="fb-scroll" aria-label="Fretboard, high string at top">
        <div className="fb-board">
          <div className="fb-row fb-fret-numbers" aria-hidden="true">
            <span className="fb-string-heading">String</span>
            {positions.map((f) => (
              <span key={f ?? "mute"}>
                {f === null ? "×" : f === 0 ? "Open" : f}
              </span>
            ))}
          </div>
          {[...instrument.courses].reverse().map((course) => {
            const index = instrument.courses.indexOf(course);
            const open = course.strings[0].open;
            return (
              <fieldset
                className="fb-row"
                key={course.number}
                aria-label={`String ${course.number}, ${formatNote(open.note)}`}
              >
                <span className="fb-string-heading" aria-hidden="true">
                  {course.number} · {formatNote(open.note)}
                </span>
                {positions.map((fret, i) => {
                  const pitch = fret === null ? null : midi(open) + fret;
                  const label =
                    pitch === null ? "×" : formatNote(noteAt(pitch, tonalKey));
                  return (
                    <button
                      key={fret ?? "mute"}
                      type="button"
                      className={`fb-note${pitch !== null && scale.has(pitch % 12) ? " fb-in-key" : ""}`}
                      aria-pressed={frets[index] === fret}
                      tabIndex={frets[index] === fret ? 0 : -1}
                      aria-label={`String ${course.number}, ${fret === null ? "mute" : fret === 0 ? `open ${label}` : `fret ${fret}, ${label}`}`}
                      onClick={() => select(index, fret)}
                      onKeyDown={(event) => {
                        const next =
                          event.key === "ArrowRight"
                            ? Math.min(i + 1, positions.length - 1)
                            : event.key === "ArrowLeft"
                              ? Math.max(i - 1, 0)
                              : event.key === "Home"
                                ? 0
                                : event.key === "End"
                                  ? positions.length - 1
                                  : null;
                        if (next === null) return;
                        event.preventDefault();
                        select(index, positions[next]);
                        event.currentTarget.parentElement
                          ?.querySelectorAll<HTMLButtonElement>("button")
                          [next]?.focus();
                      }}
                      style={
                        {
                          "--string-width": `${1 + index * 0.3}px`,
                        } as CSSProperties
                      }
                    >
                      <span className="fb-note-name">{label}</span>
                    </button>
                  );
                })}
              </fieldset>
            );
          })}
        </div>
      </section>
      <dialog
        ref={help}
        className="cs-modal"
        aria-labelledby="fretboard-help-title"
        onCancel={(event) => {
          event.preventDefault();
          setHelpOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            event.preventDefault();
            help.current?.querySelector<HTMLButtonElement>("button")?.focus();
          }
        }}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            const r = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < r.left ||
              event.clientX > r.right ||
              event.clientY < r.top ||
              event.clientY > r.bottom
            ) {
              event.preventDefault();
              setHelpOpen(false);
            }
          }
        }}
      >
        <div className="cs-modal-content">
          <header>
            <h2 id="fretboard-help-title">Fretboard</h2>
            <button
              type="button"
              className="cs-close"
              aria-label="Close fretboard help"
              onClick={() => setHelpOpen(false)}
            >
              ×
            </button>
          </header>
          <p>
            Each row is a string, with string 1 at the top. Swipe sideways for
            higher frets. Tap one fret per string; unmarked strings stay open.
            Use × to mute a string, or “Mute all” to build a shape from silence.
            Arrow keys move along a string.
          </p>
          <p>
            The tinted notes belong to your selected key. Chord detection uses
            every sounding string, including open strings, and matches pitch
            classes exactly against the supported chord vocabulary. Slash names
            show a bass note other than the root. A shape can have multiple
            valid names; its musical context decides which is useful.
          </p>
          <p>
            On baritone uke, leave D, G, and B open and fret string 1 at 3:
            D–G–B–G is G/D, a G chord with D in the bass. “No exact chord match”
            does not mean the notes are wrong; incomplete chords and other
            extensions are not named yet.
          </p>
        </div>
      </dialog>
    </>
  );
}

export default function FretboardExplorer() {
  const { instrument, tonic, mode } = useMusicPreferences();
  const tonalKey = useMemo<Key>(
    () => ({ tonic: parseNote(tonic), mode }),
    [tonic, mode],
  );
  return (
    <article className="chord-atlas fretboard-explorer">
      <nav className="cs-nav" aria-label="Music tools">
        <a href="/music">Music</a>
        <a href="/music/cheat-sheet">Cheat sheet ↗</a>
        <a href="/music/chords">Chord atlas ↗</a>
      </nav>
      <header className="cs-intro">
        <h1>Fretboard</h1>
      </header>
      <MusicSettings />
      <Board key={instrument.id} instrument={instrument} tonalKey={tonalKey} />
    </article>
  );
}
