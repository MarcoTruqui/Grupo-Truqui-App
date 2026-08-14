import { ROLE_META } from "../../lib/constants";
import { Av } from "../shared/Avatar";
import { PTOStatusBadge } from "./PTOStatusBadge";

export function BlockDetailModal({block, onClose}) {
  const meta = ROLE_META[block.role] || {label:block.role, bg:"#888"};
  function fmtDayFull(iso) {
    return new Date(iso+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  }
  const sameDay = block.startDate === block.endDate;
  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{height:"auto",borderRadius:20}}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <Av name={block.name} size={36} bg={meta.bg}/>
          <div>
            <div className="modal-title" style={{marginBottom:0}}>{block.name}</div>
            <div style={{fontSize:12,color:"#888"}}>{meta.label}</div>
          </div>
        </div>
        <div className="modal-sub" style={{textTransform:"capitalize",marginTop:10}}>
          {sameDay ? fmtDayFull(block.startDate) : <>{fmtDayFull(block.startDate)} → {fmtDayFull(block.endDate)}</>}
        </div>
        <div style={{marginTop:10}}><PTOStatusBadge status={block.status}/></div>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row"><button className="btn-secondary" onClick={onClose} style={{width:"100%"}}>Cerrar</button></div>
      </div>
    </div>
  </div>;
}
