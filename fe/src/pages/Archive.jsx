import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Archive,
  AlertCircle,
} from "lucide-react";
import { api } from "../lib/api";
import AirlineLogo from "../components/AirlineLogo";
import StatusBadge from "../components/StatusBadge";
import { format } from "date-fns";

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

export default function ArchivePage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <h1 className="heading-xl">Past Flights</h1>

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
