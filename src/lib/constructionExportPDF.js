function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso.length <= 10 ? iso + "T12:00:00" : iso).toLocaleDateString("es-MX", {day:"numeric", month:"long", year:"numeric"});
}
function fmtDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso.length <= 10 ? iso + "T12:00:00" : iso).toLocaleDateString("es-MX", {day:"numeric", month:"short", year:"numeric"});
}

/* One header for the whole document — sections flow right after each other below it,
   each marked with its own subtitle instead of repeating this block or forcing a page break. */
function buildTopHeader(projectName, dateFrom, dateTo) {
  return `<div style="display:flex;justify-content:space-between;margin-bottom:8px">
    <div>
      <div style="font-size:24px;font-weight:700;color:#E87A30">Grupo Truqui</div>
      <div style="font-size:13px;color:#888">${projectName}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:13px;font-weight:600">${fmtDateShort(dateFrom)} — ${fmtDateShort(dateTo)}</div>
      <div style="font-size:11px;color:#888">Generado ${fmtDateShort(new Date().toISOString())}</div>
    </div>
  </div>
  <div style="height:3px;background:#E87A30;border-radius:2px;margin-bottom:24px"></div>`;
}

function sectionSubtitle(icon, title) {
  return `<div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
    <span style="font-size:19px">${icon}</span>
    <span style="font-size:16px;font-weight:700;color:#1a1a1a">${title}</span>
  </div>
  <div style="height:2px;background:#f0f0f0;border-radius:2px;margin-bottom:18px"></div>`;
}

function buildLogsSection(logs, subcontractors) {
  const subName = id => (subcontractors || []).find(s => s.id === id)?.name || "—";
  const sorted = [...logs].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const rows = sorted.map(l => `
    <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #eee">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <div style="font-size:14px;font-weight:700">${fmtDate(l.date)}</div>
        ${l.weather ? `<div style="font-size:11px;color:#888;background:#f5f5f5;padding:2px 10px;border-radius:20px">${l.weather}</div>` : ""}
      </div>
      <div style="font-size:11px;color:#aaa;margin-bottom:6px">Registrado por ${l.createdBy || "—"}</div>
      ${l.workPerformed ? `<div style="font-size:13px;color:#333;line-height:1.5">${l.workPerformed}</div>` : ""}
      ${(l.bySubcontractor || []).length ? `<div style="margin-top:8px">${l.bySubcontractor.map(r => `<div style="font-size:12px;color:#555;background:#FDEEE3;border-radius:8px;padding:6px 10px;margin-top:6px"><strong style="color:#B75A17">${subName(r.subcontractorId)}:</strong> ${r.note}</div>`).join("")}</div>` : ""}
      ${l.issues ? `<div style="font-size:12px;color:#B45309;background:#FFF8E1;padding:8px 10px;border-radius:8px;margin-top:8px">⚠️ ${l.issues}</div>` : ""}
    </div>`).join("");
  return `<div style="margin-bottom:32px">
    ${sectionSubtitle("📋", "Bitácora de Actividad Diaria")}
    ${sorted.length ? rows : '<div style="text-align:center;color:#aaa;padding:30px">Sin bitácoras en este rango de fechas.</div>'}
  </div>`;
}

/* One date-block per entry, with each subcontractor/trade shown as a small square "bubble"
   (count large, trade label small underneath) instead of a stacked list of rows — wraps
   naturally so nothing needs to be scanned off to the side. Grand total sits at the top of
   the section instead of buried at the bottom. */
