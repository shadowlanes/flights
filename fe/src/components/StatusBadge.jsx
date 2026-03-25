const STATUS_CONFIG = {
  Scheduled: { bg: "bg-white/[0.06]", text: "text-muted-foreground", glow: "" },
  Boarding: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "glow-blue" },
  Departed: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "glow-blue" },
  InAir: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "glow-blue animate-pulse-glow" },
  Landed: { bg: "bg-green-500/10", text: "text-green-400", glow: "glow-green" },
  Arrived: { bg: "bg-green-500/10", text: "text-green-400", glow: "glow-green" },
  Cancelled: { bg: "bg-red-500/10", text: "text-red-400", glow: "glow-red" },
  Diverted: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "glow-amber" },
};

export default function StatusBadge({ status, className = "" }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.Scheduled;
  const label = status === "InAir" ? "In Air" : status;

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text} ${c.glow} ${className}`}
    >
      {label}
    </span>
  );
}
