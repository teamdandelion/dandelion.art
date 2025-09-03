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
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-base-100">
        <div className="w-full max-w-2xl aspect-square">
          <svg
            ref={svgRef}
            className="w-full h-full bg-base-100 rounded-lg shadow-xl border border-base-300"
            viewBox="-20 -80 50 200"
            preserveAspectRatio="xMidYMid meet"
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
