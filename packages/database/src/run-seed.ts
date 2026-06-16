import { prisma } from "./client";
import { seedDatabase } from "./seed";

async function main() {
  const key = await seedDatabase();
  console.log("API Key:");
  console.log(key);
  await prisma.$disconnect();
}

main();
