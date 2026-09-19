import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  type Chord,
  formatNote,
  type Key,
  keyContext,
  makeChord,
  pianoVoicing,
} from "../../lib/music";
import {
  chordFamily,
  chordRelations,
  harmonicMoves,
} from "../../lib/music/harmony";
import { createVoicingPlayer, type PlaybackState } from "./voicing-audio";
import "./progression-explorer.css";

const MAX_STEPS = 16;
const POINTS = [
  [50, 10],
  [82, 28],
  [82, 72],
  [50, 90],
  [18, 72],
  [18, 28],
];
const DEMO = [
  makeChord("C", "major"),
  makeChord("E", "m7"),
  makeChord("A", "7"),
  makeChord("D", "6"),
];

export default function ProgressionExplorer({
  selectedChord,
  tonalKey,
  onSelect,
  referenceHref,
}: {
  selectedChord: Chord;
  tonalKey: Key;
  onSelect: (chord: Chord) => void;
  referenceHref: string;
}) {
  const id = useId();
  const [trail, setTrail] = useState<Chord[]>(() => [selectedChord]);
  const [allowChromatic, setAllowChromatic] = useState(true);
  const [tempo, setTempo] = useState(80);
  const [inspected, setInspected] = useState(0);
  const [playback, setPlayback] = useState<PlaybackState>({
    playing: false,
    message: "",
  });
  const player = useRef<ReturnType<typeof createVoicingPlayer> | null>(null);
  const mapCenter = useRef<HTMLHeadingElement>(null);
  const current = trail[trail.length - 1];
  const moves = useMemo(
    () => harmonicMoves(current, tonalKey, allowChromatic),
    [current, tonalKey, allowChromatic],
  );
  const keyName = `${formatNote(tonalKey.tonic)} ${tonalKey.mode === "major" ? "major" : "natural minor"}`;
  const relation =
    inspected > 0 ? chordRelations(trail[inspected - 1], trail[inspected]) : [];

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
  // biome-ignore lint/correctness/useExhaustiveDependencies: Editing a trail or its timing invalidates scheduled playback.
  useEffect(() => {
    player.current?.cancel();
  }, [trail, tempo]);

  function replace(next: Chord[]) {
    player.current?.cancel();
    setTrail(next);
    setInspected(next.length - 1);
    onSelect(next[next.length - 1]);
  }
  function append(next: Chord, fromMap = false) {
    if (trail.length >= MAX_STEPS) return;
    replace([...trail, next]);
    if (fromMap)
      requestAnimationFrame(() =>
        mapCenter.current?.focus({ preventScroll: true }),
      );
  }

  return (
    <section
      id="progression-playground"
      className="hp-explorer"
      aria-labelledby={`${id}-title`}
    >
      <div className="hp-heading">
        <div>
          <span className="ca-eyebrow">Progression playground · prototype</span>
          <h2 id={`${id}-title`}>Where could this go?</h2>
        </div>
        <button
          type="button"
          className="ca-button"
          onClick={() => replace(DEMO)}
        >
          Try C → Em7 → A7 → D6
        </button>
      </div>
      <p className="hp-intro">
        Build a trail one chord at a time. Some moves share notes; others create
        a pull toward a destination. These are possibilities to hear, not rules
        to follow.
      </p>

      <div className="hp-reference-actions">
        <span>
          From the reference above: <strong>{selectedChord.symbol}</strong>
        </span>
        <button
          type="button"
          className="ca-button"
          onClick={() => replace([selectedChord])}
        >
          Start here
        </button>
        <button
          type="button"
          className="ca-button"
          disabled={trail.length >= MAX_STEPS}
          onClick={() => append(selectedChord)}
        >
          Append {selectedChord.symbol}
        </button>
      </div>

      <ol className="hp-trail" aria-label="Your chord progression">
        {trail.map((chord, index) => (
          <li key={`${index}-${chord.id}`}>
            {index > 0 && (
              <span className="hp-trail-arrow" aria-hidden="true">
                →
              </span>
            )}
            <button
              type="button"
              className={`hp-chord hp-family-${chordFamily(chord)}`}
              aria-label={`Step ${index + 1}: ${chord.name}. Inspect chord and incoming connection.`}
              aria-pressed={inspected === index}
              aria-current={
                playback.playing && playback.step === index ? "step" : undefined
              }
              onClick={() => {
                setInspected(index);
                onSelect(chord);
              }}
            >
              <span className="hp-step">{index + 1}</span>
              <strong>{chord.symbol}</strong>
              {!keyContext(chord, tonalKey).fitsPitchClasses && (
                <span className="hp-outside">Outside key</span>
              )}
            </button>
          </li>
        ))}
      </ol>

      <div className="hp-play-controls">
        <button
          type="button"
          className="ca-button hp-play"
          disabled={trail.length < 2}
          onClick={() => {
            if (playback.playing) player.current?.cancel();
            else
              void player.current?.playSequence(
                trail.map((chord) => pianoVoicing(chord, 0)),
                120 / tempo,
              );
          }}
        >
          {playback.playing ? "■ Stop" : "▶ Play progression"}
        </button>
        <div className="ca-field hp-tempo">
          <label htmlFor={`${id}-tempo`}>Tempo · 2 beats/chord</label>
          <select
            id={`${id}-tempo`}
            value={tempo}
            onChange={(event) => setTempo(Number(event.target.value))}
          >
            {[60, 80, 100, 120].map((bpm) => (
              <option key={bpm} value={bpm}>
                {bpm} BPM
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="ca-button"
          disabled={trail.length < 2}
          onClick={() => replace(trail.slice(0, -1))}
        >
          Undo last
        </button>
        <span className="hp-step-count">
          {trail.length}/{MAX_STEPS} chords
        </span>
      </div>
      <output className="hp-status">
        {playback.message ||
          (playback.playing
            ? `Playing step ${(playback.step ?? 0) + 1}: ${trail[playback.step ?? 0]?.symbol}`
            : trail.length === MAX_STEPS
              ? "Trail full. Undo a step or start a new trail."
              : "Piano playback uses root-position voicings, not optimized voice leading.")}
      </output>

      <div className="hp-explanation" aria-live="polite">
        <h3>
          {inspected === 0
            ? `Starting with ${trail[0].symbol}`
            : `${trail[inspected - 1].symbol} → ${trail[inspected].symbol}`}
        </h3>
        {inspected === 0 ? (
          <p>
            Choose a neighbor below to extend your trail. Tap any trail step to
            inspect it in the reference.
          </p>
        ) : relation.length ? (
          relation.map((edge) => (
            <p key={edge.kind}>
              <strong>{edge.label}.</strong> {edge.explanation}
            </p>
          ))
        ) : (
          <p>
            No shared-tone or resolution relationship is labeled for this move.
            That does not make it wrong—listen to it in context.
          </p>
        )}
        <a className="ca-view-chord" href={referenceHref}>
          View {selectedChord.symbol} diagrams ↑
        </a>
      </div>

      <div className="hp-neighborhood-heading">
        <h3>Next from {current.symbol}</h3>
        <label className="hp-chromatic">
          <input
            type="checkbox"
            checked={allowChromatic}
            onChange={(event) => setAllowChromatic(event.target.checked)}
          />{" "}
          Include outside-key chords
        </label>
      </div>
      <p className="ca-help">
        Key filter: {keyName} · uses the key controls below. This filters
        suggestions, not your existing trail.
      </p>
      <div className="hp-legend">
        {(
          [
            ["major", "Major / other"],
            ["minor", "Minor"],
            ["dominant", "Dominant seventh"],
            ["diminished", "Diminished"],
          ] as const
        ).map(([family, label]) => (
          <span key={family} className={`hp-family-${family}`}>
            <i aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
      <section
        className="hp-map"
        aria-label={`Suggested moves from ${current.symbol}`}
      >
        <svg
          className="hp-edges"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={`${id}-arrow`}
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M1 1L9 5L1 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </marker>
          </defs>
          {moves.map((move, index) => {
            const [x, y] = POINTS[index];
            return (
              <path
                key={move.chord.id}
                d={`M50 50L${(50 + x) / 2} ${(50 + y) / 2}L${x} ${y}`}
                className={move.relations[0].directed ? "hp-edge-directed" : ""}
                markerMid={
                  move.relations[0].directed ? `url(#${id}-arrow)` : undefined
                }
              />
            );
          })}
        </svg>
        <h4
          ref={mapCenter}
          tabIndex={-1}
          className={`hp-map-current hp-family-${chordFamily(current)}`}
        >
          <span>From</span>
          <strong>{current.symbol}</strong>
        </h4>
        {moves.map((move, index) => (
          <button
            key={move.chord.id}
            type="button"
            className={`hp-map-chord hp-family-${chordFamily(move.chord)}`}
            style={{
              left: `${POINTS[index][0]}%`,
              top: `${POINTS[index][1]}%`,
            }}
            disabled={trail.length >= MAX_STEPS}
            aria-label={`Append ${move.chord.name}. ${move.relations[0].label}.${move.inKey ? "" : ` Outside ${keyName}.`}`}
            title={move.relations.map((edge) => edge.explanation).join(" ")}
            onClick={() => append(move.chord, true)}
          >
            <strong>{move.chord.symbol}</strong>
            <span>
              {move.relations[0].directed
                ? "Resolves"
                : move.relations[0].kind === "relative"
                  ? "Relative"
                  : `${move.relations[0].sharedTones.length} shared`}
            </span>
            {!move.inKey && <span className="hp-outside">Outside key</span>}
          </button>
        ))}
      </section>
      {!moves.length && (
        <p className="ca-help">
          No suggestions in this filter. Enable outside-key chords, or append a
          chord from the reference.
        </p>
      )}
      <p className="ca-help">
        Arrows mark directional resolutions; plain lines mark shared notes or
        relative chords. Showing up to six suggestions—not every possible next
        chord.
      </p>
    </section>
  );
}
