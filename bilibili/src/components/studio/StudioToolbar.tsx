"use client";

import React from "react";

// Icon components for toolbar
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const StepBackIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);

const StepForwardIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

const SkipBackIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
  </svg>
);

const SkipForwardIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 18l8.5-6L6 6v12zm8.5-6l8.5 6V6l-8.5 6z" />
  </svg>
);

const SelectIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
  </svg>
);

const RazorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2v20M2 12h20" />
  </svg>
);

const HandIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const ZoomInIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35M8 11h6" />
  </svg>
);

const UndoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 7v6h6M3 13a9 9 0 1 0 2.83-6.36L3 9" />
  </svg>
);

const RedoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 7v6h-6M21 13a9 9 0 1 1-2.83-6.36L21 9" />
  </svg>
);

const SnapIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 3H3v18h18V3zM9 3v18M15 3v18M3 9h18M3 15h18" />
  </svg>
);

const MagnetIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 7v6c0 5.5 4.5 10 10 10s10-4.5 10-10V7h-6v6c0 2.2-1.8 4-4 4s-4-1.8-4-4V7H3zm0-2h6V2H3v3zm12 0h6V2h-6v3z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  shortcut?: string;
}

const ToolbarButton = ({ icon, label, active, onClick, shortcut }: ToolbarButtonProps) => (
  <button
    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${
      active
        ? "bg-studio-accent text-white"
        : "text-studio-text hover:bg-studio-border"
    }`}
    onClick={onClick}
    title={shortcut ? `${label} (${shortcut})` : label}
  >
    {icon}
    {label && <span className="hidden lg:inline">{label}</span>}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-studio-border mx-1" />
);

interface StudioToolbarProps {
  projectName?: string;
  isPlaying: boolean;
  snapEnabled: boolean;
  rippleEnabled: boolean;
  zoom: number;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  activeTool: "select" | "razor" | "hand";
  onNewProject?: () => void;
  onTogglePlay: (e?: React.SyntheticEvent) => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onSkipToStart: () => void;
  onSkipToEnd: () => void;
  onToggleSnap: () => void;
  onToggleRipple: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToolChange: (tool: "select" | "razor" | "hand") => void;
}

const formatTimecode = (frame: number, fps: number) => {
  const totalSeconds = Math.floor(frame / fps);
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const frames = (frame % fps).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}:${frames}`;
};

export const StudioToolbar = ({
  projectName,
  isPlaying,
  snapEnabled,
  rippleEnabled,
  zoom,
  currentFrame,
  totalFrames,
  fps,
  activeTool,
  onNewProject,
  onTogglePlay,
  onStepBackward,
  onStepForward,
  onSkipToStart,
  onSkipToEnd,
  onToggleSnap,
  onToggleRipple,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onToolChange,
}: StudioToolbarProps) => {
  const zoomLabel = Number.isInteger(zoom) ? `${zoom}` : zoom.toFixed(1);

  return (
    <div className="flex items-center justify-between h-full px-3">
      {/* Left Section: Project Info & Undo/Redo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <FolderIcon />
          <span className="text-studio-text font-medium text-sm">{projectName || "No Project"}</span>
        </div>
        <ToolbarDivider />
        <button
          className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors bg-studio-accent text-white hover:bg-studio-accent-hover"
          onClick={onNewProject}
          title="New Project (Ctrl+N)"
        >
          <PlusIcon />
          <span className="hidden lg:inline">New</span>
        </button>
        <ToolbarDivider />
        <ToolbarButton icon={<UndoIcon />} label="Undo" onClick={onUndo} shortcut="Ctrl+Z" />
        <ToolbarButton icon={<RedoIcon />} label="Redo" onClick={onRedo} shortcut="Ctrl+Shift+Z" />
      </div>

      {/* Center Section: Playback Controls */}
      <div className="flex items-center gap-1">
        {/* Tools */}
        <div className="flex items-center gap-0.5 mr-4">
          <ToolbarButton
            icon={<SelectIcon />}
            active={activeTool === "select"}
            onClick={() => onToolChange("select")}
            label="Select"
            shortcut="V"
          />
          <ToolbarButton
            icon={<RazorIcon />}
            active={activeTool === "razor"}
            onClick={() => onToolChange("razor")}
            label="Razor"
            shortcut="C"
          />
          <ToolbarButton
            icon={<HandIcon />}
            active={activeTool === "hand"}
            onClick={() => onToolChange("hand")}
            label="Hand"
            shortcut="H"
          />
        </div>

        <ToolbarDivider />

        {/* Playback */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={<SkipBackIcon />}
            onClick={onSkipToStart}
            label="Start"
            shortcut="Home"
          />
          <ToolbarButton
            icon={<StepBackIcon />}
            onClick={onStepBackward}
            label="Back"
            shortcut="Left"
          />
          <button
            className={`flex items-center justify-center w-10 h-8 rounded transition-colors ${
              isPlaying
                ? "bg-studio-playhead text-white"
                : "bg-studio-accent text-white hover:bg-studio-accent-hover"
            }`}
            onClick={(e) => onTogglePlay(e)}
            title="Play/Pause (Space)"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <ToolbarButton
            icon={<StepForwardIcon />}
            onClick={onStepForward}
            label="Forward"
            shortcut="Right"
          />
          <ToolbarButton
            icon={<SkipForwardIcon />}
            onClick={onSkipToEnd}
            label="End"
            shortcut="End"
          />
        </div>

        <ToolbarDivider />

        {/* Timecode Display */}
        <div className="flex items-center gap-2 px-3 py-1 bg-studio-bg rounded text-xs font-mono">
          <span className="text-studio-text">{formatTimecode(currentFrame, fps)}</span>
          <span className="text-studio-text-muted">/</span>
          <span className="text-studio-text-muted">{formatTimecode(totalFrames, fps)}</span>
        </div>
      </div>

      {/* Right Section: Timeline Controls */}
      <div className="flex items-center gap-2">
        <ToolbarButton
          icon={<SnapIcon />}
          label="Snap"
          active={snapEnabled}
          onClick={onToggleSnap}
          shortcut="S"
        />
        <ToolbarButton
          icon={<MagnetIcon />}
          label="Ripple"
          active={rippleEnabled}
          onClick={onToggleRipple}
          shortcut="R"
        />
        <ToolbarDivider />
        <div className="flex items-center gap-1">
          <ToolbarButton icon={<ZoomOutIcon />} onClick={onZoomOut} shortcut="-" />
          <span className="text-studio-text text-xs w-10 text-center">{zoomLabel}%</span>
          <ToolbarButton icon={<ZoomInIcon />} onClick={onZoomIn} shortcut="+" />
        </div>
      </div>
    </div>
  );
};
