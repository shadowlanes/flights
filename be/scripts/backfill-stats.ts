import { PrismaClient } from "@prisma/client";
import { recomputeUserStats } from "../src/services/stats";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  console.log(`Backfilling stats for ${users.length} user(s)`);

  for (const user of users) {
    await recomputeUserStats(user.id);
    const stats = await prisma.userStats.findUnique({ where: { userId: user.id } });
    console.log(`  ${user.name}: ${stats?.totalFlights} flights, ${stats?.totalDistanceKm} km, ${stats?.uniqueCountries} countries`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
