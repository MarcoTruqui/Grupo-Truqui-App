import { useState } from "react";
import { ROLE_META } from "../../lib/constants";
import { BlockDetailModal } from "./BlockDetailModal";

function buildWeekSegments(weekKeyRow, dayMap) {
  const open = {};
  const segments = [];
  for (let col = 0; col < 7; col++) {
    const key = weekKeyRow[col];
    const peopleToday = key ? (dayMap[key] || []) : [];
    const presentMap = {};
    peopleToday.forEach(p => { presentMap[p.key] = p; });
    Object.keys(open).forEach(k => {
      if (!presentMap[k]) { segments.push(open[k]); delete open[k]; }
    });
    Object.values(presentMap).forEach(p => {
      if (open[p.key]) { open[p.key].endCol = col; open[p.key].endDate = key; }
      else { open[p.key] = {userId:p.userId, name:p.name, role:p.role, status:p.status, color:p.color, sourceLabel:p.sourceLabel, startCol:col, endCol:col, startDate:key, endDate:key}; }
    });
  }
  Object.values(open).forEach(seg => segments.push(seg));

  const sorted = [...segments].sort((a,b) => a.startCol - b.startCol);
  const laneEnds = [];
  sorted.forEach(seg => {
    let lane = laneEnds.findIndex(end => end < seg.startCol);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(seg.endCol); }
    else { laneEnds[lane] = seg.endCol; }
    seg.lane = lane;
  });
  return sorted;
}

/* Vacation days are colored per-role (via ROLE_META). Comp-work-derived days (days taken off
   using earned comp time, and days actually worked extra) use a fixed color per source instead,
   so they read as their own category regardless of whose bar it is — same Gantt-bar format,
   just a different, consistent color. Segments are keyed by source+user so a person's vacation
   bar never merges with their comp-day bar even in the same week. */
/* Deliberately outside ROLE_META's palette (admin/supervisor/maintenance/cleaning/office/
   construction/purchasing) so a comp-day bar never happens to render in the exact same
   color as some role's vacation bar — e.g. maintenance's role color is #BA7517, which
   would have been indistinguishable from a fixed amber comp-day color. */
export const COMP_REQ_COLOR = "#C2185B";
const COMP_WORK_COLOR = "#1E3A8A";

/* Month is controlled by the parent (not owned here) so a parent that also shows something
   else tied to "the currently viewed month" — like a payroll summary — can stay in sync
   with whatever month the calendar is scrolled to, instead of tracking it twice. */
export function TeamVacationCalendar({users, ptoRequests=[], compRequests=[], compWork=[], vm, setVm}) {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const {y, m} = vm;
  const firstDow = new Date(y,m,1).getDay();
  const dim = new Date(y,m+1,0).getDate();
  const offset = firstDow===0?6:firstDow-1;
  const cells = [...Array(offset).fill(null), ...Array.from({length:dim},(_,i)=>i+1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const mn = new Date(y,m,1).toLocaleDateString("es-MX",{month:"long",year:"numeric"});
  function prev(){if(m===0)setVm({y:y-1,m:11});else setVm({y,m:m-1});}
  function next(){if(m===11)setVm({y:y+1,m:0});else setVm({y,m:m+1});}

  const dayMap = {};
  function pushEntry(d, entry) { (dayMap[d] = dayMap[d] || []).push(entry); }
  const ELIGIBLE = ["approved","pending_supervisor","pending_admin"];

  ptoRequests.forEach(r => {
    if (!ELIGIBLE.includes(r.status)) return;
    (r.selectedDays||[]).forEach(d => pushEntry(d, {
      key:`pto_${r.userId}`, userId:r.userId, name:r.userName, role:r.userRole, status:r.status,
      color:(ROLE_META[r.userRole]||{}).bg||"#888", sourceLabel:"Vacación"
    }));
  });
  compRequests.forEach(r => {
    if (!ELIGIBLE.includes(r.status)) return;
    (r.selectedDays||[]).forEach(d => pushEntry(d, {
      key:`compreq_${r.userId}`, userId:r.userId, name:r.userName, role:r.userRole, status:r.status,
      color:COMP_REQ_COLOR, sourceLabel:"Día compensatorio"
    }));
  });
  compWork.forEach(r => {
    if (!ELIGIBLE.includes(r.status) || !r.workDate) return;
    pushEntry(r.workDate, {
      key:`compwork_${r.userId}`, userId:r.userId, name:r.userName, role:r.userRole, status:r.status,
      color:COMP_WORK_COLOR, sourceLabel:"Día extra trabajado"
    });
  });

  const weeks = [];
  for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));
  const weekKeys = weeks.map(week => week.map(d => d ? `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : null));

  const monthPrefix = `${y}-${String(m+1).padStart(2,"0")}-`;
  const monthEntries = Object.entries(dayMap).filter(([k]) => k.startsWith(monthPrefix)).flatMap(([,v]) => v);
  const rolesInView = [...new Set(monthEntries.filter(p => p.sourceLabel==="Vacación").map(p => p.role))];
  const extraSourcesInView = [...new Map(monthEntries.filter(p => p.sourceLabel!=="Vacación").map(p => [p.sourceLabel, p.color])).entries()];

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <button onClick={prev} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#534AB7",padding:"0 12px",lineHeight:1}}>‹</button>
      <div style={{fontSize:15,fontWeight:700,textTransform:"capitalize"}}>{mn}</div>
      <button onClick={next} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#534AB7",padding:"0 12px",lineHeight:1}}>›</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
      {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:600,color:i===6?"#ddd":"#888",padding:"4px 0"}}>{d}</div>)}
    </div>
    {weeks.map((week, wi) => {
      const segments = buildWeekSegments(weekKeys[wi], dayMap);
      const laneCount = segments.length ? Math.max(...segments.map(s=>s.lane))+1 : 0;
      return <div key={wi} style={{marginBottom:6}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {week.map((d,ci)=><div key={ci} style={{textAlign:"center",fontSize:11,color:"#aaa",padding:"3px 0"}}>{d||""}</div>)}
        </div>
        {laneCount>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gridAutoRows:20,gap:"2px 3px"}}>
          {segments.map((seg,si)=>{
            return <div key={si} onClick={()=>setSelectedBlock(seg)}
              style={{gridColumn:`${seg.startCol+1} / ${seg.endCol+2}`, gridRow:seg.lane+1,
                background:seg.color, opacity:seg.status==="approved"?1:0.55, color:"#fff",
                borderRadius:5, fontSize:10, fontWeight:600, padding:"0 6px",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                cursor:"pointer", display:"flex", alignItems:"center"}}>
              {seg.name}
            </div>;
          })}
        </div>}
      </div>;
    })}
    <div style={{display:"flex",gap:12,marginTop:10,fontSize:10,color:"#888",flexWrap:"wrap"}}>
      {rolesInView.map(role=>{
        const meta=ROLE_META[role]||{label:role,bg:"#888"};
        return <div key={role} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:3,background:meta.bg}}/> {meta.label}</div>;
      })}
      {extraSourcesInView.map(([label,color])=>
        <div key={label} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:3,background:color}}/> {label}</div>
      )}
      {monthEntries.length>0&&<div style={{display:"flex",alignItems:"center",gap:4,opacity:0.55}}><div style={{width:9,height:9,borderRadius:3,background:"#888"}}/> Pendiente (más claro)</div>}
    </div>
    {selectedBlock&&<BlockDetailModal block={selectedBlock} onClose={()=>setSelectedBlock(null)}/>}
  </div>;
}
