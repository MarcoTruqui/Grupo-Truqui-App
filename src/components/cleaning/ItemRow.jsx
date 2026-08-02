import { useState, useEffect } from "react";
import { ITEM_STATUS_COLOR } from "../../lib/constants";
import { fmtDate } from "../../lib/dateHelpers";

export function ItemRow({item, cleaningId, setItemStatus, meta, disabled}) {
  const [note, setNote] = useState(item.note || "");
  useEffect(() => { setNote(item.note || ""); }, [item.note]);

  function choose(status) {
    if (disabled) return;
    setItemStatus(cleaningId, item.id, status, note, meta);
  }

  function saveNote() {
    if (disabled) return;
    if (note !== (item.note || "")) setItemStatus(cleaningId, item.id, item.status, note, meta);
  }

  return <div style={{padding:"9px 0", borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}>
    <div style={{display:"flex", alignItems:"center", gap:10}}>
      <span style={{flex:1, minWidth:0, fontSize:13.5, color:item.status === "pending" ? "#333" : ITEM_STATUS_COLOR[item.status]}}>{item.itemLabel}</span>
      <div style={{display:"flex", gap:5, flexShrink:0}}>
        {["green","yellow","red"].map(s => (
          <button key={s} disabled={disabled} onClick={() => choose(s)} title={s === "green" ? "Hecho" : s === "yellow" ? "No hecho, se arreglará" : "No funciona — reportar"}
            style={{width:26, height:26, borderRadius:"50%", border:item.status === s ? `2px solid ${ITEM_STATUS_COLOR[s]}` : "1.5px solid #ddd", background:item.status === s ? ITEM_STATUS_COLOR[s] : "#fff", cursor:disabled ? "default" : "pointer", padding:0}}/>
        ))}
      </div>
    </div>
    {(item.status === "yellow" || item.status === "red") && <input value={note} disabled={disabled} onChange={e => setNote(e.target.value)} onBlur={saveNote}
      placeholder={item.status === "red" ? "¿Qué falla? (se reportará a mantenimiento)" : "Nota (ej. sin pilas)"}
      style={{marginTop:6, width:"100%", fontSize:12, padding:"6px 8px", borderRadius:6, border:"1px solid #e0e0e0"}}/>}
    {item.checkedByName && <div style={{fontSize:10, color:"#aaa", marginTop:3}}>{item.checkedByName} · {fmtDate(item.checkedAt)}</div>}
  </div>;
}
