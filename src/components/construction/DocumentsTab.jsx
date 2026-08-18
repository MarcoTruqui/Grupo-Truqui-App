import { useState } from "react";
import { CONSTRUCTION_DOC_CATEGORIES } from "../../lib/constants";
import { DocumentUploadSheet } from "./DocumentUploadSheet";
import { PlanImageViewer } from "./PlanImageViewer";

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {day:"numeric", month:"short", year:"numeric"});
}

export function DocumentsTab({projectId, documents, details, uploadConstructionDocument, removeConstructionDocument, addDetailPin, addDetailVersion, removeDetailPin, updateDetailLabel}) {
  const [sheet, setSheet] = useState(null); // {previousDoc} | {previousDoc:null} | null
  const [historyOpenId, setHistoryOpenId] = useState(null);
  const [viewingPlanDoc, setViewingPlanDoc] = useState(null);
  const latest = documents.filter(d => d.isLatest);

  return <div>
    <button className="btn-primary" style={{marginBottom:16}} onClick={() => setSheet({previousDoc:null})}>+ Nuevo documento</button>
    {CONSTRUCTION_DOC_CATEGORIES.map(cat => {
      const docs = latest.filter(d => d.category === cat);
      if (!docs.length) return null;
      return <div key={cat} style={{marginBottom:20}}>
        <div className="section-label">{cat}</div>
        {docs.map(d => {
          const rootId = d.rootId || d.id;
          const priorVersions = documents.filter(v => (v.rootId || v.id) === rootId && v.id !== d.id).sort((a, b) => b.version - a.version);
          const historyOpen = historyOpenId === d.id;
          return <div key={d.id} className="task-item" style={{cursor:"default"}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4}}>
              <div className="task-title" style={{marginBottom:0}}>{d.name}</div>
              <span className="badge" style={{background:"#E6F1FB", color:"#185FA5"}}>v{d.version}</span>
            </div>
            <div className="task-prop">Subido {fmtDate(d.uploadedAt)} por {d.uploadedBy}</div>
            <div style={{display:"flex", gap:8, marginTop:8, flexWrap:"wrap", alignItems:"center"}}>
              {d.isImage
                ? <button onClick={() => setViewingPlanDoc(d)} style={{background:"none", border:"none", color:"#534AB7", fontSize:12, fontWeight:600, cursor:"pointer", padding:0}}>Ver y marcar detalles ›</button>
                : <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{fontSize:12, color:"#534AB7", fontWeight:600, textDecoration:"none"}}>Ver ›</a>}
              <button onClick={() => setSheet({previousDoc:d})} style={{background:"none", border:"none", color:"#666", fontSize:12, cursor:"pointer", padding:0}}>Nueva versión</button>
              {priorVersions.length > 0 && <button onClick={() => setHistoryOpenId(historyOpen ? null : d.id)} style={{background:"none", border:"none", color:"#666", fontSize:12, cursor:"pointer", padding:0}}>{historyOpen ? "Ocultar versiones anteriores" : `Ver versiones anteriores (${priorVersions.length})`}</button>}
              <button onClick={() => { if (confirm("¿Eliminar este documento?")) removeConstructionDocument(d.id); }} style={{background:"none", border:"none", color:"#A32D2D", fontSize:12, cursor:"pointer", padding:0, marginLeft:"auto"}}>Eliminar</button>
            </div>
            {historyOpen && <div style={{marginTop:10, paddingTop:10, borderTop:"0.5px solid #f0f0f0"}}>
              {priorVersions.map(v => (
                <div key={v.id} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", fontSize:12}}>
                  <div style={{color:"#888"}}><span style={{fontWeight:700, color:"#555"}}>v{v.version}</span> · {fmtDate(v.uploadedAt)} · {v.uploadedBy}</div>
                  <a href={v.fileUrl} target="_blank" rel="noreferrer" style={{color:"#534AB7", fontWeight:600, textDecoration:"none"}}>Ver ›</a>
                </div>
              ))}
            </div>}
          </div>;
        })}
      </div>;
    })}
    {latest.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:32}}>Sin documentos aún.</div>}
    {sheet && <DocumentUploadSheet projectId={projectId} previousDoc={sheet.previousDoc} uploadConstructionDocument={uploadConstructionDocument} onClose={() => setSheet(null)}/>}
    {viewingPlanDoc && <PlanImageViewer
      projectId={projectId} planDoc={viewingPlanDoc}
      details={details.filter(det => det.rootId === (viewingPlanDoc.rootId || viewingPlanDoc.id))}
      addDetailPin={addDetailPin} addDetailVersion={addDetailVersion} removeDetailPin={removeDetailPin} updateDetailLabel={updateDetailLabel}
      onClose={() => setViewingPlanDoc(null)}/>}
  </div>;
}
