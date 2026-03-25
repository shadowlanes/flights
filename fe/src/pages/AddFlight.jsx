import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Plane, Loader2, AlertCircle } from "lucide-react";
import AirlineLogo from "../components/AirlineLogo";
import StatusBadge from "../components/StatusBadge";
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
      return new Date(isoStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="heading-xl">Add Flight</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="glass-card rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label-caps">Flight Number</label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              placeholder="AA 100"
              className="input-glass code-display text-base tracking-wider"
            />
          </div>
          <div className="space-y-2">
            <label className="label-caps">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-glass"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="label-caps">
            Seat Number <span className="opacity-60">(optional)</span>
          </label>
          <input
            type="text"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value.toUpperCase())}
            placeholder="14A"
            className="input-glass code-display tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={searching || !flightNumber.trim()}
          className="btn-glass btn-primary w-full py-3"
        >
          {searching ? (
            <Loader2 className="w-4 h-4 animate-spin-smooth" />
          ) : (
            <Search className="w-4 h-4" strokeWidth={1.5} />
          )}
          {searching ? "Searching..." : "Search Flight"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-red-500/[0.08] border border-red-400/[0.12] text-sm text-red-300 animate-fade-up">
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {error}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="label-caps">
            {results.length === 1 ? "Flight found" : `${results.length} flights found`}
          </h2>
          {results.map((flight, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 space-y-5 animate-stagger-in"
              style={{ "--stagger-index": i }}
            >
              {/* Route header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AirlineLogo code={flight.airlineCode} size="md" />
                  <div>
                    <div className="heading-lg">{flight.flightNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {flight.aircraftType || "Aircraft TBD"}
                    </div>
                  </div>
                </div>
                <StatusBadge status={flight.status} />
              </div>

              {/* Route visualization */}
              <div className="flex items-center gap-4">
                <div className="text-center flex-1">
                  <div className="code-display text-2xl">{flight.departureCode}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(flight.scheduledDeparture)}
                  </div>
                  {flight.departureTerminal && (
                    <div className="text-[10px] text-muted-foreground/50 mt-0.5">
                      T{flight.departureTerminal}
                      {flight.departureGate ? ` / G${flight.departureGate}` : ""}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-1 justify-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-400/20 via-blue-400/10 to-transparent" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/30 shrink-0" />
                  <div className="h-px w-4 bg-blue-400/15 shrink-0" />
                  <div className="h-px w-2 bg-blue-400/10 shrink-0" />
                  <div className="h-px flex-1 bg-gradient-to-l from-blue-400/20 via-blue-400/10 to-transparent" />
                </div>

                <div className="text-center flex-1">
                  <div className="code-display text-2xl">{flight.arrivalCode}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(flight.scheduledArrival)}
                  </div>
                  {flight.arrivalTerminal && (
                    <div className="text-[10px] text-muted-foreground/50 mt-0.5">
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
                className="btn-glass btn-success w-full py-3"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin-smooth" />
                ) : (
                  <Plane className="w-4 h-4" strokeWidth={1.5} />
                )}
                {adding ? "Adding..." : "Add to My Flights"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
