import React, { useMemo } from "react";
import {
  Separator as ResizableHandle,
  Panel as ResizablePanel,
  Group as ResizablePanelGroup,
} from "react-resizable-panels";
import { useUIStore } from "../services/ui-store";
import { Panel } from "./Panel";
import { DockId } from "../../types/layout";

interface StudioLayoutProps {
  renderPanelContent: (panelId: string) => React.ReactNode;
}

export const StudioLayout = ({ renderPanelContent }: StudioLayoutProps) => {
  const { panels, togglePanelCollapse, setPanelDock } = useUIStore();

  const dockedPanels = useMemo(() => {
    const grouped: Record<DockId, typeof panels> = {
      left: [],
      center: [],
      right: [],
      bottom: [],
    };
    panels.forEach((panel) => grouped[panel.dock].push(panel));
    return grouped;
  }, [panels]);

  const renderPanelGroup = (dock: DockId) => {
    const groupPanels = dockedPanels[dock];
    if (groupPanels.length === 0) return null;

    return (
      <div className="flex h-full flex-col gap-4 overflow-auto p-2">
        {groupPanels.map((panel) => (
          <Panel
            key={panel.id}
            title={panel.title}
            dock={panel.dock}
            collapsed={panel.collapsed}
            onToggleCollapse={() => togglePanelCollapse(panel.id)}
            onDockChange={(newDock) => setPanelDock(panel.id, newDock)}
          >
            {renderPanelContent(panel.id)}
          </Panel>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-100px)] w-full">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup orientation="horizontal">
            {dockedPanels.left.length > 0 && (
              <>
                <ResizablePanel defaultSize={20} minSize={15}>
                  {renderPanelGroup("left")}
                </ResizablePanel>
                <ResizableHandle className="w-1 bg-unfocused-border-color hover:bg-foreground/50 transition-colors" />
              </>
            )}
            
            <ResizablePanel defaultSize={60}>
              {renderPanelGroup("center")}
            </ResizablePanel>

            {dockedPanels.right.length > 0 && (
              <>
                <ResizableHandle className="w-1 bg-unfocused-border-color hover:bg-foreground/50 transition-colors" />
                <ResizablePanel defaultSize={20} minSize={15}>
                  {renderPanelGroup("right")}
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
        
        {dockedPanels.bottom.length > 0 && (
          <>
            <ResizableHandle className="h-1 bg-unfocused-border-color hover:bg-foreground/50 transition-colors" />
            <ResizablePanel defaultSize={30} minSize={10}>
              {renderPanelGroup("bottom")}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
