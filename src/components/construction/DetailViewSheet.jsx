import { useState } from "react";
import { ZoomLightbox } from "../shared/ZoomLightbox";
import { DetailCaptureSheet } from "./DetailCaptureSheet";

function fmtDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {day:"numeric", month:"short", year:"numeric", hour:"numeric", minute:"2-digit"});
}

export function DetailViewSheet({projectId, detail, addDetailVersion, removeDetailPin, updateDetailLabel, onViewOnPlan, onClose}) {
  const [label, setLabel] = useState(detail.label || "");
  const [savingLabel, setSavingLabel] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const history = [...(detail.history || [])].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  async function handleSaveLabel() {
    if (!label.trim() || label.trim() === detail.label) return;
    setSavingLabel(true);
    await updateDetailLabel(detail.id, label.trim());
    setSavingLabel(false);
  }

  async function handleNewVersion(_label, dataUrl) {
    await addDetailVersion(projectId, detail.id, detail.history, dataUrl);
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Detalle</div>
        <div className="field"><label>Título</label>
          <div style={{display:"flex", gap:8}}>
            <input value={label} onChange={e => setLabel(e.target.value)} onBlur={handleSaveLabel} style={{flex:1}}/>
          </div>
          {savingLabel && <div style={{fontSize:11, color:"#aaa", marginTop:4}}>Guardando…</div>}
        </div>

        <img src={detail.currentPhotoUrl} className="photo-thumb" style={{width:"100%", height:"auto", maxHeight:320, objectFit:"contain", background:"#f5f5f5", cursor:"zoom-in"}} onClick={() => setLightbox(detail.currentPhotoUrl)}/>

        <div style={{display:"flex", gap:10, marginTop:14, marginBottom:20}}>
          <button className="btn-secondary" style={{flex:1}} onClick={() => setCaptureOpen(true)}>+ Actualizar detalle</button>
          <button className="btn-secondary" style={{flex:1}} onClick={() => { onViewOnPlan(detail); onClose(); }}>Ver en el plano</button>
        </div>

        <div className="section-label">Historial</div>
        {history.map((h, i) => (
          <div key={i} style={{display:"flex", gap:10, alignItems:"center", padding:"8px 0", borderBottom:"0.5px solid #f0f0f0"}}>
            <img src={h.photoUrl} className="photo-thumb" style={{width:52, height:52, cursor:"zoom-in"}} onClick={() => setLightbox(h.photoUrl)}/>
            <div style={{fontSize:12, color:"#888"}}>{fmtDateTime(h.createdAt)}<br/>{h.createdBy}</div>
          </div>
        ))}

        <button className="btn-red" style={{marginTop:24}} onClick={() => { if (confirm("¿Eliminar este detalle? Se perderá todo su historial.")) { removeDetailPin(detail.id); onClose(); } }}>Eliminar detalle</button>
      </div>
      <div className="modal-sheet-bottom">
        <button className="btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
    {captureOpen && <div onClick={e => e.stopPropagation()}><DetailCaptureSheet title="Actualizar detalle" requireLabel={false} onSave={handleNewVersion} onClose={() => setCaptureOpen(false)}/></div>}
    {lightbox && <div onClick={e => e.stopPropagation()}><ZoomLightbox src={lightbox} caption={detail.label} onClose={() => setLightbox(null)}/></div>}
  </div>;
}
