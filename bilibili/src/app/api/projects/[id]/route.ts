import { NextResponse } from "next/server";
import { ProjectSchema } from "../../../../../types/models";
import { logger } from "../../../../helpers/logger";
import {
  deleteProject,
  readProject,
  writeProject,
} from "../../../../server/project-store";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const project = await readProject(id);
    if (!project) {
      return NextResponse.json(
        { type: "error", message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ type: "success", data: project });
  } catch (error) {
    logger.reportError(error as Error, { action: "get-project" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const payload = ProjectSchema.parse(await req.json());
    const existing = await readProject(id);
    const now = new Date().toISOString();
    const next = {
      ...payload,
      id,
      createdAt: existing?.createdAt ?? payload.createdAt ?? now,
      updatedAt: now,
    };

    await writeProject(next);
    return NextResponse.json({ type: "success", data: next });
  } catch (error) {
    logger.reportError(error as Error, { action: "save-project" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    await deleteProject(id);
    return NextResponse.json({ type: "success" });
  } catch (error) {
    logger.reportError(error as Error, { action: "delete-project" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
