import { airports } from "./flight-airports";

/**
 * Resolve an airport reference to [longitude, latitude] coordinates.
 * Accepts either an IATA code string or a [lng, lat] tuple.
 */
export function resolveAirport(ref) {
  if (Array.isArray(ref)) return ref;
  const airport = airports[ref.toUpperCase()];
  if (!airport) {
    throw new Error(
      `Unknown airport code: "${ref}". Use a valid IATA code or pass [longitude, latitude] directly.`
    );
  }
  return [airport.longitude, airport.latitude];
}

/**
 * Look up full airport info by IATA code.
 * Returns undefined if the code is not found.
 */
export function getAirportInfo(code) {
  return airports[code.toUpperCase()];
}

export { airports };
