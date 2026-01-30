import { promises as fs } from "fs";
import path from "path";
import { randomUUID, createHash } from "crypto";
import {
  buildNormalizeAudioCommand,
  buildProxyCommand,
  buildTrimCommand,
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
  getAssetDerivedPath,
  getCacheEntryDir,
  getCacheEntryPath,
  getCacheRoot,
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

const computeProxyWidth = (sourceWidth: number | null): number => {
  const width = sourceWidth ?? 1280;
  const scaled = Math.round(width / 2);
  const clamped = Math.min(960, Math.max(480, scaled));
  return clamped % 2 === 0 ? clamped : clamped - 1;
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

const hashBuffer = (buffer: Buffer): string => {
  return createHash("sha256").update(buffer).digest("hex");
};

const hashString = (value: string): string => {
  return createHash("sha256").update(value).digest("hex");
};

const buildDerivedPaths = (baseDir: string) => {
  return {
    trimmedPath: path.join(baseDir, "trimmed.mp4"),
    normalizedAudioPath: path.join(baseDir, "normalized.wav"),
    proxyPath: path.join(baseDir, "proxy.mp4"),
    waveformPath: path.join(baseDir, "waveform.json"),
    thumbnailsDir: path.join(baseDir, "thumbnails"),
  };
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return false;
    }
    throw error;
  }
};

const listThumbnailPaths = async (thumbnailsDir: string): Promise<string[]> => {
  const entries = await fs.readdir(thumbnailsDir);
  return entries
    .filter((entry) => entry.toLowerCase().endsWith(".jpg"))
    .map((entry) => path.join(thumbnailsDir, entry))
    .sort();
};

const cacheIsComplete = async (paths: {
  trimmedPath: string;
  normalizedAudioPath: string;
  proxyPath: string;
  waveformPath: string;
  thumbnailsDir: string;
}): Promise<boolean> => {
  const [trimmed, normalized, proxy, waveform, thumbsDirExists] =
    await Promise.all([
      fileExists(paths.trimmedPath),
      fileExists(paths.normalizedAudioPath),
      fileExists(paths.proxyPath),
      fileExists(paths.waveformPath),
      fileExists(paths.thumbnailsDir),
    ]);

  if (!trimmed || !normalized || !proxy || !waveform || !thumbsDirExists) {
    return false;
  }

  const thumbnails = await listThumbnailPaths(paths.thumbnailsDir);
  return thumbnails.length > 0;
};

const copyDerivedAssets = async (from: ReturnType<typeof buildDerivedPaths>, to: ReturnType<typeof buildDerivedPaths>): Promise<void> => {
  await ensureDir(path.dirname(to.trimmedPath));
  await Promise.all([
    fs.copyFile(from.trimmedPath, to.trimmedPath),
    fs.copyFile(from.normalizedAudioPath, to.normalizedAudioPath),
    fs.copyFile(from.proxyPath, to.proxyPath),
    fs.copyFile(from.waveformPath, to.waveformPath),
  ]);
  await fs.cp(from.thumbnailsDir, to.thumbnailsDir, { recursive: true });
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
  sourceHash: string,
): Promise<DerivedAssetRecord> => {
  const derivedDir = getAssetDerivedDir(record.id);
  await ensureDir(derivedDir);

  const derivedPaths = buildDerivedPaths(derivedDir);
  const proxyWidth = computeProxyWidth(record.metadata.width);
  const thumbnailCount = computeThumbnailCount(record.metadata.durationSeconds);
  const waveformPoints = computeWaveformPoints(record.metadata.durationSeconds);
  const waveformSampleRate = record.metadata.audioTracks[0]?.sampleRate ?? 44100;

  const processingProfile = {
    trimStart: 0,
    proxyWidth,
    fps: record.metadata.fps ?? null,
    targetLufs: -16,
    truePeak: -1.5,
    loudnessRange: 11,
    thumbnailCount,
    waveformPoints,
    waveformSampleRate,
    version: 1,
  };
  const cacheKey = hashString(`${sourceHash}:${JSON.stringify(processingProfile)}`);
  const cacheDir = getCacheEntryDir(cacheKey);
  const cachePaths = buildDerivedPaths(cacheDir);

  await ensureDir(getCacheRoot());

  if (await cacheIsComplete(cachePaths)) {
    await copyDerivedAssets(cachePaths, derivedPaths);
  } else {
    const trimCommand = buildTrimCommand({
      inputPath: record.sourcePath,
      outputPath: derivedPaths.trimmedPath,
      startTime: 0,
      videoCodec: "libx264",
      audioCodec: "aac",
      format: "mp4",
    });
    await runFfmpegCommand(trimCommand);

    const normalizeCommand = buildNormalizeAudioCommand({
      inputPath: derivedPaths.trimmedPath,
      outputPath: derivedPaths.normalizedAudioPath,
      format: "wav",
      targetLufs: processingProfile.targetLufs,
      truePeak: processingProfile.truePeak,
      loudnessRange: processingProfile.loudnessRange,
    });
    await runFfmpegCommand(normalizeCommand);

    const proxyCommand = buildProxyCommand({
      inputPath: derivedPaths.trimmedPath,
      outputPath: derivedPaths.proxyPath,
      width: proxyWidth,
      fps: record.metadata.fps ?? undefined,
      videoBitrate: "1800k",
      audioBitrate: "128k",
      format: "mp4",
    });
    proxyCommand.videoCodec("libx264").audioCodec("aac");
    await runFfmpegCommand(proxyCommand);

    await ensureDir(derivedPaths.thumbnailsDir);
    await generateThumbnails({
      inputPath: derivedPaths.trimmedPath,
      outputDir: derivedPaths.thumbnailsDir,
      count: thumbnailCount,
      width: 320,
    });

    await createWaveformData({
      inputPath: derivedPaths.normalizedAudioPath,
      outputPath: derivedPaths.waveformPath,
      points: waveformPoints,
      sampleRate: waveformSampleRate,
    });

    await ensureDir(cacheDir);
    await copyDerivedAssets(derivedPaths, cachePaths);
  }

  const thumbnailPaths = await listThumbnailPaths(derivedPaths.thumbnailsDir);

  return {
    trimmedVideoPath: derivedPaths.trimmedPath,
    normalizedAudioPath: derivedPaths.normalizedAudioPath,
    proxyVideoPath: derivedPaths.proxyPath,
    waveformPath: derivedPaths.waveformPath,
    thumbnailsDir: derivedPaths.thumbnailsDir,
    thumbnailPaths,
    cacheKey,
    links: {
      sourcePath: record.sourcePath,
      trimmedVideoPath: derivedPaths.trimmedPath,
      proxyVideoPath: derivedPaths.proxyPath,
    },
  };
};

export const ingestUploadedFile = async (file: File): Promise<AssetRecord> => {
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
};
