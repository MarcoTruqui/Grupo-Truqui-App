export const OCCUPANCY_LABEL = {occupied:"Ocupada", checkin:"Check-in mañana", available:"Disponible"};
export const OCCUPANCY_META = {
  occupied:{bg:"#FCEBEB", color:"#A32D2D", dot:"#A32D2D"},
  checkin:{bg:"#FAEEDA", color:"#854F0B", dot:"#BA7517"},
  available:{bg:"#EAF3DE", color:"#3B6D11", dot:"#1D9E75"}
};

export function mapSheetProp(sheetName) {
  const s = sheetName.trim();
  if (s.toLowerCase().startsWith("zantamar")) {
    const num = s.replace(/zantamar\s*/i, "").replace(/\.+$/, "").trim();
    return num || s;
  }
  return s;
}

export function parseDate(str) {
  if (!str) return null;
  const s = str.trim().replace(/"/g, "");
  /* Format: 8-may-2026 or 14-may-2026 */
  const spanishMatch = s.match(/(\d{1,2})-(\w{3,})-(\d{4})/);
  if (spanishMatch) {
    const months = {"ene":0,"feb":1,"mar":2,"abr":3,"may":4,"jun":5,"jul":6,"ago":7,"sep":8,"oct":9,"nov":10,"dic":11,"jan":0,"apr":3,"aug":7,"dec":11};
    const m = months[spanishMatch[2].toLowerCase().slice(0, 3)];
    if (m !== undefined) return new Date(parseInt(spanishMatch[3]), m, parseInt(spanishMatch[1]));
  }
  /* Format: 2026-05-08 (ISO) */
  const isoMatch = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  /* Format: 05/08/2026 or 5/8/2026 (US) */
  const usMatch = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) return new Date(parseInt(usMatch[3]), parseInt(usMatch[1]) - 1, parseInt(usMatch[2]));
  /* Format: 08/05/2026 (day/month/year) — try native parse as fallback */
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return null;
}

export function getOccupancy(bookings, bookingsLoaded, propName) {
  if (!bookingsLoaded) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const propBookings = bookings.filter(b => mapSheetProp(b.prop) === propName);
  for (const b of propBookings) {
    const ci = parseDate(b.checkin); const co = parseDate(b.checkout);
    if (!ci || !co) continue;
    ci.setHours(0, 0, 0, 0); co.setHours(0, 0, 0, 0);
    if (ci <= today && today < co) return "occupied";
  }
  for (const b of propBookings) {
    const ci = parseDate(b.checkin);
    if (!ci) continue;
    ci.setHours(0, 0, 0, 0);
    if (ci.getTime() === tomorrow.getTime()) return "checkin";
  }
  return "available";
}

export function getPropBookingDetails(bookings, bookingsLoaded, propName) {
  if (!bookingsLoaded) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const mapped = bookings.filter(b => mapSheetProp(b.prop) === propName).map(b => {
    const ci = parseDate(b.checkin); const co = parseDate(b.checkout);
    if (!ci || !co) return null;
    ci.setHours(0, 0, 0, 0); co.setHours(0, 0, 0, 0);
    return {...b, ciDate:ci, coDate:co};
  }).filter(Boolean).sort((a, b) => a.ciDate - b.ciDate);
  const current = mapped.find(b => b.ciDate <= today && today < b.coDate) || null;
  const upcoming = mapped.filter(b => b.ciDate > today).slice(0, 2);
  return {current, upcoming};
}
