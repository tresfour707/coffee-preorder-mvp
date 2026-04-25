import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import {
  createSession,
  hashPassword,
  normalizeEmail,
} from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (name.length < 2) {
      throw new AppError("Укажите имя не короче 2 символов.", 400);
    }

    if (!email.includes("@")) {
      throw new AppError("Укажите корректный email.", 400);
    }

    if (password.length < 6) {
      throw new AppError("Пароль должен быть не короче 6 символов.", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new AppError("Аккаунт с таким email уже существует.", 409);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
