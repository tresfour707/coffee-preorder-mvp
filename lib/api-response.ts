import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);

  return NextResponse.json(
    { error: "Непредвиденная ошибка сервера." },
    { status: 500 },
  );
}
