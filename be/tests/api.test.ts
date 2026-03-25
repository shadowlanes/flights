import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Health & Public Endpoints", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });

  it("GET /api/airports?q=JFK returns JFK airport", async () => {
    const res = await request(app).get("/api/airports?q=JFK");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].iataCode).toBe("JFK");
    expect(res.body[0].city).toBe("New York");
  });

  it("GET /api/airports?q= without query returns 400", async () => {
    const res = await request(app).get("/api/airports?q=");
    expect(res.status).toBe(400);
  });

  it("GET /api/airports?q=London returns multiple airports", async () => {
    const res = await request(app).get("/api/airports?q=London");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Protected Flight Endpoints (no auth)", () => {
  it("GET /api/flights returns 401 without auth", async () => {
    const res = await request(app).get("/api/flights");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("GET /api/flights/archive returns 401 without auth", async () => {
    const res = await request(app).get("/api/flights/archive");
    expect(res.status).toBe(401);
  });

  it("POST /api/flights/search returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/flights/search")
      .send({ flightNumber: "AA100", date: "2026-03-26" });
    expect(res.status).toBe(401);
  });

  it("POST /api/flights returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/flights")
      .send({ flightNumber: "AA100", date: "2026-03-26" });
    expect(res.status).toBe(401);
  });

  it("GET /api/flights/:id returns 401 without auth", async () => {
    const res = await request(app).get("/api/flights/some-id");
    expect(res.status).toBe(401);
  });

  it("POST /api/flights/:id/refresh returns 401 without auth", async () => {
    const res = await request(app).post("/api/flights/some-id/refresh");
    expect(res.status).toBe(401);
  });

  it("DELETE /api/flights/:id returns 401 without auth", async () => {
    const res = await request(app).delete("/api/flights/some-id");
    expect(res.status).toBe(401);
  });

  it("GET /api/flights/stats returns 401 without auth", async () => {
    const res = await request(app).get("/api/flights/stats");
    expect(res.status).toBe(401);
  });

  it("GET /api/flights/:id/weather returns 401 without auth", async () => {
    const res = await request(app).get("/api/flights/some-id/weather");
    expect(res.status).toBe(401);
  });
});
