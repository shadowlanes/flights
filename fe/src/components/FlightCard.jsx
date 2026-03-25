import { Link } from "react-router";
import { Plane, ArrowRight, Clock, AlertCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { format } from "date-fns";

function formatTime(isoStr) {
  if (!isoStr) return "--:--";
  try {
    return new Date(isoStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

export default function FlightCard({ flight }) {
  const dep = flight.departure;
  const arr = flight.arrival;

  return (
    <Link
      to={`/flights/${flight.id}`}
      className="block glass-card rounded-2xl p-5 space-y-4"
    >
      {/* Top row */}
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
          <ArrowRight
            className="w-3 h-3 text-muted-foreground/30 shrink-0"
            strokeWidth={1.5}
          />
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

      {/* Bottom row */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {format(new Date(flight.date), "MMM d, yyyy")}
        </div>
        <div className="flex items-center gap-3">
          {flight.aircraftType && <span>{flight.aircraftType}</span>}
          {flight.seatNumber && <span>Seat {flight.seatNumber}</span>}
          {flight.departureGate && <span>Gate {flight.departureGate}</span>}
        </div>
      </div>

      {/* Delay */}
      {flight.delayMinutes > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/[0.06] border border-amber-400/[0.08] text-xs text-amber-300">
          <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={1.5} />
          Delayed {flight.delayMinutes} min
        </div>
      )}
    </Link>
  );
}
