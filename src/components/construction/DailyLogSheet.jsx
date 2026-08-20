import { useState } from "react";
import { todayISO } from "../../lib/dateHelpers";

const WEATHER_OPTIONS = ["Soleado", "Nublado", "Lluvia", "Tormenta", "Viento fuerte"];

export function DailyLogSheet({projectId, log, previousLog, subcontractors, addDailyLog, onClose}) {
  const [date, setDate] = useState(log?.date || todayISO());
  const [weather, setWeather] = useState(log?.weather || "");
  const [workPerformed, setWorkPerformed] = useState(log?.workPerformed || "");
  const [issues, setIssues] = useState(log?.issues || "");
  const [bySubcontractor, setBySubcontractor] = useState(log?.bySubcontractor || []);
  const [saving, setSaving] = useState(false);

  function copyFromPrevious() {
    if (!previousLog) return;
    setWeather(previousLog.weather || "");
    setWorkPerformed(previousLog.workPerformed || "");
    setIssues(previousLog.issues || "");
    setBySubcontractor((previousLog.bySubcontractor || []).map(b => ({...b})));
  }

  function addSubRow() { setBySubcontractor(rs => [...rs, {subcontractorId:"", note:""}]); }
  function updateSubRow(i, patch) { setBySubcontractor(rs => rs.map((r, j) => j === i ? {...r, ...patch} : r)); }
  function removeSubRow(i) { setBySubcontractor(rs => rs.filter((_, j) => j !== i)); }

  const cleanSub = bySubcontractor.filter(r => r.subcontractorId && r.note.trim()).map(r => ({subcontractorId:r.subcontractorId, note:r.note.trim()}));
  const canSave = !!workPerformed.trim() || cleanSub.length > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await addDailyLog(projectId, log?.id || null, {date, weather, workPerformed:workPerformed.trim(), issues:issues.trim(), bySubcontractor:cleanSub});
    setSaving(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">{log ? "Editar bitácora" : "Nueva bitácora"}</div>
        <div className="modal-sub">Registro diario de avance en obra</div>
        {!log && previousLog && <button onClick={copyFromPrevious} style={{width:"100%", marginBottom:14, padding:"9px 0", borderRadius:10, border:"1.5px dashed #E87A30", background:"#FDEEE3", color:"#B75A17", fontSize:12.5, fontWeight:600, cursor:"pointer"}}>↻ Copiar actividades del día anterior</button>}
        <div className="field"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)}/></div>
        <div className="field"><label>Clima</label>
          <select value={weather} onChange={e => setWeather(e.target.value)}>
            <option value="">Sin especificar</option>
            {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="field"><label>Trabajo realizado</label><textarea value={workPerformed} onChange={e => setWorkPerformed(e.target.value)} placeholder="Describe el avance del día..."/></div>

        <div className="field">
          <label>Trabajo por subcontratista (opcional)</label>
          {bySubcontractor.map((r, i) => (
            <div key={i} style={{display:"flex", gap:8, marginBottom:8, alignItems:"flex-start"}}>
              <div style={{flex:1, display:"flex", flexDirection:"column", gap:6}}>
                <select value={r.subcontractorId} onChange={e => updateSubRow(i, {subcontractorId:e.target.value})}>
                  <option value="">Selecciona subcontratista…</option>
                  {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name} — {s.trade}</option>)}
                </select>
                <textarea value={r.note} onChange={e => updateSubRow(i, {note:e.target.value})} placeholder="ej. Instalación de cableado en nivel 2" style={{minHeight:50}}/>
              </div>
              <button onClick={() => removeSubRow(i)} style={{background:"none", border:"none", color:"#A32D2D", fontSize:18, cursor:"pointer", padding:"0 4px"}}>×</button>
            </div>
          ))}
          <button onClick={addSubRow} style={{background:"none", border:"1.5px dashed #c0c0c0", borderRadius:10, padding:"9px 0", width:"100%", color:"#666", fontSize:13, cursor:"pointer"}}>+ Agregar subcontratista</button>
        </div>

        <div className="field"><label>Problemas / retrasos (opcional)</label><textarea value={issues} onChange={e => setIssues(e.target.value)} placeholder="ej. Falta de material, clima, etc."/></div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} style={{opacity:canSave ? 1 : 0.5}}>{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  </div>;
}
