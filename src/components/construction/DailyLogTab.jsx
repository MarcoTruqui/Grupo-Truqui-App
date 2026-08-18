import { useState } from "react";
import { DailyLogSheet } from "./DailyLogSheet";

function todayISO() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {weekday:"long", day:"numeric", month:"long", year:"numeric"});
}

export function DailyLogTab({projectId, logs, addDailyLog, removeDailyLog}) {
  const [sheetLog, setSheetLog] = useState(undefined);
  const today = todayISO();
  const todayEntry = logs.find(l => l.date === today);
  const sorted = [...logs].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || "").localeCompare(a.createdAt || ""));

  return <div>
    <button className="btn-primary" style={{marginBottom:16}} onClick={() => setSheetLog(todayEntry || null)}>{todayEntry ? "Editar bitácora de hoy" : "+ Nueva bitácora"}</button>
    <div className="section-label">Historial</div>
    {sorted.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>Sin bitácoras registradas aún.</div>}
    {sorted.map(l => (
      <div key={l.id} className="task-item" onClick={() => setSheetLog(l)}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4}}>
          <div className="task-title" style={{marginBottom:0, textTransform:"capitalize"}}>{fmtDate(l.date)}{l.date === today && <span className="badge" style={{background:"#FDEEE3", color:"#B75A17", marginLeft:8}}>Hoy</span>}</div>
          {l.weather && <span className="badge" style={{background:"#f0f0f0", color:"#666"}}>{l.weather}</span>}
        </div>
        <div className="task-prop" style={{marginBottom:6}}>Por {l.createdBy}</div>
        <div className="note-box">{l.workPerformed}</div>
        {l.issues && <div className="note-box" style={{background:"#FAEEDA", color:"#854F0B", marginTop:6}}>⚠️ {l.issues}</div>}
        <div style={{marginTop:8}}>
          <button onClick={ev => { ev.stopPropagation(); if (confirm("¿Eliminar esta bitácora?")) removeDailyLog(l.id); }} style={{background:"none", border:"none", color:"#A32D2D", fontSize:11, cursor:"pointer", padding:0}}>Eliminar</button>
        </div>
      </div>
    ))}
    {sheetLog !== undefined && <DailyLogSheet projectId={projectId} log={sheetLog} addDailyLog={addDailyLog} onClose={() => setSheetLog(undefined)}/>}
  </div>;
}
