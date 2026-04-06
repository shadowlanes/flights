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
import StatusBadge from "../components/StatusBadge";
import { format } from "date-fns";
import { Map } from "@/components/ui/map";
import { FlightRoutes, getAirportInfo } from "@/components/ui/flight";

function FlightListItem({ flight, index = 0 }) {
  const dep = flight.departure;
  const arr = flight.arrival;

  return (
    <Link
      to={`/archive/${flight.id}`}
      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-200 cursor-pointer animate-stagger-in"
      style={{ "--stagger-index": index }}
    >
      <AirlineLogo code={flight.airlineCode} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="heading-sm">{flight.flightNumber}</span>
          <span className="text-xs text-muted-foreground/30">·</span>
          <span className="text-xs text-muted-foreground truncate">
            {dep?.city || flight.departureCode} to {arr?.city || flight.arrivalCode}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground/40 mt-0.5">
          {format(new Date(flight.date), "d MMM yyyy")}
          {flight.airline?.name && ` · ${flight.airline.name}`}
        </div>
      </div>

      <StatusBadge status={flight.status} />
    </Link>
  );
}

function RouteMap({ flights }) {
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

  if (routes.length === 0) return null;

  const centerLng = (Math.min(...allLngs) + Math.max(...allLngs)) / 2;
  const centerLat = (Math.min(...allLats) + Math.max(...allLats)) / 2;
  const lngSpan = Math.max(...allLngs) - Math.min(...allLngs);
  const latSpan = Math.max(...allLats) - Math.min(...allLats);
  const maxSpan = Math.max(lngSpan, latSpan);
  const zoom = maxSpan > 200 ? 0.8 : maxSpan > 100 ? 1.5 : maxSpan > 50 ? 2.5 : maxSpan > 20 ? 3.5 : 4.5;

  return (
    <div className="card-flat rounded-2xl overflow-hidden" style={{ height: 400 }}>
      <Map
        className="h-full w-full"
        theme="dark"
        center={[centerLng, centerLat]}
        zoom={zoom}
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
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="skeleton w-8 h-8 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-flat rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="card-flat rounded-2xl p-12 text-center max-w-md space-y-5">
          <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center animate-float">
            <Archive className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="heading-lg mb-2">No past flights</h2>
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
        <h1 className="heading-xl">Past Flights</h1>

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
        <div className="label-caps">
          {flights.length} flight{flights.length !== 1 ? "s" : ""}
        </div>
        {flights.map((flight, i) => (
          <FlightListItem key={flight.id} flight={flight} index={i} />
        ))}
      </div>
    </div>
  );
}
