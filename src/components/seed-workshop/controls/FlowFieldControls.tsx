import { FlowField } from "../../../lib/flowField";
import { Slider } from "../Slider";

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
      <h3 className="text-base-content font-semibold mb-2">Flow Field</h3>
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
      <label className="flex items-center gap-2 text-base-content cursor-pointer">
        <input
          type="checkbox"
          checked={showField}
          onChange={(e) => onChange({ showField: e.target.checked })}
          className="checkbox checkbox-primary checkbox-sm"
        />
        <span className="text-sm">Show Field</span>
      </label>
    </section>
  );
}
