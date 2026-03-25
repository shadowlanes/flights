import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Plane, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import AirlineLogo from "../components/AirlineLogo";
import { api } from "../lib/api";
import { format } from "date-fns";

export default function AddFlight() {
  const navigate = useNavigate();
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [seatNumber, setSeatNumber] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!flightNumber.trim() || !date) return;

    setSearching(true);
    setError(null);
    setResults(null);

    try {
      const data = await api.post("/api/flights/search", {
        flightNumber: flightNumber.trim(),
        date,
      });
      setResults(data);
    } catch (err) {
      setError(
        err.status === 404
          ? "No flights found for that number and date"
          : err.message || "Search failed"
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(flightData) {
    setAdding(true);
    setError(null);
    try {
      const flight = await api.post("/api/flights", {
        flightNumber: flightData.flightNumber,
        date,
        seatNumber: seatNumber.trim() || undefined,
      });
      navigate(`/flights/${flight.id}`);
    } catch (err) {
      setError(err.message || "Failed to add flight");
      setAdding(false);
    }
  }

  function formatTime(isoStr) {
    if (!isoStr) return "--:--";
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1
        className="text-2xl font-semibold"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        Add Flight
      </h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="glass-card rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Flight Number
            </label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              placeholder="AA 100"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-400/30 focus:ring-1 focus:ring-blue-400/20 transition-all"
              style={{ fontFamily: "Outfit, sans-serif", fontSize: "1rem", letterSpacing: "0.05em" }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-blue-400/30 focus:ring-1 focus:ring-blue-400/20 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Seat Number <span className="text-muted-foreground/40">(optional)</span>
          </label>
          <input
            type="text"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value.toUpperCase())}
            placeholder="14A"
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-400/30 focus:ring-1 focus:ring-blue-400/20 transition-all"
            style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "0.05em" }}
          />
        </div>

        <button
          type="submit"
          disabled={searching || !flightNumber.trim()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.08))",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          {searching ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          )}
          <span className="text-blue-300">
            {searching ? "Searching..." : "Search Flight"}
          </span>
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-red-500/[0.08] border border-red-400/[0.12] text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {error}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {results.length === 1 ? "Flight found" : `${results.length} flights found`}
          </h2>
          {results.map((flight, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 space-y-5"
            >
              {/* Route header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AirlineLogo code={flight.airlineCode} size="md" />
                  <div>
                    <div
                      className="font-semibold text-lg"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {flight.flightNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {flight.aircraftType || "Aircraft TBD"}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    flight.status === "Scheduled"
                      ? "bg-white/[0.06] text-muted-foreground"
                      : flight.status === "InAir" || flight.status === "Departed"
                      ? "bg-blue-500/10 text-blue-400"
                      : flight.status === "Landed" || flight.status === "Arrived"
                      ? "bg-green-500/10 text-green-400"
                      : flight.status === "Cancelled"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-white/[0.06] text-muted-foreground"
                  }`}
                >
                  {flight.status}
                </span>
              </div>

              {/* Route visualization */}
              <div className="flex items-center gap-4">
                <div className="text-center flex-1">
                  <div
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {flight.departureCode}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(flight.scheduledDeparture)}
                  </div>
                  {flight.departureTerminal && (
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                      T{flight.departureTerminal}
                      {flight.departureGate ? ` / G${flight.departureGate}` : ""}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-1 justify-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <div className="text-center flex-1">
                  <div
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {flight.arrivalCode}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(flight.scheduledArrival)}
                  </div>
                  {flight.arrivalTerminal && (
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                      T{flight.arrivalTerminal}
                      {flight.arrivalGate ? ` / G${flight.arrivalGate}` : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* Delay warning */}
              {flight.delayMinutes > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.06] border border-amber-400/[0.1] text-xs text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  Delayed by {flight.delayMinutes} min
                </div>
              )}

              {/* Add button */}
              <button
                onClick={() => handleAdd(flight)}
                disabled={adding}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))",
                  border: "1px solid rgba(34,197,94,0.18)",
                }}
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                ) : (
                  <Plane className="w-4 h-4 text-green-400" strokeWidth={1.5} />
                )}
                <span className="text-green-300">
                  {adding ? "Adding..." : "Add to My Flights"}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
