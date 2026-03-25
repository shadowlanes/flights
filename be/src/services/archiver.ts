import prisma from "../lib/prisma";
import { recomputeUserStats } from "./stats";

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function archiveCompletedFlights(): Promise<number> {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - THREE_HOURS_MS);
  const twentyFourHoursAgo = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS);

  const where = {
    isArchived: false,
    OR: [
      {
        status: { in: ["Landed", "Arrived"] },
        OR: [
          { actualArrival: { lte: threeHoursAgo } },
          {
            actualArrival: null,
            scheduledArrival: { lte: threeHoursAgo },
          },
        ],
      },
      {
        scheduledArrival: { lte: twentyFourHoursAgo },
      },
    ],
  } as const;

  // Find affected users before archiving
  const affectedFlights = await prisma.flight.findMany({
    where,
    select: { userId: true },
    distinct: ["userId"],
  });

  const result = await prisma.flight.updateMany({
    where,
    data: { isArchived: true },
  });

  if (result.count > 0) {
    console.log(`Archived ${result.count} completed flight(s)`);

    // Recompute stats for affected users
    for (const { userId } of affectedFlights) {
      await recomputeUserStats(userId);
    }
  }

  return result.count;
}
