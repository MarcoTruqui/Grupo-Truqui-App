export function PortalSelector({user, onSelect, canCleaning}) {
  const portals = [
    {key:"maintenance",icon:"🔧",title:"Mantenimiento",sub:"Tareas, propiedades y seguimiento",color:"#534AB7",bg:"#EEEDFE",border:"#AFA9EC"},
    {key:"admin",icon:"🏢",title:"Admin / RH",sub:"Vacaciones, empleados y más",color:"#1D9E75",bg:"#E1F5EE",border:"#A0D9C5"}
  ];
  if (canCleaning) portals.push({key:"cleaning",icon:"🧹",title:"Limpieza",sub:"Checklist y firma de limpieza",color:"#378ADD",bg:"#E6F1FB",border:"#8FC0EE"});
  return <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",paddingTop:"calc(40px + env(safe-area-inset-top))",paddingBottom:"calc(24px + env(safe-area-inset-bottom))",background:"#f5f5f7",gap:14,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
    <div style={{textAlign:"center",marginBottom:12}}>
      <div style={{fontSize:28,fontWeight:800,color:"#534AB7",letterSpacing:"-0.03em",marginBottom:4}}>Grupo Truqui</div>
      <div style={{fontSize:14,color:"#888"}}>Bienvenido, {(user?.name||"").split(" ")[0]}</div>
    </div>
    <div style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2,alignSelf:"flex-start"}}>Selecciona un portal</div>
    {portals.map(({key,icon,title,sub,color,bg,border})=>(
      <div key={key} onClick={()=>onSelect(key)} style={{background:"#fff",borderRadius:18,padding:18,width:"100%",maxWidth:420,border:`1.5px solid ${border}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
        <div style={{width:52,height:52,borderRadius:13,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:16,fontWeight:700,color:"#1a1a1a",marginBottom:3}}>{title}</div>
          <div style={{fontSize:12,color:"#888"}}>{sub}</div>
        </div>
        <div style={{color:color,fontSize:22,fontWeight:300,flexShrink:0}}>›</div>
      </div>
    ))}
  </div>;
}
