import ffmpeg, {
  FfmpegCommand,
  FfprobeData,
  FfmpegProgress,
} from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

const ffmpegPath = ffmpegInstaller?.path;
const ffprobePath = ffprobeInstaller?.path;

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

if (ffprobePath) {
  ffmpeg.setFfprobePath(ffprobePath);
}

export class FfmpegCommandError extends Error {
  public readonly command?: string;
  public readonly stdout?: string;
  public readonly stderr?: string;

  constructor(
    message: string,
    details: {
      command?: string;
      stdout?: string;
      stderr?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: details.cause });
    this.name = "FfmpegCommandError";
    this.command = details.command;
    this.stdout = details.stdout;
    this.stderr = details.stderr;
  }
}

export type TrimOptions = {
  inputPath: string;
  outputPath: string;
  startTime: number | string;
  duration?: number | string;
  videoCodec?: string;
  audioCodec?: string;
  format?: string;
};

export type NormalizeAudioOptions = {
  inputPath: string;
  outputPath: string;
  targetLufs?: number;
  truePeak?: number;
  loudnessRange?: number;
  format?: string;
};

export type ProxyOptions = {
  inputPath: string;
  outputPath: string;
  width: number;
  height?: number;
  fps?: number;
  videoBitrate?: string;
  audioBitrate?: string;
  format?: string;
};

export type CommandHandlers = {
  onStart?: (command: string) => void;
  onProgress?: (progress: FfmpegProgress) => void;
};

export const buildTrimCommand = (options: TrimOptions): FfmpegCommand => {
  const command = ffmpeg(options.inputPath).output(options.outputPath);

  command.setStartTime(options.startTime);

  if (options.duration !== undefined) {
    command.setDuration(options.duration);
  }

  if (options.videoCodec) {
    command.videoCodec(options.videoCodec);
  }

  if (options.audioCodec) {
    command.audioCodec(options.audioCodec);
  }

  if (options.format) {
    command.format(options.format);
  }

  return command;
};

export const buildNormalizeAudioCommand = (
  options: NormalizeAudioOptions,
): FfmpegCommand => {
  const targetLufs = options.targetLufs ?? -16;
  const truePeak = options.truePeak ?? -1.5;
  const loudnessRange = options.loudnessRange ?? 11;
  const filter = `loudnorm=I=${targetLufs}:TP=${truePeak}:LRA=${loudnessRange}`;

  const command = ffmpeg(options.inputPath)
    .audioFilters(filter)
    .noVideo()
    .output(options.outputPath);

  if (options.format) {
    command.format(options.format);
  }

  return command;
};

export const buildProxyCommand = (options: ProxyOptions): FfmpegCommand => {
  const height = options.height ?? -2;
  const scaleFilter = `scale=${options.width}:${height}`;

  const command = ffmpeg(options.inputPath)
    .videoFilters(scaleFilter)
    .outputOptions(["-movflags", "faststart"])
    .output(options.outputPath);

  if (options.fps !== undefined) {
    command.fps(options.fps);
  }

  if (options.videoBitrate) {
    command.videoBitrate(options.videoBitrate);
  }

  if (options.audioBitrate) {
    command.audioBitrate(options.audioBitrate);
  }

  if (options.format) {
    command.format(options.format);
  }

  return command;
};

export const runFfmpegCommand = (
  command: FfmpegCommand,
  handlers: CommandHandlers = {},
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let lastCommand: string | undefined;

    command
      .on("start", (commandLine) => {
        lastCommand = commandLine;
        handlers.onStart?.(commandLine);
      })
      .on("progress", (progress) => {
        handlers.onProgress?.(progress);
      })
      .on("error", (error, stdout, stderr) => {
        reject(
          new FfmpegCommandError("FFmpeg command failed", {
            command: lastCommand,
            stdout,
            stderr,
            cause: error,
          }),
        );
      })
      .on("end", () => resolve())
      .run();
  });
};

export const probeMedia = (inputPath: string): Promise<FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (error, data) => {
      if (error) {
        reject(
          new FfmpegCommandError("FFprobe failed", {
            cause: error,
          }),
        );
        return;
      }

      resolve(data);
    });
  });
};

const checkFfmpegAvailability = async (): Promise<void> => {
  if (!ffmpegPath) {
    throw new FfmpegCommandError("FFmpeg binary not found");
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg.getAvailableFormats((error) => {
      if (error) {
        reject(new FfmpegCommandError("FFmpeg is not available", { cause: error }));
        return;
      }

      resolve();
    });
  });
};

export const ensureFfmpegAvailable = (): Promise<void> => {
  const globalScope = globalThis as typeof globalThis & {
    __ffmpegAvailabilityPromise?: Promise<void>;
  };

  if (!globalScope.__ffmpegAvailabilityPromise) {
    globalScope.__ffmpegAvailabilityPromise = checkFfmpegAvailability();
  }

  return globalScope.__ffmpegAvailabilityPromise;
};
