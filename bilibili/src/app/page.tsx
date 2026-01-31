"use client";

import { type PlayerRef } from "@remotion/player";
import type { NextPage } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  defaultMyCompProps,
  MyCompProps,
} from "../../types/constants";
import {
  StudioLayout,
  StudioToolbar,
  PreviewPlayer,
  ResourcesPanel,
  InspectorPanel,
  ExportPanel,
  TimelinePanel,
  KeymapModal,
  ExtensionsPanel,
} from "../components/studio";
import { useStudioKeyboardShortcuts } from "../hooks/useStudioKeyboardShortcuts";
import { useUIStore } from "../services/ui-store";
import { useProjectStore } from "../services/project-store";
import { compositionPreviewConfig } from "../remotion/preview-config";

const clampFrame = (frame: number, totalFrames: number) =>
  Math.min(Math.max(frame, 0), totalFrames - 1);

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
  const { project, updateClip, updateProject, loadProject, saveProject, listProjects } = useProjectStore();
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isProjectReady, setIsProjectReady] = useState(false);

  const playerRef = useRef<PlayerRef>(null);

  const inputProps: z.infer<typeof MyCompProps> = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialProject = async () => {
      try {
        const lastProjectId = globalThis.localStorage?.getItem("mvideo:lastProjectId");
        if (lastProjectId) {
          await loadProject(lastProjectId);
          return;
        }

        const projects = await listProjects();
        if (projects.length > 0) {
          await loadProject(projects[0].id);
        }
      } catch (error) {
        console.error("Failed to load project", error);
      } finally {
        if (!cancelled) {
          setIsProjectReady(true);
        }
      }
    };

    void loadInitialProject();

    return () => {
      cancelled = true;
    };
  }, [listProjects, loadProject]);

  useEffect(() => {
    if (project.durationInFrames !== totalFrames || project.fps !== compositionPreviewConfig.fps || project.width !== compositionPreviewConfig.width || project.height !== compositionPreviewConfig.height) {
      updateProject({
        durationInFrames: totalFrames,
        fps: compositionPreviewConfig.fps,
        width: compositionPreviewConfig.width,
        height: compositionPreviewConfig.height,
      });
    }
  }, [compositionPreviewConfig.fps, compositionPreviewConfig.height, compositionPreviewConfig.width, project.durationInFrames, project.fps, project.height, project.width, totalFrames, updateProject]);

  useEffect(() => {
    if (!isProjectReady) {
      return;
    }

    const handle = window.setTimeout(() => {
      void saveProject(project).then((saved) => {
        globalThis.localStorage?.setItem("mvideo:lastProjectId", saved.id);
      }).catch((error) => {
        console.error("Failed to save project", error);
      });
    }, 800);

    return () => {
      window.clearTimeout(handle);
    };
  }, [isProjectReady, project, saveProject]);

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

  const selectedClip = useMemo(() => {
    if (!selectedClipId || !selectedTrackId) {
      return null;
    }

    const track = project.tracks.find((value) => value.id === selectedTrackId);
    const clip = track?.clips.find((value) => value.id === selectedClipId);
    if (!clip || !track) {
      return null;
    }

    const asset = project.assets.find((value) => value.id === clip.assetId);
    const resolvedType = asset?.kind
      ? asset.kind
      : track.kind === "overlay"
        ? "image"
        : track.kind === "audio"
          ? "audio"
          : "video";

    return {
      id: clip.id,
      name: asset?.name ?? clip.id,
      type: resolvedType,
      startFrame: clip.startFrame,
      durationInFrames: clip.durationInFrames,
      source: asset?.name ?? track.name,
      trimStartFrame: clip.trimStartFrame ?? 0,
      trimEndFrame: clip.durationInFrames,
    };
  }, [project.assets, project.tracks, selectedClipId, selectedTrackId]);

  const handleClipSelect = useCallback((clipId: string, trackId: string) => {
    setSelectedClipId(clipId);
    setSelectedTrackId(trackId);
  }, []);

  const handleInspectorClipUpdate = useCallback(
    (
      updates: Partial<{
        startFrame: number;
        durationInFrames: number;
        trimStartFrame: number;
        trimEndFrame: number;
      }>,
    ) => {
      if (!selectedClipId || !selectedTrackId) {
        return;
      }

      const track = project.tracks.find((value) => value.id === selectedTrackId);
      const clip = track?.clips.find((value) => value.id === selectedClipId);
      if (!clip) {
        return;
      }

      const nextTrimStart = updates.trimStartFrame ?? clip.trimStartFrame ?? 0;
      let nextDuration = updates.durationInFrames ?? clip.durationInFrames;

      if (updates.trimEndFrame !== undefined) {
        nextDuration = Math.max(1, updates.trimEndFrame - nextTrimStart);
      }

      const partial: Partial<typeof clip> = {};
      if (updates.startFrame !== undefined) {
        partial.startFrame = Math.max(0, updates.startFrame);
      }
      if (updates.durationInFrames !== undefined || updates.trimEndFrame !== undefined) {
        partial.durationInFrames = nextDuration;
      }
      if (updates.trimStartFrame !== undefined) {
        partial.trimStartFrame = Math.max(0, nextTrimStart);
      }

      if (Object.keys(partial).length > 0) {
        updateClip(selectedClipId, partial);
      }
    },
    [project.tracks, selectedClipId, selectedTrackId, updateClip],
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
            projectId={project.id}
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
            onClipUpdate={handleInspectorClipUpdate}
          />
        }
        exportPanel={<ExportPanel />}
        extensionsPanel={<ExtensionsPanel />}
        timelinePanel={
          <TimelinePanel
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
