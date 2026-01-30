"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
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
import { Spacing } from "../components/Spacing";
import { Tips } from "../components/Tips";
import { Main } from "../remotion/MyComp/Main";

const Home: NextPage = () => {
  const [text, setText] = useState<string>(defaultMyCompProps.title);
  const totalFrames = DURATION_IN_FRAMES;
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.24),_transparent_55%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_45%,_#f8fafc_100%)] text-foreground">
      <div className="mx-auto max-w-screen-2xl px-6 pb-10 pt-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-2">
            <div className="rounded-3xl border border-unfocused-border-color bg-background/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <h2 className="text-sm font-semibold text-foreground">Assets</h2>
              <p className="mt-1 text-xs text-subtitle">
                Imported recordings and derived media.
              </p>
              <div className="mt-5 space-y-4 text-xs">
                <div className="rounded-2xl border border-unfocused-border-color bg-background px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-subtitle">
                    Source
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    OBS_2026-01-25.mp4
                  </p>
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
            </div>
          </aside>

          <main className="lg:col-span-7">
            <div className="rounded-[32px] border border-unfocused-border-color bg-background/90 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-subtitle">
                    Preview
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">
                    Remotion Player
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
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
              </div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-unfocused-border-color shadow-[0_0_120px_rgba(15,23,42,0.12)]">
                <Player
                  component={Main}
                  inputProps={inputProps}
                  durationInFrames={DURATION_IN_FRAMES}
                  fps={VIDEO_FPS}
                  compositionHeight={VIDEO_HEIGHT}
                  compositionWidth={VIDEO_WIDTH}
                  style={{
                    width: "100%",
                  }}
                  controls
                />
              </div>
            </div>

            <div className="mt-6 rounded-[32px] border border-unfocused-border-color bg-background/90 p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-subtitle">
                    Timeline
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">
                    Trim + Arrange
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                    Snap: On
                  </span>
                  <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                    Ripple: Off
                  </span>
                  <span className="rounded-full border border-unfocused-border-color px-3 py-1">
                    Zoom: 100%
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-unfocused-border-color bg-background px-4 py-4">
                <div className="flex items-center justify-between text-[11px] text-subtitle">
                  {[0, 20, 40, 60, 80, 100].map((marker) => (
                    <span key={marker}>{marker}%</span>
                  ))}
                </div>
                <div className="relative mt-3 space-y-4">
                  <div className="absolute left-[42%] top-0 h-full w-[2px] bg-foreground/70"></div>
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
                  <span>Auto-snapping to playhead</span>
                </div>
              </div>
            </div>
          </main>

          <aside className="lg:col-span-3">
            <div className="space-y-6">
              <div className="rounded-3xl border border-unfocused-border-color bg-background/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <h2 className="text-sm font-semibold text-foreground">
                  Inspector
                </h2>
                <p className="mt-1 text-xs text-subtitle">
                  Clip metadata and effects.
                </p>
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
              </div>

              <div className="rounded-3xl border border-unfocused-border-color bg-background/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <h2 className="text-sm font-semibold text-foreground">
                  Export
                </h2>
                <p className="mt-1 text-xs text-subtitle">
                  Configure render output.
                </p>
                <div className="mt-4">
                  <RenderControls
                    text={text}
                    setText={setText}
                    inputProps={inputProps}
                  ></RenderControls>
                </div>
              </div>

              <div className="rounded-3xl border border-unfocused-border-color bg-background/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <h2 className="text-sm font-semibold text-foreground">
                  Extensions
                </h2>
                <p className="mt-1 text-xs text-subtitle">
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
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;
