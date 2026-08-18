import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { buildRoomChecklist, buildDailyChecklist, STATUS_LABEL, FAKE_DOMAIN } from "./constants";
import { firebaseConfig } from "./firebase";

export function getVacationDaysBySeniority(hireDate) {
  if (!hireDate) return null;
  const yrs = Math.floor((Date.now() - new Date(hireDate+"T12:00:00").getTime()) / (365.25*24*60*60*1000));
  if (yrs < 1)  return 0;   // menos de 1 año — sin vacaciones aún
  if (yrs < 2)  return 12;  // 1 año cumplido
  if (yrs < 3)  return 14;  // 2 años cumplidos
  if (yrs < 4)  return 16;  // 3 años cumplidos
  if (yrs < 5)  return 18;  // 4 años cumplidos
  if (yrs < 6)  return 20;  // 5 años cumplidos
  if (yrs < 11) return 22;  // 6–10 años cumplidos
  if (yrs < 16) return 24;  // 11–15 años cumplidos
  if (yrs < 21) return 26;  // 16–20 años cumplidos
  if (yrs < 26) return 28;  // 21–25 años cumplidos
  if (yrs < 31) return 30;  // 26–30 años cumplidos
  if (yrs < 36) return 32;  // 31–35 años cumplidos
  return 32;
}

export function getCurrentAnniversaryYear(hireDate) {
  if(!hireDate) return 0;
  return Math.floor((Date.now()-new Date(hireDate+"T12:00:00").getTime())/(365.25*24*60*60*1000));
}

/* Sundays never count as a vacation day, even if present in selectedDays (legacy data, edge cases) */
export function isSundayISO(iso) {
  if (!iso) return false;
  return new Date(iso+"T12:00:00").getDay() === 0;
}
export function countPTODays(days) {
  return (days||[]).filter(d => !isSundayISO(d)).length;
}

export function getPTOBalance(uid,users,ptoRequests) {
  const u=users.find(x=>x.id===uid);
  const seniority = getVacationDaysBySeniority(u?.hireDate);
  // use manual override if set, otherwise seniority, otherwise fallback
  const annual = (u?.vacationDaysOverride!=null) ? u.vacationDaysOverride : (seniority !== null ? seniority : 15);
  const yr=new Date().getFullYear();
  const ys=yr+"-01-01",ye=yr+"-12-31";
  const reqs=ptoRequests.filter(r=>r.userId===uid);
  const usedFromReqs=reqs.filter(r=>r.status==="approved").flatMap(r=>r.selectedDays||[]).filter(d=>d>=ys&&d<=ye&&!isSundayISO(d)).length;
  const curYr=getCurrentAnniversaryYear(u?.hireDate);
  const carryoverValid=u?.carryoverYearsCompleted===curYr;
  const carryover=carryoverValid?(u?.vacationUsedCarryover||0):0;
  const borrowed=carryoverValid?(u?.vacationBorrowed||0):0;
  const used=usedFromReqs+carryover;
  const pending=reqs.filter(r=>["pending_supervisor","pending_admin"].includes(r.status)).flatMap(r=>r.selectedDays||[]).filter(d=>d>=ys&&d<=ye&&!isSundayISO(d)).length;
  const available=annual+borrowed-used-pending;
  return {annual,used,pending,borrowed,available};
}

