import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// Mapping of airport codes not in the seed to their details
const EXTRA_AIRPORTS: Record<
  string,
  { name: string; city: string; country: string; lat: number; lon: number; tz: string }
> = {
  JLR: { name: "Jabalpur Airport", city: "Jabalpur", country: "IN", lat: 23.1778, lon: 80.052, tz: "Asia/Kolkata" },
  NAG: { name: "Dr. Babasaheb Ambedkar International Airport", city: "Nagpur", country: "IN", lat: 21.0922, lon: 79.0472, tz: "Asia/Kolkata" },
  GOI: { name: "Goa International Airport", city: "Goa", country: "IN", lat: 15.3808, lon: 73.8314, tz: "Asia/Kolkata" },
  COK: { name: "Cochin International Airport", city: "Kochi", country: "IN", lat: 10.152, lon: 76.4019, tz: "Asia/Kolkata" },
  IXE: { name: "Mangalore International Airport", city: "Mangalore", country: "IN", lat: 12.9613, lon: 74.8901, tz: "Asia/Kolkata" },
  HBX: { name: "Hubli Airport", city: "Hubli", country: "IN", lat: 15.3617, lon: 75.0849, tz: "Asia/Kolkata" },
  IXR: { name: "Birsa Munda Airport", city: "Ranchi", country: "IN", lat: 23.3143, lon: 85.3217, tz: "Asia/Kolkata" },
  JSA: { name: "Jaisalmer Airport", city: "Jaisalmer", country: "IN", lat: 26.8887, lon: 70.865, tz: "Asia/Kolkata" },
  JDH: { name: "Jodhpur Airport", city: "Jodhpur", country: "IN", lat: 26.2511, lon: 73.0489, tz: "Asia/Kolkata" },
  RAJ: { name: "Rajkot Airport", city: "Rajkot", country: "IN", lat: 22.3092, lon: 70.7795, tz: "Asia/Kolkata" },
  DIU: { name: "Diu Airport", city: "Diu", country: "IN", lat: 20.7131, lon: 70.9211, tz: "Asia/Kolkata" },
  PNQ: { name: "Pune Airport", city: "Pune", country: "IN", lat: 18.5822, lon: 73.9197, tz: "Asia/Kolkata" },
  IXB: { name: "Bagdogra Airport", city: "Bagdogra", country: "IN", lat: 26.6812, lon: 88.3286, tz: "Asia/Kolkata" },
  JAI: { name: "Jaipur International Airport", city: "Jaipur", country: "IN", lat: 26.8242, lon: 75.8122, tz: "Asia/Kolkata" },
  SXR: { name: "Sheikh ul-Alam International Airport", city: "Srinagar", country: "IN", lat: 33.9871, lon: 74.7742, tz: "Asia/Kolkata" },
  ATQ: { name: "Sri Guru Ram Dass Jee International Airport", city: "Amritsar", country: "IN", lat: 31.7096, lon: 74.7973, tz: "Asia/Kolkata" },
  LKO: { name: "Chaudhary Charan Singh International Airport", city: "Lucknow", country: "IN", lat: 26.7606, lon: 80.8893, tz: "Asia/Kolkata" },
  GWL: { name: "Gwalior Airport", city: "Gwalior", country: "IN", lat: 26.2933, lon: 78.2278, tz: "Asia/Kolkata" },
  CMB: { name: "Bandaranaike International Airport", city: "Colombo", country: "LK", lat: 7.1808, lon: 79.8841, tz: "Asia/Colombo" },
  MLE: { name: "Velana International Airport", city: "Male", country: "MV", lat: 4.1918, lon: 73.5291, tz: "Indian/Maldives" },
  HKT: { name: "Phuket International Airport", city: "Phuket", country: "TH", lat: 8.1132, lon: 98.3169, tz: "Asia/Bangkok" },
  BAH: { name: "Bahrain International Airport", city: "Manama", country: "BH", lat: 26.2708, lon: 50.6336, tz: "Asia/Bahrain" },
  AMM: { name: "Queen Alia International Airport", city: "Amman", country: "JO", lat: 31.7226, lon: 35.9932, tz: "Asia/Amman" },
  KUT: { name: "David the Builder Kutaisi International Airport", city: "Kutaisi", country: "GE", lat: 42.1767, lon: 42.4826, tz: "Asia/Tbilisi" },
  TBS: { name: "Tbilisi International Airport", city: "Tbilisi", country: "GE", lat: 41.6692, lon: 44.9547, tz: "Asia/Tbilisi" },
  GYD: { name: "Heydar Aliyev International Airport", city: "Baku", country: "AZ", lat: 40.4675, lon: 50.0467, tz: "Asia/Baku" },
  SLL: { name: "Salalah Airport", city: "Salalah", country: "OM", lat: 17.0387, lon: 54.0913, tz: "Asia/Muscat" },
  EVN: { name: "Zvartnots International Airport", city: "Yerevan", country: "AM", lat: 40.1473, lon: 44.3959, tz: "Asia/Yerevan" },
  EDI: { name: "Edinburgh Airport", city: "Edinburgh", country: "GB", lat: 55.95, lon: -3.3725, tz: "Europe/London" },
  STN: { name: "London Stansted Airport", city: "London", country: "GB", lat: 51.885, lon: 0.235, tz: "Europe/London" },
  HAN: { name: "Noi Bai International Airport", city: "Hanoi", country: "VN", lat: 21.2212, lon: 105.807, tz: "Asia/Ho_Chi_Minh" },
  DAD: { name: "Da Nang International Airport", city: "Da Nang", country: "VN", lat: 16.0439, lon: 108.1994, tz: "Asia/Ho_Chi_Minh" },
  SGN: { name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "VN", lat: 10.8188, lon: 106.6519, tz: "Asia/Ho_Chi_Minh" },
  SAI: { name: "Siem Reap International Airport", city: "Siem Reap", country: "KH", lat: 13.4107, lon: 103.8131, tz: "Asia/Phnom_Penh" },
  PEN: { name: "Penang International Airport", city: "Penang", country: "MY", lat: 5.2972, lon: 100.2767, tz: "Asia/Kuala_Lumpur" },
  CGK: { name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "ID", lat: -6.1256, lon: 106.6559, tz: "Asia/Jakarta" },
  YIA: { name: "Yogyakarta International Airport", city: "Yogyakarta", country: "ID", lat: -7.9006, lon: 110.0578, tz: "Asia/Jakarta" },
  DPS: { name: "Ngurah Rai International Airport", city: "Denpasar", country: "ID", lat: -8.7482, lon: 115.1672, tz: "Asia/Makassar" },
  MNL: { name: "Ninoy Aquino International Airport", city: "Manila", country: "PH", lat: 14.5086, lon: 121.0197, tz: "Asia/Manila" },
  MPH: { name: "Godofredo P. Ramos Airport", city: "Caticlan", country: "PH", lat: 11.9244, lon: 121.9536, tz: "Asia/Manila" },
  ENI: { name: "El Nido Airport", city: "El Nido", country: "PH", lat: 11.2022, lon: 119.4172, tz: "Asia/Manila" },
  DMK: { name: "Don Mueang International Airport", city: "Bangkok", country: "TH", lat: 13.9126, lon: 100.6068, tz: "Asia/Bangkok" },
  SHJ: { name: "Sharjah International Airport", city: "Sharjah", country: "AE", lat: 25.3286, lon: 55.5172, tz: "Asia/Dubai" },
  MCT: { name: "Muscat International Airport", city: "Muscat", country: "OM", lat: 23.5933, lon: 58.2844, tz: "Asia/Muscat" },
  ASW: { name: "Aswan International Airport", city: "Aswan", country: "EG", lat: 23.9644, lon: 32.82, tz: "Africa/Cairo" },
  LXR: { name: "Luxor International Airport", city: "Luxor", country: "EG", lat: 25.6741, lon: 32.7066, tz: "Africa/Cairo" },
  MAA: { name: "Chennai International Airport", city: "Chennai", country: "IN", lat: 12.9941, lon: 80.1709, tz: "Asia/Kolkata" },
};

