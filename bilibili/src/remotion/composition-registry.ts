import type { ComponentType } from "react";
import type { z } from "zod";
import {
  defaultMainProps,
  MAIN_COMP_NAME,
  MAIN_DURATION_IN_FRAMES,
  MainCompositionProps,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { MainComposition } from "./Compositions/MainComposition";

export type CompositionRegistryItem<Schema extends z.ZodTypeAny> = {
  id: string;
  component: ComponentType<z.infer<Schema>>;
  schema: Schema;
  defaultProps: z.infer<Schema>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  folder?: string;
  previewEnabled?: boolean;
};

export const compositionRegistry = [
  {
    id: MAIN_COMP_NAME,
    component: MainComposition,
    schema: MainCompositionProps,
    defaultProps: defaultMainProps,
    durationInFrames: MAIN_DURATION_IN_FRAMES,
    fps: VIDEO_FPS,
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    folder: "Base",
    previewEnabled: true,
  },
] satisfies CompositionRegistryItem<z.ZodTypeAny>[];

export const getCompositionById = (id: string) =>
  compositionRegistry.find((composition) => composition.id === id);
