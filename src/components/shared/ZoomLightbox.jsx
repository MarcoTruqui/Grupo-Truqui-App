import { useRef } from "react";

export function ZoomLightbox({src, caption, onClose}) {
  const imgRef = useRef();
  const containerRef = useRef();
  const stateRef = useRef({scale:1, x:0, y:0, lastDist:0, lastCenter:null, isPinching:false, startX:0, startY:0, isDragging:false, dragStartX:0, dragStartY:0});

  function clampTransform(s) {
    const st = stateRef.current;
    const el = imgRef.current;
    if (!el) return;
    const scale = Math.max(1, Math.min(s, 5));
    let x = st.x, y = st.y;
    if (scale <= 1) {
      x = 0; y = 0;
    } else {
      const rect = el.getBoundingClientRect();
      const maxX = (rect.width * scale - window.innerWidth) / (2 * scale);
      const maxY = (rect.height * scale - window.innerHeight * 0.8) / (2 * scale);
      x = Math.max(-Math.abs(maxX), Math.min(Math.abs(maxX), x));
      y = Math.max(-Math.abs(maxY), Math.min(Math.abs(maxY), y));
    }
    st.scale = scale; st.x = x; st.y = y;
    el.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  }

  function getTouchDist(t) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function onTouchStart(e) {
    const st = stateRef.current;
    if (e.touches.length === 2) {
      e.preventDefault();
      st.isPinching = true; st.isDragging = false;
      st.lastDist = getTouchDist(e.touches);
    } else if (e.touches.length === 1 && st.scale > 1) {
      st.isDragging = true;
      st.dragStartX = e.touches[0].clientX - st.x;
      st.dragStartY = e.touches[0].clientY - st.y;
    }
  }

  function onTouchMove(e) {
    const st = stateRef.current;
    if (st.isPinching && e.touches.length === 2) {
      e.preventDefault();
      const dist = getTouchDist(e.touches);
      const delta = dist / st.lastDist;
      st.lastDist = dist;
      clampTransform(st.scale * delta);
    } else if (st.isDragging && e.touches.length === 1) {
      e.preventDefault();
      st.x = e.touches[0].clientX - st.dragStartX;
      st.y = e.touches[0].clientY - st.dragStartY;
      clampTransform(st.scale);
    }
  }

  function onTouchEnd(e) {
    const st = stateRef.current;
    if (e.touches.length < 2) st.isPinching = false;
    if (e.touches.length === 0) st.isDragging = false;
  }

  function handleDblTap(e) {
    e.preventDefault(); e.stopPropagation();
    const st = stateRef.current;
    if (st.scale > 1.1) { clampTransform(1); } else { clampTransform(3); }
  }

  const lastTapRef = useRef(0);
  function handleTap(e) {
    const now = Date.now();
    if (now - lastTapRef.current < 300) { handleDblTap(e); lastTapRef.current = 0; } else { lastTapRef.current = now; }
  }

  function handleBgClick(e) {
    const st = stateRef.current;
    if (st.scale <= 1.05) onClose();
  }

  return <div className="lightbox" onClick={handleBgClick} ref={containerRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{touchAction:"none"}}>
    <button className="lightbox-close" onClick={e => { e.stopPropagation(); onClose(); }}>×</button>
    <img ref={imgRef} src={src} alt="" onClick={e => { e.stopPropagation(); handleTap(e); }} style={{transformOrigin:"center center", transition:"none", willChange:"transform", maxWidth:"100%", maxHeight:"80vh", borderRadius:12, objectFit:"contain"}}/>
    {caption && <div className="lightbox-caption">{caption}</div>}
    <div style={{position:"absolute", bottom:Math.max(60, 20), left:"50%", transform:"translateX(-50%)", color:"rgba(255,255,255,0.5)", fontSize:11, textAlign:"center", pointerEvents:"none"}}>Pellizca para hacer zoom · Toca dos veces para ampliar</div>
  </div>;
}
