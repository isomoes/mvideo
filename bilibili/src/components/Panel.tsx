import React, { ReactNode } from "react";
import { DockId } from "../../types/layout";

export const Panel = ({
  title,
  dock,
  collapsed,
  onToggleCollapse,
  onDockChange,
  children,
}: {
  title: string;
  dock: DockId;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDockChange: (dock: DockId) => void;
  children: ReactNode;
}) => {
  return (
    <section className="rounded-3xl border border-unfocused-border-color bg-background/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-subtitle">
            Docked {dock}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <select
            className="rounded-full border border-unfocused-border-color bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
            value={dock}
            onChange={(event) => onDockChange(event.target.value as DockId)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="bottom">Bottom</option>
          </select>
          <button
            className="rounded-full border border-unfocused-border-color px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
            onClick={onToggleCollapse}
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>
      {!collapsed && <div className="mt-4">{children}</div>}
    </section>
  );
};
