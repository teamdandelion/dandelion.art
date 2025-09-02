import { FlowField } from "../../lib/flowField";
import { Pod, PodProps, defaultParachutePodProps } from "./Pod";

export interface ParachuteProps {
  numArms: number;
  armLength: number;
  numSteps: number;
  flowField: FlowField;
  armWidth: number;
  angleRange: number; // Range of angles in radians
  // Offset in radians for starting angle of the arms
  angleOffset: number;
  armLengthDecay: number;
  armWidthDecay: number;
  podProps: PodProps;
}

export const defaultParachuteProps: ParachuteProps = {
  numArms: 11,
  armLength: 100,
  numSteps: 42,
  flowField: new FlowField(1, 1),
  armWidth: 1,
  angleOffset: 0.93,
  angleRange: Math.PI * 1.29,
  armLengthDecay: 0.94,
  armWidthDecay: 0.5,
  podProps: defaultParachutePodProps,
};

export function Parachute(props: ParachuteProps) {
  const rootRadius = 1; // Radius for the root offset circle

  const generateArm = (
    startPoint: { x: number; y: number },
    startAngle: number,
    armLength: number,
  ) => {
    return props.flowField.followPath(
      startPoint,
      startAngle,
      props.numSteps,
      armLength / props.numSteps,
    );
  };

  // Generate all arms
  const arms = Array.from({ length: props.numArms }, (_, i) => {
    const distFromCenter = Math.abs(i - props.numArms / 2);
    const armLength =
      props.armLength * Math.pow(props.armLengthDecay, distFromCenter);
    const angle =
      (i * props.angleRange) / props.numArms + props.angleOffset * Math.PI;

    // Calculate root offset for more natural convergence
    const rootAngle = (i * 2 * Math.PI) / props.numArms;
    const startPoint = {
      x: Math.cos(rootAngle) * rootRadius,
      y: Math.sin(rootAngle) * rootRadius,
    };

    const { points, angle: endAngle } = generateArm(
      startPoint,
      angle,
      armLength,
    );

    // Create individual line segments with varying widths
    const segments = points.slice(1).map((point, index) => {
      const prevPoint = points[index];
      const widthFactor =
        props.armWidthDecay +
        ((1 - props.armWidthDecay) * index) / (points.length - 1);

      return (
        <line
          key={index}
          x1={prevPoint.x}
          y1={prevPoint.y}
          x2={point.x}
          y2={point.y}
          stroke="black"
          strokeWidth={props.armWidth * widthFactor}
          strokeLinecap="round"
        />
      );
    });

    const endPoint = points[points.length - 1];
    const podRotation = (endAngle * 180) / Math.PI + 90;

    return (
      <g key={i}>
        {segments}
        <Pod
          {...props.podProps}
          x={endPoint.x}
          y={endPoint.y}
          rotation={podRotation}
        />
      </g>
    );
  });

  return (
    <>
      {arms}
      <circle cx={0} cy={0} r={rootRadius * 0.85} fill="black" />
    </>
  );
}
