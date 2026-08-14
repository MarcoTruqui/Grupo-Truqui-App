import { useState, useEffect } from "react";
import { db, auth, storage } from "./lib/firebase";
import { FAKE_DOMAIN, HR_ONLY_ROLES, COLOR_FRAMES, PRI_ORD, STATUS_LABEL, ROLE_META } from "./lib/constants";
import { exportPDF } from "./lib/exportPDF";
import {
  hEntry as hEntryFn, advance as advanceFn, addTask as addTaskFn, removeTask as removeTaskFn,
  addComment as addCommentFn, addProperty as addPropertyFn, removeProperty as removePropertyFn,
  renameProperty as renamePropertyFn, updateProperty as updatePropertyFn,
  updateUser as updateUserFn, removeUser as removeUserFn, bgUpload as bgUploadFn,
  startOrJoinCleaning as startOrJoinCleaningFn, setItemStatus as setItemStatusFn,
  joinCleaningWorker as joinCleaningWorkerFn, removeCleaningWorker as removeCleaningWorkerFn,
  signCleaningWorker as signCleaningWorkerFn, cancelCleaning as cancelCleaningFn,
  addCleaningComment as addCleaningCommentFn
} from "./lib/firestoreHelpers";
import { getOccupancy as getOccupancyFn, getPropBookingDetails as getPropBookingDetailsFn } from "./lib/bookingHelpers";

