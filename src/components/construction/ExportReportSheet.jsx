import { useState } from "react";
import { CONSTRUCTION_PHOTO_CATEGORIES } from "../../lib/constants";
import { exportConstructionReport } from "../../lib/constructionExportPDF";

function todayISO() { return new Date().toISOString().slice(0, 10); }
function daysAgoISO(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }

export function ExportReportSheet({projectName, logs, photos, headcount, onClose}) {
  const [dateFrom, setDateFrom] = useState(daysAgoISO(30));
  const [dateTo, setDateTo] = useState(todayISO());
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeHeadcount, setIncludeHeadcount] = useState(true);
  const [photoCategories, setPhotoCategories] = useState([...CONSTRUCTION_PHOTO_CATEGORIES]);
  const [mode, setMode] = useState("combined");

  function toggleCategory(c) {
    setPhotoCategories(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);
  }

  const filteredLogs = logs.filter(l => l.date >= dateFrom && l.date <= dateTo);
  const filteredHeadcount = headcount.filter(h => h.date >= dateFrom && h.date <= dateTo);
  const filteredPhotos = photos.filter(p => {
    const d = (p.uploadedAt || "").slice(0, 10);
    return d >= dateFrom && d <= dateTo && photoCategories.includes(p.category);
  });

  const selectedSections = [];
  if (includeLogs) selectedSections.push({key:"logs", label:"Bitácora", data:filteredLogs});
  if (includePhotos) selectedSections.push({key:"photos", label:"Fotos", data:filteredPhotos});
  if (includeHeadcount) selectedSections.push({key:"headcount", label:"Personal", data:filteredHeadcount});

  function generateCombined() { exportConstructionReport(projectName, dateFrom, dateTo, selectedSections); }
  function generateOne(section) { exportConstructionReport(projectName, dateFrom, dateTo, [section]); }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Exportar reporte</div>
        <div className="modal-sub">Elige el rango de fechas y qué incluir</div>

        <div style={{display:"flex", gap:10}}>
          <div className="field" style={{flex:1}}><label>Desde</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}/></div>
          <div className="field" style={{flex:1}}><label>Hasta</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}/></div>
        </div>

        <div className="field">
          <label>Incluir</label>
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            <label style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}>
              <input type="checkbox" checked={includeLogs} onChange={e => setIncludeLogs(e.target.checked)} style={{width:18, height:18}}/>
              <span style={{fontSize:14}}>Bitácora ({filteredLogs.length})</span>
            </label>
            <label style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}>
              <input type="checkbox" checked={includePhotos} onChange={e => setIncludePhotos(e.target.checked)} style={{width:18, height:18}}/>
              <span style={{fontSize:14}}>Fotos ({filteredPhotos.length})</span>
            </label>
            <label style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}>
              <input type="checkbox" checked={includeHeadcount} onChange={e => setIncludeHeadcount(e.target.checked)} style={{width:18, height:18}}/>
              <span style={{fontSize:14}}>Personal ({filteredHeadcount.length})</span>
            </label>
          </div>
        </div>

        {includePhotos && <div className="field">
          <label>Categorías de fotos</label>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {CONSTRUCTION_PHOTO_CATEGORIES.map(c => {
              const sel = photoCategories.includes(c);
              return <button key={c} onClick={() => toggleCategory(c)} style={{padding:"7px 12px", borderRadius:10, border:sel ? "2px solid #E87A30" : "1.5px solid #e0e0e0", background:sel ? "#FDEEE3" : "#fafafa", color:sel ? "#B75A17" : "#666", fontSize:12, cursor:"pointer", fontWeight:sel ? 700 : 400}}>{c}</button>;
            })}
          </div>
        </div>}

        {selectedSections.length > 1 && <div className="field">
          <label>Formato</label>
          <div style={{display:"flex", gap:8}}>
            <button onClick={() => setMode("combined")} style={{flex:1, padding:"10px 0", borderRadius:10, border:mode === "combined" ? "2px solid #E87A30" : "1.5px solid #e0e0e0", background:mode === "combined" ? "#FDEEE3" : "#fafafa", color:mode === "combined" ? "#B75A17" : "#666", fontSize:13, fontWeight:mode === "combined" ? 700 : 400, cursor:"pointer"}}>Un PDF combinado</button>
            <button onClick={() => setMode("individual")} style={{flex:1, padding:"10px 0", borderRadius:10, border:mode === "individual" ? "2px solid #E87A30" : "1.5px solid #e0e0e0", background:mode === "individual" ? "#FDEEE3" : "#fafafa", color:mode === "individual" ? "#B75A17" : "#666", fontSize:13, fontWeight:mode === "individual" ? 700 : 400, cursor:"pointer"}}>PDF por categoría</button>
          </div>
        </div>}
      </div>
      <div className="modal-sheet-bottom">
        {selectedSections.length === 0 && <div style={{textAlign:"center", fontSize:12, color:"#aaa", marginBottom:10}}>Selecciona al menos una categoría.</div>}
        {selectedSections.length > 0 && (mode === "combined" || selectedSections.length === 1) && <button className="btn-primary" onClick={generateCombined}>Generar PDF</button>}
        {selectedSections.length > 1 && mode === "individual" && <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {selectedSections.map(s => <button key={s.key} className="btn-secondary" onClick={() => generateOne(s)}>Generar PDF — {s.label}</button>)}
        </div>}
        <button className="btn-secondary" style={{marginTop:10}} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  </div>;
}
