import { PrismaClient } from "@prisma/client";

console.log(PrismaClient);

export const prisma = new PrismaClient();
