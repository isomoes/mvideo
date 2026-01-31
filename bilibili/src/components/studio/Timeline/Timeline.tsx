"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Track as TrackModel, Project, Asset } from "../../../../types/models";
import { Ruler } from "./Ruler";
import { Track } from "./Track";
import { Playhead } from "./Playhead";

interface TimelineProps {
  project: Project;
  currentFrame: number;
  zoom: number;
  snapEnabled: boolean;
  onSeek: (frame: number) => void;
  onUpdateClip: (clipId: string, partial: any) => void;
  onSelectClip: (clipId: string, trackId: string) => void;
  onAssetDrop?: (event: React.DragEvent) => void;
  onZoomChange?: (zoom: number) => void;
  onZoomBoundsChange?: (bounds: { min: number; max: number }) => void;
}

const TRACK_HEIGHT = 48;
const TRACK_HEADER_WIDTH = 160;

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentFrame,
  zoom,
  snapEnabled,
  onSeek,
  onUpdateClip,
  onSelectClip,
  onAssetDrop,
  onZoomChange,
  onZoomBoundsChange,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const assetsById = useMemo(() => {
    return new Map<string, Asset>(project.assets.map((asset) => [asset.id, asset]));
  }, [project.assets]);

  // Calculate timeline width based on zoom
  // zoom 100% = 2 pixels per frame
  const durationInFrames = project.durationInFrames ?? 1200;
  const availableWidth = Math.max(0, viewportWidth - TRACK_HEADER_WIDTH);
  const fitZoom = durationInFrames > 0 && availableWidth > 0
    ? (availableWidth / durationInFrames) * 50
    : zoom;
  const minZoom = Math.max(0.1, Math.min(10, fitZoom));
  const maxZoom = Math.max(400, Math.ceil(fitZoom * 8));
  const pixelsPerFrame = (zoom / 100) * 2;
  const timelineWidth = durationInFrames * pixelsPerFrame;
  const zoomLabel = Number.isInteger(zoom) ? `${zoom}` : zoom.toFixed(1);

  const snapPoints = useMemo(() => {
    if (!snapEnabled) return [];
    const points = new Set<number>();
    points.add(0);
    points.add(project.durationInFrames ?? 1200);
    points.add(currentFrame);

    project.tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        points.add(clip.startFrame);
        points.add(clip.startFrame + clip.durationInFrames);
      });
    });

    return Array.from(points);
  }, [project, currentFrame, snapEnabled]);

  const handleClipSelect = (clipId: string, trackId: string) => {
    setSelectedClipId(clipId);
    onSelectClip(clipId, trackId);
  };

  const handleClipMove = (clipId: string, newStart: number) => {
    onUpdateClip(clipId, { startFrame: newStart });
  };

  const handleClipTrim = (
    clipId: string,
    newStart: number,
    newDuration: number,
    newTrimStart?: number,
  ) => {
    onUpdateClip(clipId, {
      startFrame: newStart,
      durationInFrames: newDuration,
      trimStartFrame: newTrimStart,
    });
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      onAssetDrop?.(event);
    },
    [onAssetDrop]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!onZoomChange) {
        return;
      }

      if (event.shiftKey) {
        event.preventDefault();
        if (timelineRef.current) {
          timelineRef.current.scrollLeft += event.deltaY + event.deltaX;
        }
        return;
      }

      event.preventDefault();
      const step = event.deltaY > 0 ? -10 : 10;
      const nextZoom = Math.min(maxZoom, Math.max(minZoom, zoom + step));

      if (nextZoom !== zoom) {
        onZoomChange(nextZoom);
      }
    },
    [maxZoom, minZoom, onZoomChange, zoom]
  );

  useEffect(() => {
    const element = timelineRef.current;
    if (!element) return;

    const updateWidth = () => {
      setViewportWidth(element.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(element);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    onZoomBoundsChange?.({ min: minZoom, max: maxZoom });
  }, [minZoom, maxZoom, onZoomBoundsChange]);

  useEffect(() => {
    if (!onZoomChange) return;
    if (zoom < minZoom) {
      onZoomChange(minZoom);
      return;
    }
    if (zoom > maxZoom) {
      onZoomChange(maxZoom);
    }
  }, [zoom, minZoom, maxZoom, onZoomChange]);

  // Auto-scroll to keep playhead visible
  useEffect(() => {
    if (!timelineRef.current) return;
    const playheadX = currentFrame * pixelsPerFrame + TRACK_HEADER_WIDTH;
    const scrollLeft = timelineRef.current.scrollLeft;
    const viewWidth = timelineRef.current.clientWidth;

    if (playheadX < scrollLeft + TRACK_HEADER_WIDTH + 50) {
      timelineRef.current.scrollLeft = Math.max(
        0,
        playheadX - TRACK_HEADER_WIDTH - 50,
      );
    } else if (playheadX > scrollLeft + viewWidth - 50) {
      timelineRef.current.scrollLeft = playheadX - viewWidth + 50;
    }
  }, [currentFrame, pixelsPerFrame]);

  return (
    <div className="flex flex-col h-full bg-studio-panel-bg">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-studio-panel-header border-b border-studio-border shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-studio-text font-medium text-sm">Timeline</h3>
          <div className="flex items-center gap-2 text-xs text-studio-text-muted">
            <span>{project.tracks.length} tracks</span>
            <span className="text-studio-border">|</span>
            <span>{project.durationInFrames} frames</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold ${snapEnabled ? "bg-studio-accent text-white" : "bg-studio-border text-studio-text-muted"}`}
            >
              Snap
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-studio-text-muted">Zoom</span>
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={minZoom < 1 ? 0.1 : 1}
              value={zoom}
              onChange={(e) => onZoomChange?.(parseFloat(e.target.value))}
              className="w-24 h-1 bg-studio-border rounded-lg appearance-none cursor-pointer accent-studio-accent"
            />
            <span className="text-[10px] text-studio-text-muted w-8">
              {zoomLabel}%
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-auto studio-scrollbar relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onWheel={handleWheel}
      >
        <div
          className="relative"
          style={{
            width: timelineWidth + TRACK_HEADER_WIDTH,
            minHeight: "100%",
          }}
        >
          <Ruler
            totalFrames={project.durationInFrames ?? 1200}
            fps={project.fps}
            pixelsPerFrame={pixelsPerFrame}
            headerWidth={TRACK_HEADER_WIDTH}
            onSeek={onSeek}
          />

          <div className="relative">
            {project.tracks.map((track) => (
              <Track
                key={track.id}
                track={track}
                assetsById={assetsById}
                pixelsPerFrame={pixelsPerFrame}
                headerWidth={TRACK_HEADER_WIDTH}
                trackHeight={TRACK_HEIGHT}
                selectedClipId={selectedClipId}
                snapEnabled={snapEnabled}
                snapPoints={snapPoints}
                onClipSelect={(clipId) => handleClipSelect(clipId, track.id)}
                onClipMove={handleClipMove}
                onClipTrim={handleClipTrim}
              />
            ))}
          </div>

          <Playhead
            currentFrame={currentFrame}
            pixelsPerFrame={pixelsPerFrame}
            headerWidth={TRACK_HEADER_WIDTH}
          />
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-studio-panel-header border-t border-studio-border shrink-0">
          <div className="flex items-center gap-3 text-xs text-studio-text-muted">
            <span>{project.tracks.length} tracks</span>
            <span className="text-studio-border">|</span>
            <span>{project.durationInFrames ?? 1200} frames</span>
          </div>
        <div className="flex items-center gap-2 text-xs text-studio-text-muted">
          <span>Drag clips to move • Use handles to trim</span>
        </div>
      </div>
    </div>
  );
};
