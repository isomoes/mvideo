"use client";

import React, { useState } from "react";

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (config: {
    name: string;
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
  }) => void;
}

const presets = [
  { name: "HD 720p 30fps", width: 1280, height: 720, fps: 30 },
  { name: "Full HD 1080p 30fps", width: 1920, height: 1080, fps: 30 },
  { name: "Full HD 1080p 60fps", width: 1920, height: 1080, fps: 60 },
  { name: "4K UHD 30fps", width: 3840, height: 2160, fps: 30 },
  { name: "4K UHD 60fps", width: 3840, height: 2160, fps: 60 },
  { name: "Vertical 9:16 30fps", width: 1080, height: 1920, fps: 30 },
  { name: "Square 1:1 30fps", width: 1080, height: 1080, fps: 30 },
];

export const NewProjectModal = ({ isOpen, onClose, onCreateProject }: NewProjectModalProps) => {
  const [projectName, setProjectName] = useState("");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [fps, setFps] = useState(30);
  const [durationSeconds, setDurationSeconds] = useState(60);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationInFrames = Math.round(durationSeconds * fps);
    onCreateProject({
      name: projectName || "Untitled Project",
      width,
      height,
      fps,
      durationInFrames,
    });
    // Reset form
    setProjectName("");
    setWidth(1280);
    setHeight(720);
    setFps(30);
    setDurationSeconds(60);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setFps(preset.fps);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-studio-panel-bg border border-studio-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border">
          <h2 className="text-lg font-semibold text-studio-text">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-studio-text-muted hover:text-studio-text transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-studio-text mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Untitled Project"
              className="w-full px-3 py-2 bg-studio-bg border border-studio-border rounded text-studio-text placeholder-studio-text-muted focus:outline-none focus:ring-2 focus:ring-studio-accent"
            />
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-studio-text mb-2">
              Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 text-sm bg-studio-bg border border-studio-border rounded text-studio-text hover:bg-studio-border transition-colors text-left"
                >
                  {preset.name}
                  <div className="text-xs text-studio-text-muted mt-0.5">
                    {preset.width}×{preset.height} @ {preset.fps}fps
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Video Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-studio-text mb-2">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 1280)}
                min="1"
                max="7680"
                className="w-full px-3 py-2 bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:ring-2 focus:ring-studio-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-studio-text mb-2">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 720)}
                min="1"
                max="4320"
                className="w-full px-3 py-2 bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:ring-2 focus:ring-studio-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-studio-text mb-2">
                Frame Rate (fps)
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:ring-2 focus:ring-studio-accent"
              >
                <option value="24">24 fps (Film)</option>
                <option value="25">25 fps (PAL)</option>
                <option value="30">30 fps (NTSC)</option>
                <option value="60">60 fps (High Frame Rate)</option>
                <option value="120">120 fps (Slow Motion)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-studio-text mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 60)}
                min="1"
                max="3600"
                className="w-full px-3 py-2 bg-studio-bg border border-studio-border rounded text-studio-text focus:outline-none focus:ring-2 focus:ring-studio-accent"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-studio-bg border border-studio-border rounded">
            <div className="text-sm text-studio-text-muted space-y-1">
              <div>Resolution: <span className="text-studio-text">{width} × {height}</span></div>
              <div>Frame Rate: <span className="text-studio-text">{fps} fps</span></div>
              <div>Duration: <span className="text-studio-text">{durationSeconds}s ({Math.round(durationSeconds * fps)} frames)</span></div>
              <div>Aspect Ratio: <span className="text-studio-text">{(width / height).toFixed(2)}:1</span></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-studio-text hover:bg-studio-border rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-studio-accent text-white rounded hover:bg-studio-accent-hover transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
