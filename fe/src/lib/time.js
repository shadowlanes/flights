/**
 * Format a date as relative time: "in 6h 50m", "2h 21m ago", "now"
 */
export function formatRelativeTime(isoDate) {
  if (!isoDate) return "";
  const now = Date.now();
  const target = new Date(isoDate).getTime();
  const diffMs = target - now;
  const absDiff = Math.abs(diffMs);
  const suffix = diffMs > 0 ? "from now" : "ago";

  if (absDiff < 60000) return "now";

  const totalMin = Math.floor(absDiff / 60000);
  const totalHrs = Math.floor(totalMin / 60);
  const totalDays = Math.floor(totalHrs / 24);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = Math.floor(totalDays / 30);
  const totalYears = Math.floor(totalDays / 365);

  let str;
  if (totalYears >= 1) {
    str = totalYears === 1 ? "1 year" : `${totalYears} years`;
  } else if (totalMonths >= 1) {
    str = totalMonths === 1 ? "1 month" : `${totalMonths} months`;
  } else if (totalWeeks >= 1) {
    str = totalWeeks === 1 ? "1 week" : `${totalWeeks} weeks`;
  } else if (totalDays >= 1) {
    str = totalDays === 1 ? "1 day" : `${totalDays} days`;
  } else if (totalHrs >= 1) {
    const mins = totalMin % 60;
    str = mins > 0 ? `${totalHrs}h ${mins}m` : `${totalHrs}h`;
  } else {
    str = `${totalMin}m`;
  }

  return diffMs > 0 ? `in ${str}` : `${str} ${suffix}`;
}

/**
 * Compute delay status from scheduled vs actual times
 * Returns { label, color } where color is "green" | "red" | "neutral"
 */
export function formatDelayStatus(scheduledTime, actualTime, delayMinutes) {
  if (delayMinutes != null && delayMinutes > 0) {
    return { label: `${delayMinutes}m late`, color: "red" };
  }

  if (actualTime && scheduledTime) {
    const diff = new Date(actualTime).getTime() - new Date(scheduledTime).getTime();
    const mins = Math.round(diff / 60000);
    if (mins > 5) return { label: `${mins}m late`, color: "red" };
    if (mins < -2) return { label: `${Math.abs(mins)}m early`, color: "green" };
  }

  return { label: "On Time", color: "green" };
}

/**
 * Format ISO time to local time string: "3:20 PM"
 */
export function formatTime(isoStr) {
  if (!isoStr) return "--:--";
  try {
    return new Date(isoStr).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

/**
 * Format duration in minutes to "Xh Xm"
 */
export function formatDuration(depIso, arrIso) {
  if (!depIso || !arrIso) return null;
  const diff = new Date(arrIso).getTime() - new Date(depIso).getTime();
  if (diff <= 0) return null;
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Compute distance between two airports (haversine)
 */
export function computeDistanceKm(dep, arr) {
  if (!dep?.latitude || !arr?.latitude) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(arr.latitude - dep.latitude);
  const dLon = toRad(arr.longitude - dep.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(dep.latitude)) *
      Math.cos(toRad(arr.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Compute great circle arc between two airports.
 * Returns array of [lat, lon] pairs for a curved geodesic path.
 * Uses spherical linear interpolation (slerp).
 */
export function computeGreatCircleArc(dep, arr, numPoints = 50) {
  if (!dep?.latitude || !arr?.latitude) return [];

  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;

  const lat1 = toRad(dep.latitude);
  const lon1 = toRad(dep.longitude);
  const lat2 = toRad(arr.latitude);
  const lon2 = toRad(arr.longitude);

  // Angular distance between points
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
      )
    );

  // If points are very close, just return a straight line
  if (d < 0.001) return [[dep.latitude, dep.longitude], [arr.latitude, arr.longitude]];

  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDeg(Math.atan2(y, x));
    points.push([lat, lon]);
  }

  return points;
}

/**
 * Compute timezone difference between departure and arrival airports.
 * Returns { diff: "+5h 30m", sign: "+" } or null if same timezone.
 */
export function computeTimezoneChange(depTimezone, arrTimezone) {
  if (!depTimezone || !arrTimezone || depTimezone === arrTimezone) return null;

  // Get UTC offset in minutes for each timezone at a fixed reference time
  const ref = new Date("2026-06-15T12:00:00Z"); // Use summer to handle DST
  const getOffset = (tz) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(ref);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (!tzPart) return 0;
    // Parse "GMT+5:30" or "GMT-8" or "GMT"
    const match = tzPart.value.match(/GMT([+-]?)(\d+)?(?::(\d+))?/);
    if (!match) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    const hours = parseInt(match[2] || "0");
    const mins = parseInt(match[3] || "0");
    return sign * (hours * 60 + mins);
  };

  const depOffset = getOffset(depTimezone);
  const arrOffset = getOffset(arrTimezone);
  const diffMin = arrOffset - depOffset;

  if (diffMin === 0) return null;

  const sign = diffMin > 0 ? "+" : "\u2212"; // use minus sign character
  const absDiff = Math.abs(diffMin);
  const hrs = Math.floor(absDiff / 60);
  const mins = absDiff % 60;
  const diff = mins > 0 ? `${sign}${hrs}h ${mins}m` : `${sign}${hrs}h`;

  return { diff, label: `${diff} Timezone Change` };
}
