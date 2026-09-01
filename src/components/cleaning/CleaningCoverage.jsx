import { useState } from "react";
import { CHECKOUT_ONLY_PROPERTIES, CLEANING_TYPE_LABEL, PROPERTY_GROUPS } from "../../lib/constants";
import { localISO, localDateISO, fmtDate } from "../../lib/dateHelpers";
import { getPropBookings } from "../../lib/bookingHelpers";
import { CleaningDetailSheet } from "./CleaningDetailSheet";

const DOW = ["L","M","M","J","V","S","D"];
const CHECKIN_RING = "#E87A30";
const CHECKOUT_RING = "#378ADD";

/* A calendar day can be a check-in day (orange ring — the guest arrives, no cleaning is
   expected that day), a checkout day (blue ring — needs a checkout clean sometime between
   checkout and whenever the next guest checks in, not necessarily that same day), an
   occupied "middle" night (needs a daily clean that same day, unless the property is
   checkout-only — Zantamar units), or irrelevant (nobody there — blank). A same-day
   turnover is both a check-in and a checkout at once (double ring), but only ever
   requires the checkout clean — check-in days never require cleaning of any kind. */
function classifyDays(bookingsForProp, isExempt) {
  const checkinSet = new Set();
  const checkoutInfo = {};
  const occupiedSet = new Set();
  bookingsForProp.forEach((b, i) => {
    checkinSet.add(localISO(b.ciDate));
    const coIso = localISO(b.coDate);
    const next = bookingsForProp[i + 1];
    checkoutInfo[coIso] = {windowEndIso: next ? localISO(next.ciDate) : null};
    if (!isExempt) {
      const start = new Date(b.ciDate); start.setDate(start.getDate() + 1);
      for (const d = new Date(start); d < b.coDate; d.setDate(d.getDate() + 1)) {
        occupiedSet.add(localISO(d));
      }
    }
  });
  Object.keys(checkoutInfo).forEach(iso => occupiedSet.delete(iso));
  checkinSet.forEach(iso => occupiedSet.delete(iso));
  return {checkinSet, checkoutInfo, occupiedSet};
}

/* Cleanings actually logged on a given calendar day — this is what gets shown/colored,
   regardless of which day the booking "expected" it, so a checkout clean registered a
   couple of days late shows up on the real day it happened, not silently folded into
   the checkout day's cell. */
function cleaningsOnDay(cleanings, property, iso) {
  return cleanings.filter(c => c.property === property && c.status === "completed" && c.completedAt && localDateISO(c.completedAt) === iso);
}
/* Only used to decide whether a checkout day itself should read as "missing" — checks the
   whole grace window (checkout date through the next check-in), not just that one day. */
function checkoutSatisfiedInWindow(cleanings, property, isoFrom, windowEndIso) {
  return cleanings.some(c => {
    if (c.property !== property || c.status !== "completed" || c.cleaningType !== "checkout" || !c.completedAt) return false;
    const cd = localDateISO(c.completedAt);
    return cd >= isoFrom && (!windowEndIso || cd <= windowEndIso);
  });
}

const STATUS_STYLE = {
  missing:    {bg:"#FCEBEB", color:"#A32D2D", icon:"✗"},
  dailyOk:    {bg:"#EAF3DE", color:"#3B6D11", icon:"✓"},
  checkoutOk: {bg:"#E6F1FB", color:"#185FA5", icon:"✓"},
  dup:        {bg:"#FAEEDA", color:"#854F0B", icon:"⚠"},
  future:     {bg:"#f5f5f7", color:"#bbb", icon:""},
  none:       {bg:"transparent", color:"#ccc", icon:""}
};

