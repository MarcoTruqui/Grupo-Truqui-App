const PTO_STATUS_META_G = {
  pending_supervisor:{label:"Pend. Supervisor",bg:"#FAEEDA",color:"#854F0B",dot:"#BA7517"},
  pending_admin:{label:"Pend. Admin",bg:"#EEEDFE",color:"#3C3489",dot:"#534AB7"},
  approved:{label:"Aprobado",bg:"#EAF3DE",color:"#3B6D11",dot:"#1D9E75"},
  declined:{label:"Denegado",bg:"#FCEBEB",color:"#A32D2D",dot:"#D85A30"},
  cancelled:{label:"Cancelado",bg:"#F2F2F2",color:"#777",dot:"#aaa"}
};

export function PTOStatusBadge({status}) {
  const m=PTO_STATUS_META_G[status]||{label:status,bg:"#eee",color:"#333",dot:"#999"};
  return <span className="badge" style={{background:m.bg,color:m.color}}><span className="badge-dot" style={{background:m.dot}}/>{m.label}</span>;
}
