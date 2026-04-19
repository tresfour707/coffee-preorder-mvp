import type { CartLine, OrderRequestItem, ProductSummary } from "@/lib/types";

export function addProductToCart(lines: CartLine[], product: ProductSummary) {
  const existingLine = lines.find((line) => line.productId === product.id);

  if (existingLine) {
    return lines.map((line) =>
      line.productId === product.id
        ? { ...line, quantity: line.quantity + 1 }
        : line,
    );
  }

  return [
    ...lines,
    {
      productId: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      quantity: 1,
    },
  ];
}

export function decrementCartItem(lines: CartLine[], productId: string) {
  return lines.flatMap((line) => {
    if (line.productId !== productId) {
      return [line];
    }

    if (line.quantity <= 1) {
      return [];
    }

    return [{ ...line, quantity: line.quantity - 1 }];
  });
}

export function updateCartItemQuantity(
  lines: CartLine[],
  productId: string,
  quantity: number,
) {
  if (quantity <= 0) {
    return removeCartItem(lines, productId);
  }

  return lines.map((line) =>
    line.productId === productId ? { ...line, quantity } : line,
  );
}

export function removeCartItem(lines: CartLine[], productId: string) {
  return lines.filter((line) => line.productId !== productId);
}

export function getCartSummary(lines: CartLine[]) {
  return lines.reduce(
    (summary, line) => ({
      itemsCount: summary.itemsCount + line.quantity,
      totalPrice: summary.totalPrice + line.price * line.quantity,
    }),
    { itemsCount: 0, totalPrice: 0 },
  );
}

export function toOrderRequestItems(lines: CartLine[]): OrderRequestItem[] {
  return lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
  }));
}

export function normalizeRequestItems(items: OrderRequestItem[]) {
  const merged = new Map<string, number>();

  for (const item of items) {
    const quantity = Number(item.quantity);

    if (!item.productId || !Number.isInteger(quantity) || quantity <= 0) {
      continue;
    }

    merged.set(item.productId, (merged.get(item.productId) ?? 0) + quantity);
  }

  return Array.from(merged.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}
