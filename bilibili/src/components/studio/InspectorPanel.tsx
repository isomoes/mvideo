"use client";

import React, { useEffect, useState } from "react";

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

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TextInput = ({ value, onChange }: TextInputProps) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-2 py-1 text-xs bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:border-studio-accent"
  />
);

interface SelectInputProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const SelectInput = ({ value, options, onChange }: SelectInputProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-2 py-1 text-xs bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:border-studio-accent"
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

type EffectParamType = "number" | "toggle" | "select" | "text" | "color";

interface ClipEffectParam {
  id: string;
  label: string;
  type: EffectParamType;
  value: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: string[];
}

interface ClipEffect {
  id: string;
  name: string;
  enabled: boolean;
  params: ClipEffectParam[];
}

const createDefaultEffects = (type?: "video" | "audio" | "image" | "text") => {
  if (!type) {
    return [] as ClipEffect[];
  }

  if (type === "audio") {
    return [
      {
        id: "noise-gate",
        name: "Noise Gate",
        enabled: true,
        params: [
          { id: "threshold", label: "Threshold", type: "number", value: -40, min: -80, max: 0, step: 1, unit: "dB" },
          { id: "attack", label: "Attack", type: "number", value: 6, min: 1, max: 50, step: 1, unit: "ms" },
        ],
      },
      {
        id: "compressor",
        name: "Compressor",
        enabled: false,
        params: [
          { id: "ratio", label: "Ratio", type: "select", value: "4:1", options: ["2:1", "4:1", "8:1"] },
          { id: "makeup", label: "Makeup Gain", type: "number", value: 3, min: 0, max: 12, step: 1, unit: "dB" },
        ],
      },
    ];
  }

  if (type === "text") {
    return [
      {
        id: "drop-shadow",
        name: "Drop Shadow",
        enabled: true,
        params: [
          { id: "opacity", label: "Opacity", type: "number", value: 60, min: 0, max: 100, step: 1, unit: "%" },
          { id: "blur", label: "Blur", type: "number", value: 12, min: 0, max: 48, step: 1, unit: "px" },
          { id: "color", label: "Color", type: "color", value: "#000000" },
        ],
      },
    ];
  }

  return [
    {
      id: "fade-in",
      name: "Fade In",
      enabled: true,
      params: [
        { id: "duration", label: "Duration", type: "number", value: 12, min: 1, max: 90, step: 1, unit: "f" },
        { id: "curve", label: "Curve", type: "select", value: "Ease Out", options: ["Linear", "Ease In", "Ease Out"] },
      ],
    },
    {
      id: "color-balance",
      name: "Color Balance",
      enabled: false,
      params: [
        { id: "temperature", label: "Temperature", type: "number", value: 12, min: -100, max: 100, step: 1, unit: "%" },
        { id: "saturation", label: "Saturation", type: "number", value: 105, min: 0, max: 200, step: 1, unit: "%" },
      ],
    },
  ];
};

interface SelectedClip {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "text";
  startFrame: number;
  durationInFrames: number;
  trimStartFrame?: number;
  trimEndFrame?: number;
  source?: string;
  effects?: ClipEffect[];
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
  const [effects, setEffects] = useState<ClipEffect[]>(() => createDefaultEffects(selectedClip?.type));

  const formatTimecode = (frame: number) => {
    const totalSeconds = Math.floor(frame / fps);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    const frames = (frame % fps).toString().padStart(2, "0");
    return `${minutes}:${seconds}:${frames}`;
  };

  useEffect(() => {
    if (!selectedClip) {
      setEffects([]);
      return;
    }

    setEffects(selectedClip.effects ?? createDefaultEffects(selectedClip.type));
  }, [selectedClip?.id, selectedClip?.type, selectedClip?.effects]);

  const trimStartFrame = selectedClip?.trimStartFrame ?? 0;
  const trimEndFrame = selectedClip?.trimEndFrame ?? selectedClip?.durationInFrames ?? 0;
  const trimmedDuration = Math.max(0, trimEndFrame - trimStartFrame);
  const sourceLabel = selectedClip?.source ?? selectedClip?.name ?? "";

  const updateEffectParam = (effectId: string, paramId: string, value: string | number | boolean) => {
    setEffects((prev) => {
      const next = prev.map((effect) => {
        if (effect.id !== effectId) {
          return effect;
        }

        return {
          ...effect,
          params: effect.params.map((param) =>
            param.id === paramId ? { ...param, value } : param,
          ),
        };
      });

      onClipUpdate?.({ effects: next });
      return next;
    });
  };

  const toggleEffect = (effectId: string) => {
    setEffects((prev) => {
      const next = prev.map((effect) =>
        effect.id === effectId ? { ...effect, enabled: !effect.enabled } : effect,
      );
      onClipUpdate?.({ effects: next });
      return next;
    });
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
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="rounded bg-studio-bg px-2 py-1">
            <p className="text-studio-text-muted">Duration</p>
            <p className="text-studio-text">
              {formatTimecode(selectedClip.durationInFrames)} ({selectedClip.durationInFrames}f)
            </p>
          </div>
          <div className="rounded bg-studio-bg px-2 py-1">
            <p className="text-studio-text-muted">Source</p>
            <p className="text-studio-text truncate" title={sourceLabel}>
              {sourceLabel}
            </p>
          </div>
          <div className="rounded bg-studio-bg px-2 py-1">
            <p className="text-studio-text-muted">Effects</p>
            <p className="text-studio-text">
              {effects.length === 0 ? "None" : `${effects.length} effect${effects.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="rounded bg-studio-bg px-2 py-1">
            <p className="text-studio-text-muted">Trimmed</p>
            <p className="text-studio-text">
              {formatTimecode(trimmedDuration)} ({trimmedDuration}f)
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
          <PropertyRow label="Trim In">
            <div className="flex items-center gap-2">
              <NumberInput
                value={trimStartFrame}
                onChange={(v) => onClipUpdate?.({ trimStartFrame: Math.max(0, v) })}
                min={0}
                max={Math.max(0, selectedClip.durationInFrames - 1)}
                unit="f"
              />
              <span className="text-xs text-studio-text-muted shrink-0">
                {formatTimecode(trimStartFrame)}
              </span>
            </div>
          </PropertyRow>
          <PropertyRow label="Trim Out">
            <div className="flex items-center gap-2">
              <NumberInput
                value={trimEndFrame}
                onChange={(v) => onClipUpdate?.({ trimEndFrame: Math.max(trimStartFrame + 1, v) })}
                min={trimStartFrame + 1}
                max={Math.max(trimStartFrame + 1, selectedClip.durationInFrames)}
                unit="f"
              />
              <span className="text-xs text-studio-text-muted shrink-0">
                {formatTimecode(trimEndFrame)}
              </span>
            </div>
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
          <div className="space-y-3">
            {effects.length === 0 && (
              <p className="text-xs text-studio-text-muted">No effects applied.</p>
            )}
            {effects.map((effect) => {
              const disabled = !effect.enabled;
              return (
                <div key={effect.id} className="rounded border border-studio-border bg-studio-panel-header/30">
                  <div className="flex items-center justify-between px-2 py-2">
                    <span className="text-xs text-studio-text font-medium">{effect.name}</span>
                    <label className="flex items-center gap-2 text-xs text-studio-text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={effect.enabled}
                        onChange={() => toggleEffect(effect.id)}
                        className="accent-studio-accent"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                  <div className={`px-2 pb-2 space-y-2 ${disabled ? "opacity-60" : ""}`}>
                    {effect.params.map((param) => (
                      <PropertyRow key={param.id} label={param.label}>
                        {param.type === "number" && (
                          <NumberInput
                            value={Number(param.value)}
                            onChange={(v) => updateEffectParam(effect.id, param.id, v)}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            unit={param.unit}
                          />
                        )}
                        {param.type === "toggle" && (
                          <label className="flex items-center gap-2 text-xs text-studio-text-muted cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(param.value)}
                              onChange={(e) => updateEffectParam(effect.id, param.id, e.target.checked)}
                              className="accent-studio-accent"
                              disabled={disabled}
                            />
                            <span>{Boolean(param.value) ? "On" : "Off"}</span>
                          </label>
                        )}
                        {param.type === "select" && (
                          <SelectInput
                            value={String(param.value)}
                            options={param.options ?? []}
                            onChange={(value) => updateEffectParam(effect.id, param.id, value)}
                          />
                        )}
                        {param.type === "text" && (
                          <TextInput
                            value={String(param.value)}
                            onChange={(value) => updateEffectParam(effect.id, param.id, value)}
                          />
                        )}
                        {param.type === "color" && (
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={String(param.value)}
                              onChange={(e) => updateEffectParam(effect.id, param.id, e.target.value)}
                              className="h-6 w-8 border border-studio-border rounded"
                            />
                            <span className="text-xs text-studio-text-muted">{String(param.value)}</span>
                          </div>
                        )}
                      </PropertyRow>
                    ))}
                  </div>
                </div>
              );
            })}
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
