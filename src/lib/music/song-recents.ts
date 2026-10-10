export const SONG_RECENTS_KEY = "music.song-recents.v1";

export function parseSongRecents(raw: string | null): Record<string, number> {
  try {
    const value = JSON.parse(raw ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([, stamp]) =>
          typeof stamp === "number" && Number.isFinite(stamp) && stamp > 0,
      ),
    ) as Record<string, number>;
  } catch {
    return {};
  }
}

let memory: Record<string, number> = {};
let memoryOnly = false;
export function readSongRecents() {
  if (memoryOnly) return memory;
  try {
    return parseSongRecents(localStorage.getItem(SONG_RECENTS_KEY));
  } catch {
    return memory;
  }
}

export function rememberSong(id: string) {
  const recents = readSongRecents();
  // Monotonic across rapid opens (or a clock adjustment).
  recents[id] = Math.max(
    Date.now(),
    ...Object.values(recents).map((n) => n + 1),
  );
  memory = recents;
  try {
    localStorage.setItem(SONG_RECENTS_KEY, JSON.stringify(recents));
  } catch {
    /* Session-only history when storage is unavailable. */
    memoryOnly = true;
  }
}

export function orderSongs<T extends { id: string; title: string }>(
  songs: T[],
  recents: Record<string, number>,
): T[] {
  return [...songs].sort(
    (a, b) =>
      (recents[b.id] ?? 0) - (recents[a.id] ?? 0) ||
      a.title.localeCompare(b.title, "en"),
  );
}
