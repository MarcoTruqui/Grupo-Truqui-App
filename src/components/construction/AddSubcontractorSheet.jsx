import { useState } from "react";

export function AddSubcontractorSheet({projectId, addSubcontractor, onClose}) {
  const [name, setName] = useState("");
  const [trade, setTrade] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !trade.trim()) return;
    setSaving(true);
    await addSubcontractor(projectId, {name:name.trim(), trade:trade.trim(), totalBudget});
    setSaving(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{height:"auto", borderRadius:20}}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div className="modal-title">Agregar subcontratista</div>
        <div className="field"><label>Nombre / empresa</label><input value={name} onChange={e => setName(e.target.value)} placeholder="ej. Electricidad Del Mar"/></div>
        <div className="field"><label>Oficio</label><input value={trade} onChange={e => setTrade(e.target.value)} placeholder="ej. Electricistas"/></div>
        <div className="field"><label>Presupuesto total (MXN)</label><input type="number" min="0" step="0.01" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} placeholder="0.00"/></div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} style={{opacity:name.trim() && trade.trim() ? 1 : 0.5}}>{saving ? "Guardando…" : "Agregar"}</button>
        </div>
      </div>
    </div>
  </div>;
}
