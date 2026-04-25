import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { createDemoPayment } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const viewer = await requireCurrentUser();
    const body = await request.json().catch(() => null);
    const payment = await createDemoPayment({
      userId: viewer.id,
      customerName: viewer.name,
      customerEmail: viewer.email,
      method: body?.method === "DEMO_SBP" ? "DEMO_SBP" : "DEMO_CARD",
      items: Array.isArray(body?.items) ? body.items : [],
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
