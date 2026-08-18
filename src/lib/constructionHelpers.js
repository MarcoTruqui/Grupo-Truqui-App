import { compressImg } from "./firestoreHelpers";

/* ===== Projects ===== */
export async function addConstructionProject(db, name) {
  try {
    await db.collection("constructionProjects").add({name, status:"active", createdAt:new Date().toISOString()});
  } catch (e) { alert("Error: " + e.message); }
}

export async function updateConstructionProject(db, id, data) {
  try { await db.collection("constructionProjects").doc(id).update(data); } catch (e) { alert("Error: " + e.message); }
}

/* ===== Headcount — one doc per project per day, upserted ===== */
export async function saveHeadcountEntry(currentUser, db, projectId, existingId, date, rows) {
  const data = {projectId, date, rows, updatedBy:currentUser.name, updatedAt:new Date().toISOString()};
  try {
    if (existingId) await db.collection("constructionHeadcount").doc(existingId).update(data);
    else await db.collection("constructionHeadcount").add({...data, createdBy:currentUser.name, createdAt:new Date().toISOString()});
  } catch (e) { alert("Error: " + e.message); }
}

export async function removeHeadcountEntry(db, id) {
  try { await db.collection("constructionHeadcount").doc(id).delete(); } catch (e) { alert("Error: " + e.message); }
}

/* ===== Daily logs ===== */
export async function addDailyLog(currentUser, db, projectId, data) {
  try {
    await db.collection("constructionDailyLogs").add({
      projectId, date:data.date, weather:data.weather || "", workPerformed:data.workPerformed || "", issues:data.issues || "",
      createdBy:currentUser.name, createdAt:new Date().toISOString()
    });
  } catch (e) { alert("Error: " + e.message); }
}

export async function removeDailyLog(db, id) {
  try { await db.collection("constructionDailyLogs").doc(id).delete(); } catch (e) { alert("Error: " + e.message); }
}

/* ===== Photos ===== */
export async function addConstructionPhotos(currentUser, storage, db, projectId, photos, category) {
  if (!photos || !photos.length) return;
  const results = await Promise.all(photos.map(async (photo) => {
    try {
      const blob = await compressImg(photo.url, 1400, 0.7);
      const ref = storage.ref(`construction/${projectId}/photos/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`);
      await ref.put(blob, {contentType:"image/jpeg"});
      const url = await ref.getDownloadURL();
      return {projectId, url, category, caption:photo.caption || "", uploadedBy:currentUser.name, uploadedAt:new Date().toISOString()};
    } catch (e) { console.error("Error subiendo foto:", e); return null; }
  }));
  const batch = db.batch();
  results.filter(Boolean).forEach(data => batch.set(db.collection("constructionPhotos").doc(), data));
  await batch.commit();
}

export async function removeConstructionPhoto(db, id) {
  try { await db.collection("constructionPhotos").doc(id).delete(); } catch (e) { alert("Error: " + e.message); }
}

/* ===== Documents / plans / drawings — versioned, raw file upload (PDFs or images) =====
   Each version is its own doc linked via previousDocId/supersededBy. `rootId` stays the
   same across every version in the chain (set to the first version's own id) so anything
   tied to "this drawing" — like detail pins — survives a new version being uploaded. */
export async function uploadConstructionDocument(currentUser, storage, db, projectId, file, category, name, previousDocId, previousVersion, previousRootId) {
  try {
    const ref = storage.ref(`construction/${projectId}/documents/${Date.now()}_${file.name}`);
    await ref.put(file, {contentType:file.type || "application/octet-stream"});
    const url = await ref.getDownloadURL();
    const version = (previousVersion || 0) + 1;
    const isImage = (file.type || "").startsWith("image/");
    const newRef = db.collection("constructionDocuments").doc();
    const rootId = previousRootId || newRef.id;
    await newRef.set({
      projectId, name, category, fileUrl:url, fileName:file.name, isImage, version, isLatest:true,
      previousDocId:previousDocId || null, rootId,
      uploadedBy:currentUser.name, uploadedAt:new Date().toISOString()
    });
    if (previousDocId) await db.collection("constructionDocuments").doc(previousDocId).update({isLatest:false, supersededBy:newRef.id});
  } catch (e) { alert("Error: " + e.message); }
}

