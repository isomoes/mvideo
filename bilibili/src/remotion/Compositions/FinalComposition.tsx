import { z } from "zod";
import { AbsoluteFill, Sequence } from "remotion";
import { FinalCompositionProps } from "../../../types/constants";
import { IntroComposition } from "./IntroComposition";
import { MainComposition } from "./MainComposition";
import { OutroComposition } from "./OutroComposition";

export const FinalComposition = (
  props: z.infer<typeof FinalCompositionProps>,
) => {
  const {
    intro,
    main,
    outro,
    introDurationInFrames,
    mainDurationInFrames,
    outroDurationInFrames,
  } = props;

  const introFrames = intro ? introDurationInFrames : 0;
  const outroFrames = outro ? outroDurationInFrames : 0;
  const mainStart = introFrames;
  const outroStart = introFrames + mainDurationInFrames;

  return (
    <AbsoluteFill className="bg-black">
      {intro && introFrames > 0 ? (
        <Sequence durationInFrames={introFrames}>
          <IntroComposition {...intro} />
        </Sequence>
      ) : null}
      <Sequence from={mainStart} durationInFrames={mainDurationInFrames}>
        <MainComposition {...main} />
      </Sequence>
      {outro && outroFrames > 0 ? (
        <Sequence from={outroStart} durationInFrames={outroFrames}>
          <OutroComposition {...outro} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
