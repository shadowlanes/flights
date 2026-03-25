import prisma from "../lib/prisma";
import { haversineKm, countryToContinent } from "../lib/geo";

export async function recomputeUserStats(userId: string): Promise<void> {
  const flights = await prisma.flight.findMany({
    where: { userId },
    include: { departure: true, arrival: true },
  });

  const airlines = new Set<string>();
  const airports = new Set<string>();
  const countries = new Set<string>();
  const continents = new Set<string>();
  let totalDistanceKm = 0;
  let totalDurationMin = 0;

  for (const f of flights) {
    airlines.add(f.airlineCode);
    airports.add(f.departureCode);
    airports.add(f.arrivalCode);

    if (f.departure?.country) {
      countries.add(f.departure.country);
      const c = countryToContinent(f.departure.country);
      if (c) continents.add(c);
    }
    if (f.arrival?.country) {
      countries.add(f.arrival.country);
      const c = countryToContinent(f.arrival.country);
      if (c) continents.add(c);
    }

    if (f.departure && f.arrival) {
      totalDistanceKm += haversineKm(
        f.departure.latitude,
        f.departure.longitude,
        f.arrival.latitude,
        f.arrival.longitude
      );
    }

    if (f.scheduledDeparture && f.scheduledArrival) {
      const diff =
        f.scheduledArrival.getTime() - f.scheduledDeparture.getTime();
      if (diff > 0) {
        totalDurationMin += Math.round(diff / 60000);
      }
    }
  }

  await prisma.userStats.upsert({
    where: { userId },
    update: {
      totalFlights: flights.length,
      totalDistanceKm: Math.round(totalDistanceKm),
      totalDurationMin,
      uniqueAirlines: airlines.size,
      uniqueAirports: airports.size,
      uniqueCountries: countries.size,
      uniqueContinents: continents.size,
    },
    create: {
      userId,
      totalFlights: flights.length,
      totalDistanceKm: Math.round(totalDistanceKm),
      totalDurationMin,
      uniqueAirlines: airlines.size,
      uniqueAirports: airports.size,
      uniqueCountries: countries.size,
      uniqueContinents: continents.size,
    },
  });
}
