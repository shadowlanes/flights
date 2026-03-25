import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import StatusBadge from "../components/StatusBadge";
import {
  Plane,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Clock,
  ArrowRight,
  AlertCircle,
  MapPin,
  Armchair,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";

function TimelineStep({ label, scheduled, actual, isCompleted, isCurrent }) {
  function fmtTime(iso) {
    if (!iso) return "--:--";
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center mt-1">
        <div
          className={`w-3 h-3 rounded-full border-2 ${
            isCurrent
              ? "border-blue-400 bg-blue-400/30 glow-blue"
              : isCompleted
              ? "border-green-400 bg-green-400/30"
              : "border-white/20 bg-transparent"
          }`}
        />
        <div className="w-px h-8 bg-white/[0.06]" />
      </div>
      <div className="pb-5 -mt-0.5">
        <div className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">
          {label}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {fmtTime(actual || scheduled)}
          </span>
          {actual && scheduled && actual !== scheduled && (
            <span className="text-[11px] text-muted-foreground/40 line-through">
              {fmtTime(scheduled)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
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
    // Poll for non-archived flights
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
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl p-8 animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04]" />
            <div className="space-y-2">
              <div className="h-5 w-24 rounded bg-white/[0.04]" />
              <div className="h-3 w-32 rounded bg-white/[0.03]" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-16 rounded bg-white/[0.04]" />
            <div className="flex-1 h-px bg-white/[0.04]" />
            <div className="h-12 w-16 rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!flight) return null;

  const dep = flight.departure;
  const arr = flight.arrival;
  const isActive = ["Boarding", "Departed", "InAir"].includes(flight.status);
  const isComplete = ["Landed", "Arrived"].includes(flight.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        Back
      </button>

      {/* Main card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Plane className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
            </div>
            <div>
              <div
                className="text-2xl font-semibold"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {flight.flightNumber}
              </div>
              <div className="text-sm text-muted-foreground">
                {flight.airline?.name || flight.airlineCode}
                {" \u00B7 "}
                {format(new Date(flight.date), "MMM d, yyyy")}
              </div>
            </div>
          </div>
          <StatusBadge status={flight.status} />
        </div>

        {/* Route */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1">
            <div
              className="text-3xl font-bold"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {flight.departureCode}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{dep?.city || ""}</div>
            <div className="text-xs text-muted-foreground/50">{dep?.name || ""}</div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
          </div>

          <div className="flex-1 text-right">
            <div
              className="text-3xl font-bold"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {flight.arrivalCode}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{arr?.city || ""}</div>
            <div className="text-xs text-muted-foreground/50">{arr?.name || ""}</div>
          </div>
        </div>

        {/* Delay banner */}
        {flight.delayMinutes > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-400/[0.1] text-sm text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Delayed by {flight.delayMinutes} minutes
          </div>
        )}

        {/* Timeline */}
        <div className="pt-2">
          <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-4">
            Timeline
          </div>
          <TimelineStep
            label="Departure"
            scheduled={flight.scheduledDeparture}
            actual={flight.actualDeparture}
            isCompleted={!!flight.actualDeparture || isActive || isComplete}
            isCurrent={flight.status === "Boarding" || flight.status === "Departed"}
          />
          <TimelineStep
            label="In Flight"
            scheduled={null}
            actual={null}
            isCompleted={isComplete}
            isCurrent={flight.status === "InAir"}
          />
          <TimelineStep
            label="Arrival"
            scheduled={flight.scheduledArrival}
            actual={flight.actualArrival}
            isCompleted={isComplete}
            isCurrent={false}
          />
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
          {flight.aircraftType && (
            <InfoItem icon={Plane} label="Aircraft" value={flight.aircraftType} />
          )}
          {flight.seatNumber && (
            <InfoItem icon={Armchair} label="Seat" value={flight.seatNumber} />
          )}
          {flight.departureGate && (
            <InfoItem icon={MapPin} label="Dep. Gate" value={`${flight.departureTerminal ? `T${flight.departureTerminal} / ` : ""}G${flight.departureGate}`} />
          )}
          {flight.arrivalGate && (
            <InfoItem icon={MapPin} label="Arr. Gate" value={`${flight.arrivalTerminal ? `T${flight.arrivalTerminal} / ` : ""}G${flight.arrivalGate}`} />
          )}
          {flight.scheduledDeparture && (
            <InfoItem
              icon={Clock}
              label="Duration"
              value={(() => {
                if (!flight.scheduledDeparture || !flight.scheduledArrival) return "--";
                const diff = new Date(flight.scheduledArrival) - new Date(flight.scheduledDeparture);
                const hrs = Math.floor(diff / 3600000);
                const mins = Math.floor((diff % 3600000) / 60000);
                return `${hrs}h ${mins}m`;
              })()}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 cursor-pointer disabled:opacity-40"
          >
            {refreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
            {refreshing ? "Refreshing..." : "Refresh Status"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 bg-red-500/[0.04] border border-red-400/[0.08] hover:border-red-400/[0.15] transition-all duration-300 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-muted-foreground/40" strokeWidth={1.5} />
        <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
