import { PrismaClient } from "@prisma/client";
import { products, users, orders, orderItems, reviews } from "./data.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

async function main() {
  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.anonymousCartItem.deleteMany({}); // <-- Add this line
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});

  console.log("Seeding database...");

  // Seed products without relations first
  console.log("Seeding products...");
  for (const product of products) {
    // Extract product data without relations
    const { reviews: _, ...productData } = product;

    // Create the product without relations
    await prisma.product.create({
      data: productData,
    });
  }

  // Seed users with hashed passwords
  console.log("Seeding users...");
  for (const user of users) {
    // Create a new user object with hashed password
    const userData = {
      ...user,
      // Skip hashing if password is already hashed (starts with $2a$)
      password: user.password.startsWith("$2a$")
        ? user.password
        : await hashPassword(user.password),
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

  // Seed reviews
  console.log("Seeding reviews...");
  for (const review of reviews) {
    await prisma.review.create({
      data: review,
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
