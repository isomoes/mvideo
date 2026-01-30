import { create } from "zustand";
import type { Asset, Clip, Project, Track } from "../../types/models";
import { createEmptyProject } from "./project-serialization";

type ProjectState = {
  project: Project;
  setProject: (project: Project) => void;
  updateProject: (partial: Partial<Project>) => void;
  addAsset: (asset: Asset) => void;
  addTrack: (track: Track) => void;
  addClip: (trackId: string, clip: Clip) => void;
  updateClip: (clipId: string, partial: Partial<Clip>) => void;
  removeClip: (clipId: string) => void;
};

const touchProject = (project: Project): Project => {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
  };
};

export const useProjectStore = create<ProjectState>((set) => ({
  project: createEmptyProject(),
  setProject: (project) => set({ project }),
  updateProject: (partial) =>
    set((state) => ({
      project: touchProject({
        ...state.project,
        ...partial,
      }),
    })),
  addAsset: (asset) =>
    set((state) => ({
      project: touchProject({
        ...state.project,
        assets: [...state.project.assets, asset],
      }),
    })),
  addTrack: (track) =>
    set((state) => ({
      project: touchProject({
        ...state.project,
        tracks: [...state.project.tracks, track],
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
}));
