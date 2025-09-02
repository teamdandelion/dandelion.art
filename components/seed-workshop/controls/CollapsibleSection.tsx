import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  indent?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  indent = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div style={{ marginLeft: indent ? "16px" : "0" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 0",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span style={{ transform: `rotate(${isExpanded ? 90 : 0}deg)` }}>
          ▸
        </span>
        {title}
      </button>
      {isExpanded && children}
    </div>
  );
}
