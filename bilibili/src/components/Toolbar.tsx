import React from "react";

export const Toolbar = ({
  isPlaying,
  snapEnabled,
  rippleEnabled,
  zoom,
  onTogglePlay,
  onStep,
  onToggleSnap,
  onToggleRipple,
  onZoomChange,
}: {
  isPlaying: boolean;
  snapEnabled: boolean;
  rippleEnabled: boolean;
  zoom: number;
  onTogglePlay: () => void;
  onStep: (delta: number) => void;
  onToggleSnap: () => void;
  onToggleRipple: () => void;
  onZoomChange: (value: number) => void;
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-unfocused-border-color bg-background/80 px-5 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          className="rounded-full border border-unfocused-border-color bg-foreground px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-background"
          onClick={onTogglePlay}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          className="rounded-full border border-unfocused-border-color px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          onClick={() => onStep(-1)}
        >
          -1f
        </button>
        <button
          className="rounded-full border border-unfocused-border-color px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          onClick={() => onStep(1)}
        >
          +1f
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[11px]">
        <button
          className={`rounded-full border border-unfocused-border-color px-3 py-2 font-semibold uppercase tracking-[0.2em] ${
            snapEnabled ? "bg-foreground text-background" : "bg-background"
          }`}
          onClick={onToggleSnap}
        >
          Snap: {snapEnabled ? "On" : "Off"}
        </button>
        <button
          className={`rounded-full border border-unfocused-border-color px-3 py-2 font-semibold uppercase tracking-[0.2em] ${
            rippleEnabled ? "bg-foreground text-background" : "bg-background"
          }`}
          onClick={onToggleRipple}
        >
          Ripple: {rippleEnabled ? "On" : "Off"}
        </button>
        <div className="flex items-center gap-2 rounded-full border border-unfocused-border-color px-3 py-2">
          <span className="font-semibold uppercase tracking-[0.2em]">Zoom</span>
          <input
            type="range"
            min={50}
            max={150}
            step={5}
            value={zoom}
            onChange={(event) => onZoomChange(Number(event.target.value))}
          />
          <span className="min-w-[36px] text-right font-semibold">
            {zoom}%
          </span>
        </div>
      </div>
    </div>
  );
};
