export type DockId = "left" | "center" | "right" | "bottom";

export type PanelState = {
  id: string;
  title: string;
  dock: DockId;
  collapsed: boolean;
};