import { LoginScreen } from "./components/LoginScreen";
import { PortalSelector } from "./components/PortalSelector";
import { AdminPortal } from "./components/admin/AdminPortal";
import { CleaningPortal } from "./components/cleaning/CleaningPortal";
import { Av } from "./components/shared/Avatar";
import { RBadge, PBadge, SBadge, AutoCleaningBadge } from "./components/shared/Badges";
import { SearchBar } from "./components/shared/SearchBar";
import { PhotoUpload } from "./components/shared/PhotoUpload";
import { ZoomLightbox } from "./components/shared/ZoomLightbox";
import { HomeIcon, PropIcon, TaskIcon, ApprIcon, SettIcon, CalIcon } from "./components/shared/Icons";
import { NewTaskSheet } from "./components/maintenance/NewTaskSheet";
import { TaskSheet } from "./components/maintenance/TaskSheet";
import { ApprovalSheet } from "./components/maintenance/ApprovalSheet";
import { AddPropSheet } from "./components/maintenance/AddPropSheet";
import { EditPropSheet } from "./components/maintenance/EditPropSheet";
import { ImportRoomsSheet } from "./components/maintenance/ImportRoomsSheet";
import { AvailabilityScreen } from "./components/maintenance/AvailabilityScreen";
import { PropCardItem } from "./components/maintenance/PropCardItem";
import { TaskRow } from "./components/maintenance/TaskRow";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("home");
  const [filter, setFilter] = useState("all");
  const [activeProp, setActiveProp] = useState(null);
  const [propFilter, setPropFilter] = useState("all");
  const [selTask, setSelTask] = useState(null);
  const [approvalSel, setApprovalSel] = useState(null);
  const [modal, setModal] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [lightboxCaption, setLightboxCaption] = useState("");
  const [pendingApprovalTask, setPendingApprovalTask] = useState(null);
  const [approvalTxt, setApprovalTxt] = useState("");
  const [approvalPhotos, setApprovalPhotos] = useState([]);
  const [editingProp, setEditingProp] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [bookingsFetchErr, setBookingsFetchErr] = useState(false);
  const [bookingsFetchTrigger, setBookingsFetchTrigger] = useState(0);
  const [availProp, setAvailProp] = useState("");
  const [portal, setPortal] = useState(null);
  const [ptoRequests, setPtoRequests] = useState([]);
  const [compWork, setCompWork] = useState([]);
  const [compRequests, setCompRequests] = useState([]);
  const [cleanings, setCleanings] = useState([]);
  const [ptoLastSeen, setPtoLastSeen] = useState(() => localStorage.getItem(`pto_seen_${currentUser?.id}`) || "");

  function markPTOSeen() {
    const now = new Date().toISOString();
    localStorage.setItem(`pto_seen_${currentUser.id}`, now);
    setPtoLastSeen(now);
  }

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async u => {
      if (u) {
        setAuthUser(u);
        try {
          const snap = await db.collection("users").get();
          const all = snap.docs.map(d => ({id:d.id, ...d.data()}));
          setCurrentUser(all.find(x => (x.username + FAKE_DOMAIN) === u.email) || null);
          setUsers(all);
        } catch (e) { console.error(e); }
      } else {
        setAuthUser(null); setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const u1 = db.collection("users").onSnapshot(s => {
      const all = s.docs.map(d => ({id:d.id, ...d.data()}));
      setUsers(all);
      setCurrentUser(all.find(x => (x.username + FAKE_DOMAIN) === authUser.email) || null);
    });
    const u2 = db.collection("properties").onSnapshot(s => setProperties(s.docs.map(d => ({id:d.id, ...d.data()})).sort((a, b) => (a.order || 0) - (b.order || 0))));
    const u3 = db.collection("tasks").onSnapshot(s => setTasks(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const u4 = db.collection("pto_requests").onSnapshot(s => setPtoRequests(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const u5 = db.collection("comp_work").onSnapshot(s => setCompWork(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const u6 = db.collection("comp_requests").onSnapshot(s => setCompRequests(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const u7 = db.collection("cleanings").onSnapshot(s => setCleanings(s.docs.map(d => ({id:d.id, ...d.data()}))));
    return () => { u1(); u2(); u3(); u4(); u5(); u6(); u7(); };
  }, [authUser]);

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSWaU6yrlhxjuejbroYlkzTYUKOTbhxzE1URtlJgKwB_t65aemd_M6neZ7euOxJ09lzoNcZ5Dt2g4Yq/pub?gid=311856994\x26single=true\x26output=csv";

  useEffect(() => {
    function fetchBookings() {
      fetch(SHEET_URL).then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(csv => {
        console.log("CSV recibido, líneas:", csv.split("\n").length);
        const lines = csv.split("\n").map(l => {
          const result = []; let cur = ""; let inQ = false;
          for (let i = 0; i < l.length; i++) {
            const c = l[i];
            if (c === '"') { inQ = !inQ; }
            else if (c === "," && !inQ) { result.push(cur.trim()); cur = ""; }
            else { cur += c; }
          }
          result.push(cur.trim());
          return result;
        });
        if (lines.length < 2) return;
        const header = lines[0].map(h => h.replace(/"/g, "").trim().toLowerCase());
        const pi = header.findIndex(h => h.includes("propiedad"));
        const di = header.findIndex(h => h.includes("llegada"));
        const si = header.findIndex(h => h.includes("salida"));
        const sti = header.findIndex(h => h.includes("status"));
        if (pi < 0 || di < 0 || si < 0) return;
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const r = lines[i]; if (!r || r.length <= pi) continue;
          const prop = (r[pi] || "").replace(/"/g, "").trim();
          const checkin = (r[di] || "").replace(/"/g, "").trim();
          const checkout = (r[si] || "").replace(/"/g, "").trim();
          const status = sti >= 0 ? (r[sti] || "").replace(/"/g, "").trim() : "";
          if (!prop || !checkin || !checkout) continue;
          if (status.toLowerCase().includes("cancel")) continue;
          parsed.push({prop, checkin, checkout});
        }
        setBookings(parsed); setBookingsLoaded(true);
        if (parsed.length) console.log("Reservaciones:", parsed.length, "Primera:", JSON.stringify(parsed[0]));
      }).catch(e => { console.error("Error cargando reservaciones:", e); setBookingsFetchErr(true); });
    }
    setBookingsFetchErr(false);
    fetchBookings();
    const iv = setInterval(fetchBookings, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [bookingsFetchTrigger]);

  const role = (currentUser?.role || "maintenance").toLowerCase().trim();
  const canApprove = role === "admin";
  const canViewApprovals = ["admin","supervisor"].includes(role);
  const canExport = ["admin","supervisor"].includes(role);
  const canAssign = ["admin","supervisor"].includes(role);
  const canRequestApproval = ["admin","supervisor"].includes(role);
  const canChangeStatus = ["admin","supervisor","maintenance"].includes(role);
  const canResolve = ["admin","supervisor","maintenance"].includes(role);
  const canViewSensitive = ["admin","supervisor"].includes(role);
  const isAdmin = role === "admin";
  const isCleaning = role === "cleaning";
  const isMaintenance = role === "maintenance";
  const canLogCleaning = ["cleaning","supervisor","admin"].includes(role);

  const allPropNames = properties.map(p => p.name);
  const userAssignedProps = currentUser?.properties || [];
  const propNames = isCleaning ? allPropNames.filter(p => userAssignedProps.includes(p)) : allPropNames;
  const visibleTasks = isCleaning ? tasks.filter(t => userAssignedProps.includes(t.property)) : tasks;
  const propColorMap = {};
  allPropNames.forEach((p, i) => { propColorMap[p] = COLOR_FRAMES[i % COLOR_FRAMES.length]; });
  const approvalCount = visibleTasks.filter(t => t.status === "Needs Approval").length;
  const wfSteps = ["Open","In Progress","Needs Approval","Approved","Resolved"];

  function sortT(list) {
    return [...list].sort((a, b) => {
      if (sortBy === "priority") return (PRI_ORD[a.priority] || 2) - (PRI_ORD[b.priority] || 2);
      if (sortBy === "name") return (a.title || "").localeCompare(b.title || "");
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  }

  function filterS(list) {
    if (!searchQ.trim()) return list;
    const q = searchQ.toLowerCase();
    return list.filter(t => (t.title || "").toLowerCase().includes(q) || (t.property || "").toLowerCase().includes(q) || (t.assignee || "").toLowerCase().includes(q) || (t.desc || "").toLowerCase().includes(q));
  }

  /* ===== Bound wrappers — these were nested inside App() as closures in the source file.
     The underlying Firestore logic now lives in lib/firestoreHelpers.js / lib/bookingHelpers.js
     as standalone functions taking currentUser/db/storage/etc. explicitly; these wrappers bind
     those in and preserve the exact call signatures the child components already expect. */

  function hEntry(action) { return hEntryFn(currentUser, action); }

  async function advance(id, status, extra = {}) {
    await advanceFn(currentUser, db, id, status, extra);
    setSelTask(s => s && s.id === id ? {...s, status, ...extra} : s);
    setApprovalSel(s => s && s.id === id ? {...s, status, ...extra} : s);
  }

  function bgUpload(photos, folder, taskId, field) { return bgUploadFn(storage, db, photos, folder, taskId, field); }

  async function addTask(data, localPhotos = []) { await addTaskFn(currentUser, storage, db, data, localPhotos); }
  async function removeTask(id) { await removeTaskFn(db, id); }
  async function addComment(taskId, text, photos = [], type = "comment") { await addCommentFn(currentUser, storage, db, taskId, text, photos, type); }

  async function addProperty(name, bedrooms = null, bathrooms = null) { await addPropertyFn(db, properties, name, bedrooms, bathrooms); }
  async function removeProperty(id, name) { await removePropertyFn(db, id, name); }
  async function renameProperty(propId, oldName, newName) { return await renamePropertyFn(db, propId, oldName, newName); }
  async function updateProperty(id, data) { await updatePropertyFn(db, id, data); }

  async function updateUser(id, data) { await updateUserFn(db, id, data); }
  async function removeUser(id) { await removeUserFn(db, id); }

  async function startOrJoinCleaning(propertyName, cleaningType) { return await startOrJoinCleaningFn(currentUser, role, db, properties, propertyName, cleaningType); }
  async function setItemStatus(cleaningId, itemDocId, status, note, meta) { return await setItemStatusFn(currentUser, db, cleaningId, itemDocId, status, note, meta); }
  async function joinCleaningWorker(cleaningId, currentWorkers, targetUser) { return await joinCleaningWorkerFn(currentUser, role, db, cleaningId, currentWorkers, targetUser); }
  async function removeCleaningWorker(cleaningId, currentWorkers, idx) { return await removeCleaningWorkerFn(db, cleaningId, currentWorkers, idx); }
  async function signCleaningWorker(cleaningId, currentWorkers, workerIdx, signatureDataUrl) { return await signCleaningWorkerFn(storage, db, cleaningId, currentWorkers, workerIdx, signatureDataUrl); }
  async function cancelCleaning(cleaningId) { return await cancelCleaningFn(db, cleaningId); }
  async function addCleaningComment(cleaningId, roomId, text) { return await addCleaningCommentFn(currentUser, db, cleaningId, roomId, text); }

  function getOccupancy(propName) { return getOccupancyFn(bookings, bookingsLoaded, propName); }
  function getPropBookingDetails(propName) { return getPropBookingDetailsFn(bookings, bookingsLoaded, propName); }

  function openLB(url, caption) { setLightbox(url); setLightboxCaption(caption || ""); }

  if (authLoading) return <div style={{height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#888"}}>Cargando...</div>;
  if (!authUser) return <LoginScreen/>;
  if (!currentUser) return <div style={{height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#888", padding:24, textAlign:"center", flexDirection:"column", gap:16}}>
    <div>Perfil de usuario no encontrado. Contacta a tu administrador.</div>
    <button onClick={() => auth.signOut()} style={{padding:"12px 28px", borderRadius:10, border:"none", background:"#534AB7", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer"}}>Cerrar sesión</button>
  </div>;

  if (!portal) {
    if (HR_ONLY_ROLES.includes(role)) { setPortal("admin"); return null; }
    return <PortalSelector user={currentUser} onSelect={setPortal} canCleaning={canLogCleaning}/>;
  }
  if (portal === "admin") return <AdminPortal currentUser={currentUser} role={role} users={users} ptoRequests={ptoRequests} compWork={compWork} compRequests={compRequests} db={db} onSwitch={!HR_ONLY_ROLES.includes(role) ? ()=>setPortal(null) : null} onMarkSeen={markPTOSeen} allPropNames={allPropNames} propColorMap={propColorMap} updateUser={updateUser} removeUser={removeUser}/>;
  if (portal === "cleaning") return <CleaningPortal db={db} currentUser={currentUser} role={role} allPropNames={allPropNames} propColorMap={propColorMap} users={users} cleanings={cleanings} startOrJoinCleaning={startOrJoinCleaning} setItemStatus={setItemStatus} joinCleaningWorker={joinCleaningWorker} removeCleaningWorker={removeCleaningWorker} signCleaningWorker={signCleaningWorker} cancelCleaning={cancelCleaning} addCleaningComment={addCleaningComment} onSwitch={()=>setPortal(null)}/>;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = visibleTasks.filter(t => t.createdAt && t.createdAt.slice(0, 10) === todayStr);
  const filteredTasks = sortT(filterS(filter === "all" ? visibleTasks : visibleTasks.filter(t => t.status === filter)));
  const propTasks = activeProp ? visibleTasks.filter(t => t.property === activeProp) : [];
  const shownPropTasks = sortT(filterS(propFilter === "all" ? propTasks : propTasks.filter(t => t.status === propFilter)));
  const activeTab2 = tab === "property" ? "properties" : tab;

  const propCardProps = {propColorMap, visibleTasks, properties, todayStr, getOccupancy, setActiveProp, setPropFilter, setTab, isAdmin, setEditingProp, removeProperty};
  const taskRowProps = {canViewSensitive, setSelTask};

  return <div className="shell">
    {!isOnline && <div className="offline-bar">Sin conexión — los cambios se sincronizarán al reconectar</div>}

    {tab === "home" && <>
      <div className="topbar">
        <div className="topbar-row">
          <div><div className="topbar-title">Grupo Truqui</div><div className="topbar-sub">Bienvenido, {currentUser.name.split(" ")[0]}</div></div>
          <RBadge role={role}/>
        </div>
      </div>
      <div className="screen">
        <div className="stat-grid">
          {[["Open", visibleTasks.filter(t => t.status === "Open").length, "#D85A30"], ["In Progress", visibleTasks.filter(t => t.status === "In Progress").length, "#BA7517"], ["Needs Approval", visibleTasks.filter(t => t.status === "Needs Approval").length, "#534AB7"], ["Resolved", visibleTasks.filter(t => t.status === "Resolved").length, "#1D9E75"]].map(([l, v, c]) =>
            <div key={l} className="stat-card"><div className="stat-label"><span className="stat-dot" style={{background:c}}/>{STATUS_LABEL[l] || l}</div><div className="stat-value" style={{color:c}}>{v}</div></div>
          )}
        </div>

        <div onClick={() => setTab("today")} style={{background:"#fff", borderRadius:12, padding:16, marginBottom:16, border:"0.5px solid rgba(0,0,0,0.07)", cursor:"pointer"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
            <div style={{display:"flex", alignItems:"center", gap:12}}>
              <div style={{width:42, height:42, borderRadius:10, background:"#EEEDFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20}}>📋</div>
              <div>
                <div style={{fontSize:14, fontWeight:600, color:"#1a1a1a"}}>Tareas de hoy</div>
                <div style={{fontSize:12, color:"#888", marginTop:1}}>{new Date().toLocaleDateString("es-MX", {weekday:"long", day:"numeric", month:"long"})}</div>
              </div>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:8}}><span style={{fontSize:26, fontWeight:700, color:"#534AB7"}}>{todayTasks.length}</span><span style={{color:"#aaa", fontSize:16}}>›</span></div>
          </div>
          {todayTasks.length > 0 && <div style={{display:"flex", gap:12, paddingLeft:54}}>
            {[["High","Alta","#A32D2D"], ["Medium","Media","#854F0B"], ["Low","Baja","#3B6D11"]].map(([k, l, c]) => {
              const n = todayTasks.filter(t => t.priority === k).length;
              return n > 0 ? <div key={k} style={{display:"flex", alignItems:"center", gap:4}}><span style={{width:6, height:6, borderRadius:"50%", background:c, flexShrink:0}}/><span style={{fontSize:11, color:c, fontWeight:600}}>{n} {l}</span></div> : null;
            })}
          </div>}
        </div>

        <div className="section-label">Propiedades</div>
        {propNames.map(p => <PropCardItem key={p} p={p} {...propCardProps}/>)}
        {!propNames.length && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:32}}>Sin propiedades aún.</div>}
      </div>
    </>}

    {(tab === "properties" || tab === "property") && <>
      <div className="topbar">
        {tab === "property" && activeProp ? <>
          <div className="topbar-row" style={{marginBottom:8}}>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <button onClick={() => { setTab("properties"); setActiveProp(null); setSearchQ(""); }} style={{background:"none", border:"none", cursor:"pointer", color:"#534AB7", fontSize:13, padding:"4px 0", display:"flex", alignItems:"center", gap:2}}>‹ Atrás</button>
              <div style={{display:"flex", alignItems:"center", gap:6}}>
                <span style={{width:10, height:10, borderRadius:"50%", background:(propColorMap[activeProp] || COLOR_FRAMES[0]).topBar, display:"inline-block"}}/>
                <span style={{fontSize:17, fontWeight:700}}>{activeProp}</span>
              </div>
            </div>
            {canExport && <button onClick={() => exportPDF("Reporte " + activeProp, propTasks)} style={{background:"#f5f5f7", border:"0.5px solid rgba(0,0,0,0.12)", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", color:"#555"}}>📄 Exportar</button>}
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:8}}>
            {[["Abiertas", propTasks.filter(t => t.status === "Open").length, "#D85A30"], ["En Prog.", propTasks.filter(t => t.status === "In Progress").length, "#BA7517"], ["Aprob.", propTasks.filter(t => t.status === "Needs Approval").length, "#534AB7"], ["OK", propTasks.filter(t => t.status === "Approved").length, "#378ADD"], ["Listas", propTasks.filter(t => t.status === "Resolved").length, "#1D9E75"]].map(([l, v, c]) => {
              const full = {"En Prog.":"In Progress", "Aprob.":"Needs Approval", "OK":"Approved", "Listas":"Resolved", "Abiertas":"Open"}[l] || l;
              return <div key={l} onClick={() => setPropFilter(propFilter === full ? "all" : full)} style={{background:propFilter === full ? c + "22" : "#fff", borderRadius:8, padding:"8px 4px", textAlign:"center", border:`1.5px solid ${propFilter === full ? c : "#eee"}`, cursor:"pointer"}}>
                <div style={{fontSize:9, color:"#888", fontWeight:500, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{l}</div>
                <div style={{fontSize:18, fontWeight:600, color:c}}>{v}</div>
              </div>;
            })}
          </div>
        </> : <div className="topbar-row">
          <div className="topbar-title">Propiedades</div>
          {isAdmin && <button onClick={() => setModal("newProp")} style={{background:"#534AB7", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:600}}>+ Agregar</button>}
        </div>}
      </div>
      <div className="screen">
        {tab === "property" && activeProp ? <>
          <SearchBar value={searchQ} onChange={setSearchQ} placeholder="Buscar tareas..."/>
          <div className="sort-row">
            {[["date","Recientes"], ["priority","Prioridad"], ["name","A–Z"]].map(([k, l]) => <button key={k} className={`sort-pill${sortBy === k ? " active" : ""}`} onClick={() => setSortBy(k)}>{l}</button>)}
          </div>
          {shownPropTasks.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:40}}>{searchQ ? "No se encontraron tareas." : "Sin tareas."}</div>}
          {shownPropTasks.map(t => <TaskRow key={t.id} t={t} {...taskRowProps}/>)}
        </> : <>
          {propNames.map(p => <PropCardItem key={p} p={p} {...propCardProps}/>)}
          {!propNames.length && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:32}}>Sin propiedades aún.</div>}
        </>}
      </div>
    </>}

    {tab === "tasks" && <>
      <div className="topbar">
        <div className="topbar-row" style={{marginBottom:10}}>
          <div className="topbar-title">Todas las tareas</div>
          {canExport && <button onClick={() => exportPDF("Reporte de tareas", filteredTasks)} style={{background:"#f5f5f7", border:"0.5px solid rgba(0,0,0,0.12)", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", color:"#555"}}>📄 Exportar</button>}
        </div>
        <div className="filter-row">
          {["all","Open","In Progress","Needs Approval","Approved","Resolved"].map(f => <div key={f} className={`filter-pill${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f === "all" ? "Todas" : STATUS_LABEL[f] || f}</div>)}
        </div>
      </div>
      <div className="screen">
        <SearchBar value={searchQ} onChange={setSearchQ} placeholder="Buscar tareas..."/>
        <div className="sort-row">
          {[["date","Recientes"], ["priority","Prioridad"], ["name","A–Z"]].map(([k, l]) => <button key={k} className={`sort-pill${sortBy === k ? " active" : ""}`} onClick={() => setSortBy(k)}>{l}</button>)}
        </div>
        {filteredTasks.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:40}}>{searchQ ? "No se encontraron tareas." : "Sin tareas."}</div>}
        {filteredTasks.map(t => <TaskRow key={t.id} t={t} {...taskRowProps}/>)}
      </div>
    </>}

    {tab === "today" && <>
      <div className="topbar">
        <div className="topbar-row" style={{marginBottom:4}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <button onClick={() => setTab("home")} style={{background:"none", border:"none", cursor:"pointer", color:"#534AB7", fontSize:13, padding:"4px 0", display:"flex", alignItems:"center", gap:2}}>‹ Atrás</button>
            <div className="topbar-title">Tareas de hoy</div>
          </div>
          {canExport && <button onClick={() => exportPDF("Tareas de hoy", sortT(todayTasks))} style={{background:"#f5f5f7", border:"0.5px solid rgba(0,0,0,0.12)", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", color:"#555"}}>📄 Exportar</button>}
        </div>
        <div style={{fontSize:13, color:"#888", marginTop:2}}>{new Date().toLocaleDateString("es-MX", {weekday:"long", day:"numeric", month:"long", year:"numeric"})} — {todayTasks.length} tarea{todayTasks.length !== 1 ? "s" : ""}</div>
        {todayTasks.length > 0 && <div style={{display:"flex", gap:12, marginTop:8}}>
          {[["High","Alta","#A32D2D","#FCEBEB"], ["Medium","Media","#854F0B","#FAEEDA"], ["Low","Baja","#3B6D11","#EAF3DE"]].map(([k, l, c, bg]) => {
            const n = todayTasks.filter(t => t.priority === k).length;
            return <div key={k} style={{flex:1, background:bg, borderRadius:8, padding:"8px 0", textAlign:"center"}}><div style={{fontSize:18, fontWeight:700, color:c}}>{n}</div><div style={{fontSize:10, color:c, fontWeight:500}}>{l}</div></div>;
          })}
        </div>}
      </div>
      <div className="screen">
        {todayTasks.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:40}}>No se han agregado tareas hoy.</div>}
        {sortT(todayTasks).map(t => <TaskRow key={t.id} t={t} {...taskRowProps}/>)}
      </div>
    </>}

    {tab === "approvals" && <>
      <div className="topbar">
        <div className="topbar-title">Aprobaciones</div>
        <div style={{fontSize:13, color:"#888", marginTop:2}}>{visibleTasks.filter(t => t.status === "Needs Approval").length} pendientes</div>
      </div>
      <div className="screen">
        {!canViewApprovals && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:40}}>Acceso restringido.</div>}
        {canViewApprovals && visibleTasks.filter(t => t.status === "Needs Approval").length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:40}}>No hay tareas pendientes de aprobación.</div>}
        {canViewApprovals && visibleTasks.filter(t => t.status === "Needs Approval").map(t =>
          <div key={t.id} className="task-item" onClick={() => { if (canApprove) setApprovalSel(t); else setSelTask(t); }}>
            <div className="task-title">{t.title}</div>
            <div className="task-prop">{t.property} · {t.created || ""}</div>
            <div className="task-badges"><PBadge priority={t.priority}/><SBadge status={t.status}/>{t.source === "cleaning" && <AutoCleaningBadge/>}{t.assignee && <span style={{fontSize:11, color:"#888"}}>{t.assignee}</span>}</div>
            {t.approvalComment && <div style={{marginTop:8, fontSize:12, color:"#3C3489", background:"#EEEDFE", borderRadius:8, padding:"6px 10px"}}>{t.approvalComment}</div>}
          </div>
        )}
      </div>
    </>}

    {tab === "settings" && <>
      <div className="topbar">
        <div className="topbar-title">Ajustes</div>
        <div style={{fontSize:13, color:"#888", marginTop:2}}>Sesión de {currentUser.name}</div>
      </div>
      <div className="screen">
        <div style={{background:"#fff", borderRadius:14, padding:16, marginBottom:16, border:"0.5px solid rgba(0,0,0,0.07)", display:"flex", alignItems:"center", gap:14}}>
          <Av name={currentUser.name} size={48} bg={ROLE_META[role]?.bg || "#888"}/>
          <div>
            <div style={{fontSize:16, fontWeight:600}}>{currentUser.name}</div>
            <div style={{fontSize:12, color:"#888", fontFamily:"monospace"}}>@{currentUser.username}</div>
            <div style={{marginTop:4}}><RBadge role={role}/></div>
          </div>
        </div>

        {isAdmin && <>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, gap:8}}>
            <div className="section-label" style={{margin:0}}>Propiedades</div>
            <div style={{display:"flex", gap:6}}>
              <button onClick={() => setModal("importRooms")} style={{background:"#f5f5f7", color:"#534AB7", border:"0.5px solid rgba(83,74,183,0.3)", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:600}}>Importar recámaras/baños</button>
              <button onClick={() => setModal("newProp")} style={{background:"#534AB7", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:600}}>+ Agregar</button>
            </div>
          </div>
          {allPropNames.map(p => {
            const prop = properties.find(x => x.name === p);
            const clr = propColorMap[p] || COLOR_FRAMES[0];
            const hasRooms = prop?.bedrooms != null && prop?.bathrooms != null;
            return <div key={p} style={{background:"#fff", borderRadius:12, padding:"12px 14px", marginBottom:8, border:"0.5px solid rgba(0,0,0,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <div style={{width:10, height:10, borderRadius:"50%", background:clr.topBar, flexShrink:0}}/>
                <div>
                  <div style={{fontSize:14, fontWeight:500}}>{p}</div>
                  <div style={{fontSize:11, color:hasRooms ? "#888" : "#BA7517", marginTop:1}}>{hasRooms ? `${prop.bedrooms === 0 ? "Estudio" : prop.bedrooms + " rec."} · ${prop.bathrooms} baños` : "Sin recámaras/baños — checklist genérico"}</div>
                </div>
              </div>
              <div style={{display:"flex", gap:6, flexShrink:0}}>
                <button onClick={() => setEditingProp({id:prop?.id, old:p, new:p})} style={{fontSize:11, padding:"4px 10px", borderRadius:6, border:"0.5px solid rgba(0,0,0,0.15)", background:"#f5f5f5", color:"#333", cursor:"pointer"}}>Editar</button>
                <button onClick={() => removeProperty(prop?.id, p)} style={{fontSize:11, padding:"4px 10px", borderRadius:6, border:"0.5px solid #F09595", background:"#FCEBEB", color:"#A32D2D", cursor:"pointer"}}>Borrar</button>
              </div>
            </div>;
          })}

        </>}

        {(()=>{
          const canSeeAdmin = !HR_ONLY_ROLES.includes(role);
          const ptoBadge = role==="supervisor"
            ? ptoRequests.filter(r=>["maintenance","cleaning"].includes(r.userRole)&&r.status==="pending_supervisor").length
            : role==="admin"
            ? ptoRequests.filter(r=>r.status==="pending_admin").length
            : 0;
          return <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:10}}>
            {canSeeAdmin&&<button onClick={() => setPortal(null)} style={{width:"100%",padding:14,borderRadius:12,border:"1.5px solid #A0D9C5",background:"#E1F5EE",color:"#0F6E56",fontSize:15,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              ⊞ Portales
              {ptoBadge>0&&<span style={{background:"#534AB7",color:"#fff",fontSize:12,fontWeight:700,padding:"1px 8px",borderRadius:20,lineHeight:"18px"}}>{ptoBadge}</span>}
            </button>}
            <button className="btn-red" onClick={() => auth.signOut()}>Cerrar sesión</button>
          </div>;
        })()}
      </div>
    </>}

    {tab === "availability" && <AvailabilityScreen availProp={availProp} setAvailProp={setAvailProp} bookingsLoaded={bookingsLoaded} bookingsFetchErr={bookingsFetchErr} setBookingsFetchTrigger={setBookingsFetchTrigger} propNames={propNames} getOccupancy={getOccupancy} getPropBookingDetails={getPropBookingDetails}/>}

    <button className="fab" onClick={() => setModal("newTask")}>+</button>

    {(()=>{
      const ptoPendingBadge = role==="supervisor"
        ? ptoRequests.filter(r=>["maintenance","cleaning"].includes(r.userRole)&&r.status==="pending_supervisor").length
        : role==="admin"
        ? ptoRequests.filter(r=>r.status==="pending_admin").length
        : 0;
      const ptoNewBadge = role!=="admin"
        ? ptoRequests.filter(r=>r.userId===currentUser.id&&["approved","declined"].includes(r.status)&&(r.adminDecision?.at||r.supervisorDecision?.at||"")>ptoLastSeen).length
        : 0;
      const settingsBadge = ptoPendingBadge + ptoNewBadge;
      return <div className="bottom-nav">
        {[["home","Inicio",<HomeIcon/>], ["properties","Props",<PropIcon/>], ["tasks","Tareas",<TaskIcon/>], ["availability","Disponib.",<CalIcon/>], ["approvals","Aprob.",<ApprIcon/>], ["settings","Ajustes",<SettIcon/>]].map(([v, label, icon]) => {
          if (v === "approvals" && !canViewApprovals) return null;
          const active = activeTab2 === v;
          return <div key={v} className={`nav-tab${active ? " active" : ""}`} onClick={() => { setTab(v); if (v !== "properties") setActiveProp(null); setSearchQ(""); }}>
            {icon}<span>{label}</span>
            {v === "approvals" && approvalCount > 0 && <span className="nav-badge">{approvalCount}</span>}
            {v === "settings" && settingsBadge > 0 && <span className="nav-badge">{settingsBadge}</span>}
          </div>;
        })}
      </div>;
    })()}

    {selTask && <TaskSheet task={selTask} onClose={() => setSelTask(null)} tasks={tasks} users={users} wfSteps={wfSteps} currentUser={currentUser} canViewSensitive={canViewSensitive} canViewApprovals={canViewApprovals} canAssign={canAssign} canChangeStatus={canChangeStatus} canRequestApproval={canRequestApproval} canApprove={canApprove} canResolve={canResolve} isAdmin={isAdmin} advance={advance} hEntry={hEntry} addComment={addComment} removeTask={removeTask} bgUpload={bgUpload} onOpenLightbox={openLB} setApprovalTxt={setApprovalTxt} setApprovalPhotos={setApprovalPhotos} setPendingApprovalTask={setPendingApprovalTask}/>}
    {approvalSel && <ApprovalSheet task={approvalSel} onClose={() => setApprovalSel(null)} currentUser={currentUser} hEntry={hEntry} advance={advance} onOpenLightbox={openLB}/>}
    {modal === "newTask" && <NewTaskSheet activeProp={activeProp} propNames={propNames} getOccupancy={getOccupancy} bookingsLoaded={bookingsLoaded} addTask={addTask} currentUser={currentUser} onClose={() => setModal(null)}/>}
    {modal === "newProp" && <AddPropSheet allPropNames={allPropNames} setModal={setModal} addProperty={addProperty}/>}
    {modal === "importRooms" && <ImportRoomsSheet properties={properties} setModal={setModal} updateProperty={updateProperty}/>}
    {editingProp && <EditPropSheet editingProp={editingProp} setEditingProp={setEditingProp} properties={properties} allPropNames={allPropNames} activeProp={activeProp} setActiveProp={setActiveProp} renameProperty={renameProperty} updateProperty={updateProperty}/>}

    {pendingApprovalTask && <div className="modal-overlay" onClick={() => setPendingApprovalTask(null)}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-sheet-scroll">
          <div className="modal-title">Solicitar aprobación</div>
          <div className="modal-sub">Explica por qué esta tarea necesita aprobación</div>
          <div className="field"><label>Razón</label><textarea value={approvalTxt} onChange={e => setApprovalTxt(e.target.value)} placeholder="ej. Costo de reemplazo ~$800. Requiere autorización."/></div>
          <div className="field">
            <label>Fotos de soporte (opcional)</label>
            <div style={{fontSize:12, color:"#888", marginBottom:8}}>Adjunta cotizaciones, recibos o evidencia</div>
            <PhotoUpload photos={approvalPhotos} setPhotos={setApprovalPhotos}/>
          </div>
        </div>
        <div className="modal-sheet-bottom">
          <div className="btn-row">
            <button className="btn-secondary" onClick={() => setPendingApprovalTask(null)}>Cancelar</button>
            <button className="btn-primary" onClick={() => {
              if (!approvalTxt.trim()) return;
              const tid = pendingApprovalTask.id;
              const phs = [...approvalPhotos];
              advance(tid, "Needs Approval", {approvalComment:approvalTxt, _hist:[hEntry("Solicitó aprobación")]});
              if (phs.length) bgUpload(phs, `tasks/${tid}/approval`, tid, "approvalPhotos");
              setPendingApprovalTask(null); setApprovalTxt(""); setApprovalPhotos([]);
            }} style={{opacity:approvalTxt.trim() ? 1 : 0.5}}>Enviar</button>
          </div>
        </div>
      </div>
    </div>}

    {lightbox && <ZoomLightbox src={lightbox} caption={lightboxCaption} onClose={() => setLightbox(null)}/>}
  </div>;
}

export default App;
