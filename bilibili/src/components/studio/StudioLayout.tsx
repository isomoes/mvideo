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
        <ResizablePanelGroup orientation="vertical" id="main-vertical-group">
          {/* Upper Section: Resources | Preview | Inspector */}
          <ResizablePanel id="upper-section">
            <ResizablePanelGroup
              orientation="horizontal"
              id="upper-horizontal-group"
            >
              {/* Left: Resources Panel */}
              <ResizablePanel minSize={100} maxSize={300} id="resources-panel">
                <div className="h-full border-r border-studio-border bg-studio-panel-bg">
                  {resourcesPanel}
                </div>
              </ResizablePanel>

              <ResizableHandle
                id="handle-resources-preview"
                style={{ flexBasis: "6px" }}
              />

              {/* Center: Preview Panel */}
              <ResizablePanel id="preview-panel">
                <div className="h-full bg-studio-bg">{previewPanel}</div>
              </ResizablePanel>

              <ResizableHandle
                id="handle-preview-inspector"
                style={{ flexBasis: "6px" }}
              />

              {/* Right: Inspector Panel */}
              <ResizablePanel minSize={100} maxSize={300} id="inspector-panel">
                <div className="h-full border-l border-studio-border bg-studio-panel-bg">
                  {inspectorPanel}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle
            id="handle-upper-timeline"
            style={{ flexBasis: "6px" }}
          />

          {/* Bottom: Timeline Panel */}
          <ResizablePanel id="timeline-panel" minSize={200} maxSize={330}>
            <div className="h-full border-t border-studio-border bg-studio-timeline-bg">
              {timelinePanel}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
