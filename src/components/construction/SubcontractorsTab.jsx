import { useState } from "react";
import { AddSubcontractorSheet } from "./AddSubcontractorSheet";
import { SubcontractorDetailSheet } from "./SubcontractorDetailSheet";

function fmtMoney(n) { return "$" + (Number(n) || 0).toLocaleString("es-MX", {minimumFractionDigits:0, maximumFractionDigits:0}); }

export function SubcontractorsTab({projectId, subcontractors, addSubcontractor, updateSubcontractor, removeSubcontractor, addSubPayment, removeSubPayment}) {
  const [addOpen, setAddOpen] = useState(false);
  const [selId, setSelId] = useState(null);
  const selected = subcontractors.find(s => s.id === selId);

  const totalBudget = subcontractors.reduce((s, x) => s + (Number(x.totalBudget) || 0), 0);
  const totalPaid = subcontractors.reduce((s, x) => s + (x.payments || []).reduce((a, p) => a + (Number(p.amount) || 0), 0), 0);
  const totalRemaining = totalBudget - totalPaid;

  return <div>
    <button className="btn-primary" style={{marginBottom:16}} onClick={() => setAddOpen(true)}>+ Agregar subcontratista</button>

    {subcontractors.length > 0 && <div style={{background:"#fff", borderRadius:14, padding:16, marginBottom:16, border:"0.5px solid rgba(0,0,0,0.07)"}}>
      <div className="section-label" style={{marginBottom:12}}>Resumen del proyecto</div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, textAlign:"center"}}>
        <div>
          <div style={{fontSize:16, fontWeight:700, color:"#1a1a1a"}}>{fmtMoney(totalBudget)}</div>
          <div style={{fontSize:10, color:"#888"}}>Contratado</div>
        </div>
        <div>
          <div style={{fontSize:16, fontWeight:700, color:"#E87A30"}}>{fmtMoney(totalPaid)}</div>
          <div style={{fontSize:10, color:"#888"}}>Pagado</div>
        </div>
        <div>
          <div style={{fontSize:16, fontWeight:700, color:totalRemaining < 0 ? "#A32D2D" : "#1D9E75"}}>{fmtMoney(totalRemaining)}</div>
          <div style={{fontSize:10, color:"#888"}}>Restante</div>
        </div>
      </div>
    </div>}

    <div className="section-label">Subcontratistas</div>
    {subcontractors.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>Sin subcontratistas registrados aún.</div>}
    {subcontractors.map(s => {
      const paid = (s.payments || []).reduce((a, p) => a + (Number(p.amount) || 0), 0);
      const pct = s.totalBudget > 0 ? Math.min(100, (paid / s.totalBudget) * 100) : 0;
      return <div key={s.id} className="task-item" onClick={() => setSelId(s.id)}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
          <div>
            <div className="task-title" style={{marginBottom:2}}>{s.name}</div>
            <div className="task-prop" style={{marginBottom:0}}>{s.trade}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13, fontWeight:700, color:"#E87A30"}}>{fmtMoney(paid)}</div>
            <div style={{fontSize:10, color:"#888"}}>de {fmtMoney(s.totalBudget)}</div>
          </div>
        </div>
        <div style={{background:"#f0f0f0", borderRadius:6, height:8, overflow:"hidden"}}>
          <div style={{width:`${pct}%`, height:"100%", background:paid > s.totalBudget ? "#D85A30" : "#E87A30", borderRadius:6}}/>
        </div>
      </div>;
    })}

    {addOpen && <AddSubcontractorSheet projectId={projectId} addSubcontractor={addSubcontractor} onClose={() => setAddOpen(false)}/>}
    {selected && <SubcontractorDetailSheet sub={selected} updateSubcontractor={updateSubcontractor} removeSubcontractor={removeSubcontractor} addSubPayment={addSubPayment} removeSubPayment={removeSubPayment} onClose={() => setSelId(null)}/>}
  </div>;
}
