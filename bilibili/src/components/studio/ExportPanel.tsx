"use client";

import React, { useState } from "react";
import { useExportStore, RenderFormat, RenderQuality } from "../../services/export-store";

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

const ExportIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v12" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m6.36 6.36l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m6.36-6.36l4.24-4.24" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
  </svg>
);

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const Section = ({ title, icon, defaultExpanded = true, children }: SectionProps) => {
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

interface SelectProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
}

const Select = ({ label, value, onChange, options }: SelectProps) => (
  <div className="space-y-1">
    <label className="text-xs text-studio-text-muted">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-sm bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:border-studio-accent"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface ProgressBarProps {
  progress: number;
  status: "pending" | "rendering" | "completed" | "failed";
}

const ProgressBar = ({ progress, status }: ProgressBarProps) => {
  const getColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "rendering":
        return "bg-studio-accent";
      default:
        return "bg-studio-border";
    }
  };

  return (
    <div className="w-full h-2 bg-studio-border rounded-full overflow-hidden">
      <div
        className={`h-full ${getColor()} transition-all duration-300`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatDuration = (start: Date, end?: Date): string => {
  const endTime = end || new Date();
  const durationMs = endTime.getTime() - start.getTime();
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export const ExportPanel = () => {
  const {
    renderConfig,
    currentJob,
    renderHistory,
    setRenderConfig,
    startRender,
    clearHistory,
    removeFromHistory,
  } = useExportStore();

  const [isRendering, setIsRendering] = useState(false);

  const resolutionPresets = [
    { value: "3840x2160", label: "4K (3840x2160)" },
    { value: "2560x1440", label: "2K (2560x1440)" },
    { value: "1920x1080", label: "1080p (1920x1080)" },
    { value: "1280x720", label: "720p (1280x720)" },
    { value: "854x480", label: "480p (854x480)" },
    { value: "custom", label: "Custom" },
  ];

  const fpsOptions = [
    { value: 24, label: "24 fps (Film)" },
    { value: 25, label: "25 fps (PAL)" },
    { value: 30, label: "30 fps (Standard)" },
    { value: 60, label: "60 fps (Smooth)" },
    { value: 120, label: "120 fps (High)" },
  ];

  const formatOptions: { value: RenderFormat; label: string }[] = [
    { value: "mp4", label: "MP4 (H.264)" },
    { value: "webm", label: "WebM (VP9)" },
    { value: "mov", label: "MOV (ProRes)" },
  ];

  const qualityOptions: { value: RenderQuality; label: string }[] = [
    { value: "low", label: "Low (Fast)" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "ultra", label: "Ultra (Slow)" },
  ];

  const handleStartRender = async () => {
    setIsRendering(true);
    try {
      await startRender(renderConfig);
      // Simulate render progress
      simulateRenderProgress();
    } catch (error) {
      console.error("Render failed:", error);
      setIsRendering(false);
    }
  };

  const simulateRenderProgress = () => {
    // This is a demo simulation - in production, this would poll the actual render API
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsRendering(false);
      }
      if (currentJob) {
        useExportStore.getState().updateJobProgress(currentJob.id, Math.min(progress, 100));
      }
    }, 500);
  };

  const currentResolution = `${renderConfig.width}x${renderConfig.height}`;
  const isCustomResolution = !resolutionPresets.some(
    (preset) => preset.value === currentResolution
  );

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-studio-panel-header border-b border-studio-border">
        <h3 className="text-studio-text font-medium text-sm">Export</h3>
        <ExportIcon />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto studio-scrollbar">
        {/* Render Configuration */}
        <Section title="Render Settings" icon={<SettingsIcon />}>
          <div className="space-y-3">
            <Select
              label="Resolution"
              value={isCustomResolution ? "custom" : currentResolution}
              onChange={(value) => {
                if (value !== "custom") {
                  const [width, height] = value.split("x").map(Number);
                  setRenderConfig({ width, height });
                }
              }}
              options={resolutionPresets}
            />

            {isCustomResolution && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-studio-text-muted">Width</label>
                  <input
                    type="number"
                    value={renderConfig.width}
                    onChange={(e) => setRenderConfig({ width: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:border-studio-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-studio-text-muted">Height</label>
                  <input
                    type="number"
                    value={renderConfig.height}
                    onChange={(e) => setRenderConfig({ height: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:border-studio-accent"
                  />
                </div>
              </div>
            )}

            <Select
              label="Frame Rate"
              value={renderConfig.fps}
              onChange={(value) => setRenderConfig({ fps: Number(value) })}
              options={fpsOptions}
            />

            <Select
              label="Format"
              value={renderConfig.format}
              onChange={(value) => setRenderConfig({ format: value as RenderFormat })}
              options={formatOptions}
            />

            <Select
              label="Quality"
              value={renderConfig.quality}
              onChange={(value) => setRenderConfig({ quality: value as RenderQuality })}
              options={qualityOptions}
            />
          </div>
        </Section>

        {/* Current Render Progress */}
        {currentJob && (
          <Section title="Rendering" icon={<ExportIcon />}>
            <div className="space-y-3">
              <div className="p-3 bg-studio-bg rounded border border-studio-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-studio-text font-medium">
                    {renderConfig.width}x{renderConfig.height} @ {renderConfig.fps}fps
                  </span>
                  <span className="text-xs text-studio-text-muted">
                    {currentJob.status === "rendering" ? `${Math.round(currentJob.progress)}%` : currentJob.status}
                  </span>
                </div>
                <ProgressBar progress={currentJob.progress} status={currentJob.status} />
                <div className="mt-2 text-xs text-studio-text-muted">
                  {currentJob.status === "rendering" && (
                    <span>Estimated time remaining: {Math.round((100 - currentJob.progress) / 10)}m</span>
                  )}
                  {currentJob.status === "pending" && <span>Initializing render...</span>}
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Render History */}
        <Section title="Render History" icon={<HistoryIcon />}>
          {renderHistory.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-studio-border/50 flex items-center justify-center">
                <HistoryIcon />
              </div>
              <p className="text-sm text-studio-text-muted">No renders yet</p>
              <p className="text-xs text-studio-text-muted mt-1">
                Start a render to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {renderHistory.map((job) => (
                <div
                  key={job.id}
                  className="p-3 bg-studio-bg rounded border border-studio-border hover:border-studio-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {job.status === "completed" && (
                          <span className="text-green-500">
                            <CheckIcon />
                          </span>
                        )}
                        {job.status === "failed" && (
                          <span className="text-red-500">
                            <XIcon />
                          </span>
                        )}
                        <span className="text-sm text-studio-text font-medium truncate">
                          {job.config.width}x{job.config.height} @ {job.config.fps}fps
                        </span>
                      </div>
                      <div className="text-xs text-studio-text-muted space-y-0.5">
                        <div>
                          {job.config.format.toUpperCase()} • {job.config.quality}
                        </div>
                        {job.outputSize && (
                          <div>Size: {formatFileSize(job.outputSize)}</div>
                        )}
                        <div>
                          Duration: {formatDuration(job.startedAt, job.completedAt)}
                        </div>
                        {job.error && (
                          <div className="text-red-500">Error: {job.error}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {job.status === "completed" && job.outputUrl && (
                        <button
                          onClick={() => window.open(job.outputUrl, "_blank")}
                          className="p-1.5 text-studio-accent hover:bg-studio-accent/10 rounded transition-colors"
                          title="Download"
                        >
                          <DownloadIcon />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromHistory(job.id)}
                        className="p-1.5 text-studio-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {renderHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="w-full py-1.5 text-xs text-studio-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                >
                  Clear All History
                </button>
              )}
            </div>
          )}
        </Section>
      </div>

      {/* Actions */}
      <div className="px-3 py-3 border-t border-studio-border bg-studio-panel-header">
        <button
          onClick={handleStartRender}
          disabled={isRendering || !!currentJob}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-studio-accent hover:bg-studio-accent-hover disabled:bg-studio-border disabled:text-studio-text-muted disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center gap-2"
        >
          <ExportIcon />
          {currentJob ? "Rendering..." : "Start Render"}
        </button>
        <div className="mt-2 text-xs text-center text-studio-text-muted">
          {renderConfig.width}x{renderConfig.height} • {renderConfig.fps}fps • {renderConfig.format.toUpperCase()}
        </div>
      </div>
    </div>
  );
};
