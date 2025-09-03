import { Seed, createSeed } from "./seed/Seed";
import { FlowField } from "../lib/flowField";

export function DandelionLogo() {
  const seedProps = createSeed({
    flowField: new FlowField(1.6, 1),
    showField: false,
  });

  return (
    <svg
      width="32"
      height="32"
      viewBox="-25 -85 60 210"
      preserveAspectRatio="xMidYMid meet"
      className="hover:scale-110 transition-transform duration-300"
    >
      <Seed {...seedProps} />
    </svg>
  );
}
