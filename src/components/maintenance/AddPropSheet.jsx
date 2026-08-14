import { useState } from "react";

export function AddPropSheet({allPropNames, setModal, addProperty}) {
  const [name, setName] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const dup = allPropNames.includes(name.trim());

  return <div className="modal-overlay" onClick={() => setModal(null)}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Agregar propiedad</div>
        <div className="modal-sub">Ingresa el nombre de la propiedad</div>
        <div className="field"><label>Nombre de propiedad</label><input value={name} onChange={e => setName(e.target.value)} placeholder="ej. Villa Brisa del Mar" style={{borderColor:dup ? "#F09595" : "#e8e8e8"}}/></div>
        {dup && <div style={{fontSize:12, color:"#A32D2D", marginBottom:12}}>El nombre ya existe.</div>}
        <div style={{display:"flex", gap:10}}>
          <div className="field" style={{flex:1}}><label>Recámaras</label><input type="number" min="0" step="1" value={bedrooms} onChange={e => setBedrooms(e.target.value)} placeholder="0 = estudio"/></div>
          <div className="field" style={{flex:1}}><label>Baños</label><input type="number" min="0" step="0.5" value={bathrooms} onChange={e => setBathrooms(e.target.value)} placeholder="ej. 4.5"/></div>
        </div>
        <div style={{fontSize:11, color:"#aaa", marginTop:-6, marginBottom:12}}>Se usan para generar el checklist de limpieza por cuarto. Puedes dejarlo en blanco y agregarlo después.</div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => { if (!name.trim() || dup) return; addProperty(name.trim(), bedrooms === "" ? null : Number(bedrooms), bathrooms === "" ? null : Number(bathrooms)); setModal(null); }} style={{opacity:name.trim() && !dup ? 1 : 0.5}}>Agregar</button>
        </div>
      </div>
    </div>
  </div>;
}
