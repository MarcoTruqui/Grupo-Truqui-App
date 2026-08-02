import { ROLE_META, COLOR_FRAMES } from "../../lib/constants";
import { getVacationDaysBySeniority, getCurrentAnniversaryYear } from "../../lib/firestoreHelpers";

const EMPLOYEE_ROLE_COLORS = {admin:"#534AB7",supervisor:"#1D9E75",maintenance:"#BA7517",cleaning:"#378ADD",office:"#D14D8A",construction:"#E87A30",purchasing:"#0D9DA7"};

export function EditSheet({editing,setEditing,allPropNames,propColorMap,updateUser}) {
  if(!editing) return null;
  const rc = EMPLOYEE_ROLE_COLORS;
  return <div className="modal-overlay" onClick={()=>setEditing(null)}>
    <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Editar empleado</div>
        <div className="field"><label>Nombre completo</label><input value={editing.name||""} onChange={e=>setEditing(u=>({...u,name:e.target.value}))}/></div>
        <div className="field"><label>Usuario</label><input value={editing.username||""} onChange={e=>setEditing(u=>({...u,username:e.target.value}))}/></div>
        <div className="field">
          <label>Rol</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["admin","supervisor","maintenance","cleaning","office","construction","purchasing"].map(r=>{
              const active=editing.role===r;
              return <button key={r} onClick={()=>setEditing(u=>({...u,role:r}))} style={{padding:"9px 14px",borderRadius:10,border:active?`2px solid ${rc[r]}`:"1.5px solid #e0e0e0",background:active?rc[r]:"#fafafa",color:active?"#fff":"#666",fontSize:13,cursor:"pointer",fontWeight:active?700:400}}>{ROLE_META[r].label}</button>;
            })}
          </div>
        </div>
        <div className="field">
          <label>Propiedades asignadas</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {allPropNames.map(p=>{
              const s=(editing.properties||[]).includes(p); const clr=propColorMap[p]||COLOR_FRAMES[0];
              return <button key={p} onClick={()=>setEditing(u=>({...u,properties:s?(u.properties||[]).filter(x=>x!==p):[...(u.properties||[]),p]}))} style={{padding:"8px 14px",borderRadius:10,border:s?`2px solid ${clr.border}`:"1.5px solid #e0e0e0",background:s?clr.iconBg:"#fafafa",color:s?clr.iconColor:"#666",fontSize:13,cursor:"pointer",fontWeight:s?700:400}}>{p}</button>;
            })}
          </div>
        </div>
        {editing.role!=="admin"&&(()=>{
          const autoVal=getVacationDaysBySeniority(editing.hireDate||"2020-01-01");
          const isOverride=editing.vacationDaysOverride!=null;
          const displayVal=isOverride?editing.vacationDaysOverride:(autoVal??0);
          return <div className="field">
            <label>Días de vacaciones al año</label>
            <div style={{background:"#F0EFFE",borderRadius:10,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:12,color:"#534AB7"}}>
                {autoVal!=null?<>Automático por antigüedad: <strong>{autoVal} días</strong></>:<span style={{color:"#aaa"}}>Sin antigüedad aún (menos de 1 año)</span>}
              </div>
              <button onClick={()=>setEditing(u=>isOverride?({...u,vacationDaysOverride:null}):({...u,vacationDaysOverride:autoVal??0}))} style={{fontSize:11,padding:"4px 10px",borderRadius:8,border:`1.5px solid ${isOverride?"#A32D2D":"#534AB7"}`,background:isOverride?"#FCEBEB":"#534AB7",color:isOverride?"#A32D2D":"#fff",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap",marginLeft:8}}>
                {isOverride?"Usar auto":"Editar"}
              </button>
            </div>
            {isOverride&&<>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <button onClick={()=>setEditing(u=>({...u,vacationDaysOverride:Math.max(0,(u.vacationDaysOverride??0)-1)}))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>−</button>
                <div style={{flex:1,textAlign:"center"}}>
                  <span style={{fontSize:28,fontWeight:700,color:"#534AB7"}}>{displayVal}</span>
                  <span style={{fontSize:13,color:"#888",marginLeft:6}}>días</span>
                </div>
                <button onClick={()=>setEditing(u=>({...u,vacationDaysOverride:Math.min(365,(u.vacationDaysOverride??0)+1)}))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>+</button>
              </div>
              <div style={{fontSize:11,color:"#aaa",marginTop:6}}>Sobreescribe el cálculo automático solo para este empleado.</div>
            </>}
          </div>;
        })()}
        <div className="field">
          <label>Fecha de ingreso</label>
          <input type="date" value={editing.hireDate||"2020-01-01"} onChange={e=>setEditing(u=>({...u,hireDate:e.target.value}))} style={{fontSize:14,padding:"10px 12px",border:"1.5px solid #e0e0e0",borderRadius:10,width:"100%",background:"#fafafa",outline:"none"}}/>
        </div>
        {editing.role!=="admin"&&<>
          <div style={{background:"#FFF8E1",border:"1.5px solid #FFD54F",borderRadius:12,padding:12,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#B45309",marginBottom:4}}>Saldo inicial (año en curso)</div>
            <div style={{fontSize:11,color:"#92400E"}}>Ingresa días ya usados o ganados antes de iniciar el sistema. Se reinician automáticamente en su próximo aniversario.</div>
          </div>
          <div className="field">
            <label>Vacaciones prestadas del año siguiente</label>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setEditing(u=>({...u,vacationBorrowed:Math.max(0,(u.vacationBorrowed||0)-1)}))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>−</button>
              <div style={{flex:1,textAlign:"center"}}>
                <span style={{fontSize:28,fontWeight:700,color:"#1D9E75"}}>{editing.vacationBorrowed||0}</span>
                <span style={{fontSize:13,color:"#888",marginLeft:6}}>días prestados</span>
              </div>
              <button onClick={()=>setEditing(u=>({...u,vacationBorrowed:Math.min(30,(u.vacationBorrowed||0)+1)}))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>+</button>
            </div>
            <div style={{fontSize:11,color:"#aaa",marginTop:6}}>Se suman al saldo disponible. Se reinician en su próximo aniversario.</div>
          </div>
          <div className="field">
            <label>Vacaciones ya usadas (arrastre)</label>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setEditing(u=>({...u,vacationUsedCarryover:Math.max(0,(u.vacationUsedCarryover||0)-1)}))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>−</button>
              <div style={{flex:1,textAlign:"center"}}>
                <span style={{fontSize:28,fontWeight:700,color:"#A32D2D"}}>{editing.vacationUsedCarryover||0}</span>
                <span style={{fontSize:13,color:"#888",marginLeft:6}}>días usados</span>
              </div>
              <button onClick={()=>setEditing(u=>({...u,vacationUsedCarryover:Math.min(365,(u.vacationUsedCarryover||0)+1)}))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>+</button>
            </div>
          </div>
          <div className="field">
            <label>Días extra/festivos ganados (arrastre)</label>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setEditing(u=>({...u,compEarnedCarryover:Math.max(0,+(((u.compEarnedCarryover||0)-0.5).toFixed(1)))}))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>−</button>
              <div style={{flex:1,textAlign:"center"}}>
                <span style={{fontSize:28,fontWeight:700,color:"#BA7517"}}>{editing.compEarnedCarryover||0}</span>
                <span style={{fontSize:13,color:"#888",marginLeft:6}}>días ganados</span>
              </div>
              <button onClick={()=>setEditing(u=>({...u,compEarnedCarryover:+(((u.compEarnedCarryover||0)+0.5).toFixed(1))}))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>+</button>
            </div>
            <div style={{fontSize:11,color:"#aaa",marginTop:6}}>Pasos de 0.5 días</div>
          </div>
        </>}
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={()=>setEditing(null)}>Cancelar</button>
          <button className="btn-primary" onClick={()=>{
            const curYr=getCurrentAnniversaryYear(editing.hireDate||"2020-01-01");
            const patch={name:editing.name,username:editing.username,role:editing.role,properties:editing.properties||[],hireDate:editing.hireDate||"2020-01-01",vacationUsedCarryover:editing.vacationUsedCarryover||0,vacationBorrowed:editing.vacationBorrowed||0,compEarnedCarryover:editing.compEarnedCarryover||0,carryoverYearsCompleted:curYr};
            if(editing.vacationDaysOverride!=null) patch.vacationDaysOverride=editing.vacationDaysOverride;
            else patch.vacationDaysOverride=null;
            updateUser(editing.id,patch);
            setEditing(null);
          }}>Guardar</button>
        </div>
      </div>
    </div>
  </div>;
}
