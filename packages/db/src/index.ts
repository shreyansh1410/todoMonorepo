import { PrismaClient } from "../generated/prisma/index.js";

declare const process: {
  env: { [key: string]: string | undefined };
};

// Default DATABASE_URL for development if not provided
const defaultDatabaseUrl =
  "postgresql://postgres:123456@localhost:5432/mydatabase";

// Use environment variable or fallback to default
const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl;

console.log("DATABASE_URL in packages/db/src/index.ts:", databaseUrl); // Diagnostic log

export const prismaClient = new PrismaClient({
  datasourceUrl: databaseUrl,
});
