import type { Chord, Fingering, FrettedInstrument } from "../../lib/music";
import { voicingHref } from "../../lib/music/voicing-link";
import PianoVoicingButton from "./PianoVoicingButton";
import UkeDiagram from "./UkeDiagram";
import "./voicing-widget.css";

type Props = {
  chord: Chord;
  fingering: Fingering;
  instrument: FrettedInstrument;
  diagramHref?: string;
  title?: string;
  showPiano?: boolean;
  selection?: { label: string; selected: boolean; onSelect: () => void };
  navigation?: {
    index: number;
    count: number;
    previous: () => void;
    next: () => void;
  };
};

export default function VoicingWidget({
  chord,
  fingering,
  instrument,
  diagramHref,
  selection,
  navigation,
  title,
  showPiano = true,
}: Props) {
  const diagram = (
    <UkeDiagram
      chord={chord}
      fingering={fingering}
      instrument={instrument}
      reference
    />
  );
  const label = `Edit ${chord.symbol} on fretboard`;
  const courses = instrument.courses.length;
  const pegs = courses === 6 ? [5, 10, 15] : [6, 14];
  return (
    <div className="vw-widget">
      {title && <h3 className="vw-title">{title}</h3>}
      {selection ? (
        <button
          type="button"
          className="vw-select"
          aria-label={selection.label}
          aria-pressed={selection.selected}
          onClick={selection.onSelect}
        >
          {diagram}
        </button>
      ) : diagramHref ? (
        <a
          className="vw-diagram"
          href={diagramHref}
          aria-label={`Explore ${chord.symbol} chord`}
        >
          {diagram}
        </a>
      ) : (
        <div className="vw-diagram">{diagram}</div>
      )}
      <div className="vw-controls">
        {navigation && (
          <>
            <button
              className="vw-previous"
              type="button"
              aria-label={`Previous ${chord.symbol} voicing`}
              disabled={navigation.count < 2}
              onClick={navigation.previous}
            >
              ←
            </button>
            <span className="vw-count" aria-live="polite">
              {navigation.index + 1}/{navigation.count}
            </span>
            <button
              className="vw-next"
              type="button"
              aria-label={`Next ${chord.symbol} voicing`}
              disabled={navigation.count < 2}
              onClick={navigation.next}
            >
              →
            </button>
          </>
        )}
        <a
          className="vw-fretboard"
          href={voicingHref(instrument, fingering.frets, chord.symbol)}
          aria-label={label}
          title={label}
        >
          <span className="vw-sr">{label}</span>
          <svg
            viewBox="0 0 28 32"
            width="19"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M9 2h10l1 16-3 5v7h-6v-7l-3-5Z" />
            <path d="M11 24h6M12 5v17m4-17v17" />
            {pegs.map((y) => (
              <g key={y}>
                <path d={`M5 ${y}h4m10 0h4`} />
                <rect x="2" y={y - 1.5} width="3" height="3" rx="1" />
                <rect x="23" y={y - 1.5} width="3" height="3" rx="1" />
              </g>
            ))}
          </svg>
        </a>
        {showPiano && (
          <PianoVoicingButton chord={chord} voicing={fingering.voicing} />
        )}
      </div>
    </div>
  );
}
