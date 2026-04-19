import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { createOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await createOrder({
      source: "ONLINE",
      items: Array.isArray(body?.items) ? body.items : [],
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