export async function submitPTO(currentUser,role,db,selectedDays,reason) {
  const targetStatus=["maintenance","cleaning"].includes(role)?"pending_supervisor":"pending_admin";
  try {
    await db.collection("pto_requests").add({
      userId:currentUser.id,userName:currentUser.name,userRole:role,
      selectedDays:selectedDays.sort(),reason:reason||"",
      status:targetStatus,supervisorDecision:null,adminDecision:null,
      submittedAt:new Date().toISOString()
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function supervisorDecide(currentUser,db,reqId,approved,comment) {
  try {
    await db.collection("pto_requests").doc(reqId).update({
      status:approved?"pending_admin":"declined",
      supervisorDecision:{by:currentUser.name,comment:comment||"",at:new Date().toISOString(),approved}
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function adminDecide(currentUser,db,reqId,approved,comment) {
  try {
    await db.collection("pto_requests").doc(reqId).update({
      status:approved?"approved":"declined",
      adminDecision:{by:currentUser.name,comment:comment||"",at:new Date().toISOString(),approved}
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function cancelPTO(db,reqId) {
  try {
    await db.collection("pto_requests").doc(reqId).update({status:"cancelled"});
  } catch(e){alert("Error: "+e.message);}
}

export function getCompBalance(uid, compWork, compRequests, users) {
  const u=users?users.find(x=>x.id===uid):null;
  const earnedFromWork = compWork.filter(r=>r.userId===uid&&r.status==="approved").reduce((s,r)=>s+(r.daysGranted||0),0);
  const curYr=u?getCurrentAnniversaryYear(u.hireDate):0;
  const compCarryover=(u&&u.carryoverYearsCompleted===curYr)?(u.compEarnedCarryover||0):0;
  const earned=earnedFromWork+compCarryover;
  const used = compRequests.filter(r=>r.userId===uid&&r.status==="approved").reduce((s,r)=>s+(r.selectedDays||[]).length,0);
  const pending = compRequests.filter(r=>r.userId===uid&&["pending_supervisor","pending_admin"].includes(r.status)).reduce((s,r)=>s+(r.selectedDays||[]).length,0);
  return {earned, used, pending, available:Math.max(0,earned-used-pending)};
}

export async function submitCompWork(currentUser,role,db,workDate,workType,reason,property) {
  const status = ["maintenance","cleaning"].includes(role)?"pending_supervisor":"pending_admin";
  try {
    await db.collection("comp_work").add({
      userId:currentUser.id, userName:currentUser.name, userRole:role,
      type:workType, workDate, reason:reason||"", property:property||"",
      daysGranted:null, status,
      supervisorDecision:null, adminDecision:null,
      submittedAt:new Date().toISOString()
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function supervisorDecideCompWork(currentUser,db,reqId,approved,comment) {
  try {
    await db.collection("comp_work").doc(reqId).update({
      status:approved?"pending_admin":"declined",
      supervisorDecision:{by:currentUser.name,comment:comment||"",at:new Date().toISOString(),approved}
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function adminDecideCompWork(currentUser,db,reqId,approved,comment,daysGranted) {
  try {
    await db.collection("comp_work").doc(reqId).update({
      status:approved?"approved":"declined",
      daysGranted:approved?(daysGranted||1):null,
      adminDecision:{by:currentUser.name,comment:comment||"",at:new Date().toISOString(),approved,daysGranted:approved?(daysGranted||1):null}
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function submitCompRequest(currentUser,role,db,selectedDays,reason) {
  const status = ["maintenance","cleaning"].includes(role)?"pending_supervisor":"pending_admin";
  try {
    await db.collection("comp_requests").add({
      userId:currentUser.id, userName:currentUser.name, userRole:role,
      selectedDays:selectedDays.sort(), reason:reason||"",
      status, supervisorDecision:null, adminDecision:null,
      submittedAt:new Date().toISOString()
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function supervisorDecideCompReq(currentUser,db,reqId,approved,comment) {
  try {
    await db.collection("comp_requests").doc(reqId).update({
      status:approved?"pending_admin":"declined",
      supervisorDecision:{by:currentUser.name,comment:comment||"",at:new Date().toISOString(),approved}
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function adminDecideCompReq(currentUser,db,reqId,approved,comment) {
  try {
    await db.collection("comp_requests").doc(reqId).update({
      status:approved?"approved":"declined",
      adminDecision:{by:currentUser.name,comment:comment||"",at:new Date().toISOString(),approved}
    });
  } catch(e){alert("Error: "+e.message);}
}

export async function cancelCompRequest(db,reqId) {
  try { await db.collection("comp_requests").doc(reqId).update({status:"cancelled"}); }
  catch(e){alert("Error: "+e.message);}
}

/* ===== Cleaning module — these were nested inside App() in the source file and closed
   over db/currentUser/role/properties/storage directly. Extracted here as standalone
   functions, they take those as explicit leading params instead. ===== */

export async function uploadDataUrl(storage, dataUrl, path) {
  const blob = await fetch(dataUrl).then(r => r.blob());
  const ref = storage.ref(path);
  await ref.put(blob, {contentType:"image/png"});
  return ref.getDownloadURL();
}

export async function startOrJoinCleaning(currentUser, role, db, properties, propertyName, cleaningType) {
  const existing = await db.collection("cleanings").where("property", "==", propertyName).where("status", "==", "in_progress").limit(1).get();
  if (!existing.empty) {
    const doc = existing.docs[0];
    const data = doc.data();
    if (!(data.workers || []).some(w => w.userId === currentUser.id)) {
      const updated = [...(data.workers || []), {userId:currentUser.id, name:currentUser.name, role, signature:null, signedAt:null, joinedAt:new Date().toISOString()}];
      await doc.ref.update({workers:updated});
    }
    return doc.id;
  }
  const propRec = properties.find(p => p.name === propertyName);
  const rooms = cleaningType === "daily" ? buildDailyChecklist(propRec) : buildRoomChecklist(propRec);
  const totalItems = rooms.reduce((sum, r) => sum + r.items.length, 0);
  const docRef = await db.collection("cleanings").add({
    property:propertyName,
    cleaningType:cleaningType || "checkout",
    status:"in_progress",
    workers:[{userId:currentUser.id, name:currentUser.name, role, signature:null, signedAt:null, joinedAt:new Date().toISOString()}],
    startedAt:new Date().toISOString(),
    completedAt:null,
    totalItems,
    doneItems:0,
    createdBy:currentUser?.name || "Desconocido",
    createdByRole:role,
    createdAt:new Date().toISOString()
  });
  const batch = db.batch();
  rooms.forEach((room, roomOrder) => {
    room.items.forEach((item, itemOrder) => {
      const itemRef = docRef.collection("items").doc(`${room.id}__${item.id}`);
      batch.set(itemRef, {roomId:room.id, roomLabel:room.label, roomOrder, itemKey:item.id, itemLabel:item.label, itemOrder, status:"pending", checkedBy:null, checkedByName:null, checkedAt:null, note:"", linkedTaskId:null});
    });
  });
  await batch.commit();
  return docRef.id;
}

export async function setItemStatus(currentUser, db, cleaningId, itemDocId, status, note, meta) {
  const itemRef = db.collection("cleanings").doc(cleaningId).collection("items").doc(itemDocId);
  const snap = await itemRef.get();
  const prev = snap.data() || {};
  const wasPending = !prev.status || prev.status === "pending";
  const nowPending = !status || status === "pending";
  await itemRef.update({status, checkedBy:nowPending ? null : currentUser.id, checkedByName:nowPending ? null : currentUser.name, checkedAt:nowPending ? null : new Date().toISOString(), note:note || ""});
  if (wasPending && !nowPending) await db.collection("cleanings").doc(cleaningId).update({doneItems:firebase.firestore.FieldValue.increment(1)});
  if (!wasPending && nowPending) await db.collection("cleanings").doc(cleaningId).update({doneItems:firebase.firestore.FieldValue.increment(-1)});
  if (status === "red" && !prev.linkedTaskId) {
    const taskRef = await db.collection("tasks").add({
      title:`${meta.itemLabel} — ${meta.roomLabel}`,
      property:meta.property,
      priority:"Medium",
      status:"Open",
      desc:`Reportado automáticamente durante limpieza por ${currentUser.name}.${note ? " Nota: " + note : ""}`,
      createdBy:currentUser?.name || "Desconocido",
      source:"cleaning",
      sourceCleaningId:cleaningId,
      sourceRoomLabel:meta.roomLabel,
      history:[{action:"Tarea creada automáticamente desde limpieza", by:currentUser?.name || "Desconocido", date:new Date().toISOString()}],
      comments:[],
      photos:[],
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    });
    await itemRef.update({linkedTaskId:taskRef.id});
  }
}

export async function joinCleaningWorker(currentUser, role, db, cleaningId, currentWorkers, targetUser) {
  const u = targetUser || currentUser;
  if (currentWorkers.some(w => w.userId === u.id)) return;
  const updated = [...currentWorkers, {userId:u.id, name:u.name, role:u.role || role, signature:null, signedAt:null, joinedAt:new Date().toISOString()}];
  await db.collection("cleanings").doc(cleaningId).update({workers:updated});
}

export async function removeCleaningWorker(db, cleaningId, currentWorkers, idx) {
  if (currentWorkers.length <= 1) return;
  const updated = currentWorkers.filter((_, i) => i !== idx);
  await db.collection("cleanings").doc(cleaningId).update({workers:updated});
}

export async function signCleaningWorker(storage, db, cleaningId, currentWorkers, workerIdx, signatureDataUrl) {
  const signatureUrl = await uploadDataUrl(storage, signatureDataUrl, `cleanings/${cleaningId}/signatures/${Date.now()}_${workerIdx}.png`);
  const updated = currentWorkers.map((w, i) => i === workerIdx ? {...w, signature:signatureUrl, signedAt:new Date().toISOString()} : w);
  const allSigned = updated.length > 0 && updated.every(w => w.signature);
  const extra = allSigned ? {status:"completed", completedAt:new Date().toISOString()} : {};
  await db.collection("cleanings").doc(cleaningId).update({workers:updated, ...extra});
}

export async function cancelCleaning(db, cleaningId) {
  const itemsSnap = await db.collection("cleanings").doc(cleaningId).collection("items").get();
  const commentsSnap = await db.collection("cleanings").doc(cleaningId).collection("comments").get();
  const batch = db.batch();
  itemsSnap.docs.forEach(d => batch.delete(d.ref));
  commentsSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(db.collection("cleanings").doc(cleaningId));
  await batch.commit();
  const linkedTasks = await db.collection("tasks").where("sourceCleaningId", "==", cleaningId).get();
  await Promise.all(linkedTasks.docs.map(d => d.ref.delete()));
}

export async function addCleaningComment(currentUser, db, cleaningId, roomId, text) {
  const t = (text || "").trim();
  if (!t) return;
  await db.collection("cleanings").doc(cleaningId).collection("comments").add({
    roomId,
    text:t,
    authorId:currentUser.id,
    authorName:currentUser.name,
    createdAt:new Date().toISOString()
  });
}

/* ===== Tasks / properties / users / photos — these were defined directly inside App() in the
   source file and closed over currentUser/db/storage. Extracted here as standalone functions
   with those as explicit leading params. Two of them (advance, addTask via advance) also used
   to call setSelTask/setApprovalSel locally inside App() after the write — that local-state
   sync stays in App.jsx as a thin wrapper around the pure write here, since a shared module
   can't reach into a component's state. ===== */

export function hEntry(currentUser, action) {
  return {action, by:currentUser?.name || "Desconocido", date:new Date().toISOString()};
}

export async function advance(currentUser, db, id, status, extra = {}) {
  const hist = [...(extra._hist || []), hEntry(currentUser, `Estado → ${STATUS_LABEL[status] || status}`)];
  delete extra._hist;
  try {
    await db.collection("tasks").doc(id).update({status, ...extra, history:firebase.firestore.FieldValue.arrayUnion(...hist), updatedAt:new Date().toISOString()});
  } catch (e) { alert("Error: " + e.message); }
}

export function compressImg(dataUrl, maxW = 1000, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      c.toBlob(blob => { resolve(blob || new Blob()); }, "image/jpeg", quality);
    };
    img.onerror = () => fetch(dataUrl).then(r => r.blob()).then(resolve);
    img.src = dataUrl;
  });
}

export async function uploadPhotos(storage, photos, folder) {
  if (!photos || !photos.length) return [];
  const results = await Promise.all(photos.map(async (photo) => {
    try {
      const blob = await compressImg(photo.url);
      const ref = storage.ref(`${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${photo.name.replace(/\.[^.]+$/, "")}.jpg`);
      await ref.put(blob, {contentType:"image/jpeg"});
      const url = await ref.getDownloadURL();
      return {url, name:photo.name, caption:photo.caption || ""};
    } catch (e) {
      console.error("Error subiendo:", e);
      return null;
    }
  }));
  return results.filter(Boolean);
}

export function bgUpload(storage, db, photos, folder, taskId, field) {
  if (!photos || !photos.length) return;
  uploadPhotos(storage, photos, folder).then(uploaded => {
    if (uploaded.length) db.collection("tasks").doc(taskId).update({[field]:firebase.firestore.FieldValue.arrayUnion(...uploaded), updatedAt:new Date().toISOString()}).catch(e => console.error("BG upload:", e));
  }).catch(e => console.error("BG upload:", e));
}

export async function addTask(currentUser, storage, db, data, localPhotos = []) {
  try {
    const docRef = await db.collection("tasks").add({...data, photos:[], history:[hEntry(currentUser, "Tarea creada")], comments:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()});
    if (localPhotos.length) bgUpload(storage, db, localPhotos, `tasks/${docRef.id}`, docRef.id, "photos");
  } catch (e) { alert("Error guardando tarea: " + e.message); }
}

export async function removeTask(db, id) {
  try { await db.collection("tasks").doc(id).delete(); } catch (e) { alert("Error: " + e.message); }
}

export async function addComment(currentUser, storage, db, taskId, text, photos = [], type = "comment") {
  const comment = {text, author:currentUser?.name || "Desconocido", date:new Date().toISOString(), photos:[], type};
  try {
    await db.collection("tasks").doc(taskId).update({comments:firebase.firestore.FieldValue.arrayUnion(comment), history:firebase.firestore.FieldValue.arrayUnion(hEntry(currentUser, type === "approval" ? "Acción de aprobación" : "Agregó un comentario")), updatedAt:new Date().toISOString()});
    if (photos.length) {
      uploadPhotos(storage, photos, `tasks/${taskId}/comments`).then(uploaded => {
        if (!uploaded.length) return;
        db.collection("tasks").doc(taskId).get().then(doc => {
          if (!doc.exists) return;
          const cmts = [...(doc.data().comments || [])];
          const idx = cmts.findIndex(c => c.date === comment.date && c.author === comment.author && c.text === comment.text);
          if (idx > -1) { cmts[idx] = {...cmts[idx], photos:uploaded}; db.collection("tasks").doc(taskId).update({comments:cmts}); }
        });
      }).catch(e => console.error("Fotos comentario:", e));
    }
  } catch (e) { alert("Error: " + e.message); }
}

export async function addProperty(db, properties, name, bedrooms = null, bathrooms = null) {
  try { await db.collection("properties").add({name, bedrooms, bathrooms, order:properties.length, createdAt:new Date().toISOString()}); } catch (e) { alert("Error: " + e.message); }
}

export async function removeProperty(db, id, name) {
  try {
    await db.collection("properties").doc(id).delete();
    const snap = await db.collection("tasks").where("property", "==", name).get();
    await Promise.all(snap.docs.map(d => d.ref.delete()));
  } catch (e) { alert("Error: " + e.message); }
}

export async function renameProperty(db, propId, oldName, newName) {
  const t = newName.trim();
  if (!t || t === oldName) return false;
  try {
    await db.collection("properties").doc(propId).update({name:t});
    const snap = await db.collection("tasks").where("property", "==", oldName).get();
    await Promise.all(snap.docs.map(d => d.ref.update({property:t})));
    return true;
  } catch (e) { alert("Error: " + e.message); return false; }
}

export async function updateProperty(db, id, data) {
  try { await db.collection("properties").doc(id).update(data); } catch (e) { alert("Error: " + e.message); }
}

const AUTH_ERROR_MESSAGES = {
  "auth/email-already-in-use": "Ese nombre de usuario ya existe.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-email": "Nombre de usuario inválido."
};

/* Creating another user's login normally signs the ADMIN out and into the new
   account (Firebase Auth's client SDK ties account-creation to sign-in). A
   throwaway secondary app instance dodges that — it creates the account on its
   own isolated auth session, then gets torn down, leaving the admin's real
   session untouched. No backend/Cloud Function needed. */
export async function addUser(db, data) {
  const username = data.username.trim().toLowerCase();
  const email = username + FAKE_DOMAIN;
  const secondaryApp = firebase.initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  try {
    await secondaryApp.auth().createUserWithEmailAndPassword(email, data.password);
    await db.collection("users").add({
      name:data.name, username, role:data.role, properties:data.properties || [],
      email, hireDate:data.hireDate || new Date().toISOString().slice(0, 10),
      createdAt:new Date().toISOString()
    });
  } catch (e) {
    throw new Error(AUTH_ERROR_MESSAGES[e.code] || e.message);
  } finally {
    try { await secondaryApp.auth().signOut(); } catch {}
    try { await secondaryApp.delete(); } catch {}
  }
}

export async function updateUser(db, id, data) {
  try { await db.collection("users").doc(id).update(data); } catch (e) { alert("Error: " + e.message); }
}

export async function removeUser(db, id) {
  try { await db.collection("users").doc(id).delete(); } catch (e) { alert("Error: " + e.message); }
}
