import { useState, useEffect } from "react";
import { OCCUPANCY_META } from "../../lib/bookingHelpers";
import { OBadge } from "../shared/Badges";

export function AvailabilityScreen({availProp, setAvailProp, bookingsLoaded, bookingsFetchErr, setBookingsFetchTrigger, propNames, getOccupancy, getPropBookingDetails}) {
  const [sel, setSel] = useState(availProp || "");
  useEffect(() => { if (sel) setAvailProp(sel); }, [sel]);

  function fmtD(d) {
    if (!d) return "—";
    return d.toLocaleDateString("es-MX", {day:"numeric", month:"short", year:"numeric"});
  }

  const info = sel ? getPropBookingDetails(sel) : null;
  const occ = sel ? getOccupancy(sel) : null;
  const om = occ ? OCCUPANCY_META[occ] : null;

  return <>
    <div className="topbar">
      <div className="topbar-row">
        <div className="topbar-title">Disponibilidad</div>
        {!bookingsLoaded && !bookingsFetchErr && <span style={{fontSize:11, color:"#888"}}>Cargando...</span>}
        {bookingsFetchErr && <button onClick={() => setBookingsFetchTrigger(n => n + 1)} style={{fontSize:11, padding:"4px 12px", borderRadius:8, border:"none", background:"#534AB7", color:"#fff", cursor:"pointer"}}>Reintentar</button>}
      </div>
    </div>
    <div className="screen">
      {bookingsFetchErr && <div style={{background:"#FCEBEB", borderRadius:12, padding:"12px 14px", marginBottom:14, fontSize:13, color:"#A32D2D", textAlign:"center"}}>No se pudieron cargar las reservaciones. Verifica tu conexión e intenta de nuevo.</div>}
      <div className="field" style={{marginBottom:16}}>
        <label>Propiedad</label>
        <select value={sel} onChange={e => setSel(e.target.value)} style={{color:sel ? "#1a1a1a" : "#aaa"}}>
          <option value="">Selecciona propiedad...</option>
          {propNames.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {sel && bookingsLoaded && <>
        <div style={{background:om ? om.bg : "#f8f8f8", borderRadius:14, padding:20, marginBottom:16, border:`1.5px solid ${om ? om.dot + "55" : "#e0e0e0"}`, textAlign:"center"}}>
          <div style={{fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10}}>Estado hoy</div>
          {occ ? <OBadge occupancy={occ}/> : <span style={{fontSize:13, color:"#aaa"}}>Sin datos</span>}
          {info?.current && <div style={{marginTop:12, fontSize:12, color:om?.color, fontWeight:500}}>
            <div>Entrada: {fmtD(info.current.ciDate)}</div>
            <div>Salida: {fmtD(info.current.coDate)}</div>
          </div>}
        </div>
        <div className="section-label">Próximas reservaciones</div>
        {(!info?.upcoming || info.upcoming.length === 0) && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:24, background:"#fff", borderRadius:12, border:"0.5px solid rgba(0,0,0,0.07)"}}>Sin reservaciones próximas</div>}
        {info?.upcoming.map((b, i) => {
          const now = new Date(); now.setHours(0, 0, 0, 0);
          const daysUntil = Math.round((b.ciDate - now) / 86400000);
          const nights = Math.round((b.coDate - b.ciDate) / 86400000);
          return <div key={i} style={{background:"#fff", borderRadius:12, padding:14, marginBottom:10, border:"0.5px solid rgba(0,0,0,0.07)"}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
              <span style={{fontSize:13, fontWeight:700, color:"#1a1a1a"}}>Reservación {i === 0 ? "siguiente" : "posterior"}</span>
              <span style={{fontSize:11, padding:"3px 10px", borderRadius:20, background:daysUntil <= 2 ? "#FCEBEB" : daysUntil <= 7 ? "#FAEEDA" : "#EAF3DE", color:daysUntil <= 2 ? "#A32D2D" : daysUntil <= 7 ? "#854F0B" : "#3B6D11", fontWeight:600}}>{daysUntil === 0 ? "Hoy" : daysUntil === 1 ? "Mañana" : `En ${daysUntil} días`}</span>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8}}>
              <div style={{background:"#f8f8f8", borderRadius:8, padding:"10px 12px"}}><div style={{fontSize:10, color:"#888", fontWeight:600, textTransform:"uppercase", marginBottom:3}}>Check-in</div><div style={{fontSize:13, fontWeight:600}}>{fmtD(b.ciDate)}</div></div>
              <div style={{background:"#f8f8f8", borderRadius:8, padding:"10px 12px"}}><div style={{fontSize:10, color:"#888", fontWeight:600, textTransform:"uppercase", marginBottom:3}}>Check-out</div><div style={{fontSize:13, fontWeight:600}}>{fmtD(b.coDate)}</div></div>
            </div>
            <div style={{fontSize:12, color:"#888"}}>{nights} noche{nights !== 1 ? "s" : ""}</div>
          </div>;
        })}
      </>}
      {sel && !bookingsLoaded && !bookingsFetchErr && <div style={{textAlign:"center", color:"#888", fontSize:13, padding:40}}>Cargando reservaciones...</div>}
    </div>
  </>;
}
