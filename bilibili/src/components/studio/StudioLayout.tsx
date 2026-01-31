"use client";

import { ReactNode } from "react";
import {
  Panel as ResizablePanel,
  Group as ResizablePanelGroup,
  Separator as ResizableHandle,
} from "react-resizable-panels";

interface StudioLayoutProps {
  toolbar: ReactNode;
  resourcesPanel: ReactNode;
  previewPanel: ReactNode;
  inspectorPanel: ReactNode;
  timelinePanel: ReactNode;
}

export const StudioLayout = ({
  toolbar,
  resourcesPanel,
  previewPanel,
  inspectorPanel,
  timelinePanel,
}: StudioLayoutProps) => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-studio-bg">
      {/* Top Toolbar */}
      <div className="h-12 shrink-0 border-b border-studio-border bg-studio-panel-header">
        {toolbar}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup orientation="vertical">
          {/* Upper Section: Resources | Preview | Inspector */}
          <ResizablePanel defaultSize={65} minSize={30}>
            <ResizablePanelGroup orientation="horizontal">
              {/* Left: Resources Panel */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <div className="h-full overflow-hidden border-r border-studio-border bg-studio-panel-bg">
                  {resourcesPanel}
                </div>
              </ResizablePanel>

              <ResizableHandle className="w-1 bg-studio-border hover:bg-studio-accent transition-colors cursor-col-resize" />

              {/* Center: Preview Panel */}
              <ResizablePanel defaultSize={55} minSize={30}>
                <div className="h-full overflow-hidden bg-studio-bg">
                  {previewPanel}
                </div>
              </ResizablePanel>

              <ResizableHandle className="w-1 bg-studio-border hover:bg-studio-accent transition-colors cursor-col-resize" />

              {/* Right: Inspector Panel */}
              <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
                <div className="h-full overflow-hidden border-l border-studio-border bg-studio-panel-bg">
                  {inspectorPanel}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="h-1 bg-studio-border hover:bg-studio-accent transition-colors cursor-row-resize" />

          {/* Bottom: Timeline Panel */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={50}>
            <div className="h-full overflow-hidden border-t border-studio-border bg-studio-timeline-bg">
              {timelinePanel}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
