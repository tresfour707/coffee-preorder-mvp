import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import { requireCurrentUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { resolveDemoPayment } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ paymentId: string }> },
) {
  try {
    const viewer = await requireCurrentUser();
    const { paymentId } = await context.params;
    const body = await request.json().catch(() => null);
    const result =
      body?.result === "SUCCESS" || body?.result === "FAIL" || body?.result === "CANCEL"
        ? body.result
        : null;

    if (!result) {
      throw new AppError("Неизвестный результат demo payment.", 400);
    }

    const resolution = await resolveDemoPayment(paymentId, viewer.id, result);
    return NextResponse.json(resolution);
  } catch (error) {
    return toErrorResponse(error);
  }
}
