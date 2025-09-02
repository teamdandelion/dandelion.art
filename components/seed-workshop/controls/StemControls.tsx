import { Slider } from "../Slider";
import { StemProps } from "../../seed/Stem";
import { PodControls } from "./PodControls";

interface StemControlsProps {
  value: StemProps;
  onChange: (props: Partial<Omit<StemProps, "flowField">>) => void;
}

export function StemControls({ value, onChange }: StemControlsProps) {
  return (
    <section>
      <h3 style={{ color: "white", marginBottom: "8px" }}>Stem</h3>
      <Slider
        label="Length"
        value={value.length}
        onChange={(length) => onChange({ length })}
        min={80}
        max={240}
        step={1}
      />
      <Slider
        label="Width"
        value={value.width}
        onChange={(width) => onChange({ width })}
        min={1}
        max={3}
        step={0.01}
      />
      <Slider
        label="Rigidity"
        value={value.rigidity}
        onChange={(rigidity) => onChange({ rigidity })}
        min={0.8}
        max={1}
        step={0.01}
      />
      <PodControls
        value={value.podProps}
        onChange={(podProps) =>
          onChange({ podProps: { ...value.podProps, ...podProps } })
        }
      />
    </section>
  );
}
