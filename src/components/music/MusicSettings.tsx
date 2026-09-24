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
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path
            d="M9 18V6l11-3v12M9 9l11-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse cx="6" cy="18" rx="3" ry="2.5" fill="currentColor" />
          <ellipse cx="17" cy="15" rx="3" ry="2.5" fill="currentColor" />
        </svg>
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
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const buttons = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          ];
          const first = buttons[0],
            last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
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
      </dialog>
    </div>
  );
}
