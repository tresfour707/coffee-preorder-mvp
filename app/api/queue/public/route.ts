import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { getPublicQueueSummary } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getPublicQueueSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return toErrorResponse(error);
  }
}
