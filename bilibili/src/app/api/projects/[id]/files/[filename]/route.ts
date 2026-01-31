import { NextResponse } from "next/server";
import { logger } from "../../../../../../helpers/logger";
import {
  readProjectFile,
  writeProjectFile,
  deleteProjectFile,
} from "../../../../../../server/project-store";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string; filename: string }> },
) => {
  try {
    const { id, filename } = await params;
    const fileBuffer = await readProjectFile(id, filename);

    if (!fileBuffer) {
      return NextResponse.json(
        { type: "error", message: "File not found" },
        { status: 404 },
      );
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.reportError(error as Error, { action: "get-project-file" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ id: string; filename: string }> },
) => {
  try {
    const { id, filename } = await params;
    const buffer = Buffer.from(await req.arrayBuffer());
    const filePath = await writeProjectFile(id, filename, buffer);

    return NextResponse.json({
      type: "success",
      data: { filename, path: filePath },
    });
  } catch (error) {
    logger.reportError(error as Error, { action: "write-project-file" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ id: string; filename: string }> },
) => {
  try {
    const { id, filename } = await params;
    await deleteProjectFile(id, filename);
    return NextResponse.json({ type: "success" });
  } catch (error) {
    logger.reportError(error as Error, { action: "delete-project-file" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
