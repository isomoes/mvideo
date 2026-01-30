import { z } from "zod";
export const COMP_NAME = "MyComp";

export const INTRO_COMP_NAME = "IntroComposition";
export const MAIN_COMP_NAME = "MainComposition";
export const OUTRO_COMP_NAME = "OutroComposition";
export const FINAL_COMP_NAME = "FinalComposition";

export const CompositionProps = z.object({
  title: z.string(),
});

export const IntroCompositionProps = z.object({
  title: z.string(),
  subtitle: z.string(),
  accentColor: z.string(),
});

export const OverlayItemProps = z.object({
  id: z.string(),
  type: z.enum(["title", "lower-third", "cta"]),
  text: z.string(),
  startFrame: z.number(),
  durationInFrames: z.number(),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const MainCompositionProps = z.object({
  videoSrc: z.string(),
  trimStartInFrames: z.number(),
  trimEndInFrames: z.number(),
  overlays: z.array(OverlayItemProps),
});

export const OutroCompositionProps = z.object({
  headline: z.string(),
  subline: z.string(),
  ctaText: z.string(),
});

export const FinalCompositionProps = z.object({
  intro: IntroCompositionProps.optional(),
  main: MainCompositionProps,
  outro: OutroCompositionProps.optional(),
  introDurationInFrames: z.number(),
  mainDurationInFrames: z.number(),
  outroDurationInFrames: z.number(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "Next.js and Remotion",
};

export const defaultIntroProps: z.infer<typeof IntroCompositionProps> = {
  title: "OBS Editorial Pipeline",
  subtitle: "Trim, polish, and publish",
  accentColor: "#f97316",
};

export const defaultMainProps: z.infer<typeof MainCompositionProps> = {
  videoSrc: "obs-trimmed.mp4",
  trimStartInFrames: 90,
  trimEndInFrames: 870,
  overlays: [
    {
      id: "title",
      type: "title",
      text: "Episode 42: Shipping the pipeline",
      startFrame: 45,
      durationInFrames: 150,
      x: 80,
      y: 80,
    },
    {
      id: "lower-third",
      type: "lower-third",
      text: "Host: Mohit Yadav",
      startFrame: 240,
      durationInFrames: 180,
      x: 70,
      y: 560,
    },
    {
      id: "cta",
      type: "cta",
      text: "Subscribe for weekly edits",
      startFrame: 420,
      durationInFrames: 150,
      x: 760,
      y: 560,
    },
  ],
};

export const defaultOutroProps: z.infer<typeof OutroCompositionProps> = {
  headline: "Thanks for watching",
  subline: "New episodes every Friday",
  ctaText: "Subscribe & Share",
};

export const DURATION_IN_FRAMES = 200;
export const INTRO_DURATION_IN_FRAMES = 150;
export const MAIN_DURATION_IN_FRAMES = 900;
export const OUTRO_DURATION_IN_FRAMES = 150;
export const FINAL_DURATION_IN_FRAMES =
  INTRO_DURATION_IN_FRAMES + MAIN_DURATION_IN_FRAMES + OUTRO_DURATION_IN_FRAMES;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;

export const defaultFinalProps: z.infer<typeof FinalCompositionProps> = {
  intro: defaultIntroProps,
  main: defaultMainProps,
  outro: defaultOutroProps,
  introDurationInFrames: INTRO_DURATION_IN_FRAMES,
  mainDurationInFrames: MAIN_DURATION_IN_FRAMES,
  outroDurationInFrames: OUTRO_DURATION_IN_FRAMES,
};
