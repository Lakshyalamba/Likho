import { PrismaClient } from "@prisma/client";
import "./env";

export const prisma = new PrismaClient();

export async function connectDatabase() {
  await prisma.$connect();
  console.log("PostgreSQL connected successfully");
}
