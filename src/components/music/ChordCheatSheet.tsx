import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  bassPitch,
  type ChordGroup,
  chordFormula,
  formatNote,
  INSTRUMENTS,
  makeChord,
  parseNote,
  pitchClassNumber,
} from "../../lib/music";
import { voicingSymbol } from "../../lib/music/analysis";
import {
  practiceSheet,
  ROOT_ALIASES,
  type SheetEntry,
} from "../../lib/music/cheat-sheet";
import {
  DEFAULT_GROUPS,
  dictionaryRows,
  GROUP_STORAGE_KEY,
  groupExample,
  PRACTICE_GROUPS,
  parseGroups,
  practiceRows,
} from "../../lib/music/practice";
import { KEY_ROOTS } from "../../lib/music/preferences";
import { searchVoicings } from "../../lib/music/voicing-search";
import ChordTheoryHelp from "./ChordTheoryHelp";
import { useMusicPreferences } from "./MusicSettings";
import UkeDiagram from "./UkeDiagram";
import "./chord-atlas.css";
import "./chord-cheat-sheet.css";

type Help = "practice" | "nearby";

function ChordCard({ entry }: { entry: SheetEntry }) {
  return (
    <VoicingCard key={entry.chord.id + entry.instrument.id} entry={entry} />
  );
}

function VoicingCard({ entry }: { entry: SheetEntry }) {
  const { chord, instrument } = entry;
  const shapes = useMemo(
    () => searchVoicings(chord, instrument),
    [chord, instrument],
  );
  const [index, setIndex] = useState(0);
  const [bass, setBass] = useState("any");
  const filtered = shapes.filter(
    (s) =>
      bass === "any" ||
      pitchClassNumber(bassPitch(s.voicing).note) === Number(bass),
  );
  const fingering = filtered[index % Math.max(1, filtered.length)];
  const symbol = fingering
    ? voicingSymbol(chord, fingering.voicing)
    : chord.symbol;
  const href = `/music/chords?chord=${encodeURIComponent(symbol)}`;
  const availableBass = new Set(
    shapes.map((s) => pitchClassNumber(bassPitch(s.voicing).note)),
  );
  return (
    <div className="cs-chord">
      <div className="cs-card-heading">
        <a href={href}>
          <h3>{chord.symbol}</h3>
        </a>
        <fieldset
          className="cs-bass-notes"
          aria-label={`Bass note for ${chord.symbol}`}
        >
          {chord.tones.map((t) => (
            <button
              type="button"
              key={t.degree}
              className={
                fingering &&
                bass === "any" &&
                pitchClassNumber(t.note) ===
                  pitchClassNumber(bassPitch(fingering.voicing).note)
                  ? "cs-root-hint"
                  : undefined
              }
              aria-label={`${formatNote(t.note)} bass for ${chord.symbol}`}
              aria-pressed={bass === String(pitchClassNumber(t.note))}
              disabled={!availableBass.has(pitchClassNumber(t.note))}
              onClick={() => {
                const next = String(pitchClassNumber(t.note));
                setBass(bass === next ? "any" : next);
                setIndex(0);
              }}
            >
              {formatNote(t.note)}
            </button>
          ))}
        </fieldset>
      </div>
      {fingering ? (
        <>
          <a href={href} aria-label={`Open ${symbol} in chord atlas`}>
            <UkeDiagram
              chord={chord}
              fingering={fingering}
              instrument={instrument}
              reference
            />
          </a>
          <div className="cs-card-controls">
            <div className="cs-voicing-controls">
              <button
                type="button"
                aria-label={`Previous ${chord.symbol} voicing`}
                disabled={filtered.length < 2}
                onClick={() =>
                  setIndex((index + filtered.length - 1) % filtered.length)
                }
              >
                ←
              </button>
              <span aria-live="polite">
                {(index % filtered.length) + 1}/{filtered.length}
              </span>
              <button
                type="button"
                aria-label={`Next ${chord.symbol} voicing`}
                disabled={filtered.length < 2}
                onClick={() => setIndex((index + 1) % filtered.length)}
              >
                →
              </button>
            </div>
          </div>
        </>
      ) : (
        <span>No shape in this range</span>
      )}
    </div>
  );
}

