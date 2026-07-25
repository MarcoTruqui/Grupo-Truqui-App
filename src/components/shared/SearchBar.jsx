export function SearchBar({value, onChange, placeholder}) {
  return <div className="search-box">
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "Buscar..."}/>
    {value && <button className="clear-btn" onClick={() => onChange("")}>×</button>}
  </div>;
}
