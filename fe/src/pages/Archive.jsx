import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Archive,
  Plane,
  ArrowRight,
  Clock,
  MapIcon,
  List,
  AlertCircle,
} from "lucide-react";
import { api } from "../lib/api";
import AirlineLogo from "../components/AirlineLogo";
import { format } from "date-fns";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function FlightListItem({ flight }) {
  return (
    <Link
      to={`/flights/${flight.id}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group"
    >
      <AirlineLogo code={flight.airlineCode} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-semibold text-sm"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            {flight.flightNumber}
          </span>
          <span className="text-muted-foreground/30">/</span>
          <span className="text-sm text-muted-foreground">
            {flight.departureCode}
          </span>
          <ArrowRight className="w-3 h-3 text-muted-foreground/30" strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">
            {flight.arrivalCode}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 mt-0.5">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {format(new Date(flight.date), "MMM d, yyyy")}
          {flight.airline?.name && (
            <>
              <span className="text-muted-foreground/20">{"\u00B7"}</span>
              {flight.airline.name}
            </>
          )}
        </div>
      </div>

      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/[0.06] text-green-400/60">
        {flight.status}
      </span>
    </Link>
  );
}

function RouteMap({ flights }) {
  // Collect unique airports and routes
  const airports = new Map();
  const routes = [];

  for (const f of flights) {
    const dep = f.departure;
    const arr = f.arrival;
    if (!dep || !arr) continue;

    if (dep.latitude && dep.longitude) {
      const key = dep.iataCode;
      if (!airports.has(key)) {
        airports.set(key, { ...dep, count: 0 });
      }
      airports.get(key).count++;
    }
    if (arr.latitude && arr.longitude) {
      const key = arr.iataCode;
      if (!airports.has(key)) {
        airports.set(key, { ...arr, count: 0 });
      }
      airports.get(key).count++;
    }

    if (dep.latitude && dep.longitude && arr.latitude && arr.longitude) {
      routes.push({
        from: [dep.latitude, dep.longitude],
        to: [arr.latitude, arr.longitude],
        flight: f,
      });
    }
  }

  if (routes.length === 0) return null;

  // Compute bounds
  const allPoints = routes.flatMap((r) => [r.from, r.to]);
  const lats = allPoints.map((p) => p[0]);
  const lons = allPoints.map((p) => p[1]);
  const bounds = [
    [Math.min(...lats) - 5, Math.min(...lons) - 10],
    [Math.max(...lats) + 5, Math.max(...lons) + 10],
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden" style={{ height: 400 }}>
      <MapContainer
        bounds={bounds}
        style={{ height: "100%", width: "100%", background: "hsl(225, 25%, 6%)" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          opacity={0.6}
        />

        {/* Flight routes */}
        {routes.map((route, i) => (
          <Polyline
            key={i}
            positions={[route.from, route.to]}
            pathOptions={{
              color: "rgba(59, 130, 246, 0.4)",
              weight: 1.5,
              dashArray: "4 6",
            }}
          >
            <Popup>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>
                {route.flight.flightNumber} — {format(new Date(route.flight.date), "MMM d, yyyy")}
              </span>
            </Popup>
          </Polyline>
        ))}

        {/* Airport markers */}
        {Array.from(airports.values()).map((apt) => (
          <CircleMarker
            key={apt.iataCode}
            center={[apt.latitude, apt.longitude]}
            radius={4}
            pathOptions={{
              fillColor: "rgba(59, 130, 246, 0.7)",
              fillOpacity: 1,
              color: "rgba(59, 130, 246, 0.3)",
              weight: 6,
            }}
          >
            <Popup>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                <strong>{apt.iataCode}</strong> — {apt.city}
                <br />
                {apt.count} flight{apt.count !== 1 ? "s" : ""}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default function ArchivePage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list"); // "list" | "map"

  useEffect(() => {
    async function fetch() {
      try {
        const data = await api.get("/api/flights/archive");
        setFlights(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="glass-card rounded-2xl p-12 text-center max-w-md space-y-5">
          <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Archive className="w-7 h-7 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
          <div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              No past flights
            </h2>
            <p className="text-sm text-muted-foreground">
              Completed flights will appear here automatically
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Past Flights
        </h1>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              view === "list"
                ? "bg-white/[0.08] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setView("map")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              view === "map"
                ? "bg-white/[0.08] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapIcon className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {view === "map" && <RouteMap flights={flights} />}

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground/50 uppercase tracking-wider">
          {flights.length} flight{flights.length !== 1 ? "s" : ""}
        </div>
        {flights.map((flight) => (
          <FlightListItem key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
}
