import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const menu = [
  {
    name: "Espresso",
    description: "Double shot, bold and compact.",
    price: 18000,
    category: "Coffee",
    sortOrder: 1,
  },
  {
    name: "Americano",
    description: "Espresso with hot water.",
    price: 22000,
    category: "Coffee",
    sortOrder: 2,
  },
  {
    name: "Cappuccino",
    description: "Balanced espresso with steamed milk foam.",
    price: 28000,
    category: "Coffee",
    sortOrder: 3,
  },
  {
    name: "Latte",
    description: "Smooth milk-forward espresso drink.",
    price: 32000,
    category: "Coffee",
    sortOrder: 4,
  },
  {
    name: "Flat White",
    description: "Velvety microfoam with a stronger coffee taste.",
    price: 31000,
    category: "Coffee",
    sortOrder: 5,
  },
  {
    name: "Tea",
    description: "Black tea served hot.",
    price: 17000,
    category: "Tea",
    sortOrder: 6,
  },
  {
    name: "Croissant",
    description: "Buttery laminated pastry.",
    price: 21000,
    category: "Bakery",
    sortOrder: 7,
  },
  {
    name: "Cookie",
    description: "Classic chocolate chip cookie.",
    price: 14000,
    category: "Bakery",
    sortOrder: 8,
  },
];

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
      available: true,
    })),
  });

  console.log("Seed completed with sample menu.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
