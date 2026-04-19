import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { getQueueSnapshot } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getQueueSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}
