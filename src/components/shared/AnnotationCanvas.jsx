import { useState, useRef, useEffect } from "react";

const MAX_DIM = 1400;

export function AnnotationCanvas({imageDataUrl, onSave, onCancel}) {
  const canvasRef = useRef();
  const baseImgRef = useRef(null);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);
  const drawingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [dims, setDims] = useState({w:600, h:400});

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > MAX_DIM) { h = Math.round(h * (MAX_DIM / w)); w = MAX_DIM; }
      baseImgRef.current = img;
      setDims({w, h});
      setReady(true);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  useEffect(() => { if (ready) redraw(); }, [ready]);

  function redraw() {
    const c = canvasRef.current;
    if (!c || !baseImgRef.current) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(baseImgRef.current, 0, 0, c.width, c.height);
    ctx.strokeStyle = "#E8342D";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokesRef.current.forEach(stroke => {
      ctx.beginPath();
      stroke.points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.stroke();
    });
  }

  function getPos(e) {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    return {x:(e.clientX - rect.left) * (c.width / rect.width), y:(e.clientY - rect.top) * (c.height / rect.height)};
  }

  function start(e) {
    if (!ready) return;
    e.preventDefault();
    drawingRef.current = true;
    currentStrokeRef.current = {points:[getPos(e)]};
  }

  function move(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const pts = currentStrokeRef.current.points;
    pts.push(pos);
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = "#E8342D";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function end() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      strokesRef.current.push(currentStrokeRef.current);
      setHasStrokes(true);
    }
    currentStrokeRef.current = null;
  }

  function undo() {
    strokesRef.current.pop();
    setHasStrokes(strokesRef.current.length > 0);
    redraw();
  }

  function save() {
    onSave(canvasRef.current.toDataURL("image/jpeg", 0.85));
  }

  return <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
      <div className="modal-handle"/>
      <div className="modal-sheet-scroll">
        <div className="modal-title">Marcar detalle</div>
        <div className="modal-sub">Dibuja sobre la foto para señalar el detalle (opcional)</div>
        {ready ? <canvas ref={canvasRef} width={dims.w} height={dims.h} style={{width:"100%", height:"auto", borderRadius:12, border:"1.5px solid #ddd", touchAction:"none", cursor:"crosshair", display:"block"}}
          onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}/>
          : <div style={{textAlign:"center", padding:40, color:"#aaa"}}>Cargando imagen…</div>}
      </div>
      <div className="modal-sheet-bottom">
        <div className="btn-row">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-secondary" onClick={undo} style={{opacity:hasStrokes ? 1 : 0.5}}>Deshacer</button>
          <button className="btn-primary" onClick={save} style={{opacity:ready ? 1 : 0.5}}>Guardar</button>
        </div>
      </div>
    </div>
  </div>;
}
