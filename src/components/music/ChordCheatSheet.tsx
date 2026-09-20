import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CHORD_QUALITIES,
  type ChordQuality,
  formatNote,
  KEY_OPTIONS,
  parseNote,
  SIX_STRING_BARITONE,
} from "../../lib/music";
import {
  allChordRows,
  CHEAT_SHEET_COLUMNS,
  practiceSheet,
  ROOT_ALIASES,
  type SheetEntry,
} from "../../lib/music/cheat-sheet";
import UkeDiagram from "./UkeDiagram";
import "./chord-atlas.css";
import "./chord-cheat-sheet.css";

type Help = "practice" | "nearby";

function ChordCard({ entry }: { entry: SheetEntry }) {
  const { chord, fingering, href } = entry;
  return (
    <a
      className="cs-chord"
      href={href}
      aria-label={`${chord.name}: D, G, B, E courses, frets ${fingering.frets.map((fret) => (fret === null ? "muted" : fret === 0 ? "open" : fret)).join(", ")}. Fingers ${fingering.fingers.map((finger) => finger ?? "none").join(", ")}.${fingering.barres.map((barre) => ` Barre finger ${barre.finger} at fret ${barre.fret}, courses ${barre.fromCourse} to ${barre.toCourse}.`).join("")} Open in chord atlas.`}
    >
      <h3>{chord.symbol}</h3>
      <UkeDiagram
        chord={chord}
        fingering={fingering}
        instrument={SIX_STRING_BARITONE}
        reference
      />
      <span className="cs-frets" aria-hidden="true">
        {fingering.frets.map((fret) => fret ?? "×").join(" · ")}
      </span>
    </a>
  );
}

