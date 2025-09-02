import { Slider } from "../Slider";
import { FlowField } from "../../../lib/flowField";

interface FlowFieldControlsProps {
  value: FlowField;
  showField: boolean;
  onChange: (updates: { flowField?: FlowField; showField?: boolean }) => void;
}

export function FlowFieldControls({
  value,
  showField,
  onChange,
}: FlowFieldControlsProps) {
  return (
    <section>
      <h3 style={{ color: "white", marginBottom: "8px" }}>Flow Field</h3>
      <Slider
        label="Intensity"
        value={value.intensity}
        onChange={(intensity) =>
          onChange({
            flowField: new FlowField(intensity, value.decay),
          })
        }
        min={0}
        max={2}
        step={0.05}
      />
      <Slider
        label="Decay"
        value={value.decay}
        onChange={(decay) =>
          onChange({
            flowField: new FlowField(value.intensity, decay),
          })
        }
        min={0.2}
        max={2}
        step={0.05}
      />
      <label
        style={{
          color: "white",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="checkbox"
          checked={showField}
          onChange={(e) => onChange({ showField: e.target.checked })}
        />
        Show Field
      </label>
    </section>
  );
}
