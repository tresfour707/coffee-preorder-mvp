import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/app-error";
import { normalizeEmail, requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const allowedGenders = new Set(["MALE", "FEMALE"]);

function parseOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function parseBirthDate(value: unknown) {
  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new AppError("Укажите дату рождения в корректном формате.", 400);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime())) {
    throw new AppError("Укажите дату рождения в корректном формате.", 400);
  }

  if (date.getTime() > Date.now()) {
    throw new AppError("Дата рождения не может быть в будущем.", 400);
  }

  return date;
}

export async function PATCH(request: Request) {
  try {
    const viewer = await requireCurrentUser();
    const body = await request.json().catch(() => null);

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const birthDate = parseBirthDate(body?.birthDate);
    const gender = parseOptionalString(body?.gender);
    const phone = parseOptionalString(body?.phone);

    if (name.length < 2) {
      throw new AppError("Укажите имя не короче 2 символов.", 400);
    }

    if (!email.includes("@")) {
      throw new AppError("Укажите корректный email.", 400);
    }

    if (gender && !allowedGenders.has(gender)) {
      throw new AppError("Выберите корректный пол.", 400);
    }

    if (phone && phone.length > 32) {
      throw new AppError("Телефон должен быть короче 32 символов.", 400);
    }

    if (email !== viewer.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

      if (existingUser && existingUser.id !== viewer.id) {
        throw new AppError("Аккаунт с такой почтой уже существует.", 409);
      }
    }

    const user = await prisma.user.update({
      where: {
        id: viewer.id,
      },
      data: {
        name,
        email,
        birthDate,
        gender,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        birthDate: true,
        gender: true,
        phone: true,
      },
    });

    return NextResponse.json({
      ...user,
      birthDate: user.birthDate?.toISOString() ?? null,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
