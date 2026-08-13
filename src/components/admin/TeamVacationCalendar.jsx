import { useState } from "react";
import { ROLE_META } from "../../lib/constants";
import { DayVacationModal } from "./DayVacationModal";

export function TeamVacationCalendar({users, ptoRequests}) {
  const [vm, setVm] = useState(() => { const d = new Date(); return {y:d.getFullYear(), m:d.getMonth()}; });
  const [selectedDay, setSelectedDay] = useState(null);
  const {y, m} = vm;
  const firstDow = new Date(y,m,1).getDay();
  const dim = new Date(y,m+1,0).getDate();
  const offset = firstDow===0?6:firstDow-1;
  const cells = [...Array(offset).fill(null), ...Array.from({length:dim},(_,i)=>i+1)];
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

  const monthPrefix = `${y}-${String(m+1).padStart(2,"0")}-`;
  const rolesInView = [...new Set(Object.entries(dayMap).filter(([k]) => k.startsWith(monthPrefix)).flatMap(([,v]) => v).map(p => p.role))];

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <button onClick={prev} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#534AB7",padding:"0 12px",lineHeight:1}}>‹</button>
      <div style={{fontSize:15,fontWeight:700,textTransform:"capitalize"}}>{mn}</div>
      <button onClick={next} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#534AB7",padding:"0 12px",lineHeight:1}}>›</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
      {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:600,color:i===6?"#ddd":"#888",padding:"4px 0"}}>{d}</div>)}
      {cells.map((d,i)=>{
        if(!d) return <div key={"_"+i}/>;
        const key=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const people = dayMap[key]||[];
        return <div key={key} onClick={()=>people.length&&setSelectedDay(key)}
          style={{minHeight:52,padding:"4px 3px",borderRadius:7,background:people.length?"#fafafa":"transparent",border:people.length?"1px solid #eee":"none",cursor:people.length?"pointer":"default"}}>
          <div style={{fontSize:11,color:"#888",marginBottom:3,textAlign:"center"}}>{d}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center"}}>
            {people.map((p,idx)=>{
              const meta=ROLE_META[p.role]||{bg:"#888"};
              const initials=(p.name||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
              return <span key={idx} title={p.name} style={{fontSize:8,fontWeight:700,color:"#fff",background:meta.bg,borderRadius:4,padding:"1px 3px",opacity:p.status==="approved"?1:0.55,lineHeight:1.4}}>{initials}</span>;
            })}
          </div>
        </div>;
      })}
    </div>
    <div style={{display:"flex",gap:12,marginTop:14,fontSize:10,color:"#888",flexWrap:"wrap"}}>
      {rolesInView.map(role=>{
        const meta=ROLE_META[role]||{label:role,bg:"#888"};
        return <div key={role} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:3,background:meta.bg}}/> {meta.label}</div>;
      })}
      {rolesInView.length>0&&<div style={{display:"flex",alignItems:"center",gap:4,opacity:0.55}}><div style={{width:9,height:9,borderRadius:3,background:"#888"}}/> Pendiente (más claro)</div>}
    </div>
    {selectedDay&&<DayVacationModal date={selectedDay} people={dayMap[selectedDay]||[]} onClose={()=>setSelectedDay(null)}/>}
  </div>;
}
