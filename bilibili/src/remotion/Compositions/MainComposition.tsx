import { z } from "zod";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { MainCompositionProps } from "../../../types/constants";

const resolveVideoSrc = (src: string) => {
  // Handle absolute URLs (http/https)
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Handle API endpoints (starts with /)
  if (src.startsWith("/")) {
    return src;
  }

  // Handle static files in public directory
  return staticFile(src);
};

export const MainComposition = (
  props: z.infer<typeof MainCompositionProps>,
) => {
  const { videoSrc, trimStartInFrames, trimEndInFrames } = props;
  const resolvedVideoSrc = resolveVideoSrc(videoSrc);

  // Video component uses:
  // - startFrom: frame to start playing from (skip this many frames from the beginning)
  // - endAt: frame to stop playing at (absolute frame number from start of video)
  const startFrom = Math.max(0, trimStartInFrames);
  const endAt = Math.max(startFrom + 1, trimEndInFrames);

  // Check if we have a valid video source
  const hasVideo = videoSrc && videoSrc.trim() !== "";

  return (
    <AbsoluteFill className="bg-black">
      {hasVideo ? (
        <>
          <OffthreadVideo
            src={resolvedVideoSrc}
            trimBefore={startFrom}
            trimAfter={endAt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-4">🎬</div>
            <div className="text-lg">No video source</div>
            <div className="text-sm mt-2">Add a video clip to the timeline</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
