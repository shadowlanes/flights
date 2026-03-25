import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// Search airports by IATA code or name
router.get("/api/airports", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();

    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const airports = await prisma.airport.findMany({
      where: {
        OR: [
          { iataCode: { equals: q.toUpperCase(), mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { iataCode: "asc" },
    });

    res.json(airports);
  } catch (err) {
    console.error("Error searching airports:", err);
    res.status(500).json({ error: "Failed to search airports" });
  }
});

export default router;
