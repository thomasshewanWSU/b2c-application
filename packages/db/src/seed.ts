import { PrismaClient } from "@prisma/client";
import { products, users, orders, orderItems } from "./data.js";
import bcrypt from "bcryptjs"; // Add this import

// Import the hashPassword utility
const prisma = new PrismaClient();

async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

async function main() {
  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});

  console.log("Seeding database...");

  // Seed products
  console.log("Seeding products...");
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  // Seed users with hashed passwords
  console.log("Seeding users...");
  for (const user of users) {
    // Create a new user object with hashed password
    const userData = {
      ...user,
      // Hash the password before storing it
      password: await hashPassword(user.password),
    };

    await prisma.user.create({
      data: userData,
    });
  }

  // Seed orders
  console.log("Seeding orders...");
  for (const order of orders) {
    await prisma.order.create({
      data: order,
    });
  }

  // Seed order items
  console.log("Seeding order items...");
  for (const item of orderItems) {
    await prisma.orderItem.create({
      data: item,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
