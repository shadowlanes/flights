import axios from "axios";

const RAPIDAPI_HOST = "aerodatabox.p.rapidapi.com";

export interface FlightData {
  flightNumber: string;
  airlineCode: string;
  departureCode: string;
  arrivalCode: string;
  scheduledDeparture: string;
  actualDeparture?: string;
  scheduledArrival: string;
  actualArrival?: string;
  status: string;
  delayMinutes?: number;
  aircraftType?: string;
  departureGate?: string;
  departureTerminal?: string;
  arrivalGate?: string;
  arrivalTerminal?: string;
  rawResponse?: any;
}

function mapStatus(apiStatus: string): string {
  const statusMap: Record<string, string> = {
    Unknown: "Scheduled",
    Expected: "Scheduled",
    EnRoute: "InAir",
    CheckIn: "Scheduled",
    Boarding: "Boarding",
    GateClosed: "Boarding",
    Departed: "Departed",
    Delayed: "Scheduled",
    Approaching: "InAir",
    Arrived: "Arrived",
    Landed: "Landed",
    Diverted: "Diverted",
    Cancelled: "Cancelled",
    CancelledUncertain: "Cancelled",
  };
  return statusMap[apiStatus] || "Scheduled";
}

function parseFlightLeg(leg: any): FlightData | null {
  if (!leg) return null;

  const departure = leg.departure;
  const arrival = leg.arrival;

  if (!departure?.airport?.iata || !arrival?.airport?.iata) return null;

  const delayMinutes =
    departure.delay != null
      ? departure.delay
      : arrival.delay != null
      ? arrival.delay
      : undefined;

  return {
    flightNumber: leg.number || "",
    airlineCode: leg.airline?.iata || leg.number?.substring(0, 2) || "",
    departureCode: departure.airport.iata,
    arrivalCode: arrival.airport.iata,
    scheduledDeparture: departure.scheduledTime?.utc || departure.scheduledTimeUtc || "",
    actualDeparture: departure.actualTime?.utc || departure.revisedTime?.utc || undefined,
    scheduledArrival: arrival.scheduledTime?.utc || arrival.scheduledTimeUtc || "",
    actualArrival: arrival.actualTime?.utc || arrival.revisedTime?.utc || undefined,
    status: mapStatus(leg.status || "Unknown"),
    delayMinutes: delayMinutes != null ? Math.round(delayMinutes) : undefined,
    aircraftType: leg.aircraft?.model || leg.aircraft?.reg || undefined,
    departureGate: departure.gate || undefined,
    departureTerminal: departure.terminal || undefined,
    arrivalGate: arrival.gate || undefined,
    arrivalTerminal: arrival.terminal || undefined,
    rawResponse: leg,
  };
}

export async function searchFlight(
  flightNumber: string,
  date: string
): Promise<FlightData[]> {
  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) {
    throw new Error("AERODATABOX_API_KEY is not configured");
  }

  const cleanNumber = flightNumber.replace(/\s+/g, "").toUpperCase();
  const url = `https://${RAPIDAPI_HOST}/flights/number/${cleanNumber}/${date}`;

  const response = await axios.get(url, {
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": apiKey,
    },
    timeout: 10000,
  });

  const data = response.data;

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const results: FlightData[] = [];
  for (const leg of data) {
    const parsed = parseFlightLeg(leg);
    if (parsed) results.push(parsed);
  }

  return results;
}

export async function getFlightStatus(
  flightNumber: string,
  date: string
): Promise<FlightData | null> {
  const results = await searchFlight(flightNumber, date);
  return results[0] || null;
}
