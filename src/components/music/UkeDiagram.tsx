import { useId } from "react";
import {
  type Chord,
  type Fingering,
  type FrettedInstrument,
  formatNote,
  formatPitch,
  midi,
  pitchClassNumber,
} from "../../lib/music";

export default function UkeDiagram({
  fingering,
  chord,
  instrument,
  compact = false,
  reference = false,
}: {
  fingering: Fingering;
  chord: Chord;
  instrument: FrettedInstrument;
  compact?: boolean;
  reference?: boolean;
}) {
  const titleId = useId();
  const stringNames = instrument.courses.map((c) =>
    formatNote(c.strings[0].open.note),
  );
  const start = fingering.startFret;
  const top = reference ? 28 : 44;
  const openY = reference ? 12 : 25;
  const left = reference ? 19 : 43;
  const spacing = compact || reference ? 34 : 44;
  const fretHeight = 34;
  const rows = Math.max(
    4,
    ...fingering.frets.map((fret) => (fret ? fret - start + 1 : 0)),
  );
  const bottom = top + rows * fretHeight;
  const sounding = new Map(
    fingering.voicing.voices.map((voice) => [voice.id, voice]),
  );
  return (
    <svg
      viewBox={`0 0 ${left * 2 + spacing * (instrument.courses.length - 1)} ${bottom + (reference ? 30 : compact ? 55 : 70)}`}
      className={`ca-uke-diagram${compact ? " ca-uke-diagram--compact" : ""}`}
      role="img"
      aria-labelledby={titleId}
      aria-hidden={compact || undefined}
    >
      <title id={titleId}>
        {`${chord.symbol}, ${instrument.name}: ${stringNames.join(", ")} strings, frets ${fingering.frets
          .map((fret) => (fret === null ? "muted" : fret === 0 ? "open" : fret))
          .join(
            ", ",
          )}. Fingers ${fingering.fingers.map((finger) => finger ?? "none").join(", ")}.${fingering.barres.map((barre) => ` Barre finger ${barre.finger} at fret ${barre.fret}, courses ${barre.fromCourse} to ${barre.toCourse}.`).join("")}`}
      </title>
      {Array.from({ length: rows + 1 }, (_, i) => i).map((fret) => (
        <line
          key={`fret-${start + fret}`}
          x1={left}
          x2={left + spacing * (instrument.courses.length - 1)}
          y1={top + fret * fretHeight}
          y2={top + fret * fretHeight}
          className={fret === 0 && start === 1 ? "ca-nut" : "ca-fret"}
        />
      ))}
      {(start > 1 || reference) && (
        <text
          x={reference ? 7 : 23}
          y={top + fretHeight / 2 + 4}
          textAnchor="end"
          className="ca-fret-number"
        >
          {start}
        </text>
      )}
      {instrument.courses.map((course, index) => (
        <line
          key={course.number}
          x1={left + index * spacing}
          x2={left + index * spacing}
          y1={top}
          y2={bottom}
          className="ca-string"
        />
      ))}
      {fingering.barres.map((barre) => (
        <line
          key={`${barre.fret}-${barre.finger}`}
          x1={
            left +
            instrument.courses.findIndex(
              (course) => course.number === barre.fromCourse,
            ) *
              spacing
          }
          x2={
            left +
            instrument.courses.findIndex(
              (course) => course.number === barre.toCourse,
            ) *
              spacing
          }
          y1={top + (barre.fret - start + 0.5) * fretHeight}
          y2={top + (barre.fret - start + 0.5) * fretHeight}
          className="ca-barre"
        />
      ))}
      {fingering.frets.map((fret, index) => {
        const x = left + index * spacing;
        const course = instrument.courses[index];
        const voices = fingering.strings
          .filter(
            (position) =>
              position.courseNumber === course.number && position.voiceId,
          )
          .flatMap((position) => {
            const voice = position.voiceId
              ? sounding.get(position.voiceId)
              : undefined;
            return voice ? [voice] : [];
          });
        const voice = voices[0];
        const uniquePitches = [
          ...new Map(
            voices.map((item) => [midi(item.pitch), item.pitch]),
          ).values(),
        ];
        const isRoot =
          !reference &&
          voice &&
          pitchClassNumber(voice.pitch.note) === pitchClassNumber(chord.root);
        return (
          <g key={course.number}>
            {fret === 0 ? (
              <circle
                cx={x}
                cy={openY}
                r="6"
                className={`ca-open${isRoot ? " ca-root" : ""}`}
              />
            ) : fret === null ? (
              <path
                d={`M${x - 5} ${openY - 5}l10 10m-10 0l10-10`}
                className="ca-muted-string"
              />
            ) : (
              <>
                <circle
                  cx={x}
                  cy={top + (fret - start + 0.5) * fretHeight}
                  r="11"
                  className={`ca-finger${isRoot ? " ca-root" : ""}`}
                />
                {fingering.fingers[index] && (
                  <text
                    x={x}
                    y={top + (fret - start + 0.5) * fretHeight + 4.5}
                    textAnchor="middle"
                    className="ca-finger-label"
                  >
                    {fingering.fingers[index]}
                  </text>
                )}
              </>
            )}
            <text
              x={x}
              y={bottom + 23}
              textAnchor="middle"
              className="ca-string-name"
            >
              {reference
                ? voice
                  ? formatNote(voice.pitch.note)
                  : "—"
                : stringNames[index]}
            </text>
            {!compact && !reference && (
              <text
                x={x}
                y={bottom + 43}
                textAnchor="middle"
                className="ca-string-pitch"
              >
                {uniquePitches.length
                  ? uniquePitches.map((pitch, pitchIndex) => (
                      <tspan
                        key={midi(pitch)}
                        x={x}
                        dy={pitchIndex === 0 ? 0 : 15}
                      >
                        {formatPitch(pitch)}
                      </tspan>
                    ))
                  : "—"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
