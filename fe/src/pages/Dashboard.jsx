import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Plane,
  ArrowRight,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";

function StatusBadge({ status }) {
  const config = {
    Scheduled: { bg: "bg-white/[0.06]", text: "text-muted-foreground", glow: "" },
    Boarding: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "glow-blue" },
    Departed: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "glow-blue" },
    InAir: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "glow-blue animate-pulse-glow" },
    Landed: { bg: "bg-green-500/10", text: "text-green-400", glow: "glow-green" },
    Arrived: { bg: "bg-green-500/10", text: "text-green-400", glow: "glow-green" },
    Cancelled: { bg: "bg-red-500/10", text: "text-red-400", glow: "glow-red" },
    Diverted: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "glow-amber" },
  };
  const c = config[status] || config.Scheduled;

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text} ${c.glow}`}>
      {status === "InAir" ? "In Air" : status}
    </span>
  );
}

function FlightCard({ flight }) {
  const dep = flight.departure;
  const arr = flight.arrival;

  function formatTime(isoStr) {
    if (!isoStr) return "--:--";
    try {
      return new Date(isoStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  }

  return (
    <Link
      to={`/flights/${flight.id}`}
      className="block glass-card rounded-2xl p-5 space-y-4"
    >
      {/* Top row: airline + flight number + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Plane className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <div
              className="font-semibold"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {flight.flightNumber}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {flight.airline?.name || flight.airlineCode}
            </div>
          </div>
        </div>
        <StatusBadge status={flight.status} />
      </div>

      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div
            className="text-xl font-semibold"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            {flight.departureCode}
          </div>
          <div className="text-xs text-muted-foreground">{dep?.city || ""}</div>
          <div className="text-xs text-muted-foreground/70 mt-0.5">
            {formatTime(flight.actualDeparture || flight.scheduledDeparture)}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          <ArrowRight className="w-3 h-3 text-muted-foreground/30 shrink-0" strokeWidth={1.5} />
          <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
        </div>

        <div className="flex-1 text-right">
          <div
            className="text-xl font-semibold"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            {flight.arrivalCode}
          </div>
          <div className="text-xs text-muted-foreground">{arr?.city || ""}</div>
          <div className="text-xs text-muted-foreground/70 mt-0.5">
            {formatTime(flight.actualArrival || flight.scheduledArrival)}
          </div>
        </div>
      </div>

      {/* Bottom row: date + extras */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {format(new Date(flight.date), "MMM d, yyyy")}
        </div>
        <div className="flex items-center gap-3">
          {flight.aircraftType && (
            <span>{flight.aircraftType}</span>
          )}
          {flight.seatNumber && (
            <span>Seat {flight.seatNumber}</span>
          )}
          {flight.departureGate && (
            <span>Gate {flight.departureGate}</span>
          )}
        </div>
      </div>

      {/* Delay indicator */}
      {flight.delayMinutes > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/[0.06] border border-amber-400/[0.08] text-xs text-amber-300">
          <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={1.5} />
          Delayed {flight.delayMinutes} min
        </div>
      )}
    </Link>
  );
}

export default function Dashboard() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04]" />
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-white/[0.04]" />
                <div className="h-3 w-28 rounded bg-white/[0.03]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-12 rounded bg-white/[0.04]" />
              <div className="flex-1 h-px bg-white/[0.04]" />
              <div className="h-8 w-12 rounded bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchFlights}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
          Retry
        </button>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="glass-card rounded-2xl p-12 text-center max-w-md space-y-5">
          <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Plane className="w-7 h-7 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
          <div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              No upcoming flights
            </h2>
            <p className="text-sm text-muted-foreground">
              Add your first flight to start tracking
            </p>
          </div>
          <Link
            to="/flights/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-blue-300 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            Add a flight
          </Link>
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
          Upcoming Flights
        </h1>
        <span className="text-xs text-muted-foreground/50">
          {flights.length} flight{flights.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
}
