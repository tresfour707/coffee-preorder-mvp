import { PrismaClient, ProductKind } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  description?: string | null;
  price: number;
  category: string;
  kind: ProductKind;
  groupKey?: string | null;
  sizeLabel?: string | null;
  sizeSort?: number | null;
  sortOrder: number;
};

const menu: SeedProduct[] = [];
let sortOrder = 1;

function addFood(category: string, name: string, priceRub: number) {
  menu.push({
    name,
    price: priceRub * 100,
    category,
    kind: ProductKind.FOOD,
    sortOrder,
  });

  sortOrder += 1;
}

function addFoodItems(
  category: string,
  items: ReadonlyArray<readonly [string, number]>,
) {
  items.forEach(([name, price]) => addFood(category, name, price));
}

function addDrink(
  groupKey: string,
  name: string,
  sizes: Array<{ label: string; priceRub: number }>,
) {
  sizes.forEach((size, index) => {
    menu.push({
      name,
      price: size.priceRub * 100,
      category: "Напитки",
      kind: ProductKind.DRINK,
      groupKey,
      sizeLabel: size.label,
      sizeSort: index + 1,
      sortOrder,
    });
  });

  sortOrder += 1;
}

function addSingleDrink(groupKey: string, name: string, priceRub: number) {
  menu.push({
    name,
    price: priceRub * 100,
    category: "Напитки",
    kind: ProductKind.DRINK,
    groupKey,
    sizeLabel: null,
    sizeSort: null,
    sortOrder,
  });

  sortOrder += 1;
}

addFoodItems("Завтрак", [
  ["Сырники со сметаной", 370],
  ["Блины с творогом и бананом", 350],
  ["Блины с ветчиной и сыром", 380],
  ["Блины с мясом и сметаной", 390],
  ["Блины с курицей и грибами", 380],
  ["Азиатский завтрак с креветками", 560],
  ["Английский завтрак с колбаской", 560],
]);

addFoodItems("Холодные закуски", [
  ['Чиабатта "Цезарь"', 370],
  ["Чиабатта с моцареллой и томатами", 390],
  ['Ролл "Цезарь" с курицей', 385],
  ['Ролл с лососем под соусом "Тартар"', 465],
  ["Круассан с ветчиной и сыром", 445],
  ["Круассан со слабосоленым лососем", 495],
  ["Сэндвич с индейкой", 375],
  ["Сэндвич с курицей по-тайски", 375],
  ["Спринг-ролл с креветками", 545],
  ['Салат "Цезарь" с цыпленком', 485],
  ['Салат "Цезарь" с креветками', 545],
]);

addFoodItems("Вторые блюда", [
  ["Шашлычок куриный с картофелем", 495],
  ["Пожарская котлета с пюре", 495],
  ["Паста с песто и курицей", 495],
  ["Шницель куриный с грибами, пюре и сыром", 495],
  ["Жареный рис с креветками", 545],
  ["Жареный рис с курицей", 525],
  ["Жареная лапша с курицей", 525],
]);

addFoodItems("Десерт", [
  ["Ватрушка с творогом", 130],
  ["Дениш с малиной", 320],
  ["Ириска с гималайской солью", 120],
  ["Ириска сливочная", 120],
  ["Кекс лимонный", 200],
  ["Кекс шоколадный", 200],
  ["Классический круассан", 200],
  ["Круассан с лавандой и черникой", 310],
  ["Кукис овсяный с изюмом", 140],
  ["Кукис с молочным шоколадом", 160],
  ["Кукис шоколадный с апельсином", 140],
  ["Миндальный круассан", 310],
  ["Плетенка с маком", 170],
  ['Пирожное "Медовик"', 300],
  ["Пирожное Наполеон", 310],
  ["Пирожное Шу", 210],
  ["Синнабон", 190],
  ["Сочник с творогом", 130],
  ["Тирамису", 310],
  ["Трубочка со сгущёнкой", 240],
  ["Улитка с маком", 150],
  ["Улитка с изюмом", 150],
  ["Улитка с корицей и карамелью", 210],
  ['Чиа-пудинг "Кокос-малина"', 310],
  ['Чиа-пудинг "Манго-кокос"', 310],
  ["Шоколадный круассан", 300],
]);

