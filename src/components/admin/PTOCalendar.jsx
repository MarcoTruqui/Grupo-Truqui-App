import { useState } from "react";

export function PTOCalendar({selected, onToggle, usedDays=[], pendingDays=[]}) {
  const [vm, setVm] = useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const {y,m} = vm;
  const today = new Date(); today.setHours(0,0,0,0);
  const firstDow = new Date(y,m,1).getDay();
  const dim = new Date(y,m+1,0).getDate();
  const offset = firstDow===0?6:firstDow-1;
  const cells = [...Array(offset).fill(null),...Array.from({length:dim},(_,i)=>i+1)];
  const mn = new Date(y,m,1).toLocaleDateString("es-MX",{month:"long",year:"numeric"});
  function prev(){if(m===0)setVm({y:y-1,m:11});else setVm({y,m:m-1});}
  function next(){if(m===11)setVm({y:y+1,m:0});else setVm({y,m:m+1});}
  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <button onClick={prev} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#534AB7",padding:"0 12px",lineHeight:1}}>‹</button>
      <div style={{fontSize:13,fontWeight:700,textTransform:"capitalize"}}>{mn}</div>
      <button onClick={next} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"#534AB7",padding:"0 12px",lineHeight:1}}>›</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
      {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:600,color:i===6?"#ddd":"#888",padding:"4px 0"}}>{d}</div>)}
      {cells.map((d,i)=>{
        if(!d) return <div key={"_"+i}/>;
        const dt=new Date(y,m,d);
        const isSun=dt.getDay()===0;
        const isPast=dt<today;
        const key=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const isSel=selected.includes(key);
        const isUsed=usedDays.includes(key);
        const isPend=pendingDays.includes(key);
        const off=isSun||isPast||isUsed||isPend;
        let bg="transparent",clr="#1a1a1a",cur="pointer";
        if(isSel){bg="#534AB7";clr="#fff";}
        else if(isUsed){bg="#EAF3DE";clr="#3B6D11";cur="default";}
        else if(isPend){bg="#FAEEDA";clr="#854F0B";cur="default";}
        else if(off){clr="#ccc";cur="default";}
        return <div key={key} onClick={()=>!off&&onToggle(key)}
          style={{textAlign:"center",padding:"8px 1px",borderRadius:7,fontSize:13,fontWeight:isSel?700:400,background:bg,color:clr,cursor:cur,WebkitUserSelect:"none",userSelect:"none"}}>
          {d}
        </div>;
      })}
    </div>
    <div style={{display:"flex",gap:14,marginTop:10,fontSize:10,color:"#888",flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:2,background:"#534AB7"}}/> Seleccionado</div>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:2,background:"#EAF3DE",border:"1px solid #C0DD97"}}/> Aprobado</div>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:2,background:"#FAEEDA",border:"1px solid #E8C98A"}}/> Pendiente</div>
    </div>
  </div>;
}
