import { fmtDate } from "./dateHelpers";

/* ===== EXPORT PDF — columns: Tarea, Fecha creada, Prioridad, Estado, Creado por, Resuelto por, Fecha resuelta ===== */
export function exportPDF(title, taskList) {
  const date = new Date().toLocaleDateString("es-MX", {day:"numeric", month:"long", year:"numeric"});

  const sc = {"Open":"#D85A30", "In Progress":"#BA7517", "Needs Approval":"#534AB7", "Approved":"#378ADD", "Resolved":"#1D9E75"};
  const pc = {"High":"#A32D2D", "Medium":"#854F0B", "Low":"#3B6D11"};
  const sl = {"Open":"Abierta", "In Progress":"En Progreso", "Needs Approval":"Req. Aprob.", "Approved":"Aprobada", "Resolved":"Resuelta"};
  const pl = {"High":"Alta", "Medium":"Media", "Low":"Baja"};

  const counts = {"Open":0, "In Progress":0, "Needs Approval":0, "Approved":0, "Resolved":0};
  taskList.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });

  const rows = taskList.map(t => {
    const resolvedEntry = (t.history || []).filter(h => h.action && h.action.toLowerCase().includes("resuelta")).pop();
    const resolvedBy = resolvedEntry?.by || "—";
    const resolvedDate = resolvedEntry ? fmtDate(resolvedEntry.date) : "—";

    return `<tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:10px 8px;font-size:13px;font-weight:500">${t.title}<br/><span style="font-size:11px;color:#888">${t.property}</span></td>
      <td style="padding:10px 8px;font-size:12px;color:#888">${t.created || "—"}</td>
      <td style="padding:10px 8px;text-align:center"><span style="font-size:11px;padding:3px 8px;border-radius:20px;background:${(pc[t.priority] || '#888')}22;color:${pc[t.priority] || '#888'}">${pl[t.priority] || t.priority}</span></td>
      <td style="padding:10px 8px;text-align:center"><span style="font-size:11px;padding:3px 8px;border-radius:20px;background:${(sc[t.status] || '#888')}22;color:${sc[t.status] || '#888'}">${sl[t.status] || t.status}</span></td>
      <td style="padding:10px 8px;font-size:12px;color:#555">${t.createdBy || "—"}</td>
      <td style="padding:10px 8px;font-size:12px;color:#555">${resolvedBy}</td>
      <td style="padding:10px 8px;font-size:12px;color:#888">${resolvedDate}</td>
    </tr>`;
  }).join("");

  const cards = Object.entries(counts).map(([s, v]) => `<div style="flex:1;background:#f9f9f9;border-radius:10px;padding:12px;text-align:center;border:1px solid #eee;min-width:80px">
    <div style="font-size:10px;color:#888;font-weight:500;margin-bottom:4px">${sl[s] || s}</div>
    <div style="font-size:22px;font-weight:600;color:${sc[s] || '#888'}">${v}</div>
  </div>`).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;color:#1a1a1a;padding:40px}
@media print{.noprint{display:none!important}}
</style>
</head>
<body>
<div style="display:flex;justify-content:space-between;margin-bottom:8px">
  <div>
    <div style="font-size:24px;font-weight:700;color:#534AB7">Grupo Truqui</div>
    <div style="font-size:13px;color:#888">Reporte de Mantenimiento</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:14px;font-weight:600">${title}</div>
    <div style="font-size:12px;color:#888">${date}</div>
  </div>
</div>
<div style="height:3px;background:#534AB7;border-radius:2px;margin-bottom:24px"></div>
<div style="display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap">${cards}</div>
<table style="width:100%;border-collapse:collapse;border:1px solid #eee">
  <thead>
    <tr style="background:#f5f5f7">
      <th style="padding:10px 8px;text-align:left;font-size:12px;color:#888">Tarea</th>
      <th style="padding:10px 8px;text-align:left;font-size:12px;color:#888">Fecha creada</th>
      <th style="padding:10px 8px;text-align:center;font-size:12px;color:#888">Prioridad</th>
      <th style="padding:10px 8px;text-align:center;font-size:12px;color:#888">Estado</th>
      <th style="padding:10px 8px;text-align:left;font-size:12px;color:#888">Creado por</th>
      <th style="padding:10px 8px;text-align:left;font-size:12px;color:#888">Resuelto por</th>
      <th style="padding:10px 8px;text-align:left;font-size:12px;color:#888">Fecha resuelta</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<div style="margin-top:24px;text-align:center" class="noprint">
  <button onclick="window.print()" style="padding:10px 28px;background:#534AB7;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600">Imprimir / Guardar PDF</button>
</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}
