export interface PodProps {
  width: number;
  height: number;
  topTaper: number;
  topCurve: number;
  topCurveHeight: number;
  middleWidth: number;
  middleStart: number;
  bottomCurve: number;
  bottomWidth: number;
  bottomBulge: number;
}

export const defaultStemPodProps: PodProps = {
  width: 6,
  height: 16,
  topTaper: 0.3,
  topCurve: 0.9,
  topCurveHeight: 0.7,
  middleWidth: 0.8,
  middleStart: 0.1,
  bottomCurve: 1,
  bottomWidth: 1.1,
  bottomBulge: 0.2,
};

export const defaultParachutePodProps: PodProps = {
  width: 2,
  height: 6,
  topTaper: 0.3,
  topCurve: 0.9,
  topCurveHeight: 0.7,
  middleWidth: 0.8,
  middleStart: 0.1,
  bottomCurve: 1,
  bottomWidth: 1.1,
  bottomBulge: 0.2,
};

export function Pod({
  width,
  height,
  x,
  y,
  rotation,
  topTaper,
  topCurve,
  topCurveHeight,
  middleWidth,
  middleStart,
  bottomCurve,
  bottomWidth,
  bottomBulge,
}: PodProps & {
  x: number;
  y: number;
  rotation: number;
}) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const path = `
    M 0 ${-halfHeight}
    C ${-halfWidth * topTaper} ${-halfHeight}
      ${-halfWidth * topCurve} ${-halfHeight * topCurveHeight}
      ${-halfWidth * middleWidth} ${halfHeight * middleStart}
    C ${-halfWidth * middleWidth} ${halfHeight * bottomBulge}
      ${-halfWidth * bottomWidth} ${halfHeight * bottomCurve}
      0 ${halfHeight}
    C ${halfWidth * bottomWidth} ${halfHeight * bottomCurve}
      ${halfWidth * middleWidth} ${halfHeight * bottomBulge}
      ${halfWidth * middleWidth} ${halfHeight * middleStart}
    C ${halfWidth * topCurve} ${-halfHeight * topCurveHeight}
      ${halfWidth * topTaper} ${-halfHeight}
      0 ${-halfHeight}
    Z
  `;
  return (
    <path
      d={path}
      fill="black"
      transform={`translate(${x} ${y}) rotate(${rotation})`}
    />
  );
}
