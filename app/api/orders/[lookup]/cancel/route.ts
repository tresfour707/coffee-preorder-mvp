import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/auth";
import { cancelOrder } from "@/lib/orders";
import { requireStaffSession } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ lookup: string }> },
) {
  try {
    const { lookup } = await context.params;
    const body = await request.json().catch(() => null);
    const actor = body?.actor === "STAFF" ? "STAFF" : "CUSTOMER";
    const viewer =
      actor === "STAFF"
        ? (await requireStaffSession(), null)
        : await requireCurrentUser();
    const order = await cancelOrder(lookup, actor, viewer?.id);

    return NextResponse.json(order);
  } catch (error) {
    return toErrorResponse(error);
  }
}
