import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { createOfflineOrder } from "@/lib/orders";
import { requireStaffSession } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireStaffSession();
    const body = await request.json();
    const order = await createOfflineOrder({
      items: Array.isArray(body?.items) ? body.items : [],
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
