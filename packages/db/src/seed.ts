import { PrismaClient } from "@prisma/client";
import { products, users, orders, orderItems, reviews } from "./data.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.anonymousCartItem.deleteMany();
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

  console.log("Seeding users...");
  for (const user of securedUsers) {
    await prisma.user.create({
      data: user,
    });
  }

  console.log("Seeding products...");
  for (const product of products) {
    const { reviews, ...productData } = product;
    await prisma.product.create({
      data: productData,
    });
  }

  console.log("Seeding orders...");
  for (const order of orders) {
    await prisma.order.create({
      data: order,
    });
  }

  console.log("Seeding order items...");
  for (const item of orderItems) {
    await prisma.orderItem.create({
      data: item,
    });
  }

  console.log("Seeding reviews...");
  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
