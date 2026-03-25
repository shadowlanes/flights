import { Plane } from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="glass-card rounded-2xl p-12 text-center max-w-md space-y-5">
        <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <Plane className="w-7 h-7 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            No upcoming flights
          </h2>
          <p className="text-sm text-muted-foreground">
            Add your first flight to start tracking
          </p>
        </div>
        <Link
          to="/flights/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-blue-300 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))",
            border: "1px solid rgba(59,130,246,0.18)",
          }}
        >
          Add a flight
        </Link>
      </div>
    </div>
  );
}
