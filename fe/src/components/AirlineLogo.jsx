import { useState } from "react";
import { Plane } from "lucide-react";

const SIZES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const ICON_SIZES = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function AirlineLogo({ code, size = "sm" }) {
  const [failed, setFailed] = useState(false);

  const containerClass = `${SIZES[size]} rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden shrink-0`;

  if (failed || !code) {
    return (
      <div className={containerClass}>
        <Plane className={`${ICON_SIZES[size]} text-white/40`} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <img
        src={`/airlines/${code.trim()}.png`}
        alt={code}
        className="w-full h-full object-contain p-1"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
