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
  return `<div class="blk"><div style="display:flex;justify-content:space-between;margin-bottom:8px">
    <div>
      <div style="font-size:24px;font-weight:700;color:#E87A30">Grupo Truqui</div>
      <div style="font-size:13px;color:#888">${projectName}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:13px;font-weight:600">${fmtDateShort(dateFrom)} — ${fmtDateShort(dateTo)}</div>
      <div style="font-size:11px;color:#888">Generado ${fmtDateShort(new Date().toISOString())}</div>
    </div>
  </div>
  <div style="height:3px;background:#E87A30;border-radius:2px"></div></div><div style="height:24px"></div>`;
}

function sectionSubtitle(icon, title) {
  return `<div class="blk keep-next"><div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
    <span style="font-size:19px">${icon}</span>
    <span style="font-size:16px;font-weight:700;color:#1a1a1a">${title}</span>
  </div>
  <div style="height:2px;background:#f0f0f0;border-radius:2px"></div></div><div style="height:18px"></div>`;
}

function buildLogsSection(logs, subcontractors) {
  const subName = id => (subcontractors || []).find(s => s.id === id)?.name || "—";
  const sorted = [...logs].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const rows = sorted.map(l => `
    <div class="blk" style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #eee">
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
    ${sorted.length ? rows : '<div class="blk" style="text-align:center;color:#aaa;padding:30px">Sin bitácoras en este rango de fechas.</div>'}
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
      <div class="blk" style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #eee">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <div style="font-size:14px;font-weight:700">${fmtDate(e.date)}</div>
          <div style="font-size:14px;font-weight:700;color:#E87A30">${total} total</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${chips}</div>
      </div>`;
  }).join("");
  return `<div style="margin-bottom:32px">
    ${sectionSubtitle("👷", "Registro de Personal")}
    ${sorted.length ? `<div class="blk" style="text-align:right;font-size:16px;font-weight:800;color:#E87A30;margin-bottom:14px">Total del periodo: ${grandTotal}</div>${blocks}`
    : '<div class="blk" style="text-align:center;color:#aaa;padding:30px">Sin registros de personal en este rango de fechas.</div>'}
  </div>`;
}

/* Same not-plausible check used in the app itself (constructionHelpers.isAnomalousMachineLog),
   duplicated here rather than imported since this file has no other app-lib dependency and
   the report should keep rendering even if that module ever changes shape. */
function isAnomalousLog(l) {
  if (l.status !== "completed") return false;
  if (l.endHorometro < l.startHorometro) return true;
  const elapsedHours = (new Date(l.endAt) - new Date(l.startAt)) / 3600000;
  return (l.endHorometro - l.startHorometro) > elapsedHours + 0.5;
}

function buildMachineryLogsSection(logs) {
  const sorted = [...logs].sort((a, b) => (a.startAt || "").localeCompare(b.startAt || ""));
  const totalHours = sorted.reduce((s, l) => s + (l.status === "completed" ? (Number(l.totalHours) || 0) : 0), 0);
  const rows = sorted.map(l => `
    <div class="blk" style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #eee">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <div style="font-size:14px;font-weight:700">${l.machineName}</div>
        <div style="font-size:11px;color:#888">${fmtDate(l.startAt)}</div>
      </div>
      <div style="display:flex;gap:16px;font-size:12px;color:#555">
        <span>Inicio: <strong>${l.startHorometro}</strong></span>
        <span>Fin: <strong>${l.status === "completed" ? l.endHorometro : "En curso"}</strong></span>
        <span style="color:#E87A30;font-weight:700">${l.status === "completed" ? l.totalHours + " hrs" : "—"}</span>
      </div>
      ${isAnomalousLog(l) ? `<div style="font-size:11px;color:#A32D2D;background:#FCEBEB;padding:5px 9px;border-radius:8px;margin-top:6px">⚠️ Revisar — la lectura no coincide con el tiempo transcurrido</div>` : ""}
    </div>`).join("");
  return `<div style="margin-bottom:32px">
    ${sectionSubtitle("🏗️", "Horómetro Maquinaria")}
    ${sorted.length ? `<div class="blk" style="text-align:right;font-size:16px;font-weight:800;color:#E87A30;margin-bottom:14px">Total del periodo: ${totalHours} hrs</div>${rows}`
    : '<div class="blk" style="text-align:center;color:#aaa;padding:30px">Sin uso de maquinaria en este rango de fechas.</div>'}
  </div>`;
}

/* Photos go in explicit rows of 3 (instead of one flex-wrap grid) so each row is its own
   .blk — the shared PDF never slices a photo in half across a page break. */
function photoRows(cards) {
  const rows = [];
  for (let i = 0; i < cards.length; i += 3) rows.push(cards.slice(i, i + 3));
  return rows;
}

