import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Plane,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { api } from "../lib/api";
import FlightCard from "../components/FlightCard";
import FlightStats from "../components/FlightStats";

export default function Dashboard() {
  const [flights, setFlights] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
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

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get("/api/flights/stats");
      setStats(data);
    } catch {
      // Stats failing is non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    fetchStats();
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, [fetchFlights, fetchStats]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-9 h-9 rounded-lg" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-20" />
                  <div className="skeleton h-3 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="skeleton h-8 w-14" />
                <div className="flex-1 h-px bg-white/[0.04]" />
                <div className="skeleton h-8 w-14" />
              </div>
            </div>
          ))}
        </div>
        <FlightStats loading={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchFlights}
          className="btn-glass"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
          Retry
        </button>
      </div>
    );
  }

  // No upcoming flights — show stats as hero + add button
  if (flights.length === 0) {
    return (
      <div className="space-y-10">
        {(stats?.totalFlights > 0 || statsLoading) && (
          <div className="space-y-4">
            <h2 className="heading-lg text-muted-foreground/70">Your Journey</h2>
            <FlightStats stats={stats} loading={statsLoading} />
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-12">
          <div className="glass-card rounded-2xl p-10 text-center max-w-md space-y-5">
            <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center animate-float">
              <Plane className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="heading-lg mb-2">No upcoming flights</h2>
              <p className="text-sm text-muted-foreground">
                Add a flight to start tracking
              </p>
            </div>
            <Link to="/flights/add" className="btn-glass btn-primary px-5 py-2.5">
              Add a flight
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Upcoming flights + stats below
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-xl">Upcoming Flights</h1>
          <span className="label-caps">
            {flights.length} flight{flights.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-4">
          {flights.map((flight, i) => (
            <FlightCard key={flight.id} flight={flight} index={i} />
          ))}
        </div>
      </div>

      {(stats?.totalFlights > 0 || statsLoading) && (
        <div className="space-y-4">
          <div className="divider-glow" />
          <h2 className="heading-lg text-muted-foreground/70">Your Journey</h2>
          <FlightStats stats={stats} loading={statsLoading} />
        </div>
      )}
    </div>
  );
}
