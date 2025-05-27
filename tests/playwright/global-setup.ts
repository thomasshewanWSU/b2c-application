import { FullConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { seed } from "@repo/db/seed";
import { execSync } from "child_process";

// Create __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup(config: FullConfig) {
  // Load test environment variables
  dotenv.config({ path: path.resolve(__dirname, "tests", ".env.test") });
  console.log("Setting up test database...");
  const originalDbUrl = process.env.DATABASE_URL;

  try {
    // Set DATABASE_URL to test database
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

    console.log("Database schema applied successfully");

    // Now seed the database
    await seed(process.env.DATABASE_URL);

    console.log("Test database setup complete");
  } finally {
    // Restore original DATABASE_URL
    process.env.DATABASE_URL = originalDbUrl;
  }
}

export default globalSetup;
