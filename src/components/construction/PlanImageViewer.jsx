import { useState, useRef } from "react";
import { DetailCaptureSheet } from "./DetailCaptureSheet";
import { DetailViewSheet } from "./DetailViewSheet";

export function PlanImageViewer({projectId, planDoc, details, addDetailPin, addDetailVersion, removeDetailPin, updateDetailLabel, onClose}) {
  const [addMode, setAddMode] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const pinRefs = useRef({});

  const rootId = planDoc.rootId || planDoc.id;

  function flashPin(id) {
    setFlashId(id);
    const el = pinRefs.current[id];
    if (el) el.scrollIntoView({behavior:"smooth", block:"center"});
    setTimeout(() => setFlashId(null), 2500);
  }

  function handleImageClick(e) {
    if (!addMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({x, y});
    setAddMode(false);
  }

  async function handleNewPin(label, dataUrl) {
    await addDetailPin(projectId, rootId, pendingPin.x, pendingPin.y, label, dataUrl);
    setPendingPin(null);
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">{planDoc.name}</div>
        <div className="modal-sub">{addMode ? "Toca el plano donde quieras agregar un detalle" : `${details.length} detalle${details.length !== 1 ? "s" : ""} marcado${details.length !== 1 ? "s" : ""}`}</div>
        <button className="btn-secondary" style={{marginBottom:14, ...(addMode ? {borderColor:"#E87A30", color:"#E87A30"} : {})}} onClick={() => setAddMode(m => !m)}>{addMode ? "Cancelar" : "+ Agregar detalle"}</button>
        <div style={{position:"relative", width:"100%"}}>
          <img src={planDoc.fileUrl} onClick={handleImageClick} style={{width:"100%", display:"block", borderRadius:12, cursor:addMode ? "crosshair" : "default"}}/>
          {details.map(d => {
            const isFlash = flashId === d.id;
            return <div key={d.id} ref={el => { pinRefs.current[d.id] = el; }} onClick={e => { e.stopPropagation(); setSelectedDetail(d); }}
              style={{position:"absolute", left:`${d.x}%`, top:`${d.y}%`, transform:"translate(-50%,-50%)",
                width:isFlash ? 34 : 26, height:isFlash ? 34 : 26, borderRadius:"50%", background:"#E87A30",
                border:isFlash ? "3px solid #FFD166" : "2px solid #fff",
                boxShadow:isFlash ? "0 0 0 6px rgba(255,209,102,0.4)" : "0 1px 4px rgba(0,0,0,0.4)",
                transition:"all 0.3s", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700}}>📍</div>;
          })}
        </div>
      </div>
      <div className="modal-sheet-bottom">
        <button className="btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
    {pendingPin && <div onClick={e => e.stopPropagation()}><DetailCaptureSheet title="Nuevo detalle" requireLabel onSave={handleNewPin} onClose={() => setPendingPin(null)}/></div>}
    {selectedDetail && <div onClick={e => e.stopPropagation()}><DetailViewSheet projectId={projectId} detail={selectedDetail} addDetailVersion={addDetailVersion} removeDetailPin={removeDetailPin} updateDetailLabel={updateDetailLabel} onViewOnPlan={d => flashPin(d.id)} onClose={() => setSelectedDetail(null)}/></div>}
  </div>;
}
