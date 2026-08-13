import { ROLE_META } from "../../lib/constants";
import { Av } from "../shared/Avatar";
import { PTOStatusBadge } from "./PTOStatusBadge";

export function DayVacationModal({date, people, onClose}) {
  function fmtDayFull(iso) {
    return new Date(iso+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  }
  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{height:"auto",borderRadius:20}}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll" style={{paddingBottom:20}}>
        <div className="modal-title" style={{textTransform:"capitalize"}}>{fmtDayFull(date)}</div>
        <div className="modal-sub">{people.length} persona{people.length!==1?"s":""} de vacaciones</div>
        {people.map((p,idx)=>{
          const meta=ROLE_META[p.role]||{label:p.role,bg:"#888",color:"#fff"};
          return <div key={idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",marginBottom:8,borderRadius:10,background:"#f8f8f8"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Av name={p.name} size={32} bg={meta.bg}/>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{p.name}</div>
                <div style={{fontSize:11,color:"#888"}}>{meta.label}</div>
              </div>
            </div>
            <PTOStatusBadge status={p.status}/>
          </div>;
        })}
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row"><button className="btn-secondary" onClick={onClose} style={{width:"100%"}}>Cerrar</button></div>
      </div>
    </div>
  </div>;
}