// Extra airlines not in seed
const EXTRA_AIRLINES: Record<string, string> = {
  SG: "SpiceJet",
  UK: "Vistara",
  G8: "GoAir",
  I5: "AirAsia India",
  "9W": "Jet Airways",
  QP: "Akasa Air",
  "9I": "Alliance Air",
  SM: "Air Cairo",
  FZ: "flydubai",
  J2: "Azerbaijan Airlines",
  QH: "Bamboo Airways",
  VJ: "Vietjet",
  JT: "Lion Air",
  "5J": "Cebu Pacific",
  T6: "AirSWIFT",
  SL: "Thai Lion Air",
  PR: "Philippine Airlines",
  G9: "Air Arabia",
  GF: "Gulf Air",
  WY: "Oman Air",
  IX: "AI Express",
  "5W": "Wizz Air Abu Dhabi",
  KT: "Cambodia Airways",
  Z2: "AirAsia Philippines",
};

function parseDate(dateStr: string): Date {
  // Format: "15-Jul-2016"
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = dateStr.trim().split("-");
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  return new Date(year, month, day);
}

function parseDuration(dur: string): number {
  // "2h 25m" or "0h 55m" or "50m" or "2h30m"
  const clean = dur.trim();
  let hours = 0;
  let minutes = 0;

  const hMatch = clean.match(/(\d+)h/);
  const mMatch = clean.match(/(\d+)m/);

  if (hMatch) hours = parseInt(hMatch[1]);
  if (mMatch) minutes = parseInt(mMatch[1]);

  return hours * 60 + minutes;
}