function buildPhotosSection(photos) {
  const sorted = [...photos].sort((a, b) => (a.uploadedAt || "").localeCompare(b.uploadedAt || ""));
  const cards = sorted.map(p => `
    <div style="width:31%;margin-bottom:16px;break-inside:avoid">
      <img src="${p.url}" style="width:100%;aspect-ratio:630/435;object-fit:cover;border-radius:8px;border:1px solid #eee;display:block"/>
      <div style="font-size:10px;color:#888;margin-top:4px">${p.category || ""}</div>
      <div style="font-size:10px;color:#aaa">${fmtDateShort(p.uploadedAt)} · ${p.uploadedBy || ""}</div>
      ${p.caption ? `<div style="font-size:10px;color:#555">${p.caption}</div>` : ""}
    </div>`);
  return `<div style="margin-bottom:32px">
    ${sectionSubtitle("📷", "Reporte Fotográfico")}
    ${sorted.length ? photoRows(cards).map(row => `<div class="blk" style="display:flex;gap:2%">${row.join("")}</div>`).join("") : '<div class="blk" style="text-align:center;color:#aaa;padding:30px">Sin fotos en este rango de fechas.</div>'}
  </div>`;
}

const SECTION_BUILDERS = {logs:buildLogsSection, headcount:buildHeadcountSection, machinery:buildMachineryLogsSection, photos:buildPhotosSection};
const SECTION_LABELS = {logs:"Bitácora", headcount:"Personal", machinery:"Maquinaria", photos:"Fotos"};

function pdfFilename(title, dateFrom, dateTo) {
  const base = title.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `${base}_${dateFrom}${dateTo !== dateFrom ? "_" + dateTo : ""}.pdf`;
}

/* Runs inside the report page. window.print() does nothing on many phones (Chrome/Firefox on
   iOS, WhatsApp/Instagram in-app browsers, some Android browsers), so the page also builds a
   real PDF file and hands it to the phone's native share sheet (WhatsApp, Mail, Drive…).
   The PDF is built in the background as soon as the page loads, because iOS only allows
   navigator.share() right after a tap — awaiting a multi-second render first would lose that.
   Each .blk is rendered as its own small image and stacked onto letter pages, so a block is
   never cut across a page break and no single canvas gets big enough to hit iOS's size limit.
   Rendering happens on an off-screen 720px-wide copy so a phone-width layout isn't squeezed. */
