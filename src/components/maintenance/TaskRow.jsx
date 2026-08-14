import { PBadge, SBadge, AutoCleaningBadge } from "../shared/Badges";

export function TaskRow({t, canViewSensitive, setSelTask}) {
  const vc = canViewSensitive ? (t.comments || []).length : (t.comments || []).filter(c => c.type !== "approval").length;
  return <div className="task-item" onClick={() => setSelTask(t)}>
    <div className="task-title">{t.title}</div>
    <div className="task-prop">{t.property} · {t.created || ""}</div>
    <div className="task-badges">
      <PBadge priority={t.priority}/><SBadge status={t.status}/>
      {t.source === "cleaning" && <AutoCleaningBadge/>}
      {t.assignee && <span style={{fontSize:11, color:"#888"}}>{t.assignee}</span>}
      {vc > 0 && <span style={{fontSize:10, color:"#888"}}>💬 {vc}</span>}
    </div>
  </div>;
}
