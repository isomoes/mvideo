import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ReactNode } from "react";
import {
  MainCompositionProps,
  OverlayItemProps,
} from "../../../types/constants";

type OverlayItem = z.infer<typeof OverlayItemProps>;
type TextOverlay = Extract<
  OverlayItem,
  { type: "title" | "lower-third" | "cta" | "text" }
>;
type ImageOverlay = Extract<OverlayItem, { type: "image" }>;

const resolveVideoSrc = (src: string) => {
  // Handle absolute URLs (http/https)
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Handle API endpoints (starts with /)
  if (src.startsWith("/")) {
    return src;
  }

  // Handle static files in public directory
  return staticFile(src);
};

const textOverlayStyles: Record<TextOverlay["type"], string> = {
  title:
    "bg-slate-950/80 text-2xl font-semibold tracking-tight text-white",
  "lower-third": "bg-slate-900/80 text-lg font-medium text-white",
  cta: "bg-orange-500 text-sm font-semibold uppercase tracking-[0.2em] text-white",
  text: "bg-slate-900/75 text-base font-medium text-white",
};

const isImageOverlay = (overlay: OverlayItem): overlay is ImageOverlay =>
  overlay.type === "image";

const OverlayBase = ({
  overlay,
  children,
}: {
  overlay: OverlayItem;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const enterDuration = Math.max(0, overlay.enterDurationInFrames ?? 12);
  const exitDuration = Math.max(0, overlay.exitDurationInFrames ?? 12);
  const enterEnd = Math.min(enterDuration, overlay.durationInFrames);
  const exitStart = Math.max(enterEnd, overlay.durationInFrames - exitDuration);
  const hasExit = exitDuration > 0 && overlay.durationInFrames > 0;
  const enter = interpolate(frame, [0, enterEnd], [20, 0], {
    extrapolateRight: "clamp",
  });
  const exit = hasExit
    ? interpolate(frame, [exitStart, overlay.durationInFrames], [0, -12], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const opacity = interpolate(
    frame,
    hasExit
      ? [0, enterEnd, exitStart, overlay.durationInFrames]
      : [0, enterEnd, overlay.durationInFrames],
    hasExit ? [0, 1, 1, 0] : [0, 1, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      className="absolute"
      style={{
        left: overlay.x ?? 80,
        top: overlay.y ?? 80,
        transform: `translateY(${enter + exit}px)`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

const OverlayText = ({ overlay }: { overlay: TextOverlay }) => {
  return (
    <div
      className={`rounded-2xl px-5 py-3 shadow-[0_20px_40px_rgba(15,23,42,0.35)] backdrop-blur ${
        textOverlayStyles[overlay.type]
      }`}
    >
      {overlay.text}
    </div>
  );
};

const OverlayImage = ({ overlay }: { overlay: ImageOverlay }) => {
  const width = overlay.width ?? 240;
  const height = overlay.height ?? 135;
  const src = resolveVideoSrc(overlay.src);

  return (
    <img
      src={src}
      alt={overlay.alt ?? ""}
      className="shadow-[0_20px_40px_rgba(15,23,42,0.35)]"
      style={{
        width,
        height,
        objectFit: overlay.objectFit ?? "cover",
        borderRadius: overlay.borderRadius ?? 16,
      }}
    />
  );
};

export const MainComposition = (
  props: z.infer<typeof MainCompositionProps>,
) => {
  const { videoSrc, trimStartInFrames, trimEndInFrames, overlays } = props;
  const resolvedVideoSrc = resolveVideoSrc(videoSrc);
  const { fps } = useVideoConfig();
  
  // Video component uses:
  // - startFrom: frame to start playing from (skip this many frames from the beginning)
  // - endAt: frame to stop playing at (absolute frame number from start of video)
  const startFrom = Math.max(0, trimStartInFrames);
  const endAt = Math.max(startFrom + 1, trimEndInFrames);

  // Check if we have a valid video source
  const hasVideo = videoSrc && videoSrc.trim() !== "";

  // Debug logging (will show in browser console)
  if (typeof window !== "undefined" && hasVideo) {
    console.log("[MainComposition] Video config:", {
      src: resolvedVideoSrc,
      startFrom,
      endAt,
      duration: endAt - startFrom,
      fps,
    });
  }

  return (
    <AbsoluteFill className="bg-black">
      {hasVideo ? (
        <>
          <Video
            src={resolvedVideoSrc}
            startFrom={startFrom}
            endAt={endAt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
              console.error("[MainComposition] Video error:", e);
              console.error("[MainComposition] Failed to load:", resolvedVideoSrc);
            }}
          />
          {/* Debug overlay - remove after testing */}
          {typeof window !== "undefined" && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "8px 12px",
                fontSize: 12,
                fontFamily: "monospace",
                borderRadius: 4,
                pointerEvents: "none",
                zIndex: 9999,
              }}
            >
              <div>Src: {resolvedVideoSrc.substring(0, 50)}...</div>
              <div>Start: {startFrom} | End: {endAt}</div>
              <div>Duration: {endAt - startFrom} frames</div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-4">🎬</div>
            <div className="text-lg">No video source</div>
            <div className="text-sm mt-2">Add a video clip to the timeline</div>
          </div>
        </div>
      )}
      {overlays.map((overlay) => (
        <Sequence
          key={overlay.id}
          from={overlay.startFrame}
          durationInFrames={overlay.durationInFrames}
        >
          <OverlayBase overlay={overlay}>
            {isImageOverlay(overlay) ? (
              <OverlayImage overlay={overlay} />
            ) : (
              <OverlayText overlay={overlay} />
            )}
          </OverlayBase>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
