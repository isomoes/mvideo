import { ProjectSchema, type Project } from "../../types/models";
import { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS, FINAL_DURATION_IN_FRAMES } from "../../types/constants";

const generateProjectId = () => {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && "randomUUID" in cryptoRef) {
    return cryptoRef.randomUUID();
  }

  return `project-${Date.now()}`;
};

export const createEmptyProject = (overrides: Partial<Project> = {}) => {
  const now = new Date().toISOString();

  return ProjectSchema.parse({
    schemaVersion: 1,
    id: generateProjectId(),
    name: "Untitled Project",
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    fps: VIDEO_FPS,
    durationInFrames: FINAL_DURATION_IN_FRAMES,
    assets: [],
    tracks: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};

export const serializeProject = (project: Project) => {
  return JSON.stringify(project, null, 2);
};

export const deserializeProject = (value: string) => {
  const parsed = JSON.parse(value) as unknown;
  return ProjectSchema.parse(parsed);
};
