import { useState, useEffect } from "react";
import { CLEANING_TYPE_LABEL, ITEM_STATUS_ICON } from "../../lib/constants";
import { fmtDate, fmtDuration } from "../../lib/dateHelpers";
import { CleaningComments } from "./CleaningComments";

export function CleaningDetailSheet({cleaning, db, role, onClose}) {
  const [items, setItems] = useState(null);
  const [comments, setComments] = useState([]);
  const [openRooms, setOpenRooms] = useState({});
  const [typeOverride, setTypeOverride] = useState(null);
  const [savingType, setSavingType] = useState(false);

  function toggleRoom(roomId) {
    setOpenRooms(o => ({...o, [roomId]:!o[roomId]}));
  }

  const currentType = typeOverride || cleaning.cleaningType || "checkout";

  async function changeType() {
    const next = currentType === "daily" ? "checkout" : "daily";
    setSavingType(true);
    try {
      await db.collection("cleanings").doc(cleaning.id).update({cleaningType:next});
      setTypeOverride(next);
    } catch (e) {
      alert("Error: " + e.message);
    }
    setSavingType(false);
  }

  useEffect(() => {
    db.collection("cleanings").doc(cleaning.id).collection("items").get().then(s => setItems(s.docs.map(d => ({id:d.id, ...d.data()}))));
    db.collection("cleanings").doc(cleaning.id).collection("comments").orderBy("createdAt", "asc").get().then(s => setComments(s.docs.map(d => ({id:d.id, ...d.data()}))));
  }, [cleaning.id]);

  const commentsByRoom = {};
  comments.forEach(c => { (commentsByRoom[c.roomId] = commentsByRoom[c.roomId] || []).push(c); });

  const roomsMap = {};
  (items || []).forEach(it => {
    if (!roomsMap[it.roomId]) roomsMap[it.roomId] = {roomId:it.roomId, roomLabel:it.roomLabel, roomOrder:it.roomOrder || 0, items:[]};
    roomsMap[it.roomId].items.push(it);
  });
  const groupedRooms = Object.values(roomsMap).sort((a, b) => a.roomOrder - b.roomOrder).map(r => ({...r, items:r.items.sort((a, b) => (a.itemOrder || 0) - (b.itemOrder || 0))}));

  const flaggedCount = (items || []).filter(i => i.status === "red").length;
  const done = (items || []).filter(i => i.status && i.status !== "pending").length;
  const total = (items || []).length;

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">{cleaning.property}</div>
        <div style={{marginBottom:4, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
          <span className="badge" style={{background:"#E6F1FB", color:"#185FA5"}}>{CLEANING_TYPE_LABEL[currentType]}</span>
          {role === "admin" && <button disabled={savingType} onClick={changeType} style={{fontSize:11, padding:"4px 10px", borderRadius:20, border:"1px solid #ddd", background:"#fff", color:"#534AB7", cursor:savingType ? "default" : "pointer"}}>
            {savingType ? "Guardando…" : `Cambiar a ${currentType === "daily" ? "Salida" : "Diaria"}`}
          </button>}
        </div>
        <div className="modal-sub">Iniciada {fmtDate(cleaning.startedAt)} · Finalizada {fmtDate(cleaning.completedAt)} · {done}/{total} tareas{flaggedCount > 0 ? ` · ${flaggedCount} reportadas` : ""}</div>

        {items === null && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:30}}>Cargando…</div>}

        {items !== null && groupedRooms.map(room => {
          const timestamps = room.items.map(i => i.checkedAt).filter(Boolean).sort();
          const duration = timestamps.length >= 2 ? new Date(timestamps[timestamps.length - 1]) - new Date(timestamps[0]) : null;
          const doneInRoom = room.items.filter(i => i.status && i.status !== "pending").length;
          const flaggedInRoom = room.items.filter(i => i.status === "red").length;
          const isOpen = !!openRooms[room.roomId];
          return <div key={room.roomId} style={{marginBottom:10, border:"0.5px solid rgba(0,0,0,0.08)", borderRadius:10, overflow:"hidden"}}>
            <div onClick={() => toggleRoom(room.roomId)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", cursor:"pointer", background:"#fafafa"}}>
              <div style={{display:"flex", alignItems:"center", gap:9, minWidth:0}}>
                <span style={{fontSize:11, color:"#888", display:"inline-block", transition:"transform 0.15s", transform:isOpen ? "rotate(90deg)" : "rotate(0deg)"}}>▸</span>
                <span style={{fontSize:14, fontWeight:600}}>{room.roomLabel}</span>
                {flaggedInRoom > 0 && <span style={{fontSize:10}}>🔴{flaggedInRoom}</span>}
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8, flexShrink:0}}>
                {duration != null && <span style={{fontSize:11, color:"#aaa"}}>~{fmtDuration(duration)}</span>}
                <span style={{fontSize:12, fontWeight:700, color:"#888"}}>{doneInRoom}/{room.items.length}</span>
              </div>
            </div>
            {isOpen && <div style={{padding:"2px 14px 8px"}}>
              {room.items.map(i => (
                <div key={i.id} style={{padding:"7px 0", borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <span style={{fontSize:14}}>{ITEM_STATUS_ICON[i.status] || "⬜"}</span>
                    <span style={{fontSize:13.5, color:i.status === "pending" || !i.status ? "#aaa" : "#333", flex:1, minWidth:0}}>{i.itemLabel}</span>
                  </div>
                  {i.note && <div style={{fontSize:11.5, color:"#BA7517", marginLeft:22, marginTop:2}}>"{i.note}"</div>}
                  {i.checkedByName && <div style={{fontSize:10, color:"#aaa", marginLeft:22, marginTop:2}}>{i.checkedByName} · {fmtDate(i.checkedAt)}</div>}
                </div>
              ))}
              {(commentsByRoom[room.roomId] || []).length > 0 && <div style={{marginTop:8, paddingTop:8, borderTop:"0.5px solid rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:10.5, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:6}}>Comentarios</div>
                <CleaningComments comments={commentsByRoom[room.roomId]} readOnly/>
              </div>}
            </div>}
          </div>;
        })}

        {(commentsByRoom["__general__"] || []).length > 0 && <>
          <div className="section-label" style={{marginTop:20}}>Comentarios generales</div>
          <div style={{background:"#fff", borderRadius:10, padding:"12px 14px", marginBottom:14, border:"0.5px solid rgba(0,0,0,0.07)"}}>
            <CleaningComments comments={commentsByRoom["__general__"]} readOnly/>
          </div>
        </>}

        <div className="section-label">Firmas</div>
        {(cleaning.workers || []).length === 0 && <div style={{fontSize:13, color:"#aaa"}}>Sin firmas registradas</div>}
        {(cleaning.workers || []).map((w, i) => (
          <div key={i} style={{display:"flex", alignItems:"center", gap:12, background:"#f8f8f8", borderRadius:10, padding:"10px 12px", marginBottom:8}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:600}}>{w.name}</div>
              <div style={{fontSize:11, color:"#888"}}>{w.signedAt ? fmtDate(w.signedAt) : "Sin firmar"}</div>
            </div>
            {w.signatureUrl && <img src={w.signatureUrl} style={{width:90, height:38, objectFit:"contain", background:"#fff", borderRadius:6, border:"0.5px solid #ddd"}}/>}
          </div>
        ))}

        <div style={{fontSize:11, color:"#aaa", marginTop:10}}>Registrada por {cleaning.createdBy || "—"}</div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row"><button className="btn-secondary" onClick={onClose} style={{width:"100%"}}>Cerrar</button></div>
      </div>
    </div>
  </div>;
}
