import type { ParachuteProps } from "../../seed/Parachute";
import { Slider } from "../Slider";
import { PodControls } from "./PodControls";

interface ParachuteControlsProps {
  value: ParachuteProps;
  onChange: (props: Partial<Omit<ParachuteProps, "flowField">>) => void;
}

export function ParachuteControls({ value, onChange }: ParachuteControlsProps) {
  return (
    <div>
      <Slider
        label="Number of Arms"
        value={value.numArms}
        onChange={(numArms) => onChange({ numArms })}
        min={3}
        max={20}
        step={1}
      />
      <Slider
        label="Arm Length"
        value={value.armLength}
        onChange={(armLength) => onChange({ armLength })}
        min={20}
        max={200}
        step={1}
      />
      <Slider
        label="Arm Width"
        value={value.armWidth}
        onChange={(armWidth) => onChange({ armWidth })}
        min={0.5}
        max={3}
        step={0.01}
      />
      <Slider
        label="Arm Width Decay"
        value={value.armWidthDecay}
        onChange={(armWidthDecay) => onChange({ armWidthDecay })}
        min={0.1}
        max={1}
        step={0.01}
      />
      <Slider
        label="Arm Angle Offset"
        value={value.angleOffset}
        onChange={(angleOffset) => onChange({ angleOffset })}
        min={0}
        max={2}
        step={0.01}
      />
      <Slider
        label="Arm Length Decay"
        value={value.armLengthDecay}
        onChange={(armLengthDecay) => onChange({ armLengthDecay })}
        min={0.8}
        max={1}
        step={0.01}
      />
      <Slider
        label="Arm Angle Range (* Pi)"
        value={value.angleRange / Math.PI}
        onChange={(angleRange) =>
          onChange({ angleRange: angleRange * Math.PI })
        }
        min={0}
        max={2}
        step={0.01}
      />
      <PodControls
        value={value.podProps}
        onChange={(podProps) =>
          onChange({ podProps: { ...value.podProps, ...podProps } })
        }
      />
    </div>
  );
}
