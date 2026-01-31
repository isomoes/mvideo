import { NextResponse } from "next/server";
import { logger } from "../../../../../helpers/logger";
import { listProjectFiles } from "../../../../../server/project-store";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const files = await listProjectFiles(id);
    return NextResponse.json({ type: "success", data: files });
  } catch (error) {
    logger.reportError(error as Error, { action: "list-project-files" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
