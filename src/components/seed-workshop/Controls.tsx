import { createSeed, type SeedProps } from "../seed/Seed";
import { CollapsibleSection } from "./controls/CollapsibleSection";
import { FlowFieldControls } from "./controls/FlowFieldControls";
import { ParachuteControls } from "./controls/ParachuteControls";
import { StemControls } from "./controls/StemControls";

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
    <div className="flex flex-col gap-4">
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
        type="button"
        onClick={handleDownload}
        className="btn btn-primary btn-sm"
      >
        Download SVG
      </button>
    </div>
  );
}
