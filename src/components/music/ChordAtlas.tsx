import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  bassPitch,
  CHORD_QUALITIES,
  type Chord,
  type ChordQuality,
  findFingerings,
  formatNote,
  formatPitch,
  inversionName,
  type Key,
  keyContext,
  keyGraph,
  keyScale,
  makeChord,
  midi,
  type PitchClass,
  parseChord,
  parseNote,
  pianoVoicing,
  pitchClassNumber,
  ROOT_OPTIONS,
  type Voicing,
} from "../../lib/music";
import "./chord-atlas.css";
import { useMusicPreferences } from "./MusicSettings";
import ProgressionExplorer from "./ProgressionExplorer";
import UkeDiagram from "./UkeDiagram";
import { createVoicingPlayer, type PlaybackState } from "./voicing-audio";

function asciiNote(note: PitchClass) {
  return `${note.step}${note.alter < 0 ? "b".repeat(-note.alter) : "#".repeat(note.alter)}`;
}

function noteList(notes: PitchClass[]) {
  return notes.map(formatNote).join(" · ");
}

function graphSymbol(chord: Chord) {
  return chord.symbol
    .replace("maj7", "Δ7")
    .replace("m7♭5", "ø7")
    .replace("dim", "°");
}

function uniqueVoices(voicing: Voicing) {
  return [
    ...new Map(
      voicing.voices.map((voice) => [midi(voice.pitch), voice]),
    ).values(),
  ].sort((a, b) => midi(a.pitch) - midi(b.pitch));
}

