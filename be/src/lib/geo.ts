const R_KM = 6371; // Earth's radius in kilometers

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // North America
  US: "North America", CA: "North America", MX: "North America",
  // Central America & Caribbean
  CR: "North America", PA: "North America", CU: "North America",
  JM: "North America", DO: "North America", GT: "North America",
  // South America
  BR: "South America", AR: "South America", CO: "South America",
  CL: "South America", PE: "South America", EC: "South America",
  VE: "South America", BO: "South America", UY: "South America",
  PY: "South America",
  // Europe
  GB: "Europe", FR: "Europe", DE: "Europe", NL: "Europe", ES: "Europe",
  IT: "Europe", CH: "Europe", AT: "Europe", BE: "Europe", PT: "Europe",
  IE: "Europe", DK: "Europe", SE: "Europe", NO: "Europe", FI: "Europe",
  PL: "Europe", GR: "Europe", CZ: "Europe", HU: "Europe", RO: "Europe",
  TR: "Europe", IS: "Europe", HR: "Europe", RS: "Europe", BG: "Europe",
  SK: "Europe", SI: "Europe", LT: "Europe", LV: "Europe", EE: "Europe",
  GE: "Europe", AM: "Europe", AZ: "Europe",
  // Africa
  ZA: "Africa", EG: "Africa", ET: "Africa", KE: "Africa", NG: "Africa",
  MA: "Africa", TN: "Africa", TZ: "Africa", GH: "Africa", SN: "Africa",
  // Asia
  JP: "Asia", CN: "Asia", KR: "Asia", IN: "Asia", SG: "Asia",
  TH: "Asia", MY: "Asia", ID: "Asia", PH: "Asia", VN: "Asia",
  KH: "Asia", MM: "Asia", BD: "Asia", PK: "Asia", LK: "Asia",
  AE: "Asia", QA: "Asia", BH: "Asia", JO: "Asia", SA: "Asia",
  KW: "Asia", OM: "Asia", IL: "Asia", HK: "Asia", TW: "Asia",
  MV: "Asia", NP: "Asia",
  // Oceania
  AU: "Oceania", NZ: "Oceania", FJ: "Oceania",
};

export function countryToContinent(countryCode: string): string | null {
  return COUNTRY_TO_CONTINENT[countryCode] || null;
}
