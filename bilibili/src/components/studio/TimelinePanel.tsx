"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

// Icon components
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

const PlusIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

interface Clip {
  id: string;
  label: string;
  start: number;
  duration: number;
  color: string;
}

interface Track {
  id: string;
  label: string;
  type: "video" | "audio" | "overlay" | "subtitle";
  clips: Clip[];
  muted?: boolean;
  locked?: boolean;
  visible?: boolean;
}

interface TimelinePanelProps {
  tracks: Track[];
  currentFrame: number;
  totalFrames: number;
  fps: number;
  zoom: number;
  snapEnabled: boolean;
  onSeek: (frame: number) => void;
  onClipSelect?: (clipId: string, trackId: string) => void;
  onClipMove?: (clipId: string, trackId: string, newStart: number) => void;
  onTrackMute?: (trackId: string) => void;
  onTrackLock?: (trackId: string) => void;
  onTrackVisibility?: (trackId: string) => void;
}

const formatTimecode = (frame: number, fps: number) => {
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const TRACK_HEIGHT = 48;
const TRACK_HEADER_WIDTH = 160;

export const TimelinePanel = ({
  tracks,
  currentFrame,
  totalFrames,
  fps,
  zoom,
  snapEnabled,
  onSeek,
  onClipSelect,
  onClipMove,
  onTrackMute,
  onTrackLock,
  onTrackVisibility,
}: TimelinePanelProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [selectedClip, setSelectedClip] = useState<{ clipId: string; trackId: string } | null>(null);

  // Calculate timeline width based on zoom
  const pixelsPerFrame = (zoom / 100) * 2;
  const timelineWidth = totalFrames * pixelsPerFrame;

  // Generate time markers
  const markerInterval = Math.max(1, Math.floor(fps * (100 / zoom))); // Adjust interval based on zoom
  const markers: number[] = [];
  for (let i = 0; i <= totalFrames; i += markerInterval) {
    markers.push(i);
  }

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const scrollLeft = timelineRef.current.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft - TRACK_HEADER_WIDTH;
      const frame = Math.max(0, Math.min(Math.round(x / pixelsPerFrame), totalFrames - 1));
      onSeek(frame);
    },
    [pixelsPerFrame, totalFrames, onSeek]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsScrubbing(true);
      handleTimelineClick(e as unknown as React.MouseEvent<HTMLDivElement>);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [handleTimelineClick]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isScrubbing) {
        handleTimelineClick(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    },
    [isScrubbing, handleTimelineClick]
  );

  const handlePointerUp = useCallback(() => {
    setIsScrubbing(false);
  }, []);

  const handleClipClick = (clipId: string, trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClip({ clipId, trackId });
    onClipSelect?.(clipId, trackId);
  };

  // Auto-scroll to keep playhead visible
  useEffect(() => {
    if (!timelineRef.current || isScrubbing) return;
    const playheadX = currentFrame * pixelsPerFrame + TRACK_HEADER_WIDTH;
    const scrollLeft = timelineRef.current.scrollLeft;
    const viewWidth = timelineRef.current.clientWidth;

    if (playheadX < scrollLeft + TRACK_HEADER_WIDTH + 50) {
      timelineRef.current.scrollLeft = Math.max(0, playheadX - TRACK_HEADER_WIDTH - 50);
    } else if (playheadX > scrollLeft + viewWidth - 50) {
      timelineRef.current.scrollLeft = playheadX - viewWidth + 50;
    }
  }, [currentFrame, pixelsPerFrame, isScrubbing]);

  const getTrackColor = (type: Track["type"]) => {
    switch (type) {
      case "video":
        return "bg-sky-500";
      case "audio":
        return "bg-emerald-500";
      case "overlay":
        return "bg-purple-500";
      case "subtitle":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-studio-panel-header border-b border-studio-border shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-studio-text font-medium text-sm">Timeline</h3>
          <div className="flex items-center gap-2 text-xs text-studio-text-muted">
            <span>{tracks.length} tracks</span>
            <span className="text-studio-border">|</span>
            <span>{formatTimecode(totalFrames, fps)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs rounded ${snapEnabled ? "bg-studio-accent text-white" : "bg-studio-border text-studio-text-muted"}`}>
            Snap
          </span>
          <span className="text-xs text-studio-text-muted">Zoom: {zoom}%</span>
        </div>
      </div>

      {/* Timeline Content */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-auto studio-scrollbar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="relative" style={{ width: timelineWidth + TRACK_HEADER_WIDTH, minHeight: "100%" }}>
          {/* Time Ruler */}
          <div
            className="sticky top-0 z-20 flex bg-studio-panel-header border-b border-studio-border"
            style={{ height: 28 }}
          >
            {/* Empty space for track headers */}
            <div
              className="shrink-0 bg-studio-panel-header border-r border-studio-border"
              style={{ width: TRACK_HEADER_WIDTH }}
            />
            {/* Time markers */}
            <div className="relative flex-1">
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

          {/* Tracks */}
          <div className="relative">
            {tracks.map((track, trackIndex) => (
              <div
                key={track.id}
                className="flex border-b border-studio-border"
                style={{ height: TRACK_HEIGHT }}
              >
                {/* Track Header */}
                <div
                  className="sticky left-0 z-10 shrink-0 flex items-center gap-2 px-2 bg-studio-panel-bg border-r border-studio-border"
                  style={{ width: TRACK_HEADER_WIDTH }}
                >
                  <div className={`w-1 h-6 rounded ${getTrackColor(track.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-studio-text font-medium truncate">{track.label}</p>
                    <p className="text-[10px] text-studio-text-muted capitalize">{track.type}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      className={`p-1 rounded transition-colors ${
                        track.muted ? "text-studio-playhead" : "text-studio-text-muted hover:text-studio-text"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackMute?.(track.id);
                      }}
                      title={track.muted ? "Unmute" : "Mute"}
                    >
                      {track.muted ? <MuteIcon /> : <VolumeIcon />}
                    </button>
                    <button
                      className={`p-1 rounded transition-colors ${
                        track.visible === false ? "text-studio-text-muted" : "text-studio-text-muted hover:text-studio-text"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackVisibility?.(track.id);
                      }}
                      title={track.visible === false ? "Show" : "Hide"}
                    >
                      {track.visible === false ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                    <button
                      className={`p-1 rounded transition-colors ${
                        track.locked ? "text-studio-warning" : "text-studio-text-muted hover:text-studio-text"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackLock?.(track.id);
                      }}
                      title={track.locked ? "Unlock" : "Lock"}
                    >
                      {track.locked ? <LockIcon /> : <UnlockIcon />}
                    </button>
                  </div>
                </div>

                {/* Track Content */}
                <div
                  className="relative flex-1 bg-studio-track-bg"
                  style={{ width: timelineWidth }}
                >
                  {/* Clips */}
                  {track.clips.map((clip) => {
                    const isSelected = selectedClip?.clipId === clip.id && selectedClip?.trackId === track.id;
                    return (
                      <div
                        key={clip.id}
                        className={`absolute top-1 bottom-1 rounded cursor-pointer transition-shadow ${clip.color} ${
                          isSelected ? "ring-2 ring-white shadow-lg" : "hover:brightness-110"
                        }`}
                        style={{
                          left: clip.start * pixelsPerFrame,
                          width: Math.max(clip.duration * pixelsPerFrame, 4),
                        }}
                        onClick={(e) => handleClipClick(clip.id, track.id, e)}
                      >
                        <div className="flex items-center h-full px-2 overflow-hidden">
                          <span className="text-[11px] text-white font-medium truncate drop-shadow">
                            {clip.label}
                          </span>
                        </div>
                        {/* Trim handles */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/30 rounded-l" />
                        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/30 rounded-r" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Add Track Button */}
            <div
              className="flex items-center border-b border-studio-border"
              style={{ height: 32 }}
            >
              <button
                className="sticky left-0 flex items-center gap-2 px-3 py-1 text-xs text-studio-text-muted hover:text-studio-text bg-studio-panel-bg border-r border-studio-border transition-colors"
                style={{ width: TRACK_HEADER_WIDTH }}
              >
                <PlusIcon />
                <span>Add Track</span>
              </button>
            </div>
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-studio-playhead z-30 pointer-events-none"
            style={{ left: currentFrame * pixelsPerFrame + TRACK_HEADER_WIDTH }}
          >
            {/* Playhead handle */}
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-3 h-4 bg-studio-playhead" style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)" }} />
          </div>
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-studio-panel-header border-t border-studio-border shrink-0">
        <div className="flex items-center gap-3 text-xs text-studio-text-muted">
          <span>Frame: {currentFrame}</span>
          <span className="text-studio-border">|</span>
          <span>{formatTimecode(currentFrame, fps)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-studio-text-muted">
          <span>Drag clips to reorder</span>
          <span className="text-studio-border">|</span>
          <span>Trim handles on edges</span>
        </div>
      </div>
    </div>
  );
};
