import { create } from "zustand";
import type { Asset, Clip, Project, Track } from "../../types/models";
import { createEmptyProject } from "./project-serialization";
import { runOnProjectLoaded } from "./plugins";

type ProjectState = {
  project: Project;
  setProject: (project: Project) => void;
  updateProject: (partial: Partial<Project>) => void;
  createProject: (config: {
    name: string;
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
  }) => Promise<Project>;
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

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: createEmptyProject(),
  setProject: (project) => {
    set({ project });
    void runOnProjectLoaded(project);
  },
  updateProject: (partial) =>
    set((state) => ({
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
      name: config.name,
      width: config.width,
      height: config.height,
      fps: config.fps,
      durationInFrames: config.durationInFrames,
      assets: [],
      tracks: [],
      createdAt: now,
      updatedAt: now,
    };

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    const payload = await response.json();
    if (!response.ok || payload.type !== "success") {
      throw new Error(payload.message ?? "Failed to create project.");
    }
    
    set({ project: payload.data });
    void runOnProjectLoaded(payload.data);
    
    // Store as last project
    globalThis.localStorage?.setItem("mvideo:lastProjectId", payload.data.id);
    
    return payload.data;
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
    set({ project: payload.data });
    return payload.data;
  },
  addAsset: (asset) =>
    set((state) => ({
      project: touchProject({
        ...state.project,
        assets: [...state.project.assets, asset],
      }),
    })),
  removeAsset: (assetId) =>
    set((state) => ({
      project: touchProject({
        ...state.project,
        assets: state.project.assets.filter((asset) => asset.id !== assetId),
      }),
    })),
  updateAsset: (assetId, partial) =>
    set((state) => ({
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
      project: touchProject({
        ...state.project,
        tracks: [...state.project.tracks, track],
      }),
    })),
  removeTrack: (trackId) =>
    set((state) => ({
      project: touchProject({
        ...state.project,
        tracks: state.project.tracks.filter((track) => track.id !== trackId),
      }),
    })),
  updateTrack: (trackId, partial) =>
    set((state) => ({
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
    set((state) => ({
      project: touchProject({
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
      }),
    })),
  updateClip: (clipId, partial) =>
    set((state) => ({
      project: touchProject({
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
      }),
    })),
  removeClip: (clipId) =>
    set((state) => ({
      project: touchProject({
        ...state.project,
        tracks: state.project.tracks.map((track) => ({
          ...track,
          clips: track.clips.filter((clip) => clip.id !== clipId),
        })),
      }),
    })),
  loadProject: async (projectId) => {
    const response = await fetch(`/api/projects/${projectId}`);
    const payload = await response.json();
    if (!response.ok || payload.type !== "success") {
      throw new Error(payload.message ?? "Failed to load project.");
    }
    set({ project: payload.data });
    void runOnProjectLoaded(payload.data);
    return payload.data;
  },
  saveProject: async (projectOverride) => {
    const target = projectOverride ?? get().project;
    const response = await fetch(`/api/projects/${target.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(target),
    });
    const payload = await response.json();
    if (!response.ok || payload.type !== "success") {
      throw new Error(payload.message ?? "Failed to save project.");
    }
    set({ project: payload.data });
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
