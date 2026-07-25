import { useState, useRef, useEffect } from "react";

export function SignaturePad({onSave, onCancel, label}) {
  const canvasRef = useRef();
  const drawingRef = useRef(false);
  const lastRef = useRef({x:0, y:0});
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e) {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    return {x:(e.clientX - rect.left) * (c.width / rect.width), y:(e.clientY - rect.top) * (c.height / rect.height)};
  }

  function start(e) { e.preventDefault(); drawingRef.current = true; lastRef.current = getPos(e); }
  function move(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastRef.current = pos;
    if (!hasDrawn) setHasDrawn(true);
  }
  function end() { drawingRef.current = false; }

  function clear() {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    setHasDrawn(false);
  }

  function save() {
    if (!hasDrawn) return;
    onSave(canvasRef.current.toDataURL("image/png"));
  }

  return <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Firma{label ? ` — ${label}` : ""}</div>
        <div className="modal-sub">Firma con el dedo o el mouse dentro del recuadro</div>
        <canvas ref={canvasRef} width={600} height={260} style={{width:"100%", height:180, borderRadius:12, border:"1.5px solid #ddd", touchAction:"none", background:"#fff", cursor:"crosshair"}}
          onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}/>
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-secondary" onClick={clear}>Borrar</button>
          <button className="btn-primary" onClick={save} style={{opacity:hasDrawn ? 1 : 0.5}}>Guardar firma</button>
        </div>
      </div>
    </div>
  </div>;
}
