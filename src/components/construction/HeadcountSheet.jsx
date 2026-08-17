import { useState } from "react";

function todayISO() { return new Date().toISOString().slice(0, 10); }

export function HeadcountSheet({projectId, entry, subcontractors, saveHeadcountEntry, onClose}) {
  const [date, setDate] = useState(entry?.date || todayISO());
  const [rows, setRows] = useState(entry?.rows?.length ? entry.rows : [{trade:"", count:""}]);
  const [saving, setSaving] = useState(false);

  const tradeSuggestions = [...new Set(subcontractors.map(s => s.trade).filter(Boolean))];
  const total = rows.reduce((s, r) => s + (Number(r.count) || 0), 0);

  function updateRow(i, field, val) { setRows(rs => rs.map((r, j) => j === i ? {...r, [field]:val} : r)); }
  function addRow() { setRows(rs => [...rs, {trade:"", count:""}]); }
  function removeRow(i) { setRows(rs => rs.filter((_, j) => j !== i)); }

  async function handleSave() {
    const cleanRows = rows.filter(r => r.trade.trim()).map(r => ({trade:r.trade.trim(), count:Number(r.count) || 0}));
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
        <div className="modal-sub">Cuántos trabajadores de cada oficio estuvieron hoy</div>
        <div className="field"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)}/></div>
        <div className="field"><label>Oficios y cantidad</label>
          {rows.map((r, i) => (
            <div key={i} style={{display:"flex", gap:8, marginBottom:8, alignItems:"center"}}>
              <input list="trade-suggestions" value={r.trade} onChange={e => updateRow(i, "trade", e.target.value)} placeholder="ej. Electricistas" style={{flex:2}}/>
              <input type="number" min="0" step="1" value={r.count} onChange={e => updateRow(i, "count", e.target.value)} placeholder="0" style={{flex:1}}/>
              {rows.length > 1 && <button onClick={() => removeRow(i)} style={{background:"none", border:"none", color:"#A32D2D", fontSize:18, cursor:"pointer", padding:"0 4px"}}>×</button>}
            </div>
          ))}
          <datalist id="trade-suggestions">{tradeSuggestions.map(t => <option key={t} value={t}/>)}</datalist>
          <button onClick={addRow} style={{background:"none", border:"1.5px dashed #c0c0c0", borderRadius:10, padding:"9px 0", width:"100%", color:"#666", fontSize:13, cursor:"pointer"}}>+ Agregar oficio</button>
        </div>
        <div style={{fontSize:13, color:"#555", fontWeight:600}}>Total del día: {total}</div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} style={{opacity:rows.some(r => r.trade.trim()) ? 1 : 0.5}}>{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  </div>;
}
