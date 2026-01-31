import { useMemo } from "react";
import type { Project } from "../../types/models";
import { resolveProjectToMainCompositionProps } from "../services/resolve-composition-props";
import type { z } from "zod";
import type { MainCompositionProps } from "../../types/constants";

/**
 * Hook that resolves project data to MainComposition props for live preview.
 * Updates automatically when project tracks, clips, or assets change.
 */
export const useResolvedCompositionProps = (project: Project) => {
  const compositionProps = useMemo(() => {
    return resolveProjectToMainCompositionProps(project);
  }, [
    project.assets,
    project.tracks,
    // Deep dependency on tracks/clips to trigger re-render when timeline changes
    JSON.stringify(project.tracks.map(t => ({
      id: t.id,
      clips: t.clips.map(c => ({
        id: c.id,
        assetId: c.assetId,
        startFrame: c.startFrame,
        durationInFrames: c.durationInFrames,
        trimStartFrame: c.trimStartFrame,
      }))
    }))),
  ]);

  return compositionProps;
};
