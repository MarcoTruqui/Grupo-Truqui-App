import { useState } from "react";

function todayISO() { return new Date().toISOString().slice(0, 10); }
const WEATHER_OPTIONS = ["Soleado", "Nublado", "Lluvia", "Tormenta", "Viento fuerte"];

export function DailyLogSheet({projectId, addDailyLog, onClose}) {
  const [date, setDate] = useState(todayISO());
  const [weather, setWeather] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [issues, setIssues] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!workPerformed.trim()) return;
    setSaving(true);
    await addDailyLog(projectId, {date, weather, workPerformed:workPerformed.trim(), issues:issues.trim()});
    setSaving(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Nueva bitácora</div>
        <div className="modal-sub">Registro diario de avance en obra</div>
        <div className="field"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)}/></div>
        <div className="field"><label>Clima</label>
          <select value={weather} onChange={e => setWeather(e.target.value)}>
            <option value="">Sin especificar</option>
            {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="field"><label>Trabajo realizado</label><textarea value={workPerformed} onChange={e => setWorkPerformed(e.target.value)} placeholder="Describe el avance del día..."/></div>
        <div className="field"><label>Problemas / retrasos (opcional)</label><textarea value={issues} onChange={e => setIssues(e.target.value)} placeholder="ej. Falta de material, clima, etc."/></div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} style={{opacity:workPerformed.trim() ? 1 : 0.5}}>{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  </div>;
}
