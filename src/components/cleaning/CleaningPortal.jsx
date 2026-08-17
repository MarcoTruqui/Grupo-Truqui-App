import { useState } from "react";
import { COLOR_FRAMES, CLEANING_TYPE_LABEL } from "../../lib/constants";
import { fmtDate } from "../../lib/dateHelpers";
import { CleaningSheet } from "./CleaningSheet";
import { CleaningDetailSheet } from "./CleaningDetailSheet";
import { CleaningStats } from "./CleaningStats";

export function CleaningPortal({db, currentUser, role, allPropNames, propColorMap, users, cleanings, startOrJoinCleaning, setItemStatus, joinCleaningWorker, removeCleaningWorker, signCleaningWorker, cancelCleaning, addCleaningComment, onSwitch}) {
  const [activeCleaning, setActiveCleaning] = useState(null);
  const [opening, setOpening] = useState(null);
  const [cleaningSel, setCleaningSel] = useState(null);
  const [pendingProp, setPendingProp] = useState(null);
  const [tab, setTab] = useState("main");
  const isCleaning = role === "cleaning";
  const userAssignedProps = currentUser?.properties || [];
  const propNames = isCleaning ? allPropNames.filter(p => userAssignedProps.includes(p)) : allPropNames;
  const visibleCleanings = isCleaning ? cleanings.filter(c => userAssignedProps.includes(c.property)) : cleanings;
  const completedCleanings = visibleCleanings.filter(c => c.status === "completed");

  async function startCleaning(p, type) {
    if (opening) return;
    setOpening(p);
    try {
      const id = await startOrJoinCleaning(p, type);
      setActiveCleaning({id, property:p});
    } catch (e) {
      alert("Error: " + e.message);
    }
    setOpening(null);
  }

  function tapProperty(p, alreadyInProgress) {
    if (opening) return;
    if (alreadyInProgress) startCleaning(p, null);
    else setPendingProp(p);
  }

  function chooseType(type) {
    const p = pendingProp;
    setPendingProp(null);
    startCleaning(p, type);
  }

  return <div style={{height:"100%", display:"flex", flexDirection:"column", background:"#f5f5f7"}}>
    <div style={{background:"#fff", padding:"16px 16px 14px", paddingTop:"calc(16px + env(safe-area-inset-top))", borderBottom:"0.5px solid rgba(0,0,0,0.08)", flexShrink:0}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:20, fontWeight:700, color:"#378ADD", letterSpacing:"-0.02em"}}>Grupo Truqui Limpieza</div>
          <div style={{fontSize:12, color:"#888", marginTop:1}}>Hola, {currentUser.name.split(" ")[0]}</div>
        </div>
        {onSwitch && <button onClick={onSwitch} style={{fontSize:11, padding:"6px 14px", borderRadius:8, border:"0.5px solid rgba(0,0,0,0.12)", background:"#f5f5f5", color:"#555", cursor:"pointer", fontWeight:500}}>⊞ Portales</button>}
      </div>
      {role === "admin" && <div style={{display:"flex", gap:4, marginTop:14}}>
        <button onClick={() => setTab("main")} style={{flex:1, padding:"9px 0", border:"none", borderRadius:8, background: tab === "main" ? "#E6F1FB" : "transparent", color: tab === "main" ? "#378ADD" : "#999", fontSize:13, fontWeight:600, cursor:"pointer"}}>Portal</button>
        <button onClick={() => setTab("stats")} style={{flex:1, padding:"9px 0", border:"none", borderRadius:8, background: tab === "stats" ? "#E6F1FB" : "transparent", color: tab === "stats" ? "#378ADD" : "#999", fontSize:13, fontWeight:600, cursor:"pointer"}}>📊 Estadísticas</button>
      </div>}
    </div>
    <div style={{flex:1, overflowY:"auto", padding:"20px 14px", WebkitOverflowScrolling:"touch"}}>
      {tab === "stats" ? <CleaningStats cleanings={visibleCleanings}/> : <>
      <div className="section-label">Propiedades</div>
      {propNames.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>No tienes propiedades asignadas.</div>}
      {propNames.map(p => {
        const last = completedCleanings.filter(c => c.property === p).sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))[0];
        const inProgress = visibleCleanings.find(c => c.property === p && c.status === "in_progress");
        const clr = propColorMap[p] || COLOR_FRAMES[0];
        return <div key={p} className="task-item" onClick={() => tapProperty(p, !!inProgress)} style={{opacity:opening && opening !== p ? 0.5 : 1}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:10, height:10, borderRadius:"50%", background:clr.topBar, flexShrink:0}}/>
            <div style={{flex:1, minWidth:0}}>
              <div className="task-title">{p}</div>
              <div className="task-prop">{last ? `Última limpieza: ${fmtDate(last.completedAt)} · ${CLEANING_TYPE_LABEL[last.cleaningType || "checkout"]}` : "Sin limpiezas registradas"}</div>
            </div>
            {inProgress ? <div style={{color:"#BA7517", fontSize:12, fontWeight:600}}>● En curso ({CLEANING_TYPE_LABEL[inProgress.cleaningType || "checkout"]})</div> : <div style={{color:"#378ADD", fontSize:13, fontWeight:600}}>{opening === p ? "Abriendo…" : "Limpiar ›"}</div>}
          </div>
        </div>;
      })}

      <div className="section-label" style={{marginTop:20}}>Historial reciente</div>
      {completedCleanings.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>Aún no hay limpiezas registradas.</div>}
      {[...completedCleanings].sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || "")).slice(0, 30).map(c => (
        <div key={c.id} className="task-item" onClick={() => setCleaningSel(c)}>
          <div className="task-title">{c.property} · <span style={{fontWeight:500, color:"#888"}}>{CLEANING_TYPE_LABEL[c.cleaningType || "checkout"]}</span></div>
          <div className="task-prop">{fmtDate(c.completedAt)} · {c.doneItems || 0}/{c.totalItems || 0} tareas · {(c.workers || []).map(w => w.name).join(", ") || "Sin firmar"}</div>
        </div>
      ))}

      <div style={{marginTop:24}}>
        <button className="btn-red" onClick={() => window._auth.signOut()}>Cerrar sesión</button>
      </div>
      </>}
    </div>
    {pendingProp && <div className="modal-overlay" onClick={() => setPendingProp(null)}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{height:"auto", borderRadius:20}}>
        <div className="modal-handle"/>
        <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
          <div className="modal-title">{pendingProp}</div>
          <div className="modal-sub">¿Qué tipo de limpieza vas a hacer?</div>
          <div style={{display:"flex", flexDirection:"column", gap:10, marginTop:6}}>
            <button className="btn-primary" onClick={() => chooseType("daily")}>Diaria (ocupación)</button>
            <button className="btn-secondary" onClick={() => chooseType("checkout")}>Salida (check-out)</button>
          </div>
        </div>
      </div>
    </div>}
    {activeCleaning && <CleaningSheet cleaningId={activeCleaning.id} property={activeCleaning.property} db={db} currentUser={currentUser} users={users} joinCleaningWorker={joinCleaningWorker} removeCleaningWorker={removeCleaningWorker} setItemStatus={setItemStatus} signCleaningWorker={signCleaningWorker} cancelCleaning={cancelCleaning} addCleaningComment={addCleaningComment} onClose={() => setActiveCleaning(null)}/>}
    {cleaningSel && <CleaningDetailSheet cleaning={cleaningSel} db={db} role={role} onClose={() => setCleaningSel(null)}/>}
  </div>;
}
