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
    accent: "stat-accent-blue",
  },
  {
    key: "totalDistanceKm",
    label: "Distance",
    icon: Globe,
    format: (v) => `${formatDistance(v)} km`,
    color: "text-emerald-400",
    accent: "stat-accent-emerald",
  },
  {
    key: "totalDurationMin",
    label: "Time in Air",
    icon: Clock,
    format: (v) => formatDuration(v),
    color: "text-amber-400",
    accent: "stat-accent-amber",
  },
  {
    key: "uniqueAirlines",
    label: "Airlines",
    icon: Building2,
    format: (v) => v.toString(),
    color: "text-purple-400",
    accent: "stat-accent-purple",
  },
  {
    key: "uniqueCountries",
    label: "Countries",
    icon: Flag,
    format: (v) => v.toString(),
    color: "text-rose-400",
    accent: "stat-accent-rose",
  },
  {
    key: "uniqueContinents",
    label: "Continents",
    icon: Map,
    format: (v) => v.toString(),
    color: "text-cyan-400",
    accent: "stat-accent-cyan",
  },
  {
    key: "uniqueAirports",
    label: "Airports",
    icon: MapPin,
    format: (v) => v.toString(),
    color: "text-orange-400",
    accent: "stat-accent-orange",
  },
];

export default function FlightStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <div className="skeleton h-4 w-4 mb-3" />
            <div className="skeleton h-6 w-16 mb-1.5" />
            <div className="skeleton h-3 w-12" />
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
            className={`glass-card stat-accent ${cfg.accent} rounded-xl p-4 animate-stagger-in`}
            style={{ "--stagger-index": i }}
          >
            <Icon
              className={`w-4 h-4 ${cfg.color} mb-3 opacity-70`}
              strokeWidth={1.5}
            />
            <div className="heading-lg tracking-tight">
              {cfg.format(value)}
            </div>
            <div className="label-caps mt-1">
              {cfg.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
