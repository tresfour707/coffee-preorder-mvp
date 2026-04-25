import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { AppError } from "@/lib/app-error";

const STAFF_COOKIE_NAME = "coffee_staff_demo";
const STAFF_COOKIE_VALUE = "granted";

function getStaffDemoCode() {
  return process.env.STAFF_DEMO_CODE ?? "demo123";
}

export async function hasStaffSession() {
  const cookieStore = await cookies();
  return cookieStore.get(STAFF_COOKIE_NAME)?.value === STAFF_COOKIE_VALUE;
}

export async function requireStaffSession() {
  const granted = await hasStaffSession();

  if (!granted) {
    throw new AppError("Нужен staff-доступ.", 401);
  }
}

export async function grantStaffSession() {
  const cookieStore = await cookies();
  cookieStore.set(STAFF_COOKIE_NAME, STAFF_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearStaffSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
}

export function verifyStaffDemoCode(input: string) {
  const expected = Buffer.from(getStaffDemoCode());
  const actual = Buffer.from(input.trim());

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
