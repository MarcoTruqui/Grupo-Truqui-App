import { useState } from "react";
import { ROLE_META, COLOR_FRAMES } from "../../lib/constants";
import { todayISO } from "../../lib/dateHelpers";

const EMPLOYEE_ROLE_COLORS = {admin:"#534AB7", supervisor:"#1D9E75", maintenance:"#BA7517", cleaning:"#378ADD", office:"#D14D8A", construction:"#E87A30", purchasing:"#0D9DA7"};
const ROLE_ORDER = ["admin", "supervisor", "maintenance", "cleaning", "office", "construction", "purchasing"];

export function AddEmployeeSheet({allPropNames, propColorMap, addUser, onClose}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("maintenance");
  const [properties, setProperties] = useState([]);
  const [hireDate, setHireDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = name.trim() && username.trim() && password.length >= 6;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await addUser({name:name.trim(), username:username.trim(), password, role, properties, hireDate});
      onClose();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Agregar empleado</div>
        <div className="modal-sub">Crea su cuenta de acceso a la app</div>
        <div className="field"><label>Nombre completo</label><input value={name} onChange={e => setName(e.target.value)} placeholder="ej. Juan Pérez"/></div>
        <div className="field"><label>Usuario</label><input value={username} onChange={e => setUsername(e.target.value)} placeholder="ej. juanperez" style={{fontFamily:"monospace"}}/></div>
        <div className="field">
          <label>Contraseña</label>
          <div style={{position:"relative"}}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={{paddingRight:70}}/>
            <button type="button" onClick={() => setShowPassword(s => !s)} style={{position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#534AB7", fontSize:12, fontWeight:600, cursor:"pointer", padding:"4px 8px"}}>{showPassword ? "Ocultar" : "Mostrar"}</button>
          </div>
        </div>
        <div className="field">
          <label>Rol</label>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            {ROLE_ORDER.map(r => {
              const active = role === r;
              return <button key={r} onClick={() => setRole(r)} style={{padding:"9px 14px", borderRadius:10, border:active ? `2px solid ${EMPLOYEE_ROLE_COLORS[r]}` : "1.5px solid #e0e0e0", background:active ? EMPLOYEE_ROLE_COLORS[r] : "#fafafa", color:active ? "#fff" : "#666", fontSize:13, cursor:"pointer", fontWeight:active ? 700 : 400}}>{ROLE_META[r].label}</button>;
            })}
          </div>
        </div>
        <div className="field">
          <label>Propiedades asignadas</label>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {allPropNames.map(p => {
              const sel = properties.includes(p);
              const clr = propColorMap[p] || COLOR_FRAMES[0];
              return <button key={p} onClick={() => setProperties(ps => sel ? ps.filter(x => x !== p) : [...ps, p])} style={{padding:"8px 14px", borderRadius:10, border:sel ? `2px solid ${clr.border}` : "1.5px solid #e0e0e0", background:sel ? clr.iconBg : "#fafafa", color:sel ? clr.iconColor : "#666", fontSize:13, cursor:"pointer", fontWeight:sel ? 700 : 400}}>{p}</button>;
            })}
          </div>
        </div>
        <div className="field"><label>Fecha de ingreso</label><input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)}/></div>
        {error && <div style={{fontSize:12, color:"#A32D2D", background:"#FCEBEB", padding:"10px 14px", borderRadius:10, marginBottom:14}}>{error}</div>}
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} style={{opacity:canSave ? 1 : 0.5}}>{saving ? "Creando…" : "Crear empleado"}</button>
        </div>
      </div>
    </div>
  </div>;
}
