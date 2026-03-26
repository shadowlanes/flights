import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "http://router.project-osrm.org/route/v1/driving";
const DELAY_MS = 1100; // Nominatim requires max 1 req/sec

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeCity(
  city: string,
  country: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await axios.get(NOMINATIM_URL, {
      params: {
        q: `${city}, ${country}`,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "FlightTrackerApp/1.0",
      },
      timeout: 10000,
    });

    if (res.data?.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lon: parseFloat(res.data[0].lon),
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function getDrivingRoute(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<{ distanceKm: number; durationMin: number } | null> {
  try {
    const res = await axios.get(
      `${OSRM_URL}/${fromLon},${fromLat};${toLon},${toLat}`,
      {
        params: { overview: "false" },
        timeout: 10000,
      }
    );

    const route = res.data?.routes?.[0];
    if (!route) return null;

    return {
      distanceKm: Math.round(route.distance / 1000),
      durationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

async function main() {
  const airports = await prisma.airport.findMany({
    orderBy: { iataCode: "asc" },
  });

  console.log(`Processing ${airports.length} airports...\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const airport of airports) {
    // Skip if already populated
    if (airport.cityDistanceKm != null && airport.cityTravelMin != null) {
      console.log(`  ${airport.iataCode} (${airport.city}) — already has data, skipping`);
      skipped++;
      continue;
    }

    // Step 1: Geocode city center
    const cityCenter = await geocodeCity(airport.city, airport.country);
    if (!cityCenter) {
      console.log(`  ${airport.iataCode} (${airport.city}) — failed to geocode city`);
      failed++;
      await sleep(DELAY_MS);
      continue;
    }

    await sleep(DELAY_MS); // Rate limit between Nominatim calls

    // Step 2: Get driving route from city center to airport
    const route = await getDrivingRoute(
      cityCenter.lat,
      cityCenter.lon,
      airport.latitude,
      airport.longitude
    );

    if (!route) {
      console.log(`  ${airport.iataCode} (${airport.city}) — failed to get driving route`);
      failed++;
      continue;
    }

    // Step 3: Update airport record
    await prisma.airport.update({
      where: { iataCode: airport.iataCode },
      data: {
        cityDistanceKm: route.distanceKm,
        cityTravelMin: route.durationMin,
      },
    });

    console.log(
      `  ${airport.iataCode} (${airport.city}) — ${route.distanceKm} km, ${route.durationMin} min`
    );
    updated++;
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
