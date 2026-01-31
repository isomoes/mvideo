import { create } from "zustand";
import type { Asset, Clip, Project, Track } from "../../types/models";
import { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS, FINAL_DURATION_IN_FRAMES } from "../../types/constants";
import { createEmptyProject } from "./project-serialization";
import { runOnProjectLoaded } from "./plugins";

type ProjectState = {
  project: Project;
  isDirty: boolean;
  setProject: (project: Project) => void;
  updateProject: (partial: Partial<Project>) => void;
  createProject: (config: { name: string }) => Promise<Project>;
  modifyProject: (projectId: string, partial: Partial<Project>) => Promise<Project>;
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, partial: Partial<Asset>) => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, partial: Partial<Track>) => void;
  addClip: (trackId: string, clip: Clip) => void;
  updateClip: (clipId: string, partial: Partial<Clip>) => void;
  removeClip: (clipId: string) => void;
  loadProject: (projectId: string) => Promise<Project>;
  saveProject: (project?: Project) => Promise<Project>;
  listProjects: () => Promise<Project[]>;
};

const touchProject = (project: Project): Project => {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Recalculates project duration based on all clips in the timeline.
 * Returns the maximum end frame across all clips, or the default duration if no clips exist.
 */
const recalculateProjectDuration = (project: Project): number => {
  let maxEndFrame = 0;
  
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      const clipEndFrame = clip.startFrame + clip.durationInFrames;
      if (clipEndFrame > maxEndFrame) {
        maxEndFrame = clipEndFrame;
      }
    }
  }
  
  // If no clips, use the default duration, otherwise add some padding (e.g., 150 frames = 5 seconds at 30fps)
  return maxEndFrame > 0 ? maxEndFrame + 150 : FINAL_DURATION_IN_FRAMES;
};

/**
 * Updates project settings based on timeline content.
 * Recalculates duration when clips are modified.
 */
const syncProjectSettings = (project: Project): Project => {
  const newDuration = recalculateProjectDuration(project);
  
  return {
    ...project,
    durationInFrames: newDuration,
  };
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: createEmptyProject(),
  isDirty: false,
  setProject: (project) => {
    set({ project, isDirty: false });
    void runOnProjectLoaded(project);
  },
  updateProject: (partial) =>
    set((state) => ({
      isDirty: true,
      project: touchProject({
        ...state.project,
        ...partial,
      }),
    })),
  createProject: async (config) => {
    const projectId = globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`;
    const now = new Date().toISOString();

    const newProject: Project = {
      schemaVersion: 1,
      id: projectId,
      name: config.name || "Untitled Project",
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      fps: VIDEO_FPS,
      durationInFrames: FINAL_DURATION_IN_FRAMES,
      assets: [],
      tracks: [],
      createdAt: now,
      updatedAt: now,
    };

    set({ project: newProject, isDirty: true });
    void runOnProjectLoaded(newProject);

    // Store as last project
    globalThis.localStorage?.setItem("mvideo:lastProjectId", newProject.id);

    return newProject;
  },
  modifyProject: async (projectId, partial) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const payload = await response.json();
    if (!response.ok || payload.type !== "success") {
      throw new Error(payload.message ?? "Failed to modify project.");
    }
    set({ project: payload.data, isDirty: false });
    return payload.data;
  },
  addAsset: (asset) =>
    set((state) => ({
      isDirty: true,
      project: touchProject({
        ...state.project,
        assets: [...state.project.assets, asset],
      }),
    })),
  removeAsset: (assetId) =>
    set((state) => ({
      isDirty: true,
      project: touchProject({
        ...state.project,
        assets: state.project.assets.filter((asset) => asset.id !== assetId),
      }),
    })),
  updateAsset: (assetId, partial) =>
    set((state) => ({
      isDirty: true,
      project: touchProject({
        ...state.project,
        assets: state.project.assets.map((asset) => {
          if (asset.id !== assetId) {
            return asset;
          }
          return {
            ...asset,
            ...partial,
          };
        }),
      }),
    })),
  addTrack: (track) =>
    set((state) => ({
      isDirty: true,
      project: touchProject({
        ...state.project,
        tracks: [...state.project.tracks, track],
      }),
    })),
  removeTrack: (trackId) =>
    set((state) => ({
      isDirty: true,
      project: touchProject({
        ...state.project,
        tracks: state.project.tracks.filter((track) => track.id !== trackId),
      }),
    })),
  updateTrack: (trackId, partial) =>
    set((state) => ({
      isDirty: true,
      project: touchProject({
        ...state.project,
        tracks: state.project.tracks.map((track) => {
          if (track.id !== trackId) {
            return track;
          }
          return {
            ...track,
            ...partial,
          };
        }),
      }),
    })),
  addClip: (trackId, clip) =>
    set((state) => {
      const updatedProject = {
        ...state.project,
        tracks: state.project.tracks.map((track) => {
          if (track.id !== trackId) {
            return track;
          }

          return {
            ...track,
            clips: [...track.clips, clip],
          };
        }),
      };
      
      return {
        isDirty: true,
        project: touchProject(syncProjectSettings(updatedProject)),
      };
    }),
  updateClip: (clipId, partial) =>
    set((state) => {
      const updatedProject = {
        ...state.project,
        tracks: state.project.tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) => {
            if (clip.id !== clipId) {
              return clip;
            }

            return {
              ...clip,
              ...partial,
            };
          }),
        })),
      };
      
      return {
        isDirty: true,
        project: touchProject(syncProjectSettings(updatedProject)),
      };
    }),
  removeClip: (clipId) =>
    set((state) => {
      const updatedProject = {
        ...state.project,
        tracks: state.project.tracks.map((track) => ({
          ...track,
          clips: track.clips.filter((clip) => clip.id !== clipId),
        })),
      };
      
      return {
        isDirty: true,
        project: touchProject(syncProjectSettings(updatedProject)),
      };
    }),
  loadProject: async (projectId) => {
    const response = await fetch(`/api/projects/${projectId}`);
    const payload = await response.json();
    if (!response.ok || payload.type !== "success") {
      throw new Error(payload.message ?? "Failed to load project.");
    }
    set({ project: payload.data, isDirty: false });
    void runOnProjectLoaded(payload.data);
    return payload.data;
  },
  saveProject: async (projectOverride) => {
    const target = projectOverride ?? get().project;
    
    if (!target.id) {
      throw new Error("Cannot save project without an ID.");
    }

    const response = await fetch(`/api/projects/${target.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(target),
    });
    const payload = await response.json();
    if (!response.ok || payload.type !== "success") {
      throw new Error(payload.message ?? "Failed to save project.");
    }
    set({ project: payload.data, isDirty: false });
    return payload.data;
  },
  listProjects: async () => {
    const response = await fetch("/api/projects");
    const payload = await response.json();
    if (!response.ok || payload.type !== "success") {
      throw new Error(payload.message ?? "Failed to load projects.");
    }
    return payload.data ?? [];
  },
}));
