export type HSV = { h: number; s: number; v: number };
export function parseHex(value: unknown): string | null {
  return typeof value === "string" && /^#?[\da-f]{6}$/i.test(value)
    ? `#${value.replace(/^#/, "").toLowerCase()}`
    : null;
}

function rgb(hex: string) {
  return [1, 3, 5].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16),
  );
}
function hex(rgb: number[]) {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}
export function hsvToHex({ h, s, v }: HSV): string {
  const hue = ((h % 360) + 360) % 360;
  const saturation = Math.max(0, Math.min(100, s)) / 100;
  const value = Math.max(0, Math.min(100, v)) / 100;
  const channel = (n: number) => {
    const k = (n + hue / 60) % 6;
    return 255 * value * (1 - saturation * Math.max(0, Math.min(k, 4 - k, 1)));
  };
  return hex([channel(5), channel(3), channel(1)]);
}
export function hexToHsv(color: string): HSV {
  const [r, g, b] = rgb(color).map((n) => n / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const hue =
    delta === 0
      ? 0
      : max === r
        ? (g - b) / delta
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4;
  return {
    h: (hue * 60 + 360) % 360,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  };
}
function luminance(color: string) {
  const [r, g, b] = rgb(color).map((n) => {
    const channel = n / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
export function contrast(a: string, b: string) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}
