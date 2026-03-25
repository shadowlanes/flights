import {
  Plane,
  Globe,
  Clock,
  Building2,
  Flag,
  Map,
  MapPin,
} from "lucide-react";

function formatDistance(km) {
  if (km >= 1000) {
    return `${(km / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return km.toLocaleString();
}

function formatDuration(totalMin) {
  const hrs = Math.floor(totalMin / 60);
  return `${hrs.toLocaleString()}h`;
}

const STATS_CONFIG = [
  {
    key: "totalFlights",
    label: "Flights",
    icon: Plane,
    format: (v) => v.toLocaleString(),
    color: "text-blue-400",
    glowClass: "",
  },
  {
    key: "totalDistanceKm",
    label: "Distance",
    icon: Globe,
    format: (v) => `${formatDistance(v)} km`,
    color: "text-emerald-400",
    glowClass: "",
  },
  {
    key: "totalDurationMin",
    label: "Time in Air",
    icon: Clock,
    format: (v) => formatDuration(v),
    color: "text-amber-400",
    glowClass: "",
  },
  {
    key: "uniqueAirlines",
    label: "Airlines",
    icon: Building2,
    format: (v) => v.toString(),
    color: "text-purple-400",
    glowClass: "",
  },
  {
    key: "uniqueCountries",
    label: "Countries",
    icon: Flag,
    format: (v) => v.toString(),
    color: "text-rose-400",
    glowClass: "",
  },
  {
    key: "uniqueContinents",
    label: "Continents",
    icon: Map,
    format: (v) => v.toString(),
    color: "text-cyan-400",
    glowClass: "",
  },
  {
    key: "uniqueAirports",
    label: "Airports",
    icon: MapPin,
    format: (v) => v.toString(),
    color: "text-orange-400",
    glowClass: "",
  },
];

export default function FlightStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-xl p-4 animate-pulse"
          >
            <div className="h-4 w-4 rounded bg-white/[0.04] mb-3" />
            <div className="h-6 w-16 rounded bg-white/[0.04] mb-1.5" />
            <div className="h-3 w-12 rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats || stats.totalFlights === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STATS_CONFIG.map((cfg, i) => {
        const Icon = cfg.icon;
        const value = stats[cfg.key] ?? 0;

        return (
          <div
            key={cfg.key}
            className="glass-card rounded-xl p-4 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
          >
            <Icon
              className={`w-4 h-4 ${cfg.color} mb-3 opacity-70`}
              strokeWidth={1.5}
            />
            <div
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {cfg.format(value)}
            </div>
            <div className="text-[11px] text-muted-foreground/50 mt-0.5">
              {cfg.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
