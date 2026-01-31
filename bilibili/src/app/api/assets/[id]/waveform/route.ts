import { promises as fs } from "fs";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { readAssetRecord } from "../../../../../server/asset-store";
import { logger } from "../../../../../helpers/logger";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const record = await readAssetRecord(id);

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
    logger.reportError(error as Error, { action: "asset-waveform" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
