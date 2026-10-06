// Vihar helpers: parse the dd/mm/yy date, classify upcoming/today/past,
// format display strings, and derive the volunteer target.

import type { Vihar } from "@/src/shared/models";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Parse "dd/mm/yy", "dd/mm/yyyy" or ISO "yyyy-mm-dd" into a local Date at
// midnight. Returns null if unparseable.
export function parseViharDate(s?: string): Date | null {
  if (!s) return null;
  const parts = s.split(/[/\-.]/).map((p) => p.trim());
  if (parts.length < 3) return null;
  const nums = parts.map((p) => parseInt(p, 10));
  if (nums.some((n) => isNaN(n))) return null;
  let d: number, m: number, y: number;
  if (parts[0].length === 4) {
    // ISO: yyyy-mm-dd
    [y, m, d] = nums;
  } else {
    // dd/mm/yy(yy)
    [d, m, y] = nums;
    if (y < 100) y += 2000;
  }
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function isToday(v: Vihar): boolean {
  const d = parseViharDate(v.vihar_date);
  if (!d) return false;
  return d.getTime() === startOfToday().getTime();
}

export function isUpcoming(v: Vihar): boolean {
  const d = parseViharDate(v.vihar_date);
  if (!d) return false;
  return d.getTime() >= startOfToday().getTime();
}

export function isPast(v: Vihar): boolean {
  const d = parseViharDate(v.vihar_date);
  if (!d) return false;
  return d.getTime() < startOfToday().getTime();
}

export function formatDateShort(v: Vihar): string {
  const d = parseViharDate(v.vihar_date);
  if (!d) return v.vihar_date || "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateLong(v: Vihar): string {
  const d = parseViharDate(v.vihar_date);
  if (!d) return v.vihar_date || "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Time -> "સવારે 5:30" / "સાંજે 6:00" style prefix based on hour.
export function formatTime(v: Vihar, lang: "gu" | "en"): string {
  const time = v.vihar_time || "";
  const hour = parseInt(time.split(/[:.]/)[0] || "0", 10);
  const morning = lang === "gu" ? "સવારે" : "AM";
  const evening = lang === "gu" ? "સાંજે" : "PM";
  const prefix = hour < 12 ? morning : evening;
  if (lang === "gu") return `${prefix} ${time}`;
  return `${time} ${prefix}`;
}

// Volunteer target: the production backend has no "required volunteers" field,
// so we estimate it from the people needing help on the route.
export function volunteerTarget(v: Vihar): number {
  const t = (v.sadhu_bhagvant || 0) + (v.sadhviji_bhagvant || 0) + (v.wheelchair || 0);
  return Math.max(2, t);
}

// Count of opted-in participants (only populated for admins via API).
export function joinedCount(v: Vihar): number {
  if (v.participants && v.participants.length) {
    return v.participants.filter((p) => p.status === "in").length;
  }
  // Fallback for non-admins: we only know our own status.
  return v.user_status === "in" ? 1 : 0;
}

export function sortByDateAsc(a: Vihar, b: Vihar): number {
  const da = parseViharDate(a.vihar_date)?.getTime() ?? 0;
  const db = parseViharDate(b.vihar_date)?.getTime() ?? 0;
  return da - db;
}

export function sortByDateDesc(a: Vihar, b: Vihar): number {
  return -sortByDateAsc(a, b);
}
