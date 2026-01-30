import { z } from "zod";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { OutroCompositionProps } from "../../../types/constants";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";

loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "600", "700"],
});

export const OutroComposition = (
  props: z.infer<typeof OutroCompositionProps>,
) => {
  const { headline, subline, ctaText } = props;
  const frame = useCurrentFrame();
  const headlineOpacity = interpolate(frame, [0, 14, 50], [0, 1, 1], {
    extrapolateRight: "clamp",
  });
  const sublineOpacity = interpolate(frame, [10, 24, 60], [0, 1, 1], {
    extrapolateRight: "clamp",
  });
  const ctaOpacity = interpolate(frame, [20, 36, 70], [0, 1, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      className="text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 70% 20%, rgba(251,146,60,0.25), transparent 60%), linear-gradient(160deg, #111827 0%, #0f172a 55%, #1e293b 100%)",
        fontFamily,
      }}
    >
      <AbsoluteFill className="items-center justify-center px-16 text-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Outro Segment
          </p>
          <h2 className="text-5xl font-semibold" style={{ opacity: headlineOpacity }}>
            {headline}
          </h2>
          <p className="text-xl text-white/80" style={{ opacity: sublineOpacity }}>
            {subline}
          </p>
          <div
            className="mx-auto mt-8 w-fit rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900"
            style={{ opacity: ctaOpacity }}
          >
            {ctaText}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