function PianoDiagram({ voicing, chord }: { voicing: Voicing; chord: Chord }) {
  const titleId = useId();
  const pitches = voicing.voices.map((voice) => midi(voice.pitch));
  const low = Math.floor(Math.min(...pitches) / 12) * 12;
  const high = Math.floor(Math.max(...pitches) / 12) * 12 + 11;
  const whiteClasses = [0, 2, 4, 5, 7, 9, 11];
  const whites = Array.from(
    { length: high - low + 1 },
    (_, i) => low + i,
  ).filter((n) => whiteClasses.includes(n % 12));
  // Preserve the written spelling without squeezing long accidental labels.
  const blackKeyWidth = Math.max(
    20,
    ...voicing.voices
      .filter((voice) => !whiteClasses.includes(midi(voice.pitch) % 12))
      .map((voice) => formatNote(voice.pitch.note).length * 7 + 6),
  );
  const keyWidth = Math.max(
    34,
    blackKeyWidth + 14,
    ...voicing.voices
      .filter((voice) => whiteClasses.includes(midi(voice.pitch) % 12))
      .map((voice) => formatPitch(voice.pitch).length * 8 + 6),
  );
  const width = whites.length * keyWidth;
  const keyInfo = (n: number) => {
    const voice = voicing.voices.find((item) => midi(item.pitch) === n);
    return {
      voice,
      root:
        voice &&
        pitchClassNumber(voice.pitch.note) === pitchClassNumber(chord.root),
    };
  };
  return (
    <svg
      viewBox={`0 0 ${width} 150`}
      className="ca-piano"
      style={{ minWidth: whites.length * (keyWidth - 2) }}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        {`${chord.symbol} on piano: ${uniqueVoices(voicing)
          .map((voice) => formatPitch(voice.pitch))
          .join(", ")}.`}
      </title>
      {whites.map((n, index) => {
        const { voice, root } = keyInfo(n);
        return (
          <g key={n}>
            <rect
              x={index * keyWidth + 0.8}
              y="1"
              width={keyWidth - 1.6}
              height="145"
              rx="4"
              className={`ca-white-key${voice ? " ca-key-active" : ""}${root ? " ca-key-root" : ""}`}
            />
            {(voice || n % 12 === 0) && (
              <text
                x={(index + 0.5) * keyWidth}
                y="132"
                textAnchor="middle"
                className={`ca-key-label${voice ? " ca-key-label--active" : ""}`}
              >
                {voice
                  ? formatPitch(voice.pitch)
                  : `C${Math.floor(n / 12) - 1}`}
              </text>
            )}
          </g>
        );
      })}
      {whites.map((n, index) => {
        if (![0, 2, 5, 7, 9].includes(n % 12)) return null;
        const { voice, root } = keyInfo(n + 1);
        const x = (index + 1) * keyWidth;
        return (
          <g key={n + 1}>
            <rect
              x={x - blackKeyWidth / 2}
              y="0"
              width={blackKeyWidth}
              height="88"
              rx="3"
              className={`ca-black-key${voice ? " ca-key-active" : ""}${root ? " ca-key-root" : ""}`}
            />
            {voice && (
              <text
                x={x}
                y="73"
                textAnchor="middle"
                className={`ca-black-key-label${voice ? " ca-black-key-label--active" : ""}`}
              >
                {formatNote(voice.pitch.note)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function PlayButton({ voicing }: { voicing: Voicing }) {
  const player = useRef<ReturnType<typeof createVoicingPlayer> | null>(null);
  const [{ playing, message }, setPlayback] = useState<PlaybackState>({
    playing: false,
    message: "",
  });
  useEffect(() => {
    const controller = createVoicingPlayer(() => {
      const Audio =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      return Audio ? new Audio() : null;
    }, setPlayback);
    player.current = controller;
    return () => {
      controller.dispose();
      player.current = null;
    };
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: The displayed voicing identity triggers playback cancellation.
  useEffect(() => {
    player.current?.cancel();
  }, [voicing.id]);
  return (
    <div className="ca-audio">
      <button
        type="button"
        className="ca-button ca-play"
        onClick={() => void player.current?.play(voicing)}
        disabled={playing}
        aria-label="Hear this voicing as a synthesized chord"
      >
        <span aria-hidden="true">{playing ? "♪" : "▶"}</span>{" "}
        {playing ? "Playing…" : "Hear voicing"}
      </button>
      {message && <output className="ca-help">{message}</output>}
    </div>
  );
}

export default function ChordAtlas() {
  const id = useId();
  const [root, setRoot] = useState("C");
  const { instrument, tonic, mode } = useMusicPreferences();
  const neighborsHeadingRef = useRef<HTMLHeadingElement>(null);
  const explorerHeadingRef = useRef<HTMLHeadingElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const [quality, setQuality] = useState<ChordQuality>("major");
  const [shapeIndex, setShapeIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [sevenths, setSevenths] = useState(false);
  const [pianoMode, setPianoMode] = useState<"same" | "closed">("same");
  const [inversion, setInversion] = useState(0);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("chord");
    const initial = requested ? parseChord(requested) : null;
    if (initial) {
      setRoot(asciiNote(initial.root));
      setQuality(initial.quality);
    }
  }, []);
  const chord = useMemo(() => makeChord(root, quality), [root, quality]);
  const fingerings = useMemo(
    () => findFingerings(chord, instrument),
    [chord, instrument],
  );
  const fingering = fingerings[shapeIndex % Math.max(fingerings.length, 1)];
  const key = useMemo<Key>(
    () => ({ tonic: parseNote(tonic), mode }),
    [tonic, mode],
  );
  const graph = useMemo(() => keyGraph(key, sevenths), [key, sevenths]);
  const scale = useMemo(() => keyScale(key), [key]);
  const context = useMemo(() => keyContext(chord, key), [chord, key]);
  const keyFingerings = useMemo(
    () =>
      new Map(
        graph.nodes.map((node) => [
          node.chord.id,
          findFingerings(node.chord, instrument)[0],
        ]),
      ),
    [graph, instrument],
  );
  const selectedNode = graph.nodes.find((node) => node.chord.id === chord.id);
  const adjacent = graph.edges
    .filter((edge) => edge.source === chord.id || edge.target === chord.id)
    .map((edge) => ({
      edge,
      node: graph.nodes.find(
        (node) =>
          node.chord.id ===
          (edge.source === chord.id ? edge.target : edge.source),
      ),
    }));
  const closedVoicing = useMemo(
    () => pianoVoicing(chord, inversion % chord.tones.length),
    [chord, inversion],
  );
  const shownVoicing =
    pianoMode === "same" && fingering ? fingering.voicing : closedVoicing;
  const shownPitches = uniqueVoices(shownVoicing);
  const rootOptions = ROOT_OPTIONS.includes(root)
    ? ROOT_OPTIONS
    : [...ROOT_OPTIONS, root];
  const qualityInfo = CHORD_QUALITIES.find((item) => item.id === quality);
  const nodePoints = graph.nodes.map((_, i) => ({
    x: 200 + Math.sin((i / 7) * Math.PI * 2) * 133,
    y: 169 - Math.cos((i / 7) * Math.PI * 2) * 128,
  }));

  function chooseChord(next: Chord) {
    setRoot(asciiNote(next.root));
    setQuality(next.quality);
    setShapeIndex(0);
    setInversion(0);
    setSearchError("");
  }

  return (
    <div className="chord-atlas">
      <header className="ca-intro">
        <div>
          <a href="/music" className="ca-eyebrow ca-back">
            Music /
          </a>
          <h1>
            Chord atlas
            <span className="ca-title-dot" aria-hidden="true">
              .
            </span>
          </h1>
          <a className="ca-view-chord" href="/music/cheat-sheet">
            Chord cheat sheet ↗
          </a>
          {" · "}
          <a className="ca-view-chord" href="/music/fretboard">
            Fretboard ↗
          </a>
          {" · "}
          <a className="ca-view-chord" href="#progression-playground">
            Explore chord progressions ↓
          </a>
        </div>
        <div className="ca-tuning">
          <strong className="ca-course-tuning">
            {instrument.courses
              .map((course) =>
                course.strings
                  .map((string) => formatPitch(string.open))
                  .join(" + "),
              )
              .join(" / ")}
          </strong>
        </div>
      </header>

      <section className="ca-explorer" aria-labelledby={`${id}-explorer`}>
        <div className="ca-controls">
          <div className="ca-field ca-root-field">
            <label htmlFor={`${id}-root`}>Root</label>
            <select
              id={`${id}-root`}
              value={root}
              onChange={(event) =>
                chooseChord(makeChord(event.target.value, quality))
              }
            >
              {rootOptions.map((option) => (
                <option key={option} value={option}>
                  {formatNote(parseNote(option))}
                </option>
              ))}
            </select>
          </div>
          <div className="ca-field ca-quality-field">
            <label htmlFor={`${id}-quality`}>Chord</label>
            <select
              id={`${id}-quality`}
              value={quality}
              onChange={(event) =>
                chooseChord(makeChord(root, event.target.value as ChordQuality))
              }
            >
              {CHORD_QUALITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.suffix ? ` (${item.suffix})` : ""}
                </option>
              ))}
            </select>
          </div>
          <form
            className="ca-search"
            onSubmit={(event) => {
              event.preventDefault();
              const found = parseChord(query);
              if (found) {
                chooseChord(found);
                setQuery("");
                // Reveal the result and dismiss the phone keyboard without losing focus.
                requestAnimationFrame(() =>
                  explorerHeadingRef.current?.focus(),
                );
                setAnnouncement(
                  `Selected ${found.name}. Chord tones: ${noteList(found.tones.map((tone) => tone.note))}.`,
                );
              } else setSearchError("Try a chord like C, D6, F#m7, or Bbmaj7.");
            }}
          >
            <label htmlFor={`${id}-search`}>Jump to a chord</label>
            <div className="ca-search-input">
              <input
                id={`${id}-search`}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchError("");
                }}
                placeholder="Cmaj, D6, F♯m7…"
                autoComplete="off"
                enterKeyHint="go"
                autoCapitalize="off"
                spellCheck={false}
                aria-invalid={Boolean(searchError)}
                aria-describedby={
                  searchError ? `${id}-search-error` : undefined
                }
              />
              <button type="submit" aria-label="Find chord">
                ↗
              </button>
            </div>
            {searchError && (
              <output id={`${id}-search-error`} className="ca-error">
                {searchError}
              </output>
            )}
          </form>
          <output className="ca-sr-only">{announcement}</output>
        </div>

        <div className="ca-chord-heading">
          <div>
            <h2 id={`${id}-explorer`} ref={explorerHeadingRef} tabIndex={-1}>
              {chord.symbol} <span>{qualityInfo?.name}</span>
            </h2>
            <p className="ca-help">{qualityInfo?.description}</p>
          </div>
          <fieldset
            className="ca-tones"
            aria-label="Chord tones and scale degrees"
          >
            {chord.tones.map((tone) => (
              <div
                key={tone.degree}
                className={`ca-tone${tone.degree === 1 ? " ca-tone-root" : ""}`}
              >
                <strong>{formatNote(tone.note)}</strong>
                <span>{tone.label}</span>
              </div>
            ))}
          </fieldset>
        </div>

        <div className="ca-instruments">
          <div className="ca-uke-panel">
            <div className="ca-panel-heading">
              <h3>On {instrument.name.toLowerCase()}</h3>
              {fingering && (
                <span
                  className="ca-fret-code"
                  title={`Fret pattern: ${fingering.frets.map((fret) => fret ?? "muted").join(", ")}`}
                >
                  {fingering.frets.map((fret) => fret ?? "×").join(" · ")}
                </span>
              )}
            </div>
            {fingering ? (
              <>
                <UkeDiagram
                  fingering={fingering}
                  chord={chord}
                  instrument={instrument}
                />
                <div className="ca-shape-controls">
                  <button
                    type="button"
                    className="ca-arrow"
                    aria-label="Previous shape"
                    disabled={fingerings.length < 2}
                    onClick={() =>
                      setShapeIndex(
                        (shapeIndex + fingerings.length - 1) %
                          fingerings.length,
                      )
                    }
                  >
                    ←
                  </button>
                  <span>
                    Shape{" "}
                    <strong>{(shapeIndex % fingerings.length) + 1}</strong> /{" "}
                    {fingerings.length}
                  </span>
                  <button
                    type="button"
                    className="ca-arrow"
                    aria-label="Next shape"
                    disabled={fingerings.length < 2}
                    onClick={() =>
                      setShapeIndex((shapeIndex + 1) % fingerings.length)
                    }
                  >
                    →
                  </button>
                </div>
                <p className="ca-help ca-center">
                  1 index · 2 middle · 3 ring · 4 pinky
                </p>
                <p className="ca-help ca-center">
                  ○ open · × muted · joined dots = barre
                </p>
              </>
            ) : (
              <p className="ca-empty">No fingering available.</p>
            )}
          </div>

          <div className="ca-piano-panel">
            <div className="ca-panel-heading">
              <h3>On piano</h3>
            </div>
            <div className="ca-piano-controls">
              <fieldset
                className="ca-segmented"
                aria-label="Piano voicing source"
              >
                <button
                  type="button"
                  aria-pressed={pianoMode === "same"}
                  onClick={() => setPianoMode("same")}
                  disabled={!fingering}
                >
                  Match instrument
                </button>
                <button
                  type="button"
                  aria-pressed={pianoMode === "closed"}
                  onClick={() => setPianoMode("closed")}
                >
                  Piano inversions
                </button>
              </fieldset>
              {pianoMode === "closed" && (
                <div className="ca-field ca-inversion-field">
                  <label htmlFor={`${id}-inversion`}>
                    Closed-position voicing
                  </label>
                  <select
                    id={`${id}-inversion`}
                    value={inversion % chord.tones.length}
                    onChange={(event) =>
                      setInversion(Number(event.target.value))
                    }
                  >
                    {chord.tones.map((tone, index) => (
                      <option key={tone.degree} value={index}>
                        {inversionName(pianoVoicing(chord, index), chord)}
                        {[1, 3, 5, 7].includes(tone.degree)
                          ? ` · ${formatNote(tone.note)} in bass`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <section
              className="ca-keyboard-wrap"
              aria-label="Piano keyboard"
              aria-describedby={`${id}-keyboard-hint`}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need focus to scroll this overflowing region.
              tabIndex={0}
            >
              <PianoDiagram voicing={shownVoicing} chord={chord} />
            </section>
            <p id={`${id}-keyboard-hint`} className="ca-keyboard-hint">
              Scroll the keyboard sideways if needed.
            </p>
            <div className="ca-voicing">
              <div>
                <span className="ca-eyebrow">Pitches · low to high</span>
                <p className="ca-pitch-list">
                  {shownPitches.map((voice, index) => (
                    <span key={voice.id}>
                      {index > 0 && <i aria-hidden="true"> · </i>}
                      {formatPitch(voice.pitch)}
                    </span>
                  ))}
                </p>
                <p className="ca-help">
                  {inversionName(shownVoicing, chord)} · bass{" "}
                  {formatPitch(bassPitch(shownVoicing))}
                </p>
              </div>
              <PlayButton voicing={shownVoicing} />
            </div>
            <p className="ca-piano-note">
              {pianoMode === "same" && fingering
                ? "Matches the selected instrument shape."
                : "Piano voicing, independent of the instrument shape."}
            </p>
            <div className="ca-color-legend">
              <span>
                <i className="ca-root-swatch" /> root note
              </span>
              <span>
                <i /> other chord tones
              </span>
              <span className="ca-audio-note">Synth playback</span>
            </div>
          </div>
        </div>
      </section>

      <ProgressionExplorer
        selectedChord={chord}
        tonalKey={key}
        onSelect={chooseChord}
        referenceHref={`#${id}-explorer`}
      />

      <section
        id="key-chords"
        className="ca-key-section"
        aria-labelledby={`${id}-key-heading`}
      >
        <div className="ca-section-heading">
          <div>
            <h2 id={`${id}-key-heading`}>Chords in a key</h2>
          </div>
        </div>
        <div className="ca-key-summary">
          <p>
            <strong>
              {formatNote(key.tonic)}{" "}
              {mode === "major" ? "major" : "natural minor"}
            </strong>
            <span>{noteList(scale)}</span>
          </p>
          <fieldset
            className="ca-segmented"
            aria-label="Chords built from this key"
          >
            <button
              type="button"
              aria-pressed={!sevenths}
              onClick={() => setSevenths(false)}
            >
              Triads
            </button>
            <button
              type="button"
              aria-pressed={sevenths}
              onClick={() => setSevenths(true)}
            >
              Sevenths
            </button>
          </fieldset>
        </div>
        <div className="ca-chord-grid">
          {graph.nodes.map((node) => {
            const shape = keyFingerings.get(node.chord.id);
            return (
              <button
                key={node.chord.id}
                type="button"
                className="ca-chord-card"
                aria-pressed={node.chord.id === chord.id}
                onClick={() => chooseChord(node.chord)}
                aria-label={`${node.roman}: ${node.chord.name}. Select chord.`}
              >
                <span className="ca-roman">{node.roman}</span>
                <strong>{node.chord.symbol}</strong>
                {shape && (
                  <UkeDiagram
                    fingering={shape}
                    chord={node.chord}
                    instrument={instrument}
                    compact
                  />
                )}
                <span className="ca-card-tones">
                  {noteList(node.chord.tones.map((tone) => tone.note))}
                </span>
              </button>
            );
          })}
        </div>
        <div className="ca-selection-summary">
          <p>
            <span className="ca-eyebrow">Selected chord</span>
            <strong>{chord.symbol}</strong>{" "}
            <span>{noteList(chord.tones.map((tone) => tone.note))}</span>
          </p>
          <a className="ca-view-chord" href={`#${id}-explorer`}>
            View {chord.symbol} diagrams ↑
          </a>
        </div>
        <div className="ca-connections">
          <div className="ca-graph-panel">
            <h3>Shared-tone map</h3>
            {/* biome-ignore lint/a11y/useSemanticElements: An interactive SVG is a group rather than a flattened image; a fieldset cannot replace its SVG viewport. */}
            <svg
              viewBox="0 0 400 335"
              className="ca-graph"
              role="group"
              aria-labelledby={`${id}-graph-title`}
            >
              <title id={`${id}-graph-title`}>
                {`Chords in ${formatNote(key.tonic)} ${mode}. Lines connect chords sharing one or more notes. Activate a chord to explore it.`}
              </title>
              {graph.edges.map((edge) => {
                const a =
                  nodePoints[
                    graph.nodes.findIndex(
                      (node) => node.chord.id === edge.source,
                    )
                  ];
                const b =
                  nodePoints[
                    graph.nodes.findIndex(
                      (node) => node.chord.id === edge.target,
                    )
                  ];
                const active =
                  edge.source === chord.id || edge.target === chord.id;
                return (
                  <line
                    key={`${edge.source}-${edge.target}`}
                    x1={a.x}
                    x2={b.x}
                    y1={a.y}
                    y2={b.y}
                    className={`ca-graph-edge${active ? " ca-graph-edge--active" : ""}`}
                  >
                    <title>{`Shared tones: ${noteList(edge.sharedTones)}`}</title>
                  </line>
                );
              })}
              <circle cx="200" cy="169" r="31" className="ca-graph-center" />
              <text
                x="200"
                y="165"
                textAnchor="middle"
                className="ca-graph-key"
              >
                {formatNote(key.tonic)}
              </text>
              <text
                x="200"
                y="181"
                textAnchor="middle"
                className="ca-graph-mode"
              >
                {mode === "major" ? "major" : "minor"}
              </text>
              {graph.nodes.map((node, index) => (
                // biome-ignore lint/a11y/useSemanticElements: Native HTML buttons cannot be children of an SVG; these SVG controls implement button keyboard behavior.
                <g
                  key={node.chord.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.roman}, ${node.chord.name}`}
                  aria-pressed={node.chord.id === chord.id}
                  className={`ca-graph-node${node.chord.id === chord.id ? " ca-graph-node--selected" : ""}`}
                  onClick={() => chooseChord(node.chord)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      chooseChord(node.chord);
                    }
                  }}
                >
                  <circle
                    cx={nodePoints[index].x}
                    cy={nodePoints[index].y}
                    r="28"
                  />
                  <text
                    x={nodePoints[index].x}
                    y={nodePoints[index].y - 1}
                    textAnchor="middle"
                    className="ca-graph-symbol"
                  >
                    {graphSymbol(node.chord)}
                  </text>
                  <text
                    x={nodePoints[index].x}
                    y={nodePoints[index].y + 14}
                    textAnchor="middle"
                    className="ca-graph-roman"
                  >
                    {node.roman}
                  </text>
                </g>
              ))}
            </svg>
            {sevenths && (
              <p className="ca-graph-notation">
                Δ7 = major seventh · ø7 = half-diminished seventh
              </p>
            )}
            <p className="ca-help">
              <span className="ca-line-key" aria-hidden="true" /> Shared notes
            </p>
          </div>
          <div className="ca-neighbors">
            <h3 ref={neighborsHeadingRef} tabIndex={-1}>
              {selectedNode
                ? `Connected to ${chord.symbol}`
                : `${chord.symbol} in this key`}
            </h3>
            <a className="ca-view-chord" href={`#${id}-explorer`}>
              View {chord.symbol} diagrams ↑
            </a>
            {selectedNode ? (
              <>
                <div className="ca-neighbor-list">
                  {adjacent.map(
                    ({ edge, node }) =>
                      node && (
                        <button
                          type="button"
                          key={node.chord.id}
                          onClick={() => {
                            chooseChord(node.chord);
                            // The activated row disappears from the new list. Keep
                            // keyboard focus nearby, not on the graph above it.
                            requestAnimationFrame(() =>
                              neighborsHeadingRef.current?.focus(),
                            );
                          }}
                        >
                          <span>
                            <strong>{node.chord.symbol}</strong>
                            <i>{node.roman}</i>
                          </span>
                          <span className="ca-shared-notes">
                            {noteList(edge.sharedTones)}
                            <small>shared</small>
                          </span>
                          <span aria-hidden="true">↗</span>
                        </button>
                      ),
                  )}
                </div>
                {adjacent.length === 0 && (
                  <p className="ca-help">
                    No other displayed chord shares a tone.
                  </p>
                )}
              </>
            ) : (
              <div className="ca-outside-key">
                <p>
                  {context.fitsPitchClasses
                    ? `All pitches of ${chord.symbol} fit this scale, but its spelling or chord quality differs from the seven ${sevenths ? "seventh chords" : "triads"} currently shown.`
                    : `${chord.symbol} includes ${noteList(context.outside)}, outside this scale.`}
                </p>
              </div>
            )}
          </div>
        </div>
        <p className="ca-theory-note">
          {mode === "natural-minor"
            ? "Natural minor only; harmonic and melodic minor alterations aren’t shown."
            : "Roman numerals show scale degrees; lowercase indicates minor."}
        </p>
      </section>

      <details className="ca-model-note">
        <summary>Chord, voicing, shape — what’s the difference?</summary>
        <div>
          <p>
            <strong>Chord:</strong> {chord.symbol} contains{" "}
            {noteList(chord.tones.map((tone) => tone.note))}, regardless of
            octave or instrument.
          </p>
          <p>
            <strong>Voicing:</strong> pitches with specific octaves and
            doublings. The lowest note determines the inversion.
          </p>
          <p>
            <strong>Shape:</strong> fret positions and fingering on an
            instrument.
          </p>
        </div>
      </details>
      <p className="ca-attribution">
        Fingerings:{" "}
        <a href="https://github.com/tombatossals/chords-db">chords-db</a> ·{" "}
        <a href="/licenses/chords-db.txt">MIT license</a>
      </p>
    </div>
  );
}
