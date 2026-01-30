"use client";

import { Player, type PlayerRef } from "@remotion/player";
import type { NextPage } from "next";
import type { PointerEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  defaultMyCompProps,
  CompositionProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { RenderControls } from "../components/RenderControls";
import { Main } from "../remotion/MyComp/Main";
import { Toolbar } from "../components/Toolbar";
import { StudioLayout } from "../components/StudioLayout";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const clampFrame = (frame: number, totalFrames: number) =>
  Math.min(Math.max(frame, 0), totalFrames - 1);

const formatTimecode = (frame: number, fps: number) => {
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const frames = (frame % fps).toString().padStart(2, "0");
  return `${minutes}:${seconds}:${frames}`;
};

const Home: NextPage = () => {
  const [text, setText] = useState<string>(defaultMyCompProps.title);
  const totalFrames = DURATION_IN_FRAMES;
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [rippleEnabled, setRippleEnabled] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const playerRef = useRef<PlayerRef>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const timelineTracks = [
    {
      id: "video",
      label: "Video",
      clips: [
        {
          id: "intro",
          label: "Intro Comp",
          start: 0,
          duration: Math.max(12, Math.floor(totalFrames * 0.1)),
          tone: "bg-amber-400/80",
        },
        {
          id: "main",
          label: "OBS Trim",
          start: Math.max(12, Math.floor(totalFrames * 0.1)),
          duration: Math.max(1, Math.floor(totalFrames * 0.8)),
          tone: "bg-sky-500/80",
        },
        {
          id: "outro",
          label: "Outro Comp",
          start: Math.max(12, Math.floor(totalFrames * 0.9)),
          duration: Math.max(12, Math.floor(totalFrames * 0.1)),
          tone: "bg-emerald-400/80",
        },
      ],
    },
    {
      id: "audio",
      label: "Audio",
      clips: [
        {
          id: "normalized",
          label: "Normalized Track",
          start: Math.max(12, Math.floor(totalFrames * 0.1)),
          duration: Math.max(1, Math.floor(totalFrames * 0.8)),
          tone: "bg-indigo-400/80",
        },
      ],
    },
    {
      id: "overlay",
      label: "Overlays",
      clips: [
        {
          id: "title",
          label: "Title Card",
          start: Math.max(10, Math.floor(totalFrames * 0.08)),
          duration: Math.max(8, Math.floor(totalFrames * 0.18)),
          tone: "bg-fuchsia-400/70",
        },
        {
          id: "cta",
          label: "Subscribe CTA",
          start: Math.max(1, Math.floor(totalFrames * 0.7)),
          duration: Math.max(8, Math.floor(totalFrames * 0.2)),
          tone: "bg-rose-400/70",
        },
      ],
    },
    {
      id: "subtitles",
      label: "Subtitles",
      clips: [
        {
          id: "srt",
          label: "Auto SRT",
          start: Math.max(12, Math.floor(totalFrames * 0.1)),
          duration: Math.max(1, Math.floor(totalFrames * 0.8)),
          tone: "bg-slate-400/70",
        },
      ],
    },
  ];

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
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
    [totalFrames]
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      playerRef.current?.pause();
      return;
    }
    playerRef.current?.play();
  }, [isPlaying]);

  const handleStep = useCallback(
    (delta: number) => {
      seekToFrame(currentFrame + delta);
    },
    [currentFrame, seekToFrame]
  );

  useKeyboardShortcuts({
    onPlayPause: handleTogglePlay,
    onStepForward: () => handleStep(1),
    onStepBackward: () => handleStep(-1),
    onStepForwardLarge: () => handleStep(5),
    onStepBackwardLarge: () => handleStep(-5),
    onPause: () => playerRef.current?.pause(),
  });

  const handleTimelinePointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const percent = Math.min(
        Math.max((event.clientX - rect.left) / rect.width, 0),
        1
      );
      const frame = Math.round(percent * (totalFrames - 1));
      seekToFrame(frame);
    },
    [seekToFrame, totalFrames]
  );

  const renderPanelContent = (panelId: string) => {
    switch (panelId) {
      case "assets":
        return (
          <>
            <p className="text-xs text-subtitle">
              Imported recordings and derived media.
            </p>
            <div className="mt-5 space-y-4 text-xs">
              <div className="rounded-2xl border border-unfocused-border-color bg-background px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-subtitle">
                  Source
                </p>
                <p className="mt-2 text-sm font-semibold">OBS_2026-01-25.mp4</p>
                <p className="mt-1 text-[11px] text-subtitle">17:02, 1080p</p>
              </div>
              <div className="rounded-2xl border border-unfocused-border-color bg-background px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-subtitle">
                  Derived
                </p>
                <ul className="mt-2 space-y-2 text-xs text-foreground">
                  <li>Trimmed master</li>
                  <li>Audio normalized</li>
                  <li>Preview proxy</li>
                  <li>Waveform + thumbnails</li>
                </ul>
              </div>
            </div>
          </>
        );
      case "preview":
        return (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                  {VIDEO_WIDTH}x{VIDEO_HEIGHT}
                </span>
                <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                  {VIDEO_FPS} fps
                </span>
                <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                  {totalFrames} frames
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                  {formatTimecode(currentFrame, VIDEO_FPS)}
                </span>
                <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                  Frame {currentFrame}
                </span>
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-unfocused-border-color shadow-[0_0_120px_rgba(15,23,42,0.12)]">
              <Player
                ref={playerRef}
                component={Main}
                inputProps={inputProps}
                durationInFrames={DURATION_IN_FRAMES}
                fps={VIDEO_FPS}
                compositionHeight={VIDEO_HEIGHT}
                compositionWidth={VIDEO_WIDTH}
                style={{
                  width: "100%",
                }}
                controls={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onFrameChange={(frame) => setCurrentFrame(frame)}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full border border-unfocused-border-color px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
                  onClick={() => handleStep(-10)}
                >
                  -10f
                </button>
                <button
                  className="rounded-full border border-unfocused-border-color px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
                  onClick={() => handleStep(10)}
                >
                  +10f
                </button>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <input
                  className="h-2 w-full"
                  type="range"
                  min={0}
                  max={totalFrames - 1}
                  step={1}
                  value={currentFrame}
                  onChange={(event) => seekToFrame(Number(event.target.value))}
                />
                <input
                  className="w-20 rounded-full border border-unfocused-border-color px-3 py-1 text-center text-[11px]"
                  type="number"
                  min={0}
                  max={totalFrames - 1}
                  value={currentFrame}
                  onChange={(event) => seekToFrame(Number(event.target.value))}
                />
              </div>
            </div>
          </>
        );
      case "timeline":
        return (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-subtitle">
                  Trim + Arrange
                </p>
                <h2 className="text-lg font-semibold text-foreground">
                  Timeline
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                  Snap: {snapEnabled ? "On" : "Off"}
                </span>
                <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                  Ripple: {rippleEnabled ? "On" : "Off"}
                </span>
                <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                  Zoom: {zoom}%
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-unfocused-border-color bg-background px-4 py-4">
              <div className="flex items-center justify-between text-[11px] text-subtitle">
                {[0, 20, 40, 60, 80, 100].map((marker) => (
                  <span key={marker}>{marker}%</span>
                ))}
              </div>
              <div
                ref={timelineRef}
                className="relative mt-3 space-y-4"
                onPointerDown={(event) => {
                  setIsScrubbing(true);
                  handleTimelinePointer(event);
                }}
                onPointerMove={(event) => {
                  if (isScrubbing) {
                    handleTimelinePointer(event);
                  }
                }}
                onPointerUp={() => setIsScrubbing(false)}
                onPointerLeave={() => setIsScrubbing(false)}
              >
                <div
                  className="absolute top-0 h-full w-[2px] bg-foreground/70"
                  style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
                ></div>
                {timelineTracks.map((track) => (
                  <div
                    key={track.id}
                    className="grid grid-cols-[90px_1fr] items-center gap-4"
                  >
                    <div className="text-xs font-semibold text-foreground">
                      {track.label}
                    </div>
                    <div className="relative h-10 rounded-xl border border-unfocused-border-color bg-background/80">
                      {track.clips.map((clip) => (
                        <div
                          key={clip.id}
                          className={`absolute top-1/2 h-7 -translate-y-1/2 rounded-lg px-3 py-1 text-[11px] font-semibold text-foreground shadow-sm ${clip.tone}`}
                          style={{
                            left: `${(clip.start / totalFrames) * 100}%`,
                            width: `${(clip.duration / totalFrames) * 100}%`,
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{clip.label}</span>
                            <span className="text-[10px] text-foreground/70">
                              {clip.duration}f
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-subtitle">
                <span>Drag clips to reorder</span>
                <span>Trim handles on hover</span>
                <span>Auto-snap to playhead</span>
              </div>
            </div>
          </>
        );
      case "inspector":
        return (
          <>
            <p className="text-xs text-subtitle">Clip metadata and effects.</p>
            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl border border-unfocused-border-color bg-background px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-subtitle">
                  Selected
                </p>
                <p className="mt-2 text-sm font-semibold">OBS Trim</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-subtitle">
                  <span>In: 00:00:05</span>
                  <span>Out: 00:06:42</span>
                  <span>Gain: -3 LUFS</span>
                  <span>Speed: 1.0x</span>
                </div>
              </div>
              <div className="rounded-2xl border border-unfocused-border-color bg-background px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-subtitle">
                  Effects
                </p>
                <ul className="mt-2 space-y-2">
                  <li>Intro fade (12f)</li>
                  <li>Noise gate</li>
                  <li>Lower third overlay</li>
                </ul>
              </div>
            </div>
          </>
        );
      case "export":
        return (
          <>
            <p className="text-xs text-subtitle">Configure render output.</p>
            <div className="mt-4">
              <RenderControls
                text={text}
                setText={setText}
                inputProps={inputProps}
              />
            </div>
          </>
        );
      case "extensions":
        return (
          <>
            <p className="text-xs text-subtitle">
              Plugin panels registered for this project.
            </p>
            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl border border-unfocused-border-color bg-background px-3 py-3">
                <p className="text-sm font-semibold">Audio to SRT</p>
                <p className="mt-1 text-[11px] text-subtitle">
                  Generate subtitles from normalized audio.
                </p>
                <button className="mt-3 rounded-full border border-unfocused-border-color px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
                  Generate
                </button>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.24),_transparent_55%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_45%,_#f8fafc_100%)] text-foreground">
      <div className="mx-auto max-w-screen-2xl px-6 pb-10 pt-8 h-screen flex flex-col">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between shrink-0">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-subtitle">
              Bilibili Studio
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              OBS Editorial Pipeline
            </h1>
            <p className="max-w-2xl text-sm text-subtitle">
              Preview, trim, and enrich your recording before handing off to
              Remotion render.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-unfocused-border-color bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Import OBS
            </button>
            <button className="rounded-full border border-unfocused-border-color bg-foreground px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background">
              New Project
            </button>
          </div>
        </header>

        <div className="mt-8 shrink-0">
          <Toolbar
            isPlaying={isPlaying}
            snapEnabled={snapEnabled}
            rippleEnabled={rippleEnabled}
            zoom={zoom}
            onTogglePlay={handleTogglePlay}
            onStep={handleStep}
            onToggleSnap={() => setSnapEnabled((prev) => !prev)}
            onToggleRipple={() => setRippleEnabled((prev) => !prev)}
            onZoomChange={setZoom}
          />
        </div>

        <div className="mt-8 flex-1 min-h-0">
          <StudioLayout renderPanelContent={renderPanelContent} />
        </div>
      </div>
    </div>
  );
};

export default Home;
