import { useState, useEffect } from "react";
import { ROLE_META } from "../../lib/constants";
import { getPTOBalance, countPTODays, submitPTO, supervisorDecide, adminDecide } from "../../lib/firestoreHelpers";
import { Av } from "../shared/Avatar";
import { RBadge } from "../shared/Badges";
import { RequestCard } from "./RequestCard";
import { PTOCalendar } from "./PTOCalendar";

export function VacationSection({currentUser,role,users,ptoRequests,db,onBack,onSwitch,onMarkSeen}) {
  useEffect(()=>{ if(onMarkSeen) onMarkSeen(); },[]);
  const [selDays,setSelDays] = useState([]);
  const [reason,setReason] = useState("");
  const [submitting,setSubmitting] = useState(false);
  const [submitted,setSubmitted] = useState(false);
  const [reviewId,setReviewId] = useState(null);
  const [reviewComment,setReviewComment] = useState("");
  const [adminRevId,setAdminRevId] = useState(null);
  const [adminRevComment,setAdminRevComment] = useState("");
  const [staffTab,setStaffTab] = useState("pending");
  const [cancelId,setCancelId] = useState(null);

  const isAdminRole=role==="admin";
  const isSupervisorRole=role==="supervisor";
  const myBal=!isAdminRole?getPTOBalance(currentUser.id,users,ptoRequests):null;
  const myUsed=ptoRequests.filter(r=>r.userId===currentUser.id&&r.status==="approved").flatMap(r=>r.selectedDays||[]);
  const myPending=ptoRequests.filter(r=>r.userId===currentUser.id&&["pending_supervisor","pending_admin"].includes(r.status)).flatMap(r=>r.selectedDays||[]);
  const myRequests=ptoRequests.filter(r=>r.userId===currentUser.id).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
  const toReview=isSupervisorRole?ptoRequests.filter(r=>["maintenance","cleaning"].includes(r.userRole)&&r.status==="pending_supervisor").sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt)):[];
  const toAdminReview=isAdminRole?ptoRequests.filter(r=>["pending_supervisor","pending_admin"].includes(r.status)).sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt)):[];
  const allPTO=[...ptoRequests].sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
  const approvedPTO=isAdminRole?ptoRequests.filter(r=>r.status==="approved").sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt)):[];
  const deniedPTO=isAdminRole?ptoRequests.filter(r=>r.status==="declined").sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt)):[];
  const selCount=countPTODays(selDays);
  const over=myBal&&selCount>myBal.available;
  const projectedAvail=myBal?Math.max(0,myBal.available-selCount):0;

  function toggleDay(key){setSelDays(s=>s.includes(key)?s.filter(x=>x!==key):[...s,key]);}

  async function handleSubmit(){
    if(!selDays.length) return;
    setSubmitting(true);
    await submitPTO(currentUser,role,db,selDays,reason);
    setSelDays([]); setReason(""); setSubmitting(false); setSubmitted(true);
    setTimeout(()=>setSubmitted(false),3000);
  }

  function fmtDay(iso){
    if(!iso) return "";
    return new Date(iso+"T12:00:00").toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"});
  }

  const cardProps = {currentUser,db,fmtDay,reviewId,setReviewId,reviewComment,setReviewComment,adminRevId,setAdminRevId,adminRevComment,setAdminRevComment,cancelId,setCancelId};

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:"#f5f5f7"}}>
    <div style={{background:"#fff",padding:"14px 16px 12px",paddingTop:"calc(14px + env(safe-area-inset-top))",borderBottom:"0.5px solid rgba(0,0,0,0.08)",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#1D9E75",fontSize:13,padding:"0"}}>‹ Atrás</button>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:18,fontWeight:700,color:"#1a1a1a"}}>🏖️ Vacaciones</div>
        {onSwitch&&<button onClick={onSwitch} style={{fontSize:11,padding:"6px 12px",borderRadius:8,border:"0.5px solid rgba(0,0,0,0.12)",background:"#f5f5f5",color:"#555",cursor:"pointer"}}>⊞ Portales</button>}
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"16px 14px 32px",WebkitOverflowScrolling:"touch"}}>

      {!isAdminRole&&myBal&&<>
        <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"0.5px solid rgba(0,0,0,0.07)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12}}>Mi balance — {new Date().getFullYear()}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,textAlign:"center"}}>
            {[["Anuales",myBal.annual,"#534AB7"],["Usados",myBal.used,"#1D9E75"],["Pendientes",myBal.pending,"#BA7517"],["Disponibles",myBal.available,myBal.available===0?"#A32D2D":"#1D9E75"]].map(([l,v,c])=>
              <div key={l} style={{background:"#f8f8fa",borderRadius:10,padding:"10px 4px"}}><div style={{fontSize:19,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:"#888",marginTop:3}}>{l}</div></div>
            )}
          </div>
          {selCount>0&&<div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #f0f0f0"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,textAlign:"center"}}>
              <div style={{background:"#EEEDFE",borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:18,fontWeight:700,color:"#534AB7"}}>{selCount}</div>
                <div style={{fontSize:10,color:"#534AB7",marginTop:2}}>Días seleccionados</div>
              </div>
              <div style={{background:over?"#FCEBEB":"#EAF3DE",borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:18,fontWeight:700,color:over?"#A32D2D":"#1D9E75"}}>{projectedAvail}</div>
                <div style={{fontSize:10,color:over?"#A32D2D":"#1D9E75",marginTop:2}}>Quedarían disponibles</div>
              </div>
            </div>
            {over&&<div style={{marginTop:8,fontSize:11,color:"#A32D2D",textAlign:"center",fontWeight:500}}>⚠️ Supera tu saldo ({myBal.available} disponible{myBal.available!==1?"s":""})</div>}
          </div>}
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"0.5px solid rgba(0,0,0,0.07)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12}}>Selecciona los días</div>
          <PTOCalendar selected={selDays} onToggle={toggleDay} usedDays={myUsed} pendingDays={myPending}/>
        </div>
        {selCount>0&&<>
          <div className="field"><label>Motivo (opcional)</label><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="ej. Vacaciones familiares..." style={{minHeight:60}}/></div>
          {submitted&&<div style={{background:"#EAF3DE",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#3B6D11",textAlign:"center",fontWeight:600}}>✓ Solicitud enviada</div>}
          <div className="btn-row" style={{marginBottom:14}}>
            <button className="btn-secondary" onClick={()=>setSelDays([])}>Limpiar</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting||!selCount} style={{opacity:selCount?1:0.5}}>{submitting?"Enviando...":"Enviar solicitud"}</button>
          </div>
        </>}
        {myRequests.length>0&&<>
          <div className="section-label">Mis solicitudes</div>
          {myRequests.map(r=><RequestCard key={r.id} r={r} {...cardProps}/>)}
        </>}
      </>}

      {isSupervisorRole&&<>
        <div className="section-label" style={{marginTop:4}}>Solicitudes del personal</div>
        {toReview.length===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:20,background:"#fff",borderRadius:12,border:"0.5px solid rgba(0,0,0,0.07)",marginBottom:12}}>Sin solicitudes pendientes</div>}
        {toReview.map(r=><RequestCard key={r.id} r={r} {...cardProps}
          onSuperApprove={(c)=>supervisorDecide(currentUser,db,r.id,true,c)}
          onSuperDecline={(c)=>supervisorDecide(currentUser,db,r.id,false,c)}/>)}
        <div className="section-label" style={{marginTop:8}}>Totales del personal</div>
        {users.filter(u=>["maintenance","cleaning"].includes(u.role)).map(u=>{
          const b=getPTOBalance(u.id,users,ptoRequests);
          return <div key={u.id} style={{background:"#fff",borderRadius:12,padding:12,marginBottom:8,border:"0.5px solid rgba(0,0,0,0.07)",display:"flex",alignItems:"center",gap:12}}>
            <Av name={u.name} size={36} bg={ROLE_META[u.role]?.bg||"#888"}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{u.name}</div><div style={{fontSize:11,color:"#888"}}>{ROLE_META[u.role]?.label}</div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,textAlign:"center"}}>
              {[["Total",b.annual,"#534AB7"],["Usados",b.used,"#BA7517"],["Disp.",b.available,"#1D9E75"]].map(([l,v,c])=>
                <div key={l}><div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:"#aaa"}}>{l}</div></div>
              )}
            </div>
          </div>;
        })}
      </>}

      {isAdminRole&&<>
        <div className="tab-bar">
          {[["pending",`Por aprobar (${toAdminReview.length})`],["approved","Aprobadas"],["denied","Denegadas"],["all","Todas"]].map(([k,l])=>
            <button key={k} className={`tab-btn${staffTab===k?" active":""}`} onClick={()=>setStaffTab(k)}>{l}</button>
          )}
        </div>
        {staffTab==="pending"&&<>
          {toAdminReview.length===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:30}}>Sin solicitudes pendientes de aprobación</div>}
          {toAdminReview.map(r=><RequestCard key={r.id} r={r} {...cardProps}
            onAdminApprove={(c)=>adminDecide(currentUser,db,r.id,true,c)}
            onAdminDecline={(c)=>adminDecide(currentUser,db,r.id,false,c)}/>)}
        </>}
        {staffTab==="approved"&&<>
          {approvedPTO.length===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:30}}>Sin solicitudes aprobadas aún</div>}
          {approvedPTO.map(r=><RequestCard key={r.id} r={r} {...cardProps}/>)}
        </>}
        {staffTab==="denied"&&<>
          {deniedPTO.length===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:30}}>Sin solicitudes denegadas</div>}
          {deniedPTO.map(r=><RequestCard key={r.id} r={r} {...cardProps}/>)}
        </>}
        {staffTab==="all"&&<>
          {allPTO.length===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:30}}>Sin solicitudes aún</div>}
          {allPTO.map(r=><RequestCard key={r.id} r={r} {...cardProps}/>)}
        </>}
        <div className="section-label" style={{marginTop:8}}>Totales de todo el personal</div>
        {users.filter(u=>u.role!=="admin").map(u=>{
          const b=getPTOBalance(u.id,users,ptoRequests);
          return <div key={u.id} style={{background:"#fff",borderRadius:12,padding:12,marginBottom:8,border:"0.5px solid rgba(0,0,0,0.07)",display:"flex",alignItems:"center",gap:12}}>
            <Av name={u.name} size={36} bg={ROLE_META[u.role]?.bg||"#888"}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{u.name}</div><div style={{marginTop:3}}><RBadge role={u.role}/></div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,textAlign:"center"}}>
              {[["Total",b.annual,"#534AB7"],["Usados",b.used,"#BA7517"],["Disp.",b.available,"#1D9E75"]].map(([l,v,c])=>
                <div key={l}><div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:"#aaa"}}>{l}</div></div>
              )}
            </div>
          </div>;
        })}
      </>}
    </div>
  </div>;
}
