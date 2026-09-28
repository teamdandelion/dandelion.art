import { useEffect, useId, useRef, useState } from "react";
import type { Chord, Voicing } from "../../lib/music";
import { PianoDiagram, PlayButton } from "./VoicingPlayback";
import "./voicing-widget.css";

export default function PianoVoicingButton({
  chord,
  voicing,
}: {
  chord?: Chord;
  voicing: Voicing;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    const previous = document.documentElement.style.overflow;
    node?.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      node?.close();
      document.documentElement.style.overflow = previous;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);
  const label = `Show ${chord?.symbol ?? "selected"} piano voicing`;
  return (
    <>
      <button
        ref={trigger}
        className="vw-piano"
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M7 12v8m5-8v8m5-8v8" />
          <path d="M6 4v9h3V4m6 0v9h3V4" fill="currentColor" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        className="cs-modal pv-modal"
        aria-labelledby={id}
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
          )
            setOpen(false);
        }}
      >
        {open && (
          <div className="cs-modal-content">
            <header>
              <h2 id={id}>{chord?.symbol ?? "Selected notes"} · piano</h2>
              <button
                type="button"
                className="cs-close"
                aria-label="Close piano voicing"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="pv-keyboard">
              <PianoDiagram chord={chord} voicing={voicing} />
            </div>
            <PlayButton voicing={voicing} />
          </div>
        )}
      </dialog>
    </>
  );
}
