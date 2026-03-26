import axios from "axios";

export interface WeatherForecast {
  temp: number;
  description: string;
  icon: string;
  aqi: number | null; // 1-5 scale (EU AQI)
}

// WMO Weather interpretation codes → description + icon
// https://open-meteo.com/en/docs
const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "01d" },
  1: { description: "Mainly clear", icon: "02d" },
  2: { description: "Partly cloudy", icon: "03d" },
  3: { description: "Overcast", icon: "04d" },
  45: { description: "Fog", icon: "50d" },
  48: { description: "Depositing rime fog", icon: "50d" },
  51: { description: "Light drizzle", icon: "09d" },
  53: { description: "Moderate drizzle", icon: "09d" },
  55: { description: "Dense drizzle", icon: "09d" },
  61: { description: "Slight rain", icon: "10d" },
  63: { description: "Moderate rain", icon: "10d" },
  65: { description: "Heavy rain", icon: "10d" },
  66: { description: "Light freezing rain", icon: "13d" },
  67: { description: "Heavy freezing rain", icon: "13d" },
  71: { description: "Slight snow", icon: "13d" },
  73: { description: "Moderate snow", icon: "13d" },
  75: { description: "Heavy snow", icon: "13d" },
  77: { description: "Snow grains", icon: "13d" },
  80: { description: "Slight rain showers", icon: "09d" },
  81: { description: "Moderate rain showers", icon: "09d" },
  82: { description: "Violent rain showers", icon: "09d" },
  85: { description: "Slight snow showers", icon: "13d" },
  86: { description: "Heavy snow showers", icon: "13d" },
  95: { description: "Thunderstorm", icon: "11d" },
  96: { description: "Thunderstorm with slight hail", icon: "11d" },
  99: { description: "Thunderstorm with heavy hail", icon: "11d" },
};

/**
 * Fetch weather forecast + AQI for a specific time at given coordinates
 * using Open-Meteo (free, no API key required).
 */
export async function getForecastAtTime(
  lat: number,
  lon: number,
  targetTime: Date
): Promise<WeatherForecast | null> {
  try {
    const dateStr = targetTime.toISOString().slice(0, 10); // YYYY-MM-DD

    // Fetch weather forecast and AQI in parallel
    const [weatherRes, aqiRes] = await Promise.all([
      axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: "temperature_2m,weather_code",
          start_date: dateStr,
          end_date: dateStr,
          timezone: "UTC",
        },
        timeout: 5000,
      }),
      axios
        .get("https://air-quality-api.open-meteo.com/v1/air-quality", {
          params: {
            latitude: lat,
            longitude: lon,
            hourly: "european_aqi",
            start_date: dateStr,
            end_date: dateStr,
            timezone: "UTC",
          },
          timeout: 5000,
        })
        .catch(() => null),
    ]);

    const hourly = weatherRes.data?.hourly;
    if (!hourly?.time?.length) return null;

    // Find the hour closest to the target time
    const targetHour = targetTime.getUTCHours();
    const idx = Math.min(targetHour, hourly.time.length - 1);

    const temp = Math.round(hourly.temperature_2m[idx]);
    const weatherCode = hourly.weather_code[idx] ?? 0;
    const wmo = WMO_CODES[weatherCode] || WMO_CODES[0];

    // Extract AQI for the same hour
    let aqi: number | null = null;
    if (aqiRes?.data?.hourly?.european_aqi) {
      const aqiValue = aqiRes.data.hourly.european_aqi[idx];
      if (aqiValue != null) {
        // Convert EU AQI numeric value to 1-5 scale
        // EU AQI: 0-20=Good(1), 20-40=Fair(2), 40-60=Moderate(3), 60-80=Poor(4), 80+=VeryPoor(5)
        if (aqiValue <= 20) aqi = 1;
        else if (aqiValue <= 40) aqi = 2;
        else if (aqiValue <= 60) aqi = 3;
        else if (aqiValue <= 80) aqi = 4;
        else aqi = 5;
      }
    }

    return {
      temp,
      description: wmo.description,
      icon: wmo.icon,
      aqi,
    };
  } catch {
    return null;
  }
}
