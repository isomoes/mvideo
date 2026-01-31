"use client";

import React, { useState, useCallback, useRef } from "react";
import { Clip as ClipModel, Asset } from "../../../../types/models";
import { Waveform } from "./Waveform";

interface ClipProps {
  clip: ClipModel;
  asset?: Asset;
  pixelsPerFrame: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (newStart: number) => void;
  onTrim: (newStart: number, newDuration: number) => void;
  color?: string;
  label?: string;
  snapEnabled?: boolean;
  snapPoints?: number[];
  isAudio?: boolean;
}

export const Clip: React.FC<ClipProps> = ({
  clip,
  asset,
  pixelsPerFrame,
  isSelected,
  onSelect,
  onMove,
  onTrim,
  color = "bg-sky-500",
  label,
  snapEnabled = true,
  snapPoints = [],
  isAudio = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimmingStart, setIsTrimmingStart] = useState(false);
  const [isTrimmingEnd, setIsTrimmingEnd] = useState(false);
  const startXRef = useRef(0);
  const startFrameRef = useRef(0);
  const startDurationRef = useRef(0);

  const getSnappedFrame = (frame: number, threshold = 10) => {
    if (!snapEnabled) return frame;
    
    let snappedFrame = frame;
    let minDelta = threshold / pixelsPerFrame;

    for (const point of snapPoints) {
      const delta = Math.abs(frame - point);
      if (delta < minDelta) {
        minDelta = delta;
        snappedFrame = point;
      }
    }

    return snappedFrame;
  };

  const handlePointerDown = useCallback((e: React.PointerEvent, type: "move" | "trim-start" | "trim-end") => {
    e.stopPropagation();
    onSelect();
    
    startXRef.current = e.clientX;
    startFrameRef.current = clip.startFrame;
    startDurationRef.current = clip.durationInFrames;

    if (type === "move") setIsDragging(true);
    else if (type === "trim-start") setIsTrimmingStart(true);
    else if (type === "trim-end") setIsTrimmingEnd(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      const deltaFrames = Math.round(deltaX / pixelsPerFrame);

      if (type === "move") {
        const newStart = getSnappedFrame(Math.max(0, startFrameRef.current + deltaFrames));
        onMove(newStart);
      } else if (type === "trim-start") {
        const newStart = getSnappedFrame(Math.max(0, startFrameRef.current + deltaFrames));
        const newDuration = Math.max(1, startDurationRef.current - (newStart - startFrameRef.current));
        if (newDuration > 1) {
          onTrim(newStart, newDuration);
        }
      } else if (type === "trim-end") {
        const newEnd = getSnappedFrame(startFrameRef.current + startDurationRef.current + deltaFrames);
        const newDuration = Math.max(1, newEnd - startFrameRef.current);
        onTrim(startFrameRef.current, newDuration);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsTrimmingStart(false);
      setIsTrimmingEnd(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [clip, pixelsPerFrame, onSelect, onMove, onTrim, snapEnabled, snapPoints]);

  const thumbnailUrl = asset?.kind === "video"
    ? `/api/assets/${asset.id}/thumbnails/0`
    : asset?.kind === "image"
      ? asset.src
      : undefined;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded cursor-pointer transition-shadow select-none overflow-hidden ${color} ${
        isSelected ? "ring-2 ring-white shadow-lg z-10" : "hover:brightness-110"
      } ${isDragging ? "opacity-80 cursor-grabbing" : ""}`}
      style={{
        left: clip.startFrame * pixelsPerFrame,
        width: Math.max(clip.durationInFrames * pixelsPerFrame, 4),
      }}
      onPointerDown={(e) => handlePointerDown(e, "move")}
    >
      {thumbnailUrl && (
        <div className="absolute inset-0">
          <img
            src={thumbnailUrl}
            alt={asset?.name ?? clip.id}
            className="h-full w-full object-cover opacity-70"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}
      {isAudio && (
        <Waveform
          assetId={asset?.id ?? clip.assetId}
          durationInFrames={clip.durationInFrames}
          pixelsPerFrame={pixelsPerFrame}
        />
      )}
      <div className="flex items-center h-full px-2 overflow-hidden pointer-events-none relative z-10">
        <span className="text-[11px] text-white font-medium truncate drop-shadow">
          {label || clip.id}
        </span>
      </div>
      
      {/* Trim handles */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-l z-20"
        onPointerDown={(e) => handlePointerDown(e, "trim-start")}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-r z-20"
        onPointerDown={(e) => handlePointerDown(e, "trim-end")}
      />
    </div>
  );
};
