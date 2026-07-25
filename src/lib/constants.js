export const FAKE_DOMAIN = "@tchmant.com";

/* Display labels in Spanish — DB keys stay English */
export const ROLE_META = {
  admin:        {label:"Administrador",  bg:"#534AB7", color:"#fff"},
  supervisor:   {label:"Supervisor",     bg:"#1D9E75", color:"#fff"},
  maintenance:  {label:"Mantenimiento",  bg:"#BA7517", color:"#fff"},
  cleaning:     {label:"Limpieza",       bg:"#378ADD", color:"#fff"},
  office:       {label:"Oficina",        bg:"#D14D8A", color:"#fff"},
  construction: {label:"Construcción",   bg:"#E87A30", color:"#fff"},
  purchasing:   {label:"Compras",        bg:"#0D9DA7", color:"#fff"}
};

export const MAINTENANCE_ROLES = ["maintenance","cleaning","supervisor"];
export const HR_ONLY_ROLES     = ["office","construction","purchasing"];

export const STATUS_LABEL = {
  "Open":"Abierta",
  "In Progress":"En Progreso",
  "Needs Approval":"Requiere Aprobación",
  "Approved":"Aprobada",
  "Resolved":"Resuelta"
};

export const STATUS_META = {
  "Open":{bg:"#FAECE7", color:"#993C1D", dot:"#D85A30"},
  "In Progress":{bg:"#FAEEDA", color:"#854F0B", dot:"#BA7517"},
  "Needs Approval":{bg:"#EEEDFE", color:"#3C3489", dot:"#534AB7"},
  "Approved":{bg:"#E6F1FB", color:"#185FA5", dot:"#378ADD"},
  "Resolved":{bg:"#EAF3DE", color:"#3B6D11", dot:"#1D9E75"}
};

export const PRIORITY_LABEL = {High:"Alta", Medium:"Media", Low:"Baja"};

export const PRIORITY_META = {
  High:{bg:"#FCEBEB", color:"#A32D2D"},
  Medium:{bg:"#FAEEDA", color:"#854F0B"},
  Low:{bg:"#EAF3DE", color:"#3B6D11"}
};

export const COLOR_FRAMES = [
  {border:"#7F77DD", iconBg:"#EEEDFE", iconColor:"#534AB7", topBar:"#534AB7"},
  {border:"#1D9E75", iconBg:"#E1F5EE", iconColor:"#0F6E56", topBar:"#1D9E75"},
  {border:"#D85A30", iconBg:"#FAECE7", iconColor:"#993C1D", topBar:"#D85A30"},
  {border:"#378ADD", iconBg:"#E6F1FB", iconColor:"#185FA5", topBar:"#378ADD"}
];

export const PRI_ORD = {High:0, Medium:1, Low:2};

export const ITEM_STATUS_ICON = {pending:"⬜", green:"✅", yellow:"🟡", red:"🔴"};

/* Fallback flat checklist for properties with no bedrooms/bathrooms set yet */
export const CLEANING_CHECKLIST = [
  {id:"beds", label:"Cambiar sábanas y tender camas"},
  {id:"towels", label:"Reponer toallas limpias"},
  {id:"bathrooms", label:"Limpiar y desinfectar baños"},
  {id:"kitchen", label:"Limpiar cocina y electrodomésticos"},
  {id:"floors", label:"Barrer y trapear/aspirar pisos"},
  {id:"dusting", label:"Sacudir superficies y muebles"},
  {id:"windows", label:"Limpiar espejos y ventanas"},
  {id:"trash", label:"Vaciar botes de basura"},
  {id:"amenities", label:"Reponer amenities (papel, jabón, café)"},
  {id:"outdoor", label:"Revisar y limpiar áreas exteriores/terraza"},
  {id:"damage", label:"Revisar y reportar daños o faltantes"},
  {id:"final", label:"Revisión final — todo listo para huéspedes"}
];

