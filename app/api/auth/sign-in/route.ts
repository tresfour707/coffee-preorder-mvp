import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import {
  createSession,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      throw new AppError("Укажите email и пароль.", 400);
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new AppError("Неверный email или пароль.", 401);
    }

    await createSession(user.id);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
