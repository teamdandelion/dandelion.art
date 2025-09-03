import { useState, useRef } from "react";
import { Seed, createSeed } from "../../components/seed/Seed";
import { Controls } from "../../components/seed-workshop/Controls";
import { FlowField } from "../../lib/flowField";

export default function Page() {
  const [seedProps, setSeedProps] = useState(() =>
    createSeed({
      flowField: new FlowField(1.6, 1),
      showField: false,
    }),
  );
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-base-100 relative">
        {/* Main large preview */}
        <div className="w-full max-w-2xl aspect-square">
          <svg
            ref={svgRef}
            className="w-full h-full bg-base-100 rounded-lg shadow-xl border border-base-300"
            viewBox="-25 -85 60 210"
            preserveAspectRatio="xMidYMid meet"
          >
            <Seed {...seedProps} />
          </svg>
        </div>

        {/* Header-sized preview - positioned absolutely */}
        <div className="absolute top-4 left-4 flex items-center gap-2 p-2 bg-base-200 rounded-lg shadow-lg">
          <svg
            width="32"
            height="32"
            viewBox="-25 -85 60 210"
            preserveAspectRatio="xMidYMid meet"
            className="bg-base-100 rounded border border-base-300"
          >
            <Seed {...seedProps} />
          </svg>
        </div>
      </main>

      <aside className="w-full lg:w-80 bg-base-200 border-t lg:border-t-0 lg:border-l border-base-300">
        <div className="h-full overflow-y-auto p-4 lg:p-6">
          <Controls
            onChange={setSeedProps}
            currentProps={seedProps}
            svgRef={svgRef}
          />
        </div>
      </aside>
    </div>
  );
}
