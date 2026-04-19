import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { markCurrentOrderReady } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const snapshot = await markCurrentOrderReady();
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}
