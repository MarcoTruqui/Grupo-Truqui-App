function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso.length <= 10 ? iso + "T12:00:00" : iso).toLocaleDateString("es-MX", {day:"numeric", month:"long", year:"numeric"});
}
function fmtDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso.length <= 10 ? iso + "T12:00:00" : iso).toLocaleDateString("es-MX", {day:"numeric", month:"short", year:"numeric"});
}

function buildHeader(projectName, sectionTitle, dateFrom, dateTo) {
  return `<div style="display:flex;justify-content:space-between;margin-bottom:8px">
    <div>
      <div style="font-size:24px;font-weight:700;color:#E87A30">Grupo Truqui</div>
      <div style="font-size:13px;color:#888">${sectionTitle} — ${projectName}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:13px;font-weight:600">${fmtDateShort(dateFrom)} — ${fmtDateShort(dateTo)}</div>
      <div style="font-size:11px;color:#888">Generado ${fmtDateShort(new Date().toISOString())}</div>
    </div>
  </div>
  <div style="height:3px;background:#E87A30;border-radius:2px;margin-bottom:20px"></div>`;
}

function buildLogsSection(projectName, logs, dateFrom, dateTo, pageBreak) {
  const sorted = [...logs].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const rows = sorted.map(l => `
    <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #eee">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <div style="font-size:14px;font-weight:700">${fmtDate(l.date)}</div>
        ${l.weather ? `<div style="font-size:11px;color:#888;background:#f5f5f5;padding:2px 10px;border-radius:20px">${l.weather}</div>` : ""}
      </div>
      <div style="font-size:11px;color:#aaa;margin-bottom:6px">Registrado por ${l.createdBy || "—"}</div>
      <div style="font-size:13px;color:#333;line-height:1.5">${l.workPerformed || ""}</div>
      ${l.issues ? `<div style="font-size:12px;color:#B45309;background:#FFF8E1;padding:8px 10px;border-radius:8px;margin-top:8px">⚠️ ${l.issues}</div>` : ""}
    </div>`).join("");
  return `<div style="${pageBreak ? "page-break-before:always;" : ""}">
    ${buildHeader(projectName, "Bitácora Diaria", dateFrom, dateTo)}
    ${sorted.length ? rows : '<div style="text-align:center;color:#aaa;padding:40px">Sin bitácoras en este rango de fechas.</div>'}
  </div>`;
}

function buildHeadcountSection(projectName, entries, dateFrom, dateTo, pageBreak) {
  const sorted = [...entries].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const allTrades = [...new Set(sorted.flatMap(e => (e.rows || []).map(r => r.trade)))];
  const rows = sorted.map(e => {
    const total = (e.rows || []).reduce((s, r) => s + (Number(r.count) || 0), 0);
    const byTrade = {};
    (e.rows || []).forEach(r => { byTrade[r.trade] = r.count; });
    return `<tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:8px;font-size:12px;font-weight:600">${fmtDateShort(e.date)}</td>
      ${allTrades.map(t => `<td style="padding:8px;text-align:center;font-size:12px;color:#555">${byTrade[t] ?? "—"}</td>`).join("")}
      <td style="padding:8px;text-align:center;font-size:13px;font-weight:700;color:#E87A30">${total}</td>
    </tr>`;
  }).join("");
  const grandTotal = sorted.reduce((s, e) => s + (e.rows || []).reduce((a, r) => a + (Number(r.count) || 0), 0), 0);
  return `<div style="${pageBreak ? "page-break-before:always;" : ""}">
    ${buildHeader(projectName, "Registro de Personal", dateFrom, dateTo)}
    ${sorted.length ? `<table style="width:100%;border-collapse:collapse;border:1px solid #eee">
      <thead><tr style="background:#f5f5f7">
        <th style="padding:8px;text-align:left;font-size:11px;color:#888">Fecha</th>
        ${allTrades.map(t => `<th style="padding:8px;text-align:center;font-size:11px;color:#888">${t}</th>`).join("")}
        <th style="padding:8px;text-align:center;font-size:11px;color:#888">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:16px;text-align:right;font-size:14px;font-weight:700">Total del periodo: ${grandTotal}</div>`
    : '<div style="text-align:center;color:#aaa;padding:40px">Sin registros de personal en este rango de fechas.</div>'}
  </div>`;
}

function buildPhotosSection(projectName, photos, dateFrom, dateTo, pageBreak) {
  const sorted = [...photos].sort((a, b) => (a.uploadedAt || "").localeCompare(b.uploadedAt || ""));
  const cards = sorted.map(p => `
    <div style="width:31%;margin-bottom:16px;break-inside:avoid">
      <img src="${p.url}" style="width:100%;height:140px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>
      <div style="font-size:10px;color:#888;margin-top:4px">${p.category || ""}</div>
      <div style="font-size:10px;color:#aaa">${fmtDateShort(p.uploadedAt)} · ${p.uploadedBy || ""}</div>
      ${p.caption ? `<div style="font-size:10px;color:#555">${p.caption}</div>` : ""}
    </div>`).join("");
  return `<div style="${pageBreak ? "page-break-before:always;" : ""}">
    ${buildHeader(projectName, "Fotos de Avance", dateFrom, dateTo)}
    ${sorted.length ? `<div style="display:flex;flex-wrap:wrap;gap:2%">${cards}</div>` : '<div style="text-align:center;color:#aaa;padding:40px">Sin fotos en este rango de fechas.</div>'}
  </div>`;
}

const SECTION_BUILDERS = {logs:buildLogsSection, headcount:buildHeadcountSection, photos:buildPhotosSection};
const SECTION_LABELS = {logs:"Bitácora", headcount:"Personal", photos:"Fotos"};

/* sections: [{key:"logs"|"photos"|"headcount", data:[...]}], in the order they should appear */
export function exportConstructionReport(projectName, dateFrom, dateTo, sections) {
  const title = sections.length === 1 ? `${SECTION_LABELS[sections[0].key]} — ${projectName}` : `Reporte — ${projectName}`;
  const body = sections.map((s, i) => SECTION_BUILDERS[s.key](projectName, s.data, dateFrom, dateTo, i > 0)).join("");
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>${title}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,sans-serif;color:#1a1a1a;padding:40px}@media print{.noprint{display:none!important}}</style>
</head><body>
${body}
<div style="margin-top:24px;text-align:center" class="noprint"><button onclick="window.print()" style="padding:10px 28px;background:#E87A30;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600">Imprimir / Guardar PDF</button></div>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}
