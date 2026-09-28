import type { Song } from "../../lib/music/song";
import { lyricWords } from "../../lib/music/song-layout";

/** Stateless score: each chord travels with its lyric anchor as the browser wraps. */
export default function SongScore({
  song,
  onChord,
  timing,
}: {
  song: Song;
  onChord: (symbol: string, button: HTMLButtonElement) => void;
  timing?: {
    bars: number[];
    activeLine: number;
    onBarsChange: (index: number, bars: number) => void;
  };
}) {
  let offset = 0;
  return (
    <div className="song-score">
      {song.sections.map((section, sectionIndex) => {
        const firstLine = offset;
        offset += section.lines.length;
        return (
          <section
            key={`${section.title}-${sectionIndex}`}
            aria-label={`${section.title} ${sectionIndex + 1}`}
          >
            <h2>{section.title}</h2>
            {section.lines.map((line, lineIndex) => (
              <div
                className={`song-line${timing?.activeLine === firstLine + lineIndex ? " song-line-active" : ""}`}
                key={`${lineIndex}-${line.segments.map((s) => s.text).join("")}`}
              >
                {timing && (
                  <label className="song-line-bars">
                    <select
                      aria-label={`${section.title} ${sectionIndex + 1} line ${lineIndex + 1} bars`}
                      value={timing.bars[firstLine + lineIndex]}
                      onChange={(event) =>
                        timing.onBarsChange(
                          firstLine + lineIndex,
                          Number(event.target.value),
                        )
                      }
                    >
                      {[1, 2, 3, 4, 6, 8, 12].map((count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? "bar" : "bars"}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {lyricWords(line.segments).map((word, wordIndex) => (
                  <span
                    className="song-word"
                    key={`${wordIndex}-${word.map((s) => s.text).join("")}`}
                  >
                    {word.map((segment, segmentIndex) => (
                      <span
                        className={`song-segment${segment.text ? "" : " song-instrumental"}`}
                        key={`${segmentIndex}-${segment.chord}-${segment.text}`}
                      >
                        {segment.chord ? (
                          <button
                            type="button"
                            aria-label={`Show ${segment.chord} voicing`}
                            onClick={(event) =>
                              segment.chord &&
                              onChord(segment.chord, event.currentTarget)
                            }
                          >
                            {segment.chord}
                          </button>
                        ) : (
                          <span
                            className="song-chord-space"
                            aria-hidden="true"
                          />
                        )}
                        <span className="song-lyric">{segment.text}</span>
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
