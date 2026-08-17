import { useState } from "react";
import { CONSTRUCTION_DOC_CATEGORIES } from "../../lib/constants";
import { DocumentUploadSheet } from "./DocumentUploadSheet";

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {day:"numeric", month:"short", year:"numeric"});
}

export function DocumentsTab({projectId, documents, uploadConstructionDocument, removeConstructionDocument}) {
  const [sheet, setSheet] = useState(null); // {previousDoc} | {previousDoc:null} | null
  const latest = documents.filter(d => d.isLatest);

  return <div>
    <button className="btn-primary" style={{marginBottom:16}} onClick={() => setSheet({previousDoc:null})}>+ Nuevo documento</button>
    {CONSTRUCTION_DOC_CATEGORIES.map(cat => {
      const docs = latest.filter(d => d.category === cat);
      if (!docs.length) return null;
      return <div key={cat} style={{marginBottom:20}}>
        <div className="section-label">{cat}</div>
        {docs.map(d => (
          <div key={d.id} className="task-item" style={{cursor:"default"}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4}}>
              <div className="task-title" style={{marginBottom:0}}>{d.name}</div>
              <span className="badge" style={{background:"#E6F1FB", color:"#185FA5"}}>v{d.version}</span>
            </div>
            <div className="task-prop">Subido {fmtDate(d.uploadedAt)} por {d.uploadedBy}</div>
            <div style={{display:"flex", gap:8, marginTop:8}}>
              <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{fontSize:12, color:"#534AB7", fontWeight:600, textDecoration:"none"}}>Ver ›</a>
              <button onClick={() => setSheet({previousDoc:d})} style={{background:"none", border:"none", color:"#666", fontSize:12, cursor:"pointer", padding:0}}>Nueva versión</button>
              <button onClick={() => { if (confirm("¿Eliminar este documento?")) removeConstructionDocument(d.id); }} style={{background:"none", border:"none", color:"#A32D2D", fontSize:12, cursor:"pointer", padding:0, marginLeft:"auto"}}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>;
    })}
    {latest.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:32}}>Sin documentos aún.</div>}
    {sheet && <DocumentUploadSheet projectId={projectId} previousDoc={sheet.previousDoc} uploadConstructionDocument={uploadConstructionDocument} onClose={() => setSheet(null)}/>}
  </div>;
}
