"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection = ({
  title,
  icon,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/80 transition-colors group"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground group-hover:text-foreground transition-colors">{icon}</span>}
          <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-all" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-all" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
