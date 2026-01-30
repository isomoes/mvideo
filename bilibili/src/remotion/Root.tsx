import { Composition, Folder } from "remotion";
import { Main } from "./MyComp/Main";
import {
  COMP_NAME,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  FINAL_COMP_NAME,
  FINAL_DURATION_IN_FRAMES,
  INTRO_COMP_NAME,
  INTRO_DURATION_IN_FRAMES,
  MAIN_COMP_NAME,
  MAIN_DURATION_IN_FRAMES,
  OUTRO_COMP_NAME,
  OUTRO_DURATION_IN_FRAMES,
  defaultFinalProps,
  defaultIntroProps,
  defaultMainProps,
  defaultOutroProps,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { NextLogo } from "./MyComp/NextLogo";
import { IntroComposition } from "./Compositions/IntroComposition";
import { MainComposition } from "./Compositions/MainComposition";
import { OutroComposition } from "./Compositions/OutroComposition";
import { FinalComposition } from "./Compositions/FinalComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Base">
        <Composition
          id={INTRO_COMP_NAME}
          component={IntroComposition}
          durationInFrames={INTRO_DURATION_IN_FRAMES}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={defaultIntroProps}
        />
        <Composition
          id={MAIN_COMP_NAME}
          component={MainComposition}
          durationInFrames={MAIN_DURATION_IN_FRAMES}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={defaultMainProps}
        />
        <Composition
          id={OUTRO_COMP_NAME}
          component={OutroComposition}
          durationInFrames={OUTRO_DURATION_IN_FRAMES}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={defaultOutroProps}
        />
        <Composition
          id={FINAL_COMP_NAME}
          component={FinalComposition}
          durationInFrames={FINAL_DURATION_IN_FRAMES}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={defaultFinalProps}
        />
      </Folder>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
    </>
  );
};
