import { useState } from "react";
import { ROOM_SEED, matchRoomSeed } from "../../lib/constants";

export function ImportRoomsSheet({properties, setModal, updateProperty}) {
  const rows = properties.map(p => ({id:p.id, name:p.name, currentBedrooms:p.bedrooms, currentBathrooms:p.bathrooms, match:matchRoomSeed(p.name)}));
  const matched = rows.filter(r => r.match);
  const unmatched = rows.filter(r => !r.match);
  const unmatchedSeeds = ROOM_SEED.filter(seed => !matched.some(r => r.match.name === seed.name));
  const [checked, setChecked] = useState(() => Object.fromEntries(matched.map(r => [r.id, true])));
  const [applying, setApplying] = useState(false);
  const selectedCount = matched.filter(r => checked[r.id]).length;

  async function apply() {
    setApplying(true);
    try {
      await Promise.all(matched.filter(r => checked[r.id]).map(r => updateProperty(r.id, {bedrooms:r.match.bedrooms, bathrooms:r.match.bathrooms})));
      setModal(null);
    } catch (e) { alert("Error: " + e.message); setApplying(false); }
  }

  return <div className="modal-overlay" onClick={() => { if (!applying) setModal(null); }}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Importar recámaras/baños</div>
        <div className="modal-sub">Coincidencias encontradas con tu lista — revisa y confirma antes de aplicar</div>

        {matched.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>No se encontraron coincidencias.</div>}
        {matched.map(r => (
          <label key={r.id} style={{display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"0.5px solid rgba(0,0,0,0.06)", cursor:"pointer"}}>
            <input type="checkbox" checked={!!checked[r.id]} onChange={e => setChecked(c => ({...c, [r.id]:e.target.checked}))} style={{width:18, height:18}}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13.5, fontWeight:600}}>{r.name}</div>
              <div style={{fontSize:11, color:"#888"}}>{r.match.name} → {r.match.bedrooms === 0 ? "Estudio" : r.match.bedrooms + " rec."} · {r.match.bathrooms} baños{r.currentBedrooms != null ? ` (actual: ${r.currentBedrooms === 0 ? "Estudio" : r.currentBedrooms + " rec."} · ${r.currentBathrooms} baños)` : ""}</div>
            </div>
          </label>
        ))}

        {unmatched.length > 0 && <>
          <div className="section-label" style={{marginTop:16}}>Sin coincidencia en tu lista</div>
          {unmatched.map(r => <div key={r.id} style={{fontSize:12, color:"#aaa", padding:"4px 0"}}>{r.name}</div>)}
        </>}

        {unmatchedSeeds.length > 0 && <>
          <div className="section-label" style={{marginTop:16}}>De tu lista, sin propiedad correspondiente en la app</div>
          {unmatchedSeeds.map(s => <div key={s.name} style={{fontSize:12, color:"#aaa", padding:"4px 0"}}>{s.name}</div>)}
        </>}
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => setModal(null)} disabled={applying}>Cancelar</button>
          <button className="btn-primary" onClick={apply} disabled={applying || selectedCount === 0} style={{opacity:selectedCount === 0 ? 0.5 : 1}}>{applying ? "Aplicando…" : `Aplicar (${selectedCount})`}</button>
        </div>
      </div>
    </div>
  </div>;
}