/* ===== Per-room checklist item catalogs — cleaning tasks + functionality checks ===== */
export const BEDROOM_ITEMS = [
  {id:"beds", label:"Tender cama y cambiar sábanas"},
  {id:"dust", label:"Sacudir polvo en muebles y superficies"},
  {id:"floor", label:"Aspirar/trapear piso"},
  {id:"mirrors", label:"Limpiar espejos y vidrios"},
  {id:"trash", label:"Vaciar basura"},
  {id:"closet", label:"Revisar clóset — libre de objetos olvidados"},
  {id:"lights", label:"Foco(s) encienden correctamente"},
  {id:"ac", label:"Aire acondicionado funciona y control tiene pilas"},
  {id:"fan", label:"Ventilador funciona"},
  {id:"tv", label:"TV enciende y control remoto funciona"},
  {id:"windows", label:"Ventanas/cortinas cierran correctamente"}
];

export const BATHROOM_ITEMS = [
  {id:"toilet", label:"Limpiar y desinfectar excusado"},
  {id:"shower", label:"Limpiar regadera/tina"},
  {id:"sink", label:"Limpiar lavabo y espejo"},
  {id:"floor", label:"Trapear piso"},
  {id:"amenities", label:"Reponer papel higiénico y amenities"},
  {id:"towels", label:"Toallas limpias repuestas"},
  {id:"trash", label:"Vaciar basura"},
  {id:"hotwater", label:"Agua caliente funciona en regadera"},
  {id:"faucet", label:"Agua corre bien en llave del lavabo (sin fugas)"},
  {id:"lights", label:"Foco(s) encienden correctamente"},
  {id:"vent", label:"Extractor de baño funciona"}
];

export const HALF_BATH_ITEMS = [
  {id:"toilet", label:"Limpiar y desinfectar excusado"},
  {id:"sink", label:"Limpiar lavabo y espejo"},
  {id:"floor", label:"Trapear piso"},
  {id:"amenities", label:"Reponer papel higiénico y jabón"},
  {id:"trash", label:"Vaciar basura"},
  {id:"faucet", label:"Agua corre bien en llave del lavabo"},
  {id:"lights", label:"Foco(s) encienden correctamente"}
];

export const LIVING_ITEMS = [
  {id:"tidy", label:"Acomodar y limpiar cojines/muebles"},
  {id:"floor", label:"Aspirar/trapear piso"},
  {id:"surfaces", label:"Limpiar mesa de centro y superficies"},
  {id:"windows", label:"Limpiar ventanas y espejos"},
  {id:"trash", label:"Vaciar basura"},
  {id:"tv", label:"TV enciende y control remoto funciona"},
  {id:"ac", label:"Aire acondicionado/ventilador funciona"},
  {id:"acremote", label:"Control de A/C tiene pilas"},
  {id:"lights", label:"Foco(s) encienden correctamente"}
];

export const KITCHEN_ITEMS = [
  {id:"surfaces", label:"Limpiar y desinfectar superficies y barra"},
  {id:"dishes", label:"Lavar y guardar trastes"},
  {id:"stove", label:"Limpiar estufa y horno"},
  {id:"fridge", label:"Limpiar refrigerador por dentro y por fuera"},
  {id:"floor", label:"Trapear piso"},
  {id:"trash", label:"Vaciar basura"},
  {id:"utensils", label:"Revisar que no falten utensilios básicos"},
  {id:"faucet", label:"Agua corre bien en la llave"},
  {id:"burners", label:"Estufa enciende correctamente (todas las hornillas)"},
  {id:"microwave", label:"Microondas funciona"},
  {id:"lights", label:"Foco(s) encienden correctamente"}
];

export const DINING_ITEMS = [
  {id:"table", label:"Limpiar mesa y sillas"},
  {id:"floor", label:"Trapear/aspirar piso"},
  {id:"decor", label:"Limpiar superficies y decoración"},
  {id:"lights", label:"Foco(s)/lámpara enciende correctamente"}
];

export const TERRACE_ITEMS = [
  {id:"furniture", label:"Acomodar muebles y camastros de terraza"},
  {id:"furniturecheck", label:"Revisar que muebles/camastros estén en buen estado (sin roturas)"},
  {id:"cushions", label:"Sacudir/limpiar cojines y tapicería exterior"},
  {id:"sweep", label:"Barrer y trapear piso"},
  {id:"trash", label:"Vaciar basura"},
  {id:"railing", label:"Limpiar barandales y vidrios"},
  {id:"cobwebs", label:"Quitar telarañas e insectos"},
  {id:"plants", label:"Regar y despejar plantas/macetas"},
  {id:"lights", label:"Foco(s)/luces exteriores encienden correctamente"},
  {id:"fan", label:"Ventilador de techo funciona (si aplica)"},
  {id:"outlets", label:"Contactos eléctricos exteriores funcionan"}
];

