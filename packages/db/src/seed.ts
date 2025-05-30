import { PrismaClient } from "@prisma/client";
import { products, users, orders, orderItems, reviews } from "./data.js";
import bcrypt from "bcryptjs";

export async function seed(dbUrl?: string) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl || process.env.DATABASE_URL,
      },
    },
  });

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.anonymousCartItem.deleteMany();

  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords for users
  const securedUsers = await Promise.all(
    users.map(async (user) => {
      if (user.password && !user.password.startsWith("$2a$")) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword };
      }
      return user;
    }),
  );

  for (const user of securedUsers) {
    await prisma.user.create({
      data: user,
    });
  }

  for (const product of products) {
    const { reviews, ...productData } = product;
    await prisma.product.create({
      data: productData,
    });
  }

  for (const order of orders) {
    await prisma.order.create({
      data: order,
    });
  }

  for (const item of orderItems) {
    await prisma.orderItem.create({
      data: item,
    });
  }

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  await prisma.$disconnect();
}
const isDirectExecution = process.argv[1] === import.meta.url.substring(7);

if (isDirectExecution) {
  seed().catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  });
}
