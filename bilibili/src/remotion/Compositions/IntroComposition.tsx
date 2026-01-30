import { z } from "zod";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { IntroCompositionProps } from "../../../types/constants";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";

loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "600", "700"],
});

export const IntroComposition = (
  props: z.infer<typeof IntroCompositionProps>,
) => {
  const { title, subtitle, accentColor } = props;
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 12, 40], [0, 1, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [8, 20, 44], [0, 1, 1], {
    extrapolateRight: "clamp",
  });
  const accentScale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      className="text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.25), transparent 55%), linear-gradient(140deg, #0f172a 0%, #111827 55%, #1f2937 100%)",
        fontFamily,
      }}
    >
      <AbsoluteFill className="px-16 py-12">
        <div
          className="h-2 w-24 rounded-full"
          style={{
            backgroundColor: accentColor,
            transform: `scaleX(${accentScale})`,
            transformOrigin: "left",
          }}
        ></div>
        <div className="mt-12 max-w-3xl space-y-5">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Intro Segment
          </p>
          <h1
            className="text-6xl font-semibold leading-tight"
            style={{ opacity: titleOpacity }}
          >
            {title}
          </h1>
          <p className="text-2xl text-white/80" style={{ opacity: subtitleOpacity }}>
            {subtitle}
          </p>
        </div>
        <div className="absolute bottom-10 right-16 text-xs uppercase tracking-[0.3em] text-white/50">
          Generated in Remotion
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
