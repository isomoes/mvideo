import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { logger } from "../helpers/logger";
import {
  buildWaveformCommand,
  ensureFfmpegAvailable,
  generateThumbnails,
  probeMedia,
  runFfmpegCommand,
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

const computeWaveformPoints = (durationSeconds: number | null): number => {
  if (!durationSeconds || durationSeconds <= 0) {
    return 800;
  }

  return Math.min(2000, Math.max(600, Math.round(durationSeconds * 40)));
};

const listThumbnailPaths = async (thumbnailsDir: string): Promise<string[]> => {
  try {
    const entries = await fs.readdir(thumbnailsDir);
    return entries
      .filter((entry) => entry.toLowerCase().endsWith(".jpg"))
      .map((entry) => path.join(thumbnailsDir, entry))
      .sort();
  } catch {
    return [];
  }
};

const createWaveformData = async (options: {
  inputPath: string;
  outputPath: string;
  points: number;
  sampleRate: number;
}): Promise<void> => {
  const rawPath = options.outputPath.replace(/\.json$/, ".pcm");
  const waveformCommand = buildWaveformCommand({
    inputPath: options.inputPath,
    outputPath: rawPath,
    sampleRate: options.sampleRate,
    channels: 1,
    format: "s16le",
  });

  await runFfmpegCommand(waveformCommand);

  const buffer = await fs.readFile(rawPath);
  const samples = new Int16Array(
    buffer.buffer,
    buffer.byteOffset,
    Math.floor(buffer.byteLength / 2),
  );

  const bucketCount = samples.length
    ? Math.min(options.points, samples.length)
    : 0;
  const bucketSize = bucketCount
    ? Math.max(1, Math.floor(samples.length / bucketCount))
    : 0;
  const peaks: number[] = [];

  for (let bucket = 0; bucket < bucketCount; bucket += 1) {
    const start = bucket * bucketSize;
    const end = Math.min(samples.length, start + bucketSize);
    let max = 0;
    for (let i = start; i < end; i += 1) {
      const value = Math.abs(samples[i] ?? 0);
      if (value > max) {
        max = value;
      }
    }
    peaks.push(max / 32768);
  }

  const waveformPayload = {
    sampleRate: options.sampleRate,
    points: peaks.length,
    peaks,
  };

  await fs.writeFile(options.outputPath, JSON.stringify(waveformPayload, null, 2));
  await fs.unlink(rawPath).catch(() => undefined);
};

const processDerivedAssets = async (
  record: AssetRecord,
): Promise<DerivedAssetRecord> => {
  const derivedDir = getAssetDerivedDir(record.projectId, record.id);
  await ensureDir(derivedDir);

  const waveformPath = path.join(derivedDir, "waveform.json");
  const thumbnailsDir = path.join(derivedDir, "thumbnails");

  const thumbnailCount = computeThumbnailCount(record.metadata.durationSeconds);
  const waveformPoints = computeWaveformPoints(record.metadata.durationSeconds);
  const waveformSampleRate = record.metadata.audioTracks[0]?.sampleRate ?? 44100;

  logger.info("Processing derived assets", { assetId: record.id });

  await logger.trackDuration("generate-thumbnails", async () => {
    await ensureDir(thumbnailsDir);
    await generateThumbnails({
      inputPath: record.sourcePath,
      outputDir: thumbnailsDir,
      count: thumbnailCount,
      width: 320,
    });
  }, { assetId: record.id });

  await logger.trackDuration("create-waveform", async () => {
    await createWaveformData({
      inputPath: record.sourcePath,
      outputPath: waveformPath,
      points: waveformPoints,
      sampleRate: waveformSampleRate,
    });
  }, { assetId: record.id });

  const thumbnailPaths = await listThumbnailPaths(thumbnailsDir);

  return {
    waveformPath,
    thumbnailsDir,
    thumbnailPaths,
    links: {
      sourcePath: record.sourcePath,
    },
  };
};

export const ingestUploadedFile = async (
  projectIdOrFile: string | File,
  maybeFile?: File,
): Promise<AssetRecord> => {
  let projectId: string;
  let file: File;

  if (typeof projectIdOrFile === "string") {
    projectId = projectIdOrFile;
    file = maybeFile!;
  } else {
    projectId = "global";
    file = projectIdOrFile;
  }

  return await logger.trackDuration("ingest-uploaded-file", async () => {
    const assetId = randomUUID();
    const originalName = sanitizeFilename(file.name || "source");
    const buffer = Buffer.from(await file.arrayBuffer());
    const sourcePath = await writeAssetSource(projectId, assetId, originalName, buffer);
    const metadata = await extractMetadata(sourcePath);

    const record: AssetRecord = {
      id: assetId,
      projectId,
      originalName,
      sourcePath,
      sizeBytes: buffer.byteLength,
      createdAt: new Date().toISOString(),
      metadata,
    };

    await ensureFfmpegAvailable();
    const derived = await processDerivedAssets(record);
    const updatedRecord = { ...record, derived };

    await writeAssetRecord(updatedRecord);
    return updatedRecord;
  }, { fileName: file.name, projectId });
};
