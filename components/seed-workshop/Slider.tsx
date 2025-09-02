interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: SliderProps) {
  return (
    <label>
      <div style={{ color: "white", marginBottom: "4px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ color: "white", minWidth: "36px", textAlign: "right" }}>
          {value.toFixed(step >= 1 ? 0 : step >= 0.1 ? 1 : 2)}
        </span>
      </div>
    </label>
  );
}
