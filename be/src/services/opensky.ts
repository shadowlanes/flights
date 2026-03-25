// TODO: OpenSky Network integration for live aircraft position tracking
// Deferred to v1.5 — will add ICAO24 transponder code to Flight model
// and poll OpenSky /states/all?icao24={code} for in-air flights.

export async function getAircraftPosition(
  _icao24: string
): Promise<{ lat: number; lon: number; altitude: number } | null> {
  // Stub — not yet implemented
  return null;
}
