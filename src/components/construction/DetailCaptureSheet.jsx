import { useState, useRef } from "react";
import { AnnotationCanvas } from "../shared/AnnotationCanvas";

export function DetailCaptureSheet({title, requireLabel, initialLabel, onSave, onClose}) {
  const [label, setLabel] = useState(initialLabel || "");
  const [rawImage, setRawImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const camRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setRawImage(ev.target.result);
    r.readAsDataURL(f);
    e.target.value = "";
  }

  async function handleAnnotated(dataUrl) {
    setSaving(true);
    await onSave(label.trim(), dataUrl);
    setSaving(false);
    onClose();
  }

  if (rawImage) {
    return <AnnotationCanvas imageDataUrl={rawImage} onSave={handleAnnotated} onCancel={() => setRawImage(null)}/>;
  }

  const canPick = !requireLabel || label.trim();

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{height:"auto", borderRadius:20}}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div className="modal-title">{title}</div>
        <div className="modal-sub">Toma una foto del sitio o elige una de la galería para marcarla</div>
        {requireLabel && <div className="field"><label>Título del detalle</label><input value={label} onChange={e => setLabel(e.target.value)} placeholder="ej. Anclaje de columna esquina NE"/></div>}
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
        <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
        <div className="photo-upload-row" style={{opacity:canPick ? 1 : 0.5, pointerEvents:canPick ? "auto" : "none"}}>
          <button className="photo-upload-btn" onClick={() => fileRef.current.click()}>+ Galería</button>
          <button className="photo-upload-btn" onClick={() => camRef.current.click()}>+ Cámara</button>
        </div>
        {requireLabel && !canPick && <div style={{fontSize:11, color:"#aaa", marginTop:8}}>Escribe un título antes de elegir la foto.</div>}
      </div>
      <div className="modal-sheet-bottom">
        <button className="btn-secondary" onClick={onClose}>{saving ? "Guardando…" : "Cancelar"}</button>
      </div>
    </div>
  </div>;
}
