import { useEffect, useMemo, useState } from "react";
import {
  type Chord,
  chordFormula,
  type FrettedInstrument,
  formatNote,
  INSTRUMENTS,
  keyContext,
  midi,
  parseNote,
  realizeFingering,
} from "../../lib/music";
import {
  analyzeCoverage,
  parseChordSelection,
  voicingSymbol,
} from "../../lib/music/analysis";
import { KEY_ROOTS } from "../../lib/music/preferences";
import {
  chordHref,
  parseVoicingLink,
  voicingHref,
} from "../../lib/music/voicing-link";
import { searchVoicings } from "../../lib/music/voicing-search";
import { useMusicPreferences } from "./MusicSettings";
import UkeDiagram from "./UkeDiagram";
import { PianoDiagram, PlayButton } from "./VoicingPlayback";
import "./chord-atlas.css";
import "./chord-cheat-sheet.css";
import "./chord-detail.css";

function Detail({
  chord,
  instrument,
  params,
}: {
  chord: Chord;
  instrument: FrettedInstrument;
  params: URLSearchParams;
}) {
  const shapes = useMemo(() => {
    const found = searchVoicings(chord, instrument);
    const linked = parseVoicingLink(params);
    if (!linked || linked.instrument.id !== instrument.id) return found;
    try {
      const shape = realizeFingering(chord, linked.frets, instrument);
      if (
        !analyzeCoverage(
          chord,
          shape.voicing.voices.map((v) => midi(v.pitch)),
        )
      )
        return found;
      const same = (s: typeof shape) =>
        s.frets.join(",") === shape.frets.join(",");
      return [found.find(same) ?? shape, ...found.filter((s) => !same(s))];
    } catch {
      return found;
    }
  }, [chord, instrument, params]);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(6);
  const selected = shapes[index];
  const formula = chordFormula(chord.quality);
  const keys = useMemo(
    () =>
      (["major", "natural-minor"] as const).flatMap((mode) =>
        KEY_ROOTS[mode]
          .filter(
            (tonic) =>
              keyContext(chord, { tonic: parseNote(tonic), mode })
                .fitsPitchClasses,
          )
          .map(
            (tonic) =>
              `${formatNote(parseNote(tonic))} ${mode === "major" ? "major" : "natural minor"}`,
          ),
      ),
    [chord],
  );
  useEffect(() => {
    document.title = `${chord.symbol} · ${instrument.name} — dandelion.art`;
    if (selected)
      window.history.replaceState(
        null,
        "",
        chordHref(instrument, selected.frets, chord.symbol),
      );
  }, [selected, chord, instrument]);
  return (
    <>
      <header className="cd-heading">
        <h1>{chord.symbol}</h1>
        <p>
          {formula.name} · {instrument.name}
        </p>
        <p className="cd-tones">
          {chord.tones.map((t) => formatNote(t.note)).join(" · ")}
        </p>
        <p>{formula.description}</p>
      </header>
      <section aria-label="Selected voicing" className="cd-selected">
        {selected ? (
          <>
            <div>
              <UkeDiagram
                chord={chord}
                fingering={selected}
                instrument={instrument}
                reference
              />
              <a
                className="ca-button"
                href={voicingHref(instrument, selected.frets, chord.symbol)}
              >
                Edit on fretboard ↗
              </a>
            </div>
            <div>
              <h2>{voicingSymbol(chord, selected.voicing)}</h2>
              <p>
                Voicing {index + 1} of {shapes.length}
              </p>
              <div className="cd-controls">
                <button
                  className="ca-button"
                  type="button"
                  onClick={() =>
                    setIndex((index + shapes.length - 1) % shapes.length)
                  }
                >
                  Previous voicing
                </button>
                <button
                  className="ca-button"
                  type="button"
                  onClick={() => setIndex((index + 1) % shapes.length)}
                >
                  Next voicing
                </button>
              </div>
              <PlayButton voicing={selected.voicing} />
              <details>
                <summary>Piano · this voicing</summary>
                <div className="cd-piano">
                  <PianoDiagram chord={chord} voicing={selected.voicing} />
                </div>
              </details>
            </div>
          </>
        ) : (
          <p>No playable voicings found for this instrument.</p>
        )}
      </section>
      <section className="cd-keys">
        <h2>Keys containing this chord</h2>
        <p>
          {keys.length
            ? keys.join(" · ")
            : "No major or natural-minor scale contains every chord tone."}
        </p>
        <small>
          All chord tones fit these scales. Other keys can still use it as a
          borrowed or passing chord.
        </small>
      </section>
      <section aria-label="Voicing library">
        <h2>Voicings</h2>
        <div className="cd-grid">
          {shapes.slice(0, count).map((shape, i) => (
            <div className="cd-shape" key={shape.id}>
              <button
                type="button"
                className="cd-select"
                aria-label={`Select voicing ${i + 1}`}
                aria-pressed={index === i}
                onClick={() => setIndex(i)}
              >
                <UkeDiagram
                  chord={chord}
                  fingering={shape}
                  instrument={instrument}
                  reference
                />
                <span>
                  {i + 1} · {voicingSymbol(chord, shape.voicing)}
                </span>
              </button>
              <a href={voicingHref(instrument, shape.frets, chord.symbol)}>
                Edit on fretboard ↗
              </a>
            </div>
          ))}
        </div>
        {count < shapes.length && (
          <button
            className="ca-button"
            type="button"
            onClick={() => setCount((n) => n + 6)}
          >
            More voicings
          </button>
        )}
      </section>
    </>
  );
}

export default function ChordDetail() {
  const { instrument: saved, ready } = useMusicPreferences();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => setParams(new URLSearchParams(window.location.search)), []);
  const chord = useMemo(
    () =>
      params ? parseChordSelection(params.get("chord") ?? "C")?.chord : null,
    [params],
  );
  const instrument =
    INSTRUMENTS.find((i) => i.id === params?.get("instrument")) ?? saved;
  return (
    <article className="chord-atlas chord-detail">
      <nav className="cs-nav">
        <a href="/music/chords">← Chords</a>
        <a href="/music/fretboard">Fretboard ↗</a>
      </nav>
      {ready &&
        params &&
        (chord ? (
          <Detail
            key={`${chord.id}:${instrument.id}`}
            chord={chord}
            instrument={instrument}
            params={params}
          />
        ) : (
          <p>
            That chord isn’t recognized.{" "}
            <a href="/music/chords">Browse chords</a>.
          </p>
        ))}
    </article>
  );
}
