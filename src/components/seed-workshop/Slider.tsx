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
    <label className="block">
      <div className="text-base-content text-sm mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range range-xs range-primary flex-1"
        />
        <span className="text-base-content text-sm min-w-[36px] text-right">
          {value.toFixed(step >= 1 ? 0 : step >= 0.1 ? 1 : 2)}
        </span>
      </div>
    </label>
  );
}
