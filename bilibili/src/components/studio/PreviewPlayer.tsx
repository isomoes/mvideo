"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import {
  Player,
  type PlayerRef,
  type CallbackListener,
} from "@remotion/player";

interface PreviewPlayerProps {
  component: React.ComponentType<any>;
  inputProps: Record<string, any>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  currentFrame: number;
  // isPlaying is managed internally via player events
  onFrameChange: (frame: number) => void;
  onPlayingChange: (playing: boolean) => void;
  playerRef: React.RefObject<PlayerRef | null>;
}

/**
 * PlayerOnly component - Renders only the Remotion Player
 * This component is isolated to prevent unnecessary re-renders
 * Following Remotion best practices: https://www.remotion.dev/docs/player/best-practices
 */
const PlayerOnly: React.FC<{
  playerRef: React.RefObject<PlayerRef | null>;
  component: React.ComponentType<any>;
  inputProps: Record<string, any>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  onFrameChange: (frame: number) => void;
  onPlayingChange: (playing: boolean) => void;
}> = ({
  playerRef,
  component,
  inputProps,
  durationInFrames,
  fps,
  width,
  height,
  onFrameChange,
  onPlayingChange,
}) => {
  // Set up event listeners for the player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay: CallbackListener<"play"> = () => {
      onPlayingChange(true);
    };

    const onPause: CallbackListener<"pause"> = () => {
      onPlayingChange(false);
    };

    const onFrameUpdate: CallbackListener<"frameupdate"> = (e) => {
      onFrameChange(e.detail.frame);
    };

    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("frameupdate", onFrameUpdate);

    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("frameupdate", onFrameUpdate);
    };
  }, [playerRef, onFrameChange, onPlayingChange]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="relative overflow-hidden rounded shadow-2xl"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: `${width}/${height}`,
        }}
      >
        <Player
          ref={playerRef}
          component={component}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          fps={fps}
          compositionHeight={height}
          compositionWidth={width}
          style={{
            width: "100%",
            height: "100%",
          }}
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          logLevel="trace"
        />
      </div>
    </div>
  );
};

/**
 * ControlsOnly component - Renders player controls and UI
 * This component can re-render frequently without affecting the Player
 * Following Remotion best practices to separate controls from Player
 */
