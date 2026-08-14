import { STATUS_META, STATUS_LABEL, PRIORITY_META, PRIORITY_LABEL, ROLE_META } from "../../lib/constants";
import { OCCUPANCY_META, OCCUPANCY_LABEL } from "../../lib/bookingHelpers";

export function SBadge({status}) {
  const m = STATUS_META[status] || {bg:"#eee", color:"#333", dot:"#999"};
  return <span className="badge" style={{background:m.bg, color:m.color}}><span className="badge-dot" style={{background:m.dot}}/>{STATUS_LABEL[status] || status}</span>;
}

export function PBadge({priority}) {
  const m = PRIORITY_META[priority] || {bg:"#eee", color:"#333"};
  return <span className="badge" style={{background:m.bg, color:m.color}}>{PRIORITY_LABEL[priority] || priority}</span>;
}

export function AutoCleaningBadge() {
  return <span title="Creada automáticamente al marcar un elemento en rojo durante una limpieza" style={{fontSize:10, fontWeight:700, color:"#185FA5", background:"#E6F1FB", border:"0.5px solid #AFCFEE", padding:"2px 8px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:3}}>🧹 Auto-limpieza</span>;
}

export function RBadge({role}) {
  const m = ROLE_META[role] || {label:role, bg:"#888", color:"#fff"};
  return <span className="badge" style={{background:m.bg, color:m.color}}>{m.label}</span>;
}

export function OBadge({occupancy}) {
  const m = OCCUPANCY_META[occupancy];
  if (!m) return null;
  return <span className="badge" style={{background:m.bg, color:m.color}}><span className="badge-dot" style={{background:m.dot}}/>{OCCUPANCY_LABEL[occupancy]}</span>;
}
