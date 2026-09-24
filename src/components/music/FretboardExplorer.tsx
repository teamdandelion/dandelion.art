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
  formatPitch,
  type Key,
  keyScale,
  midi,
  parseNote,
  pitchClassNumber,
} from "../../lib/music";
import {
  FRET_MARKERS,
  fretboardPitches,
  identifyChords,
  pitchAt,
  predictFretboard,
  recognitionLabel,
} from "../../lib/music/fretboard";
import { useMusicPreferences } from "./MusicSettings";
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
  const predictions = useMemo(
    () => predictFretboard(instrument, frets, tonalKey),
    [instrument, frets, tonalKey],
  );
  const [preview, setPreview] = useState("");
  const noteList = [...new Set(pitches)]
    .map((p) => formatPitch(pitchAt(p, tonalKey)))
    .join(" · ");
  const matches = identifyChords(pitches, tonalKey, true);
  const scale = new Set(keyScale(tonalKey).map(pitchClassNumber));
  const positions = [null, ...Array.from({ length: 13 }, (_, i) => i)];
  const select = (index: number, fret: number | null) =>
    setFrets((current) =>
      current.map((value, i) => (index === i ? fret : value)),
    );
  return (
    <>
      <div className="fb-help">
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
          <div className="fb-matches">
            {matches.map(({ chord, bass, coverage }) => (
              <a
                key={chord.id}
                href={`/music/atlas?${new URLSearchParams({ chord: `${chord.symbol}/${bass}`, instrument: instrument.id, frets: frets.map((fret) => fret ?? "x").join(",") })}`}
              >
                <strong>{chord.symbol}</strong>
                {pitchClassNumber(chord.root) !==
                  pitchClassNumber(parseNote(bass)) && <span> / {bass}</span>}
                {coverage?.kind === "omitted" && (
                  <small> (fifth omitted)</small>
                )}
              </a>
            ))}
          </div>
        ) : (
          <strong>
            {pitches.length ? "No chord match" : "All strings muted"}
          </strong>
        )}
        <p>{noteList || "—"}</p>
        <output className="fb-preview" aria-live="polite">
          {preview || "\u00a0"}
        </output>
      </section>
      <section className="fb-scroll" aria-label="Fretboard">
        <div
          className="fb-board"
          style={
            { "--string-count": instrument.courses.length } as CSSProperties
          }
        >
          <div className="fb-row fb-fret-numbers" aria-hidden="true">
            <span className="fb-string-heading">
              <span className="fb-wide-label">String</span>
              <span className="fb-narrow-label">Fret</span>
            </span>
            {positions.map((f) => (
              <span key={f ?? "mute"}>
                {f === null ? (
                  "×"
                ) : f === 0 ? (
                  <>
                    <span className="fb-wide-label">Open</span>
                    <span className="fb-narrow-label">○</span>
                  </>
                ) : (
                  f
                )}
              </span>
            ))}
          </div>
          {[...instrument.courses].reverse().map((course) => {
            const index = instrument.courses.indexOf(course);
            const open = course.strings[0].open;
            return (
              <fieldset
                className="fb-row"
                style={{ "--string-column": index + 2 } as CSSProperties}
                key={course.number}
                aria-label={`String ${course.number}, ${formatPitch(open)}`}
              >
                <span className="fb-string-heading" aria-hidden="true">
                  {course.number} · {formatNote(open.note)}
                  <sub>{open.octave}</sub>
                </span>
                {positions.map((fret, i) => {
                  const pitch = fret === null ? null : midi(open) + fret;
                  const spelled =
                    pitch === null ? null : pitchAt(pitch, tonalKey);
                  const label = spelled === null ? "×" : formatPitch(spelled);
                  return (
                    <button
                      key={fret ?? "mute"}
                      type="button"
                      className={`fb-note${pitch !== null && scale.has(pitch % 12) ? " fb-in-key" : ""}${predictions[index][i].matches.length ? " fb-in-chord" : ""}`}
                      title={predictions[index][i].matches
                        .map(recognitionLabel)
                        .join(" · ")}
                      onMouseEnter={() =>
                        setPreview(
                          predictions[index][i].matches
                            .map(recognitionLabel)
                            .join(" · "),
                        )
                      }
                      onMouseLeave={() => setPreview("")}
                      onFocus={() =>
                        setPreview(
                          predictions[index][i].matches
                            .map(recognitionLabel)
                            .join(" · "),
                        )
                      }
                      onBlur={() => setPreview("")}
                      aria-pressed={frets[index] === fret}
                      tabIndex={frets[index] === fret ? 0 : -1}
                      aria-label={`String ${course.number}, ${fret === null ? "mute" : fret === 0 ? `open ${label}` : `fret ${fret}, ${label}`}`}
                      onClick={() => select(index, fret)}
                      onKeyDown={(event) => {
                        const vertical =
                          window.matchMedia("(max-width: 640px)").matches;
                        const next =
                          event.key === (vertical ? "ArrowDown" : "ArrowRight")
                            ? Math.min(i + 1, positions.length - 1)
                            : event.key === (vertical ? "ArrowUp" : "ArrowLeft")
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
                      <span className="fb-note-name">
                        {spelled ? (
                          <>
                            {formatNote(spelled.note)}
                            <sub>{spelled.octave}</sub>
                          </>
                        ) : (
                          "×"
                        )}
                      </span>
                    </button>
                  );
                })}
              </fieldset>
            );
          })}
          <div className="fb-row fb-markers" aria-hidden="true">
            <span />
            {positions.map((fret) => (
              <span className="fb-marker" key={fret ?? "mute"} data-fret={fret}>
                {FRET_MARKERS.some((value) => value === fret) && <i />}
                {fret === 12 && <i />}
              </span>
            ))}
          </div>
        </div>
        <div className="fb-reset-controls">
          <button
            type="button"
            aria-label="Mute all strings"
            onClick={() => setFrets(instrument.courses.map(() => null))}
          >
            × all
          </button>
          <button
            type="button"
            aria-label="Open all strings"
            onClick={() => setFrets(instrument.courses.map(() => 0))}
          >
            ○ all
          </button>
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
          <p>Tap a note to change one string. × mutes it; ○ plays it open.</p>
          <ul>
            <li>Purple: selected notes.</li>
            <li>Blue: a one-string change that forms a recognized chord.</li>
            <li>Muted color: other notes in your key.</li>
          </ul>
          <p>
            G/B means G with B in the bass. “Fifth omitted” means that chord
            tone isn’t being played.
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
        <a href="/music/chords">Chords ↗</a>
        <a href="/music/atlas">Chord atlas ↗</a>
      </nav>
      <header className="cs-intro">
        <h1>Fretboard</h1>
      </header>
      <Board key={instrument.id} instrument={instrument} tonalKey={tonalKey} />
    </article>
  );
}
