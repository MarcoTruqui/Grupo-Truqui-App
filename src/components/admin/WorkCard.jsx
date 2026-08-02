import { ROLE_META } from "../../lib/constants";
import { supervisorDecideCompWork, adminDecideCompWork } from "../../lib/firestoreHelpers";
import { PTOStatusBadge } from "./PTOStatusBadge";

export function WorkCard({r,currentUser,db,fmtDate,isSupervisor,isAdmin,reviewId,setReviewId,reviewComment,setReviewComment,adminRevId,setAdminRevId,adminRevComment,setAdminRevComment,adminRevDays,setAdminRevDays}){
  const isOwn=r.userId===currentUser.id;
  const typeLabel=r.type==="holiday"?"Festivo":"Domingo";
  const typeBg=r.type==="holiday"?"#FAEEDA":"#EEEDFE";
  const typeColor=r.type==="holiday"?"#854F0B":"#534AB7";
  return <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:10,border:"0.5px solid rgba(0,0,0,0.07)"}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{r.userName}</div>
        <div style={{fontSize:11,color:"#888"}}>{ROLE_META[r.userRole]?.label||r.userRole}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
        <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:typeBg,color:typeColor}}>{typeLabel}</span>
        <PTOStatusBadge status={r.status}/>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
      <div style={{fontSize:13,fontWeight:600,color:"#333"}}>📅 {fmtDate(r.workDate)}</div>
      {r.property&&<div style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#EEEDFE",color:"#534AB7"}}>🏠 {r.property}</div>}
    </div>
    {r.reason&&<div style={{fontSize:12,color:"#555",background:"#f8f8f8",borderRadius:8,padding:"6px 10px",marginBottom:8}}>{r.reason}</div>}
    {r.status==="approved"&&<div style={{fontSize:12,background:"#EAF3DE",borderRadius:8,padding:"6px 10px",marginBottom:6,color:"#3B6D11",fontWeight:600}}>✓ {r.daysGranted} día{r.daysGranted!==1?"s":""} compensatorio{r.daysGranted!==1?"s":""} otorgado{r.daysGranted!==1?"s":""}</div>}
    {r.supervisorDecision&&<div style={{fontSize:11,marginBottom:6,background:r.supervisorDecision.approved?"#EAF3DE":"#FCEBEB",borderRadius:8,padding:"6px 10px",color:r.supervisorDecision.approved?"#3B6D11":"#A32D2D"}}>
      <strong>Supervisor:</strong> {r.supervisorDecision.approved?"✓ Confirmado":"✗ Denegado"}{r.supervisorDecision.comment?" — "+r.supervisorDecision.comment:""}
    </div>}
    {r.adminDecision&&<div style={{fontSize:11,marginBottom:6,background:r.adminDecision.approved?"#EAF3DE":"#FCEBEB",borderRadius:8,padding:"6px 10px",color:r.adminDecision.approved?"#3B6D11":"#A32D2D"}}>
      <strong>Admin:</strong> {r.adminDecision.approved?"✓ Aprobado":"✗ Denegado"}{r.adminDecision.comment?" — "+r.adminDecision.comment:""}
      {r.adminDecision.approved&&r.daysGranted!=null&&<span style={{fontWeight:700}}> · {r.daysGranted} día{r.daysGranted!==1?"s":""}</span>}
    </div>}
    {/* Supervisor approve work entry */}
    {isSupervisor&&r.status==="pending_supervisor"&&reviewId!==r.id&&<div className="btn-row" style={{marginTop:10}}>
      <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{setReviewId(r.id);setReviewComment("");}}>Denegar</button>
      <button className="btn-green" style={{padding:"9px 0"}} onClick={()=>{supervisorDecideCompWork(currentUser,db,r.id,true,"");}}>Confirmar</button>
    </div>}
    {isSupervisor&&r.status==="pending_supervisor"&&reviewId===r.id&&<div style={{marginTop:10}}>
      <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Motivo (opcional)..." style={{width:"100%",fontSize:13,border:"1.5px solid #e8e8e8",borderRadius:8,padding:"10px 12px",background:"#fff",minHeight:56,resize:"vertical",outline:"none",lineHeight:1.5,marginBottom:8}}/>
      <div className="btn-row">
        <button className="btn-secondary" style={{padding:"9px 0"}} onClick={()=>setReviewId(null)}>Cancelar</button>
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{supervisorDecideCompWork(currentUser,db,r.id,false,reviewComment);setReviewId(null);}}>Confirmar denegación</button>
      </div>
    </div>}
    {/* Admin approve work entry */}
    {isAdmin&&["pending_supervisor","pending_admin"].includes(r.status)&&adminRevId!==r.id&&<div style={{marginTop:10}}>
      <div style={{fontSize:11,color:"#888",marginBottom:6}}>Días compensatorios a otorgar:</div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        {r.type==="holiday"
          ?<div style={{fontSize:13,fontWeight:600,color:"#534AB7"}}>Festivo — siempre 2 días</div>
          :<><button onClick={()=>setAdminRevDays(d=>Math.max(0.5,+(d-0.5).toFixed(1)))} style={{width:32,height:32,borderRadius:8,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:18,cursor:"pointer"}}>−</button>
            <span style={{fontSize:22,fontWeight:700,color:"#534AB7",minWidth:42,textAlign:"center"}}>{adminRevDays}</span>
            <button onClick={()=>setAdminRevDays(d=>Math.min(3,+(d+0.5).toFixed(1)))} style={{width:32,height:32,borderRadius:8,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:18,cursor:"pointer"}}>+</button>
          </>
        }
      </div>
      <div className="btn-row">
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{setAdminRevId(r.id);setAdminRevComment("");setAdminRevDays(r.type==="holiday"?2:1.5);}}>Denegar</button>
        <button className="btn-green" style={{padding:"9px 0"}} onClick={()=>adminDecideCompWork(currentUser,db,r.id,true,"",r.type==="holiday"?2:adminRevDays)}>Aprobar</button>
      </div>
    </div>}
    {isAdmin&&["pending_supervisor","pending_admin"].includes(r.status)&&adminRevId===r.id&&<div style={{marginTop:10}}>
      <textarea value={adminRevComment} onChange={e=>setAdminRevComment(e.target.value)} placeholder="Motivo de denegación..." style={{width:"100%",fontSize:13,border:"1.5px solid #e8e8e8",borderRadius:8,padding:"10px 12px",background:"#fff",minHeight:56,resize:"vertical",outline:"none",lineHeight:1.5,marginBottom:8}}/>
      <div className="btn-row">
        <button className="btn-secondary" style={{padding:"9px 0"}} onClick={()=>setAdminRevId(null)}>Cancelar</button>
        <button className="btn-red" style={{padding:"9px 0"}} onClick={()=>{adminDecideCompWork(currentUser,db,r.id,false,adminRevComment,0);setAdminRevId(null);}}>Confirmar denegación</button>
      </div>
    </div>}
  </div>;
}
