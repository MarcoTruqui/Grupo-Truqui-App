import { useState } from "react";
import { ROLE_META } from "../../lib/constants";
import { auth } from "../../lib/firebase";
import { Av } from "../shared/Avatar";
import { RBadge } from "../shared/Badges";
import { VacationSection } from "./VacationSection";
import { AdminEmployeesSection } from "./AdminEmployeesSection";
import { CompWorkSection } from "./CompWorkSection";

export function AdminPortal({currentUser,role,users,ptoRequests,compWork,compRequests,db,onSwitch,onMarkSeen,allPropNames,propColorMap,updateUser,removeUser}) {
  const [page,setPage] = useState(null);
  const pendingPTO = role==="supervisor"
    ? ptoRequests.filter(r=>["maintenance","cleaning"].includes(r.userRole)&&r.status==="pending_supervisor").length
    : ptoRequests.filter(r=>["pending_supervisor","pending_admin"].includes(r.status)).length;
  const pendingComp = role==="supervisor"
    ? [...compWork,...compRequests].filter(r=>["maintenance","cleaning"].includes(r.userRole)&&r.status==="pending_supervisor").length
    : [...compWork,...compRequests].filter(r=>["pending_supervisor","pending_admin"].includes(r.status)).length;
  if(page==="vacation") return <VacationSection currentUser={currentUser} role={role} users={users} ptoRequests={ptoRequests} db={db} onBack={()=>setPage(null)} onSwitch={onSwitch} onMarkSeen={onMarkSeen}/>;
  if(page==="employees") return <AdminEmployeesSection users={users} ptoRequests={ptoRequests} compWork={compWork} compRequests={compRequests} allPropNames={allPropNames} propColorMap={propColorMap} updateUser={updateUser} removeUser={removeUser} onBack={()=>setPage(null)} onSwitch={onSwitch}/>;
  if(page==="compwork") return <CompWorkSection currentUser={currentUser} role={role} users={users} compWork={compWork} compRequests={compRequests} db={db} onBack={()=>setPage(null)} onSwitch={onSwitch} allPropNames={allPropNames}/>;
  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:"#f5f5f7"}}>
    <div style={{background:"#fff",padding:"16px 16px 14px",paddingTop:"calc(16px + env(safe-area-inset-top))",borderBottom:"0.5px solid rgba(0,0,0,0.08)",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:"#1D9E75",letterSpacing:"-0.02em"}}>Grupo Truqui Admin</div>
          <div style={{fontSize:12,color:"#888",marginTop:1}}>Hola, {currentUser.name.split(" ")[0]}</div>
        </div>
        {onSwitch&&<button onClick={onSwitch} style={{fontSize:11,padding:"6px 14px",borderRadius:8,border:"0.5px solid rgba(0,0,0,0.12)",background:"#f5f5f5",color:"#555",cursor:"pointer",fontWeight:500}}>⊞ Portales</button>}
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"20px 14px",WebkitOverflowScrolling:"touch"}}>
      <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:14}}>Módulos</div>
      <div onClick={()=>setPage("vacation")} style={{background:"#fff",borderRadius:16,padding:20,marginBottom:12,border:"0.5px solid rgba(0,0,0,0.07)",cursor:"pointer",display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:52,height:52,borderRadius:14,background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🏖️</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#1a1a1a"}}>Solicitudes de Vacaciones</div>
          <div style={{fontSize:12,color:"#888",marginTop:3}}>Solicita o gestiona tiempo libre</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {pendingPTO>0&&<span style={{background:"#534AB7",color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{pendingPTO}</span>}
          <span style={{color:"#1D9E75",fontSize:22,fontWeight:300}}>›</span>
        </div>
      </div>
      <div onClick={()=>setPage("compwork")} style={{background:"#fff",borderRadius:16,padding:20,marginBottom:12,border:"0.5px solid rgba(0,0,0,0.07)",cursor:"pointer",display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:52,height:52,borderRadius:14,background:"#FAEEDA",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🗓️</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#1a1a1a"}}>Días Extra / Festivos</div>
          <div style={{fontSize:12,color:"#888",marginTop:3}}>Domingos y festivos trabajados</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {pendingComp>0&&<span style={{background:"#BA7517",color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{pendingComp}</span>}
          <span style={{color:"#1D9E75",fontSize:22,fontWeight:300}}>›</span>
        </div>
      </div>
      {role==="admin"&&<div onClick={()=>setPage("employees")} style={{background:"#fff",borderRadius:16,padding:20,marginBottom:12,border:"0.5px solid rgba(0,0,0,0.07)",cursor:"pointer",display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:52,height:52,borderRadius:14,background:"#EEEDFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>👥</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#1a1a1a"}}>Empleados</div>
          <div style={{fontSize:12,color:"#888",marginTop:3}}>Roles, propiedades y días de vacaciones</div>
        </div>
        <div style={{marginLeft:"auto"}}>
          <span style={{color:"#1D9E75",fontSize:22,fontWeight:300}}>›</span>
        </div>
      </div>}
      <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:4,border:"0.5px solid rgba(0,0,0,0.07)",display:"flex",alignItems:"center",gap:14}}>
          <Av name={currentUser.name} size={48} bg={ROLE_META[currentUser.role]?.bg||"#888"}/>
          <div>
            <div style={{fontSize:16,fontWeight:600}}>{currentUser.name}</div>
            <div style={{fontSize:12,color:"#888",fontFamily:"monospace"}}>@{currentUser.username}</div>
            <div style={{marginTop:4}}><RBadge role={currentUser.role}/></div>
          </div>
        </div>
        <button className="btn-red" onClick={()=>auth.signOut()}>Cerrar sesión</button>
      </div>
    </div>
  </div>;
}
