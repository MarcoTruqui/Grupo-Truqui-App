import { ROLE_META } from "../../lib/constants";
import { getPTOBalance, getCompBalance, getCurrentAnniversaryYear } from "../../lib/firestoreHelpers";
import { Av } from "../shared/Avatar";
import { RBadge } from "../shared/Badges";
import { PTOStatusBadge } from "./PTOStatusBadge";

export function EmployeeDetailSheet({viewingId,setViewingId,setEditing,users,ptoRequests,compWork,compRequests}) {
  const u=users.find(x=>x.id===viewingId);
  if(!u) return null;
  const bal=u.role!=="admin"?getPTOBalance(u.id,users,ptoRequests):null;
  const comp=u.role!=="admin"?getCompBalance(u.id,compWork,compRequests,users):null;
  const hireDate=u.hireDate||"2020-01-01";
  const yearsIn=getCurrentAnniversaryYear(hireDate);
  const hireFmt=new Date(hireDate+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
  const myWork=compWork.filter(r=>r.userId===u.id).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
  const myPTO=ptoRequests.filter(r=>r.userId===u.id).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
  const fmtD=iso=>iso?new Date(iso+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"}):"";
  return <div className="modal-overlay" onClick={()=>setViewingId(null)}>
    <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <Av name={u.name} size={48} bg={ROLE_META[u.role]?.bg||"#888"}/>
          <div>
            <div style={{fontSize:17,fontWeight:700}}>{u.name}</div>
            <div style={{fontSize:12,color:"#888",fontFamily:"monospace"}}>@{u.username}</div>
            <div style={{marginTop:4}}><RBadge role={u.role}/></div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <div style={{flex:1,background:"#f5f5f7",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Ingreso</div>
            <div style={{fontSize:12,fontWeight:600,color:"#333"}}>{hireFmt}</div>
          </div>
          <div style={{background:"#EEEDFE",borderRadius:10,padding:"10px 14px",textAlign:"center",minWidth:72}}>
            <div style={{fontSize:22,fontWeight:700,color:"#534AB7"}}>{yearsIn}</div>
            <div style={{fontSize:9,color:"#534AB7"}}>{yearsIn===1?"año":"años"}</div>
          </div>
        </div>
        {bal&&<>
          <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>🏖️ Vacaciones</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:16}}>
            {[["Días anuales",bal.annual,"#534AB7"],["Usados",bal.used,"#A32D2D"],["Pendientes",bal.pending,"#BA7517"],["Disponibles",bal.available,bal.available<=0?"#A32D2D":"#1D9E75"]].map(([l,v,c])=>
              <div key={l} style={{background:"#fff",border:"0.5px solid rgba(0,0,0,0.07)",borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:24,fontWeight:700,color:c}}>{v}</div>
                <div style={{fontSize:10,color:"#aaa",marginTop:3}}>{l}</div>
              </div>
            )}
          </div>
          {(bal.borrowed||0)>0&&<div style={{background:"#E1F5EE",borderRadius:10,padding:"8px 12px",marginBottom:16,fontSize:12,color:"#0F6E56"}}>
            ＋{bal.borrowed} días prestados del próximo año incluidos en disponibles
          </div>}
        </>}
        {comp&&<>
          <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>📋 Días Extra / Festivos</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
            {[["Ganados",comp.earned,"#BA7517"],["Usados",comp.used,"#A32D2D"],["Disponibles",comp.available,comp.available<=0?"#A32D2D":"#1D9E75"]].map(([l,v,c])=>
              <div key={l} style={{background:"#fff",border:"0.5px solid rgba(0,0,0,0.07)",borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:24,fontWeight:700,color:c}}>{v}</div>
                <div style={{fontSize:10,color:"#aaa",marginTop:3}}>{l}</div>
              </div>
            )}
          </div>
          {myWork.length>0&&<>
            <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Historial domingos/festivos</div>
            {myWork.map(r=>{
              const typeLabel=r.type==="holiday"?"Festivo":"Domingo";
              const typeBg=r.type==="holiday"?"#FAEEDA":"#EEEDFE";
              const typeColor=r.type==="holiday"?"#854F0B":"#534AB7";
              return <div key={r.id} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"0.5px solid rgba(0,0,0,0.07)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:typeBg,color:typeColor}}>{typeLabel}</span>
                  <span style={{fontSize:11,color:"#888"}}>{fmtD(r.workDate)}</span>
                </div>
                {r.property&&<div style={{fontSize:11,color:"#534AB7",fontWeight:600,marginBottom:3}}>🏠 {r.property}</div>}
                {r.status==="approved"&&<div style={{fontSize:11,color:"#1D9E75",fontWeight:600}}>✓ {r.daysGranted} día{r.daysGranted!==1?"s":""} otorgado{r.daysGranted!==1?"s":""}</div>}
                {r.status!=="approved"&&<div style={{fontSize:11,color:"#888"}}>{r.status==="pending_supervisor"?"Pendiente supervisor":r.status==="pending_admin"?"Pendiente admin":"Denegado"}</div>}
              </div>;
            })}
          </>}
        </>}
        {myPTO.length>0&&<>
          <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,marginTop:8}}>Historial solicitudes PTO</div>
          {myPTO.slice(0,5).map(r=><div key={r.id} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"0.5px solid rgba(0,0,0,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#333"}}>{(r.selectedDays||[]).length} día{(r.selectedDays||[]).length!==1?"s":""}</div>
              <PTOStatusBadge status={r.status}/>
            </div>
            {r.selectedDays&&r.selectedDays.length>0&&<div style={{fontSize:11,color:"#888",marginTop:3}}>{fmtD(r.selectedDays[0])}{r.selectedDays.length>1?" → "+fmtD(r.selectedDays[r.selectedDays.length-1]):""}</div>}
          </div>)}
        </>}
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={()=>setViewingId(null)}>Cerrar</button>
          <button className="btn-primary" onClick={()=>{setEditing({...u});setViewingId(null);}}>Editar empleado</button>
        </div>
      </div>
    </div>
  </div>;
}
