import axios from "axios";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

// Simple in-memory cache with 30-min TTL
const cache = new Map<string, { data: WeatherData; expiry: number }>();
const TTL_MS = 30 * 60 * 1000;

export async function getWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) return null;

  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  try {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: "metric",
        },
        timeout: 5000,
      }
    );

    const data: WeatherData = {
      temp: Math.round(res.data.main.temp),
      description: res.data.weather?.[0]?.description || "",
      icon: res.data.weather?.[0]?.icon || "",
      humidity: res.data.main.humidity,
      windSpeed: Math.round(res.data.wind?.speed || 0),
    };

    cache.set(cacheKey, { data, expiry: Date.now() + TTL_MS });
    return data;
  } catch {
    return null;
  }
}
