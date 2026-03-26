import prisma from "../lib/prisma";
import { getForecastAtTime } from "./weather";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Update destination weather for all upcoming (non-archived) flights
 * arriving within the next 3 days.
 */
export async function updateUpcomingFlightWeather(): Promise<number> {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + THREE_DAYS_MS);

  const flights = await prisma.flight.findMany({
    where: {
      isArchived: false,
      scheduledArrival: {
        gte: now,
        lte: threeDaysFromNow,
      },
    },
    include: {
      arrival: true,
    },
  });

  let updated = 0;

  for (const flight of flights) {
    const arr = flight.arrival;
    if (!arr?.latitude || !arr?.longitude || !flight.scheduledArrival) continue;

    const forecast = await getForecastAtTime(
      arr.latitude,
      arr.longitude,
      flight.scheduledArrival
    );

    if (!forecast) continue;

    await prisma.flight.update({
      where: { id: flight.id },
      data: {
        destWeatherTemp: forecast.temp,
        destWeatherDesc: forecast.description,
        destWeatherIcon: forecast.icon,
        destWeatherAqi: forecast.aqi,
        destWeatherUpdatedAt: new Date(),
      },
    });

    updated++;
  }

  return updated;
}
