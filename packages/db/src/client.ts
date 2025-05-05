import { PrismaClient } from "@prisma/client";
import { env } from "@repo/env/web";

declare global {
  var prisma: PrismaClient | undefined;
}

export const createClient = () => {
  if (global.prisma) {
    return global.prisma;
  }

  const URL = env.DATABASE_URL;

  const prisma = new PrismaClient({
    datasourceUrl: URL,
  });

  console.log("Connected to database");
  console.log(URL);

  global.prisma = prisma;
  return prisma;
};

export const client = {
  get db() {
    return createClient();
  },
};
