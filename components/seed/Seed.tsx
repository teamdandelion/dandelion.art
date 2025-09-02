import { FlowField } from "../../lib/flowField";
import { Parachute, ParachuteProps, defaultParachuteProps } from "./Parachute";
import { FlowFieldDebug } from "./FlowFieldDebug";
import { Stem, StemProps, defaultStemProps } from "./Stem";

export interface SeedProps {
  flowField: FlowField;
  x?: number;
  y?: number;
  rotation?: number;
  showField: boolean;
  stemProps: StemProps;
  parachuteProps: ParachuteProps;
}

export function createSeed(config: {
  flowField: FlowField;
  x?: number;
  y?: number;
  rotation?: number;
  showField?: boolean;
  stemProps?: Partial<Omit<StemProps, "flowField">>;
  parachuteProps?: Partial<Omit<ParachuteProps, "flowField">>;
}): SeedProps {
  const {
    flowField,
    showField = false,
    stemProps = {},
    parachuteProps = {},
    ...rest
  } = config;

  return {
    flowField,
    showField,
    stemProps: {
      ...defaultStemProps,
      ...stemProps,
      flowField,
    },
    parachuteProps: {
      ...defaultParachuteProps,
      ...parachuteProps,
      flowField,
    },
    ...rest,
  };
}

export function Seed({
  x = 0,
  y = 0,
  rotation = 0,
  flowField,
  showField,
  stemProps,
  parachuteProps,
}: SeedProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      {showField && (
        <FlowFieldDebug flowField={flowField} size={stemProps.length * 2} />
      )}
      <Parachute {...parachuteProps} />
      <Stem {...stemProps} />
    </g>
  );
}
