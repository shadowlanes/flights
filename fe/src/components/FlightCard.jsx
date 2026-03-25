import { Link } from "react-router";
import { Clock, AlertCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";
import AirlineLogo from "./AirlineLogo";
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

export default function FlightCard({ flight, index = 0 }) {
  const dep = flight.departure;
  const arr = flight.arrival;

  return (
    <Link
      to={`/flights/${flight.id}`}
      className="block glass-card rounded-2xl p-5 space-y-4 animate-stagger-in cursor-pointer"
      style={{ "--stagger-index": index }}
    >
      {/* Header: airline + flight number + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AirlineLogo code={flight.airlineCode} size="sm" />
          <div>
            <div className="heading-md">{flight.flightNumber}</div>
            <div className="text-[11px] text-muted-foreground">
              {flight.airline?.name || flight.airlineCode}
            </div>
          </div>
        </div>
        <StatusBadge status={flight.status} />
      </div>

      {/* Route visualization */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="code-display text-xl">{flight.departureCode}</div>
          <div className="text-xs text-muted-foreground">{dep?.city || ""}</div>
          <div className="text-xs text-muted-foreground/60 mt-0.5">
            {formatTime(flight.actualDeparture || flight.scheduledDeparture)}
          </div>
        </div>

        {/* Flight path line */}
        <div className="flex items-center flex-1 justify-center gap-1">
          <div className="h-px flex-1 bg-gradient-to-r from-blue-400/20 via-blue-400/10 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400/30 shrink-0" />
          <div className="h-px w-4 bg-blue-400/15 shrink-0" />
          <div className="h-px w-2 bg-blue-400/10 shrink-0" />
          <div className="h-px flex-1 bg-gradient-to-l from-blue-400/20 via-blue-400/10 to-transparent" />
        </div>

        <div className="flex-1 text-right">
          <div className="code-display text-xl">{flight.arrivalCode}</div>
          <div className="text-xs text-muted-foreground">{arr?.city || ""}</div>
          <div className="text-xs text-muted-foreground/60 mt-0.5">
            {formatTime(flight.actualArrival || flight.scheduledArrival)}
          </div>
        </div>
      </div>

      {/* Footer: metadata */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/50">
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
