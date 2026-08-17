import { useState } from "react";
import { HeadcountSheet } from "./HeadcountSheet";

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {weekday:"short", day:"numeric", month:"short", year:"numeric"});
}

export function HeadcountTab({projectId, entries, subcontractors, saveHeadcountEntry, removeHeadcountEntry}) {
  const [sheetEntry, setSheetEntry] = useState(undefined);
  const sorted = [...entries].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return <div>
    <button className="btn-primary" style={{marginBottom:16}} onClick={() => setSheetEntry(null)}>+ Registrar personal</button>
    <div className="section-label">Historial</div>
    {sorted.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>Sin registros de personal aún.</div>}
    {sorted.map(e => {
      const total = (e.rows || []).reduce((s, r) => s + (Number(r.count) || 0), 0);
      return <div key={e.id} className="task-item" onClick={() => setSheetEntry(e)}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6}}>
          <div className="task-title" style={{marginBottom:0, textTransform:"capitalize"}}>{fmtDate(e.date)}</div>
          <div style={{fontSize:16, fontWeight:700, color:"#E87A30"}}>{total}</div>
        </div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
          {(e.rows || []).map((r, i) => <span key={i} className="badge" style={{background:"#FDEEE3", color:"#B75A17"}}>{r.trade}: {r.count}</span>)}
        </div>
        <div style={{marginTop:8}}>
          <button onClick={ev => { ev.stopPropagation(); if (confirm("¿Eliminar este registro?")) removeHeadcountEntry(e.id); }} style={{background:"none", border:"none", color:"#A32D2D", fontSize:11, cursor:"pointer", padding:0}}>Eliminar</button>
        </div>
      </div>;
    })}
    {sheetEntry !== undefined && <HeadcountSheet projectId={projectId} entry={sheetEntry} subcontractors={subcontractors} saveHeadcountEntry={saveHeadcountEntry} onClose={() => setSheetEntry(undefined)}/>}
  </div>;
}