function PropertyGrid({property, bookingsForProp, cleanings, y, m, today, onSelectDay}) {
  const isExempt = CHECKOUT_ONLY_PROPERTIES.includes(property);
  const {checkinSet, checkoutInfo, occupiedSet} = classifyDays(bookingsForProp, isExempt);
  const hasActivity = checkinSet.size > 0 || Object.keys(checkoutInfo).length > 0 || occupiedSet.size > 0;

  const firstDow = new Date(y, m, 1).getDay();
  const dim = new Date(y, m + 1, 0).getDate();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  const cells = [...Array(offset).fill(null), ...Array.from({length: dim}, (_, i) => i + 1)];

  let missingCount = 0, dupCount = 0;

  const rendered = cells.map((d, i) => {
    if (!d) return <div key={"_" + i}/>;
    const dt = new Date(y, m, d);
    const iso = localISO(dt);
    const isCheckin = checkinSet.has(iso);
    const isCheckoutDay = !!checkoutInfo[iso];
    const isOccupiedMiddle = occupiedSet.has(iso);
    const isFuture = dt > today;
    const todaysCleanings = cleaningsOnDay(cleanings, property, iso);

    let status = "none";
    if (todaysCleanings.length >= 2) {
      status = "dup";
    } else if (todaysCleanings.length === 1) {
      status = todaysCleanings[0].cleaningType === "checkout" ? "checkoutOk" : "dailyOk";
    } else if (isOccupiedMiddle) {
      status = isFuture ? "future" : "missing";
    } else if (isCheckoutDay) {
      status = isFuture ? "future" : (checkoutSatisfiedInWindow(cleanings, property, iso, checkoutInfo[iso].windowEndIso) ? "none" : "missing");
    }
    if (status === "missing") missingCount++;
    if (status === "dup") dupCount++;
    const st = STATUS_STYLE[status];
    const rings = [];
    if (isCheckoutDay) rings.push(`0 0 0 2px ${CHECKOUT_RING}`);
    if (isCheckin) rings.push(`0 0 0 ${isCheckoutDay ? 4 : 2}px ${CHECKIN_RING}`);
    const clickable = todaysCleanings.length > 0;
    return <div key={iso} onClick={() => clickable && onSelectDay(todaysCleanings)}
      style={{textAlign:"center", padding:"5px 1px", borderRadius:7, background:st.bg, boxShadow: rings.join(", ") || "none", cursor: clickable ? "pointer" : "default"}}>
      <div style={{fontSize:10, fontWeight:600, color: status==="none" ? "#ccc" : "#888"}}>{d}</div>
      <div style={{fontSize:12, color:st.color, fontWeight:700, lineHeight:"14px"}}>{st.icon}</div>
    </div>;
  });

  return <div style={{background:"#fff", borderRadius:12, padding:14, marginBottom:10, border:"0.5px solid rgba(0,0,0,0.07)"}}>
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
      <div style={{fontSize:13, fontWeight:700, color:"#333"}}>{property}{isExempt && <span style={{fontSize:10, fontWeight:500, color:"#aaa"}}> · solo salida</span>}</div>
      {(missingCount > 0 || dupCount > 0) && <div style={{display:"flex", gap:6}}>
        {missingCount > 0 && <span style={{fontSize:11, fontWeight:700, color:"#A32D2D", background:"#FCEBEB", padding:"2px 8px", borderRadius:20}}>{missingCount} ✗</span>}
        {dupCount > 0 && <span style={{fontSize:11, fontWeight:700, color:"#854F0B", background:"#FAEEDA", padding:"2px 8px", borderRadius:20}}>{dupCount} ⚠</span>}
      </div>}
    </div>
    {!hasActivity ? <div style={{fontSize:12, color:"#bbb"}}>Sin ocupación este mes</div> : <>
      <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginBottom:4}}>
        {DOW.map((dw, i) => <div key={i} style={{textAlign:"center", fontSize:9, fontWeight:600, color:i===6?"#ddd":"#888"}}>{dw}</div>)}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, padding:"0 2px 2px 0"}}>{rendered}</div>
    </>}
  </div>;
}

