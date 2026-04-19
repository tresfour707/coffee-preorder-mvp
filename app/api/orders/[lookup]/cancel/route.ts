import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { cancelOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ lookup: string }> },
) {
  try {
    const { lookup } = await context.params;
    const body = await request.json().catch(() => null);
    const actor = body?.actor === "STAFF" ? "STAFF" : "CUSTOMER";
    const order = await cancelOrder(lookup, actor);

    return NextResponse.json(order);
  } catch (error) {
    return toErrorResponse(error);
  }
}
