import { useState } from "react";
import { PhotoUpload } from "../shared/PhotoUpload";

export function StartMachineUseSheet({projectId, machines, startMachineUse, onClose}) {
  const [machineId, setMachineId] = useState(null);
  const [startHorometro, setStartHorometro] = useState("");
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  const selectedMachine = machines.find(m => m.id === machineId);
  const canSave = selectedMachine && startHorometro !== "" && !isNaN(Number(startHorometro)) && photos.length > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await startMachineUse(projectId, selectedMachine.id, selectedMachine.name, startHorometro, photos);
    setSaving(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div className="modal-title">Registrar inicio de uso</div>
        <div className="modal-sub">Selecciona la máquina y anota el horómetro al empezar</div>

        <div className="field">
          <label>Máquina</label>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {machines.map(m => <button key={m.id} onClick={() => setMachineId(m.id)} style={{padding:"8px 14px", borderRadius:10, border:machineId === m.id ? "2px solid #E87A30" : "1.5px solid #e0e0e0", background:machineId === m.id ? "#FDEEE3" : "#fafafa", color:machineId === m.id ? "#B75A17" : "#666", fontSize:13, cursor:"pointer", fontWeight:machineId === m.id ? 700 : 400}}>{m.name}</button>)}
          </div>
          {machines.length === 0 && <div style={{fontSize:12, color:"#aaa", marginTop:8}}>Aún no hay máquinas registradas. Cierra esto y usa "⚙️ Agregar máquina" primero.</div>}
        </div>

        <div className="field"><label>Horómetro inicial</label><input type="number" min="0" step="0.1" value={startHorometro} onChange={e => setStartHorometro(e.target.value)} placeholder="ej. 1284.5"/></div>
        <div className="field"><label>Foto del horómetro</label><PhotoUpload photos={photos} setPhotos={setPhotos}/></div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={!canSave || saving} style={{opacity:canSave ? 1 : 0.5}}>{saving ? "Guardando…" : "Registrar inicio"}</button>
        </div>
      </div>
    </div>
  </div>;
}
