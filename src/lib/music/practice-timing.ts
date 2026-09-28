/** A practice map, not a transcription: one duration per authored lyric line. */
export function timingPosition(
  bars: number[],
  beatsPerBar: number,
  beat: number,
) {
  const totalBars = bars.reduce((sum, count) => sum + count, 0);
  const totalBeats = totalBars * beatsPerBar;
  const position = Math.max(0, Math.min(beat, totalBeats));
  let start = 0;
  for (let line = 0; line < bars.length; line++) {
    const duration = bars[line] * beatsPerBar;
    if (position < start + duration || line === bars.length - 1) {
      return {
        line,
        progress: (position - start) / duration,
        bar: Math.min(totalBars, Math.floor(position / beatsPerBar) + 1),
        totalBars,
        done: position >= totalBeats,
      };
    }
    start += duration;
  }
  return { line: 0, progress: 0, bar: 0, totalBars, done: true };
}
