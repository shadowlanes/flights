import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Clock } from "lucide-react";
import StatusBadge from "./StatusBadge";
import AirlineLogo from "./AirlineLogo";
import { formatTime, formatDelayStatus, formatRelativeTime } from "../lib/time";
import { format } from "date-fns";

export default function FlightCard({ flight, index = 0 }) {
  const dep = flight.departure;
  const arr = flight.arrival;
  const delay = formatDelayStatus(
    flight.scheduledDeparture,
    flight.actualDeparture,
    flight.delayMinutes
  );

  // Live countdown that updates every minute
  const [countdown, setCountdown] = useState(() =>
    formatRelativeTime(flight.scheduledDeparture)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatRelativeTime(flight.scheduledDeparture));
    }, 60000);
    return () => clearInterval(interval);
  }, [flight.scheduledDeparture]);

  // Determine countdown color
  const isImminent =
    flight.scheduledDeparture &&
    new Date(flight.scheduledDeparture).getTime() - Date.now() < 60 * 60 * 1000 &&
    new Date(flight.scheduledDeparture).getTime() > Date.now();

  return (
    <Link
      to={`/flights/${flight.id}`}
      className="block card-flat rounded-2xl p-4 animate-stagger-in cursor-pointer"
      style={{ "--stagger-index": index }}
    >
      {/* Top: airline + flight number + status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <AirlineLogo code={flight.airlineCode} size="sm" />
          <div>
            <div className="heading-sm">{flight.flightNumber}</div>
            <div className="text-[11px] text-muted-foreground/50">
              {flight.airline?.name || flight.airlineCode}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${delay.color === "red" ? "text-late" : "text-on-time"}`}>
            {delay.label}
          </span>
        </div>
      </div>

      {/* Route: City to City */}
      <div className="text-sm text-foreground mb-2">
        {dep?.city || flight.departureCode} to {arr?.city || flight.arrivalCode}
      </div>

      {/* Departure + Arrival times */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">{flight.departureCode}</span>
        <span className={`font-medium ${delay.color === "red" ? "text-late" : "text-on-time"}`}>
          {formatTime(flight.actualDeparture || flight.scheduledDeparture)}
        </span>
        <span className="text-muted-foreground/30 mx-1">→</span>
        <span className="text-muted-foreground">{flight.arrivalCode}</span>
        <span className={`font-medium ${delay.color === "red" ? "text-late" : "text-on-time"}`}>
          {formatTime(flight.actualArrival || flight.scheduledArrival)}
        </span>
      </div>

      {/* Countdown + date row */}
      <div className="flex items-center justify-between mt-2.5">
        {countdown && (
          <span className={`text-xs font-medium ${isImminent ? "text-on-time" : "text-muted-foreground/50"}`}>
            {countdown}
          </span>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {format(new Date(flight.date), "EEE, d MMM")}
          {flight.departureGate && (
            <>
              <span className="text-muted-foreground/20">·</span>
              <span>Gate {flight.departureGate}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
