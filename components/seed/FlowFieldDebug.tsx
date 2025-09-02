import { FlowField } from "../../lib/flowField";

interface FlowFieldDebugProps {
  flowField: FlowField;
  size: number; // Size of the visualization grid
  density?: number; // How many sample points to show
}

export function FlowFieldDebug({
  flowField,
  size,
  density = 40,
}: FlowFieldDebugProps) {
  return (
    <g>
      {Array.from({ length: density }, (_, i) =>
        Array.from({ length: density }, (_, j) => {
          const x = ((i - density / 2) * size) / (density / 2);
          const y = ((j - density / 2) * size) / (density / 2);
          const angle = flowField.getAngle(x, y);
          const lineLength = size * 0.04;

          return (
            <line
              key={`${i}-${j}`}
              x1={x}
              y1={y}
              x2={x + Math.cos(angle) * lineLength}
              y2={y + Math.sin(angle) * lineLength}
              stroke="rgba(255,0,0,0.3)"
              strokeWidth="0.5"
            />
          );
        }),
      ).flat()}
    </g>
  );
}