const SHARE_SCRIPT = `
var pdfFile = null, pdfMissingPhotos = 0;
/* The preview's own <img> tags load photos normally (always works). Drawing them into the PDF
   needs a CORS-enabled copy, which only works once the Storage bucket has a CORS rule — so the
   clone swaps in fresh crossorigin images (with a cache-buster so the browser doesn't reuse
   the preview's non-CORS cached copy) and counts any that still fail. */
function corsImages(root) {
  Array.prototype.forEach.call(root.querySelectorAll("img"), function(old) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.setAttribute("style", old.getAttribute("style") || "");
    img.src = old.src + (old.src.indexOf("?") === -1 ? "?" : "&") + "pdfcors=1";
    old.replaceWith(img);
  });
}
function waitImages(root) {
  return Promise.all(Array.prototype.map.call(root.querySelectorAll("img"), function(img) {
    if (img.complete) return null;
    return new Promise(function(r) { img.onload = img.onerror = r; });
  }));
}
async function buildPdf() {
  var clone = document.getElementById("report").cloneNode(true);
  clone.style.cssText = "position:absolute;left:-10000px;top:0;width:720px;background:#fff";
  document.body.appendChild(clone);
  try {
    corsImages(clone);
    await waitImages(clone);
    pdfMissingPhotos = Array.prototype.filter.call(clone.querySelectorAll("img"), function(img) { return !img.naturalWidth; }).length;
    /* A photo that failed CORS would come out as an empty box — leave it out of the PDF
       instead, and say so on the button. */
    Array.prototype.forEach.call(clone.querySelectorAll("img"), function(img) { if (!img.naturalWidth) img.style.visibility = "hidden"; });
    var pdf = new jspdf.jsPDF({unit:"pt", format:"letter"});
    var pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
    var margin = 32, contentW = pageW - margin * 2, ratio = contentW / 720;
    var blocks = Array.prototype.slice.call(clone.querySelectorAll(".blk"));
    var y = margin, prevBottom = null;
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i], rect = el.getBoundingClientRect();
      var gap = prevBottom === null ? 0 : Math.max(0, rect.top - prevBottom) * ratio;
      var h = rect.height * ratio;
      var needed = h;
      if (el.classList.contains("keep-next") && blocks[i + 1]) needed += blocks[i + 1].getBoundingClientRect().bottom * ratio - rect.bottom * ratio;
      if (y > margin && y + gap + needed > pageH - margin) { pdf.addPage(); y = margin; gap = 0; }
      var canvas = await html2canvas(el, {scale:2, useCORS:true, backgroundColor:"#ffffff", logging:false});
      var img = canvas.toDataURL("image/jpeg", 0.85), usable = pageH - margin * 2;
      if (h <= usable) {
        pdf.addImage(img, "JPEG", margin, y + gap, contentW, h);
        y += gap + h;
      } else {
        /* A single block taller than a page (a very long bitácora entry): continue it across
           pages by re-drawing the same image shifted up one page-height each time. */
        if (y > margin) pdf.addPage();
        for (var off = 0; off < h; off += usable) {
          if (off > 0) pdf.addPage();
          pdf.addImage(img, "JPEG", margin, margin - off, contentW, h);
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageW, margin, "F");
          pdf.rect(0, pageH - margin, pageW, margin, "F");
        }
        y = margin + (h % usable || usable);
      }
      prevBottom = rect.bottom;
    }
    pdfFile = new File([pdf.output("blob")], PDF_FILENAME, {type:"application/pdf"});
  } finally {
    clone.remove();
  }
}
function setBtn(text, enabled) {
  var b = document.getElementById("shareBtn");
  b.textContent = text; b.disabled = !enabled;
}
var buildPromise = null;
function prepare() {
  setBtn("Preparando PDF…", false);
  buildPromise = buildPdf().then(function() {
    var canShare = navigator.canShare && navigator.canShare({files:[pdfFile]});
    setBtn((canShare ? "Compartir PDF" : "Descargar PDF") + (pdfMissingPhotos ? " (faltan fotos)" : ""), true);
  }).catch(function(e) {
    console.error(e);
    pdfFile = null;
    setBtn("Reintentar PDF", true);
  });
}
/* On a computer, print the same PDF that gets shared from phones (via a hidden iframe), so a
   printout looks identical no matter which device made it. Phones keep window.print(), since
   printing a PDF inside an iframe isn't reliable there; it's also the fallback if the PDF
   couldn't be built. */
function printReport() {
  if (!window.matchMedia("(pointer:fine)").matches || !buildPromise) { window.print(); return; }
  buildPromise.then(function() {
    if (!pdfFile || pdfMissingPhotos) { window.print(); return; }
    var old = document.getElementById("printFrame");
    if (old) old.remove();
    var f = document.createElement("iframe");
    f.id = "printFrame";
    f.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0";
    f.onload = function() {
      try { f.contentWindow.focus(); f.contentWindow.print(); }
      catch (e) { console.error(e); window.print(); }
    };
    f.src = URL.createObjectURL(pdfFile);
    document.body.appendChild(f);
  });
}
function sharePdf() {
  if (!pdfFile) { prepare(); return; }
  if (navigator.canShare && navigator.canShare({files:[pdfFile]})) {
    navigator.share({files:[pdfFile], title:document.title}).catch(function(e) {
      if (e.name !== "AbortError") { console.error(e); downloadPdf(); }
    });
  } else {
    downloadPdf();
  }
}
function downloadPdf() {
  var url = URL.createObjectURL(pdfFile);
  var a = document.createElement("a");
  a.href = url; a.download = pdfFile.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function() { URL.revokeObjectURL(url); }, 60000);
}
window.addEventListener("load", function() {
  if (window.html2canvas && window.jspdf) prepare();
  else setBtn("PDF no disponible", false);
});
`;

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
html{background:#f2f2f2}
body{font-family:-apple-system,sans-serif;color:#1a1a1a;padding:24px 24px 60px;background:#fff;max-width:768px;min-height:100vh;margin:0 auto}
.topbar{position:sticky;top:0;background:#fff;padding:10px 0;margin:-24px -24px 20px;padding-left:24px;padding-right:24px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;z-index:10}
.topbar button{padding:9px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none}
.topbar button:disabled{opacity:.6;cursor:default}
@media print{.noprint{display:none!important}html{background:#fff}body{padding:16px;max-width:none}}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head><body>
<div class="topbar noprint">
  <button onclick="window.close()" style="background:#f5f5f5;color:#555;border:0.5px solid rgba(0,0,0,0.15)">‹ Cerrar</button>
  <div style="display:flex;gap:8px">
    <button onclick="printReport()" style="background:#f5f5f5;color:#555;border:0.5px solid rgba(0,0,0,0.15)">Imprimir</button>
    <button id="shareBtn" onclick="sharePdf()" disabled style="background:#E87A30;color:#fff">Preparando PDF…</button>
  </div>
</div>
<div id="report">
${buildTopHeader(projectName, dateFrom, dateTo)}
${body}
</div>
<script>var PDF_FILENAME = ${JSON.stringify(pdfFilename(title, dateFrom, dateTo))};</script>
<script>${SHARE_SCRIPT}</script>
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
