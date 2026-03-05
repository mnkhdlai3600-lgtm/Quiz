import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import PG from "pg";

// 1. Connection Pool үүсгэх
const pool = new PG.Pool({
  connectionString: process.env.PRISMA_DB_URL,
});

// 2. Adapter-аа бэлдэх
const adapter = new PrismaPg(pool);

// 3. Prisma Client-ээ Adapter-тайгаа үүсгэх
const prisma = new PrismaClient({
  adapter,
});

export default prisma;
