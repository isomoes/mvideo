"use client";

import React, { useMemo } from "react";

interface RulerProps {
  totalFrames: number;
  fps: number;
  pixelsPerFrame: number;
  headerWidth: number;
  onSeek: (frame: number) => void;
}

export const Ruler: React.FC<RulerProps> = ({
  totalFrames,
  fps,
  pixelsPerFrame,
  headerWidth,
  onSeek,
}) => {
  const formatTimecode = (frame: number, fps: number) => {
    const totalSeconds = frame / fps;
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toFixed(1).padStart(4, "0");
    return `${minutes}:${seconds}`;
  };

  const markers = useMemo(() => {
    const interval = Math.max(1, Math.floor(fps * (100 / (pixelsPerFrame * 50)))); // Adjust interval based on zoom
    const result: number[] = [];
    for (let i = 0; i <= totalFrames; i += interval) {
      result.push(i);
    }
    return result;
  }, [totalFrames, fps, pixelsPerFrame]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.max(0, Math.min(Math.round(x / pixelsPerFrame), totalFrames - 1));
    onSeek(frame);
  };

  return (
    <div
      className="sticky top-0 z-20 flex bg-studio-panel-header border-b border-studio-border select-none"
      style={{ height: 28 }}
    >
      <div
        className="shrink-0 bg-studio-panel-header border-r border-studio-border"
        style={{ width: headerWidth }}
      />
      <div
        className="relative flex-1 cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        {markers.map((frame) => (
          <div
            key={frame}
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: frame * pixelsPerFrame }}
          >
            <span className="text-[10px] text-studio-text-muted px-1">
              {formatTimecode(frame, fps)}
            </span>
            <div className="flex-1 w-px bg-studio-border" />
          </div>
        ))}
      </div>
    </div>
  );
};