export function CleaningCoverage({cleanings, allPropNames, bookings, bookingsLoaded, db, role, cancelCleaning}) {
  const [ym, setYm] = useState(() => { const d = new Date(); return {y: d.getFullYear(), m: d.getMonth()}; });
  const [dayPicker, setDayPicker] = useState(null);
  const [cleaningSel, setCleaningSel] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const {y, m} = ym;
  const monthLabel = new Date(y, m, 1).toLocaleDateString("es-MX", {month: "long", year: "numeric"});
  function prevMonth() { if (m === 0) setYm({y: y - 1, m: 11}); else setYm({y, m: m - 1}); }
  function nextMonth() { if (m === 11) setYm({y: y + 1, m: 0}); else setYm({y, m: m + 1}); }
  function toggleGroup(label) { setOpenGroups(o => ({...o, [label]: !o[label]})); }

  function handleSelectDay(list) {
    if (list.length === 1) setCleaningSel(list[0]);
    else setDayPicker(list);
  }

  if (!bookingsLoaded) return <div style={{textAlign: "center", color: "#aaa", fontSize: 13, padding: 30}}>Cargando datos de ocupación…</div>;

  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Every named group, in order, filtered to properties that actually exist — anything
  // left over (not listed in any named group) becomes its own "Extras" group.
  const usedProps = new Set();
  const groups = PROPERTY_GROUPS.map(g => {
    const properties = g.properties.filter(p => allPropNames.includes(p));
    properties.forEach(p => usedProps.add(p));
    return {label: g.label, properties};
  }).filter(g => g.properties.length > 0);
  const extras = allPropNames.filter(p => !usedProps.has(p));
  if (extras.length > 0) groups.push({label: "Extras", properties: extras});

  return <div>
    <div className="section-label">Cobertura de limpiezas</div>
    <div style={{fontSize: 11, color: "#aaa", marginTop: -8, marginBottom: 16}}>Solo se evalúan días con ocupación real: cada noche de estancia necesita limpieza diaria, y cada salida (círculo azul) necesita limpieza de salida antes del siguiente check-in. Los días de check-in (círculo naranja) no requieren limpieza. Cada limpieza se muestra en el día real en que se registró. Zantamar solo lleva limpieza de salida.</div>

    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16}}>
      <button onClick={prevMonth} style={{background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#378ADD", padding: "0 10px", lineHeight: 1}}>‹</button>
      <div style={{fontSize: 14, fontWeight: 700, textTransform: "capitalize", color: "#333"}}>{monthLabel}</div>
      <button onClick={nextMonth} style={{background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#378ADD", padding: "0 10px", lineHeight: 1}}>›</button>
    </div>

    {groups.map(g => {
      const isOpen = !!openGroups[g.label];
      return <div key={g.label} style={{marginBottom:14}}>
        <div onClick={() => toggleGroup(g.label)} style={{display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", padding:"12px 4px", borderBottom: isOpen ? "1px solid #eee" : "none"}}>
          <div style={{fontSize:14, fontWeight:700, color:"#333"}}>{g.label} <span style={{fontSize:11, color:"#aaa", fontWeight:400}}>({g.properties.length})</span></div>
          <span style={{fontSize:16, color:"#378ADD", display:"inline-block", transition:"transform 0.15s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)"}}>›</span>
        </div>
        {isOpen && <div style={{marginTop:10}}>
          {g.properties.map(p => <PropertyGrid key={p} property={p} bookingsForProp={getPropBookings(bookings, bookingsLoaded, p)} cleanings={cleanings} y={y} m={m} today={today} onSelectDay={handleSelectDay}/>)}
        </div>}
      </div>;
    })}

    <div style={{display:"flex", gap:12, marginTop:10, fontSize:10, color:"#888", flexWrap:"wrap"}}>
      <div style={{display:"flex", alignItems:"center", gap:4}}><span style={{color:"#3B6D11", fontWeight:700}}>✓</span> Diaria registrada</div>
      <div style={{display:"flex", alignItems:"center", gap:4}}><span style={{color:"#185FA5", fontWeight:700}}>✓</span> Salida registrada</div>
      <div style={{display:"flex", alignItems:"center", gap:4}}><span style={{color:"#A32D2D", fontWeight:700}}>✗</span> Sin registrar</div>
      <div style={{display:"flex", alignItems:"center", gap:4}}><span style={{color:"#854F0B", fontWeight:700}}>⚠</span> Múltiples el mismo día</div>
      <div style={{display:"flex", alignItems:"center", gap:4}}><div style={{width:12, height:12, borderRadius:"50%", boxShadow:`0 0 0 2px ${CHECKOUT_RING}`}}/> Día de check-out</div>
      <div style={{display:"flex", alignItems:"center", gap:4}}><div style={{width:12, height:12, borderRadius:"50%", boxShadow:`0 0 0 2px ${CHECKIN_RING}`}}/> Día de check-in</div>
    </div>

    {dayPicker && <div className="modal-overlay" onClick={() => setDayPicker(null)}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{height:"auto", borderRadius:20}}>
        <div className="modal-handle"/>
        <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
          <div className="modal-title">{dayPicker[0].property}</div>
          <div className="modal-sub">{fmtDate(dayPicker[0].completedAt)} · {dayPicker.length} limpiezas registradas ese día</div>
          {dayPicker.map(c => (
            <div key={c.id} className="task-item" onClick={() => { setCleaningSel(c); setDayPicker(null); }}>
              <div className="task-title">{CLEANING_TYPE_LABEL[c.cleaningType || "checkout"]}</div>
              <div className="task-prop">{fmtDate(c.completedAt)} · {c.doneItems || 0}/{c.totalItems || 0} tareas · {(c.workers || []).map(w => w.name).join(", ") || "Sin firmar"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>}
    {cleaningSel && <CleaningDetailSheet cleaning={cleaningSel} db={db} role={role} cancelCleaning={cancelCleaning} onClose={() => setCleaningSel(null)}/>}
  </div>;
}
