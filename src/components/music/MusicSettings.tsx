import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import {
  BARITONE,
  formatNote,
  INSTRUMENTS,
  parseNote,
  pitchClassNumber,
} from "../../lib/music";
import {
  DEFAULT_PREFERENCES,
  KEY_ROOTS,
  MUSIC_STORAGE_KEY,
  type MusicPreferences,
  parsePreferences,
} from "../../lib/music/preferences";
import "./music-settings.css";

const initial = JSON.stringify(DEFAULT_PREFERENCES);
let memory = initial;
function read() {
  try {
    return localStorage.getItem(MUSIC_STORAGE_KEY) ?? initial;
  } catch {
    return memory;
  }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("music-preferences", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("music-preferences", listener);
  };
}
export function useMusicPreferences() {
  const raw = useSyncExternalStore(subscribe, read, () => initial);
  const preferences = useMemo(() => parsePreferences(raw), [raw]);
  const update = (patch: Partial<MusicPreferences>) => {
    memory = JSON.stringify(
      parsePreferences(
        JSON.stringify({ ...parsePreferences(read()), ...patch }),
      ),
    );
    try {
      localStorage.setItem(MUSIC_STORAGE_KEY, memory);
    } catch {
      /* Session-only when storage is unavailable. */
    }
    window.dispatchEvent(new Event("music-preferences"));
  };
  return {
    ...preferences,
    instrument:
      INSTRUMENTS.find((i) => i.id === preferences.instrumentId) ?? BARITONE,
    update,
  };
}

export default function MusicSettings() {
  const { instrumentId, tonic, mode, update } = useMusicPreferences();
  const strip = useRef<HTMLFieldSetElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Recenter the rail when the selected key or mode changes.
  useEffect(() => {
    const rail = strip.current;
    const selected = rail?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (rail && selected)
      rail.scrollTo({
        left:
          selected.offsetLeft - rail.clientWidth / 2 + selected.clientWidth / 2,
        behavior: "instant",
      });
  }, [tonic, mode]);
  return (
    <div className="music-settings">
      <fieldset className="ms-instruments" aria-label="Instrument">
        {INSTRUMENTS.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={item.id === instrumentId}
            onClick={() => update({ instrumentId: item.id })}
          >
            {item.id === BARITONE.id
              ? "Baritone uke"
              : item.name === "Ukulele"
                ? "Uke"
                : item.name}
          </button>
        ))}
      </fieldset>
      <div className="ms-key-controls">
        <fieldset className="ms-modes" aria-label="Key mode">
          {(["major", "natural-minor"] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              onClick={() =>
                update({
                  mode: value,
                  tonic:
                    KEY_ROOTS[value].find(
                      (root) =>
                        pitchClassNumber(parseNote(root)) ===
                        pitchClassNumber(parseNote(tonic)),
                    ) ?? "G",
                })
              }
            >
              {value === "major" ? "Major" : "Minor"}
            </button>
          ))}
        </fieldset>
        <fieldset
          className="ms-key-strip"
          ref={strip}
          aria-label={`${mode === "major" ? "Major" : "Minor"} key`}
        >
          {KEY_ROOTS[mode].map((root) => (
            <button
              type="button"
              key={root}
              aria-label={`${formatNote(parseNote(root))} ${mode === "major" ? "major" : "minor"}`}
              aria-pressed={root === tonic}
              onClick={() => update({ tonic: root })}
            >
              {formatNote(parseNote(root))}
            </button>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
