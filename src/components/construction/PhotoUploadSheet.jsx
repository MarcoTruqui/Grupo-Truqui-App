import { useState } from "react";
import { PhotoUpload } from "../shared/PhotoUpload";

export function PhotoUploadSheet({projectId, photoCategories, addConstructionPhotos, onClose}) {
  const [category, setCategory] = useState(photoCategories[0] || "");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!photos.length) return;
    setUploading(true);
    await addConstructionPhotos(projectId, photos, category);
    setUploading(false);
    onClose();
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Subir fotos</div>
        <div className="modal-sub">Categoriza las fotos del avance de obra</div>
        <div className="field"><label>Categoría</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {photoCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field"><label>Fotos</label><PhotoUpload photos={photos} setPhotos={setPhotos}/></div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleUpload} style={{opacity:photos.length ? 1 : 0.5}}>{uploading ? "Subiendo…" : `Subir (${photos.length})`}</button>
        </div>
      </div>
    </div>
  </div>;
}
