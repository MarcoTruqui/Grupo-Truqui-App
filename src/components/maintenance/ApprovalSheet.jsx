import { useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { PBadge, SBadge } from "../shared/Badges";
import { PhotoThumb } from "../shared/PhotoThumb";

export function ApprovalSheet({task, onClose, currentUser, hEntry, advance, onOpenLightbox}) {
  if (!task) return null;
  const [rc, setRc] = useState("");

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">{task.title}</div>
        <div style={{display:"flex", gap:6, marginBottom:14, flexWrap:"wrap"}}>
          <PBadge priority={task.priority}/><SBadge status={task.status}/><span style={{fontSize:12, color:"#888"}}>· {task.property}</span>
        </div>
        {task.desc && <div style={{marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6}}>Descripción</div>
          <div className="note-box">{task.desc}</div>
        </div>}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6}}>Nota de aprobación</div>
          <div className="approval-box">{task.approvalComment || <span style={{color:"#aaa", fontStyle:"italic"}}>Sin nota.</span>}</div>
        </div>
        {(task.approvalPhotos || []).length > 0 && <div style={{marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6}}>Fotos de aprobación</div>
          <div className="photo-grid">{task.approvalPhotos.map((p, i) => <PhotoThumb key={i} photo={p} onOpen={onOpenLightbox}/>)}</div>
        </div>}
        {(task.photos || []).length > 0 && <div style={{marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6}}>Fotos de la tarea</div>
          <div className="photo-grid">{task.photos.map((p, i) => <PhotoThumb key={i} photo={p} onOpen={onOpenLightbox}/>)}</div>
        </div>}
        <div className="field"><label>Tu comentario (opcional)</label><textarea value={rc} onChange={e => setRc(e.target.value)} placeholder="Agrega una nota sobre tu decisión..."/></div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-red" onClick={() => {
            const comment = rc.trim() ? {text:`Rechazada: ${rc}`, author:currentUser?.name || "Desconocido", date:new Date().toISOString(), photos:[], type:"approval"} : null;
            const extra = {approvalComment:"", _hist:[hEntry("Rechazada")]};
            if (comment) extra.comments = firebase.firestore.FieldValue.arrayUnion(comment);
            advance(task.id, "In Progress", extra);
            onClose();
          }}>Rechazar</button>
          <button className="btn-primary" onClick={() => {
            const comment = rc.trim() ? {text:`Aprobada: ${rc}`, author:currentUser?.name || "Desconocido", date:new Date().toISOString(), photos:[], type:"approval"} : null;
            const extra = {_hist:[hEntry("Aprobada")]};
            if (comment) extra.comments = firebase.firestore.FieldValue.arrayUnion(comment);
            advance(task.id, "Approved", extra);
            onClose();
          }}>Aprobar</button>
        </div>
      </div>
    </div>
  </div>;
}
