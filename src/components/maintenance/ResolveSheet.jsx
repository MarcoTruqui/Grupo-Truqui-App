import { useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { PhotoUpload } from "../shared/PhotoUpload";

export function ResolveSheet({task, onClose, currentUser, hEntry, advance, bgUpload}) {
  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const comment = note.trim() ? {text:`Resuelta: ${note}`, author:currentUser?.name || "Desconocido", date:new Date().toISOString(), photos:[], type:"comment"} : null;
    const extra = {_hist:[hEntry("Marcada como resuelta")]};
    if (comment) extra.comments = firebase.firestore.FieldValue.arrayUnion(comment);
    await advance(task.id, "Resolved", extra);
    if (photos.length) bgUpload(photos, `tasks/${task.id}/resolved`, task.id, "photos");
    setSaving(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Marcar como resuelta</div>
        <div className="modal-sub">Documenta el trabajo realizado</div>
        <div className="field"><label>Nota de cierre (opcional)</label><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Describe lo que se hizo..."/></div>
        <div className="field"><label>Fotos (opcional)</label><PhotoUpload photos={photos} setPhotos={setPhotos}/></div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-green" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Confirmar resuelta"}</button>
        </div>
      </div>
    </div>
  </div>;
}
