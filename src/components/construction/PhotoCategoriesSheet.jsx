import { useState } from "react";

export function PhotoCategoriesSheet({projectId, photoCategories, updateConstructionProject, renamePhotoCategory, onClose}) {
  const [newCat, setNewCat] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const name = newCat.trim();
    if (!name || photoCategories.includes(name)) return;
    setSaving(true);
    await updateConstructionProject(projectId, {photoCategories:[...photoCategories, name]});
    setNewCat("");
    setSaving(false);
  }

  function startEdit(i) { setEditingIdx(i); setEditValue(photoCategories[i]); }

  async function saveEdit(i) {
    const oldName = photoCategories[i];
    const newName = editValue.trim();
    if (!newName || newName === oldName) { setEditingIdx(null); return; }
    setSaving(true);
    await renamePhotoCategory(projectId, oldName, newName);
    await updateConstructionProject(projectId, {photoCategories:photoCategories.map((c, j) => j === i ? newName : c)});
    setEditingIdx(null);
    setSaving(false);
  }

  async function handleDelete(i) {
    const name = photoCategories[i];
    if (!confirm(`¿Eliminar la categoría "${name}"? Las fotos ya subidas con esta categoría no se verán afectadas.`)) return;
    setSaving(true);
    await updateConstructionProject(projectId, {photoCategories:photoCategories.filter((_, j) => j !== i)});
    setSaving(false);
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{height:"auto", borderRadius:20}}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div className="modal-title">Categorías de fotos</div>
        <div className="modal-sub">Agrega, renombra o elimina categorías para clasificar las fotos</div>
        {photoCategories.map((c, i) => (
          <div key={i} style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
            {editingIdx === i ? <>
              <input value={editValue} onChange={e => setEditValue(e.target.value)} style={{flex:1}} autoFocus/>
              <button onClick={() => saveEdit(i)} style={{background:"#1D9E75", color:"#fff", border:"none", borderRadius:8, padding:"9px 12px", fontSize:12, cursor:"pointer", fontWeight:600}}>Guardar</button>
              <button onClick={() => setEditingIdx(null)} style={{background:"none", border:"none", color:"#888", fontSize:12, cursor:"pointer"}}>Cancelar</button>
            </> : <>
              <div style={{flex:1, fontSize:14, color:"#333", padding:"9px 0"}}>{c}</div>
              <button onClick={() => startEdit(i)} style={{background:"none", border:"none", color:"#534AB7", fontSize:12, cursor:"pointer", fontWeight:600}}>Editar</button>
              <button onClick={() => handleDelete(i)} style={{background:"none", border:"none", color:"#A32D2D", fontSize:18, cursor:"pointer", padding:"0 4px"}}>×</button>
            </>}
          </div>
        ))}
        <div style={{display:"flex", gap:8, marginTop:10}}>
          <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nueva categoría" style={{flex:1}} onKeyDown={e => e.key === "Enter" && handleAdd()}/>
          <button onClick={handleAdd} disabled={saving} style={{background:"#E87A30", color:"#fff", border:"none", borderRadius:10, padding:"10px 16px", fontSize:13, fontWeight:600, cursor:"pointer"}}>+ Agregar</button>
        </div>
      </div>
      <div className="modal-sheet-bottom">
        <button className="btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  </div>;
}
