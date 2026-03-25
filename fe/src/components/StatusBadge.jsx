const STATUS_CONFIG = {
  Scheduled: {
    bg: "bg-white/[0.05]",
    text: "text-slate-400",
    border: "border-white/[0.06]",
    glow: "",
    dot: "bg-slate-400/50",
  },
  Boarding: {
    bg: "bg-blue-500/[0.08]",
    text: "text-blue-400",
    border: "border-blue-400/[0.15]",
    glow: "",
    dot: "bg-blue-400",
  },
  Departed: {
    bg: "bg-blue-500/[0.08]",
    text: "text-blue-400",
    border: "border-blue-400/[0.15]",
    glow: "",
    dot: "bg-blue-400",
  },
  InAir: {
    bg: "bg-blue-500/[0.1]",
    text: "text-blue-300",
    border: "border-blue-400/[0.2]",
    glow: "glow-blue",
    dot: "bg-blue-400 animate-pulse-glow",
  },
  Landed: {
    bg: "bg-emerald-500/[0.08]",
    text: "text-emerald-400",
    border: "border-emerald-400/[0.15]",
    glow: "",
    dot: "bg-emerald-400",
  },
  Arrived: {
    bg: "bg-emerald-500/[0.08]",
    text: "text-emerald-400",
    border: "border-emerald-400/[0.15]",
    glow: "",
    dot: "bg-emerald-400",
  },
  Cancelled: {
    bg: "bg-red-500/[0.08]",
    text: "text-red-400",
    border: "border-red-400/[0.15]",
    glow: "",
    dot: "bg-red-400",
  },
  Diverted: {
    bg: "bg-amber-500/[0.08]",
    text: "text-amber-400",
    border: "border-amber-400/[0.15]",
    glow: "",
    dot: "bg-amber-400",
  },
};

export default function StatusBadge({ status, className = "" }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.Scheduled;
  const label = status === "InAir" ? "In Air" : status;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        text-[11px] font-medium tracking-wide
        px-2.5 py-1 rounded-full
        border backdrop-blur-sm
        ${c.bg} ${c.text} ${c.border} ${c.glow}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}
