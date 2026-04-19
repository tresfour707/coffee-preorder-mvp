import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-response";
import { getAvailableProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getAvailableProducts();
    return NextResponse.json(products);
  } catch (error) {
    return toErrorResponse(error);
  }
}
