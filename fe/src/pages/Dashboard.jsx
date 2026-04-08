import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { api } from "../lib/api";
import FlightCard from "../components/FlightCard";
import { Map } from "@/components/ui/map";
import { FlightRoutes, getAirportInfo } from "@/components/ui/flight";

function formatDistance(km) {
  if (km >= 1000) return `${(km / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return km.toLocaleString();
}

function formatDuration(totalMin) {
  return `${Math.floor(totalMin / 60).toLocaleString()}h`;
}

function GlobeHero({ flights, stats, statsLoading }) {
  const { routes, center, zoom } = useMemo(() => {
    const routes = [];
    const allLngs = [];
    const allLats = [];

    for (const f of flights) {
      const dep = f.departure;
      const arr = f.arrival;
      if (!dep?.latitude || !arr?.latitude) continue;
      const fromRef = dep.iataCode && getAirportInfo(dep.iataCode) ? dep.iataCode : [dep.longitude, dep.latitude];
      const toRef = arr.iataCode && getAirportInfo(arr.iataCode) ? arr.iataCode : [arr.longitude, arr.latitude];
      routes.push({ from: fromRef, to: toRef });
      allLngs.push(dep.longitude, arr.longitude);
      allLats.push(dep.latitude, arr.latitude);
    }

    if (routes.length === 0) return { routes: [], center: [0, 20], zoom: 1.5 };

    const centerLng = (Math.min(...allLngs) + Math.max(...allLngs)) / 2;
    const centerLat = (Math.min(...allLats) + Math.max(...allLats)) / 2;
    const lngSpan = Math.max(...allLngs) - Math.min(...allLngs);
    const latSpan = Math.max(...allLats) - Math.min(...allLats);
    const maxSpan = Math.max(lngSpan, latSpan);
    const rawZoom = maxSpan > 200 ? 1.5 : maxSpan > 100 ? 1.8 : maxSpan > 50 ? 2.2 : 2.5;
    const zoom = Math.min(rawZoom, 2.5);

    return { routes, center: [centerLng, centerLat], zoom };
  }, [flights]);

  if (routes.length === 0) return null;

  const statItems = stats ? [
    { label: "Flights", value: stats.totalFlights.toLocaleString() },
    { label: "Distance", value: `${formatDistance(stats.totalDistanceKm)} km` },
    { label: "Time in Air", value: formatDuration(stats.totalDurationMin) },
    { label: "Countries", value: stats.uniqueCountries.toString() },
    { label: "Airports", value: stats.uniqueAirports.toString() },
  ] : [];

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: 650 }}>
      <Map
        className="h-full w-full"
        theme="dark"
        center={center}
        zoom={zoom}
        projection={{ type: "globe" }}
        attributionControl={false}
      >
        <FlightRoutes
          routes={routes}
          color="rgba(59, 130, 246, 0.4)"
          width={1.5}
          showAirports
          showLabel
        />
      </Map>

      {/* Stats overlay at bottom */}
      {!statsLoading && stats && stats.totalFlights > 0 && (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-5 px-6">
            <div className="flex items-center justify-center gap-6 text-sm">
              {statItems.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">{item.value}</span>
                  <span className="text-white/50 text-xs uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [flights, setFlights] = useState([]);
  const [archivedFlights, setArchivedFlights] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFlights = useCallback(async () => {
    try {
      const data = await api.get("/api/flights");
      setFlights(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get("/api/flights/stats");
      setStats(data);
    } catch {
      // Stats failing is non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchArchive = useCallback(async () => {
    try {
      const data = await api.get("/api/flights/archive");
      setArchivedFlights(data);
    } catch {
      // Archive failing is non-critical for dashboard
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    fetchStats();
    fetchArchive();
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, [fetchFlights, fetchStats, fetchArchive]);

  const allFlightsForGlobe = useMemo(
    () => [...archivedFlights, ...flights],
    [archivedFlights, flights]
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton rounded-2xl" style={{ height: 650 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-flat rounded-2xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchFlights}
          className="btn-glass"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {flights.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="heading-xl">Upcoming Flights</h1>
            <span className="label-caps">
              {flights.length} flight{flights.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-4">
            {flights.map((flight, i) => (
              <FlightCard key={flight.id} flight={flight} index={i} />
            ))}
          </div>
        </div>
      )}

      {!archiveLoading && allFlightsForGlobe.length > 0 && (
        <GlobeHero
          flights={allFlightsForGlobe}
          stats={stats}
          statsLoading={statsLoading}
        />
      )}
    </div>
  );
}
