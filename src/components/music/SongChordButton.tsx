import { useEffect, useRef } from "react";

/** A tap opens the editor; a stationary hold temporarily shows a read-only shape. */
export default function SongChordButton({
  symbol,
  onChord,
  onPreview,
}: {
  symbol: string;
  onChord: (symbol: string, button: HTMLButtonElement) => void;
  onPreview: (symbol: string | null) => void;
}) {
  const cleanup = useRef<(() => void) | null>(null);
  const suppressClick = useRef(false);
  useEffect(() => () => cleanup.current?.(), []);
  return (
    <button
      type="button"
      aria-label={`Show ${symbol} voicing`}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        cleanup.current?.();
        suppressClick.current = false;
        onPreview(null);
        const { pointerId, clientX, clientY } = event;
        let previewing = false;
        const timer = window.setTimeout(() => {
          previewing = true;
          suppressClick.current = true;
          onPreview(symbol);
        }, 450);
        const finish = () => {
          clearTimeout(timer);
          if (previewing) onPreview(null);
          window.removeEventListener("pointerup", release, true);
          window.removeEventListener("pointercancel", cancel, true);
          window.removeEventListener("pointermove", move, true);
          window.removeEventListener("pointerdown", otherPointer, true);
          window.removeEventListener("scroll", cancel, true);
          window.removeEventListener("blur", cancel);
          document.removeEventListener("visibilitychange", cancel);
          window.removeEventListener("keydown", keydown, true);
          cleanup.current = null;
        };
        const cancel = () => {
          suppressClick.current = true;
          finish();
        };
        const release = (e: PointerEvent) => {
          if (e.pointerId === pointerId) finish();
        };
        const otherPointer = (e: PointerEvent) => {
          if (e.pointerId !== pointerId) cancel();
        };
        const move = (e: PointerEvent) => {
          if (
            e.pointerId === pointerId &&
            Math.hypot(e.clientX - clientX, e.clientY - clientY) > 12
          )
            cancel();
        };
        const keydown = (e: KeyboardEvent) => {
          if (e.key === "Escape") cancel();
        };
        cleanup.current = finish;
        window.addEventListener("pointerup", release, true);
        window.addEventListener("pointercancel", cancel, true);
        window.addEventListener("pointermove", move, true);
        window.addEventListener("pointerdown", otherPointer, true);
        window.addEventListener("scroll", cancel, true);
        window.addEventListener("blur", cancel);
        document.addEventListener("visibilitychange", cancel);
        window.addEventListener("keydown", keydown, true);
      }}
      onClick={(event) => {
        if (suppressClick.current && event.detail !== 0) {
          event.preventDefault();
          return;
        }
        onChord(symbol, event.currentTarget);
      }}
    >
      {symbol}
    </button>
  );
}