const ControlsOnly: React.FC<{
  playerRef: React.RefObject<PlayerRef | null>;
  currentFrame: number;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  onFrameChange: (frame: number) => void;
}> = ({
  playerRef,
  currentFrame,
  durationInFrames,
  fps,
  width,
  height,
  onFrameChange,
}) => {
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [inPoint, setInPoint] = useState<number | null>(null);
  const [outPoint, setOutPoint] = useState<number | null>(null);

  const handleScrub = useCallback(
    (clientX: number) => {
      if (!scrubberRef.current || !playerRef.current) return;
      const rect = scrubberRef.current.getBoundingClientRect();
      const percent = Math.min(
        Math.max((clientX - rect.left) / rect.width, 0),
        1,
      );
      const frame = Math.round(percent * (durationInFrames - 1));

      // Seek first, then update state to avoid conflicts
      playerRef.current.seekTo(frame);
      onFrameChange(frame);
    },
    [durationInFrames, onFrameChange, playerRef],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsScrubbing(true);
      handleScrub(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [handleScrub],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isScrubbing) {
        handleScrub(e.clientX);
      }
    },
    [isScrubbing, handleScrub],
  );

  const handlePointerUp = useCallback(() => {
    setIsScrubbing(false);
  }, []);

  const setMarkIn = useCallback(() => {
    setInPoint(currentFrame);
  }, [currentFrame]);

  const setMarkOut = useCallback(() => {
    setOutPoint(currentFrame);
  }, [currentFrame]);

  const clearMarks = useCallback(() => {
    setInPoint(null);
    setOutPoint(null);
  }, []);

  const progressPercent = (currentFrame / (durationInFrames - 1)) * 100;
  const inPercent =
    inPoint !== null ? (inPoint / (durationInFrames - 1)) * 100 : null;
  const outPercent =
    outPoint !== null ? (outPoint / (durationInFrames - 1)) * 100 : null;

  return (
    <>
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-studio-panel-header border-b border-studio-border">
        <div className="flex items-center gap-3">
          <h3 className="text-studio-text font-medium text-sm">Preview</h3>
          <div className="flex items-center gap-2 text-xs text-studio-text-muted">
            <span>
              {width}x{height}
            </span>
            <span className="text-studio-border">|</span>
            <span>{fps} fps</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 text-xs text-studio-text-muted hover:text-studio-text hover:bg-studio-border rounded transition-colors"
            onClick={setMarkIn}
            title="Set In Point (I)"
          >
            Mark In
          </button>
          <button
            className="px-2 py-1 text-xs text-studio-text-muted hover:text-studio-text hover:bg-studio-border rounded transition-colors"
            onClick={setMarkOut}
            title="Set Out Point (O)"
          >
            Mark Out
          </button>
          {(inPoint !== null || outPoint !== null) && (
            <button
              className="px-2 py-1 text-xs text-studio-playhead hover:bg-studio-border rounded transition-colors"
              onClick={clearMarks}
              title="Clear Marks"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Scrubber / Mini Timeline */}
      <div className="px-4 py-3 bg-studio-panel-bg border-t border-studio-border">
        {/* Timecode Display */}
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-mono text-studio-text">
              {formatTimecode(currentFrame, fps)}
            </span>
            {inPoint !== null && (
              <span className="text-studio-accent">
                In: {formatTimecode(inPoint, fps)}
              </span>
            )}
            {outPoint !== null && (
              <span className="text-studio-warning">
                Out: {formatTimecode(outPoint, fps)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-studio-text-muted">
            <span>Frame {currentFrame}</span>
            <span>/</span>
            <span>{durationInFrames}</span>
          </div>
        </div>

        {/* Scrubber Bar */}
        <div
          ref={scrubberRef}
          className="relative h-6 bg-studio-bg rounded cursor-pointer group"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* In/Out Range */}
          {inPercent !== null && outPercent !== null && (
            <div
              className="absolute top-0 h-full bg-studio-accent/20"
              style={{
                left: `${inPercent}%`,
                width: `${outPercent - inPercent}%`,
              }}
            />
          )}

          {/* In Point Marker */}
          {inPercent !== null && (
            <div
              className="absolute top-0 w-0.5 h-full bg-studio-accent"
              style={{ left: `${inPercent}%` }}
            />
          )}

          {/* Out Point Marker */}
          {outPercent !== null && (
            <div
              className="absolute top-0 w-0.5 h-full bg-studio-warning"
              style={{ left: `${outPercent}%` }}
            />
          )}

          {/* Progress Bar */}
          <div
            className="absolute top-0 h-full bg-studio-accent/30 rounded-l"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 w-0.5 h-full bg-studio-playhead transition-none"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-studio-playhead rounded-full shadow" />
          </div>

          {/* Hover indicator */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-studio-text/5" />
          </div>
        </div>

        {/* Frame Step Buttons */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            className="px-2 py-1 text-xs text-studio-text-muted hover:text-studio-text hover:bg-studio-border rounded transition-colors"
            onClick={() => {
              if (!playerRef.current) return;
              const newFrame = Math.max(0, currentFrame - 10);
              playerRef.current.seekTo(newFrame);
              onFrameChange(newFrame);
            }}
          >
            -10f
          </button>
          <button
            className="px-2 py-1 text-xs text-studio-text-muted hover:text-studio-text hover:bg-studio-border rounded transition-colors"
            onClick={() => {
              if (!playerRef.current) return;
              const newFrame = Math.max(0, currentFrame - 1);
              playerRef.current.seekTo(newFrame);
              onFrameChange(newFrame);
            }}
          >
            -1f
          </button>
          <button
            className="px-2 py-1 text-xs text-studio-text-muted hover:text-studio-text hover:bg-studio-border rounded transition-colors"
            onClick={() => {
              if (!playerRef.current) return;
              const newFrame = Math.min(durationInFrames - 1, currentFrame + 1);
              playerRef.current.seekTo(newFrame);
              onFrameChange(newFrame);
            }}
          >
            +1f
          </button>
          <button
            className="px-2 py-1 text-xs text-studio-text-muted hover:text-studio-text hover:bg-studio-border rounded transition-colors"
            onClick={() => {
              if (!playerRef.current) return;
              const newFrame = Math.min(
                durationInFrames - 1,
                currentFrame + 10,
              );
              playerRef.current.seekTo(newFrame);
              onFrameChange(newFrame);
            }}
          >
            +10f
          </button>
        </div>
      </div>
    </>
  );
};

const formatTimecode = (frame: number, fps: number) => {
  const totalSeconds = Math.floor(frame / fps);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const frames = (frame % fps).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}:${frames}`;
};

/**
 * PreviewPlayer component - Following Remotion best practices
 * Separates Player rendering from controls to prevent unnecessary re-renders
 * @see https://www.remotion.dev/docs/player/best-practices
 */
export const PreviewPlayer = ({
  component,
  inputProps,
  durationInFrames,
  fps,
  width,
  height,
  currentFrame,
  onFrameChange,
  onPlayingChange,
  playerRef,
}: PreviewPlayerProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Controls component handles all UI that updates frequently */}
      <ControlsOnly
        playerRef={playerRef}
        currentFrame={currentFrame}
        durationInFrames={durationInFrames}
        fps={fps}
        width={width}
        height={height}
        onFrameChange={onFrameChange}
      />

      {/* Video Preview Area - Player component is isolated */}
      <div className="flex-1 flex items-center justify-center bg-black p-4 min-h-0">
        <PlayerOnly
          playerRef={playerRef}
          component={component}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          fps={fps}
          width={width}
          height={height}
          onFrameChange={onFrameChange}
          onPlayingChange={onPlayingChange}
        />
      </div>
    </div>
  );
};
