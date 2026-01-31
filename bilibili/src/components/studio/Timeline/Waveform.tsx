"use client";

import React, { useEffect, useMemo, useState } from "react";

interface WaveformProps {
  assetId?: string;
  durationInFrames: number;
  pixelsPerFrame: number;
  color?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  assetId,
  durationInFrames,
  pixelsPerFrame,
  color = "rgba(255, 255, 255, 0.3)",
}) => {
  const width = durationInFrames * pixelsPerFrame;
  const [peaks, setPeaks] = useState<number[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!assetId) {
      setPeaks(null);
      return undefined;
    }

    const loadWaveform = async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}/waveform`);
        if (!response.ok) {
          if (!cancelled) {
            setPeaks(null);
          }
          return;
        }

        const payload = (await response.json()) as { peaks?: number[] };
        if (!cancelled) {
          setPeaks(Array.isArray(payload.peaks) ? payload.peaks : null);
        }
      } catch {
        if (!cancelled) {
          setPeaks(null);
        }
      }
    };

    void loadWaveform();
    return () => {
      cancelled = true;
    };
  }, [assetId]);

  const points = useMemo(() => {
    if (!peaks || peaks.length === 0) {
      return null;
    }

    const numPoints = Math.floor(width / 2);
    if (numPoints <= 0) {
      return null;
    }

    const stride = peaks.length / numPoints;
    return Array.from({ length: numPoints }, (_unused, index) => {
      const sampleIndex = Math.min(peaks.length - 1, Math.floor(index * stride));
      return peaks[sampleIndex] ?? 0;
    });
  }, [peaks, width]);

  if (width < 10 || !points) return null;

  return (
    <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden">
      <svg width={width} height="100%" preserveAspectRatio="none">
        {points.map((p, i) => (
          <rect
            key={i}
            x={i * 2}
            y={`${(1 - p) * 50}%`}
            width="1"
            height={`${p * 100}%`}
            fill={color}
          />
        ))}
      </svg>
    </div>
  );
};
