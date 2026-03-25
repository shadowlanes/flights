import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { searchFlight, getFlightStatus } from "../services/aerodatabox";
import { archiveCompletedFlights } from "../services/archiver";
import { recomputeUserStats } from "../services/stats";
import { format } from "date-fns";

const router = Router();

// List upcoming (non-archived) flights
router.get("/api/flights", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Lazy archive check
    await archiveCompletedFlights();

    const flights = await prisma.flight.findMany({
      where: { userId: req.user!.id, isArchived: false },
      orderBy: { scheduledDeparture: "asc" },
      include: { departure: true, arrival: true, airline: true },
    });

    res.json(flights);
  } catch (err) {
    console.error("Error listing flights:", err);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

// List archived flights
router.get("/api/flights/archive", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const flights = await prisma.flight.findMany({
      where: { userId: req.user!.id, isArchived: true },
      orderBy: { scheduledDeparture: "desc" },
      include: { departure: true, arrival: true, airline: true },
    });

    res.json(flights);
  } catch (err) {
    console.error("Error listing archived flights:", err);
    res.status(500).json({ error: "Failed to fetch archived flights" });
  }
});

// Search flights via AeroDataBox (preview only, no save)
router.post("/api/flights/search", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { flightNumber, date } = req.body;

    if (!flightNumber || !date) {
      return res
        .status(400)
        .json({ error: "flightNumber and date are required" });
    }

    const results = await searchFlight(flightNumber, date);

    if (results.length === 0) {
      return res.status(404).json({ error: "No flights found" });
    }

    res.json(results);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return res.status(404).json({ error: "No flights found" });
    }
    console.error("Error searching flights:", err?.message || err);
    res.status(500).json({ error: "Failed to search flights" });
  }
});

// Add a flight
router.post("/api/flights", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { flightNumber, date, seatNumber } = req.body;

    if (!flightNumber || !date) {
      return res
        .status(400)
        .json({ error: "flightNumber and date are required" });
    }

    const results = await searchFlight(flightNumber, date);
    if (results.length === 0) {
      return res.status(404).json({ error: "Flight not found" });
    }

    const data = results[0];

    // Ensure airport records exist (upsert in case seed didn't cover them)
    for (const code of [data.departureCode, data.arrivalCode]) {
      const exists = await prisma.airport.findUnique({
        where: { iataCode: code },
      });
      if (!exists) {
        await prisma.airport.create({
          data: {
            iataCode: code,
            name: code,
            city: code,
            country: "Unknown",
            latitude: 0,
            longitude: 0,
            timezone: "UTC",
          },
        });
      }
    }

    // Ensure airline record exists
    const airlineExists = await prisma.airline.findUnique({
      where: { iataCode: data.airlineCode },
    });
    if (!airlineExists) {
      await prisma.airline.create({
        data: {
          iataCode: data.airlineCode,
          name: data.airlineCode,
        },
      });
    }

    const flight = await prisma.flight.create({
      data: {
        userId: req.user!.id,
        flightNumber: data.flightNumber,
        date: new Date(date),
        airlineCode: data.airlineCode,
        departureCode: data.departureCode,
        arrivalCode: data.arrivalCode,
        scheduledDeparture: data.scheduledDeparture
          ? new Date(data.scheduledDeparture)
          : null,
        actualDeparture: data.actualDeparture
          ? new Date(data.actualDeparture)
          : null,
        scheduledArrival: data.scheduledArrival
          ? new Date(data.scheduledArrival)
          : null,
        actualArrival: data.actualArrival
          ? new Date(data.actualArrival)
          : null,
        status: data.status,
        delayMinutes: data.delayMinutes,
        aircraftType: data.aircraftType,
        seatNumber: seatNumber || null,
        departureGate: data.departureGate,
        departureTerminal: data.departureTerminal,
        arrivalGate: data.arrivalGate,
        arrivalTerminal: data.arrivalTerminal,
        lastApiFetchAt: new Date(),
        apiCache: data.rawResponse,
      },
      include: { departure: true, arrival: true, airline: true },
    });

    // Recompute stats after adding a flight
    recomputeUserStats(req.user!.id).catch(console.error);

    res.status(201).json(flight);
  } catch (err) {
    console.error("Error adding flight:", err);
    res.status(500).json({ error: "Failed to add flight" });
  }
});

// Get precomputed user stats
router.get("/api/flights/stats", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await prisma.userStats.findUnique({
      where: { userId: req.user!.id },
    });

    if (!stats) {
      return res.json({
        totalFlights: 0,
        totalDistanceKm: 0,
        totalDurationMin: 0,
        uniqueAirlines: 0,
        uniqueAirports: 0,
        uniqueCountries: 0,
        uniqueContinents: 0,
      });
    }

    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Get single flight detail
router.get("/api/flights/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const flight = await prisma.flight.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { departure: true, arrival: true, airline: true },
    });

    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    res.json(flight);
  } catch (err) {
    console.error("Error fetching flight:", err);
    res.status(500).json({ error: "Failed to fetch flight" });
  }
});

// Force refresh flight status
router.post(
  "/api/flights/:id/refresh",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const flight = await prisma.flight.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });

      if (!flight) {
        return res.status(404).json({ error: "Flight not found" });
      }

      const dateStr = format(flight.date, "yyyy-MM-dd");
      const data = await getFlightStatus(flight.flightNumber, dateStr);

      if (!data) {
        return res
          .status(404)
          .json({ error: "Could not fetch updated status" });
      }

      const updated = await prisma.flight.update({
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
        include: { departure: true, arrival: true, airline: true },
      });

      res.json(updated);
    } catch (err) {
      console.error("Error refreshing flight:", err);
      res.status(500).json({ error: "Failed to refresh flight" });
    }
  }
);

// Delete a flight
router.delete("/api/flights/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const flight = await prisma.flight.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    await prisma.flight.delete({ where: { id: flight.id } });

    // Recompute stats after deleting a flight
    recomputeUserStats(req.user!.id).catch(console.error);

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting flight:", err);
    res.status(500).json({ error: "Failed to delete flight" });
  }
});

export default router;
