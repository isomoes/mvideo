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
  _req: Request,
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

    const buffer = await fs.readFile(record.sourcePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getContentType(record.sourcePath),
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
