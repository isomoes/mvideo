import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const GET = async () => {
  try {
    // TODO: Implement actual render history retrieval
    // This would typically:
    // 1. Query the database for completed/failed render jobs
    // 2. Return a list of jobs with their metadata
    // 3. Include output URLs, file sizes, timestamps, etc.

    // For now, return a mock response
    const mockHistory = [
      {
        id: "render-1234567890",
        status: "completed",
        progress: 100,
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          format: "mp4",
          quality: "high",
          codec: "h264",
        },
        outputUrl: "https://example.com/renders/render-1234567890.mp4",
        outputSize: 25165824, // 24 MB
        startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        completedAt: new Date(Date.now() - 3000000).toISOString(), // 50 min ago
      },
      {
        id: "render-0987654321",
        status: "failed",
        progress: 45,
        config: {
          width: 1280,
          height: 720,
          fps: 60,
          format: "webm",
          quality: "medium",
          codec: "vp9",
        },
        error: "Insufficient memory",
        startedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        completedAt: new Date(Date.now() - 6900000).toISOString(), // 1h 55m ago
      },
    ];

    return NextResponse.json({
      type: "success",
      data: mockHistory,
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
