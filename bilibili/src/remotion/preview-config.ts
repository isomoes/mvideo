import { MAIN_COMP_NAME } from "../../types/constants";
import { getCompositionById } from "./composition-registry";

export const PREVIEW_COMPOSITION_ID = MAIN_COMP_NAME;

const previewComposition = getCompositionById(PREVIEW_COMPOSITION_ID);

if (!previewComposition) {
  throw new Error(`Unknown preview composition: ${PREVIEW_COMPOSITION_ID}`);
}

export const compositionPreviewConfig = {
  id: previewComposition.id,
  component: previewComposition.component,
  defaultProps: previewComposition.defaultProps,
  durationInFrames: previewComposition.durationInFrames,
  fps: previewComposition.fps,
  width: previewComposition.width,
  height: previewComposition.height,
};
