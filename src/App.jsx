 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/App.jsx b/src/App.jsx
index 06f2dd4b5a3123904faa71639e07bd5d0461d5e0..15e3b3e00c3442b7df173d2910836ffff344d47d 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -15,53 +15,54 @@ import {
 const firebaseConfig = {
   apiKey: "AIzaSyDI0b2KvCE91g7caKTMK8C65VStYhlfhXA",
   authDomain: "vacaciones-equipo.firebaseapp.com",
   projectId: "vacaciones-equipo",
   storageBucket: "vacaciones-equipo.firebasestorage.app",
   messagingSenderId: "363688110200",
   appId: "1:363688110200:web:d8821656bb0618122de58d",
 };
 
 const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
 const db = getFirestore(app);
 const appId = "vacaciones-equipo-2026";
 
 // --- CONFIGURACIÓN ---
 const LOGO_URL = "https://i.postimg.cc/d1kK6BtW/Gemini_Generated_Image_7v8i3p7v8i3p7v8i.png";
 const GPT_URL = "https://chatgpt.com/g/g-690e357144cc8191bad33044e9d2b5e3-gc-trafico";
 const FORM_PERMISOS_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeXJqKZW8pQqfGuJxbpAfwhqxzaBc6GGgt-sK0sgbTqZ_gqTw/viewform?embedded=true";
 
 // FECHAS
 const PERIOD_START = "2025-11-01";
 const PERIOD_END = "2027-01-31";
 const LIMIT_2025_END = "2026-03-08";
 const START_2026_START = "2026-02-01";
 
-const SS_RANGE = { start: "2026-03-15", end: "2026-04-15" };
-const NAV_RANGE_25 = { start: "2025-12-17", end: "2026-01-10" };
-const NAV_RANGE_26 = { start: "2026-12-17", end: "2027-01-10" };
+const SS_RANGE = { start: "2026-03-10", end: "2026-04-20" };
+const NAV_RANGE_25 = { start: "2025-12-17", end: "2026-01-12" };
+const NAV_RANGE_26 = { start: "2026-12-17", end: "2027-01-12" };
+const NAVIDAD_WINDOWS = [NAV_RANGE_25, NAV_RANGE_26];
 
 const MIN_WORKING_STAFF_UNIT = 2;
 const MAX_VACATION_PER_GROUP = 2;
 const VACATION_LIMIT_2026 = 19;
 const AP_LIMIT_2026 = 6;
 const VACATION_LIMIT_2025_DEFAULT = 5; 
 const AP_LIMIT_2025_DEFAULT = 2;
 
 const DEFAULT_USER_PIN = "1234";
 const DEFAULT_ADMIN_PIN = "9999";
 
 // --- CICLOS DE TURNOS ---
 const CYCLE_MOTO_8H = ["M", "M", "M", "T", "T", "N", "S", "L", "L", "L", "L"];
 const CYCLE_EIS_NEW = ["M", "M", "N", "S", "L", "L", "L", "L"];
 
 // --- REFERENCIAS DE GRUPOS ---
 const REF_MOTO_G1 = "2026-01-09";
 const REF_MOTO_G2 = "2025-11-09";
 const REF_MOTO_G3 = "2025-11-03";
 const REF_MOTO_G4 = "2025-11-12";
 const REF_MOTO_G5 = "2025-11-07";
 
 // --- CONFIGURACIÓN DE GRUPOS ---
 const GROUPS = [
   { id: "G3_MOTO", name: "Grupo 1", unit: "Destacamento Benidorm", category: "motoristas", refDate: REF_MOTO_G3, cycle: CYCLE_MOTO_8H },
@@ -178,50 +179,83 @@ const calculateShiftCycle = (targetDateStr, refDateStr, cycleArray) => {
   if (!refDateStr || !cycleArray) return "L";
   const oneDay = 24 * 60 * 60 * 1000;
   const refDate = new Date(refDateStr + "T00:00:00Z");
   const targetDate = new Date(targetDateStr + "T00:00:00Z");
   const diffDays = Math.floor((targetDate - refDate) / oneDay);
   let index = diffDays % cycleArray.length;
   if (index < 0) index += cycleArray.length;
   return cycleArray[index];
 };
 
 const getDatesInRange = (startStr, endStr) => {
   const dates = [];
   let curr = new Date(startStr + "T00:00:00Z");
   const end = new Date(endStr + "T00:00:00Z");
   while (curr <= end) {
     dates.push(curr.toISOString().split("T")[0]);
     curr.setDate(curr.getDate() + 1);
   }
   return dates;
 };
 
 const isRangeWithin = (rangeDates, startLimit, endLimit) => {
   return rangeDates.every((d) => d >= startLimit && d <= endLimit);
 };
 
+const validateSpecialRange = (range, type) => {
+  if (!range) return { ok: false, reason: "Selecciona primero el rango." };
+
+  if (type === "nav") {
+    const windowMatch = NAVIDAD_WINDOWS.find((w) => isRangeWithin(range, w.start, w.end));
+    if (!windowMatch) {
+      return {
+        ok: false,
+        reason: "Navidad solo se puede pedir entre 17/12/2025-12/01/2026 o 17/12/2026-12/01/2027.",
+      };
+    }
+    if (range.length > 3) return { ok: false, reason: "Máximo 3 días de Navidad." };
+    return { ok: true, reason: "Dentro de las ventanas autorizadas y el límite de 3 días." };
+  }
+
+  if (type === "ss") {
+    const valid = isRangeWithin(range, SS_RANGE.start, SS_RANGE.end);
+    return valid
+      ? { ok: true, reason: "Dentro del 10 de marzo al 20 de abril de 2026." }
+      : { ok: false, reason: "Semana Santa solo está permitida del 10 de marzo al 20 de abril de 2026." };
+  }
+
+  return { ok: true, reason: "" };
+};
+
+const getLastVacationEnd = (requests, userId) => {
+  const relevant = requests
+    .filter((r) => ["vacation", "nav", "ss"].includes(r.type) && r.userId === userId && r.endDate)
+    .map((r) => r.endDate)
+    .sort();
+  return relevant.length > 0 ? relevant[relevant.length - 1] : "1900-01-01";
+};
+
 export default function AppFinalV20() {
   const [user, setUser] = useState(null);
   const [view, setView] = useState("categories");
   const [selectedCategory, setSelectedCategory] = useState(null);
   const [selectedUnit, setSelectedUnit] = useState(null);
   const [selectedGroupId, setSelectedGroupId] = useState(null);
   const [currentUser, setCurrentUser] = useState(null);
   const [isAdmin, setIsAdmin] = useState(false);
 
   const [requests, setRequests] = useState([]);
   const [overrides, setOverrides] = useState([]);
   const [userSettings, setUserSettings] = useState({});
   const [messages, setMessages] = useState([]);
   const [loading, setLoading] = useState(true);
 
   const [loginMember, setLoginMember] = useState(null);
   const [pinInput, setPinInput] = useState("");
   const [loginError, setLoginError] = useState("");
   const [showChat, setShowChat] = useState(false);
   const [newMessage, setNewMessage] = useState("");
 
   const [unreadCount, setUnreadCount] = useState(0);
   const lastReadCount = useRef(0);
   const chatEndRef = useRef(null);
 
@@ -253,50 +287,61 @@ export default function AppFinalV20() {
   const currentMonthRef = useRef(null);
 
   // --- DERIVED DATA ---
   const activeMembers = useMemo(() => {
     if (!selectedGroupId) return [];
     return MEMBERS.filter((m) => m.group === selectedGroupId);
   }, [selectedGroupId]);
 
   const occupationMap = useMemo(() => {
     const map = {};
     const activeMemberIds = activeMembers.map((m) => m.id);
     requests.forEach((req) => {
       if (activeMemberIds.includes(req.userId)) {
         req.days.forEach((day) => {
           if (!map[day]) map[day] = { vacation: 0, ap: 0, baja: 0, ss: 0, nav: 0, totalAbsence: 0, reqs: [] };
           const type = req.type || "vacation";
           map[day][type]++;
           map[day].totalAbsence++;
           map[day].reqs.push(req);
         });
       }
     });
     return map;
   }, [requests, activeMembers]);
 
+  const overrideMarkedDates = useMemo(() => {
+    const activeMemberIds = activeMembers.map((m) => m.id);
+    const set = new Set();
+    overrides.forEach((o) => {
+      if (activeMemberIds.includes(o.userId) && ["swap", "service"].includes(o.type)) {
+        set.add(o.date);
+      }
+    });
+    return set;
+  }, [overrides, activeMembers]);
+
   const unitsInCategory = useMemo(() => {
     if (!selectedCategory) return [];
     const units = GROUPS.filter((g) => g.category === selectedCategory).map((g) => g.unit);
     return [...new Set(units)].sort();
   }, [selectedCategory]);
 
   const groupsInSelectedUnit = useMemo(() => {
     if (!selectedUnit) return [];
     return GROUPS.filter((g) => g.unit === selectedUnit);
   }, [selectedUnit]);
 
   useEffect(() => { signInAnonymously(auth); onAuthStateChanged(auth, setUser); }, []);
 
   useEffect(() => {
     if (!loading && view === "dashboard" && currentMonthRef.current) {
       currentMonthRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
     }
   }, [loading, view]);
 
   useEffect(() => {
     if (!user) return;
     const unsub = onSnapshot(collection(db, "artifacts", appId, "public", "data", "shift_vacations_v6"), (snap) => {
       setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false);
     });
     return () => unsub();
@@ -387,84 +432,123 @@ export default function AppFinalV20() {
     MEMBERS.forEach((member) => {
       if (member.active) {
         const memberGroup = GROUPS.find((g) => g.id === member.group);
         if (memberGroup) {
           const isAbsent = requests.some((r) => r.userId === member.id && r.days.includes(date));
           if (!isAbsent) {
             const shift = getEffectiveShift(date, member.id, member.group);
             if (["M", "T", "N"].includes(shift)) {
               const displayInfo = `${member.name} (${memberGroup.unit.replace("Destacamento ", "").replace("EIS ", "")})`;
               if (memberGroup.category === "motoristas") shifts.moto[shift].push(displayInfo); else shifts.eis[shift].push(displayInfo);
             }
           }
         }
       }
     });
     setServiceData(shifts); setServiceDate(date); setShowServiceModal(true);
   };
 
   const checkPreferenceAndDisplace = async (type, limitPerGroup, checkMinStaffUnit) => {
     for (const day of selectionStats.range) {
       const groupRequests = requests.filter((r) => {
         const member = MEMBERS.find((m) => m.id === r.userId);
         return member && member.group === currentUser.group && r.days.includes(day) && r.type === type;
       });
       if (type === "vacation" || type === "nav" || type === "ss") {
-        if (groupRequests.length >= MAX_VACATION_PER_GROUP) return { allowed: false, msg: `Cupo completo el día ${day}.` };
+        if (groupRequests.length >= MAX_VACATION_PER_GROUP) {
+          const requesterLastVac = getLastVacationEnd(requests, currentUser.id);
+          const sortedByRecency = groupRequests
+            .map((r) => ({ ...r, lastVac: getLastVacationEnd(requests, r.userId) }))
+            .sort((a, b) => new Date(b.lastVac) - new Date(a.lastVac));
+          const leastPreferred = sortedByRecency[0];
+          if (new Date(requesterLastVac) < new Date(leastPreferred.lastVac)) {
+            return { allowed: false, preferenceTarget: leastPreferred, day };
+          }
+          return { allowed: false, msg: `Cupo completo el día ${day}.` };
+        }
       }
     }
     return { allowed: true };
   };
 
   const selectionStats = useMemo(() => {
     if (!selectionStart) return null;
     const end = selectionEnd || hoverDate || selectionStart;
     const startStr = selectionStart < end ? selectionStart : end;
     const endStr = selectionStart < end ? end : selectionStart;
     const range = getDatesInRange(startStr, endStr);
     let workDays = 0;
     range.forEach((day) => {
       const shift = getEffectiveShift(day, currentUser?.id, currentUser?.group);
       if (SHIFT_STYLES[shift]?.workDay) workDays++;
     });
     return { workDays, range, startStr, endStr };
   }, [selectionStart, selectionEnd, hoverDate, currentUser, overrides]);
 
+  const navValidation = useMemo(() => {
+    return validateSpecialRange(selectionStats?.range, "nav");
+  }, [selectionStats]);
+
+  const ssValidation = useMemo(() => {
+    return validateSpecialRange(selectionStats?.range, "ss");
+  }, [selectionStats]);
+
   const processRequest = async (type, yearToCharge) => {
-    if (!currentUser || !selectionStats) return;
+    if (!currentUser || !selectionStats) { setModalError("Selecciona primero el rango en el calendario."); return; }
+    if (type === "nav") {
+      const validation = validateSpecialRange(selectionStats.range, "nav");
+      if (!validation.ok) { setModalError(validation.reason); return; }
+    }
+    if (type === "ss") {
+      const validation = validateSpecialRange(selectionStats.range, "ss");
+      if (!validation.ok) { setModalError(validation.reason); return; }
+    }
     const limits = getUserLimits(currentUser.id);
     if (type === "vacation") {
       const limit = yearToCharge === "2025" ? limits.vac25 : limits.vac26;
       const used = getUsed(currentUser.id, "vacation", yearToCharge);
       if (used + selectionStats.workDays > limit) { setModalError(`Superas el límite de ${yearToCharge}.`); return; }
     } else if (type === "ap") {
       const limit = yearToCharge === "2025" ? limits.ap25 : limits.ap26;
       const used = getUsed(currentUser.id, "ap", yearToCharge);
       if (used + selectionStats.workDays > limit) { setModalError(`Superas el límite de ${yearToCharge}.`); return; }
     }
     const checkResult = await checkPreferenceAndDisplace(type, MAX_VACATION_PER_GROUP, type === "ap");
-    if (!checkResult.allowed) { setModalError(checkResult.msg); return; }
+    if (!checkResult.allowed) {
+      if (checkResult.preferenceTarget) {
+        const confirmSwap = confirm(`No hay cupo el día ${checkResult.day}, pero tienes preferencia por no haber disfrutado vacaciones desde hace más tiempo. ¿Deseas desplazar a ${checkResult.preferenceTarget.userName}?`);
+        if (!confirmSwap) { setModalError("No se realizó el desplazamiento"); return; }
+        await deleteDoc(doc(db, "artifacts", appId, "public", "data", "shift_vacations_v6", checkResult.preferenceTarget.id));
+        await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_chat_messages"), {
+          text: `⚠️ AVISO: ${currentUser.name} desplazó a ${checkResult.preferenceTarget.userName} en las vacaciones del día ${checkResult.day} por preferencia.`,
+          userId: "system",
+          userName: "ℹ️ PREFERENCIA",
+          groupId: currentUser.group,
+          createdAt: serverTimestamp(),
+        });
+      } else { setModalError(checkResult.msg); return; }
+    }
     try {
       await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_vacations_v6"), {
         userId: currentUser.id, userName: currentUser.name, type: type, year: yearToCharge,
         startDate: selectionStats.startStr, endDate: selectionStats.endStr, days: selectionStats.range,
         cost: selectionStats.workDays, createdAt: serverTimestamp(),
       });
       alert("✅ Solicitud guardada correctamente"); closeAllModals();
     } catch (e) { alert("❌ Error al guardar: " + e.message); setModalError("Error guardando."); }
   };
 
   const deleteRequest = async () => {
     if (confirm("¿Borrar solicitud?")) {
       await deleteDoc(doc(db, "artifacts", appId, "public", "data", "shift_vacations_v6", selectedRequestToDelete.id));
       closeAllModals();
     }
   };
 
   const deleteOverride = async () => {
     if (!selectedOverrideToDelete) return;
     if (confirm("¿Restaurar turno original?")) {
       await deleteDoc(doc(db, "artifacts", appId, "public", "data", "shift_overrides", selectedOverrideToDelete.id));
       await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_chat_messages"), { text: `⚠️ AVISO: ${currentUser.name} ha anulado su cambio de servicio del día ${selectedOverrideToDelete.date}.`, userId: "system", userName: "↩️ CAMBIO ANULADO", groupId: currentUser.group, createdAt: serverTimestamp() });
       closeAllModals();
     }
   };
@@ -515,89 +599,94 @@ export default function AppFinalV20() {
   const getUsed = (uid, type, year) => requests.filter((r) => r.userId === uid && r.type === type && r.year === year).reduce((acc, r) => acc + r.cost, 0);
 
   const handleDayClick = (dateStr) => {
     if (dateStr < PERIOD_START || dateStr > PERIOD_END) return;
     const myOverride = overrides.find((o) => o.userId === currentUser.id && o.date === dateStr);
     if (myOverride) { setSelectedOverrideToDelete(myOverride); setShowModal(true); setSelectionStart(dateStr); setSelectionEnd(null); return; }
     const myReq = requests.find((r) => r.userId === currentUser.id && r.days.includes(dateStr));
     if (myReq) { setSelectedRequestToDelete(myReq); setShowModal(true); setSelectionStart(null); return; }
     if (!selectionStart || (selectionStart && selectionEnd)) { setSelectionStart(dateStr); setSelectionEnd(null); setShowModal(false); }
     else { setSelectionEnd(dateStr); setShowModal(true); }
   };
 
   const renderDay = useCallback((year, month, d) => {
     const date = new Date(year, month, d);
     const dateStr = toDateStr(date);
     const isToday = dateStr === toDateStr(new Date());
     const shift = getEffectiveShift(dateStr, currentUser?.id, currentUser?.group);
     const style = SHIFT_STYLES[shift] || SHIFT_STYLES["L"];
     const occ = occupationMap[dateStr];
     let isSelected = selectionStats && selectionStats.range.includes(dateStr);
     const isInteractive = dateStr >= PERIOD_START && dateStr <= PERIOD_END;
     
     let bgClass = isSelected ? "bg-green-100 ring-2 ring-green-600 z-10" : "hover:bg-green-50/30";
     if (isToday && !isSelected) bgClass = "bg-yellow-200/60 ring-2 ring-yellow-400";
 
+    const overrideBorder = overrideMarkedDates.has(dateStr) ? "border-2 border-red-500" : "border-green-100 border-r border-b";
+
     return (
-      <div key={dateStr} onClick={() => isInteractive && handleDayClick(dateStr)} className={`relative h-auto min-h-[5.5rem] border-green-100 border-r border-b p-1 cursor-pointer select-none flex flex-col ${bgClass} ${!isInteractive ? "opacity-40 pointer-events-none bg-gray-50" : "bg-white/80"}`}>
+      <div key={dateStr} onClick={() => isInteractive && handleDayClick(dateStr)} className={`relative h-auto min-h-[5.5rem] ${overrideBorder} p-1 cursor-pointer select-none flex flex-col ${bgClass} ${!isInteractive ? "opacity-40 pointer-events-none bg-gray-50" : "bg-white/80"}`}>
         <div className="flex justify-between items-start mb-1">
           <span className={`text-xs font-bold ${[0, 6].includes(date.getDay()) ? "text-red-400" : "text-green-800"}`}>{d}</span>
           <span className={`text-[9px] font-bold px-1 rounded border ${style.bg} ${style.text}`}>{style.label}</span>
         </div>
         <div className="flex flex-col gap-0.5 mt-1 w-full overflow-hidden">
           {occ && occ.reqs.map((req, i) => (
             <div key={i} className={`text-[9px] px-1 py-0.5 rounded truncate font-medium text-white shadow-sm ${TYPE_STYLES[req.type || "vacation"]?.color} ${req.userId === currentUser?.id ? "ring-1 ring-yellow-400 z-10 font-bold" : "opacity-90"}`}>{req.userName}</div>
           ))}
         </div>
       </div>
     );
-  }, [currentUser, occupationMap, selectionStats, overrides]);
+  }, [currentUser, occupationMap, selectionStats, overrideMarkedDates]);
 
   const calendarGrid = useMemo(() => {
     const grids = []; let curr = new Date(PERIOD_START); const end = new Date(PERIOD_END); curr.setDate(1);
     const today = new Date(); const currentYear = today.getFullYear(); const currentMonth = today.getMonth();
     while (curr <= end) {
       const year = curr.getFullYear(); const month = curr.getMonth(); const days = [];
       const daysInMonth = new Date(year, month + 1, 0).getDate();
       const offset = (new Date(year, month, 1).getDay() + 6) % 7;
       for (let i = 0; i < offset; i++) days.push(<div key={`e-${i}`} className="bg-green-50/20 border-r border-b border-green-100" />);
       for (let d = 1; d <= daysInMonth; d++) days.push(renderDay(year, month, d));
       const isCurrentMonthGrid = year === currentYear && month === currentMonth;
       grids.push(
         <div key={`${year}-${month}`} ref={isCurrentMonthGrid ? currentMonthRef : null} className="break-inside-avoid mb-6 bg-white shadow-sm border border-green-200 rounded-lg overflow-hidden">
           <div className="bg-green-900 text-white px-4 py-2 font-bold text-sm flex justify-between"><span>{curr.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase()}</span></div>
           <div className="grid grid-cols-7 text-center bg-green-50 text-[10px] font-bold text-green-800 py-1 border-b border-green-200"><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div className="text-red-400">SÁB</div><div className="text-red-400">DOM</div></div>
           <div className="grid grid-cols-7">{days}</div>
         </div>
       );
       curr.setMonth(curr.getMonth() + 1);
     }
     return grids;
   }, [renderDay, requests, selectionStart, selectionEnd, currentUser, overrides, selectedGroupId, occupationMap]);
 
   const initiateRequest = (type) => {
-    if (!selectionStats) return; setModalError("");
+    if (!selectionStats) { setModalError("Selecciona primero un rango válido en el calendario."); return; }
+    if (type === "nav" && !navValidation.ok) { setModalError(navValidation.reason); return; }
+    if (type === "ss" && !ssValidation.ok) { setModalError(ssValidation.reason); return; }
+    setModalError("");
     const isOverlap = selectionStats.range.every((d) => d >= START_2026_START && d <= LIMIT_2025_END);
     if ((type === "vacation" || type === "ap") && isOverlap) { setPendingRequestType(type); setShowYearSelector(true); }
     else {
       let yearToCharge = "2026";
       if (selectionStats.endStr <= LIMIT_2025_END && selectionStats.startStr < START_2026_START) yearToCharge = "2025";
       processRequest(type, yearToCharge);
     }
   };
 
   const currentDayShift = selectionStart ? getEffectiveShift(selectionStart, currentUser?.id, currentUser?.group) : null;
   const isWorkingDay = currentDayShift && SHIFT_STYLES[currentDayShift]?.workDay;
 
   if (view === "categories") return (
     <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans relative">
       <div className="max-w-md w-full text-center">
         <img src={LOGO_URL} className="w-24 h-24 mx-auto mb-6 object-contain bg-white rounded-full p-2 shadow-xl border-4 border-green-100" />
         <h1 className="text-3xl font-black text-green-900 mb-2">TRÁFICO APP</h1>
         <div className="grid gap-4">
           <button onClick={() => { setSelectedCategory("motoristas"); setView("units"); }} className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-lg flex items-center gap-4"><Bike className="w-8 h-8 text-emerald-600" /><span className="font-bold text-xl text-green-900">Motoristas</span></button>
           <button onClick={() => { setSelectedCategory("atestados"); setView("units"); }} className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-lg flex items-center gap-4"><FileText className="w-8 h-8 text-blue-600" /><span className="font-bold text-xl text-blue-900">Atestados</span></button>
         </div>
       </div>
     </div>
   );
 
