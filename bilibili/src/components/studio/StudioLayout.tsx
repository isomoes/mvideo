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
          <ResizablePanel defaultSize={65} minSize={30} maxSize={80}>
            <ResizablePanelGroup orientation="horizontal">
              {/* Left: Resources Panel */}
              <ResizablePanel defaultSize={20} minSize={10} maxSize={40}>
                <div className="h-full border-r border-studio-border bg-studio-panel-bg">
                  {resourcesPanel}
                </div>
              </ResizablePanel>

              <ResizableHandle 
                id="horizontal-resources-preview"
                className="w-1.5 z-10 bg-studio-border hover:bg-studio-accent transition-colors cursor-col-resize" 
              />

              {/* Center: Preview Panel */}
              <ResizablePanel defaultSize={55} minSize={25} maxSize={70}>
                <div className="h-full bg-studio-bg">
                  {previewPanel}
                </div>
              </ResizablePanel>

              <ResizableHandle 
                id="horizontal-preview-inspector"
                className="w-1.5 z-10 bg-studio-border hover:bg-studio-accent transition-colors cursor-col-resize" 
              />

              {/* Right: Inspector Panel */}
              <ResizablePanel defaultSize={25} minSize={10} maxSize={40}>
                <div className="h-full border-l border-studio-border bg-studio-panel-bg">
                  {inspectorPanel}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle 
            id="vertical-upper-timeline"
            className="h-1.5 z-10 bg-studio-border hover:bg-studio-accent transition-colors cursor-row-resize" 
          />

          {/* Bottom: Timeline Panel */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={70}>
            <div className="h-full border-t border-studio-border bg-studio-timeline-bg">
              {timelinePanel}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
