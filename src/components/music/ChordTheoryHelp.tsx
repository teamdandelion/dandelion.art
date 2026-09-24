import { useId, useRef } from "react";
import { type Chord, chordFormula, formatNote } from "../../lib/music";
import "./chord-cheat-sheet.css";

export default function ChordTheoryHelp({ chord }: { chord: Chord }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const formula = chordFormula(chord.quality);
  return (
    <>
      <button
        ref={button}
        type="button"
        className="cs-help-button"
        aria-label={`About ${formula.name.toLowerCase()}`}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        ?
      </button>
      <dialog
        ref={dialog}
        className="cs-modal"
        aria-labelledby={id}
        onClose={() => button.current?.focus({ preventScroll: true })}
      >
        <div className="cs-modal-content">
          <header>
            <h2 id={id}>{formula.name}</h2>
            <button
              type="button"
              className="cs-close"
              aria-label="Close chord explanation"
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
          </header>
          <p>{formula.description}</p>
          <p>
            <strong>{formula.intervals.map((t) => t.label).join(" · ")}</strong>
          </p>
          <p>
            {chord.symbol}:{" "}
            {chord.tones.map((t) => formatNote(t.note)).join(" · ")}
          </p>
          <p>
            Numbers count scale degrees from the root. ♭ lowers a degree by a
            semitone; ♯ raises it. A ninth is a second an octave higher. In a
            voicing, notes can move between octaves or be doubled.
          </p>
          {!!formula.optionalDegrees.length && (
            <p>
              A voicing may omit the fifth here while retaining the root and the
              notes that define this chord. The diagram’s actual notes, not the
              chord name alone, describe what you play.
            </p>
          )}
          <p>
            A slash followed by a note names the lowest sounding note:{" "}
            {chord.symbol}/{formatNote(chord.tones[1].note)} keeps the same
            chord with {formatNote(chord.tones[1].note)} in the bass.
          </p>
        </div>
      </dialog>
    </>
  );
}
