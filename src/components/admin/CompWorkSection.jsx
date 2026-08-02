import { useState } from "react";
import { ROLE_META } from "../../lib/constants";
import { getCompBalance, submitCompWork, submitCompRequest } from "../../lib/firestoreHelpers";
import { Av } from "../shared/Avatar";
import { PTOCalendar } from "./PTOCalendar";
import { WorkCard } from "./WorkCard";
import { ReqCard } from "./ReqCard";

export function CompWorkSection({currentUser,role,users,compWork,compRequests,db,onBack,onSwitch,allPropNames}) {
  const [tab,setTab] = useState("register");
  const [workDate,setWorkDate] = useState("");
  const [workType,setWorkType] = useState("sunday");
  const [workReason,setWorkReason] = useState("");
  const [workProperty,setWorkProperty] = useState("");
  const [submittingWork,setSubmittingWork] = useState(false);
  const [submittedWork,setSubmittedWork] = useState(false);
  const [selDays,setSelDays] = useState([]);
  const [reqReason,setReqReason] = useState("");
  const [submittingReq,setSubmittingReq] = useState(false);
  const [submittedReq,setSubmittedReq] = useState(false);
  const [reviewId,setReviewId] = useState(null);
  const [reviewComment,setReviewComment] = useState("");
  const [reviewDays,setReviewDays] = useState(1);
  const [adminRevId,setAdminRevId] = useState(null);
  const [adminRevComment,setAdminRevComment] = useState("");
  const [adminRevDays,setAdminRevDays] = useState(1.5);
  const [cancelId,setCancelId] = useState(null);

  const isAdmin=role==="admin";
  const isSupervisor=role==="supervisor";
  const isWorker=["maintenance","cleaning"].includes(role);

  const myWork=compWork.filter(r=>r.userId===currentUser.id).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
  const myReqs=compRequests.filter(r=>r.userId===currentUser.id).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
  const myBal=!isAdmin?getCompBalance(currentUser.id,compWork,compRequests,users):null;
  const myUsedDays=compRequests.filter(r=>r.userId===currentUser.id&&r.status==="approved").flatMap(r=>r.selectedDays||[]);
  const myPendingDays=compRequests.filter(r=>r.userId===currentUser.id&&["pending_supervisor","pending_admin"].includes(r.status)).flatMap(r=>r.selectedDays||[]);

  const toReviewWork=isSupervisor?compWork.filter(r=>["maintenance","cleaning"].includes(r.userRole)&&r.status==="pending_supervisor"):[];
  const toReviewReq=isSupervisor?compRequests.filter(r=>["maintenance","cleaning"].includes(r.userRole)&&r.status==="pending_supervisor"):[];
  const adminWorkReview=isAdmin?compWork.filter(r=>["pending_supervisor","pending_admin"].includes(r.status)).sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt)):[];
  const adminReqReview=isAdmin?compRequests.filter(r=>["pending_supervisor","pending_admin"].includes(r.status)).sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt)):[];

  function fmtDate(iso){if(!iso)return"";return new Date(iso).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"});}
  function fmtDay(iso){if(!iso)return"";return new Date(iso+"T12:00:00").toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"});}

  async function handleSubmitWork(){
    if(!workDate){alert("Selecciona la fecha trabajada.");return;}
    if(!workProperty){alert("Selecciona la propiedad.");return;}
    setSubmittingWork(true);
    await submitCompWork(currentUser,role,db,workDate,workType,workReason,workProperty);
    setWorkDate("");setWorkType("sunday");setWorkReason("");setWorkProperty("");
    setSubmittingWork(false);setSubmittedWork(true);
    setTimeout(()=>setSubmittedWork(false),3000);
  }

  async function handleSubmitReq(){
    if(!selDays.length)return;
    if(myBal&&selDays.length>myBal.available){alert(`Solo tienes ${myBal.available} día${myBal.available!==1?"s":""} disponible${myBal.available!==1?"s":""}.`);return;}
    setSubmittingReq(true);
    await submitCompRequest(currentUser,role,db,selDays,reqReason);
    setSelDays([]);setReqReason("");setSubmittingReq(false);setSubmittedReq(true);
    setTimeout(()=>setSubmittedReq(false),3000);
  }

  const cardProps = {currentUser,db,fmtDate,fmtDay,isSupervisor,isAdmin,reviewId,setReviewId,reviewComment,setReviewComment,adminRevId,setAdminRevId,adminRevComment,setAdminRevComment,adminRevDays,setAdminRevDays,cancelId,setCancelId};

  const tabs = isAdmin||isSupervisor
    ? [["review","Por aprobar"],["register","Registrar"],["use","Usar días"],["history","Historial"]]
    : [["register","Registrar"],["use","Usar días"],["history","Historial"]];

  const pendingCount=(isAdmin?adminWorkReview.length+adminReqReview.length:0)+(isSupervisor?toReviewWork.length+toReviewReq.length:0);

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:"#f5f5f7"}}>
    <div style={{background:"#fff",padding:"14px 16px 12px",paddingTop:"calc(14px + env(safe-area-inset-top))",borderBottom:"0.5px solid rgba(0,0,0,0.08)",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#1D9E75",fontSize:13,padding:0}}>‹ Atrás</button>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:18,fontWeight:700,color:"#1a1a1a"}}>🗓️ Días Extra / Festivos</div>
        {onSwitch&&<button onClick={onSwitch} style={{fontSize:11,padding:"6px 12px",borderRadius:8,border:"0.5px solid rgba(0,0,0,0.12)",background:"#f5f5f5",color:"#555",cursor:"pointer"}}>⊞ Portales</button>}
      </div>
    </div>

    <div className="tab-bar" style={{flexShrink:0}}>
      {tabs.map(([k,l])=><button key={k} className={`tab-btn${tab===k?" active":""}`} onClick={()=>setTab(k)} style={{position:"relative"}}>
        {l}{k==="review"&&pendingCount>0&&<span style={{background:"#534AB7",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:20,marginLeft:4}}>{pendingCount}</span>}
      </button>)}
    </div>

    <div style={{flex:1,overflowY:"auto",padding:"16px 14px 32px",WebkitOverflowScrolling:"touch"}}>

      {/* Balance — shown for non-admin on all tabs */}
      {!isAdmin&&myBal&&<div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"0.5px solid rgba(0,0,0,0.07)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12}}>Mi balance compensatorio</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,textAlign:"center"}}>
          {[["Ganados",myBal.earned,"#534AB7"],["Usados",myBal.used,"#1D9E75"],["Pendientes",myBal.pending,"#BA7517"],["Disponibles",myBal.available,myBal.available===0?"#A32D2D":"#1D9E75"]].map(([l,v,c])=>
            <div key={l} style={{background:"#f8f8fa",borderRadius:10,padding:"10px 4px"}}><div style={{fontSize:19,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:"#888",marginTop:3}}>{l}</div></div>
          )}
        </div>
      </div>}

      {/* REGISTER TAB */}
      {tab==="register"&&<>
        <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"0.5px solid rgba(0,0,0,0.07)"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:"#1a1a1a"}}>Registrar día trabajado</div>
          <div className="field" style={{marginBottom:12}}>
            <label>Tipo de día</label>
            <div style={{display:"flex",gap:10}}>
              {[["sunday","Domingo","#534AB7","#EEEDFE"],["holiday","Festivo","#854F0B","#FAEEDA"]].map(([v,l,c,bg])=>
                <button key={v} onClick={()=>setWorkType(v)} style={{flex:1,padding:"12px 0",borderRadius:10,border:workType===v?`2px solid ${c}`:"1.5px solid #e0e0e0",background:workType===v?bg:"#fafafa",color:workType===v?c:"#666",fontSize:13,fontWeight:workType===v?700:400,cursor:"pointer"}}>{l}{v==="holiday"&&<div style={{fontSize:10,opacity:0.7,marginTop:2}}>= 2 días comp.</div>}</button>
              )}
            </div>
          </div>
          <div className="field" style={{marginBottom:12}}>
            <label>Fecha trabajada</label>
            <input type="date" value={workDate} onChange={e=>setWorkDate(e.target.value)} style={{fontSize:14,padding:"10px 12px",border:"1.5px solid #e0e0e0",borderRadius:10,width:"100%",background:"#fafafa",outline:"none"}}/>
          </div>
          <div className="field" style={{marginBottom:12}}>
            <label>Propiedad trabajada</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {(allPropNames||[]).map(p=><button key={p} onClick={()=>setWorkProperty(p)} style={{padding:"8px 14px",borderRadius:10,border:workProperty===p?"2px solid #534AB7":"1.5px solid #e0e0e0",background:workProperty===p?"#EEEDFE":"#fafafa",color:workProperty===p?"#534AB7":"#666",fontSize:13,cursor:"pointer",fontWeight:workProperty===p?700:400}}>{p}</button>)}
            </div>
          </div>
          <div className="field" style={{marginBottom:12}}>
            <label>Motivo (opcional)</label>
            <textarea value={workReason} onChange={e=>setWorkReason(e.target.value)} placeholder="ej. Emergencia en propiedad..." style={{width:"100%",fontSize:13,border:"1.5px solid #e8e8e8",borderRadius:8,padding:"10px 12px",background:"#fff",minHeight:56,resize:"vertical",outline:"none",lineHeight:1.5}}/>
          </div>
          {submittedWork&&<div style={{background:"#EAF3DE",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#3B6D11",textAlign:"center",fontWeight:600}}>✓ Registrado — pendiente de aprobación</div>}
          <button className="btn-primary" onClick={handleSubmitWork} disabled={submittingWork||!workDate} style={{width:"100%",opacity:workDate?1:0.5}}>{submittingWork?"Enviando...":"Enviar registro"}</button>
        </div>
      </>}

      {/* USE DAYS TAB */}
      {tab==="use"&&<>
        {myBal&&myBal.available===0&&<div style={{background:"#FAEEDA",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:13,color:"#854F0B",textAlign:"center"}}>No tienes días compensatorios disponibles aún.</div>}
        {myBal&&myBal.available>0&&<>
          <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"0.5px solid rgba(0,0,0,0.07)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12}}>Selecciona los días a tomar</div>
            <PTOCalendar selected={selDays} onToggle={d=>setSelDays(s=>s.includes(d)?s.filter(x=>x!==d):[...s,d])} usedDays={myUsedDays} pendingDays={myPendingDays}/>
          </div>
          {selDays.length>0&&<>
            {selDays.length>myBal.available&&<div style={{background:"#FCEBEB",borderRadius:10,padding:"10px 14px",marginBottom:10,fontSize:12,color:"#A32D2D",textAlign:"center"}}>⚠️ Supera tu saldo ({myBal.available} disponible{myBal.available!==1?"s":""})</div>}
            <div className="field"><label>Motivo (opcional)</label><textarea value={reqReason} onChange={e=>setReqReason(e.target.value)} placeholder="ej. Descanso personal..." style={{minHeight:56}}/></div>
            {submittedReq&&<div style={{background:"#EAF3DE",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#3B6D11",textAlign:"center",fontWeight:600}}>✓ Solicitud enviada</div>}
            <div className="btn-row" style={{marginBottom:14}}>
              <button className="btn-secondary" onClick={()=>setSelDays([])}>Limpiar</button>
              <button className="btn-primary" onClick={handleSubmitReq} disabled={submittingReq||selDays.length>myBal.available} style={{opacity:selDays.length<=myBal.available?1:0.5}}>{submittingReq?"Enviando...":"Solicitar días"}</button>
            </div>
          </>}
          {myReqs.length>0&&<><div className="section-label">Mis solicitudes</div>{myReqs.map(r=><ReqCard key={r.id} r={r} {...cardProps}/>)}</>}
        </>}
      </>}

      {/* HISTORY TAB */}
      {tab==="history"&&<>
        <div className="section-label">Mis días trabajados</div>
        {myWork.length===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:20,background:"#fff",borderRadius:12,marginBottom:12}}>Sin registros aún</div>}
        {myWork.map(r=><WorkCard key={r.id} r={r} {...cardProps}/>)}
        {myReqs.length>0&&<><div className="section-label" style={{marginTop:8}}>Mis días solicitados</div>{myReqs.map(r=><ReqCard key={r.id} r={r} {...cardProps}/>)}</>}
      </>}

      {/* REVIEW TAB — supervisor / admin */}
      {tab==="review"&&(isSupervisor||isAdmin)&&<>
        <div className="section-label">Días trabajados por confirmar</div>
        {(isAdmin?adminWorkReview:toReviewWork).length===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:20,background:"#fff",borderRadius:12,marginBottom:12}}>Sin registros pendientes</div>}
        {(isAdmin?adminWorkReview:toReviewWork).map(r=><WorkCard key={r.id} r={r} {...cardProps}/>)}
        <div className="section-label" style={{marginTop:8}}>Solicitudes de días libres</div>
        {(isAdmin?adminReqReview:toReviewReq).length===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:20,background:"#fff",borderRadius:12,marginBottom:12}}>Sin solicitudes pendientes</div>}
        {(isAdmin?adminReqReview:toReviewReq).map(r=><ReqCard key={r.id} r={r} {...cardProps}/>)}
        <div className="section-label" style={{marginTop:8}}>Balances del personal</div>
        {users.filter(u=>["maintenance","cleaning"].includes(u.role)).map(u=>{
          const b=getCompBalance(u.id,compWork,compRequests,users);
          return <div key={u.id} style={{background:"#fff",borderRadius:12,padding:12,marginBottom:8,border:"0.5px solid rgba(0,0,0,0.07)",display:"flex",alignItems:"center",gap:12}}>
            <Av name={u.name} size={36} bg={ROLE_META[u.role]?.bg||"#888"}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{u.name}</div><div style={{fontSize:11,color:"#888"}}>{ROLE_META[u.role]?.label}</div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,textAlign:"center"}}>
              {[["Ganados",b.earned,"#534AB7"],["Usados",b.used,"#BA7517"],["Disp.",b.available,"#1D9E75"]].map(([l,v,c])=>
                <div key={l}><div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:"#aaa"}}>{l}</div></div>
              )}
            </div>
          </div>;
        })}
      </>}

    </div>
  </div>;
}
