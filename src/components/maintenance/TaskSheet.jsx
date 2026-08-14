import { useState } from "react";
import { STATUS_LABEL, ROLE_META } from "../../lib/constants";
import { fmtDate } from "../../lib/dateHelpers";
import { Av } from "../shared/Avatar";
import { PBadge, SBadge, AutoCleaningBadge, OBadge } from "../shared/Badges";
import { PhotoUpload } from "../shared/PhotoUpload";
import { PhotoThumb } from "../shared/PhotoThumb";
import { ResolveSheet } from "./ResolveSheet";

export function TaskSheet({task, onClose, tasks, users, wfSteps, currentUser, canViewSensitive, canViewApprovals, canAssign, canChangeStatus, canRequestApproval, canApprove, canResolve, isAdmin, advance, hEntry, addComment, removeTask, bgUpload, onOpenLightbox, setApprovalTxt, setApprovalPhotos, setPendingApprovalTask}) {
  if (!task) return null;
  const [showResolve, setShowResolve] = useState(false);
  const [taskTab, setTaskTab] = useState("details");
  const [commentText, setCommentText] = useState("");
  const [commentPhotos, setCommentPhotos] = useState([]);
  const [sending, setSending] = useState(false);

  const t = tasks.find(x => x.id === task.id) || task;
  const ci = wfSteps.indexOf(t.status);
  const workers = users.filter(u => ["maintenance","cleaning"].includes(u.role));
  const isBlocked = t.status === "Needs Approval";
  const allComments = t.comments || [];
  const comments = canViewSensitive ? allComments : allComments.filter(c => c.type !== "approval");
  const history = t.history || [];
  const legacyNotes = (t.progressNotes || []).filter(n => typeof n === "string");

  if (showResolve) return <ResolveSheet task={t} onClose={() => { setShowResolve(false); onClose(); }} currentUser={currentUser} hEntry={hEntry} advance={advance} bgUpload={bgUpload}/>;

  async function sendComment() {
    if (!commentText.trim() && commentPhotos.length === 0) return;
    setSending(true);
    await addComment(t.id, commentText, commentPhotos);
    setCommentText(""); setCommentPhotos([]); setSending(false);
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:18, fontWeight:700, color:"#1a1a1a", marginBottom:6}}>{t.title}</div>
            <div style={{display:"flex", gap:6, flexWrap:"wrap"}}><PBadge priority={t.priority}/><SBadge status={t.status}/></div>
          </div>
          <button onClick={onClose} style={{background:"#f5f5f5", border:"none", width:30, height:30, borderRadius:"50%", fontSize:18, cursor:"pointer", color:"#666", marginLeft:10, flexShrink:0}}>×</button>
        </div>

        <div className="tab-bar">
          {[["details","Detalles"], ["comments",`Comentarios (${comments.length + legacyNotes.length})`], ["history","Historial"]].map(([k, l]) =>
            <button key={k} onClick={() => setTaskTab(k)} className={`tab-btn${taskTab === k ? " active" : ""}`}>{l}</button>
          )}
        </div>

        {taskTab === "details" && <>
          <div style={{background:"#f8f8f8", borderRadius:10, padding:"10px 12px", marginBottom:14, display:"flex", gap:16, flexWrap:"wrap"}}>
            <div><div style={{fontSize:10, color:"#888", fontWeight:600, textTransform:"uppercase", marginBottom:2}}>Propiedad</div><div style={{fontSize:13, fontWeight:600}}>{t.property}</div></div>
            {t.occupancy && <div><div style={{fontSize:10, color:"#888", fontWeight:600, textTransform:"uppercase", marginBottom:2}}>Estado</div><OBadge occupancy={t.occupancy}/></div>}
            <div><div style={{fontSize:10, color:"#888", fontWeight:600, textTransform:"uppercase", marginBottom:2}}>Registrada</div><div style={{fontSize:13}}>{t.created || "—"}</div></div>
            {t.assignee && <div><div style={{fontSize:10, color:"#888", fontWeight:600, textTransform:"uppercase", marginBottom:2}}>Asignado</div><div style={{fontSize:13}}>{t.assignee}</div></div>}
            {t.source === "cleaning" && <div><div style={{fontSize:10, color:"#888", fontWeight:600, textTransform:"uppercase", marginBottom:2}}>Origen</div><AutoCleaningBadge/></div>}
          </div>
          {t.source === "cleaning" && <div style={{background:"#E6F1FB", border:"0.5px solid #AFCFEE", borderRadius:10, padding:"10px 12px", marginBottom:14, fontSize:12.5, color:"#185FA5"}}>🧹 Esta tarea se creó automáticamente porque un cleaner marcó "{t.sourceRoomLabel}" en rojo durante una limpieza. Revísala por si fue un error de registro.</div>}

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:8}}>Flujo de trabajo</div>
            <div className="wf-row">
              {wfSteps.map((s, i) => {
                const active = i === ci; const done = i < ci;
                return <span key={s} style={{display:"flex", alignItems:"center", gap:4}}>
                  <span className={`wf-step ${active ? "active" : done ? "done" : "pending"}`}>{STATUS_LABEL[s] || s}</span>
                  {i < 4 && <span className="wf-arrow">›</span>}
                </span>;
              })}
            </div>
          </div>

          {canAssign && <div className="field" style={{marginBottom:14}}>
            <label>Asignar a</label>
            <select value={t.assignee || ""} onChange={e => { const v = e.target.value; advance(t.id, t.status, {assignee:v, _hist:[hEntry(`Asignado a ${v || "Sin asignar"}`)]}); }}>
              <option value="">Sin asignar</option>
              {workers.map(u => <option key={u.id} value={u.name}>{u.name} — {ROLE_META[u.role]?.label}</option>)}
            </select>
          </div>}

          {canChangeStatus && !["Resolved","Approved"].includes(t.status) && <div className="field" style={{marginBottom:14}}>
            <label>Cambiar estado</label>
            {isBlocked ? <div className="blocked-box">Bloqueada — esperando decisión de aprobación</div> :
              <select value={t.status} onChange={e => {
                const ns = e.target.value;
                if (ns === "Needs Approval" && canRequestApproval) { setApprovalTxt(""); setApprovalPhotos([]); setPendingApprovalTask(t); onClose(); }
                else if (ns !== t.status) advance(t.id, ns);
              }}>
                <option value="Open">{STATUS_LABEL["Open"]}</option>
                <option value="In Progress">{STATUS_LABEL["In Progress"]}</option>
                {canRequestApproval && <option value="Needs Approval">{STATUS_LABEL["Needs Approval"]}</option>}
              </select>}
          </div>}

          {t.desc && <div style={{marginBottom:14}}>
            <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6}}>Descripción</div>
            <div className="note-box">{t.desc}</div>
          </div>}

          {canViewSensitive && t.approvalComment && <div style={{marginBottom:14}}>
            <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6}}>Nota de aprobación</div>
            <div className="approval-box">{t.approvalComment}</div>
          </div>}

          {canViewSensitive && (t.approvalPhotos || []).length > 0 && <div style={{marginBottom:14}}>
            <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6}}>Fotos de aprobación</div>
            <div className="photo-grid">{t.approvalPhotos.map((p, i) => <PhotoThumb key={i} photo={p} onOpen={onOpenLightbox}/>)}</div>
          </div>}

          {(t.photos || []).length > 0 && <div style={{marginBottom:14}}>
            <div style={{fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6}}>Fotos</div>
            <div className="photo-grid">{t.photos.map((p, i) => <PhotoThumb key={i} photo={p} onOpen={onOpenLightbox}/>)}</div>
          </div>}
        </>}

        {taskTab === "comments" && <>
          {comments.length === 0 && legacyNotes.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:30}}>Sin comentarios aún</div>}
          {legacyNotes.map((n, i) => <div key={"ln" + i} className="comment-item">
            <Av name="?" size={28} bg="#ccc"/>
            <div className="comment-bubble"><div className="comment-header"><span className="comment-author">Nota</span></div><div className="comment-text">{n}</div></div>
          </div>)}
          {comments.map((c, i) => {
            const u = users.find(x => x.name === c.author);
            const bg = ROLE_META[u?.role]?.bg || "#888";
            return <div key={i} className="comment-item">
              <Av name={c.author} size={28} bg={bg}/>
              <div className="comment-bubble">
                <div className="comment-header"><span className="comment-author">{c.author}</span><span className="comment-date">{fmtDate(c.date)}</span></div>
                {c.text && <div className="comment-text">{c.text}</div>}
                {c.photos && c.photos.length > 0 && <div className="comment-photos">{c.photos.map((p, j) => <PhotoThumb key={j} photo={p} onOpen={onOpenLightbox}/>)}</div>}
              </div>
            </div>;
          })}
          <div style={{marginTop:8, background:"#f8f8f8", borderRadius:12, padding:12}}>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Escribe un comentario..." style={{width:"100%", fontSize:13, border:"1.5px solid #e8e8e8", borderRadius:8, padding:"10px 12px", background:"#fff", minHeight:60, resize:"vertical", lineHeight:1.5, outline:"none"}}/>
            <PhotoUpload photos={commentPhotos} setPhotos={setCommentPhotos}/>
            <button onClick={sendComment} disabled={sending || (!commentText.trim() && commentPhotos.length === 0)} style={{marginTop:10, width:"100%", padding:10, borderRadius:10, border:"none", background:(commentText.trim() || commentPhotos.length > 0) ? "#534AB7" : "#e0e0e0", color:(commentText.trim() || commentPhotos.length > 0) ? "#fff" : "#aaa", fontSize:13, fontWeight:600, cursor:"pointer"}}>{sending ? "Enviando..." : "Enviar comentario"}</button>
          </div>
        </>}

        {taskTab === "history" && <>
          {history.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:30}}>Sin historial aún</div>}
          {[...history].reverse().filter(h => canViewSensitive || !h.action.includes("aprobación")).map((h, i) =>
            <div key={i} className="history-item">
              <div className="history-dot" style={{background:h.action.includes("Resuelta") ? "#1D9E75" : h.action.includes("Aprobada") ? "#378ADD" : h.action.includes("Rechazad") ? "#A32D2D" : h.action.includes("creada") ? "#534AB7" : "#BA7517"}}/>
              <div><div className="history-text"><strong>{h.by}</strong> — {h.action}</div><div className="history-date">{fmtDate(h.date)}</div></div>
            </div>
          )}
        </>}
      </div>

      {taskTab === "details" && <div className="modal-sheet-bottom">
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {canResolve && !isBlocked && !["Resolved"].includes(t.status) && <button className="btn-green" onClick={() => setShowResolve(true)}>Marcar como resuelta</button>}
          {canResolve && t.status === "Approved" && <button className="btn-green" onClick={() => setShowResolve(true)}>Marcar como resuelta</button>}
          {t.status === "Needs Approval" && canApprove && <div className="btn-row">
            <button className="btn-red" onClick={() => { advance(t.id, "In Progress", {approvalComment:"", _hist:[hEntry("Rechazada")]}); onClose(); }}>Rechazar</button>
            <button className="btn-primary" onClick={() => { advance(t.id, "Approved", {_hist:[hEntry("Aprobada")]}); onClose(); }}>Aprobar</button>
          </div>}
          {t.status === "Needs Approval" && !canApprove && canViewApprovals && <div style={{background:"#EEEDFE", borderRadius:10, padding:"11px 13px", fontSize:13, color:"#3C3489", textAlign:"center"}}>Pendiente de aprobación del administrador</div>}
          <div className="btn-row">
            {canRequestApproval && !isBlocked && !["Resolved","Approved"].includes(t.status) && <button className="btn-secondary" onClick={() => { setApprovalTxt(""); setApprovalPhotos([]); setPendingApprovalTask(t); onClose(); }}>Solicitar aprobación</button>}
            <button className="btn-secondary" onClick={() => setTaskTab("comments")}>Comentar</button>
          </div>
          {isAdmin && <><div className="modal-divider" style={{margin:"4px 0"}}/><button className="btn-red" onClick={() => { removeTask(t.id); onClose(); }}>Eliminar tarea</button></>}
        </div>
      </div>}
    </div>
  </div>;
}
