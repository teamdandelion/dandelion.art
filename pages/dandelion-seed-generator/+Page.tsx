import { useState, useRef } from "react";
import { Seed, createSeed } from "../../components/seed/Seed";
import { Controls } from "../../components/seed-workshop/Controls";
import { FlowField } from "../../lib/flowField";

export default function Page(): JSX.Element {
  const [seedProps, setSeedProps] = useState(() =>
    createSeed({
      flowField: new FlowField(1.6, 1),
      showField: false,
    }),
  );
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <svg
          ref={svgRef}
          width="600"
          height="600"
          viewBox="-20 -80 50 200"
          preserveAspectRatio="xMidYMid meet"
          style={{
            background: "white",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Seed {...seedProps} />
        </svg>
      </main>

      <aside
        style={{
          width: "300px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
          background: "#242424",
        }}
      >
        <Controls
          onChange={setSeedProps}
          currentProps={seedProps}
          svgRef={svgRef}
        />
      </aside>
    </div>
  );
}
