import { useState, useEffect } from "react";
import { CLEANING_TYPE_LABEL, ROLE_META } from "../../lib/constants";
import { fmtDate } from "../../lib/dateHelpers";
import { Av } from "../shared/Avatar";
import { SignaturePad } from "../shared/SignaturePad";
import { ItemRow } from "./ItemRow";
import { CleaningComments } from "./CleaningComments";

export function CleaningSheet({cleaningId, property, db, currentUser, users, joinCleaningWorker, removeCleaningWorker, setItemStatus, signCleaningWorker, cancelCleaning, addCleaningComment, onClose}) {
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [comments, setComments] = useState([]);
  const [addingWorker, setAddingWorker] = useState(false);
  const [signingIdx, setSigningIdx] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [openRooms, setOpenRooms] = useState({});

  function toggleRoom(roomId) {
    setOpenRooms(o => ({...o, [roomId]:!o[roomId]}));
  }

  useEffect(() => {
    const u1 = db.collection("cleanings").doc(cleaningId).onSnapshot(d => setSession(d.data() || null));
    const u2 = db.collection("cleanings").doc(cleaningId).collection("items").onSnapshot(s => setItems(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const u3 = db.collection("cleanings").doc(cleaningId).collection("comments").orderBy("createdAt", "asc").onSnapshot(s => setComments(s.docs.map(d => ({id:d.id, ...d.data()}))));
    return () => { u1(); u2(); u3(); };
  }, [cleaningId]);

  if (!session) return <div className="modal-overlay" onClick={onClose}><div className="modal-sheet" onClick={e => e.stopPropagation()}><div className="modal-handle"/><div className="modal-sheet-scroll" style={{textAlign:"center", color:"#aaa", padding:40}}>Cargando…</div></div></div>;

  const workers = session.workers || [];
  const completed = session.status === "completed";
  const isDaily = session.cleaningType === "daily";
  const eligibleToAdd = users.filter(u => ["cleaning","maintenance","supervisor","admin"].includes(u.role) && !workers.some(w => w.userId === u.id));

  const roomsMap = {};
  items.forEach(it => {
    if (!roomsMap[it.roomId]) roomsMap[it.roomId] = {roomId:it.roomId, roomLabel:it.roomLabel, roomOrder:it.roomOrder || 0, items:[]};
    roomsMap[it.roomId].items.push(it);
  });
  const groupedRooms = Object.values(roomsMap).sort((a, b) => a.roomOrder - b.roomOrder).map(r => ({...r, items:r.items.sort((a, b) => (a.itemOrder || 0) - (b.itemOrder || 0))}));

  const commentsByRoom = {};
  comments.forEach(c => { (commentsByRoom[c.roomId] = commentsByRoom[c.roomId] || []).push(c); });

  function saveSignature(idx, dataUrl) {
    signCleaningWorker(cleaningId, workers, idx, dataUrl);
    setSigningIdx(null);
  }

  async function handleCancel() {
    if (!window.confirm("¿Borrar esta limpieza? Se eliminará todo lo marcado y cualquier tarea de mantenimiento reportada desde aquí. Esto no se puede deshacer.")) return;
    setCancelling(true);
    try {
      await cancelCleaning(cleaningId);
      onClose();
    } catch (e) {
      alert("Error: " + e.message);
      setCancelling(false);
    }
  }

  return <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-sheet-scroll">
          <div className="modal-title">{CLEANING_TYPE_LABEL[isDaily ? "daily" : "checkout"]} — {property}</div>
          <div className="modal-sub">Iniciada {fmtDate(session.startedAt)} · {session.doneItems || 0}/{session.totalItems || items.length} {isDaily ? "espacios limpios" : "tareas revisadas"}</div>

          {completed && <div style={{background:"#EAF3DE", color:"#3B6D11", borderRadius:10, padding:"10px 12px", fontSize:13, fontWeight:600, marginBottom:14}}>✓ Limpieza completada — {fmtDate(session.completedAt)}</div>}

          {isDaily ? groupedRooms.map(room => {
            const item = room.items[0];
            const done = item && item.status === "green";
            return <div key={room.roomId} style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:"14px 16px", marginBottom:8, borderRadius:10, background:"#fff", border:"0.5px solid rgba(0,0,0,0.08)"}}>
              <span style={{fontSize:15, fontWeight:600, color:done ? "#1D9E75" : "#1a1a1a"}}>{room.roomLabel}</span>
              <button disabled={completed || !item} onClick={() => setItemStatus(cleaningId, item.id, done ? "pending" : "green", "", {property, roomLabel:room.roomLabel, itemLabel:item.itemLabel})}
                style={{minWidth:104, padding:"11px 0", borderRadius:10, border:"none", background:done ? "#1D9E75" : "#534AB7", color:"#fff", fontSize:13.5, fontWeight:700, cursor:completed ? "default" : "pointer", flexShrink:0}}>
                {done ? "✓ Limpio" : "Limpio"}
              </button>
            </div>;
          }) : groupedRooms.map(room => {
            const doneInRoom = room.items.filter(i => i.status !== "pending").length;
            const flaggedInRoom = room.items.filter(i => i.status === "red").length;
            const isOpen = !!openRooms[room.roomId];
            const allDone = doneInRoom === room.items.length;
            return <div key={room.roomId} style={{marginBottom:10, border:"0.5px solid rgba(0,0,0,0.08)", borderRadius:10, overflow:"hidden", background:"#fff"}}>
              <div onClick={() => toggleRoom(room.roomId)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", cursor:"pointer", background:"#fafafa"}}>
                <div style={{display:"flex", alignItems:"center", gap:9, minWidth:0}}>
                  <span style={{fontSize:11, color:"#888", display:"inline-block", transition:"transform 0.15s", transform:isOpen ? "rotate(90deg)" : "rotate(0deg)"}}>▸</span>
                  <span style={{fontSize:14, fontWeight:600}}>{room.roomLabel}</span>
                  {flaggedInRoom > 0 && <span style={{fontSize:10}}>🔴{flaggedInRoom}</span>}
                </div>
                <div style={{fontSize:12, fontWeight:700, color:allDone ? "#1D9E75" : "#aaa", flexShrink:0}}>{doneInRoom}/{room.items.length}</div>
              </div>
              {isOpen && <div style={{padding:"2px 14px 10px"}}>
                {room.items.map(item => <ItemRow key={item.id} item={item} cleaningId={cleaningId} setItemStatus={setItemStatus} disabled={completed} meta={{property, roomLabel:room.roomLabel, itemLabel:item.itemLabel}}/>)}
                <div style={{marginTop:8, paddingTop:8, borderTop:"0.5px solid rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:10.5, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:6}}>Comentarios</div>
                  <CleaningComments comments={commentsByRoom[room.roomId]} readOnly={completed} onAdd={text => addCleaningComment(cleaningId, room.roomId, text)}/>
                </div>
              </div>}
            </div>;
          })}

          <div className="section-label" style={{marginTop:20}}>Comentarios generales</div>
          <div style={{background:"#fff", borderRadius:10, padding:"12px 14px", marginBottom:14, border:"0.5px solid rgba(0,0,0,0.07)"}}>
            <CleaningComments comments={commentsByRoom["__general__"]} readOnly={completed} onAdd={text => addCleaningComment(cleaningId, "__general__", text)}/>
          </div>

          <div className="section-label">Personal presente</div>
          {workers.map((w, idx) => (
            <div key={w.userId} style={{display:"flex", alignItems:"center", gap:10, background:"#f8f8f8", borderRadius:10, padding:"10px 12px", marginBottom:8}}>
              <Av name={w.name} size={32} bg={ROLE_META[w.role]?.bg || "#888"}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:600}}>{w.name}</div>
                <div style={{fontSize:11, color:w.signature ? "#1D9E75" : "#888"}}>{w.signature ? `Firmado ${fmtDate(w.signedAt)}` : "Pendiente de firma"}</div>
              </div>
              {w.signature
                ? <img src={w.signature} style={{width:60, height:26, objectFit:"contain", background:"#fff", borderRadius:4, border:"0.5px solid #ddd"}}/>
                : !completed && <button onClick={() => setSigningIdx(idx)} style={{background:"#534AB7", color:"#fff", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer"}}>Firmar</button>}
              {!completed && workers.length > 1 && !w.signature && <button onClick={() => removeCleaningWorker(cleaningId, workers, idx)} style={{background:"none", border:"none", color:"#A32D2D", fontSize:18, cursor:"pointer", padding:"0 4px"}}>×</button>}
            </div>
          ))}

          {!completed && !addingWorker && eligibleToAdd.length > 0 && <button onClick={() => setAddingWorker(true)} style={{background:"none", border:"1.5px dashed #ccc", borderRadius:10, padding:"9px 0", width:"100%", color:"#534AB7", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:2}}>+ Agregar trabajador</button>}
          {!completed && addingWorker && <div className="field" style={{marginTop:6}}>
            <select value="" onChange={e => { const u = users.find(x => x.id === e.target.value); if (u) { joinCleaningWorker(cleaningId, workers, u); setAddingWorker(false); } }}>
              <option value="">Selecciona un trabajador…</option>
              {eligibleToAdd.map(u => <option key={u.id} value={u.id}>{u.name} — {ROLE_META[u.role]?.label}</option>)}
            </select>
          </div>}
        </div>
        <div className="modal-sheet-bottom">
          {!completed && <div className="btn-row" style={{marginBottom:8}}>
            <button onClick={handleCancel} disabled={cancelling} style={{width:"100%", background:"#FCEBEB", color:"#A32D2D", border:"0.5px solid #F09595", borderRadius:10, padding:"11px 0", fontSize:13, fontWeight:600, cursor:"pointer"}}>{cancelling ? "Borrando…" : "Cancelar y borrar limpieza (pruebas)"}</button>
          </div>}
          <div className="btn-row">
            <button className="btn-primary" onClick={onClose} disabled={cancelling} style={{width:"100%"}}>{completed ? "Listo" : "Cerrar (guardado automáticamente)"}</button>
          </div>
        </div>
      </div>
    </div>
    {signingIdx !== null && <SignaturePad label={workers[signingIdx]?.name} onSave={dataUrl => saveSignature(signingIdx, dataUrl)} onCancel={() => setSigningIdx(null)}/>}
  </>;
}
