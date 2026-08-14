import { useState } from "react";
import { PRIORITY_LABEL } from "../../lib/constants";
import { PhotoUpload } from "../shared/PhotoUpload";

export function NewTaskSheet({activeProp, propNames, getOccupancy, bookingsLoaded, addTask, currentUser, onClose}) {
  const [prop, setProp] = useState(activeProp || "");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("High");
  const [occupancy, setOccupancy] = useState(() => {
    if (activeProp) { const auto = getOccupancy(activeProp); return auto || ""; }
    return "";
  });
  const [autoOcc, setAutoOcc] = useState(!!activeProp);
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  function handlePropChange(v) {
    setProp(v);
    if (v) {
      const auto = getOccupancy(v);
      if (auto) { setOccupancy(auto); setAutoOcc(true); } else { setOccupancy(""); setAutoOcc(false); }
    } else {
      setOccupancy(""); setAutoOcc(false);
    }
  }

  async function handleSave() {
    if (!title.trim() || !prop) return;
    setSaving(true);
    const today = new Date().toLocaleDateString("es-MX", {day:"numeric", month:"short"});
    await addTask({title, property:prop, priority, desc, occupancy, status:"Open", assignee:"", approvalComment:"", progressNotes:[], created:today, createdBy:currentUser?.name || ""}, photos);
    setSaving(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Nueva tarea</div>
        <div className="modal-sub">Llena los datos a continuación</div>
        <div className="field">
          <label>Propiedad</label>
          <select value={prop} onChange={e => handlePropChange(e.target.value)} style={{color:prop ? "#1a1a1a" : "#aaa"}}>
            <option value="">Selecciona propiedad...</option>
            {propNames.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Estado de la propiedad{autoOcc ? " (auto)" : ""}</label>
          {!bookingsLoaded && <div style={{fontSize:11, color:"#888", marginBottom:6}}>Cargando reservaciones...</div>}
          <div style={{display:"flex", gap:8}}>
            {[["occupied","Ocupada","#A32D2D"], ["checkin","Check-in mañana","#854F0B"], ["available","Disponible","#3B6D11"]].map(([k, l, c]) =>
              <button key={k} onClick={() => { setOccupancy(k); setAutoOcc(false); }} style={{flex:1, padding:"10px 0", borderRadius:10, border:occupancy === k ? `2px solid ${c}` : "1.5px solid #e0e0e0", background:occupancy === k ? c + "18" : "#fafafa", color:occupancy === k ? c : "#888", fontSize:12, cursor:"pointer", fontWeight:occupancy === k ? 700 : 500, textAlign:"center"}}>{l}</button>
            )}
          </div>
        </div>
        <div className="field">
          <label>Título de la tarea</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ej. Aire acondicionado descompuesto"/>
        </div>
        <div className="field">
          <label>Prioridad</label>
          <div className="priority-row">
            {["High","Medium","Low"].map(p => <button key={p} className={`priority-btn${priority === p ? ` active-${p.toLowerCase()}` : ""}`} onClick={() => setPriority(p)}>{PRIORITY_LABEL[p]}</button>)}
          </div>
        </div>
        <div className="field">
          <label>Descripción</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe el problema..."/>
        </div>
        <div className="field">
          <label>Fotos (opcional)</label>
          <PhotoUpload photos={photos} setPhotos={setPhotos}/>
        </div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !title.trim() || !prop} style={{opacity:title.trim() && prop ? 1 : 0.5}}>{saving ? "Guardando..." : "Guardar tarea"}</button>
        </div>
      </div>
    </div>
  </div>;
}
