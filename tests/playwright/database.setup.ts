import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { seed } from "@repo/db/seed";

// Create __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "tests", ".env.test") });

// Create a test client function that always uses the test database
export function getTestPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL,
      },
    },
  });
}

// Helper to run seed with test database
export async function seedTestDatabase() {
  return seed(process.env.TEST_DATABASE_URL);
}
