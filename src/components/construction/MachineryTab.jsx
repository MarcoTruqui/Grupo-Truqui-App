import { useState } from "react";
import { fmtDate } from "../../lib/dateHelpers";
import { isAnomalousMachineLog } from "../../lib/constructionHelpers";
import { AddMachineSheet } from "./AddMachineSheet";
import { StartMachineUseSheet } from "./StartMachineUseSheet";
import { MachineLogDetailSheet } from "./MachineLogDetailSheet";

export function MachineryTab({projectId, machines, logs, addConstructionMachine, startMachineUse, stopMachineUse, removeMachineLog, removeConstructionMachine}) {
  const [manageOpen, setManageOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [selLog, setSelLog] = useState(null);

  const inProgress = logs.filter(l => l.status === "in_progress").sort((a, b) => (b.startAt || "").localeCompare(a.startAt || ""));
  const completed = logs.filter(l => l.status === "completed").sort((a, b) => (b.startAt || "").localeCompare(a.startAt || ""));

  return <div>
    <div className="btn-row" style={{marginBottom:16}}>
      <button className="btn-secondary" onClick={() => setManageOpen(true)}>⚙️ Agregar máquina</button>
      <button className="btn-primary" onClick={() => setStartOpen(true)}>▶ Registrar uso</button>
    </div>

    <div className="section-label">En uso</div>
    {inProgress.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:16}}>Ninguna máquina en uso ahora mismo.</div>}
    {inProgress.map(l => (
      <div key={l.id} className="task-item" onClick={() => setSelLog(l)}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <div className="task-title">{l.machineName}</div>
            <div className="task-prop">Inicio {fmtDate(l.startAt)} · Horómetro {l.startHorometro} · {l.startedBy}</div>
          </div>
          <div style={{color:"#BA7517", fontSize:12, fontWeight:600}}>● En uso</div>
        </div>
      </div>
    ))}

    <div className="section-label" style={{marginTop:20}}>Historial</div>
    {completed.length === 0 && <div style={{textAlign:"center", color:"#aaa", fontSize:13, padding:16}}>Aún no hay usos completados.</div>}
    {completed.slice(0, 30).map(l => (
      <div key={l.id} className="task-item" onClick={() => setSelLog(l)}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
          <div>
            <div className="task-title">{l.machineName}</div>
            <div className="task-prop">{fmtDate(l.startAt)} · {l.startHorometro} → {l.endHorometro} · {l.totalHours} hrs</div>
          </div>
          {isAnomalousMachineLog(l) && <div style={{color:"#A32D2D", fontSize:11, fontWeight:700, background:"#FCEBEB", padding:"2px 8px", borderRadius:20, flexShrink:0}}>⚠️ Revisar</div>}
        </div>
      </div>
    ))}

    {manageOpen && <AddMachineSheet machines={machines} addConstructionMachine={addConstructionMachine} removeConstructionMachine={removeConstructionMachine} onClose={() => setManageOpen(false)}/>}
    {startOpen && <StartMachineUseSheet projectId={projectId} machines={machines} startMachineUse={startMachineUse} onClose={() => setStartOpen(false)}/>}
    {selLog && <MachineLogDetailSheet log={selLog} projectId={projectId} stopMachineUse={stopMachineUse} removeMachineLog={removeMachineLog} onClose={() => setSelLog(null)}/>}
  </div>;
}
