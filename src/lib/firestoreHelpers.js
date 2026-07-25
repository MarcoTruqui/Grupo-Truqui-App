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

export function getPTOBalance(uid,users,ptoRequests) {
  const u=users.find(x=>x.id===uid);
  const seniority = getVacationDaysBySeniority(u?.hireDate);
  // use manual override if set, otherwise seniority, otherwise fallback
  const annual = (u?.vacationDaysOverride!=null) ? u.vacationDaysOverride : (seniority !== null ? seniority : 15);
  const yr=new Date().getFullYear();
  const ys=yr+"-01-01",ye=yr+"-12-31";
  const reqs=ptoRequests.filter(r=>r.userId===uid);
  const usedFromReqs=reqs.filter(r=>r.status==="approved").flatMap(r=>r.selectedDays||[]).filter(d=>d>=ys&&d<=ye).length;
  const curYr=getCurrentAnniversaryYear(u?.hireDate);
  const carryoverValid=u?.carryoverYearsCompleted===curYr;
  const carryover=carryoverValid?(u?.vacationUsedCarryover||0):0;
  const borrowed=carryoverValid?(u?.vacationBorrowed||0):0;
  const used=usedFromReqs+carryover;
  const pending=reqs.filter(r=>["pending_supervisor","pending_admin"].includes(r.status)).flatMap(r=>r.selectedDays||[]).filter(d=>d>=ys&&d<=ye).length;
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
