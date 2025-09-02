export class FlowField {
  private readonly SCALE = 100; // Fixed normalization factor

  constructor(
    public intensity: number, // How much the field rotates
    public decay: number, // How quickly rotation increases with distance
  ) {}

  getAngle(x: number, y: number): number {
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x);
    return theta + this.intensity * Math.pow(r / this.SCALE, this.decay);
  }

  // Helper for following flow field without momentum
  followPath(
    p0: { x: number; y: number },
    startingAngle: number,
    steps: number,
    stepSize: number,
  ): { points: { x: number; y: number }[]; angle: number } {
    let a = startingAngle;
    let p = this.step(p0, a, stepSize);
    const points = [p0, p];

    while (points.length < steps) {
      a = this.getAngle(p.x, p.y);
      p = this.step(p, a, stepSize);
      points.push(p);
    }
    return { points, angle: a };
  }

  followPathWithMomentum(
    p0: { x: number; y: number },
    startingAngle: number,
    momentum: number,
    steps: number,
    stepSize: number,
  ): { points: { x: number; y: number }[]; angle: number } {
    let a = startingAngle;
    let p = this.step(p0, a, stepSize);
    const points = [p0, p];

    while (points.length < steps) {
      a = a * momentum + this.getAngle(p.x, p.y) * (1 - momentum);
      p = this.step(p, a, stepSize);
      points.push(p);
    }
    return { points, angle: a };
  }

  private step(
    p: { x: number; y: number },
    a: number,
    s: number,
  ): { x: number; y: number } {
    return { x: p.x + Math.cos(a) * s, y: p.y + Math.sin(a) * s };
  }
}