export default function ChordCheatSheet() {
  const id = useId();
  const { tonic, mode, instrument, update, ready } = useMusicPreferences();
  const [view, setView] = useState<"key" | "all">("key");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [groups, setGroups] = useState<ChordGroup[]>(DEFAULT_GROUPS);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  useEffect(() => {
    try {
      setGroups(parseGroups(localStorage.getItem(GROUP_STORAGE_KEY)));
    } catch {}
    setGroupsLoaded(true);
  }, []);
  useEffect(() => {
    if (groupsLoaded) {
      try {
        localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(groups));
      } catch {}
    }
  }, [groups, groupsLoaded]);
  const rows = useMemo(
    () => practiceRows({ tonic: parseNote(tonic), mode }, instrument, groups),
    [tonic, mode, instrument, groups],
  );
  const [help, setHelp] = useState<Help | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const helpOpenerRef = useRef<HTMLButtonElement>(null);
  const practice = useMemo(
    () => practiceSheet(tonic, instrument, mode),
    [tonic, instrument, mode],
  );
  const dictionary = useMemo(
    () => dictionaryRows(instrument, groups),
    [groups, instrument],
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
      data-preferences-ready={ready}
      style={{ visibility: ready ? "visible" : "hidden" }}
      inert={!ready}
    >
      <header className="cs-intro">
        <nav className="cs-nav" aria-label="Music tools">
          <a href="/music">Music</a>
          <a href="/music/fretboard">Fretboard ↗</a>
          <a className="cs-atlas-link" href="/music/chords">
            Chord atlas ↗
          </a>
        </nav>
        <div className="cs-heading-row">
          <h1 className="cs-title">
            <select
              aria-label="Instrument"
              value={instrument.id}
              style={{
                width: `${(instrument.id === "baritone-dgbe" ? "Baritone uke" : instrument.name).length + 3}ch`,
              }}
              onChange={(event) => update({ instrumentId: event.target.value })}
            >
              {INSTRUMENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id === "baritone-dgbe" ? "Baritone uke" : item.name}
                </option>
              ))}
            </select>{" "}
            {view === "key" && <span className="cs-title-join">in the</span>}
            <select
              aria-label="Key"
              value={view === "all" ? "all" : `${mode}:${tonic}`}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "all") {
                  setView("all");
                  return;
                }
                const [nextMode, nextTonic] = value.split(":");
                if (nextMode === "major" || nextMode === "natural-minor") {
                  update({ mode: nextMode, tonic: nextTonic });
                  setView("key");
                }
              }}
            >
              {(["major", "natural-minor"] as const).map((keyMode) => (
                <optgroup
                  key={keyMode}
                  label={keyMode === "major" ? "Major keys" : "Minor keys"}
                >
                  {KEY_ROOTS[keyMode].map((keyRoot) => (
                    <option key={keyRoot} value={`${keyMode}:${keyRoot}`}>
                      key of {formatNote(parseNote(keyRoot))}
                      {keyMode === "natural-minor" ? " minor" : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="all">All chords</option>
            </select>
          </h1>
          <button
            className="cs-settings-toggle"
            type="button"
            aria-label="Cheat sheet settings"
            aria-expanded={optionsOpen}
            aria-controls={`${id}-options`}
            onClick={() => setOptionsOpen(!optionsOpen)}
          >
            <span aria-hidden="true">⚙</span>
          </button>
        </div>
      </header>
      <div className="cs-options" id={`${id}-options`} hidden={!optionsOpen}>
        <fieldset className="cs-family-filters" aria-label="Chord families">
          {PRACTICE_GROUPS.map((group) => (
            <div key={group.id}>
              <button
                type="button"
                aria-pressed={groups.includes(group.id)}
                onClick={() =>
                  setGroups((current) =>
                    current.includes(group.id)
                      ? current.length > 1
                        ? current.filter((g) => g !== group.id)
                        : current
                      : [...current, group.id],
                  )
                }
              >
                {group.label}
              </button>
              <ChordTheoryHelp
                chord={makeChord(tonic, groupExample(group.id))}
              />
            </div>
          ))}
        </fieldset>
      </div>
      <output className="cs-status" aria-live="polite">
        {view === "key"
          ? `${keyName}: ${rows.reduce((n, row) => n + row.entries.length, 0)} chords.`
          : `${dictionary.length * dictionary[0].entries.length} chords across all 12 roots.`}
      </output>
      {view === "key" ? (
        <>
          <h2 className="cs-status">In {keyName}</h2>
          <div className="cs-paired">
            <div className="cs-section-heading">
              <h2>{keyName}</h2>
              {helpButton("practice", "How to practice chords in a key")}
            </div>
            <div className="cs-degree-grid">
              {rows
                .filter((row) => row.entries.length > 0)
                .map((row) => (
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
          {practice.nearby.some((entry) =>
            groups.includes(chordFormula(entry.chord.quality).group),
          ) && (
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
              )
                .filter(([kind]) =>
                  practice.nearby.some(
                    (entry) =>
                      entry.kind === kind &&
                      groups.includes(chordFormula(entry.chord.quality).group),
                  ),
                )
                .map(([kind, title]) => (
                  <section
                    key={kind}
                    className="cs-nearby-family"
                    aria-label={title}
                  >
                    <h3>{title}</h3>
                    <div className="cs-nearby-grid">
                      {practice.nearby
                        .filter(
                          (entry) =>
                            entry.kind === kind &&
                            groups.includes(
                              chordFormula(entry.chord.quality).group,
                            ),
                        )
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
          )}
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
