"use client";

import React from "react";
import { Track as TrackModel, Clip as ClipModel, Asset } from "../../../../types/models";
import { Clip } from "./Clip";

interface TrackProps {
  track: TrackModel;
  assetsById: Map<string, Asset>;
  pixelsPerFrame: number;
  headerWidth: number;
  trackHeight: number;
  selectedClipId: string | null;
  snapEnabled?: boolean;
  snapPoints?: number[];
  onClipSelect: (clipId: string) => void;
  onClipMove: (clipId: string, newStart: number) => void;
  onClipTrim: (clipId: string, newStart: number, newDuration: number) => void;
  onTrackMute?: (trackId: string) => void;
  onTrackLock?: (trackId: string) => void;
  onTrackVisibility?: (trackId: string) => void;
}

const LockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UnlockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const MuteIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export const Track: React.FC<TrackProps> = ({
  track,
  assetsById,
  pixelsPerFrame,
  headerWidth,
  trackHeight,
  selectedClipId,
  snapEnabled,
  snapPoints,
  onClipSelect,
  onClipMove,
  onClipTrim,
  onTrackMute,
  onTrackLock,
  onTrackVisibility,
}) => {
  const getTrackColor = (kind: TrackModel["kind"]) => {
    switch (kind) {
      case "video": return "bg-sky-500";
      case "audio": return "bg-emerald-500";
      case "overlay": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div
      className="flex border-b border-studio-border"
      style={{ height: trackHeight }}
    >
      {/* Track Header */}
      <div
        className="sticky left-0 z-10 shrink-0 flex items-center gap-2 px-2 bg-studio-panel-bg border-r border-studio-border"
        style={{ width: headerWidth }}
      >
        <div className={`w-1 h-6 rounded ${getTrackColor(track.kind)}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-studio-text font-medium truncate">{track.name}</p>
          <p className="text-[10px] text-studio-text-muted capitalize">{track.kind}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            className={`p-1 rounded transition-colors ${
              track.muted ? "text-studio-playhead" : "text-studio-text-muted hover:text-studio-text"
            }`}
            onClick={() => onTrackMute?.(track.id)}
          >
            {track.muted ? <MuteIcon /> : <VolumeIcon />}
          </button>
          <button
            className="p-1 rounded text-studio-text-muted hover:text-studio-text"
            onClick={() => onTrackVisibility?.(track.id)}
          >
            <EyeIcon />
          </button>
          <button
            className={`p-1 rounded transition-colors ${
              track.locked ? "text-studio-warning" : "text-studio-text-muted hover:text-studio-text"
            }`}
            onClick={() => onTrackLock?.(track.id)}
          >
            {track.locked ? <LockIcon /> : <UnlockIcon />}
          </button>
        </div>
      </div>

      {/* Track Content */}
      <div className="relative flex-1 bg-studio-track-bg overflow-hidden">
        {track.clips.map((clip) => (
          <Clip
            key={clip.id}
            clip={clip}
            asset={assetsById.get(clip.assetId)}
            pixelsPerFrame={pixelsPerFrame}
            isSelected={selectedClipId === clip.id}
            snapEnabled={snapEnabled}
            snapPoints={snapPoints}
            isAudio={track.kind === "audio"}
            onSelect={() => onClipSelect(clip.id)}
            onMove={(newStart) => onClipMove(clip.id, newStart)}
            onTrim={(newStart, newDuration) => onClipTrim(clip.id, newStart, newDuration)}
            color={getTrackColor(track.kind)}
            label={assetsById.get(clip.assetId)?.name ?? clip.id}
          />
        ))}
      </div>
    </div>
  );
};
