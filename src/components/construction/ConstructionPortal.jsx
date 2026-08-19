import { useState } from "react";
import { HeadcountTab } from "./HeadcountTab";
import { DailyLogTab } from "./DailyLogTab";
import { PhotosTab } from "./PhotosTab";
import { DocumentsTab } from "./DocumentsTab";
import { SubcontractorsTab } from "./SubcontractorsTab";
import { ExportReportSheet } from "./ExportReportSheet";
import { CONSTRUCTION_PHOTO_CATEGORIES } from "../../lib/constants";

const TABS = [["headcount","👷","Personal"],["log","📋","Bitácora"],["photos","📷","Fotos"],["docs","📐","Planos"],["subs","💰","Subcontratistas"]];

export function ConstructionPortal({db, storage, currentUser, projects, headcount, dailyLogs, photos, documents, details, subcontractors, addConstructionProject, updateConstructionProject, renamePhotoCategory, saveHeadcountEntry, removeHeadcountEntry, addDailyLog, removeDailyLog, addConstructionPhotos, removeConstructionPhoto, uploadConstructionDocument, removeConstructionDocument, addDetailPin, addDetailVersion, removeDetailPin, updateDetailLabel, addSubcontractor, updateSubcontractor, removeSubcontractor, addSubPayment, removeSubPayment, onSwitch}) {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [tab, setTab] = useState("headcount");
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);

  async function handleCreateProject() {
    const name = newProjectName.trim();
    if (!name) return;
    setCreating(true);
    await addConstructionProject(name);
    setCreating(false);
    setNewProjectName("");
    setNewProjectOpen(false);
  }

  if (!activeProject) {
    return <div style={{height:"100%", display:"flex", flexDirection:"column", background:"#f5f5f7"}}>
      <div style={{background:"#fff", padding:"16px 16px 14px", paddingTop:"calc(16px + env(safe-area-inset-top))", borderBottom:"0.5px solid rgba(0,0,0,0.08)", flexShrink:0}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:20, fontWeight:700, color:"#E87A30", letterSpacing:"-0.02em"}}>Grupo Truqui Construcción</div>
            <div style={{fontSize:12, color:"#888", marginTop:1}}>Hola, {currentUser.name.split(" ")[0]}</div>
          </div>
          {onSwitch && <button onClick={onSwitch} style={{fontSize:11, padding:"6px 14px", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.12)", background:"#f5f5f5", color:"#555", cursor:"pointer", fontWeight:500}}>⊞ Portales</button>}
        </div>
      </div>
      <div style={{flex:1, overflowY:"auto", padding:"20px 14px", WebkitOverflowScrolling:"touch"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14}}>
          <div className="section-label" style={{margin:0}}>Proyectos</div>
          <button onClick={() => setNewProjectOpen(true)} style={{background:"#E87A30", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:600}}>+ Nuevo</button>
        </div>
        {projects.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:32}}>Sin proyectos aún. Crea el primero para empezar.</div>}
        {[...projects].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).map(p => (
          <div key={p.id} className="task-item" onClick={() => setActiveProjectId(p.id)}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <div>
                <div className="task-title">{p.name}</div>
                <div className="task-prop">{p.status === "completed" ? "Completado" : "Activo"}</div>
              </div>
              <div style={{color:"#E87A30", fontSize:22, fontWeight:300}}>›</div>
            </div>
          </div>
        ))}
      </div>
      {newProjectOpen && <div className="modal-overlay" onClick={() => setNewProjectOpen(false)}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{height:"auto", borderRadius:20}}>
          <div className="modal-handle"/>
          <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
            <div className="modal-title">Nuevo proyecto</div>
            <div className="modal-sub">Nombre del proyecto de construcción</div>
            <div className="field"><input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="ej. Villa Amanecer — Construcción"/></div>
          </div>
          <div className="modal-sheet-bottom">
            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setNewProjectOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreateProject} style={{opacity:newProjectName.trim() ? 1 : 0.5}}>{creating ? "Creando…" : "Crear"}</button>
            </div>
          </div>
        </div>
      </div>}
    </div>;
  }

  const projectHeadcount = headcount.filter(h => h.projectId === activeProjectId);
  const projectLogs = dailyLogs.filter(l => l.projectId === activeProjectId);
  const projectPhotos = photos.filter(ph => ph.projectId === activeProjectId);
  const projectDocs = documents.filter(d => d.projectId === activeProjectId);
  const projectDetails = details.filter(det => det.projectId === activeProjectId);
  const projectSubs = subcontractors.filter(s => s.projectId === activeProjectId);
  const currentTab = TABS.find(([k]) => k === tab) || TABS[0];
  const photoCategories = (activeProject.photoCategories && activeProject.photoCategories.length) ? activeProject.photoCategories : CONSTRUCTION_PHOTO_CATEGORIES;

  return <div style={{height:"100%", display:"flex", flexDirection:"column", background:"#f5f5f7"}}>
    <div style={{background:"#fff", padding:"14px 16px 12px", paddingTop:"calc(14px + env(safe-area-inset-top))", borderBottom:"0.5px solid rgba(0,0,0,0.08)", flexShrink:0}}>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
        <button onClick={() => setActiveProjectId(null)} style={{background:"none", border:"none", cursor:"pointer", color:"#E87A30", fontSize:13, padding:0}}>‹ Proyectos</button>
      </div>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{fontSize:18, fontWeight:700, color:"#1a1a1a"}}>🏗️ {activeProject.name}</div>
        {onSwitch && <button onClick={onSwitch} style={{fontSize:11, padding:"6px 12px", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.12)", background:"#f5f5f5", color:"#555", cursor:"pointer"}}>⊞ Portales</button>}
      </div>
    </div>

    <div onClick={() => setMenuOpen(true)} style={{flexShrink:0, background:"#fff", borderBottom:"0.5px solid rgba(0,0,0,0.08)", padding:"10px 16px", display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}>
      <span style={{fontSize:20, lineHeight:1}}>☰</span>
      <span style={{fontSize:15, fontWeight:700, color:"#1a1a1a"}}>{currentTab[1]} {currentTab[2]}</span>
    </div>

    <div style={{flex:1, overflowY:"auto", padding:"16px 14px 32px", WebkitOverflowScrolling:"touch"}}>
      {tab === "headcount" && <HeadcountTab projectId={activeProjectId} currentUser={currentUser} db={db} entries={projectHeadcount} subcontractors={projectSubs} saveHeadcountEntry={saveHeadcountEntry} removeHeadcountEntry={removeHeadcountEntry}/>}
      {tab === "log" && <DailyLogTab projectId={activeProjectId} currentUser={currentUser} db={db} logs={projectLogs} subcontractors={projectSubs} addDailyLog={addDailyLog} removeDailyLog={removeDailyLog}/>}
      {tab === "photos" && <PhotosTab projectId={activeProjectId} currentUser={currentUser} storage={storage} db={db} photos={projectPhotos} photoCategories={photoCategories} updateConstructionProject={updateConstructionProject} renamePhotoCategory={renamePhotoCategory} addConstructionPhotos={addConstructionPhotos} removeConstructionPhoto={removeConstructionPhoto}/>}
      {tab === "docs" && <DocumentsTab projectId={activeProjectId} currentUser={currentUser} storage={storage} db={db} documents={projectDocs} details={projectDetails} uploadConstructionDocument={uploadConstructionDocument} removeConstructionDocument={removeConstructionDocument} addDetailPin={addDetailPin} addDetailVersion={addDetailVersion} removeDetailPin={removeDetailPin} updateDetailLabel={updateDetailLabel}/>}
      {tab === "subs" && <SubcontractorsTab projectId={activeProjectId} currentUser={currentUser} db={db} subcontractors={projectSubs} addSubcontractor={addSubcontractor} updateSubcontractor={updateSubcontractor} removeSubcontractor={removeSubcontractor} addSubPayment={addSubPayment} removeSubPayment={removeSubPayment}/>}
    </div>

    {menuOpen && <div className="modal-overlay" onClick={() => setMenuOpen(false)} style={{alignItems:"flex-start"}}>
      <div onClick={e => e.stopPropagation()} style={{background:"#fff", width:"100%", maxWidth:500, margin:"0 auto", borderRadius:"0 0 20px 20px", paddingTop:"calc(8px + env(safe-area-inset-top))", paddingBottom:12}}>
        <div style={{padding:"10px 16px", fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.06em"}}>Secciones</div>
        {TABS.map(([k, icon, l]) => (
          <div key={k} onClick={() => { setTab(k); setMenuOpen(false); }} style={{display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:tab === k ? "#FDEEE3" : "transparent", cursor:"pointer"}}>
            <span style={{fontSize:22, width:28, textAlign:"center"}}>{icon}</span>
            <span style={{fontSize:15, fontWeight:tab === k ? 700 : 500, color:tab === k ? "#E87A30" : "#1a1a1a"}}>{l}</span>
            {tab === k && <span style={{marginLeft:"auto", color:"#E87A30"}}>✓</span>}
          </div>
        ))}
        <div style={{height:1, background:"#f0f0f0", margin:"8px 0"}}/>
        <div onClick={() => { setExportOpen(true); setMenuOpen(false); }} style={{display:"flex", alignItems:"center", gap:14, padding:"14px 16px", cursor:"pointer"}}>
          <span style={{fontSize:22, width:28, textAlign:"center"}}>📄</span>
          <span style={{fontSize:15, fontWeight:500, color:"#1a1a1a"}}>Exportar reporte</span>
        </div>
      </div>
    </div>}

    {exportOpen && <ExportReportSheet projectName={activeProject.name} logs={projectLogs} photos={projectPhotos} headcount={projectHeadcount} subcontractors={projectSubs} photoCategories={photoCategories} onClose={() => setExportOpen(false)}/>}
  </div>;
}
