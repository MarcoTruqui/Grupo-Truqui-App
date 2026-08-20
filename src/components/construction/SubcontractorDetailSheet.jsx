import { useState } from "react";
import { todayISO } from "../../lib/dateHelpers";

function fmtMoney(n) { return "$" + (Number(n) || 0).toLocaleString("es-MX", {minimumFractionDigits:2, maximumFractionDigits:2}); }
function fmtDate(iso) { if (!iso) return ""; return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {day:"numeric", month:"short", year:"numeric"}); }

export function SubcontractorDetailSheet({sub, updateSubcontractor, removeSubcontractor, addSubPayment, removeSubPayment, onClose}) {
  const [name, setName] = useState(sub.name);
  const [trade, setTrade] = useState(sub.trade);
  const [totalBudget, setTotalBudget] = useState(sub.totalBudget);
  const [savingInfo, setSavingInfo] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(todayISO());
  const [payNote, setPayNote] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  const payments = sub.payments || [];
  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const remaining = (Number(totalBudget) || 0) - totalPaid;
  const pct = totalBudget > 0 ? Math.min(100, (totalPaid / totalBudget) * 100) : 0;

  async function handleSaveInfo() {
    if (!name.trim() || !trade.trim()) return;
    setSavingInfo(true);
    await updateSubcontractor(sub.id, {name:name.trim(), trade:trade.trim(), totalBudget:Number(totalBudget) || 0});
    setSavingInfo(false);
  }

  async function handleAddPayment() {
    if (!payAmount || Number(payAmount) <= 0) return;
    setSavingPayment(true);
    await addSubPayment(sub.id, payments, payAmount, payDate, payNote);
    setPayAmount(""); setPayNote("");
    setSavingPayment(false);
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">{sub.name}</div>
        <div className="modal-sub">{sub.trade}</div>

        <div style={{background:"#f8f8f8", borderRadius:12, padding:14, marginBottom:16}}>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, marginBottom:6}}>
            <span>{fmtMoney(totalPaid)} pagado</span>
            <span style={{color:remaining < 0 ? "#A32D2D" : "#888"}}>{remaining < 0 ? "Excedido " : "Resta "}{fmtMoney(Math.abs(remaining))}</span>
          </div>
          <div style={{background:"#e6e6e6", borderRadius:6, height:10, overflow:"hidden"}}>
            <div style={{width:`${pct}%`, height:"100%", background:remaining < 0 ? "#D85A30" : "#E87A30", borderRadius:6}}/>
          </div>
          <div style={{fontSize:11, color:"#aaa", marginTop:6}}>de {fmtMoney(totalBudget)} presupuestados</div>
        </div>

        <div className="field"><label>Nombre</label><input value={name} onChange={e => setName(e.target.value)}/></div>
        <div className="field"><label>Oficio</label><input value={trade} onChange={e => setTrade(e.target.value)}/></div>
        <div className="field"><label>Presupuesto total (MXN)</label><input type="number" min="0" step="0.01" value={totalBudget} onChange={e => setTotalBudget(e.target.value)}/></div>
        <button className="btn-secondary" style={{marginBottom:20}} onClick={handleSaveInfo}>{savingInfo ? "Guardando…" : "Guardar cambios"}</button>

        <div className="modal-divider"/>

        <div className="section-label">Registrar pago</div>
        <div style={{display:"flex", gap:8, marginBottom:8}}>
          <div className="field" style={{flex:1, marginBottom:0}}><input type="number" min="0" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Monto"/></div>
          <div className="field" style={{flex:1, marginBottom:0}}><input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}/></div>
        </div>
        <div className="field"><input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Nota (opcional)"/></div>
        <button className="btn-primary" style={{marginBottom:20, opacity:payAmount && Number(payAmount) > 0 ? 1 : 0.5}} onClick={handleAddPayment}>{savingPayment ? "Guardando…" : "+ Agregar pago"}</button>

        <div className="section-label">Historial de pagos</div>
        {payments.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:16}}>Sin pagos registrados.</div>}
        {[...payments].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((p, i) => {
          const origIdx = payments.indexOf(p);
          return <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"0.5px solid #f0f0f0"}}>
            <div>
              <div style={{fontSize:13, fontWeight:600}}>{fmtMoney(p.amount)}</div>
              <div style={{fontSize:11, color:"#888"}}>{fmtDate(p.date)}{p.note ? " · " + p.note : ""} · {p.recordedBy}</div>
            </div>
            <button onClick={() => { if (confirm("¿Eliminar este pago?")) removeSubPayment(sub.id, payments, origIdx); }} style={{background:"none", border:"none", color:"#A32D2D", fontSize:11, cursor:"pointer"}}>Eliminar</button>
          </div>;
        })}

        <button className="btn-red" style={{marginTop:24}} onClick={() => { if (confirm("¿Eliminar este subcontratista? Se perderá su historial de pagos.")) { removeSubcontractor(sub.id); onClose(); } }}>Eliminar subcontratista</button>
      </div>
      <div className="modal-sheet-bottom">
        <button className="btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  </div>;
}
