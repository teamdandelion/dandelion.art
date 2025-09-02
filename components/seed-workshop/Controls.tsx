import { SeedProps, createSeed } from "../seed/Seed";
import { ParachuteControls } from "./controls/ParachuteControls";
import { FlowFieldControls } from "./controls/FlowFieldControls";
import { StemControls } from "./controls/StemControls";
import { CollapsibleSection } from "./controls/CollapsibleSection";

interface ControlsProps {
  onChange: (props: SeedProps) => void;
  currentProps: SeedProps;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export function Controls({ onChange, currentProps, svgRef }: ControlsProps) {
  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dandelion.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <CollapsibleSection title="Parachute" defaultExpanded>
        <ParachuteControls
          value={currentProps.parachuteProps}
          onChange={(parachuteProps) =>
            onChange(
              createSeed({
                ...currentProps,
                parachuteProps: {
                  ...currentProps.parachuteProps,
                  ...parachuteProps,
                },
              }),
            )
          }
        />
      </CollapsibleSection>

      <CollapsibleSection title="Flow Field">
        <FlowFieldControls
          value={currentProps.flowField}
          showField={currentProps.showField}
          onChange={({ flowField, showField }) =>
            onChange(
              createSeed({
                ...currentProps,
                ...(flowField && { flowField }),
                ...(showField !== undefined && { showField }),
              }),
            )
          }
        />
      </CollapsibleSection>

      <CollapsibleSection title="Stem">
        <StemControls
          value={currentProps.stemProps}
          onChange={(stemProps) =>
            onChange(
              createSeed({
                ...currentProps,
                stemProps: {
                  ...currentProps.stemProps,
                  ...stemProps,
                },
              }),
            )
          }
        />
      </CollapsibleSection>

      <button
        onClick={handleDownload}
        style={{
          padding: "8px 16px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Download SVG
      </button>
    </div>
  );
}
