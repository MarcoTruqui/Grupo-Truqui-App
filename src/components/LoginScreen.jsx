import { useState } from "react";
import { FAKE_DOMAIN } from "../lib/constants";
import { auth } from "../lib/firebase";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) { setError("Ingresa usuario y contraseña."); return; }
    setLoading(true); setError("");
    try {
      await auth.signInWithEmailAndPassword(username.trim().toLowerCase() + FAKE_DOMAIN, password);
    } catch (e) {
      setError("Usuario o contraseña incorrectos.");
    }
    setLoading(false);
  }

  return <div style={{height:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"#f5f5f7"}}>
    <div style={{background:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:400, boxShadow:"0 8px 40px rgba(0,0,0,0.1)"}}>
      <div style={{textAlign:"center", marginBottom:32}}>
        <div style={{fontSize:32, fontWeight:800, color:"#534AB7", letterSpacing:"-0.03em", marginBottom:6}}>Grupo Truqui</div>
        <div style={{fontSize:14, color:"#888"}}>Inicia sesión para continuar</div>
      </div>
      <div className="field">
        <label>Usuario</label>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="ej. marcotruqui" onKeyDown={e => e.key === "Enter" && handleLogin()}/>
      </div>
      <div className="field">
        <label>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()}/>
      </div>
      {error && <div style={{fontSize:13, color:"#A32D2D", background:"#FCEBEB", padding:"10px 14px", borderRadius:10, marginBottom:16}}>{error}</div>}
      <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{marginTop:8, opacity:loading ? 0.7 : 1}}>{loading ? "Iniciando..." : "Iniciar sesión"}</button>
    </div>
  </div>;
}
