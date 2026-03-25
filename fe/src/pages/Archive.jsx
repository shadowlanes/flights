import { Archive } from "lucide-react";

export default function ArchivePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>
        Past Flights
      </h1>
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
          <Archive className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-muted-foreground">
          No past flights yet
        </p>
      </div>
    </div>
  );
}
