import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const airports = [
  // North America
  { iataCode: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "US", latitude: 33.6407, longitude: -84.4277, timezone: "America/New_York" },
  { iataCode: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "US", latitude: 33.9425, longitude: -118.4081, timezone: "America/Los_Angeles" },
  { iataCode: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "US", latitude: 41.9742, longitude: -87.9073, timezone: "America/Chicago" },
  { iataCode: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "US", latitude: 32.8998, longitude: -97.0403, timezone: "America/Chicago" },
  { iataCode: "DEN", name: "Denver International Airport", city: "Denver", country: "US", latitude: 39.8561, longitude: -104.6737, timezone: "America/Denver" },
  { iataCode: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "US", latitude: 40.6413, longitude: -73.7781, timezone: "America/New_York" },
  { iataCode: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "US", latitude: 37.6213, longitude: -122.379, timezone: "America/Los_Angeles" },
  { iataCode: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "US", latitude: 47.4502, longitude: -122.3088, timezone: "America/Los_Angeles" },
  { iataCode: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "US", latitude: 36.084, longitude: -115.1537, timezone: "America/Los_Angeles" },
  { iataCode: "MCO", name: "Orlando International Airport", city: "Orlando", country: "US", latitude: 28.4312, longitude: -81.308, timezone: "America/New_York" },
  { iataCode: "EWR", name: "Newark Liberty International Airport", city: "Newark", country: "US", latitude: 40.6895, longitude: -74.1745, timezone: "America/New_York" },
  { iataCode: "MIA", name: "Miami International Airport", city: "Miami", country: "US", latitude: 25.7959, longitude: -80.287, timezone: "America/New_York" },
  { iataCode: "CLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "US", latitude: 35.214, longitude: -80.9431, timezone: "America/New_York" },
  { iataCode: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "US", latitude: 33.4373, longitude: -112.0078, timezone: "America/Phoenix" },
  { iataCode: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "US", latitude: 29.9902, longitude: -95.3368, timezone: "America/Chicago" },
  { iataCode: "BOS", name: "Boston Logan International Airport", city: "Boston", country: "US", latitude: 42.3656, longitude: -71.0096, timezone: "America/New_York" },
  { iataCode: "MSP", name: "Minneapolis-Saint Paul International Airport", city: "Minneapolis", country: "US", latitude: 44.8848, longitude: -93.2223, timezone: "America/Chicago" },
  { iataCode: "DTW", name: "Detroit Metropolitan Wayne County Airport", city: "Detroit", country: "US", latitude: 42.2124, longitude: -83.3534, timezone: "America/Detroit" },
  { iataCode: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "US", latitude: 39.8721, longitude: -75.2411, timezone: "America/New_York" },
  { iataCode: "LGA", name: "LaGuardia Airport", city: "New York", country: "US", latitude: 40.7769, longitude: -73.874, timezone: "America/New_York" },
  { iataCode: "BWI", name: "Baltimore/Washington International Airport", city: "Baltimore", country: "US", latitude: 39.1754, longitude: -76.6683, timezone: "America/New_York" },
  { iataCode: "SLC", name: "Salt Lake City International Airport", city: "Salt Lake City", country: "US", latitude: 40.7884, longitude: -111.9778, timezone: "America/Denver" },
  { iataCode: "IAD", name: "Washington Dulles International Airport", city: "Washington", country: "US", latitude: 38.9531, longitude: -77.4565, timezone: "America/New_York" },
  { iataCode: "DCA", name: "Ronald Reagan Washington National Airport", city: "Washington", country: "US", latitude: 38.8512, longitude: -77.0402, timezone: "America/New_York" },
  { iataCode: "SAN", name: "San Diego International Airport", city: "San Diego", country: "US", latitude: 32.7336, longitude: -117.1897, timezone: "America/Los_Angeles" },
  { iataCode: "TPA", name: "Tampa International Airport", city: "Tampa", country: "US", latitude: 27.9755, longitude: -82.5332, timezone: "America/New_York" },
  { iataCode: "AUS", name: "Austin-Bergstrom International Airport", city: "Austin", country: "US", latitude: 30.1975, longitude: -97.6664, timezone: "America/Chicago" },
  { iataCode: "PDX", name: "Portland International Airport", city: "Portland", country: "US", latitude: 45.5898, longitude: -122.5951, timezone: "America/Los_Angeles" },
  { iataCode: "HNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", country: "US", latitude: 21.3187, longitude: -157.9224, timezone: "Pacific/Honolulu" },
  { iataCode: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "CA", latitude: 43.6777, longitude: -79.6248, timezone: "America/Toronto" },
  { iataCode: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "CA", latitude: 49.1967, longitude: -123.1815, timezone: "America/Vancouver" },
  { iataCode: "YUL", name: "Montreal-Trudeau International Airport", city: "Montreal", country: "CA", latitude: 45.4706, longitude: -73.7408, timezone: "America/Montreal" },
  { iataCode: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "MX", latitude: 19.4363, longitude: -99.0721, timezone: "America/Mexico_City" },
  { iataCode: "CUN", name: "Cancun International Airport", city: "Cancun", country: "MX", latitude: 21.0365, longitude: -86.8771, timezone: "America/Cancun" },
  // Europe
  { iataCode: "LHR", name: "London Heathrow Airport", city: "London", country: "GB", latitude: 51.47, longitude: -0.4543, timezone: "Europe/London" },
  { iataCode: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "FR", latitude: 49.0097, longitude: 2.5479, timezone: "Europe/Paris" },
  { iataCode: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "NL", latitude: 52.3105, longitude: 4.7683, timezone: "Europe/Amsterdam" },
  { iataCode: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "DE", latitude: 50.0379, longitude: 8.5622, timezone: "Europe/Berlin" },
  { iataCode: "IST", name: "Istanbul Airport", city: "Istanbul", country: "TR", latitude: 41.2753, longitude: 28.7519, timezone: "Europe/Istanbul" },
  { iataCode: "MAD", name: "Adolfo Suarez Madrid-Barajas Airport", city: "Madrid", country: "ES", latitude: 40.4983, longitude: -3.5676, timezone: "Europe/Madrid" },
  { iataCode: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "ES", latitude: 41.2974, longitude: 2.0833, timezone: "Europe/Madrid" },
  { iataCode: "MUC", name: "Munich Airport", city: "Munich", country: "DE", latitude: 48.3537, longitude: 11.775, timezone: "Europe/Berlin" },
  { iataCode: "LGW", name: "London Gatwick Airport", city: "London", country: "GB", latitude: 51.1537, longitude: -0.1821, timezone: "Europe/London" },
  { iataCode: "FCO", name: "Leonardo da Vinci International Airport", city: "Rome", country: "IT", latitude: 41.8003, longitude: 12.2389, timezone: "Europe/Rome" },
  { iataCode: "ZRH", name: "Zurich Airport", city: "Zurich", country: "CH", latitude: 47.4647, longitude: 8.5492, timezone: "Europe/Zurich" },
  { iataCode: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "DK", latitude: 55.618, longitude: 12.656, timezone: "Europe/Copenhagen" },
  { iataCode: "VIE", name: "Vienna International Airport", city: "Vienna", country: "AT", latitude: 48.1103, longitude: 16.5697, timezone: "Europe/Vienna" },
  { iataCode: "DUB", name: "Dublin Airport", city: "Dublin", country: "IE", latitude: 53.4264, longitude: -6.2499, timezone: "Europe/Dublin" },
  { iataCode: "OSL", name: "Oslo Gardermoen Airport", city: "Oslo", country: "NO", latitude: 60.1976, longitude: 11.1004, timezone: "Europe/Oslo" },
  { iataCode: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "SE", latitude: 59.6519, longitude: 17.9186, timezone: "Europe/Stockholm" },
  { iataCode: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "FI", latitude: 60.3172, longitude: 24.9633, timezone: "Europe/Helsinki" },
  { iataCode: "LIS", name: "Lisbon Airport", city: "Lisbon", country: "PT", latitude: 38.7813, longitude: -9.1359, timezone: "Europe/Lisbon" },
  { iataCode: "ATH", name: "Athens International Airport", city: "Athens", country: "GR", latitude: 37.9364, longitude: 23.9445, timezone: "Europe/Athens" },
  { iataCode: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "PL", latitude: 52.1657, longitude: 20.9671, timezone: "Europe/Warsaw" },
  { iataCode: "BRU", name: "Brussels Airport", city: "Brussels", country: "BE", latitude: 50.9014, longitude: 4.4844, timezone: "Europe/Brussels" },
  // Asia
  { iataCode: "DXB", name: "Dubai International Airport", city: "Dubai", country: "AE", latitude: 25.2532, longitude: 55.3657, timezone: "Asia/Dubai" },
  { iataCode: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "JP", latitude: 35.5494, longitude: 139.7798, timezone: "Asia/Tokyo" },
  { iataCode: "NRT", name: "Narita International Airport", city: "Tokyo", country: "JP", latitude: 35.7647, longitude: 140.3864, timezone: "Asia/Tokyo" },
  { iataCode: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "SG", latitude: 1.3644, longitude: 103.9915, timezone: "Asia/Singapore" },
  { iataCode: "ICN", name: "Incheon International Airport", city: "Seoul", country: "KR", latitude: 37.4602, longitude: 126.4407, timezone: "Asia/Seoul" },
  { iataCode: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "HK", latitude: 22.308, longitude: 113.9185, timezone: "Asia/Hong_Kong" },
  { iataCode: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "TH", latitude: 13.6899, longitude: 100.7501, timezone: "Asia/Bangkok" },
  { iataCode: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "IN", latitude: 28.5562, longitude: 77.1, timezone: "Asia/Kolkata" },
  { iataCode: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "IN", latitude: 19.0896, longitude: 72.8656, timezone: "Asia/Kolkata" },
  { iataCode: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "IN", latitude: 13.1986, longitude: 77.7066, timezone: "Asia/Kolkata" },
  { iataCode: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", country: "IN", latitude: 22.6547, longitude: 88.4467, timezone: "Asia/Kolkata" },
  { iataCode: "MAA", name: "Chennai International Airport", city: "Chennai", country: "IN", latitude: 12.9941, longitude: 80.1709, timezone: "Asia/Kolkata" },
  { iataCode: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "IN", latitude: 17.2403, longitude: 78.4294, timezone: "Asia/Kolkata" },
  { iataCode: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "CN", latitude: 40.0799, longitude: 116.6031, timezone: "Asia/Shanghai" },
  { iataCode: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "CN", latitude: 31.1443, longitude: 121.8083, timezone: "Asia/Shanghai" },
  { iataCode: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "MY", latitude: 2.7456, longitude: 101.7099, timezone: "Asia/Kuala_Lumpur" },
  { iataCode: "DOH", name: "Hamad International Airport", city: "Doha", country: "QA", latitude: 25.2731, longitude: 51.6081, timezone: "Asia/Qatar" },
  { iataCode: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "AE", latitude: 24.433, longitude: 54.6511, timezone: "Asia/Dubai" },
  // Oceania
  { iataCode: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "AU", latitude: -33.9461, longitude: 151.177, timezone: "Australia/Sydney" },
  { iataCode: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "AU", latitude: -37.6733, longitude: 144.8431, timezone: "Australia/Melbourne" },
  { iataCode: "AKL", name: "Auckland Airport", city: "Auckland", country: "NZ", latitude: -37.0082, longitude: 174.7917, timezone: "Pacific/Auckland" },
  // South America
  { iataCode: "GRU", name: "Sao Paulo-Guarulhos International Airport", city: "Sao Paulo", country: "BR", latitude: -23.4356, longitude: -46.4731, timezone: "America/Sao_Paulo" },
  { iataCode: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "AR", latitude: -34.8222, longitude: -58.5358, timezone: "America/Argentina/Buenos_Aires" },
  { iataCode: "BOG", name: "El Dorado International Airport", city: "Bogota", country: "CO", latitude: 4.7016, longitude: -74.1469, timezone: "America/Bogota" },
  { iataCode: "SCL", name: "Arturo Merino Benitez International Airport", city: "Santiago", country: "CL", latitude: -33.393, longitude: -70.7858, timezone: "America/Santiago" },
  { iataCode: "LIM", name: "Jorge Chavez International Airport", city: "Lima", country: "PE", latitude: -12.0219, longitude: -77.1143, timezone: "America/Lima" },
  // Africa
  { iataCode: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg", country: "ZA", latitude: -26.1392, longitude: 28.246, timezone: "Africa/Johannesburg" },
  { iataCode: "CAI", name: "Cairo International Airport", city: "Cairo", country: "EG", latitude: 30.1219, longitude: 31.4056, timezone: "Africa/Cairo" },
  { iataCode: "ADD", name: "Addis Ababa Bole International Airport", city: "Addis Ababa", country: "ET", latitude: 8.9779, longitude: 38.7993, timezone: "Africa/Addis_Ababa" },
  { iataCode: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "KE", latitude: -1.3192, longitude: 36.9278, timezone: "Africa/Nairobi" },
];

const airlines = [
  // US
  { iataCode: "AA", name: "American Airlines", logoUrl: null },
  { iataCode: "DL", name: "Delta Air Lines", logoUrl: null },
  { iataCode: "UA", name: "United Airlines", logoUrl: null },
  { iataCode: "WN", name: "Southwest Airlines", logoUrl: null },
  { iataCode: "B6", name: "JetBlue Airways", logoUrl: null },
  { iataCode: "AS", name: "Alaska Airlines", logoUrl: null },
  { iataCode: "NK", name: "Spirit Airlines", logoUrl: null },
  { iataCode: "F9", name: "Frontier Airlines", logoUrl: null },
  { iataCode: "HA", name: "Hawaiian Airlines", logoUrl: null },
  // Canada
  { iataCode: "AC", name: "Air Canada", logoUrl: null },
  { iataCode: "WS", name: "WestJet", logoUrl: null },
  // Europe
  { iataCode: "BA", name: "British Airways", logoUrl: null },
  { iataCode: "AF", name: "Air France", logoUrl: null },
  { iataCode: "LH", name: "Lufthansa", logoUrl: null },
  { iataCode: "KL", name: "KLM Royal Dutch Airlines", logoUrl: null },
  { iataCode: "IB", name: "Iberia", logoUrl: null },
  { iataCode: "AZ", name: "ITA Airways", logoUrl: null },
  { iataCode: "LX", name: "Swiss International Air Lines", logoUrl: null },
  { iataCode: "OS", name: "Austrian Airlines", logoUrl: null },
  { iataCode: "SK", name: "Scandinavian Airlines", logoUrl: null },
  { iataCode: "AY", name: "Finnair", logoUrl: null },
  { iataCode: "TP", name: "TAP Air Portugal", logoUrl: null },
  { iataCode: "EI", name: "Aer Lingus", logoUrl: null },
  { iataCode: "LO", name: "LOT Polish Airlines", logoUrl: null },
  { iataCode: "TK", name: "Turkish Airlines", logoUrl: null },
  { iataCode: "FR", name: "Ryanair", logoUrl: null },
  { iataCode: "U2", name: "easyJet", logoUrl: null },
  { iataCode: "W6", name: "Wizz Air", logoUrl: null },
  { iataCode: "DY", name: "Norwegian Air Shuttle", logoUrl: null },
  { iataCode: "VS", name: "Virgin Atlantic", logoUrl: null },
  // Middle East
  { iataCode: "EK", name: "Emirates", logoUrl: null },
  { iataCode: "QR", name: "Qatar Airways", logoUrl: null },
  { iataCode: "EY", name: "Etihad Airways", logoUrl: null },
  // Asia
  { iataCode: "SQ", name: "Singapore Airlines", logoUrl: null },
  { iataCode: "CX", name: "Cathay Pacific", logoUrl: null },
  { iataCode: "JL", name: "Japan Airlines", logoUrl: null },
  { iataCode: "NH", name: "All Nippon Airways", logoUrl: null },
  { iataCode: "KE", name: "Korean Air", logoUrl: null },
  { iataCode: "OZ", name: "Asiana Airlines", logoUrl: null },
  { iataCode: "TG", name: "Thai Airways", logoUrl: null },
  { iataCode: "MH", name: "Malaysia Airlines", logoUrl: null },
  { iataCode: "AI", name: "Air India", logoUrl: null },
  { iataCode: "6E", name: "IndiGo", logoUrl: null },
  { iataCode: "CA", name: "Air China", logoUrl: null },
  { iataCode: "MU", name: "China Eastern Airlines", logoUrl: null },
  { iataCode: "CZ", name: "China Southern Airlines", logoUrl: null },
  // Oceania
  { iataCode: "QF", name: "Qantas", logoUrl: null },
  { iataCode: "NZ", name: "Air New Zealand", logoUrl: null },
  // South America
  { iataCode: "LA", name: "LATAM Airlines", logoUrl: null },
  { iataCode: "AV", name: "Avianca", logoUrl: null },
  { iataCode: "G3", name: "Gol Linhas Aereas", logoUrl: null },
  // Africa
  { iataCode: "ET", name: "Ethiopian Airlines", logoUrl: null },
  { iataCode: "SA", name: "South African Airways", logoUrl: null },
  { iataCode: "MS", name: "EgyptAir", logoUrl: null },
  // Mexico
  { iataCode: "AM", name: "Aeromexico", logoUrl: null },
  { iataCode: "VB", name: "VivaAerobus", logoUrl: null },
];

async function main() {
  console.log("Seeding airports...");
  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { iataCode: airport.iataCode },
      update: airport,
      create: airport,
    });
  }
  console.log(`Seeded ${airports.length} airports`);

  console.log("Seeding airlines...");
  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { iataCode: airline.iataCode },
      update: airline,
      create: airline,
    });
  }
  console.log(`Seeded ${airlines.length} airlines`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
