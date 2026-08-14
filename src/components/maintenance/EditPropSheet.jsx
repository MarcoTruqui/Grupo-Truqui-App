import { useState } from "react";

export function EditPropSheet({editingProp, setEditingProp, properties, allPropNames, activeProp, setActiveProp, renameProperty, updateProperty}) {
  const propRec = properties.find(x => x.id === editingProp?.id);
  const [name, setName] = useState(editingProp?.old || "");
  const [bedrooms, setBedrooms] = useState(propRec?.bedrooms ?? "");
  const [bathrooms, setBathrooms] = useState(propRec?.bathrooms ?? "");
  const dup = allPropNames.includes(name.trim()) && name.trim() !== editingProp?.old;
  const valid = name.trim() && !dup;

  async function save() {
    if (!valid) return;
    if (name.trim() !== editingProp.old) {
      const renamed = await renameProperty(editingProp.id, editingProp.old, name);
      if (renamed && activeProp === editingProp.old) setActiveProp(name.trim());
    }
    await updateProperty(editingProp.id, {bedrooms:bedrooms === "" ? null : Number(bedrooms), bathrooms:bathrooms === "" ? null : Number(bathrooms)});
    setEditingProp(null);
  }

  return <div className="modal-overlay" onClick={() => setEditingProp(null)}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Editar propiedad</div>
        <div className="modal-sub">Renombrando: {editingProp?.old}</div>
        <div className="field"><label>Nuevo nombre</label><input value={name} onChange={e => setName(e.target.value)} style={{borderColor:dup ? "#F09595" : "#e8e8e8"}}/></div>
        {dup && <div style={{fontSize:12, color:"#A32D2D", marginBottom:12}}>El nombre ya existe.</div>}
        <div style={{display:"flex", gap:10}}>
          <div className="field" style={{flex:1}}><label>Recámaras</label><input type="number" min="0" step="1" value={bedrooms} onChange={e => setBedrooms(e.target.value)} placeholder="0 = estudio"/></div>
          <div className="field" style={{flex:1}}><label>Baños</label><input type="number" min="0" step="0.5" value={bathrooms} onChange={e => setBathrooms(e.target.value)} placeholder="ej. 4.5"/></div>
        </div>
        <div style={{fontSize:11, color:"#aaa", marginTop:-6, marginBottom:12}}>Se usan para generar el checklist de limpieza por cuarto.</div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => setEditingProp(null)}>Cancelar</button>
          <button className="btn-primary" onClick={save} style={{opacity:valid ? 1 : 0.5}}>Guardar</button>
        </div>
      </div>
    </div>
  </div>;
}