export const STUDIO_ITEMS = [
  {id:"beds", label:"Tender cama y cambiar sábanas"},
  {id:"dust", label:"Sacudir polvo en muebles y superficies"},
  {id:"floor", label:"Aspirar/trapear piso"},
  {id:"mirrors", label:"Limpiar espejos y vidrios"},
  {id:"trash", label:"Vaciar basura"},
  {id:"lights", label:"Foco(s) encienden correctamente"},
  {id:"ac", label:"Aire acondicionado funciona y control tiene pilas"},
  {id:"fan", label:"Ventilador funciona"},
  {id:"tv", label:"TV enciende y control remoto funciona"},
  {id:"windows", label:"Ventanas/cortinas cierran correctamente"}
];

/* ===== One-time room-count reference (from owner-supplied list) — matched by fuzzy name against live properties ===== */
export const ROOM_SEED = [
  {name:"Villa Girasol", bedrooms:4, bathrooms:4.5},
  {name:"Villa Jaguar", bedrooms:3, bathrooms:3.5},
  {name:"Villa Turquesa", bedrooms:5, bathrooms:5.5},
  {name:"Villa Pelícano", bedrooms:4, bathrooms:4},
  {name:"Villa Perico", bedrooms:3, bathrooms:3},
  {name:"Villa Zenzontle", bedrooms:4, bathrooms:4},
  {name:"Palmas 8", bedrooms:4, bathrooms:4.5},
  {name:"Las Terrazas G-32", bedrooms:5, bathrooms:5.5},
  {name:"Zantamar 205B", bedrooms:2, bathrooms:2},
  {name:"Zantamar 303D", bedrooms:0, bathrooms:2},
  {name:"Zantamar 304D", bedrooms:0, bathrooms:2},
  {name:"Zantamar 305D", bedrooms:2, bathrooms:2},
  {name:"Zantamar 306D", bedrooms:0, bathrooms:2},
  {name:"Zantamar TH7", bedrooms:2, bathrooms:2}
];

export function normRoomName(s) {
  return (s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(villa|las|de)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function matchRoomSeed(propName) {
  const pn = normRoomName(propName);
  if (pn.length < 2) return null;
  const candidates = ROOM_SEED.filter(seed => {
    const sn = normRoomName(seed.name);
    return sn.includes(pn) || pn.includes(sn);
  });
  if (!candidates.length) return null;
  candidates.sort((a, b) => Math.abs(normRoomName(a.name).length - pn.length) - Math.abs(normRoomName(b.name).length - pn.length));
  return candidates[0];
}

export function buildRoomChecklist(property) {
  const hasRoomData = property?.bedrooms != null && property?.bathrooms != null;
  if (!hasRoomData) return [{id:"general", label:"General", items:CLEANING_CHECKLIST}];

  const bedrooms = Math.max(0, Math.round(property.bedrooms));
  const bathroomsRaw = Number(property.bathrooms) || 0;
  const fullBaths = Math.floor(bathroomsRaw);
  const hasHalfBath = (bathroomsRaw - fullBaths) >= 0.4;
  const isStudio = bedrooms === 0;
  const rooms = [];

  if (isStudio) rooms.push({id:"studio", label:"Estudio", items:STUDIO_ITEMS});
  else for (let i = 1; i <= bedrooms; i++) rooms.push({id:`bedroom${i}`, label:`Recámara ${i}`, items:BEDROOM_ITEMS});

  for (let i = 1; i <= fullBaths; i++) rooms.push({id:`bathroom${i}`, label:`Baño ${i}`, items:BATHROOM_ITEMS});
  if (hasHalfBath) rooms.push({id:"halfbath", label:"Medio baño", items:HALF_BATH_ITEMS});

  if (!isStudio) rooms.push({id:"living", label:"Sala", items:LIVING_ITEMS});
  rooms.push({id:"kitchen", label:"Cocina", items:KITCHEN_ITEMS});
  if (!isStudio) rooms.push({id:"dining", label:"Comedor", items:DINING_ITEMS});
  rooms.push({id:"terrace", label:"Terraza", items:TERRACE_ITEMS});

  return rooms;
}
