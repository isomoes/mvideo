import { NextResponse } from "next/server";
import {
  deleteAsset,
  readAssetRecord,
  updateAssetRecord,
} from "../../../../server/asset-store";
import type {
  DerivedAssetRecord,
  MediaMetadata,
} from "../../../../server/asset-store";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = async (_req: Request, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const asset = await readAssetRecord(id);
    if (!asset) {
      return NextResponse.json(
        { type: "error", message: "Asset not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ type: "success", data: asset });
  } catch (error) {
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};

export const PATCH = async (req: Request, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const payload = (await req.json()) as {
      originalName?: string;
      metadata?: MediaMetadata;
      derived?: DerivedAssetRecord;
    };

    const asset = await updateAssetRecord(id, {
      originalName: payload.originalName,
      metadata: payload.metadata,
      derived: payload.derived,
    });

    return NextResponse.json({ type: "success", data: asset });
  } catch (error) {
    const message = (error as Error).message;
    const status = message.startsWith("Asset not found") ? 404 : 500;
    return NextResponse.json({ type: "error", message }, { status });
  }
};

export const DELETE = async (_req: Request, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteAsset(id);
    return NextResponse.json({ type: "success" });
  } catch (error) {
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
