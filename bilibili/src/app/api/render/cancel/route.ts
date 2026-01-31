import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        {
          type: "error",
          message: "Missing jobId in request body",
        },
        { status: 400 }
      );
    }

    // TODO: Implement actual render cancellation
    // This would typically:
    // 1. Find the render job in the queue/database
    // 2. Stop the Lambda function or render process
    // 3. Clean up any temporary files
    // 4. Update job status to "cancelled"

    // For now, return a mock response
    return NextResponse.json({
      type: "success",
      data: {
        jobId,
        status: "cancelled",
        message: "Render job cancelled successfully",
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
