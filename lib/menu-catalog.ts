import type { MenuProductSummary } from "@/lib/types";

export type MenuCategoryDefinition = {
  name: string;
  slug: string;
  label: string;
  preview: string;
};

export type MenuCategoryEntry = {
  category: string;
  definition: MenuCategoryDefinition;
  products: MenuProductSummary[];
};

export const menuCategoryDefinitions: MenuCategoryDefinition[] = [
  {
    name: "Напитки",
    slug: "drinks",
    label: "Кофе",
    preview: "Кофе и напитки",
  },
  {
    name: "Завтрак",
    slug: "breakfast",
    label: "Завтрак",
    preview: "Утро в кофейне",
  },
  {
    name: "Холодные закуски",
    slug: "cold-snacks",
    label: "Закуски и салаты",
    preview: "Лёгкие закуски",
  },
  {
    name: "Вторые блюда",
    slug: "mains",
    label: "Горячие блюда",
    preview: "Сытные позиции",
  },
  {
    name: "Десерт",
    slug: "desserts",
    label: "Десерты и йогурт",
    preview: "Сладкое и выпечка",
  },
] as const;

export const menuCategoryOrder = menuCategoryDefinitions.map(
  (definition) => definition.name,
);

export function getMenuCategoryDefinitionByName(category: string) {
  return menuCategoryDefinitions.find((definition) => definition.name === category) ?? null;
}

export function getMenuCategoryDefinitionBySlug(slug: string) {
  return menuCategoryDefinitions.find((definition) => definition.slug === slug) ?? null;
}

export function getMenuCategoryHref(category: string) {
  const definition = getMenuCategoryDefinitionByName(category);
  return definition ? `/menu/${definition.slug}` : "/menu";
}

export function buildMenuCategoryEntries(products: MenuProductSummary[]) {
  const groups = new Map<string, MenuProductSummary[]>();

  for (const product of products) {
    const category = product.category ?? "Другое";
    groups.set(category, [...(groups.get(category) ?? []), product]);
  }

  const orderedEntries: MenuCategoryEntry[] = menuCategoryDefinitions
    .map((definition) => ({
      category: definition.name,
      definition,
      products: groups.get(definition.name) ?? [],
    }))
    .filter((entry) => entry.products.length > 0);

  return orderedEntries;
}

export function sortProductVariants(products: MenuProductSummary["variants"]) {
  return [...products].sort((left, right) => {
    const leftSort = left.sizeSort ?? Number.MAX_SAFE_INTEGER;
    const rightSort = right.sizeSort ?? Number.MAX_SAFE_INTEGER;

    return leftSort - rightSort || left.price - right.price || left.name.localeCompare(right.name, "ru");
  });
}

function getDrinkCollection(name: string) {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("айс") ||
    normalized.includes("холод") ||
    normalized.includes("лимонад") ||
    normalized.includes("тоник") ||
    normalized.includes("бамбл")
  ) {
    return "Холодные";
  }

  if (
    normalized.includes("чай") ||
    normalized.includes("улун") ||
    normalized.includes("ассам") ||
    normalized.includes("эрл") ||
    normalized.includes("пуэр") ||
    normalized.includes("те гуанинь") ||
    normalized.includes("моли")
  ) {
    return "Чай";
  }

  if (
    normalized.includes("эспрессо") ||
    normalized.includes("американо") ||
    normalized.includes("капучино") ||
    normalized.includes("латте") ||
    normalized.includes("раф") ||
    normalized.includes("флэт") ||
    normalized.includes("фильтр") ||
    normalized.includes("мокко") ||
    normalized.includes("какао")
  ) {
    return "Кофе";
  }

  return "Авторские";
}

export function getCategoryFilterChips(
  category: string,
  products: MenuProductSummary[],
) {
  if (category !== "Напитки") {
    return ["Все"];
  }

  const order = ["Кофе", "Холодные", "Чай", "Авторские"] as const;
  const present = new Set<(typeof order)[number]>(
    products.map((product) => getDrinkCollection(product.name)),
  );

  return ["Все", ...order.filter((item) => present.has(item))];
}

export function matchesCategoryFilter(
  product: MenuProductSummary,
  category: string,
  filter: string,
) {
  if (filter === "Все") {
    return true;
  }

  if (category !== "Напитки") {
    return true;
  }

  return getDrinkCollection(product.name) === filter;
}
