import { isSundayISO } from "../../lib/firestoreHelpers";

export function PTODatesModal({request, dayCount, onClose}) {
  const dates = [...(request.selectedDays||[])].sort();
  const totalRaw = dates.length;
  const sundayCount = totalRaw - dayCount;
  function fmtDayFull(iso) {
    return new Date(iso+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  }
  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">{request.userName}</div>
        <div className="modal-sub">{dayCount} día{dayCount!==1?"s":""} de vacaciones{sundayCount>0?` · ${totalRaw} fechas seleccionadas (${sundayCount} domingo${sundayCount!==1?"s":""} no ${sundayCount!==1?"cuentan":"cuenta"})`:""}</div>
        {request.reason&&<div style={{fontSize:12,color:"#555",marginBottom:14,background:"#f8f8f8",borderRadius:8,padding:"8px 12px"}}>{request.reason}</div>}
        {totalRaw===0&&<div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:20}}>Sin fechas.</div>}
        {dates.map(d=>{
          const sunday=isSundayISO(d);
          return <div key={d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",marginBottom:6,borderRadius:8,background:sunday?"#f5f5f5":"#F7F6FE",border:sunday?"0.5px solid #eee":"0.5px solid #E4E1FA"}}>
            <span style={{fontSize:13,fontWeight:600,color:sunday?"#aaa":"#333",textTransform:"capitalize"}}>{fmtDayFull(d)}</span>
            {sunday&&<span style={{fontSize:10,color:"#999",fontWeight:700,background:"#eee",padding:"2px 8px",borderRadius:20,flexShrink:0,marginLeft:8}}>No cuenta</span>}
          </div>;
        })}
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row"><button className="btn-secondary" onClick={onClose} style={{width:"100%"}}>Cerrar</button></div>
      </div>
    </div>
  </div>;
}
