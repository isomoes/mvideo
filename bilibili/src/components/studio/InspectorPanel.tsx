"use client";

import React, { useState } from "react";

// Icon components
const ChevronDownIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <path d="M10 8l6 4-6 4V8z" />
  </svg>
);

const EffectsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const TransformIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 3H3v18h18V3zM9 3v18M15 3v18M3 9h18M3 15h18" />
  </svg>
);

const AudioIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const ColorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 0 0 20 4 4 0 0 0 0-8 2 2 0 0 1 0-4 10 10 0 0 0 0-8z" />
  </svg>
);

interface InspectorSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const InspectorSection = ({
  title,
  icon,
  defaultExpanded = true,
  children,
}: InspectorSectionProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-studio-border">
      <button
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-studio-border/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-studio-text-muted">
          {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </span>
        <span className="text-studio-accent">{icon}</span>
        <span className="text-studio-text text-sm font-medium">{title}</span>
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
}

const PropertyRow = ({ label, children }: PropertyRowProps) => (
  <div className="flex items-center justify-between gap-2 py-1">
    <span className="text-xs text-studio-text-muted shrink-0">{label}</span>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const NumberInput = ({ value, onChange, min, max, step = 1, unit }: NumberInputProps) => (
  <div className="flex items-center gap-1">
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full px-2 py-1 text-xs text-right bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:border-studio-accent"
    />
    {unit && <span className="text-xs text-studio-text-muted">{unit}</span>}
  </div>
);

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}

const SliderInput = ({ value, onChange, min, max, step = 1 }: SliderInputProps) => (
  <div className="flex items-center gap-2">
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="flex-1 h-1 bg-studio-border rounded appearance-none cursor-pointer accent-studio-accent"
    />
    <span className="text-xs text-studio-text w-8 text-right">{value}</span>
  </div>
);

interface SelectedClip {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "text";
  startFrame: number;
  durationInFrames: number;
  trimStartFrame?: number;
  trimEndFrame?: number;
}

interface InspectorPanelProps {
  selectedClip?: SelectedClip | null;
  fps: number;
  onClipUpdate?: (clip: Partial<SelectedClip>) => void;
}

export const InspectorPanel = ({ selectedClip, fps, onClipUpdate }: InspectorPanelProps) => {
  // Demo state for properties
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState({ x: 100, y: 100 });
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [volume, setVolume] = useState(100);
  const [speed, setSpeed] = useState(1.0);

  const formatTimecode = (frame: number) => {
    const totalSeconds = Math.floor(frame / fps);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    const frames = (frame % fps).toString().padStart(2, "0");
    return `${minutes}:${seconds}:${frames}`;
  };

  if (!selectedClip) {
    return (
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-studio-panel-header border-b border-studio-border">
          <h3 className="text-studio-text font-medium text-sm">Inspector</h3>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-studio-border/50 flex items-center justify-center">
              <VideoIcon />
            </div>
            <p className="text-sm text-studio-text-muted">No clip selected</p>
            <p className="text-xs text-studio-text-muted mt-1">
              Select a clip in the timeline to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-studio-panel-header border-b border-studio-border">
        <h3 className="text-studio-text font-medium text-sm">Inspector</h3>
      </div>

      {/* Clip Info */}
      <div className="px-3 py-3 border-b border-studio-border bg-studio-panel-header/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-studio-accent/20 flex items-center justify-center text-studio-accent">
            <VideoIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-studio-text font-medium truncate">{selectedClip.name}</p>
            <p className="text-xs text-studio-text-muted">
              {formatTimecode(selectedClip.startFrame)} - {formatTimecode(selectedClip.startFrame + selectedClip.durationInFrames)}
            </p>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto studio-scrollbar">
        {/* Timing Section */}
        <InspectorSection title="Timing" icon={<VideoIcon />}>
          <PropertyRow label="Start">
            <NumberInput
              value={selectedClip.startFrame}
              onChange={(v) => onClipUpdate?.({ startFrame: v })}
              min={0}
              unit="f"
            />
          </PropertyRow>
          <PropertyRow label="Duration">
            <NumberInput
              value={selectedClip.durationInFrames}
              onChange={(v) => onClipUpdate?.({ durationInFrames: v })}
              min={1}
              unit="f"
            />
          </PropertyRow>
          <PropertyRow label="Speed">
            <NumberInput
              value={speed}
              onChange={setSpeed}
              min={0.1}
              max={4}
              step={0.1}
              unit="x"
            />
          </PropertyRow>
        </InspectorSection>

        {/* Transform Section */}
        <InspectorSection title="Transform" icon={<TransformIcon />}>
          <PropertyRow label="Position X">
            <NumberInput value={position.x} onChange={(v) => setPosition({ ...position, x: v })} unit="px" />
          </PropertyRow>
          <PropertyRow label="Position Y">
            <NumberInput value={position.y} onChange={(v) => setPosition({ ...position, y: v })} unit="px" />
          </PropertyRow>
          <PropertyRow label="Scale X">
            <SliderInput value={scale.x} onChange={(v) => setScale({ ...scale, x: v })} min={0} max={200} />
          </PropertyRow>
          <PropertyRow label="Scale Y">
            <SliderInput value={scale.y} onChange={(v) => setScale({ ...scale, y: v })} min={0} max={200} />
          </PropertyRow>
          <PropertyRow label="Rotation">
            <SliderInput value={rotation} onChange={setRotation} min={-180} max={180} />
          </PropertyRow>
        </InspectorSection>

        {/* Opacity Section */}
        <InspectorSection title="Appearance" icon={<ColorIcon />}>
          <PropertyRow label="Opacity">
            <SliderInput value={opacity} onChange={setOpacity} min={0} max={100} />
          </PropertyRow>
        </InspectorSection>

        {/* Audio Section */}
        {(selectedClip.type === "video" || selectedClip.type === "audio") && (
          <InspectorSection title="Audio" icon={<AudioIcon />}>
            <PropertyRow label="Volume">
              <SliderInput value={volume} onChange={setVolume} min={0} max={200} />
            </PropertyRow>
            <div className="mt-2 space-y-1">
              <label className="flex items-center gap-2 text-xs text-studio-text-muted cursor-pointer">
                <input type="checkbox" className="accent-studio-accent" />
                <span>Mute</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-studio-text-muted cursor-pointer">
                <input type="checkbox" className="accent-studio-accent" defaultChecked />
                <span>Normalize Audio</span>
              </label>
            </div>
          </InspectorSection>
        )}

        {/* Effects Section */}
        <InspectorSection title="Effects" icon={<EffectsIcon />} defaultExpanded={false}>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-studio-bg rounded text-xs">
              <span className="text-studio-text">Fade In</span>
              <span className="text-studio-text-muted">12f</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-studio-bg rounded text-xs">
              <span className="text-studio-text">Noise Gate</span>
              <span className="text-studio-text-muted">-40dB</span>
            </div>
            <button className="w-full py-1.5 text-xs text-studio-accent hover:bg-studio-accent/10 rounded transition-colors">
              + Add Effect
            </button>
          </div>
        </InspectorSection>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 border-t border-studio-border bg-studio-panel-header">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-2 py-1.5 text-xs text-studio-text-muted hover:text-studio-text bg-studio-bg hover:bg-studio-border rounded transition-colors">
            Reset
          </button>
          <button className="px-2 py-1.5 text-xs text-white bg-studio-accent hover:bg-studio-accent-hover rounded transition-colors">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