@@ -652,82 +741,118 @@ export default function AppFinalV20() {
             <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0"><h3 className="font-bold text-lg flex items-center gap-2"><Briefcase /> Servicio {new Date(serviceDate).toLocaleDateString()}</h3><button onClick={() => setShowServiceModal(false)}><X /></button></div>
             <div className="p-4 space-y-6 overflow-y-auto flex-1 bg-slate-50">
               <div><h4 className="font-bold text-blue-900 uppercase text-sm border-b border-blue-200 mb-2">Fuerza Motorista</h4>{["M", "T", "N"].map(s => (<div key={s} className="mb-2"><span className="font-bold text-xs">{s === "M" ? "MAÑANA" : s === "T" ? "TARDE" : "NOCHE"}</span><div className="bg-white p-2 border rounded text-xs">{serviceData.moto[s].length > 0 ? serviceData.moto[s].join(", ") : "Sin efectivos"}</div></div>))}</div>
               <div><h4 className="font-bold text-indigo-900 uppercase text-sm border-b border-indigo-200 mb-2">Equipo Atestados</h4>{["M", "N"].map(s => (<div key={s} className="mb-2"><span className="font-bold text-xs">{s === "M" ? "MAÑANA/DÍA" : "NOCHE"}</span><div className="bg-white p-2 border rounded text-xs">{serviceData.eis[s].length > 0 ? serviceData.eis[s].join(", ") : "Sin efectivos"}</div></div>))}</div>
             </div>
           </div>
         </div>
       )}
 
       {showModal && !showYearSelector && !showSettingsModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-green-100 overflow-y-auto max-h-[90vh]">
             {selectedRequestToDelete ? (
               <div cla
           </div>
         </div>
       )}
 
       {showYearSelector && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"><h3 className="text-lg font-bold text-slate-800 mb-2">📅 Periodo de Solapamiento</h3><div className="space-y-3"><button onClick={() => processRequest(pendingRequestType, "2025")} className="w-full p-4 bg-orange-100 rounded-xl border font-bold">Cupo 2025</button><button onClick={() => processRequest(pendingRequestType, "2026")} className="w-full p-4 bg-emerald-100 rounded-xl border font-bold">Cupo 2026</button></div><button onClick={closeAllModals} className="mt-4 text-slate-400 text-sm">Cancelar</button></div>
         </div>
       )}
 
       <nav className="bg-green-900 text-white shadow-lg sticky top-0 z-40">
         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3"><img src={LOGO_URL} className="w-8 h-8 bg-white rounded-full p-0.5" /><div><div className="font-bold text-sm">{currentUser.name}</div><button onClick={() => setShowSettingsModal(true)} className="text-[10px] text-emerald-300 flex items-center gap-1"><Settings className="w-3 h-3" /> Ver/Editar Saldos</button></div></div>
           <div className="flex items-center gap-3">
             <button onClick={() => openPopup(GPT_URL, "GPT Tráfico")} className="p-2 text-emerald-300"><Bot className="w-6 h-6" /></button>
             <button onClick={() => openPopup(FORM_PERMISOS_URL, "Permisos")} className="p-2 text-emerald-300"><Car className="w-6 h-6" /></button>
             <button onClick={() => setShowChat(true)} className="relative p-2 text-green-300"><MessageCircle className="w-6 h-6" />{unreadCount > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />}</button>
             <button onClick={handleLogout} className="p-2 text-green-300"><LogOut className="w-6 h-6" /></button>
           </div>
         </div>
       </nav>
 
       {showChat && (
-        <div className="fixed inset-0 z-[100] flex justify-end"><div className="absolute inset-0 bg-black/20" onClick={() => setShowChat(false)} /><div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"><div className="bg-green-900 text-white p-4 flex justify-between items-center"><h3 className="font-bold">Chat</h3><button onClick={() => setShowChat(false)}><X /></button></div><div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-50">{messages.map(msg => (<div key={msg.id} className="border p-2 rounded bg-white text-xs">{msg.text}</div>))}</div><form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 border rounded-full px-4 py-2 text-sm" placeholder="Mensaje..." /><button type="submit" className="text-emerald-600"><Send /></button></form></div></div>
+        <div className="fixed inset-0 z-[100] flex justify-end">
+          <div className="absolute inset-0 bg-black/20" onClick={() => setShowChat(false)} />
+          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
+            <div className="bg-green-900 text-white p-4 flex justify-between items-center"><h3 className="font-bold">Chat</h3><button onClick={() => setShowChat(false)}><X /></button></div>
+            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-50">
+              {messages.map((msg) => (
+                <div key={msg.id} className="border p-3 rounded-lg bg-white text-xs shadow-sm">
+                  {msg.isSwap && msg.swapData ? (
+                    <div className="space-y-2">
+                      <div className="flex items-center gap-2 text-green-800 font-bold text-sm"><ArrowRightLeft className="w-4 h-4" /> Cambio de servicio</div>
+                      <div className="text-slate-700 text-xs">{msg.text}</div>
+                      <div className="text-[11px] text-slate-500">De {msg.swapData.fromShift} a {msg.swapData.toShift} · Día {msg.swapData.date}</div>
+                      {msg.swapData.status === "accepted" ? (
+                        <div className="text-[11px] text-emerald-700 font-semibold">Aceptado por {msg.swapData.acceptedBy}</div>
+                      ) : (
+                        <button onClick={() => acceptSwap(msg)} className="w-full bg-emerald-600 text-white rounded-md py-1.5 text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-700 disabled:opacity-50" disabled={msg.swapData.requesterId === currentUser?.id}>Aceptar solicitud</button>
+                      )}
+                    </div>
+                  ) : (
+                    <div>{msg.text}</div>
+                  )}
+                </div>
+              ))}
+            </div>
+            <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 border rounded-full px-4 py-2 text-sm" placeholder="Mensaje..." /><button type="submit" className="text-emerald-600"><Send /></button></form>
+          </div>
+        </div>
       )}
 
       <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
         <div className="lg:col-span-1 space-y-4"><div className="bg-white p-5 rounded-xl shadow-sm border border-green-100"><h3 className="font-bold text-green-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Estado {GROUPS.find((g) => g.id === selectedGroupId)?.name} (2026)</h3><div className="space-y-2">{activeMembers.filter((m) => m.active).map((m) => (<div key={m.id} className="text-xs flex justify-between border-b pb-1 border-green-50 last:border-0"><span className={m.id === currentUser.id ? "text-emerald-700 font-bold" : "text-slate-600"}>{m.name}</span><div className="flex gap-2 font-medium"><span className="text-emerald-600">V:{getUsed(m.id, "vacation", "2026")}/{getUserLimits(m.id).vac26}</span><span className="text-purple-600">AP:{getUsed(m.id, "ap", "2026")}/{getUserLimits(m.id).ap26}</span></div></div>))}</div></div></div>
         <div className="lg:col-span-2">{loading ? <div className="p-10 text-center text-emerald-600 font-medium animate-pulse">Cargando...</div> : <div className="columns-1 xl:columns-2 gap-4 space-y-4">{calendarGrid}</div>}</div>
       </main>
     </div>ssName="text-center"><Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="font-bold text-slate-800">¿Borrar solicitud?</h3><div className="flex gap-3 mt-4"><button onClick={closeAllModals} className="flex-1 py-2 bg-slate-100 rounded">No</button><button onClick={deleteRequest} className="flex-1 py-2 bg-red-500 text-white rounded">Sí, Borrar</button></div></div>
             ) : selectedOverrideToDelete ? (
               <div className="text-center"><Undo2 className="w-12 h-12 text-orange-500 mx-auto mb-4" /><h3 className="font-bold text-slate-800">¿Restaurar turno?</h3><p className="text-xs text-slate-500 mt-2 mb-4">Se anulará el cambio de servicio y volverás a tu turno original.</p><div className="flex gap-3 mt-4"><button onClick={closeAllModals} className="flex-1 py-2 bg-slate-100 rounded text-slate-600 hover:bg-slate-200">Cancelar</button><button onClick={deleteOverride} className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 shadow">Sí, Restaurar</button></div></div>
             ) : !showShiftChange ? (
               <div>
                 <h3 className="text-lg font-bold text-green-900 mb-2">Gestión de Día</h3>
                 <button onClick={() => calculateService(selectionStats.range[0])} className="w-full mb-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"><CalendarCheck /> 👮‍♂️ Ver Servicio Diario</button>
                 {modalError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-4 font-bold border border-red-200">🚨 {modalError}</div>}
                 {isWorkingDay ? (
                   <div className="space-y-2 mb-6">
                     <button onClick={() => initiateRequest("vacation")} className="w-full flex justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg"><div className="flex gap-2"><Briefcase className="w-4 h-4" /> <span className="text-sm font-bold">Vacaciones</span></div><div className="text-[10px] text-right"><div>'25: {limits.vac25 - myV25}</div><div>'26: {limits.vac26 - myV26}</div></div></button>
                     <button onClick={() => initiateRequest("ap")} className="w-full flex justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"><div className="flex gap-2"><UserCheck className="w-4 h-4" /> <span className="text-sm font-bold">Asuntos Propios</span></div><div className="text-[10px] text-right"><div>'25: {limits.ap25 - myAP25}</div><div>'26: {limits.ap26 - myAP26}</div></div></button>
-                    <button onClick={() => initiateRequest("ss")} className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg font-bold text-sm text-orange-900">Semana Santa</button>
-                    <button onClick={() => initiateRequest("nav")} className="w-full p-3 bg-red-50 border border-red-200 rounded-lg font-bold text-sm text-red-900">Navidad</button>
+                    <div className="space-y-1">
+                      <button onClick={() => initiateRequest("ss")} disabled={!ssValidation.ok} className={`w-full p-3 border rounded-lg font-bold text-sm ${ssValidation.ok ? "bg-orange-50 border-orange-200 text-orange-900" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}>
+                        Semana Santa
+                      </button>
+                      <p className="text-[10px] text-slate-500 font-medium text-center">{ssValidation.reason}</p>
+                    </div>
+                    <div className="space-y-1">
+                      <button onClick={() => initiateRequest("nav")} disabled={!navValidation.ok} className={`w-full p-3 border rounded-lg font-bold text-sm ${navValidation.ok ? "bg-red-50 border-red-200 text-red-900" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}>
+                        Navidad
+                      </button>
+                      <p className="text-[10px] text-slate-500 font-medium text-center">{navValidation.reason}</p>
+                    </div>
                     <button onClick={() => processRequest("baja", "2026")} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg font-bold text-sm text-slate-600">Baja Médica</button>
                   </div>
                 ) : (
                   <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800 mb-4 text-center">Hoy libras, solo puedes cambiar servicio.</div>
                 )}
                 <div className="space-y-2">
                   <div className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">Operativa</div>
                   <button onClick={() => setShowShiftChange(true)} className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 font-bold text-sm flex items-center gap-2 transition-colors"><RefreshCw className="w-4 h-4" /> 🔄 Cambio de Servicio</button>
                 </div>
                 <button onClick={closeAllModals} className="mt-4 w-full text-slate-400 text-sm hover:text-slate-600">Cancelar</button>
               </div>
             ) : (
               <div>
                 <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Cambio de Turno</h3>
                 <p className="text-xs text-slate-500 mb-4">Día seleccionado: {selectionStart}</p>
                 <div className="space-y-4">
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-200"><h4 className="font-bold text-slate-800 text-sm mb-2">1. Necesidades del Servicio</h4><div className="flex gap-2">{["M", "T", "N"].map((shift) => (<button key={shift} onClick={() => applyServiceChange(shift)} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${SHIFT_STYLES[shift].bg} ${SHIFT_STYLES[shift].text} hover:opacity-80`}>{shift}</button>))}</div><p className="text-[9px] text-slate-400 mt-1">Cambia tu turno directamente en el cuadrante.</p></div>
                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-200"><h4 className="font-bold text-blue-800 text-sm mb-2">2. Cambiar con Compañero</h4><div className="flex gap-2 mb-2">{["M", "T", "N"].map((shift) => (<button key={shift} onClick={() => setSwapTargetShift(shift)} className={`flex-1 py-2 rounded-lg font-bold text-sm border transition-all ${swapTargetShift === shift ? "bg-blue-600 text-white ring-2 ring-blue-300" : "bg-white text-slate-600 hover:bg-slate-100"}`}>{shift}</button>))}</div><button onClick={() => requestSwap(swapTargetShift)} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 flex items-center justify-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Solicitar Cambio</button><p className="text-[9px] text-blue-400 mt-1">Se enviará una petición al chat de los grupos de tu misma unidad.</p></div>
                 </div>
                 <button onClick={() => setShowShiftChange(false)} className="mt-4 w-full text-slate-400 text-sm hover:text-slate-600">Volver</button>
               </div>
             )}
   );
 }
 
EOF
)
