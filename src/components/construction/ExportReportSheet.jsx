import { useState } from "react";
import { exportConstructionReport } from "../../lib/constructionExportPDF";
import { todayISO, daysAgoISO, startOfWeekISO, startOfMonthISO } from "../../lib/dateHelpers";

const QUICK_RANGES = [
  ["today", "Hoy", () => [todayISO(), todayISO()]],
  ["week", "Esta semana", () => [startOfWeekISO(), todayISO()]],
  ["month", "Este mes", () => [startOfMonthISO(), todayISO()]]
];

export function ExportReportSheet({projectName, logs, photos, headcount, subcontractors, photoCategories, onClose}) {
  const [dateFrom, setDateFrom] = useState(daysAgoISO(30));
  const [dateTo, setDateTo] = useState(todayISO());
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeHeadcount, setIncludeHeadcount] = useState(true);
  const [selectedPhotoCategories, setSelectedPhotoCategories] = useState([...photoCategories]);
  const [mode, setMode] = useState("combined");

  function toggleCategory(c) {
    setSelectedPhotoCategories(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);
  }

  const filteredLogs = logs.filter(l => l.date >= dateFrom && l.date <= dateTo);
  const filteredHeadcount = headcount.filter(h => h.date >= dateFrom && h.date <= dateTo);
  const filteredPhotos = photos.filter(p => {
    const d = (p.uploadedAt || "").slice(0, 10);
    return d >= dateFrom && d <= dateTo && selectedPhotoCategories.includes(p.category);
  });

  const selectedSections = [];
  if (includeLogs) selectedSections.push({key:"logs", label:"Bitácora", data:filteredLogs});
  if (includePhotos) selectedSections.push({key:"photos", label:"Fotos", data:filteredPhotos});
  if (includeHeadcount) selectedSections.push({key:"headcount", label:"Personal", data:filteredHeadcount});

  function generateCombined() { exportConstructionReport(projectName, dateFrom, dateTo, selectedSections, subcontractors); }
  function generateOne(section) { exportConstructionReport(projectName, dateFrom, dateTo, [section], subcontractors); }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Exportar reporte</div>
        <div className="modal-sub">Elige el rango de fechas y qué incluir</div>

        <div className="field">
          <label>Rango rápido</label>
          <div style={{display:"flex", gap:8}}>
            {QUICK_RANGES.map(([key, label, getRange]) => {
              const [from, to] = getRange();
              const active = dateFrom === from && dateTo === to;
              return <button key={key} onClick={() => { setDateFrom(from); setDateTo(to); }} style={{flex:1, padding:"8px 0", borderRadius:10, border:active ? "2px solid #E87A30" : "1.5px solid #e0e0e0", background:active ? "#FDEEE3" : "#fafafa", color:active ? "#B75A17" : "#666", fontSize:12, fontWeight:active ? 700 : 400, cursor:"pointer"}}>{label}</button>;
            })}
          </div>
        </div>

        <div style={{display:"flex", gap:10}}>
          <div className="field" style={{flex:1}}><label>Desde</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}/></div>
          <div className="field" style={{flex:1}}><label>Hasta</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}/></div>
        </div>

        <div className="field">
          <label>Incluir</label>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {[
              ["logs", "Bitácora", filteredLogs.length, includeLogs, setIncludeLogs],
              ["photos", "Fotos", filteredPhotos.length, includePhotos, setIncludePhotos],
              ["headcount", "Personal", filteredHeadcount.length, includeHeadcount, setIncludeHeadcount]
            ].map(([key, label, count, checked, setChecked]) => (
              <div key={key} onClick={() => setChecked(v => !v)} style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 12px", borderRadius:10, background:checked ? "#EAF3DE" : "#fafafa", border:checked ? "1.5px solid #1D9E75" : "1.5px solid #e0e0e0"}}>
                <div style={{width:20, height:20, borderRadius:6, border:checked ? "none" : "1.5px solid #ccc", background:checked ? "#1D9E75" : "#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  {checked && <span style={{color:"#fff", fontSize:13, fontWeight:700, lineHeight:1}}>✓</span>}
                </div>
                <span style={{fontSize:14, color:checked ? "#1D9E75" : "#333", fontWeight:checked ? 600 : 400}}>{label} ({count})</span>
              </div>
            ))}
          </div>
        </div>

        {includePhotos && <div className="field">
          <label>Categorías de fotos</label>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {photoCategories.map(c => {
              const sel = selectedPhotoCategories.includes(c);
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
