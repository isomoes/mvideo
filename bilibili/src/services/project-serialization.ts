import { ProjectSchema, type Project } from "../../types/models";

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
    width: 1280,
    height: 720,
    fps: 30,
    durationInFrames: 300,
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
