import { useState } from "react";
import { fmtDate, fmtDuration } from "../../lib/dateHelpers";
import { isAnomalousMachineLog } from "../../lib/constructionHelpers";
import { PhotoUpload } from "../shared/PhotoUpload";

export function MachineLogDetailSheet({log, projectId, stopMachineUse, removeMachineLog, onClose}) {
  const [endHorometro, setEndHorometro] = useState("");
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  const isOpen = log.status === "in_progress";
  const canSave = endHorometro !== "" && !isNaN(Number(endHorometro)) && photos.length > 0;

  async function handleClose() {
    if (!canSave) return;
    const end = Number(endHorometro);
    const start = Number(log.startHorometro);
    if (end < start) {
      if (!confirm(`El horómetro final (${end}) es menor al inicial (${start}). Un horómetro nunca debe bajar. ¿Registrar de todas formas?`)) return;
    } else {
      const elapsedMs = Date.now() - new Date(log.startAt).getTime();
      const usedHours = end - start;
      if (usedHours > (elapsedMs / 3600000) + 0.5) {
        if (!confirm(`Registraste ${usedHours.toFixed(1)} horas de uso, pero solo han pasado ${fmtDuration(elapsedMs)} desde que se inició. ¿Registrar de todas formas?`)) return;
      }
    }
    setSaving(true);
    await stopMachineUse(projectId, log.id, log.startHorometro, endHorometro, photos);
    setSaving(false);
    onClose();
  }

  function handleDelete() {
    if (!confirm("¿Eliminar este registro de uso? Se borrará permanentemente.")) return;
    removeMachineLog(log.id);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div className="modal-title">{log.machineName}</div>
        <div className="modal-sub">{isOpen ? "En uso" : "Uso completado"}</div>

        <div className="section-label">Inicio</div>
        <div style={{background:"#f8f8f8", borderRadius:10, padding:12, marginBottom:16}}>
          <div style={{fontSize:13, fontWeight:600}}>Horómetro: {log.startHorometro}</div>
          <div style={{fontSize:11, color:"#888", marginTop:2}}>{fmtDate(log.startAt)} · {log.startedBy}</div>
          {(log.startPhotoUrls || []).length > 0 && <div style={{display:"flex", gap:6, marginTop:8, flexWrap:"wrap"}}>
            {log.startPhotoUrls.map((u, i) => <img key={i} src={u} onClick={() => window.open(u, "_blank")} style={{width:60, height:60, borderRadius:8, objectFit:"cover", cursor:"pointer"}}/>)}
          </div>}
        </div>

        {!isOpen && <>
          <div className="section-label">Cierre</div>
          <div style={{background:"#f8f8f8", borderRadius:10, padding:12, marginBottom:16}}>
            <div style={{fontSize:13, fontWeight:600}}>Horómetro: {log.endHorometro}</div>
            <div style={{fontSize:11, color:"#888", marginTop:2}}>{fmtDate(log.endAt)} · {log.endedBy}</div>
            {(log.endPhotoUrls || []).length > 0 && <div style={{display:"flex", gap:6, marginTop:8, flexWrap:"wrap"}}>
              {log.endPhotoUrls.map((u, i) => <img key={i} src={u} onClick={() => window.open(u, "_blank")} style={{width:60, height:60, borderRadius:8, objectFit:"cover", cursor:"pointer"}}/>)}
            </div>}
          </div>
          <div style={{textAlign:"center", background:"#FDEEE3", borderRadius:10, padding:"12px 0", marginBottom:16}}>
            <div style={{fontSize:22, fontWeight:800, color:"#E87A30"}}>{log.totalHours}</div>
            <div style={{fontSize:11, color:"#B75A17"}}>horas de uso</div>
          </div>
          {isAnomalousMachineLog(log) && <div style={{fontSize:12, color:"#A32D2D", background:"#FCEBEB", padding:"8px 10px", borderRadius:8, marginBottom:16}}>⚠️ Esta lectura no parece coincidir con el tiempo transcurrido entre inicio y cierre — revisar.</div>}
        </>}

        {isOpen && <>
          <div className="section-label">Registrar cierre</div>
          <div className="field"><label>Horómetro final</label><input type="number" min="0" step="0.1" value={endHorometro} onChange={e => setEndHorometro(e.target.value)} placeholder="ej. 1292.0"/></div>
          <div className="field"><label>Foto del horómetro</label><PhotoUpload photos={photos} setPhotos={setPhotos}/></div>
          <button className="btn-primary" style={{width:"100%", marginBottom:16, opacity:canSave ? 1 : 0.5}} onClick={handleClose} disabled={!canSave || saving}>{saving ? "Guardando…" : "Registrar cierre"}</button>
        </>}

        <button className="btn-red" onClick={handleDelete}>Eliminar registro</button>
      </div>
      <div className="modal-sheet-bottom">
        <button className="btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  </div>;
}