addDrink("cappuccino", "Капучино", [
  { label: "250 мл", priceRub: 260 },
  { label: "350 мл", priceRub: 320 },
  { label: "450 мл", priceRub: 370 },
]);
addDrink("latte", "Латте", [
  { label: "350 мл", priceRub: 320 },
  { label: "450 мл", priceRub: 370 },
]);
addDrink("raf", "Раф-кофе", [
  { label: "250 мл", priceRub: 330 },
  { label: "350 мл", priceRub: 380 },
  { label: "450 мл", priceRub: 420 },
]);
addSingleDrink("flat-white", "Флэт Уайт", 290);
addDrink("americano", "Американо", [
  { label: "350 мл", priceRub: 270 },
  { label: "450 мл", priceRub: 320 },
]);
addDrink("filter-coffee", "Фильтр-кофе", [
  { label: "250 мл", priceRub: 260 },
  { label: "350 мл", priceRub: 300 },
  { label: "450 мл", priceRub: 340 },
]);
addSingleDrink("espresso", "Эспрессо", 220);
addDrink("cacao", "Какао", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("matcha-latte", "Маття-латте", [
  { label: "350 мл", priceRub: 330 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("orange-feijoa", "Лимонад апельсин-фейхоа", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 390 },
]);
addDrink("cherry-basil-tonic", "Тоник вишня-базилик", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 390 },
]);
addDrink("oolong-grapefruit", "Пряный улун с грейпфрутом", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 390 },
]);
addDrink("matcha-caramel-popcorn", "Матча карамельный попкорн", [
  { label: "350 мл", priceRub: 390 },
  { label: "450 мл", priceRub: 460 },
]);
addDrink("rum-irish-cream", "Капучино ром и ирландский крем", [
  { label: "350 мл", priceRub: 360 },
  { label: "450 мл", priceRub: 430 },
]);
addDrink("spicy-mocha", "Мокко пряный маршмеллоу", [
  { label: "350 мл", priceRub: 360 },
  { label: "450 мл", priceRub: 430 },
]);
addDrink("peanut-raf", "Арахисовый Раф", [
  { label: "350 мл", priceRub: 380 },
  { label: "450 мл", priceRub: 420 },
]);
addDrink("pomegranate-glintwein", "Гранатовый Глинтвейн", [
  { label: "350 мл", priceRub: 320 },
  { label: "450 мл", priceRub: 360 },
]);
addDrink("pumpkin-latte", "Тыквенный Латте", [
  { label: "350 мл", priceRub: 320 },
  { label: "450 мл", priceRub: 360 },
]);
addDrink("cold-cacao-refeel", "Холодный какао re-feel", [
  { label: "350 мл", priceRub: 390 },
  { label: "450 мл", priceRub: 420 },
]);
addDrink("matcha-refeel", "Матча-латте re-feel", [
  { label: "350 мл", priceRub: 390 },
  { label: "450 мл", priceRub: 420 },
]);
addDrink("grapefruit-elder", "Грейпфрут-бузина", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("pear-tea", "Грушевый чай", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("blackcurrant-mint", "Смородина-мята", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("sea-buckthorn-ginger", "Облепиха-имбирь", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("cranberry-juniper", "Клюква-можжевельник", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("berry-mix", "Ягодный микс", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("tea-assam", "Чай Ассам", [
  { label: "350 мл", priceRub: 250 },
  { label: "450 мл", priceRub: 270 },
]);
addDrink("tea-shu-puer", "Чай Шу Пуэр", [
  { label: "350 мл", priceRub: 250 },
  { label: "450 мл", priceRub: 270 },
]);
addDrink("tea-earl-grey", "Чай Эрл Грей", [
  { label: "350 мл", priceRub: 250 },
  { label: "450 мл", priceRub: 270 },
]);
addDrink("tea-herbal", "Чай травяной", [
  { label: "350 мл", priceRub: 250 },
  { label: "450 мл", priceRub: 270 },
]);
addDrink("tea-moli-hua-cha", "Чай Моли Хуа Ча", [
  { label: "350 мл", priceRub: 250 },
  { label: "450 мл", priceRub: 270 },
]);
addDrink("tea-te-guanin", "Чай Те Гуанинь", [
  { label: "350 мл", priceRub: 250 },
  { label: "450 мл", priceRub: 270 },
]);
addFood("Напитки", "Стакан средний", 10);
addDrink("iced-latte", "Айс Латте", [
  { label: "350 мл", priceRub: 320 },
  { label: "450 мл", priceRub: 370 },
]);
addDrink("orange-bumble", "Апельсиновый Бамбл", [
  { label: "350 мл", priceRub: 450 },
  { label: "450 мл", priceRub: 490 },
]);
addDrink("matcha-tonic", "Маття-тоник", [
  { label: "350 мл", priceRub: 350 },
  { label: "450 мл", priceRub: 390 },
]);
addDrink("espresso-tonic", "Эспрессо-тоник", [
  { label: "350 мл", priceRub: 320 },
  { label: "450 мл", priceRub: 390 },
]);
addDrink("iced-cacao", "Айс Какао", [
  { label: "350 мл", priceRub: 340 },
  { label: "450 мл", priceRub: 380 },
]);
addDrink("cold-raf", "Холодный раф", [
  { label: "350 мл", priceRub: 380 },
  { label: "450 мл", priceRub: 420 },
]);
addDrink("sameri-shu", "Самери Шу", [
  { label: "350 мл", priceRub: 330 },
  { label: "450 мл", priceRub: 370 },
]);

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: menu.map((item) => ({
      ...item,
      description: item.description ?? null,
      available: true,
      groupKey: item.groupKey ?? null,
      sizeLabel: item.sizeLabel ?? null,
      sizeSort: item.sizeSort ?? null,
    })),
  });

  console.log(`Seed completed with ${menu.length} menu positions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
