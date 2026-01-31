import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { readAssetRecord } from "../../../../../../server/asset-store";
import { logger } from "../../../../../../helpers/logger";

export const runtime = "nodejs";

const getContentType = (filePath: string) => {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
};

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string; index: string }> },
) => {
  try {
    const { id, index } = await params;
    const record = await readAssetRecord(id);
    if (!record?.derived?.thumbnailPaths?.length) {
      return NextResponse.json(
        { type: "error", message: "Thumbnails not found" },
        { status: 404 },
      );
    }

    const thumbnailIndex = Number.parseInt(index, 10);
    if (!Number.isFinite(thumbnailIndex) || thumbnailIndex < 0 || thumbnailIndex >= record.derived.thumbnailPaths.length) {
      return NextResponse.json(
        { type: "error", message: "Thumbnail index out of range" },
        { status: 400 },
      );
    }

    const thumbnailPath = record.derived.thumbnailPaths[thumbnailIndex];
    const buffer = await fs.readFile(thumbnailPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getContentType(thumbnailPath),
      },
    });
  } catch (error) {
    logger.reportError(error as Error, { action: "asset-thumbnail" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
