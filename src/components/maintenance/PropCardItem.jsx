import { COLOR_FRAMES } from "../../lib/constants";
import { SBadge, OBadge } from "../shared/Badges";

export function PropCardItem({p, propColorMap, visibleTasks, properties, todayStr, getOccupancy, setActiveProp, setPropFilter, setTab, isAdmin, setEditingProp, removeProperty}) {
  const clr = propColorMap[p] || COLOR_FRAMES[0];
  const t = visibleTasks.filter(x => x.property === p);
  const prop = properties.find(x => x.name === p);
  const todayCount = t.filter(x => x.createdAt && x.createdAt.slice(0, 10) === todayStr).length;
  const occ = getOccupancy(p);

  return <div className="prop-card" onClick={() => { setActiveProp(p); setPropFilter("all"); setTab("property"); }}>
    <div className="prop-top" style={{background:clr.topBar}}/>
    <div className="prop-body">
      <div className="prop-name-row">
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:34, height:34, borderRadius:8, background:clr.iconBg, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={clr.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          </div>
          <span className="prop-name">{p}</span>
          {todayCount > 0 && <span style={{background:"#BA7517", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, lineHeight:"14px", flexShrink:0}}>{todayCount} hoy</span>}
        </div>
        <div style={{display:"flex", gap:6, alignItems:"center"}} onClick={e => e.stopPropagation()}>
          {occ && <OBadge occupancy={occ}/>}
          {isAdmin && <>
            <button onClick={() => setEditingProp({id:prop?.id, old:p, new:p})} style={{fontSize:11, padding:"3px 10px", borderRadius:6, border:"0.5px solid rgba(0,0,0,0.15)", background:"#f5f5f5", color:"#333", cursor:"pointer"}}>Editar</button>
            <button onClick={() => removeProperty(prop?.id, p)} style={{fontSize:11, padding:"3px 10px", borderRadius:6, border:"0.5px solid #F09595", background:"#FCEBEB", color:"#A32D2D", cursor:"pointer"}}>Borrar</button>
          </>}
        </div>
      </div>
      <div className="prop-badges">
        {t.filter(x => x.status === "Open").length > 0 && <SBadge status="Open"/>}
        {t.filter(x => x.status === "In Progress").length > 0 && <SBadge status="In Progress"/>}
        {t.filter(x => x.status === "Needs Approval").length > 0 && <SBadge status="Needs Approval"/>}
        {t.filter(x => x.status === "Approved").length > 0 && <SBadge status="Approved"/>}
        {t.filter(x => x.status === "Resolved").length > 0 && <SBadge status="Resolved"/>}
        {t.length === 0 && <span style={{fontSize:12, color:"#aaa"}}>Sin tareas aún</span>}
      </div>
      <div className="prop-footer" style={{color:clr.iconColor, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <span>{t.length} tarea{t.length !== 1 ? "s" : ""} — toca para ver</span>
        {t.length > 0 && <span style={{display:"flex", gap:8}}>
          {[["High","#A32D2D"], ["Medium","#854F0B"], ["Low","#3B6D11"]].map(([k, c]) => {
            const n = t.filter(x => x.priority === k).length;
            return n > 0 ? <span key={k} style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:6, height:6, borderRadius:"50%", background:c}}/><span style={{fontSize:10, fontWeight:600, color:c}}>{n}</span></span> : null;
          })}
        </span>}
      </div>
    </div>
  </div>;
}
