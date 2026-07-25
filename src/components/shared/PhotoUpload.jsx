import { useRef } from "react";

export function PhotoUpload({photos, setPhotos}) {
  const fileRef = useRef();
  const camRef = useRef();

  function handleFiles(e) {
    Array.from(e.target.files).forEach(f => {
      const r = new FileReader();
      r.onload = ev => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          const mx = 800;
          if (w > mx) { h = Math.round(h * (mx / w)); w = mx; }
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          const thumb = c.toDataURL("image/jpeg", 0.6);
          setPhotos(ps => [...ps, {name:f.name, url:thumb, caption:""}]);
        };
        img.src = ev.target.result;
      };
      r.readAsDataURL(f);
    });
    e.target.value = "";
  }

  return <>
    {photos.length > 0 && <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:8}}>
      {photos.map((p, i) => <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start", background:"#f8f8f8", borderRadius:10, padding:8}}>
        <div style={{position:"relative", width:60, height:60, flexShrink:0}}>
          <img src={p.url} style={{width:60, height:60, borderRadius:8, objectFit:"cover"}}/>
          <button onClick={() => setPhotos(ps => ps.filter((_, j) => j !== i))} style={{position:"absolute", top:-4, right:-4, background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:11, cursor:"pointer", padding:0}}>×</button>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:11, color:"#888", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{p.name}</div>
          <input className="caption-input" value={p.caption || ""} onChange={e => { const v = e.target.value; setPhotos(ps => ps.map((x, j) => j === i ? {...x, caption:v} : x)); }} placeholder="Descripción (ej. Cotización — $800)"/>
        </div>
      </div>)}
    </div>}
    <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleFiles}/>
    <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFiles}/>
    <div className="photo-upload-row">
      <button className="photo-upload-btn" onClick={() => fileRef.current.click()}>+ Galería</button>
      <button className="photo-upload-btn" onClick={() => camRef.current.click()}>+ Cámara</button>
    </div>
  </>;
}
