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
  projectId: string;
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

export const getProjectAssetsDir = (projectId: string): string => {
  return path.join(getStorageRoot(), "projects", projectId, "assets");
};

export const getAssetDir = (projectId: string, assetId: string): string => {
  return path.join(getProjectAssetsDir(projectId), assetId);
};

export const getAssetSourceDir = (projectId: string, assetId: string): string => {
  return path.join(getAssetDir(projectId, assetId), "source");
};

export const getAssetDerivedDir = (projectId: string, assetId: string): string => {
  return path.join(getAssetDir(projectId, assetId), "derived");
};

export const getAssetDerivedPath = (projectId: string, assetId: string, filename: string): string => {
  return path.join(getAssetDerivedDir(projectId, assetId), filename);
};

export const getAssetRecordPath = (projectId: string, assetId: string): string => {
  return path.join(getAssetDir(projectId, assetId), "asset.json");
};

export const ensureDir = async (dirPath: string): Promise<void> => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const writeAssetSource = async (
  projectId: string,
  assetId: string,
  filename: string,
  contents: Buffer,
): Promise<string> => {
  const sourceDir = getAssetSourceDir(projectId, assetId);
  await ensureDir(sourceDir);
  const sourcePath = path.join(sourceDir, filename);
  await fs.writeFile(sourcePath, contents);
  return sourcePath;
};

export const writeAssetRecord = async (record: AssetRecord): Promise<void> => {
  const assetDir = getAssetDir(record.projectId, record.id);
  await ensureDir(assetDir);
  const recordPath = getAssetRecordPath(record.projectId, record.id);
  await fs.writeFile(recordPath, JSON.stringify(record, null, 2));
};

export const readAssetRecord = async (
  projectId: string,
  assetId?: string,
): Promise<AssetRecord | null> => {
  try {
    if (assetId) {
      const recordPath = getAssetRecordPath(projectId, assetId);
      const contents = await fs.readFile(recordPath, "utf-8");
      return JSON.parse(contents) as AssetRecord;
    }

    // If only one argument is provided, treat it as assetId and search all projects
    const assetIdToFind = projectId;
    const storageRoot = getStorageRoot();
    const projectsRoot = path.join(storageRoot, "projects");
    
    const projectEntries = await fs.readdir(projectsRoot, { withFileTypes: true });
    for (const entry of projectEntries) {
      if (entry.isDirectory()) {
        const recordPath = getAssetRecordPath(entry.name, assetIdToFind);
        try {
          const contents = await fs.readFile(recordPath, "utf-8");
          return JSON.parse(contents) as AssetRecord;
        } catch (e) {
          // Skip if not found in this project
          continue;
        }
      }
    }
    
    return null;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

export const listAssetRecords = async (projectId?: string): Promise<AssetRecord[]> => {
  const storageRoot = getStorageRoot();
  const projectsRoot = path.join(storageRoot, "projects");

  try {
    if (projectId) {
      const assetsRoot = getProjectAssetsDir(projectId);
      const entries = await fs.readdir(assetsRoot, { withFileTypes: true });
      const records = await Promise.all(
        entries
          .filter((entry) => entry.isDirectory())
          .map(async (entry) => readAssetRecord(projectId, entry.name)),
      );

      return records
        .filter((record): record is AssetRecord => Boolean(record))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    // List all assets from all projects
    const projectEntries = await fs.readdir(projectsRoot, { withFileTypes: true });
    const allRecords: AssetRecord[] = [];
    
    for (const entry of projectEntries) {
      if (entry.isDirectory()) {
        const projectAssets = await listAssetRecords(entry.name);
        allRecords.push(...projectAssets);
      }
    }

    return allRecords.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

export const updateAssetRecord = async (
  projectId: string,
  assetIdOrUpdate: string | Partial<AssetRecord>,
  maybeUpdate?: Partial<AssetRecord>,
): Promise<AssetRecord> => {
  let actualProjectId = projectId;
  let actualAssetId: string;
  let update: Partial<AssetRecord>;

  if (typeof assetIdOrUpdate === "string") {
    actualAssetId = assetIdOrUpdate;
    update = maybeUpdate!;
  } else {
    // If second arg is the update object, first arg must be assetId
    const record = await readAssetRecord(projectId);
    if (!record) {
      throw new Error(`Asset not found: ${projectId}`);
    }
    actualProjectId = record.projectId;
    actualAssetId = record.id;
    update = assetIdOrUpdate;
  }

  const existing = await readAssetRecord(actualProjectId, actualAssetId);
  if (!existing) {
    throw new Error(`Asset not found: ${actualAssetId}`);
  }

  const next: AssetRecord = {
    ...existing,
    ...update,
    id: existing.id,
    projectId: existing.projectId,
    sourcePath: existing.sourcePath,
    sizeBytes: existing.sizeBytes,
    createdAt: existing.createdAt,
  };

  await writeAssetRecord(next);
  return next;
};

export const deleteAsset = async (projectId: string, assetId?: string): Promise<void> => {
  let actualProjectId = projectId;
  let actualAssetId = assetId;

  if (!actualAssetId) {
    const record = await readAssetRecord(projectId);
    if (!record) return; // Already gone or not found
    actualProjectId = record.projectId;
    actualAssetId = record.id;
  }

  const assetDir = getAssetDir(actualProjectId, actualAssetId);
  await fs.rm(assetDir, { recursive: true, force: true });
};
