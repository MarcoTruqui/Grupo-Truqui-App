import { useState } from "react";

export function AddMachineSheet({machines, addConstructionMachine, removeConstructionMachine, onClose}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (machines.some(m => m.name.trim().toLowerCase() === trimmed.toLowerCase())) { alert("Ya existe una máquina con ese nombre."); return; }
    setSaving(true);
    await addConstructionMachine(trimmed);
    setName("");
    setSaving(false);
  }

  function handleDelete(m) {
    if (!confirm(`¿Eliminar "${m.name}" de la biblioteca de máquinas? Los registros de uso ya guardados no se verán afectados.`)) return;
    removeConstructionMachine(m.id);
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div className="modal-title">Máquinas</div>
        <div className="modal-sub">Biblioteca compartida — disponible en todos los proyectos</div>

        <div className="field">
          <label>Agregar máquina</label>
          <div style={{display:"flex", gap:8}}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="ej. Retroexcavadora CAT 420" style={{flex:1}} onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}/>
            <button className="btn-primary" style={{width:"auto", padding:"0 18px"}} onClick={handleAdd} disabled={!name.trim() || saving}>{saving ? "…" : "+ Agregar"}</button>
          </div>
        </div>

        <div className="section-label" style={{marginTop:20}}>Máquinas registradas ({machines.length})</div>
        {machines.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:16}}>Sin máquinas aún — agrega la primera arriba.</div>}
        {[...machines].sort((a, b) => a.name.localeCompare(b.name)).map(m => (
          <div key={m.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"0.5px solid #f0f0f0"}}>
            <span style={{fontSize:14, color:"#333"}}>{m.name}</span>
            <button onClick={() => handleDelete(m)} style={{background:"none", border:"none", color:"#A32D2D", fontSize:12, fontWeight:600, cursor:"pointer", padding:"4px 8px"}}>Eliminar</button>
          </div>
        ))}
      </div>
      <div className="modal-sheet-bottom">
        <button className="btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  </div>;
}
