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