function extractAirlineCode(flightNumber: string): string {
  // Clean up the flight number and extract airline code
  const clean = flightNumber.replace(/[\s\-­]/g, "").toUpperCase();

  // Try 2-char alpha code first
  const m2 = clean.match(/^([A-Z]{2})/);
  if (m2) return m2[1];

  // Try alphanumeric code (e.g., "6E", "5W", "9W", "5J", "9I")
  const m3 = clean.match(/^(\d[A-Z]|[A-Z]\d)/);
  if (m3) return m3[1];

  return clean.substring(0, 2);
}

function cleanFlightNumber(raw: string): string {
  // Remove invisible chars, normalize spaces/dashes
  return raw
    .replace(/[\u00AD\u200B-\u200D\uFEFF]/g, "") // invisible chars
    .replace(/[\s\-]+/g, " ")
    .trim()
    .toUpperCase();
}

async function main() {
  const csvPath = join(__dirname, "../../All Travel - Flights.csv");
  const csv = readFileSync(csvPath, "utf-8");
  const lines = csv.split("\n").filter((l) => l.trim());
  const header = lines[0];
  const rows = lines.slice(1);

  console.log(`Found ${rows.length} flights to import`);

  // Find or note that we need a user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error(
      "No user found in database. Please sign in via the app first, then re-run this script."
    );
    process.exit(1);
  }
  console.log(`Importing flights for user: ${user.name} (${user.email})`);

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    // Parse CSV (handle commas in fields, though this CSV seems clean)
    const cols = row.split(",");
    if (cols.length < 7) continue;

    const dateStr = cols[0].trim();
    const fromCode = cols[1].trim().toUpperCase();
    const toCode = cols[2].trim().toUpperCase();
    const fromCity = cols[3].trim();
    const toCity = cols[4].trim();
    const airlineName = cols[5].trim();
    const rawFlightNum = cols[6].trim();
    const duration = cols[7]?.trim() || "";
    const trip = cols[8]?.trim() || "";

    if (!dateStr || !fromCode || !toCode || !rawFlightNum) {
      skipped++;
      continue;
    }

    const flightDate = parseDate(dateStr);
    const flightNumber = cleanFlightNumber(rawFlightNum);
    const airlineCode = extractAirlineCode(flightNumber);
    const durationMin = parseDuration(duration);
    // Compute approximate departure/arrival times (set departure at noon local)
    const scheduledDeparture = new Date(flightDate);
    scheduledDeparture.setHours(12, 0, 0, 0);
    const scheduledArrival = new Date(
      scheduledDeparture.getTime() + durationMin * 60000
    );

    // Ensure airports exist
    for (const [code, city] of [
      [fromCode, fromCity],
      [toCode, toCity],
    ] as const) {
      const exists = await prisma.airport.findUnique({
        where: { iataCode: code },
      });
      if (!exists) {
        const extra = EXTRA_AIRPORTS[code];
        await prisma.airport.create({
          data: {
            iataCode: code,
            name: extra?.name || `${city} Airport`,
            city: extra?.city || city,
            country: extra?.country || "Unknown",
            latitude: extra?.lat || 0,
            longitude: extra?.lon || 0,
            timezone: extra?.tz || "UTC",
          },
        });
        console.log(`  + Airport: ${code} (${city})`);
      }
    }

    // Ensure airline exists
    const airlineExists = await prisma.airline.findUnique({
      where: { iataCode: airlineCode },
    });
    if (!airlineExists) {
      const name = EXTRA_AIRLINES[airlineCode] || airlineName;
      await prisma.airline.create({
        data: { iataCode: airlineCode, name },
      });
      console.log(`  + Airline: ${airlineCode} (${name})`);
    }

    // Check for duplicate (same flight number + date + user)
    const duplicate = await prisma.flight.findFirst({
      where: {
        userId: user.id,
        flightNumber,
        date: flightDate,
      },
    });
    if (duplicate) {
      skipped++;
      continue;
    }

    await prisma.flight.create({
      data: {
        userId: user.id,
        flightNumber,
        date: flightDate,
        airlineCode,
        departureCode: fromCode,
        arrivalCode: toCode,
        scheduledDeparture,
        scheduledArrival,
        status: "Arrived",
        isArchived: true,
        aircraftType: null,
        seatNumber: null,
      },
    });
    imported++;
  }

  console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