export default function ChordCheatSheet() {
  const id = useId();
  const [tonic, setTonic] = useState("G");
  const [view, setView] = useState<"key" | "all">("key");
  const [quality, setQuality] = useState<ChordQuality | "common">("common");
  const [help, setHelp] = useState<Help | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const helpOpenerRef = useRef<HTMLButtonElement>(null);
  const practice = useMemo(() => practiceSheet(tonic), [tonic]);
  const dictionary = useMemo(() => allChordRows(quality), [quality]);
  const keyName = `${formatNote(parseNote(tonic))} major`;
  useEffect(() => {
    if (!help || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const opener = helpOpenerRef.current;
    const previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.documentElement.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, [help]);
  const helpButton = (topic: Help, label: string) => (
    <button
      type="button"
      className="cs-help-button"
      aria-label={label}
      aria-haspopup="dialog"
      onClick={(event) => {
        helpOpenerRef.current = event.currentTarget;
        setHelp(topic);
      }}
    >
      ?
    </button>
  );

  return (
    <article className="chord-atlas chord-sheet">
      <header className="cs-intro">
        <a className="ca-eyebrow ca-back" href="/music">
          Music /
        </a>
        <h1>Baritone ukulele cheat sheet</h1>
        <a className="cs-atlas-link" href="/music/chords">
          Open chord atlas ↗
        </a>
      </header>
      <div className="cs-controls">
        <fieldset className="cs-view" aria-label="Sheet view">
          <button
            type="button"
            aria-pressed={view === "key"}
            onClick={() => setView("key")}
          >
            By key
          </button>
          <button
            type="button"
            aria-pressed={view === "all"}
            onClick={() => setView("all")}
          >
            All chords
          </button>
        </fieldset>
        <div className="cs-selector">
          {view === "key" ? (
            <>
              <label htmlFor={`${id}-key`}>Key</label>
              <select
                id={`${id}-key`}
                value={tonic}
                onChange={(e) => setTonic(e.target.value)}
              >
                {KEY_OPTIONS.map((root) => (
                  <option key={root} value={root}>
                    {formatNote(parseNote(root))} major
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label htmlFor={`${id}-quality`}>Chords</label>
              <select
                id={`${id}-quality`}
                value={quality}
                onChange={(e) =>
                  setQuality(e.target.value as ChordQuality | "common")
                }
              >
                <option value="common">Major · minor · 7</option>
                {CHORD_QUALITIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
      <output className="cs-status" aria-live="polite">
        {view === "key"
          ? `${keyName}: 7 chord pairs and 6 outside-key chords.`
          : `${dictionary.length * dictionary[0].entries.length} chords across all 12 roots.`}
      </output>
      {view === "key" ? (
        <>
          <div className="cs-section-heading">
            <h2>In {keyName}</h2>
            {helpButton("practice", "How to practice chords in a key")}
          </div>
          <div className="cs-paired">
            <div className="cs-columns" aria-hidden="true">
              <span>Triad</span>
              <span>Seventh</span>
            </div>
            {practice.rows.map((row) => (
              <section
                key={row.degree}
                className="cs-row"
                aria-labelledby={`${id}-degree-${row.degree}`}
              >
                <h2 id={`${id}-degree-${row.degree}`}>{row.roman}</h2>
                <div className="cs-chords">
                  {row.entries.map((entry) => (
                    <ChordCard key={entry.chord.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))}
          </div>
          <section aria-labelledby={`${id}-nearby`}>
            <div className="cs-section-heading cs-nearby-heading">
              <h2 id={`${id}-nearby`}>Common outside-key chords</h2>
              {helpButton("nearby", "About outside-key chords")}
            </div>
            <div className="cs-nearby-grid">
              {practice.nearby.map((entry) => (
                <div key={entry.chord.id} className="cs-related">
                  <p className="cs-roman">{entry.roman}</p>
                  <ChordCard entry={entry} />
                  <p className="cs-destination">{entry.move}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <nav className="cs-jump" aria-label="Jump to chord root">
            {dictionary.map(({ root }) => (
              <a key={root} href={`#root-${root}`}>
                {formatNote(parseNote(root))}
              </a>
            ))}
          </nav>
          {quality === "common" ? (
            <>
              <div className="cs-columns" aria-hidden="true">
                {CHEAT_SHEET_COLUMNS.map((column) => (
                  <span key={column.quality}>{column.label}</span>
                ))}
              </div>
              {dictionary.map(({ root, entries }) => (
                <section
                  key={root}
                  className="cs-row"
                  aria-labelledby={`root-${root}`}
                >
                  <h2 id={`root-${root}`}>{ROOT_ALIASES[root] ?? root}</h2>
                  <div className="cs-chords">
                    {entries.map((entry) => (
                      <ChordCard key={entry.chord.id} entry={entry} />
                    ))}
                  </div>
                </section>
              ))}
            </>
          ) : (
            <div className="cs-single-grid">
              {dictionary.map(({ root, entries }) => (
                <section
                  key={root}
                  className="cs-single"
                  aria-labelledby={`root-${root}`}
                >
                  <h2 id={`root-${root}`}>{ROOT_ALIASES[root] ?? root}</h2>
                  <ChordCard entry={entries[0]} />
                </section>
              ))}
            </div>
          )}
        </>
      )}
      <footer className="ca-attribution">
        Fingerings:{" "}
        <a href="https://github.com/tombatossals/chords-db">chords-db</a> ·{" "}
        <a href="/licenses/chords-db.txt">MIT license</a>
      </footer>
      <dialog
        ref={dialogRef}
        className="cs-modal"
        aria-labelledby={`${id}-help-title`}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const stops = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled), a[href]",
            ),
          );
          const first = stops[0];
          const last = stops[stops.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onCancel={(e) => {
          e.preventDefault();
          setHelp(null);
        }}
        onPointerDown={(e) => {
          const bounds = e.currentTarget.getBoundingClientRect();
          if (
            e.target === e.currentTarget &&
            (e.clientX < bounds.left ||
              e.clientX > bounds.right ||
              e.clientY < bounds.top ||
              e.clientY > bounds.bottom)
          ) {
            e.preventDefault();
            setHelp(null);
          }
        }}
      >
        <div className="cs-modal-content">
          <header>
            <h2 id={`${id}-help-title`}>
              {help === "nearby"
                ? "Beyond the key"
                : `Practicing in ${keyName}`}
            </h2>
            <button
              type="button"
              className="cs-close"
              aria-label="Close study notes"
              onClick={() => setHelp(null)}
            >
              ×
            </button>
          </header>
          {help === "nearby" ? (
            <>
              <p>
                A key is a home base, not a list of permitted chords. These six
                choices are a starting vocabulary, not an exhaustive list or a
                promise that every transition will suit every song.
              </p>
              <h3>Chords that point somewhere</h3>
              <p>
                The first four are secondary dominants. Each creates a pull
                toward a chord other than home. V7/vi means “the dominant
                seventh of chord vi.” The arrow below each diagram shows a
                useful destination, not a rule.
              </p>
              <ul>
                {practice.nearby
                  .filter((entry) => entry.kind === "applied")
                  .map((entry) => (
                    <li key={entry.chord.id}>
                      <strong>
                        {entry.chord.symbol} {entry.move}
                      </strong>{" "}
                      <span>({entry.roman})</span>
                    </li>
                  ))}
              </ul>
              <h3>Borrowed colors</h3>
              <p>
                The minor iv and major ♭VII use notes from the parallel minor
                scale. Try {practice.rows[3].entries[0].chord.symbol} →{" "}
                {practice.nearby[4].chord.symbol} →{" "}
                {practice.rows[0].entries[0].chord.symbol}, then{" "}
                {practice.rows[0].entries[0].chord.symbol} →{" "}
                {practice.nearby[5].chord.symbol} →{" "}
                {practice.rows[3].entries[0].chord.symbol} →{" "}
                {practice.rows[0].entries[0].chord.symbol}. Listen for the
                change in color.
              </p>
              <p className="cs-reading">
                Further reading:{" "}
                <a href="https://musictheory.pugetsound.edu/mt21c/Tonicization.html">
                  secondary dominants
                </a>{" "}
                ·{" "}
                <a href="https://musictheory.pugetsound.edu/mt21c/ModeMixtureSection.html">
                  borrowed chords
                </a>
              </p>
            </>
          ) : (
            <>
              <p>
                The seven rows follow the major scale. Roman numerals show each
                chord’s position: uppercase is major, lowercase is minor, and °
                means diminished.
              </p>
              <h3>Triads and sevenths</h3>
              <p>
                A triad has three different notes. The second column adds the
                next stacked third from the key. That gives maj7, m7, 7, or
                m7♭5—not seven dominant-seventh chords. The last is
                half-diminished. These are options to compare, not automatic
                replacements in every song.
              </p>
              <h3>A short practice session</h3>
              <ol>
                {practice.loops.map((loop, index) => (
                  <li key={loop.join("-")}>
                    <strong>{loop.join(" → ")}</strong>
                    <p>
                      {
                        [
                          "Find home: listen to the departure and return.",
                          "Add minor chords while keeping a steady pulse.",
                          "Introduce one outside-key chord and hear where it leads.",
                        ][index]
                      }
                    </p>
                  </li>
                ))}
              </ol>
              <p>
                Pick one loop. Isolate its hardest change for a couple of
                minutes, then play the whole loop slowly, four beats per chord.
                Keep the pulse steady before increasing speed. You do not need
                to learn every diagram at once.
              </p>
              <h3>Reading the diagrams</h3>
              <p>
                1 index · 2 middle · 3 ring · 4 pinky. ○ is open; × is muted.
                Joined dots share a barre. The small number beside the grid is
                its first fret; the numbers below are frets in D–G–B–E order.
                The same shapes work on 4- and 6-string baritones.
              </p>
              <p className="cs-reading">
                More on{" "}
                <a href="https://www.justinguitar.com/guitar-lessons/one-minute-changes-stage-5-bc-154">
                  practicing useful chord changes
                </a>
                .
              </p>
            </>
          )}
        </div>
      </dialog>
    </article>
  );
}
