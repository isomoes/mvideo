import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  MainCompositionProps,
  OverlayItemProps,
} from "../../../types/constants";

type OverlayItem = z.infer<typeof OverlayItemProps>;

const resolveVideoSrc = (src: string) => {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return staticFile(src);
};

const overlayStyles: Record<OverlayItem["type"], string> = {
  title:
    "bg-slate-950/80 text-2xl font-semibold tracking-tight text-white",
  "lower-third": "bg-slate-900/80 text-lg font-medium text-white",
  cta: "bg-orange-500 text-sm font-semibold uppercase tracking-[0.2em] text-white",
};

const OverlayBadge = ({ overlay }: { overlay: OverlayItem }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 12], [20, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 10, 70], [0, 1, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      className={`absolute rounded-2xl px-5 py-3 shadow-[0_20px_40px_rgba(15,23,42,0.35)] backdrop-blur ${
        overlayStyles[overlay.type]
      }`}
      style={{
        left: overlay.x ?? 80,
        top: overlay.y ?? 80,
        transform: `translateY(${enter}px)`,
        opacity,
      }}
    >
      {overlay.text}
    </div>
  );
};

export const MainComposition = (
  props: z.infer<typeof MainCompositionProps>,
) => {
  const { videoSrc, trimStartInFrames, trimEndInFrames, overlays } = props;
  const resolvedVideoSrc = resolveVideoSrc(videoSrc);
  const clipStart = Math.max(0, trimStartInFrames);
  const clipEnd = Math.max(clipStart + 1, trimEndInFrames);

  return (
    <AbsoluteFill className="bg-black">
      <Video
        src={resolvedVideoSrc}
        trimBefore={clipStart}
        trimAfter={clipEnd}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {overlays.map((overlay) => (
        <Sequence
          key={overlay.id}
          from={overlay.startFrame}
          durationInFrames={overlay.durationInFrames}
        >
          <OverlayBadge overlay={overlay} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
