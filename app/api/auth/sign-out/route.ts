import { NextResponse } from "next/server";

import { destroyCurrentSession } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await destroyCurrentSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
