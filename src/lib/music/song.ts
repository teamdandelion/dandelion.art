/** A chord sounds at the beginning of its lyric segment; empty text is instrumental. */
export type SongSegment = { text: string; chord?: string };
export type SongLine = { segments: SongSegment[] };
export type SongSection = { title: string; lines: SongLine[] };
export type Song = {
  id: string;
  title: string;
  artist: string;
  source: string;
  note?: string;
  sections: SongSection[];
};

/** Derive the vocabulary from the score so it cannot drift out of sync. */
export function songChords(song: Song): string[] {
  return [
    ...new Set(
      song.sections.flatMap((section) =>
        section.lines.flatMap((line) =>
          line.segments.flatMap((segment) =>
            segment.chord ? [segment.chord] : [],
          ),
        ),
      ),
    ),
  ];
}
