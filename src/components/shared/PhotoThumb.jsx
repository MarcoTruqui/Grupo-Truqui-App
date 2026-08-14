export function PhotoThumb({photo, onOpen}) {
  return <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
    <img src={photo.url} className="photo-thumb" onClick={e => { e.stopPropagation(); onOpen(photo.url, photo.caption); }}/>
    {photo.caption && <div className="photo-caption" title={photo.caption}>{photo.caption}</div>}
  </div>;
}
