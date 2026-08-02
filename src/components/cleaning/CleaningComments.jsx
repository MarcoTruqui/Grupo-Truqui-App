import { useState } from "react";
import { fmtDate } from "../../lib/dateHelpers";

export function CleaningComments({comments, onAdd, readOnly}) {
  const [draft, setDraft] = useState("");
  const list = comments || [];

  function submit() {
    const t = draft.trim();
    if (!t) return;
    onAdd(t);
    setDraft("");
  }

  return <div>
    {list.length === 0 && <div style={{fontSize:12, color:"#bbb", marginBottom:readOnly ? 0 : 8}}>Sin comentarios</div>}
    {list.map(c => <div key={c.id} style={{marginBottom:8}}>
      <div style={{fontSize:12.5, color:"#333", lineHeight:1.5}}>{c.text}</div>
      <div style={{fontSize:10, color:"#aaa", marginTop:1}}>{c.authorName} · {fmtDate(c.createdAt)}</div>
    </div>)}
    {!readOnly && <div style={{display:"flex", gap:6, marginTop:6}}>
      <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Agregar comentario…"
        style={{flex:1, fontSize:12, padding:"7px 9px", borderRadius:6, border:"1px solid #e0e0e0"}}
        onKeyDown={e => { if (e.key === "Enter") submit(); }}/>
      <button onClick={submit} disabled={!draft.trim()} style={{background:"#534AB7", color:"#fff", border:"none", borderRadius:6, padding:"0 12px", fontSize:12, fontWeight:600, cursor:draft.trim() ? "pointer" : "default", opacity:draft.trim() ? 1 : 0.5}}>Enviar</button>
    </div>}
  </div>;
}
