import { supervisorDecideCompReq, adminDecideCompReq, cancelCompRequest } from "../../lib/firestoreHelpers";
import { PTOStatusBadge } from "./PTOStatusBadge";

export function ReqCard({r,currentUser,db,fmtDay,isSupervisor,isAdmin,reviewId,setReviewId,reviewComment,setReviewComment,adminRevId,setAdminRevId,adminRevComment,setAdminRevComment,cancelId,setCancelId}){
  const isOwn=r.userId===currentUser.id;
  const days=r.selectedDays||[];
  const canCancel=isOwn&&!["declined","cancelled","approved"].includes(r.status);
  return <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:10,border:"0.5px solid rgba(0,0,0,0.07)"}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{r.userName}</div>
        <div style={{fontSize:11,color:"#888"}}>{days.length} día{days.length!==1?"s":""} solicitado{days.length!==1?"s":""}</div>
      </div>
      <PTOStatusBadge status={r.status}/>
    </div>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
      {days.slice(0,5).map(d=><span key={d} style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"#EEEDFE",color:"#534AB7",fontWeight:500}}>{fmtDay(d)}</span>)}
      {days.length>5&&<span style={{fontSize:10,color:"#888",padding:"2px 0"}}>+{days.length-5} más</span>}
    </div>
    {r.reason&&<div style={{fontSize:12,color:"#555",background:"#f8f8f8",borderRadius:8,padding:"6px 10px",marginBottom:8}}>{r.reason}</div>}
    {r.supervisorDecision&&<div style={{fontSize:11,marginBottom:6,background:r.supervisorDecision.approved?"#EAF3DE":"#FCEBEB",borderRadius:8,padding:"6px 10px",color:r.supervisorDecision.approved?"#3B6D11":"#A32D2D"}}>
      <strong>Supervisor:</strong> {r.supervisorDecision.approved?"✓ Aprobado":"✗ Denegado"}{r.supervisorDecision.comment?" — "+r.supervisorDecision.comment:""}
    </div>}
    {r.adminDecision&&<div style={{fontSize:11,marginBottom:6,background:r.adminDecision.approved?"#EAF3DE":"#FCEBEB",borderRadius:8,padding:"6px 10px",color:r.adminDecision.approved?"#3B6D11":"#A32D2D"}}>
      <strong>Admin:</strong> {r.adminDecision.approved?"✓ Aprobado":"✗ Denegado"}{r.adminDecision.comment?" — "+r.adminDecision.comment:""}
    </div>}
    {isSupervisor&&r.status==="pending_supervisor"&&reviewId!==r.id&&<div className="btn-row" style={{marginTop:10}}>
      <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{setReviewId(r.id);setReviewComment("");}}>Denegar</button>
      <button className="btn-green" style={{padding:"9px 0"}} onClick={()=>supervisorDecideCompReq(currentUser,db,r.id,true,"")}>Aprobar</button>
    </div>}
    {isSupervisor&&r.status==="pending_supervisor"&&reviewId===r.id&&<div style={{marginTop:10}}>
      <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Motivo (opcional)..." style={{width:"100%",fontSize:13,border:"1.5px solid #e8e8e8",borderRadius:8,padding:"10px 12px",background:"#fff",minHeight:56,resize:"vertical",outline:"none",lineHeight:1.5,marginBottom:8}}/>
      <div className="btn-row">
        <button className="btn-secondary" style={{padding:"9px 0"}} onClick={()=>setReviewId(null)}>Cancelar</button>
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{supervisorDecideCompReq(currentUser,db,r.id,false,reviewComment);setReviewId(null);}}>Confirmar</button>
      </div>
    </div>}
    {isAdmin&&["pending_supervisor","pending_admin"].includes(r.status)&&adminRevId!==r.id&&<div className="btn-row" style={{marginTop:10}}>
      <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{setAdminRevId(r.id);setAdminRevComment("");}}>Denegar</button>
      <button className="btn-green" style={{padding:"9px 0"}} onClick={()=>adminDecideCompReq(currentUser,db,r.id,true,"")}>Aprobar</button>
    </div>}
    {isAdmin&&["pending_supervisor","pending_admin"].includes(r.status)&&adminRevId===r.id&&<div style={{marginTop:10}}>
      <textarea value={adminRevComment} onChange={e=>setAdminRevComment(e.target.value)} placeholder="Motivo (opcional)..." style={{width:"100%",fontSize:13,border:"1.5px solid #e8e8e8",borderRadius:8,padding:"10px 12px",background:"#fff",minHeight:56,resize:"vertical",outline:"none",lineHeight:1.5,marginBottom:8}}/>
      <div className="btn-row">
        <button className="btn-secondary" style={{padding:"9px 0"}} onClick={()=>setAdminRevId(null)}>Cancelar</button>
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{adminDecideCompReq(currentUser,db,r.id,false,adminRevComment);setAdminRevId(null);}}>Confirmar</button>
      </div>
    </div>}
    {canCancel&&cancelId!==r.id&&<div style={{marginTop:10,borderTop:"1px solid #f0f0f0",paddingTop:10}}>
      <button onClick={()=>setCancelId(r.id)} style={{width:"100%",padding:"8px 0",borderRadius:8,border:"1.5px solid #e0e0e0",background:"#f8f8f8",color:"#777",fontSize:12,fontWeight:500,cursor:"pointer"}}>Cancelar solicitud</button>
    </div>}
    {canCancel&&cancelId===r.id&&<div style={{marginTop:10,borderTop:"1px solid #f0f0f0",paddingTop:10}}>
      <div style={{fontSize:12,color:"#555",marginBottom:8,textAlign:"center"}}>¿Cancelar esta solicitud?</div>
      <div className="btn-row">
        <button className="btn-secondary" style={{padding:"9px 0"}} onClick={()=>setCancelId(null)}>No</button>
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{cancelCompRequest(db,r.id);setCancelId(null);}}>Sí, cancelar</button>
      </div>
    </div>}
  </div>;
}
