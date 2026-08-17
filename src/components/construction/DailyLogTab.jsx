import { useState } from "react";
import { DailyLogSheet } from "./DailyLogSheet";

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {weekday:"long", day:"numeric", month:"long", year:"numeric"});
}

export function DailyLogTab({projectId, logs, addDailyLog, removeDailyLog}) {
  const [open, setOpen] = useState(false);
  const sorted = [...logs].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || "").localeCompare(a.createdAt || ""));

  return <div>
    <button className="btn-primary" style={{marginBottom:16}} onClick={() => setOpen(true)}>+ Nueva bitácora</button>
    <div className="section-label">Historial</div>
    {sorted.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>Sin bitácoras registradas aún.</div>}
    {sorted.map(l => (
      <div key={l.id} className="task-item" style={{cursor:"default"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4}}>
          <div className="task-title" style={{marginBottom:0, textTransform:"capitalize"}}>{fmtDate(l.date)}</div>
          {l.weather && <span className="badge" style={{background:"#f0f0f0", color:"#666"}}>{l.weather}</span>}
        </div>
        <div className="task-prop" style={{marginBottom:6}}>Por {l.createdBy}</div>
        <div className="note-box">{l.workPerformed}</div>
        {l.issues && <div className="note-box" style={{background:"#FAEEDA", color:"#854F0B", marginTop:6}}>⚠️ {l.issues}</div>}
        <div style={{marginTop:8}}>
          <button onClick={() => { if (confirm("¿Eliminar esta bitácora?")) removeDailyLog(l.id); }} style={{background:"none", border:"none", color:"#A32D2D", fontSize:11, cursor:"pointer", padding:0}}>Eliminar</button>
        </div>
      </div>
    ))}
    {open && <DailyLogSheet projectId={projectId} addDailyLog={addDailyLog} onClose={() => setOpen(false)}/>}
  </div>;
}
