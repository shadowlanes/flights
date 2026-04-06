import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import StatusBadge from "../components/StatusBadge";
import AirlineLogo from "../components/AirlineLogo";
import {
  Plane,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Clock,
  AlertCircle,
  MapPin,
  Armchair,
  Loader2,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import {
  formatTime,
  formatRelativeTime,
  formatDelayStatus,
  formatDuration,
  computeDistanceKm,
  computeTimezoneChange,
} from "../lib/time";
import { format } from "date-fns";
import { Map } from "@/components/ui/map";
import { FlightRoute } from "@/components/ui/flight";

function RouteMap({ departure, arrival }) {
  if (!departure?.latitude || !arrival?.latitude) return null;
  const from = [departure.longitude, departure.latitude];
  const to = [arrival.longitude, arrival.latitude];
  const centerLng = (from[0] + to[0]) / 2;
  const centerLat = (from[1] + to[1]) / 2;
  const lngSpan = Math.abs(from[0] - to[0]);
  const latSpan = Math.abs(from[1] - to[1]);
  const maxSpan = Math.max(lngSpan, latSpan);
  const zoom = maxSpan > 100 ? 1.5 : maxSpan > 50 ? 2.5 : maxSpan > 20 ? 3.5 : maxSpan > 10 ? 4.5 : 5.5;
  return (
    <div className="card-flat rounded-2xl overflow-hidden" style={{ height: 200 }}>
      <Map
        className="h-full w-full"
        theme="dark"
        center={[centerLng, centerLat]}
        zoom={zoom}
        interactive={false}
        attributionControl={false}
      >
        <FlightRoute
          from={from}
          to={to}
          color="rgba(59,130,246,0.6)"
          width={2}
          showAirports
          hoverEffect={false}
          animate
        />
      </Map>
    </div>
  );
}

function AirportBlock({ airport, code, scheduledTime, actualTime, delayMinutes, gate, terminal, isTop }) {
  const delay = formatDelayStatus(scheduledTime, actualTime, delayMinutes);
  const displayTime = actualTime || scheduledTime;
  const relTime = formatRelativeTime(displayTime);
  const showStrikethrough = actualTime && scheduledTime && actualTime !== scheduledTime;

  return (
    <div className="flex gap-4">
      {/* Dot + line */}
      <div className="w-2 flex flex-col items-center pt-2 shrink-0">
        <div className="route-dot route-dot-dep" />
        {isTop && <div className="route-line flex-1 mt-1 min-h-6" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <div className="flex items-baseline justify-between gap-4">
          {/* Airport code */}
          <div className="code-display text-3xl tracking-tight">
            {code}
          </div>

          {/* Time display */}
          <div className="text-right">
            <span className={`code-display text-2xl ${delay.color === "red" ? "text-late" : delay.color === "green" ? "text-on-time" : ""}`}>
              {formatTime(displayTime)}
            </span>
            {showStrikethrough && (
              <span className="block text-xs text-muted-foreground/40 line-through">
                {formatTime(scheduledTime)}
              </span>
            )}
            {delayMinutes > 0 && (
              <span className="block text-xs text-late mt-0.5">
                {delayMinutes}m late
              </span>
            )}
          </div>
        </div>

        {/* Airport name */}
        <div className="text-sm text-muted-foreground mt-1">
          {airport?.name || code}
        </div>

        {/* Terminal + Gate */}
        <div className="flex items-center gap-2 mt-1.5">
          {terminal && (
            <span className="text-xs text-muted-foreground/60">
              Terminal {terminal}
            </span>
          )}
          {terminal && gate && (
            <span className="text-muted-foreground/20">·</span>
          )}
          {gate && (
            <span className="gate-badge text-xs">Gate {gate}</span>
          )}
        </div>

        {/* Relative time */}
        {relTime && (
          <div className="text-xs text-muted-foreground/50 mt-1">
            {relTime}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArchivedFlightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchFlight = useCallback(async () => {
    try {
      const data = await api.get(`/api/flights/${id}`);
      setFlight(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFlight();
    // Fetch weather for non-archived flights
    if (!flight?.isArchived) {
      api.get(`/api/flights/${id}/weather`).then(setWeather).catch(() => {});
    }
    const interval = setInterval(() => {
      if (flight && !flight.isArchived) fetchFlight();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchFlight, flight?.isArchived]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const data = await api.post(`/api/flights/${id}/refresh`);
      setFlight(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Remove this flight?")) return;
    setDeleting(true);
    try {
      await api.del(`/api/flights/${id}`);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-up">
        <div className="card-flat rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-32" />
            </div>
          </div>
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="skeleton w-2 h-24 rounded" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-8 w-20" />
                <div className="skeleton h-4 w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="max-w-lg mx-auto card-flat rounded-2xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!flight) return null;

  const dep = flight.departure;
  const arr = flight.arrival;
  const duration = formatDuration(flight.scheduledDeparture, flight.scheduledArrival);
  const distKm = computeDistanceKm(dep, arr);
  const dateStr = format(new Date(flight.date), "EEE, d MMM").toUpperCase();

  return (
    <div className="max-w-lg mx-auto space-y-4 animate-fade-up">
      {/* Header */}
      <div className="card-flat rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <AirlineLogo code={flight.airlineCode} size="md" />
            <div>
              <div className="label-caps">
                {dateStr} {"\u00B7"} {flight.flightNumber}
              </div>
              <div className="heading-lg mt-0.5">
                {dep?.city || flight.departureCode} to {arr?.city || flight.arrivalCode}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Status banner */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <StatusBadge status={flight.status} />
            {flight.status !== "Cancelled" && duration && (
              <span className="text-sm text-muted-foreground">
                {flight.isArchived
                  ? duration
                  : formatRelativeTime(flight.scheduledDeparture)}
              </span>
            )}
          </div>
          {flight.departureGate && (
            <span className="gate-badge">
              {"\u2708"} {flight.departureGate}
            </span>
          )}
        </div>
      </div>

      {/* Timezone change notice */}
      {dep?.timezone && arr?.timezone && (() => {
        const tz = computeTimezoneChange(dep.timezone, arr.timezone);
        if (!tz) return null;
        return (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm">
            <Clock className="w-4 h-4 text-muted-foreground/50 shrink-0" strokeWidth={1.5} />
            <span className="text-muted-foreground">{tz.label}</span>
          </div>
        );
      })()}

      {/* Arrival weather */}
      {weather && !flight.isArchived && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm">
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
            alt={weather.description}
            className="w-8 h-8 -ml-1"
          />
          <div>
            <span className="font-medium">{weather.temp}°C</span>
            <span className="text-muted-foreground ml-1.5 capitalize">{weather.description}</span>
          </div>
          <span className="text-muted-foreground/40 text-xs ml-auto">
            at {arr?.city || flight.arrivalCode}
          </span>
        </div>
      )}

      {/* Route card — vertical layout */}
      <div className="card-flat rounded-2xl p-5">
        {/* Departure */}
        <AirportBlock
          airport={dep}
          code={flight.departureCode}
          scheduledTime={flight.scheduledDeparture}
          actualTime={flight.actualDeparture}
          delayMinutes={flight.delayMinutes}
          gate={flight.departureGate}
          terminal={flight.departureTerminal}
          isTop={true}
        />

        {/* Route summary */}
        <div className="flex gap-4">
          <div className="w-2 flex flex-col items-center shrink-0">
            <div className="route-line flex-1 min-h-4" />
          </div>
          <div className="py-3 flex-1">
            <div className="text-xs text-muted-foreground/40">
              {[
                duration ? `Total ${duration}` : null,
                distKm ? `${distKm.toLocaleString()} km` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </div>

        {/* Arrival */}
        <AirportBlock
          airport={arr}
          code={flight.arrivalCode}
          scheduledTime={flight.scheduledArrival}
          actualTime={flight.actualArrival}
          delayMinutes={null}
          gate={flight.arrivalGate}
          terminal={flight.arrivalTerminal}
          isTop={false}
        />
      </div>

      {/* Delay banner */}
      {flight.delayMinutes > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/[0.06] border border-red-400/[0.1] text-sm text-late">
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          Delayed by {flight.delayMinutes} minutes
        </div>
      )}

      {/* Route map */}
      <RouteMap departure={dep} arrival={arr} />

      {/* Info grid */}
      {(flight.aircraftType || flight.seatNumber) && (
        <div className="card-flat rounded-2xl p-5">
          <div className="label-caps mb-3">Flight Info</div>
          <div className="grid grid-cols-2 gap-3">
            {flight.aircraftType && (
              <InfoItem icon={Plane} label="Aircraft" value={flight.aircraftType} />
            )}
            {flight.seatNumber && (
              <InfoItem icon={Armchair} label="Seat" value={flight.seatNumber} />
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pb-4">
        {!flight.isArchived && (
          <button onClick={handleRefresh} disabled={refreshing} className="btn-glass flex-1">
            {refreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin-smooth" strokeWidth={1.5} />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        )}
        <button onClick={handleDelete} disabled={deleting} className="btn-glass btn-danger flex-1">
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          {deleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-muted-foreground/40" strokeWidth={1.5} />
        <span className="label-caps">{label}</span>
      </div>
      <div className="heading-sm">{value}</div>
    </div>
  );
}
