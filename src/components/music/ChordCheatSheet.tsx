import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CHORD_QUALITIES,
  type ChordQuality,
  formatNote,
  parseNote,
} from "../../lib/music";
import {
  allChordRows,
  CHEAT_SHEET_COLUMNS,
  practiceSheet,
  ROOT_ALIASES,
  type SheetEntry,
} from "../../lib/music/cheat-sheet";
import { useMusicPreferences } from "./MusicSettings";
import UkeDiagram from "./UkeDiagram";
import "./chord-atlas.css";
import "./chord-cheat-sheet.css";

type Help = "practice" | "nearby";

function ChordCard({ entry }: { entry: SheetEntry }) {
  const { chord, fingering, href, instrument } = entry;
  return (
    <a
      className="cs-chord"
      href={href}
      aria-label={`${chord.name} on ${instrument.name}: frets ${fingering.frets.map((fret) => (fret === null ? "muted" : fret === 0 ? "open" : fret)).join(", ")}. Fingers ${fingering.fingers.map((finger) => finger ?? "none").join(", ")}.${fingering.barres.map((barre) => ` Barre finger ${barre.finger} at fret ${barre.fret}, strings ${barre.fromCourse} to ${barre.toCourse}.`).join("")} Open in chord atlas.`}
    >
      <h3>{chord.symbol}</h3>
      <UkeDiagram
        chord={chord}
        fingering={fingering}
        instrument={instrument}
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
  const { tonic, mode, instrument } = useMusicPreferences();
  const [view, setView] = useState<"key" | "all">("key");
  const [quality, setQuality] = useState<ChordQuality | "common">("common");
  const [help, setHelp] = useState<Help | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const helpOpenerRef = useRef<HTMLButtonElement>(null);
  const practice = useMemo(
    () => practiceSheet(tonic, instrument, mode),
    [tonic, instrument, mode],
  );
  const dictionary = useMemo(
    () => allChordRows(quality, instrument),
    [quality, instrument],
  );
  const keyName = `${formatNote(parseNote(tonic))} ${mode === "major" ? "major" : "minor"}`;
  useEffect(() => {
    if (!help || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const opener = helpOpenerRef.current;
    const previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    dialog.scrollTop = 0;
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
    <article
      className="chord-atlas chord-sheet"
      data-instrument={instrument.id}
    >
      <header className="cs-intro">
        <nav className="cs-nav" aria-label="Music tools">
          <a href="/music">Music</a>
          <a href="/music/fretboard">Fretboard ↗</a>
          <a className="cs-atlas-link" href="/music/chords">
            Chord atlas ↗
          </a>
        </nav>
        <h1>{instrument.name} cheat sheet</h1>
      </header>
      <div
        className={`cs-controls${view === "all" ? " cs-controls--all" : ""}`}
      >
        <fieldset className="cs-view" aria-label="Sheet view">
          <button
            type="button"
            aria-pressed={view === "key"}
            onClick={() => setView("key")}
          >
            Key
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
          {view === "all" && (
            <>
              <label className="cs-status" htmlFor={`${id}-quality`}>
                Chords
              </label>
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
          ? `${keyName}: 7 chord pairs and ${practice.nearby.length} outside-key chords.`
          : `${dictionary.length * dictionary[0].entries.length} chords across all 12 roots.`}
      </output>
      {view === "key" ? (
        <>
          <h2 className="cs-status">In {keyName}</h2>
          <div className="cs-paired">
            <div className="cs-key-header">
              <div className="cs-columns" aria-hidden="true">
                <span>Triad</span>
                <span>Seventh</span>
                <span className="cs-repeated-column">Triad</span>
                <span className="cs-repeated-column">Seventh</span>
              </div>
              {helpButton("practice", "How to practice chords in a key")}
            </div>
            <div className="cs-degree-grid">
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
          </div>
          <section aria-labelledby={`${id}-nearby`}>
            <div className="cs-section-heading cs-nearby-heading">
              <h2 id={`${id}-nearby`}>Outside key</h2>
              {helpButton("nearby", "About outside-key chords")}
            </div>
            {(
              [
                ["applied", "Dominants"],
                ["ii-v", "ii–V approaches"],
                ["borrowed", "Borrowed chords"],
                ["diminished", "Diminished approaches"],
              ] as const
            ).map(([kind, title]) => (
              <section
                key={kind}
                className="cs-nearby-family"
                aria-label={title}
              >
                <h3>{title}</h3>
                <div className="cs-nearby-grid">
                  {practice.nearby
                    .filter((entry) => entry.kind === kind)
                    .map((entry) => (
                      <div key={entry.chord.id} className="cs-related">
                        <p className="cs-roman">{entry.roman}</p>
                        <ChordCard entry={entry} />
                        <p className="cs-destination">{entry.move}</p>
                      </div>
                    ))}
                </div>
              </section>
            ))}
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
                A key is a home base, not a list of permitted chords. These
                families are a practice vocabulary, not an exhaustive list or a
                promise that every transition will suit every song.
              </p>
              <h3>Chords that point somewhere</h3>
              <p>
                Dominants create a pull toward a target chord. V7/vi means “the
                dominant seventh of chord vi.” The arrow below each diagram
                shows a useful destination, not a rule.
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
              <h3>ii–V approaches</h3>
              <p>
                A minor-seventh chord can precede a target’s dominant. For a
                minor target, try a half-diminished ii chord. Follow the arrows
                as a short progression.
              </p>
              <h3>Borrowed colors</h3>
              <p>
                These triads and sevenths come from the parallel{" "}
                {mode === "major" ? "natural minor" : "major"} scale: the same
                tonic with a different mode. They offer a change of color, not a
                fixed resolution. Altered Roman numerals compare roots with the
                selected scale.
              </p>
              <h3>Diminished approaches</h3>
              <p>
                A fully diminished seventh rooted a semitone below a target can
                lead into it. The spelling here names that destination; the same
                sounding chord can have other names and resolutions.
              </p>
              <p>
                Chords already inside the selected scale are omitted, and
                repeated chord names appear once. In minor, the dominant of home
                is included because its raised leading tone is outside natural
                minor.
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
                The seven rows follow the{" "}
                {mode === "major" ? "major" : "natural minor"} scale. Roman
                numerals show each chord’s position: uppercase is major,
                lowercase is minor, and ° means diminished.
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
                          "Add diatonic chords while keeping a steady pulse.",
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
                its first fret; the numbers below are frets in{" "}
                {instrument.courses
                  .map((c) => formatNote(c.strings[0].open.note))
                  .join("–")}{" "}
                order. Labels below each string show the sounding notes.
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
