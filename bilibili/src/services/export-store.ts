import { create } from "zustand";

export type RenderFormat = "mp4" | "webm" | "mov";
export type RenderQuality = "low" | "medium" | "high" | "ultra";

export interface RenderConfig {
  width: number;
  height: number;
  fps: number;
  format: RenderFormat;
  quality: RenderQuality;
  codec: string;
}

export interface RenderJob {
  id: string;
  status: "pending" | "rendering" | "completed" | "failed";
  progress: number;
  config: RenderConfig;
  outputUrl?: string;
  outputSize?: number;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

interface ExportState {
  renderConfig: RenderConfig;
  currentJob: RenderJob | null;
  renderHistory: RenderJob[];
  
  setRenderConfig: (config: Partial<RenderConfig>) => void;
  startRender: (config: RenderConfig) => Promise<void>;
  updateJobProgress: (jobId: string, progress: number) => void;
  completeJob: (jobId: string, outputUrl: string, outputSize: number) => void;
  failJob: (jobId: string, error: string) => void;
  clearHistory: () => void;
  removeFromHistory: (jobId: string) => void;
}

const defaultRenderConfig: RenderConfig = {
  width: 1280,
  height: 720,
  fps: 30,
  format: "mp4",
  quality: "high",
  codec: "h264",
};

export const useExportStore = create<ExportState>((set, get) => ({
  renderConfig: defaultRenderConfig,
  currentJob: null,
  renderHistory: [],

  setRenderConfig: (config) =>
    set((state) => ({
      renderConfig: { ...state.renderConfig, ...config },
    })),

  startRender: async (config) => {
    const jobId = `render-${Date.now()}`;
    const newJob: RenderJob = {
      id: jobId,
      status: "pending",
      progress: 0,
      config,
      startedAt: new Date(),
    };

    set({ currentJob: newJob });

    // Update status to rendering
    setTimeout(() => {
      set((state) => ({
        currentJob: state.currentJob
          ? { ...state.currentJob, status: "rendering" }
          : null,
      }));
    }, 100);
  },

  updateJobProgress: (jobId, progress) =>
    set((state) => ({
      currentJob:
        state.currentJob?.id === jobId
          ? { ...state.currentJob, progress }
          : state.currentJob,
    })),

  completeJob: (jobId, outputUrl, outputSize) =>
    set((state) => {
      if (state.currentJob?.id === jobId) {
        const completedJob: RenderJob = {
          ...state.currentJob,
          status: "completed",
          progress: 100,
          outputUrl,
          outputSize,
          completedAt: new Date(),
        };
        return {
          currentJob: null,
          renderHistory: [completedJob, ...state.renderHistory],
        };
      }
      return state;
    }),

  failJob: (jobId, error) =>
    set((state) => {
      if (state.currentJob?.id === jobId) {
        const failedJob: RenderJob = {
          ...state.currentJob,
          status: "failed",
          error,
          completedAt: new Date(),
        };
        return {
          currentJob: null,
          renderHistory: [failedJob, ...state.renderHistory],
        };
      }
      return state;
    }),

  clearHistory: () => set({ renderHistory: [] }),

  removeFromHistory: (jobId) =>
    set((state) => ({
      renderHistory: state.renderHistory.filter((job) => job.id !== jobId),
    })),
}));
