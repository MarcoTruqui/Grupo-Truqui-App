import { useState } from "react";
import { ROLE_META } from "../../lib/constants";
import { fmtDate } from "../../lib/dateHelpers";
import { isSundayISO, countPTODays, cancelPTO } from "../../lib/firestoreHelpers";
import { PTOStatusBadge } from "./PTOStatusBadge";
import { PTODatesModal } from "./PTODatesModal";

export function RequestCard({r,currentUser,db,fmtDay,reviewId,setReviewId,reviewComment,setReviewComment,adminRevId,setAdminRevId,adminRevComment,setAdminRevComment,cancelId,setCancelId,onSuperApprove,onSuperDecline,onAdminApprove,onAdminDecline}){
  const [showDatesModal,setShowDatesModal] = useState(false);
  const showDates=r.selectedDays||[];
  const dayCount=countPTODays(showDates);
  const isOwn=r.userId===currentUser.id;
  const canCancel=isOwn&&!["declined","cancelled"].includes(r.status);
  return <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:10,border:"0.5px solid rgba(0,0,0,0.07)"}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{r.userName}</div>
        <div style={{fontSize:11,color:"#888"}}>{ROLE_META[r.userRole]?.label||r.userRole} · {dayCount} día{dayCount!==1?"s":""}</div>
      </div>
      <PTOStatusBadge status={r.status}/>
    </div>
    <div onClick={()=>setShowDatesModal(true)} style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:8,cursor:"pointer"}}>
      {showDates.slice(0,5).map(d=><span key={d} style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:isSundayISO(d)?"#f0f0f0":"#EEEDFE",color:isSundayISO(d)?"#aaa":"#534AB7",fontWeight:500}}>{fmtDay(d)}</span>)}
      {showDates.length>5
        ?<span style={{fontSize:10,color:"#534AB7",fontWeight:700,padding:"2px 0"}}>Ver todas ({showDates.length}) ›</span>
        :showDates.length>0&&<span style={{fontSize:10,color:"#534AB7",fontWeight:600,padding:"2px 0"}}>Ver detalle ›</span>}
    </div>
    {showDatesModal&&<PTODatesModal request={r} dayCount={dayCount} onClose={()=>setShowDatesModal(false)}/>}
    {r.reason&&<div style={{fontSize:12,color:"#555",marginBottom:8,background:"#f8f8f8",borderRadius:8,padding:"6px 10px"}}>{r.reason}</div>}
    {r.supervisorDecision&&<div style={{fontSize:11,marginBottom:6,background:r.supervisorDecision.approved?"#EAF3DE":"#FCEBEB",borderRadius:8,padding:"6px 10px",color:r.supervisorDecision.approved?"#3B6D11":"#A32D2D"}}>
      <strong>Supervisor:</strong> {r.supervisorDecision.approved?"✓ Aprobado":"✗ Denegado"}{r.supervisorDecision.comment?" — "+r.supervisorDecision.comment:""}
      <div style={{fontSize:10,opacity:0.7,marginTop:2}}>{r.supervisorDecision.by} · {fmtDate(r.supervisorDecision.at)}</div>
    </div>}
    {r.adminDecision&&<div style={{fontSize:11,marginBottom:6,background:r.adminDecision.approved?"#EAF3DE":"#FCEBEB",borderRadius:8,padding:"6px 10px",color:r.adminDecision.approved?"#3B6D11":"#A32D2D"}}>
      <strong>Admin:</strong> {r.adminDecision.approved?"✓ Aprobado":"✗ Denegado"}{r.adminDecision.comment?" — "+r.adminDecision.comment:""}
      <div style={{fontSize:10,opacity:0.7,marginTop:2}}>{r.adminDecision.by} · {fmtDate(r.adminDecision.at)}</div>
    </div>}
    {onSuperApprove&&reviewId!==r.id&&<div className="btn-row" style={{marginTop:10}}>
      <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{setReviewId(r.id);setReviewComment("");}}>Denegar</button>
      <button className="btn-green" style={{padding:"9px 0"}} onClick={()=>onSuperApprove("")}>Aprobar</button>
    </div>}
    {onSuperApprove&&reviewId===r.id&&<div style={{marginTop:10}}>
      <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Motivo (opcional)..." style={{width:"100%",fontSize:13,border:"1.5px solid #e8e8e8",borderRadius:8,padding:"10px 12px",background:"#fff",minHeight:56,resize:"vertical",outline:"none",lineHeight:1.5,marginBottom:8}}/>
      <div className="btn-row">
        <button className="btn-secondary" style={{padding:"9px 0"}} onClick={()=>setReviewId(null)}>Cancelar</button>
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{onSuperDecline(reviewComment);setReviewId(null);}}>Confirmar</button>
      </div>
    </div>}
    {onAdminApprove&&adminRevId!==r.id&&<div className="btn-row" style={{marginTop:10}}>
      <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{setAdminRevId(r.id);setAdminRevComment("");}}>Denegar</button>
      <button className="btn-green" style={{padding:"9px 0"}} onClick={()=>onAdminApprove("")}>Aprobar</button>
    </div>}
    {onAdminApprove&&adminRevId===r.id&&<div style={{marginTop:10}}>
      <textarea value={adminRevComment} onChange={e=>setAdminRevComment(e.target.value)} placeholder="Motivo (opcional)..." style={{width:"100%",fontSize:13,border:"1.5px solid #e8e8e8",borderRadius:8,padding:"10px 12px",background:"#fff",minHeight:56,resize:"vertical",outline:"none",lineHeight:1.5,marginBottom:8}}/>
      <div className="btn-row">
        <button className="btn-secondary" style={{padding:"9px 0"}} onClick={()=>setAdminRevId(null)}>Cancelar</button>
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{onAdminDecline(adminRevComment);setAdminRevId(null);}}>Confirmar</button>
      </div>
    </div>}
    {canCancel&&cancelId!==r.id&&<div style={{marginTop:10,borderTop:"1px solid #f0f0f0",paddingTop:10}}>
      <button onClick={()=>setCancelId(r.id)} style={{width:"100%",padding:"8px 0",borderRadius:8,border:"1.5px solid #e0e0e0",background:"#f8f8f8",color:"#777",fontSize:12,fontWeight:500,cursor:"pointer"}}>Cancelar solicitud</button>
    </div>}
    {canCancel&&cancelId===r.id&&<div style={{marginTop:10,borderTop:"1px solid #f0f0f0",paddingTop:10}}>
      <div style={{fontSize:12,color:"#555",marginBottom:8,textAlign:"center"}}>¿Cancelar esta solicitud? Los días regresarán a tu saldo.</div>
      <div className="btn-row">
        <button className="btn-secondary" style={{padding:"9px 0"}} onClick={()=>setCancelId(null)}>No, mantener</button>
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{cancelPTO(db,r.id);setCancelId(null);}}>Sí, cancelar</button>
      </div>
    </div>}
  </div>;
}
