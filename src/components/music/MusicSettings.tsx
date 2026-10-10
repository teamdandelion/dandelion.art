import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  BARITONE,
  formatNote,
  GUITAR,
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
import "./chord-atlas.css";
import { setAppearance } from "../../lib/palette-client";
import OfflineStatus from "./OfflineStatus";

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
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
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
    ready,
    ...preferences,
    instrument:
      INSTRUMENTS.find((i) => i.id === preferences.instrumentId) ?? GUITAR,
    update,
  };
}

function MusicSettingsControls() {
  const { instrumentId, tonic, mode, update } = useMusicPreferences();
  return (
    <div className="music-settings">
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
          className="ms-keys"
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
    </div>
  );
}

export default function MusicSettings() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [attention, setAttention] = useState(false);
  const [light, setLight] = useState(true);
  const tray = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const { instrument, tonic, mode } = useMusicPreferences();
  const selection = `${instrument.name}, ${formatNote(parseNote(tonic))} ${mode === "major" ? "major" : "minor"}`;
  useEffect(() => {
    if (!open) return;
    const dialog = tray.current;
    const previous = document.documentElement.style.overflow;
    dialog?.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.documentElement.style.overflow = previous;
      launcher.current?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <div className="chord-atlas music-settings-host">
      <button
        ref={launcher}
        className="ms-launcher"
        type="button"
        aria-label={`Music settings: ${selection}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-tray`}
        title={selection}
        onClick={() => {
          setLight(document.documentElement.dataset.theme === "light");
          setOpen(true);
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 3-.5 2-2 1L4.5 5 2 9l1.5 1.5v3L2 15l2.5 4 2-1 2 1 .5 2h6l.5-2 2-1 2 1 2.5-4-1.5-1.5v-3L22 9l-2.5-4-2 1-2-1L15 3Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {attention && (
          <output
            className="ms-attention"
            aria-label="Music settings needs attention"
          />
        )}
      </button>
      <dialog
        id={`${id}-tray`}
        ref={tray}
        className="ms-tray"
        aria-labelledby={`${id}-title`}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          ) {
            event.preventDefault();
            setOpen(false);
          }
        }}
      >
        <header className="ms-tray-header">
          <h2 id={`${id}-title`}>Music settings</h2>
          <button
            type="button"
            className="ms-done"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </header>
        <MusicSettingsControls />
        <label className="ms-appearance">
          <input
            type="checkbox"
            aria-label="Toggle theme"
            checked={light}
            onChange={(event) => {
              setLight(event.target.checked);
              setAppearance({ theme: event.target.checked ? "light" : "dark" });
            }}
          />{" "}
          Light theme
        </label>
        <OfflineStatus onAttention={setAttention} />
        <a className="ms-site-link" href="/">
          Visit dandelion.art ↗
        </a>
      </dialog>
    </div>
  );
}
