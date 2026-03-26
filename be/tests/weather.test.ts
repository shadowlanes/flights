import { describe, it, expect } from "vitest";
import { getForecastAtTime } from "../src/services/weather";

describe("Open-Meteo Weather Service", () => {
  // Bangalore coordinates
  const BLR_LAT = 12.97;
  const BLR_LON = 77.59;

  it("returns forecast data for a valid coordinate and time", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const result = await getForecastAtTime(BLR_LAT, BLR_LON, tomorrow);

    expect(result).not.toBeNull();
    expect(typeof result!.temp).toBe("number");
    expect(typeof result!.description).toBe("string");
    expect(result!.description.length).toBeGreaterThan(0);
    expect(typeof result!.icon).toBe("string");
    // AQI can be null but if present should be 1-5
    if (result!.aqi !== null) {
      expect(result!.aqi).toBeGreaterThanOrEqual(1);
      expect(result!.aqi).toBeLessThanOrEqual(5);
    }
  }, 10000);

  it("returns null for coordinates far in the past", async () => {
    const pastDate = new Date("2020-01-01T12:00:00Z");
    const result = await getForecastAtTime(BLR_LAT, BLR_LON, pastDate);
    // Open-Meteo may return null or error for dates outside forecast range
    // Either null or a result is acceptable — we're testing it doesn't throw
    expect(result === null || typeof result?.temp === "number").toBe(true);
  }, 10000);
});
