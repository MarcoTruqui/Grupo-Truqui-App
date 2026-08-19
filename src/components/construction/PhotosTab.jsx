import { useState } from "react";
import { PhotoUploadSheet } from "./PhotoUploadSheet";
import { PhotoCategoriesSheet } from "./PhotoCategoriesSheet";
import { ZoomLightbox } from "../shared/ZoomLightbox";

function fmtDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {day:"numeric", month:"short", hour:"numeric", minute:"2-digit"});
}

export function PhotosTab({projectId, photos, photoCategories, updateConstructionProject, renamePhotoCategory, addConstructionPhotos, removeConstructionPhoto}) {
  const [filter, setFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const shown = filter === "all" ? photos : photos.filter(p => p.category === filter);
  const sorted = [...shown].sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));

  return <div>
    <div style={{display:"flex", gap:8, marginBottom:16}}>
      <button className="btn-primary" style={{flex:1}} onClick={() => setUploadOpen(true)}>+ Subir fotos</button>
      <button onClick={() => setCategoriesOpen(true)} style={{background:"#f5f5f7", border:"0.5px solid rgba(0,0,0,0.12)", borderRadius:10, padding:"0 16px", fontSize:16, cursor:"pointer"}}>⚙️</button>
    </div>
    <div className="filter-row">
      <div className={`filter-pill${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>Todas ({photos.length})</div>
      {photoCategories.map(c => {
        const n = photos.filter(p => p.category === c).length;
        return n > 0 ? <div key={c} className={`filter-pill${filter === c ? " active" : ""}`} onClick={() => setFilter(c)}>{c} ({n})</div> : null;
      })}
    </div>
    {sorted.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:32}}>Sin fotos aún.</div>}
    <div className="photo-grid">
      {sorted.map(p => (
        <div key={p.id} style={{position:"relative", display:"flex", flexDirection:"column", alignItems:"center"}}>
          <img src={p.url} className="photo-thumb" onClick={() => setLightbox(p)}/>
          <button onClick={() => { if (confirm("¿Eliminar esta foto?")) removeConstructionPhoto(p.id); }} style={{position:"absolute", top:-4, right:-4, background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:11, cursor:"pointer", padding:0}}>×</button>
          <div className="photo-caption">{p.uploadedBy}</div>
          <div className="photo-caption" style={{marginTop:0}}>{fmtDateTime(p.uploadedAt)}</div>
        </div>
      ))}
    </div>
    {uploadOpen && <PhotoUploadSheet projectId={projectId} photoCategories={photoCategories} addConstructionPhotos={addConstructionPhotos} onClose={() => setUploadOpen(false)}/>}
    {categoriesOpen && <PhotoCategoriesSheet projectId={projectId} photoCategories={photoCategories} updateConstructionProject={updateConstructionProject} renamePhotoCategory={renamePhotoCategory} onClose={() => setCategoriesOpen(false)}/>}
    {lightbox && <ZoomLightbox src={lightbox.url} caption={`${lightbox.category}${lightbox.caption ? " — " + lightbox.caption : ""} · ${lightbox.uploadedBy}, ${fmtDateTime(lightbox.uploadedAt)}`} onClose={() => setLightbox(null)}/>}
  </div>;
}
