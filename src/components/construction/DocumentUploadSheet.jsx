import { useState, useRef } from "react";
import { CONSTRUCTION_DOC_CATEGORIES } from "../../lib/constants";

export function DocumentUploadSheet({projectId, previousDoc, uploadConstructionDocument, onClose}) {
  const [name, setName] = useState(previousDoc?.name || "");
  const [category, setCategory] = useState(previousDoc?.category || CONSTRUCTION_DOC_CATEGORIES[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function handleUpload() {
    if (!file || !name.trim()) return;
    setUploading(true);
    await uploadConstructionDocument(projectId, file, category, name.trim(), previousDoc?.id || null, previousDoc?.version || 0);
    setUploading(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{height:"auto", borderRadius:20}}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div className="modal-title">{previousDoc ? `Nueva versión — ${previousDoc.name}` : "Nuevo documento"}</div>
        <div className="modal-sub">Planos, shop drawings, arquitectónicos o blueprints</div>
        {!previousDoc && <div className="field"><label>Nombre</label><input value={name} onChange={e => setName(e.target.value)} placeholder="ej. Planta baja — Nivel 1"/></div>}
        {!previousDoc && <div className="field"><label>Categoría</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CONSTRUCTION_DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>}
        <div className="field">
          <label>Archivo</label>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf" style={{display:"none"}} onChange={e => setFile(e.target.files[0] || null)}/>
          <button className="photo-upload-btn" style={{width:"100%"}} onClick={() => fileRef.current.click()}>{file ? file.name : "+ Elegir archivo"}</button>
        </div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleUpload} style={{opacity:file && name.trim() ? 1 : 0.5}}>{uploading ? "Subiendo…" : "Subir"}</button>
        </div>
      </div>
    </div>
  </div>;
}
