import type { PodProps } from "../../seed/Pod";
import { Slider } from "../Slider";
import { CollapsibleSection } from "./CollapsibleSection";

interface PodControlsProps {
  value: PodProps;
  onChange: (props: Partial<PodProps>) => void;
}

export function PodControls({ value, onChange }: PodControlsProps) {
  return (
    <CollapsibleSection title="Pod Shape" indent>
      <div style={{ marginLeft: "16px" }}>
        <Slider
          label="Width"
          value={value.width}
          onChange={(width) => onChange({ width })}
          min={1}
          max={8}
          step={0.01}
        />
        <Slider
          label="Height"
          value={value.height}
          onChange={(height) => onChange({ height })}
          min={2}
          max={24}
          step={0.01}
        />
        <Slider
          label="Top Taper"
          value={value.topTaper}
          onChange={(topTaper) => onChange({ topTaper })}
          min={0}
          max={1}
          step={0.01}
        />
        <Slider
          label="Top Curve"
          value={value.topCurve}
          onChange={(topCurve) => onChange({ topCurve })}
          min={0}
          max={2}
          step={0.01}
        />
        <Slider
          label="Top Height"
          value={value.topCurveHeight}
          onChange={(topCurveHeight) => onChange({ topCurveHeight })}
          min={0}
          max={1}
          step={0.01}
        />
        <Slider
          label="Middle Width"
          value={value.middleWidth}
          onChange={(middleWidth) => onChange({ middleWidth })}
          min={0.5}
          max={1.5}
          step={0.01}
        />
        <Slider
          label="Middle Start"
          value={value.middleStart}
          onChange={(middleStart) => onChange({ middleStart })}
          min={0}
          max={0.5}
          step={0.01}
        />
        <Slider
          label="Bottom Curve"
          value={value.bottomCurve}
          onChange={(bottomCurve) => onChange({ bottomCurve })}
          min={0.5}
          max={1.5}
          step={0.01}
        />
        <Slider
          label="Bottom Width"
          value={value.bottomWidth}
          onChange={(bottomWidth) => onChange({ bottomWidth })}
          min={0.8}
          max={1.5}
          step={0.01}
        />
        <Slider
          label="Bottom Bulge"
          value={value.bottomBulge}
          onChange={(bottomBulge) => onChange({ bottomBulge })}
          min={0}
          max={0.5}
          step={0.01}
        />
      </div>
    </CollapsibleSection>
  );
}
