import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { readAssetRecord } from "../../../../../../../server/asset-store";
import { logger } from "../../../../../../../helpers/logger";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> },
) => {
  try {
    const { id: projectId, assetId } = await params;
    const record = await readAssetRecord(projectId, assetId);

    if (!record?.derived?.waveformPath) {
      return NextResponse.json(
        { type: "error", message: "Waveform not found" },
        { status: 404 },
      );
    }

    const payload = await fs.readFile(record.derived.waveformPath, "utf-8");
    return new NextResponse(payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.reportError(error as Error, { 
      action: "asset-waveform",
      projectId: (await params).id,
      assetId: (await params).assetId
    });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
