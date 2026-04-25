import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import { toErrorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(_request: Request) {
  try {
    throw new AppError(
      "Прямое создание онлайн-заказа отключено. Используйте оформление и демо-оплату.",
      410,
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
