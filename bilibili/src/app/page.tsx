"use client";

import { type PlayerRef } from "@remotion/player";
import type { NextPage } from "next";
import { useCallback, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  defaultMyCompProps,
  MyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} from "../../types/constants";
import {
  StudioLayout,
  StudioToolbar,
  PreviewPlayer,
  ResourcesPanel,
  InspectorPanel,
  TimelinePanel,
  KeymapModal,
} from "../components/studio";
import { useStudioKeyboardShortcuts } from "../hooks/useStudioKeyboardShortcuts";
import { useUIStore } from "../services/ui-store";
import { compositionPreviewConfig } from "../remotion/preview-config";

const clampFrame = (frame: number, totalFrames: number) =>
  Math.min(Math.max(frame, 0), totalFrames - 1);

// Demo timeline tracks
const createDemoTracks = (totalFrames: number) => [
  {
    id: "video",
    label: "Video 1",
    type: "video" as const,
    clips: [
      {
        id: "intro",
        label: "Intro Comp",
        start: 0,
        duration: Math.max(12, Math.floor(totalFrames * 0.1)),
        color: "bg-amber-500",
      },
      {
        id: "main",
        label: "OBS Recording",
        start: Math.max(12, Math.floor(totalFrames * 0.1)),
        duration: Math.max(1, Math.floor(totalFrames * 0.8)),
        color: "bg-sky-500",
      },
      {
        id: "outro",
        label: "Outro Comp",
        start: Math.max(12, Math.floor(totalFrames * 0.9)),
        duration: Math.max(12, Math.floor(totalFrames * 0.1)),
        color: "bg-emerald-500",
      },
    ],
  },
  {
    id: "audio",
    label: "Audio 1",
    type: "audio" as const,
    clips: [
      {
        id: "normalized",
        label: "Normalized Audio",
        start: Math.max(12, Math.floor(totalFrames * 0.1)),
        duration: Math.max(1, Math.floor(totalFrames * 0.8)),
        color: "bg-emerald-600",
      },
    ],
  },
  {
    id: "overlay",
    label: "Overlays",
    type: "overlay" as const,
    clips: [
      {
        id: "title",
        label: "Title Card",
        start: Math.max(10, Math.floor(totalFrames * 0.08)),
        duration: Math.max(8, Math.floor(totalFrames * 0.18)),
        color: "bg-purple-500",
      },
      {
        id: "cta",
        label: "Subscribe CTA",
        start: Math.max(1, Math.floor(totalFrames * 0.7)),
        duration: Math.max(8, Math.floor(totalFrames * 0.2)),
        color: "bg-rose-500",
      },
    ],
  },
  {
    id: "subtitles",
    label: "Subtitles",
    type: "subtitle" as const,
    clips: [
      {
        id: "srt",
        label: "Auto SRT",
        start: Math.max(12, Math.floor(totalFrames * 0.1)),
        duration: Math.max(1, Math.floor(totalFrames * 0.8)),
        color: "bg-amber-600",
      },
    ],
  },
];

