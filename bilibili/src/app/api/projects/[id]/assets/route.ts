import { NextResponse } from "next/server";
import { listAssetRecords } from "../../../../../server/asset-store";
import { logger } from "../../../../../helpers/logger";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id: projectId } = await params;
    const assets = await listAssetRecords(projectId);
    return NextResponse.json({ type: "success", data: assets });
  } catch (error) {
    logger.reportError(error as Error, { action: "list-project-assets" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
