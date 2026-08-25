import { FlowField } from "../lib/flowField";
import { createSeed, Seed } from "./seed/Seed";

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
      <title>Dandelion seed</title>
      <Seed {...seedProps} />
    </svg>
  );
}
