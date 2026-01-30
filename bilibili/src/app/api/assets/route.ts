import { NextResponse } from "next/server";
import { listAssetRecords } from "../../../server/asset-store";

export const runtime = "nodejs";

export const GET = async () => {
  try {
    const assets = await listAssetRecords();
    return NextResponse.json({ type: "success", data: assets });
  } catch (error) {
    return NextResponse.json(
      { type: "error", message: (error as Error).message },
      { status: 500 },
    );
  }
};