const Home: NextPage = () => {
  const [text] = useState<string>(defaultMyCompProps.title);
  const totalFrames = compositionPreviewConfig.durationInFrames;
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [rippleEnabled, setRippleEnabled] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<"select" | "razor" | "hand">(
    "select",
  );
  const { toggleKeymaps } = useUIStore();
  const [selectedClip, setSelectedClip] = useState<{
    id: string;
    name: string;
    type: "video" | "audio" | "image" | "text";
    startFrame: number;
    durationInFrames: number;
    source?: string;
    trimStartFrame?: number;
    trimEndFrame?: number;
  } | null>(null);

  const playerRef = useRef<PlayerRef>(null);

  const timelineTracks = useMemo(
    () => createDemoTracks(totalFrames),
    [totalFrames],
  );

  const inputProps: z.infer<typeof MyCompProps> = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  const seekToFrame = useCallback(
    (frame: number) => {
      const nextFrame = clampFrame(frame, totalFrames);
      setCurrentFrame(nextFrame);
      playerRef.current?.seekTo(nextFrame);
    },
    [totalFrames],
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
  }, [isPlaying]);

  const handleStep = useCallback(
    (delta: number) => {
      seekToFrame(currentFrame + delta);
    },
    [currentFrame, seekToFrame],
  );

  const handleSkipToStart = useCallback(() => {
    seekToFrame(0);
  }, [seekToFrame]);

  const handleSkipToEnd = useCallback(() => {
    seekToFrame(totalFrames - 1);
  }, [seekToFrame, totalFrames]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 25));
  }, []);

  const handleUndo = useCallback(() => {
    console.log("Undo");
  }, []);

  const handleRedo = useCallback(() => {
    console.log("Redo");
  }, []);

  const handleClipSelect = useCallback(
    (clipId: string, trackId: string) => {
      // Find the clip in tracks
      const track = timelineTracks.find((t) => t.id === trackId);
      const clip = track?.clips.find((c) => c.id === clipId);
      if (clip && track) {
        setSelectedClip({
          id: clip.id,
          name: clip.label,
          type:
            track.type === "subtitle"
              ? "text"
              : track.type === "overlay"
                ? "image"
                : track.type,
          startFrame: clip.start,
          durationInFrames: clip.duration,
          source: track.label,
          trimStartFrame: 0,
          trimEndFrame: clip.duration,
        });
      }
    },
    [timelineTracks],
  );

  // Keyboard shortcuts
  useStudioKeyboardShortcuts({
    onPlayPause: handleTogglePlay,
    onStepForward: () => handleStep(1),
    onStepBackward: () => handleStep(-1),
    onStepForwardLarge: () => handleStep(5),
    onStepBackwardLarge: () => handleStep(-5),
    onPause: () => playerRef.current?.pause(),
    onSkipToStart: handleSkipToStart,
    onSkipToEnd: handleSkipToEnd,
    onSelectTool: () => setActiveTool("select"),
    onRazorTool: () => setActiveTool("razor"),
    onHandTool: () => setActiveTool("hand"),
    onToggleSnap: () => setSnapEnabled((prev) => !prev),
    onToggleRipple: () => setRippleEnabled((prev) => !prev),
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onToggleKeymaps: toggleKeymaps,
  });

  return (
    <>
      <StudioLayout
        toolbar={
          <StudioToolbar
            isPlaying={isPlaying}
            snapEnabled={snapEnabled}
            rippleEnabled={rippleEnabled}
            zoom={zoom}
            currentFrame={currentFrame}
            totalFrames={totalFrames}
            fps={compositionPreviewConfig.fps}
            activeTool={activeTool}
            onTogglePlay={handleTogglePlay}
            onStepBackward={() => handleStep(-1)}
            onStepForward={() => handleStep(1)}
            onSkipToStart={handleSkipToStart}
            onSkipToEnd={handleSkipToEnd}
            onToggleSnap={() => setSnapEnabled((prev) => !prev)}
            onToggleRipple={() => setRippleEnabled((prev) => !prev)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onToolChange={setActiveTool}
          />
        }
        resourcesPanel={
          <ResourcesPanel
            onAssetSelect={(asset) => console.log("Asset selected:", asset)}
            onAssetDragStart={(asset) => console.log("Dragging asset:", asset)}
          />
        }
        previewPanel={
          <PreviewPlayer
            component={compositionPreviewConfig.component}
            inputProps={inputProps}
            durationInFrames={compositionPreviewConfig.durationInFrames}
            fps={compositionPreviewConfig.fps}
            width={compositionPreviewConfig.width}
            height={compositionPreviewConfig.height}
            currentFrame={currentFrame}
            isPlaying={isPlaying}
            onFrameChange={setCurrentFrame}
            onPlayingChange={setIsPlaying}
            playerRef={playerRef}
          />
        }
        inspectorPanel={
          <InspectorPanel
            selectedClip={selectedClip}
            fps={compositionPreviewConfig.fps}
            onClipUpdate={(updates) => {
              if (selectedClip) {
                setSelectedClip({ ...selectedClip, ...updates });
              }
            }}
          />
        }
        timelinePanel={
          <TimelinePanel
            tracks={timelineTracks}
            currentFrame={currentFrame}
            totalFrames={totalFrames}
            fps={compositionPreviewConfig.fps}
            zoom={zoom}
            snapEnabled={snapEnabled}
            onSeek={seekToFrame}
            onClipSelect={handleClipSelect}
            onZoomChange={setZoom}
          />
        }
      />
      <KeymapModal />
    </>
  );
};

export default Home;