function buildHeadcountSection(entries) {
  const sorted = [...entries].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const grandTotal = sorted.reduce((s, e) => s + (e.rows || []).reduce((a, r) => a + (Number(r.count) || 0), 0), 0);
  const blocks = sorted.map(e => {
    const total = (e.rows || []).reduce((s, r) => s + (Number(r.count) || 0), 0);
    const chips = (e.rows || []).map(r => `
      <div style="width:74px;height:74px;border-radius:12px;background:#FDEEE3;border:1px solid #F3C9A6;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4px;break-inside:avoid">
        <div style="font-size:19px;font-weight:800;color:#E87A30;line-height:1">${r.count}</div>
        <div style="font-size:9px;color:#B75A17;margin-top:4px;line-height:1.25;word-break:break-word">${r.trade}</div>
      </div>`).join("");
    return `
      <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #eee">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <div style="font-size:14px;font-weight:700">${fmtDate(e.date)}</div>
          <div style="font-size:14px;font-weight:700;color:#E87A30">${total} total</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${chips}</div>
      </div>`;
  }).join("");
  return `<div style="margin-bottom:32px">
    ${sectionSubtitle("👷", "Registro de Personal")}
    ${sorted.length ? `<div style="text-align:right;font-size:16px;font-weight:800;color:#E87A30;margin-bottom:14px">Total del periodo: ${grandTotal}</div>${blocks}`
    : '<div style="text-align:center;color:#aaa;padding:30px">Sin registros de personal en este rango de fechas.</div>'}
  </div>`;
}

function buildPhotosSection(photos) {
  const sorted = [...photos].sort((a, b) => (a.uploadedAt || "").localeCompare(b.uploadedAt || ""));
  const cards = sorted.map(p => `
    <div style="width:31%;margin-bottom:16px;break-inside:avoid">
      <img src="${p.url}" style="width:100%;aspect-ratio:630/435;object-fit:cover;border-radius:8px;border:1px solid #eee;display:block"/>
      <div style="font-size:10px;color:#888;margin-top:4px">${p.category || ""}</div>
      <div style="font-size:10px;color:#aaa">${fmtDateShort(p.uploadedAt)} · ${p.uploadedBy || ""}</div>
      ${p.caption ? `<div style="font-size:10px;color:#555">${p.caption}</div>` : ""}
    </div>`).join("");
  return `<div style="margin-bottom:32px">
    ${sectionSubtitle("📷", "Reporte Fotográfico")}
    ${sorted.length ? `<div style="display:flex;flex-wrap:wrap;gap:2%">${cards}</div>` : '<div style="text-align:center;color:#aaa;padding:30px">Sin fotos en este rango de fechas.</div>'}
  </div>`;
}

const SECTION_BUILDERS = {logs:buildLogsSection, headcount:buildHeadcountSection, photos:buildPhotosSection};
const SECTION_LABELS = {logs:"Bitácora", headcount:"Personal", photos:"Fotos"};

/* sections: [{key:"logs"|"photos"|"headcount", data:[...]}], in the order they should appear.
   Sections flow one after another (no forced page break) under a single shared header, each
   marked with its own subtitle so they're still easy to tell apart.
   Opens via a Blob + real <a> click instead of window.open("", "_blank") + document.write —
   the latter gets silently blocked by mobile Safari/Chrome's popup blocker because it treats
   a scripted window.open to a blank window as a popup, while a genuine anchor click with
   target="_blank" is treated as normal link navigation and isn't blocked. */
export function exportConstructionReport(projectName, dateFrom, dateTo, sections, subcontractors) {
  const title = sections.length === 1 ? `${SECTION_LABELS[sections[0].key]} — ${projectName}` : `Reporte — ${projectName}`;
  const body = sections.map(s => SECTION_BUILDERS[s.key](s.data, subcontractors)).join("");
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;color:#1a1a1a;padding:24px 24px 60px}
.topbar{position:sticky;top:0;background:#fff;padding:10px 0;margin:-24px -24px 20px;padding-left:24px;padding-right:24px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;z-index:10}
.topbar button{padding:9px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none}
@media print{.noprint{display:none!important}body{padding:16px}}
</style>
</head><body>
<div class="topbar noprint">
  <button onclick="window.close()" style="background:#f5f5f5;color:#555;border:0.5px solid rgba(0,0,0,0.15)">‹ Cerrar</button>
  <button onclick="window.print()" style="background:#E87A30;color:#fff">Imprimir / Guardar PDF</button>
</div>
${buildTopHeader(projectName, dateFrom, dateTo)}
${body}
</body></html>`;
  const blob = new Blob([html], {type:"text/html"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
