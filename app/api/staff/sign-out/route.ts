import { NextResponse } from "next/server";

import { clearStaffSession } from "@/lib/staff-auth";
import { toErrorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearStaffSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
