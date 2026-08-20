import { useState } from "react";
import { todayISO } from "../../lib/dateHelpers";

function rowFromExisting(r, subcontractors) {
  const match = subcontractors.find(s => s.name === r.trade);
  return match ? {subcontractorId:match.id, customTrade:"", count:r.count} : {subcontractorId:"__custom__", customTrade:r.trade, count:r.count};
}

export function HeadcountSheet({projectId, entry, subcontractors, saveHeadcountEntry, onClose}) {
  const [date, setDate] = useState(entry?.date || todayISO());
  const [rows, setRows] = useState(entry?.rows?.length ? entry.rows.map(r => rowFromExisting(r, subcontractors)) : [{subcontractorId:"", customTrade:"", count:""}]);
  const [saving, setSaving] = useState(false);

  const total = rows.reduce((s, r) => s + (Number(r.count) || 0), 0);
  const canSave = rows.some(r => (r.subcontractorId === "__custom__" ? r.customTrade.trim() : r.subcontractorId));

  function updateRow(i, patch) { setRows(rs => rs.map((r, j) => j === i ? {...r, ...patch} : r)); }
  function addRow() { setRows(rs => [...rs, {subcontractorId:"", customTrade:"", count:""}]); }
  function removeRow(i) { setRows(rs => rs.filter((_, j) => j !== i)); }

  async function handleSave() {
    const cleanRows = rows
      .map(r => {
        const label = r.subcontractorId === "__custom__" ? r.customTrade.trim() : r.subcontractorId ? (subcontractors.find(s => s.id === r.subcontractorId)?.name || "") : "";
        return {trade:label, count:Number(r.count) || 0};
      })
      .filter(r => r.trade);
    if (!cleanRows.length) return;
    setSaving(true);
    await saveHeadcountEntry(projectId, entry?.id || null, date, cleanRows);
    setSaving(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">{entry ? "Editar personal" : "Registrar personal"}</div>
        <div className="modal-sub">Cuántos trabajadores de cada subcontratista estuvieron hoy</div>
        <div className="field"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)}/></div>
        <div className="field"><label>Subcontratistas y cantidad</label>
          {rows.map((r, i) => (
            <div key={i} style={{display:"flex", gap:8, marginBottom:8, alignItems:"flex-start"}}>
              <div style={{flex:2, display:"flex", flexDirection:"column", gap:6}}>
                <select value={r.subcontractorId} onChange={e => updateRow(i, {subcontractorId:e.target.value})}>
                  <option value="">Selecciona…</option>
                  {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name} — {s.trade}</option>)}
                  <option value="__custom__">Otro / personal propio</option>
                </select>
                {r.subcontractorId === "__custom__" && <input value={r.customTrade} onChange={e => updateRow(i, {customTrade:e.target.value})} placeholder="ej. Personal propio"/>}
              </div>
              <input type="number" min="0" step="1" value={r.count} onChange={e => updateRow(i, {count:e.target.value})} placeholder="0" style={{flex:1}}/>
              {rows.length > 1 && <button onClick={() => removeRow(i)} style={{background:"none", border:"none", color:"#A32D2D", fontSize:18, cursor:"pointer", padding:"0 4px"}}>×</button>}
            </div>
          ))}
          <button onClick={addRow} style={{background:"none", border:"1.5px dashed #c0c0c0", borderRadius:10, padding:"9px 0", width:"100%", color:"#666", fontSize:13, cursor:"pointer"}}>+ Agregar fila</button>
        </div>
        <div style={{fontSize:13, color:"#555", fontWeight:600}}>Total del día: {total}</div>
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
