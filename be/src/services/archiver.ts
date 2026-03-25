import prisma from "../lib/prisma";

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function archiveCompletedFlights(): Promise<number> {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - THREE_HOURS_MS);
  const twentyFourHoursAgo = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS);

  // Archive flights that:
  // 1. Landed/Arrived more than 3 hours ago
  // 2. Scheduled arrival was more than 24 hours ago (fallback for missing status updates)
  const result = await prisma.flight.updateMany({
    where: {
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
    },
    data: { isArchived: true },
  });

  if (result.count > 0) {
    console.log(`Archived ${result.count} completed flight(s)`);
  }

  return result.count;
}
