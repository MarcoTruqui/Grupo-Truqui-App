export function Av({name, size=36, bg="#534AB7"}) {
  const i = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return <div className="avatar" style={{width:size, height:size, fontSize:size*0.36, background:bg}}>{i}</div>;
}
