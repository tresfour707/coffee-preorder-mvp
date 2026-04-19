import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import { toErrorResponse } from "@/lib/api-response";
import { getOrderDetails } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ lookup: string }> },
) {
  try {
    const { lookup } = await context.params;
    const order = await getOrderDetails(lookup);

    if (!order) {
      throw new AppError("Заказ не найден.", 404);
    }

    return NextResponse.json(order);
  } catch (error) {
    return toErrorResponse(error);
  }
}
