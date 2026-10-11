import type { Song } from "../../lib/music/song";
import { lyricWords } from "../../lib/music/song-layout";
import SongChordButton from "./SongChordButton";

/** Stateless score: each chord travels with its lyric anchor as the browser wraps. */
export default function SongScore({
  song,
  onChord,
  onPreview,
}: {
  song: Song;
  onChord: (symbol: string, button: HTMLButtonElement) => void;
  onPreview: (symbol: string | null) => void;
}) {
  return (
    <div className="song-score">
      {song.sections.map((section, sectionIndex) => (
        <section
          key={`${section.title}-${sectionIndex}`}
          aria-label={`${section.title} ${sectionIndex + 1}`}
        >
          <h2>{section.title}</h2>
          {section.lines.map((line, lineIndex) => (
            <div
              className="song-line"
              key={`${lineIndex}-${line.segments.map((s) => s.text).join("")}`}
            >
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
                        <SongChordButton
                          symbol={segment.chord}
                          onChord={onChord}
                          onPreview={onPreview}
                        />
                      ) : (
                        <span className="song-chord-space" aria-hidden="true" />
                      )}
                      <span className="song-lyric">{segment.text}</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
