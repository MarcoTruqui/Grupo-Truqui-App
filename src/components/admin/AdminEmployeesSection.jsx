import { useState } from "react";
import { ROLE_META } from "../../lib/constants";
import { getPTOBalance } from "../../lib/firestoreHelpers";
import { Av } from "../shared/Avatar";
import { RBadge } from "../shared/Badges";
import { EditSheet } from "./EditSheet";
import { EmployeeDetailSheet } from "./EmployeeDetailSheet";
import { AddEmployeeSheet } from "./AddEmployeeSheet";

function EmployeeCard({u,users,ptoRequests,canEdit,setEditing,setViewingId}) {
  const bal=u.role!=="admin"?getPTOBalance(u.id,users,ptoRequests):null;
  const hireDate=u.hireDate||"2020-01-01";
  const hireMs=new Date(hireDate+"T12:00:00").getTime();
  const yearsIn=Math.floor((Date.now()-hireMs)/(365.25*24*60*60*1000));
  const hireFmt=new Date(hireDate+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
  return <div style={{background:"#fff",borderRadius:14,padding:14,marginBottom:10,border:"0.5px solid rgba(0,0,0,0.07)"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
      <Av name={u.name} size={42} bg={ROLE_META[u.role]?.bg||"#888"}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:700}}>{u.name}</div>
        <div style={{fontSize:11,color:"#888",fontFamily:"monospace"}}>@{u.username}</div>
        <div style={{marginTop:4}}><RBadge role={u.role}/></div>
      </div>
      {canEdit&&<button onClick={e=>{e.stopPropagation();setEditing({...u});}} style={{padding:"7px 14px",borderRadius:8,border:"0.5px solid rgba(0,0,0,0.15)",background:"#f5f5f5",color:"#333",fontSize:12,cursor:"pointer",fontWeight:500}}>Editar</button>}
    </div>
    <div onClick={()=>setViewingId(u.id)} style={{cursor:"pointer"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:10,borderTop:"1px solid #f0f0f0",marginBottom:bal?10:0}}>
      <div style={{flex:1}}>
        <div style={{fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Fecha de ingreso</div>
        <div style={{fontSize:13,fontWeight:600,color:"#333"}}>{hireFmt}</div>
      </div>
      <div style={{textAlign:"center",background:"#EEEDFE",borderRadius:10,padding:"8px 14px",minWidth:72}}>
        <div style={{fontSize:20,fontWeight:700,color:"#534AB7"}}>{yearsIn}</div>
        <div style={{fontSize:9,color:"#534AB7",marginTop:1}}>{yearsIn===1?"año":"años"} en Grupo Truqui</div>
      </div>
    </div>
    {bal&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,textAlign:"center",paddingTop:10,borderTop:"1px solid #f0f0f0"}}>
      {[["Anuales",bal.annual,"#534AB7"],["Usados",bal.used,"#1D9E75"],["Pendientes",bal.pending,"#BA7517"],["Disponibles",bal.available,bal.available<=0?"#A32D2D":"#1D9E75"]].map(([l,v,c])=>
        <div key={l}><div style={{fontSize:17,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:"#aaa",marginTop:2}}>{l}</div></div>
      )}
    </div>}
    <div style={{fontSize:10,color:"#aaa",textAlign:"center",marginTop:8}}>Toca para ver detalle completo ›</div>
    </div>
  </div>;
}

export function AdminEmployeesSection({role,users,ptoRequests,compWork,compRequests,allPropNames,propColorMap,updateUser,removeUser,addUser,onBack,onSwitch}) {
  const canEdit = role==="admin";
  const [editing,setEditing] = useState(null);
  const [viewingId,setViewingId] = useState(null);
  const [adding,setAdding] = useState(false);
  const [collapsedRoles,setCollapsedRoles] = useState({});

  const grouped = {};
  users.forEach(u=>{ (grouped[u.role]=grouped[u.role]||[]).push(u); });
  const roleGroups = Object.keys(ROLE_META).filter(r=>grouped[r]&&grouped[r].length);

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:"#f5f5f7"}}>
    <div style={{background:"#fff",padding:"14px 16px 12px",paddingTop:"calc(14px + env(safe-area-inset-top))",borderBottom:"0.5px solid rgba(0,0,0,0.08)",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#1D9E75",fontSize:13,padding:"0"}}>‹ Atrás</button>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:18,fontWeight:700,color:"#1a1a1a"}}>👥 Empleados</div>
        <div style={{display:"flex",gap:6}}>
          {canEdit&&<button onClick={()=>setAdding(true)} style={{fontSize:11,padding:"6px 12px",borderRadius:8,border:"none",background:"#534AB7",color:"#fff",cursor:"pointer",fontWeight:600}}>+ Agregar</button>}
          {onSwitch&&<button onClick={onSwitch} style={{fontSize:11,padding:"6px 12px",borderRadius:8,border:"0.5px solid rgba(0,0,0,0.12)",background:"#f5f5f5",color:"#555",cursor:"pointer"}}>⊞ Portales</button>}
        </div>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"16px 14px 32px",WebkitOverflowScrolling:"touch"}}>
      {roleGroups.map(r=>{
        const isOpen = !collapsedRoles[r];
        const meta = ROLE_META[r];
        return <div key={r} style={{marginBottom:14}}>
          <div onClick={()=>setCollapsedRoles(c=>({...c,[r]:!c[r]}))} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",padding:"10px 4px",borderBottom:isOpen?"1px solid #eee":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:meta.bg,flexShrink:0}}/>
              <span style={{fontSize:14,fontWeight:700,color:"#333"}}>{meta.label} <span style={{fontSize:11,color:"#aaa",fontWeight:400}}>({grouped[r].length})</span></span>
            </div>
            <span style={{fontSize:16,color:"#534AB7",display:"inline-block",transition:"transform 0.15s",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>›</span>
          </div>
          {isOpen&&<div style={{marginTop:10}}>
            {grouped[r].map(u=><EmployeeCard key={u.id} u={u} users={users} ptoRequests={ptoRequests} canEdit={canEdit} setEditing={setEditing} setViewingId={setViewingId}/>)}
          </div>}
        </div>;
      })}
    </div>
    {canEdit && <EditSheet editing={editing} setEditing={setEditing} allPropNames={allPropNames} propColorMap={propColorMap} updateUser={updateUser}/>}
    {viewingId && <EmployeeDetailSheet role={role} viewingId={viewingId} setViewingId={setViewingId} setEditing={setEditing} users={users} ptoRequests={ptoRequests} compWork={compWork} compRequests={compRequests}/>}
    {canEdit && adding && <AddEmployeeSheet allPropNames={allPropNames} propColorMap={propColorMap} addUser={addUser} onClose={()=>setAdding(false)}/>}
  </div>;
}
