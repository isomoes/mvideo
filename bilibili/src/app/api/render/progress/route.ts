import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        {
          type: "error",
          message: "Missing jobId parameter",
        },
        { status: 400 }
      );
    }

    // TODO: Implement actual progress tracking
    // This would typically:
    // 1. Query the render job status from a database or queue
    // 2. Check Lambda/render process progress
    // 3. Return current progress percentage and status

    // For now, return a mock response
    // In production, this would query actual render progress
    const mockProgress = Math.min(Math.random() * 100, 100);
    const mockStatus = mockProgress >= 100 ? "completed" : "rendering";

    return NextResponse.json({
      type: "success",
      data: {
        jobId,
        status: mockStatus,
        progress: mockProgress,
        ...(mockStatus === "completed" && {
          outputUrl: `https://example.com/renders/${jobId}.mp4`,
          outputSize: 15728640, // 15 MB in bytes
        }),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        type: "error",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
};
