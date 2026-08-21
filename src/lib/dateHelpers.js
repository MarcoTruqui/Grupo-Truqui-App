/* Local-calendar-date ISO strings (YYYY-MM-DD) — deliberately NOT toISOString(), which
   reports the UTC date. In a timezone behind UTC (e.g. Mexico, UTC-6), toISOString()
   rolls over to "tomorrow" hours before local midnight — "today" would start ticking
   over around 6pm local instead of 12am. These use the Date object's local getters
   (getFullYear/getMonth/getDate) so the date string always matches the wall clock. */
function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function todayISO() { return localISO(new Date()); }
export function daysAgoISO(n) { const d = new Date(); d.setDate(d.getDate() - n); return localISO(d); }
export function startOfWeekISO() { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); return localISO(d); }
export function startOfMonthISO() { const d = new Date(); d.setDate(1); return localISO(d); }
/* Same local-date fix, but for converting an existing full timestamp (e.g. a stored
   uploadedAt) down to its local calendar date — .slice(0,10) on that timestamp
   would give the UTC date instead, same bug as above. */
export function localDateISO(iso) { if (!iso) return ""; return localISO(new Date(iso)); }

export function fmtDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {day:"numeric", month:"short"}) + " " + d.toLocaleTimeString("es-MX", {hour:"2-digit", minute:"2-digit"});
  } catch {
    return "";
  }
}

export function fmtDuration(ms) {
  if (ms == null || ms < 0) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "<1 min";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}
