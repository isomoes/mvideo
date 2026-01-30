import { z } from "zod";

export const AssetKindSchema = z.enum(["video", "audio", "image", "text"]);

export const AssetSchema = z.object({
  id: z.string(),
  kind: AssetKindSchema,
  src: z.string(),
  name: z.string().optional(),
  durationInFrames: z.number().int().nonnegative().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const ClipSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  trackId: z.string(),
  startFrame: z.number().int().nonnegative(),
  durationInFrames: z.number().int().positive(),
  trimStartFrame: z.number().int().nonnegative().optional(),
});

export const TrackKindSchema = z.enum(["video", "audio"]);

export const TrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: TrackKindSchema,
  muted: z.boolean().optional(),
  locked: z.boolean().optional(),
  clips: z.array(ClipSchema),
});

export const ProjectSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.number().int().positive(),
  durationInFrames: z.number().int().positive(),
  assets: z.array(AssetSchema),
  tracks: z.array(TrackSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AssetKind = z.infer<typeof AssetKindSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type Clip = z.infer<typeof ClipSchema>;
export type TrackKind = z.infer<typeof TrackKindSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type Project = z.infer<typeof ProjectSchema>;
