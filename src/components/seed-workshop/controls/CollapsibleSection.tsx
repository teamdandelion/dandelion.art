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
    <div className={indent ? "ml-4" : ""}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="btn btn-ghost btn-sm w-full justify-start text-base-content hover:bg-base-300 px-2"
      >
        <span
          className="transition-transform duration-200"
          style={{ transform: `rotate(${isExpanded ? 90 : 0}deg)` }}
        >
          ▸
        </span>
        {title}
      </button>
      {isExpanded && children}
    </div>
  );
}
