import { FlowField } from "../../lib/flowField";
import { Pod, PodProps, defaultStemPodProps } from "./Pod";

export interface StemProps {
  length: number;
  width: number;
  rigidity: number;
  podProps: PodProps;
  flowField: FlowField;
}

export const defaultStemProps: StemProps = {
  length: 120,
  width: 1,
  rigidity: 0.93,
  podProps: defaultStemPodProps,
  flowField: new FlowField(1, 1),
};

export function Stem(props: StemProps) {
  const { points, angle } = props.flowField.followPathWithMomentum(
    { x: 0, y: 0 },
    Math.PI / 2,
    props.rigidity,
    20,
    props.length / 20,
  );
  const endPoint = points[points.length - 1];
  const podRotation = (angle * 180) / Math.PI + 90; // Convert to degrees and adjust

  const pathCommands = [
    `M ${points[0].x} ${points[0].y}`,
    ...points.slice(1).map((p) => `L ${p.x} ${p.y}`),
  ];

  return (
    <>
      <path
        d={pathCommands.join(" ")}
        stroke="black"
        strokeWidth={props.width}
        fill="none"
        strokeLinecap="round"
      />
      <Pod
        {...props.podProps}
        x={endPoint.x}
        y={endPoint.y}
        rotation={podRotation}
      />
    </>
  );
}
