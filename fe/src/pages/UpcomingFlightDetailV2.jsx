import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import StatusBadge from "../components/StatusBadge";
import AirlineLogo from "../components/AirlineLogo";
import {
  Plane,
  RefreshCw,
  Trash2,
  Clock,
  AlertCircle,
  Armchair,
  Loader2,
  X,
  DoorOpen,
  Building2,
} from "lucide-react";
import { api } from "../lib/api";
import {
  formatTime,
  formatRelativeTime,
  formatDelayStatus,
  formatDuration,
  computeDistanceKm,
  computeGreatCircleArc,
  computeTimezoneChange,
} from "../lib/time";
import { format } from "date-fns";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function RouteMap({ departure, arrival }) {
  if (!departure?.latitude || !arrival?.latitude) return null;
  const from = [departure.latitude, departure.longitude];
  const to = [arrival.latitude, arrival.longitude];
  const latPad = Math.abs(from[0] - to[0]) * 0.3 + 2;
  const lonPad = Math.abs(from[1] - to[1]) * 0.3 + 2;
  const bounds = [
    [Math.min(from[0], to[0]) - latPad, Math.min(from[1], to[1]) - lonPad],
    [Math.max(from[0], to[0]) + latPad, Math.max(from[1], to[1]) + lonPad],
  ];
  return (
    <div className="card-flat rounded-2xl overflow-hidden" style={{ height: 200 }}>
      <MapContainer
        bounds={bounds}
        style={{ height: "100%", width: "100%", background: "#000" }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          opacity={0.5}
        />
        <Polyline
          positions={computeGreatCircleArc(departure, arrival)}
          pathOptions={{ color: "rgba(59,130,246,0.6)", weight: 2 }}
        />
        {/* Departure marker (blue) */}
        <CircleMarker
          center={from}
          radius={4}
          pathOptions={{
            fillColor: "rgba(59,130,246,0.9)",
            fillOpacity: 1,
            color: "rgba(59,130,246,0.3)",
            weight: 6,
          }}
        />
        {/* Arrival marker (emerald) */}
        <CircleMarker
          center={to}
          radius={4}
          pathOptions={{
            fillColor: "rgba(52,211,153,0.9)",
            fillOpacity: 1,
            color: "rgba(52,211,153,0.3)",
            weight: 6,
          }}
        />
      </MapContainer>
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

export default function UpcomingFlightDetailV2() {
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4 animate-fade-up">
        <div className="card-flat rounded-2xl overflow-hidden">
          {/* Header strip skeleton */}
          <div className="px-5 py-3 bg-white/[0.04] flex items-center justify-between">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
          {/* Route hero skeleton */}
          <div className="px-5 py-6 flex items-center justify-between">
            <div className="skeleton h-10 w-20" />
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-10 w-20" />
          </div>
          {/* Time row skeleton */}
          <div className="px-5 py-4 border-t border-white/[0.06] flex justify-between">
            <div className="space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-6 w-20" />
            </div>
            <div className="space-y-2 items-end flex flex-col">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-6 w-20" />
            </div>
          </div>
          {/* Tear line */}
          <div className="boarding-pass-tear" />
          {/* Stub skeleton */}
          <div className="px-5 py-4 flex justify-between">
            <div className="space-y-1.5">
              <div className="skeleton h-2.5 w-12" />
              <div className="skeleton h-5 w-16" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-2.5 w-10" />
              <div className="skeleton h-5 w-10" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-2.5 w-10" />
              <div className="skeleton h-5 w-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
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
  const depDelay = formatDelayStatus(flight.scheduledDeparture, flight.actualDeparture, flight.delayMinutes);
  const depDisplayTime = flight.actualDeparture || flight.scheduledDeparture;
  const arrDisplayTime = flight.actualArrival || flight.scheduledArrival;
  const depTimeChanged = flight.actualDeparture && flight.scheduledDeparture && flight.actualDeparture !== flight.scheduledDeparture;
  const arrTimeChanged = flight.actualArrival && flight.scheduledArrival && flight.actualArrival !== flight.scheduledArrival;

  return (
    <div className="max-w-lg mx-auto space-y-4 animate-fade-up">
      {/* Close button */}
      <div className="flex justify-end px-1">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* ===== BOARDING PASS CARD ===== */}
      <div className="card-flat rounded-2xl overflow-hidden">

        {/* A. Header Strip */}
        <div className="px-5 py-3 bg-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="label-caps">Boarding Pass</span>
            <span className="text-muted-foreground/20">·</span>
            <span className="label-caps">{dateStr}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={flight.status} />
            <AirlineLogo code={flight.airlineCode} size="sm" />
          </div>
        </div>

        {/* B. Route Hero */}
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            {/* Departure */}
            <div>
              <div className="code-display text-4xl tracking-tight">{flight.departureCode}</div>
              <div className="text-sm text-muted-foreground mt-1">{dep?.city || flight.departureCode}</div>
            </div>

            {/* Center connector */}
            <div className="flex-1 mx-4 flex flex-col items-center gap-1.5">
              <span className="label-caps">{flight.flightNumber}</span>
              <div className="w-full flex items-center gap-0">
                <div className="flex-1 h-px bg-white/[0.1]" />
                <Plane className="w-4 h-4 text-blue-400 mx-1.5 shrink-0" strokeWidth={1.5} />
                <div className="flex-1 h-px bg-white/[0.1]" />
              </div>
              <span className="text-xs text-muted-foreground/40">
                {[duration, distKm ? `${distKm.toLocaleString()} km` : null].filter(Boolean).join(" · ")}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <div className="code-display text-4xl tracking-tight">{flight.arrivalCode}</div>
              <div className="text-sm text-muted-foreground mt-1">{arr?.city || flight.arrivalCode}</div>
            </div>
          </div>
        </div>

        {/* C. Time Row */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex justify-between">
          {/* Departure time */}
          <div>
            <div className="label-caps mb-1">Departs</div>
            <div className={`heading-lg ${depDelay.color === "red" ? "text-late" : depDelay.color === "green" ? "text-on-time" : ""}`}>
              {formatTime(depDisplayTime)}
            </div>
            {depTimeChanged && (
              <div className="text-xs text-muted-foreground/40 line-through mt-0.5">
                {formatTime(flight.scheduledDeparture)}
              </div>
            )}
            {flight.delayMinutes > 0 && (
              <div className="text-xs text-late mt-0.5">{flight.delayMinutes}m late</div>
            )}
            <div className="text-xs text-muted-foreground/50 mt-1">
              {formatRelativeTime(depDisplayTime)}
            </div>
          </div>

          {/* Arrival time */}
          <div className="text-right">
            <div className="label-caps mb-1">Arrives</div>
            <div className="heading-lg">{formatTime(arrDisplayTime)}</div>
            {arrTimeChanged && (
              <div className="text-xs text-muted-foreground/40 line-through mt-0.5">
                {formatTime(flight.scheduledArrival)}
              </div>
            )}
          </div>
        </div>

        {/* D. Detail Grid */}
        {(flight.departureGate || flight.departureTerminal || flight.aircraftType || flight.seatNumber) && (
          <div className="px-5 pb-5 grid grid-cols-2 gap-3">
            {flight.departureGate && (
              <InfoItem icon={DoorOpen} label="Gate" value={flight.departureGate} />
            )}
            {flight.departureTerminal && (
              <InfoItem icon={Building2} label="Terminal" value={flight.departureTerminal} />
            )}
            {flight.aircraftType && (
              <InfoItem icon={Plane} label="Aircraft" value={flight.aircraftType} />
            )}
            {flight.seatNumber && (
              <InfoItem icon={Armchair} label="Seat" value={flight.seatNumber} />
            )}
          </div>
        )}

        {/* --- Tear Line --- */}
        <div className="boarding-pass-tear" />

        {/* E. Stub Section */}
        <div className="px-5 py-4 bg-white/[0.02] flex justify-between">
          <div>
            <div className="label-caps mb-1">Flight</div>
            <div className="heading-md">{flight.flightNumber}</div>
          </div>
          <div className="text-center">
            <div className="label-caps mb-1">Seat</div>
            <div className="heading-md">{flight.seatNumber || "--"}</div>
          </div>
          <div className="text-right">
            <div className="label-caps mb-1">Gate</div>
            <div className="heading-md">{flight.departureGate || "TBD"}</div>
          </div>
        </div>
      </div>

      {/* ===== CARDS BELOW THE BOARDING PASS ===== */}

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

      {/* Delay banner */}
      {flight.delayMinutes > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/[0.06] border border-red-400/[0.1] text-sm text-late">
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          Delayed by {flight.delayMinutes} minutes
        </div>
      )}

      {/* Route map */}
      <RouteMap departure={dep} arrival={arr} />

      {/* Future: Sun-side tip, miles earned, seat map */}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pb-4">
        <button onClick={handleRefresh} disabled={refreshing} className="btn-glass flex-1">
          {refreshing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin-smooth" strokeWidth={1.5} />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button onClick={handleDelete} disabled={deleting} className="btn-glass btn-danger flex-1">
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          {deleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
