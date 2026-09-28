import type { SongSegment } from "./song";

/** Keep mid-word chord changes together; let CSS wrap at spaces and sung hyphens. */
export function lyricWords(segments: SongSegment[]): SongSegment[][] {
  const words: SongSegment[][] = [];
  let word: SongSegment[] = [];
  for (const segment of segments) {
    if (!segment.text) {
      if (word.length) words.push(word);
      if (segment.chord) words.push([{ ...segment }]);
      word = [];
      continue;
    }
    const parts = segment.text.match(/[^\s-]+(?:-|\s+)?|\s+|-/g) ?? [];
    parts.forEach((text, index) => {
      word.push({
        text,
        ...(index === 0 && segment.chord ? { chord: segment.chord } : {}),
      });
      if (/[\s-]$/.test(text)) {
        words.push(word);
        word = [];
      }
    });
  }
  if (word.length) words.push(word);
  return words;
}
