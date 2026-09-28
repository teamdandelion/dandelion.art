import { useEffect, useId, useRef, useState } from "react";
import {
  type Chord,
  formatNote,
  formatPitch,
  midi,
  pitchClassNumber,
  type Voicing,
} from "../../lib/music";
import { createVoicingPlayer, type PlaybackState } from "./voicing-audio";

function uniqueVoices(voicing: Voicing) {
  return [
    ...new Map(
      voicing.voices.map((voice) => [midi(voice.pitch), voice]),
    ).values(),
  ].sort((a, b) => midi(a.pitch) - midi(b.pitch));
}

export function PianoDiagram({
  voicing,
  chord,
}: {
  voicing: Voicing;
  chord?: Chord;
}) {
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
        chord &&
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
        {`${chord?.symbol ?? "Selected notes"} on piano: ${uniqueVoices(voicing)
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

export function PlayButton({ voicing }: { voicing: Voicing }) {
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
