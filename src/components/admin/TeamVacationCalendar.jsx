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
    peopleToday.forEach(p => { presentMap[p.userId] = p; });
    Object.keys(open).forEach(uid => {
      if (!presentMap[uid]) { segments.push(open[uid]); delete open[uid]; }
    });
    Object.values(presentMap).forEach(p => {
      if (open[p.userId]) { open[p.userId].endCol = col; open[p.userId].endDate = key; }
      else { open[p.userId] = {userId:p.userId, name:p.name, role:p.role, status:p.status, startCol:col, endCol:col, startDate:key, endDate:key}; }
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

export function TeamVacationCalendar({users, ptoRequests}) {
  const [vm, setVm] = useState(() => { const d = new Date(); return {y:d.getFullYear(), m:d.getMonth()}; });
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
  ptoRequests.forEach(r => {
    if (!["approved","pending_supervisor","pending_admin"].includes(r.status)) return;
    (r.selectedDays||[]).forEach(d => {
      (dayMap[d] = dayMap[d] || []).push({userId:r.userId, name:r.userName, role:r.userRole, status:r.status});
    });
  });

  const weeks = [];
  for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));
  const weekKeys = weeks.map(week => week.map(d => d ? `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : null));

  const monthPrefix = `${y}-${String(m+1).padStart(2,"0")}-`;
  const rolesInView = [...new Set(Object.entries(dayMap).filter(([k]) => k.startsWith(monthPrefix)).flatMap(([,v]) => v).map(p => p.role))];

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
            const meta=ROLE_META[seg.role]||{bg:"#888"};
            return <div key={si} onClick={()=>setSelectedBlock(seg)}
              style={{gridColumn:`${seg.startCol+1} / ${seg.endCol+2}`, gridRow:seg.lane+1,
                background:meta.bg, opacity:seg.status==="approved"?1:0.55, color:"#fff",
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
      {rolesInView.length>0&&<div style={{display:"flex",alignItems:"center",gap:4,opacity:0.55}}><div style={{width:9,height:9,borderRadius:3,background:"#888"}}/> Pendiente (más claro)</div>}
    </div>
    {selectedBlock&&<BlockDetailModal block={selectedBlock} onClose={()=>setSelectedBlock(null)}/>}
  </div>;
}
