import { promises as fs } from "fs";
import path from "path";
import { randomUUID, createHash } from "crypto";
import { logger } from "../helpers/logger";
import {
  ensureFfmpegAvailable,
  generateThumbnails,
  probeMedia,
} from "./ffmpeg";
import {
  AssetRecord,
  DerivedAssetRecord,
  MediaMetadata,
  ensureDir,
  getAssetDerivedDir,
  writeAssetRecord,
  writeAssetSource,
} from "./asset-store";

const parseFraction = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const [numerator, denominator] = value.split("/").map((part) => Number(part));
  if (!numerator || !denominator) {
    return null;
  }

  return numerator / denominator;
};

const sanitizeFilename = (filename: string): string => {
  const base = path.basename(filename).trim();
  if (!base) {
    return "source";
  }

  return base.replaceAll(/[\\/]/g, "_");
};

const extractMetadata = async (sourcePath: string): Promise<MediaMetadata> => {
  const data = await probeMedia(sourcePath);
  const videoStream = data.streams.find(
    (stream) => stream.codec_type === "video",
  );
  const audioStreams = data.streams.filter(
    (stream) => stream.codec_type === "audio",
  );
  const durationSeconds = data.format.duration
    ? Number(data.format.duration)
    : null;

  return {
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
    fps:
      parseFraction(videoStream?.avg_frame_rate) ??
      parseFraction(videoStream?.r_frame_rate),
    width: videoStream?.width ?? null,
    height: videoStream?.height ?? null,
    audioTracks: audioStreams.map((stream) => ({
      index: stream.index,
      codec: stream.codec_name,
      channels: stream.channels,
      sampleRate: stream.sample_rate ? Number(stream.sample_rate) : undefined,
    })),
  };
};

const computeThumbnailCount = (durationSeconds: number | null): number => {
  if (!durationSeconds || durationSeconds <= 0) {
    return 8;
  }

  return Math.min(24, Math.max(8, Math.round(durationSeconds / 5)));
};

const hashBuffer = (buffer: Buffer): string => {
  return createHash("sha256").update(buffer).digest("hex");
};

const hashString = (value: string): string => {
  return createHash("sha256").update(value).digest("hex");
};

const listThumbnailPaths = async (thumbnailsDir: string): Promise<string[]> => {
  const entries = await fs.readdir(thumbnailsDir);
  return entries
    .filter((entry) => entry.toLowerCase().endsWith(".jpg"))
    .map((entry) => path.join(thumbnailsDir, entry))
    .sort();
};

const processDerivedAssets = async (
  record: AssetRecord,
  sourceHash: string,
): Promise<DerivedAssetRecord> => {
  const derivedDir = getAssetDerivedDir(record.id);
  await ensureDir(derivedDir);

  const thumbnailCount = computeThumbnailCount(record.metadata.durationSeconds);
  const thumbnailsDir = path.join(derivedDir, "thumbnails");
  const hasVisualTrack = Boolean(record.metadata.width && record.metadata.height);

  if (hasVisualTrack) {
    await logger.trackDuration("generate-thumbnails", async () => {
      await ensureDir(thumbnailsDir);
      await generateThumbnails({
        inputPath: record.sourcePath,
        outputDir: thumbnailsDir,
        count: thumbnailCount,
        width: 320,
      });
    }, { assetId: record.id });
  }

  const thumbnailPaths = await listThumbnailPaths(thumbnailsDir).catch(() => []);
  const cacheKey = hashString(`${sourceHash}:${thumbnailCount}`);

  return {
    thumbnailsDir,
    thumbnailPaths,
    cacheKey,
    links: {
      sourcePath: record.sourcePath,
    },
  };
};

export const ingestUploadedFile = async (file: File): Promise<AssetRecord> => {
  return await logger.trackDuration("ingest-uploaded-file", async () => {
    const assetId = randomUUID();
    const originalName = sanitizeFilename(file.name || "source");
    const buffer = Buffer.from(await file.arrayBuffer());
    const sourcePath = await writeAssetSource(assetId, originalName, buffer);
    const metadata = await extractMetadata(sourcePath);
    const sourceHash = hashBuffer(buffer);

    const record: AssetRecord = {
      id: assetId,
      originalName,
      sourcePath,
      sizeBytes: buffer.byteLength,
      createdAt: new Date().toISOString(),
      metadata,
    };

    await ensureFfmpegAvailable();
    const derived = await processDerivedAssets(record, sourceHash);
    const updatedRecord = { ...record, derived };

    await writeAssetRecord(updatedRecord);
    return updatedRecord;
  }, { fileName: file.name });
};
