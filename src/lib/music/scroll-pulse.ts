// Constant acceleration for T/2, then equal deceleration for T/2.
// For displacement D: a = 4D/T², peak velocity = 2D/T.
export const SCROLL_PULSE_MS = 1200;
export function scrollPulseProgress(
  elapsed: number,
  duration = SCROLL_PULSE_MS,
) {
  const t = duration <= 0 ? 1 : Math.max(0, Math.min(1, elapsed / duration));
  return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) ** 2;
}
