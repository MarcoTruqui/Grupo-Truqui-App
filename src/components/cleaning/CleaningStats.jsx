import { useState } from "react";
import { fmtDate, localDateISO } from "../../lib/dateHelpers";
import { CLEANING_TYPE_LABEL } from "../../lib/constants";

function fmtCount(n) {
  return Number(n.toFixed(2)).toString();
}

export function CleaningStats({cleanings}) {
  const [ym, setYm] = useState(() => { const d = new Date(); return {y:d.getFullYear(), m:d.getMonth()}; });
  const [showAll, setShowAll] = useState(false);
  const [selectedProp, setSelectedProp] = useState(null);
  const {y, m} = ym;
  const monthKey = `${y}-${String(m+1).padStart(2,"0")}`;
  const monthLabel = new Date(y,m,1).toLocaleDateString("es-MX",{month:"long",year:"numeric"});
  function prevMonth(){ if(m===0) setYm({y:y-1,m:11}); else setYm({y,m:m-1}); }
  function nextMonth(){ if(m===11) setYm({y:y+1,m:0}); else setYm({y,m:m+1}); }

  const completed = cleanings.filter(c => c.status === "completed" && c.completedAt);
  const inRange = showAll ? completed : completed.filter(c => localDateISO(c.completedAt).startsWith(monthKey));

  const counts = {};
  inRange.forEach(c => {
    const workers = c.workers || [];
    if (!workers.length) return;
    const share = 1 / workers.length;
    workers.forEach(w => {
      const key = w.userId || w.name;
      if (!counts[key]) counts[key] = {name: w.name, count: 0};
      counts[key].count += share;
    });
  });
  const rows = Object.values(counts).sort((a, b) => b.count - a.count);
  const max = rows.length ? rows[0].count : 0;

  const byProp = {};
  inRange.forEach(c => { (byProp[c.property] = byProp[c.property] || []).push(c); });
  const propRows = Object.entries(byProp).map(([property, list]) => ({property, count: list.length})).sort((a, b) => b.count - a.count);

  return <div>
    <div className="section-label">Limpiezas por persona</div>

    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
      <button onClick={prevMonth} disabled={showAll} style={{background:"none", border:"none", fontSize:22, cursor:showAll?"default":"pointer", color:showAll?"#ccc":"#378ADD", padding:"0 10px", lineHeight:1}}>‹</button>
      <div style={{fontSize:14, fontWeight:700, textTransform:"capitalize", color: showAll ? "#aaa" : "#333"}}>{showAll ? "Todo el historial" : monthLabel}</div>
      <button onClick={nextMonth} disabled={showAll} style={{background:"none", border:"none", fontSize:22, cursor:showAll?"default":"pointer", color:showAll?"#ccc":"#378ADD", padding:"0 10px", lineHeight:1}}>›</button>
    </div>
    <div style={{textAlign:"center", marginBottom:16}}>
      <button onClick={() => setShowAll(s => !s)} style={{fontSize:11, padding:"5px 12px", borderRadius:20, border:showAll?"1.5px solid #378ADD":"1.5px solid #e0e0e0", background:showAll?"#E6F1FB":"#fafafa", color:showAll?"#378ADD":"#888", fontWeight:showAll?700:400, cursor:"pointer"}}>{showAll ? "✓ Viendo todo el historial" : "Ver todo el historial"}</button>
    </div>

    <div style={{textAlign:"center", fontSize:13, color:"#888", marginBottom:16}}>{inRange.length} limpieza{inRange.length!==1?"s":""} completada{inRange.length!==1?"s":""} {showAll?"en total":"este mes"}</div>

    <div style={{fontSize:11, color:"#aaa", marginTop:-8, marginBottom:16}}>Limpiezas entre varios se dividen en partes iguales (para bono)</div>
    {rows.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>{showAll ? "Aún no hay limpiezas registradas." : "Sin limpiezas completadas este mes."}</div>}
    {rows.map(r => (
      <div key={r.name} style={{marginBottom:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", fontSize:13, fontWeight:600, color:"#333", marginBottom:5}}>
          <span>{r.name}</span>
          <span style={{color:"#378ADD", fontSize:14}}>{fmtCount(r.count)}</span>
        </div>
        <div style={{background:"#E6F1FB", borderRadius:6, height:18, overflow:"hidden"}}>
          <div style={{width: `${max ? (r.count / max * 100) : 0}%`, minWidth: r.count ? 6 : 0, height:"100%", background:"#378ADD", borderRadius:6, transition:"width 0.3s"}}/>
        </div>
      </div>
    ))}

    <div className="section-label" style={{marginTop:24}}>Limpiezas por propiedad</div>
    {propRows.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>{showAll ? "Aún no hay limpiezas registradas." : "Sin limpiezas completadas este mes."}</div>}
    {propRows.map(pr => (
      <div key={pr.property} className="task-item" onClick={() => setSelectedProp(pr.property)} style={{cursor:"pointer"}}>
        <div className="task-title">{pr.property}</div>
        <div className="task-prop">{pr.count} limpieza{pr.count !== 1 ? "s" : ""}</div>
      </div>
    ))}

    {selectedProp && <div className="modal-overlay" onClick={() => setSelectedProp(null)}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-sheet-scroll">
          <div className="modal-title">{selectedProp}</div>
          <div className="modal-sub" style={{textTransform:"capitalize"}}>{showAll ? "Todo el historial" : monthLabel}</div>
          {[...(byProp[selectedProp] || [])].sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || "")).map(c => (
            <div key={c.id} style={{background:"#fff", borderRadius:12, padding:12, marginTop:10, border:"0.5px solid rgba(0,0,0,0.07)"}}>
              <div style={{fontSize:13, fontWeight:600, color:"#333"}}>{fmtDate(c.completedAt)} · {CLEANING_TYPE_LABEL[c.cleaningType || "checkout"]}</div>
              <div style={{fontSize:12, color:"#888", marginTop:3}}>{c.doneItems || 0}/{c.totalItems || 0} tareas · {(c.workers || []).map(w => w.name).join(", ") || "Sin firmar"}</div>
            </div>
          ))}
        </div>
        <div className="modal-sheet-bottom">
          <button className="btn-secondary" style={{width:"100%"}} onClick={() => setSelectedProp(null)}>Cerrar</button>
        </div>
      </div>
    </div>}
  </div>;
}