export async function removeConstructionDocument(db, id) {
  try { await db.collection("constructionDocuments").doc(id).delete(); } catch (e) { alert("Error: " + e.message); }
}

/* ===== Detail pins — a marked location on an image plan, linking to an annotated on-site
   photo. Tied to the plan's rootId (not one specific version) so pins keep working after a
   new version of the drawing is uploaded. History is an array like subcontractor payments —
   infrequent, sequential updates, no concurrent-edit concern. ===== */
async function uploadDetailPhoto(storage, projectId, dataUrl) {
  const blob = await fetch(dataUrl).then(r => r.blob());
  const ref = storage.ref(`construction/${projectId}/details/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`);
  await ref.put(blob, {contentType:"image/jpeg"});
  return ref.getDownloadURL();
}

export async function addDetailPin(currentUser, storage, db, projectId, rootId, x, y, label, annotatedDataUrl) {
  try {
    const url = await uploadDetailPhoto(storage, projectId, annotatedDataUrl);
    const entry = {photoUrl:url, createdBy:currentUser.name, createdAt:new Date().toISOString()};
    await db.collection("constructionDetails").add({
      projectId, rootId, x, y, label,
      currentPhotoUrl:url, history:[entry],
      createdBy:currentUser.name, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
    });
  } catch (e) { alert("Error: " + e.message); }
}

export async function addDetailVersion(currentUser, storage, db, projectId, detailId, currentHistory, annotatedDataUrl) {
  try {
    const url = await uploadDetailPhoto(storage, projectId, annotatedDataUrl);
    const entry = {photoUrl:url, createdBy:currentUser.name, createdAt:new Date().toISOString()};
    await db.collection("constructionDetails").doc(detailId).update({
      currentPhotoUrl:url, history:[...(currentHistory || []), entry], updatedAt:new Date().toISOString()
    });
  } catch (e) { alert("Error: " + e.message); }
}

export async function removeDetailPin(db, id) {
  try { await db.collection("constructionDetails").doc(id).delete(); } catch (e) { alert("Error: " + e.message); }
}

export async function updateDetailLabel(db, id, label) {
  try { await db.collection("constructionDetails").doc(id).update({label}); } catch (e) { alert("Error: " + e.message); }
}

/* ===== Subcontractors + payments (payments kept as an array on the doc — infrequent, sequential entries, no concurrent-edit concern like cleaning items) ===== */
export async function addSubcontractor(db, projectId, data) {
  try {
    await db.collection("constructionSubcontractors").add({
      projectId, name:data.name, trade:data.trade, totalBudget:Number(data.totalBudget) || 0,
      payments:[], createdAt:new Date().toISOString()
    });
  } catch (e) { alert("Error: " + e.message); }
}

export async function updateSubcontractor(db, id, data) {
  try { await db.collection("constructionSubcontractors").doc(id).update(data); } catch (e) { alert("Error: " + e.message); }
}

export async function removeSubcontractor(db, id) {
  try { await db.collection("constructionSubcontractors").doc(id).delete(); } catch (e) { alert("Error: " + e.message); }
}

export async function addSubPayment(currentUser, db, subId, currentPayments, amount, date, note) {
  const payment = {amount:Number(amount) || 0, date, note:note || "", recordedBy:currentUser.name, createdAt:new Date().toISOString()};
  try {
    await db.collection("constructionSubcontractors").doc(subId).update({payments:[...(currentPayments || []), payment]});
  } catch (e) { alert("Error: " + e.message); }
}

export async function removeSubPayment(db, subId, currentPayments, idx) {
  const updated = currentPayments.filter((_, i) => i !== idx);
  try { await db.collection("constructionSubcontractors").doc(subId).update({payments:updated}); } catch (e) { alert("Error: " + e.message); }
}
