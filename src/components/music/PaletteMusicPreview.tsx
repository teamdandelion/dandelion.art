import {
  BARITONE,
  findFingerings,
  formatNote,
  makeChord,
  pitchClassNumber,
} from "../../lib/music";
import UkeDiagram from "./UkeDiagram";
import "./chord-atlas.css";
import "./progression-explorer.css";
import "./palette-music-preview.css";

const pitchNames = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
];

function PianoPreview({ chord }: { chord: ReturnType<typeof makeChord> }) {
  const whiteSemitones = [0, 2, 4, 5, 7, 9, 11];
  const active = new Set(
    chord.tones.map((tone) => pitchClassNumber(tone.note)),
  );
  const root = pitchClassNumber(chord.root);
  const keyWidth = 36;
  const width = keyWidth * 7;
  const whiteKeys = whiteSemitones.map((semitone, index) => ({
    semitone,
    x: index * keyWidth,
  }));
  const blackKeys = [
    [1, 0],
    [3, 1],
    [6, 3],
    [8, 4],
    [10, 5],
  ] as const;

  return (
    <svg
      className="palette-piano"
      viewBox={`0 0 ${width} 92`}
      role="img"
      aria-label={`${chord.symbol} piano notes`}
    >
      {whiteKeys.map(({ semitone, x }) => {
        const isActive = active.has(semitone);
        const isRoot = root === semitone;
        return (
          <g key={semitone}>
            <rect
              x={x + 1}
              y="1"
              width={keyWidth - 2}
              height="88"
              rx="3"
              className={`ca-white-key${isActive ? " ca-key-active" : ""}${isRoot ? " ca-key-root" : ""}`}
            />
            {isActive && (
              <text
                x={x + keyWidth / 2}
                y="76"
                textAnchor="middle"
                className="ca-key-label ca-key-label--active"
              >
                {pitchNames[semitone]}
              </text>
            )}
          </g>
        );
      })}
      {blackKeys.map(([semitone, afterWhite]) => {
        const isActive = active.has(semitone);
        const isRoot = root === semitone;
        return (
          <g key={semitone}>
            <rect
              x={(afterWhite + 1) * keyWidth - 10}
              y="0"
              width="20"
              height="53"
              rx="2"
              className={`ca-black-key${isActive ? " ca-key-active" : ""}${isRoot ? " ca-key-root" : ""}`}
            />
            {isActive && (
              <text
                x={(afterWhite + 1) * keyWidth}
                y="44"
                textAnchor="middle"
                className="ca-black-key-label ca-black-key-label--active"
              >
                {pitchNames[semitone]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function PaletteMusicPreview() {
  const examples = [
    { chord: makeChord("G", "major"), family: "major" },
    { chord: makeChord("G", "minor"), family: "minor" },
  ];

  return (
    <div className="chord-atlas palette-music-preview">
      {examples.map(({ chord, family }) => {
        const fingering = findFingerings(chord, BARITONE)[0];
        if (!fingering) return null;
        return (
          <article className="palette-chord" key={chord.id}>
            <h3 className={`hp-family-${family}`}>{chord.symbol}</h3>
            <span className="palette-chord-notes">
              {chord.tones.map((tone) => formatNote(tone.note)).join(" · ")}
            </span>
            <UkeDiagram
              fingering={fingering}
              chord={chord}
              instrument={BARITONE}
            />
            <PianoPreview chord={chord} />
          </article>
        );
      })}
    </div>
  );
}
