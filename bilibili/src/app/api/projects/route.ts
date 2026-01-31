import { NextResponse } from "next/server";
import { ProjectSchema } from "../../../../types/models";
import { logger } from "../../../helpers/logger";
import { listProjects, writeProject } from "../../../server/project-store";

export const runtime = "nodejs";

export const GET = async () => {
  try {
    const projects = await listProjects();
    return NextResponse.json({ type: "success", data: projects });
  } catch (error) {
    logger.reportError(error as Error, { action: "list-projects" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const payload = ProjectSchema.parse(await req.json());
    const now = new Date().toISOString();
    const next = {
      ...payload,
      createdAt: payload.createdAt ?? now,
      updatedAt: now,
    };

    await writeProject(next);
    return NextResponse.json({ type: "success", data: next });
  } catch (error) {
    logger.reportError(error as Error, { action: "create-project" });
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
