import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { readAssetRecord } from "../../../../../../../server/asset-store";
import { logger } from "../../../../../../../helpers/logger";

export const runtime = "nodejs";

const getContentType = (filePath: string) => {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".aac":
      return "audio/aac";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
};

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> },
) => {
  try {
    const { id: projectId, assetId } = await params;
    const record = await readAssetRecord(projectId, assetId);
    if (!record) {
      return NextResponse.json(
        { type: "error", message: "Asset not found" },
        { status: 404 },
      );
    }

    const stats = await fs.stat(record.sourcePath);
    const fileSize = stats.size;
    const contentType = getContentType(record.sourcePath);

    // Handle range requests for video seeking
    const range = req.headers.get("range");
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileHandle = await fs.open(record.sourcePath, "r");
      const buffer = Buffer.alloc(chunkSize);
      await fileHandle.read(buffer, 0, chunkSize, start);
      await fileHandle.close();

      return new NextResponse(buffer, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Full file response
    const buffer = await fs.readFile(record.sourcePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    logger.reportError(error as Error, { 
      action: "asset-source",
      projectId: (await params).id,
      assetId: (await params).assetId
    });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
