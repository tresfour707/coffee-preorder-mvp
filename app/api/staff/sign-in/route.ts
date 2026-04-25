import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import { toErrorResponse } from "@/lib/api-response";
import { grantStaffSession, verifyStaffDemoCode } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code : "";

    if (!verifyStaffDemoCode(code)) {
      throw new AppError("Неверный demo-код staff доступа.", 401);
    }

    await grantStaffSession();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
