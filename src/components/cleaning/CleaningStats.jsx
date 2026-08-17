export function CleaningStats({cleanings}) {
  const counts = {};
  cleanings.filter(c => c.status === "completed").forEach(c => {
    (c.workers || []).forEach(w => {
      const key = w.userId || w.name;
      if (!counts[key]) counts[key] = {name: w.name, count: 0};
      counts[key].count++;
    });
  });
  const rows = Object.values(counts).sort((a, b) => b.count - a.count);
  const max = rows.length ? rows[0].count : 0;

  return <div>
    <div className="section-label">Limpiezas por persona</div>
    {rows.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:20}}>Aún no hay limpiezas registradas.</div>}
    {rows.map(r => (
      <div key={r.name} style={{marginBottom:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", fontSize:13, fontWeight:600, color:"#333", marginBottom:5}}>
          <span>{r.name}</span>
          <span style={{color:"#378ADD", fontSize:14}}>{r.count}</span>
        </div>
        <div style={{background:"#E6F1FB", borderRadius:6, height:18, overflow:"hidden"}}>
          <div style={{width: `${max ? (r.count / max * 100) : 0}%`, minWidth: r.count ? 6 : 0, height:"100%", background:"#378ADD", borderRadius:6, transition:"width 0.3s"}}/>
        </div>
      </div>
    ))}
  </div>;
}
