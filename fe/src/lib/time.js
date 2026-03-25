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
