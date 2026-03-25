import prisma from "../lib/prisma";
import { getFlightStatus } from "./aerodatabox";
import { format } from "date-fns";

const CACHE_TTL_ACTIVE_MS = 5 * 60 * 1000; // 5 minutes for active flights
const CACHE_TTL_SCHEDULED_MS = 60 * 60 * 1000; // 1 hour for scheduled flights

function isCacheStale(
  lastFetch: Date | null,
  status: string
): boolean {
  if (!lastFetch) return true;
  const age = Date.now() - lastFetch.getTime();
  const isActive = ["Boarding", "Departed", "InAir"].includes(status);
  return age > (isActive ? CACHE_TTL_ACTIVE_MS : CACHE_TTL_SCHEDULED_MS);
}

export async function updateActiveFlights(): Promise<number> {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(
    now.getTime() + 24 * 60 * 60 * 1000
  );

  // Find flights that need updating:
  // 1. Departing within 24 hours
  // 2. Currently in active status
  const flights = await prisma.flight.findMany({
    where: {
      isArchived: false,
      OR: [
        {
          scheduledDeparture: {
            lte: twentyFourHoursFromNow,
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
        {
          status: { in: ["Boarding", "Departed", "InAir"] },
        },
      ],
    },
  });

  let updated = 0;

  for (const flight of flights) {
    if (!isCacheStale(flight.lastApiFetchAt, flight.status)) {
      continue;
    }

    try {
      const dateStr = format(flight.date, "yyyy-MM-dd");
      const data = await getFlightStatus(flight.flightNumber, dateStr);

      if (data) {
        await prisma.flight.update({
          where: { id: flight.id },
          data: {
            status: data.status,
            delayMinutes: data.delayMinutes,
            actualDeparture: data.actualDeparture
              ? new Date(data.actualDeparture)
              : undefined,
            actualArrival: data.actualArrival
              ? new Date(data.actualArrival)
              : undefined,
            departureGate: data.departureGate ?? undefined,
            departureTerminal: data.departureTerminal ?? undefined,
            arrivalGate: data.arrivalGate ?? undefined,
            arrivalTerminal: data.arrivalTerminal ?? undefined,
            aircraftType: data.aircraftType ?? undefined,
            lastApiFetchAt: new Date(),
            apiCache: data.rawResponse,
          },
        });
        updated++;
      }
    } catch (err) {
      console.error(
        `Failed to update flight ${flight.flightNumber}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return updated;
}
