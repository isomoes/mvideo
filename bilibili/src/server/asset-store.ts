import { promises as fs } from "fs";
import path from "path";

export type AudioTrackInfo = {
  index: number;
  codec?: string;
  channels?: number;
  sampleRate?: number;
};

export type MediaMetadata = {
  durationSeconds: number | null;
  fps: number | null;
  width: number | null;
  height: number | null;
  audioTracks: AudioTrackInfo[];
};

export type DerivedAssetRecord = {
  trimmedVideoPath?: string;
  normalizedAudioPath?: string;
  proxyVideoPath?: string;
  waveformPath?: string;
  thumbnailsDir?: string;
  thumbnailPaths?: string[];
  links?: {
    sourcePath?: string;
    trimmedVideoPath?: string;
    proxyVideoPath?: string;
  };
};

export type AssetRecord = {
  id: string;
  originalName: string;
  sourcePath: string;
  sizeBytes: number;
  createdAt: string;
  metadata: MediaMetadata;
  derived?: DerivedAssetRecord;
};

const defaultStorageRoot = path.join(process.cwd(), "storage");

export const getStorageRoot = (): string => {
  return process.env.ASSET_STORAGE_ROOT ?? defaultStorageRoot;
};

export const getAssetDir = (assetId: string): string => {
  return path.join(getStorageRoot(), "assets", assetId);
};

export const getAssetSourceDir = (assetId: string): string => {
  return path.join(getAssetDir(assetId), "source");
};

export const getAssetDerivedDir = (assetId: string): string => {
  return path.join(getAssetDir(assetId), "derived");
};

export const getAssetDerivedPath = (assetId: string, filename: string): string => {
  return path.join(getAssetDerivedDir(assetId), filename);
};

export const getAssetRecordPath = (assetId: string): string => {
  return path.join(getAssetDir(assetId), "asset.json");
};

export const ensureDir = async (dirPath: string): Promise<void> => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const writeAssetSource = async (
  assetId: string,
  filename: string,
  contents: Buffer,
): Promise<string> => {
  const sourceDir = getAssetSourceDir(assetId);
  await ensureDir(sourceDir);
  const sourcePath = path.join(sourceDir, filename);
  await fs.writeFile(sourcePath, contents);
  return sourcePath;
};

export const writeAssetRecord = async (record: AssetRecord): Promise<void> => {
  const assetDir = getAssetDir(record.id);
  await ensureDir(assetDir);
  const recordPath = getAssetRecordPath(record.id);
  await fs.writeFile(recordPath, JSON.stringify(record, null, 2));
};

export const readAssetRecord = async (
  assetId: string,
): Promise<AssetRecord | null> => {
  try {
    const recordPath = getAssetRecordPath(assetId);
    const contents = await fs.readFile(recordPath, "utf-8");
    return JSON.parse(contents) as AssetRecord;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

export const listAssetRecords = async (): Promise<AssetRecord[]> => {
  const assetsRoot = path.join(getStorageRoot(), "assets");

  try {
    const entries = await fs.readdir(assetsRoot, { withFileTypes: true });
    const records = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => readAssetRecord(entry.name)),
    );

    return records
      .filter((record): record is AssetRecord => Boolean(record))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

export const updateAssetRecord = async (
  assetId: string,
  update: Partial<AssetRecord>,
): Promise<AssetRecord> => {
  const existing = await readAssetRecord(assetId);
  if (!existing) {
    throw new Error(`Asset not found: ${assetId}`);
  }

  const next: AssetRecord = {
    ...existing,
    ...update,
    id: existing.id,
    sourcePath: existing.sourcePath,
    sizeBytes: existing.sizeBytes,
    createdAt: existing.createdAt,
  };

  await writeAssetRecord(next);
  return next;
};

export const deleteAsset = async (assetId: string): Promise<void> => {
  const assetDir = getAssetDir(assetId);
  await fs.rm(assetDir, { recursive: true, force: true });
};
