import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp, setDoc, updateDoc, query, where,
} from "firebase/firestore";
// ✅ Importamos las funciones de Storage
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import {
  X, Lock, LogOut, Trash2, Users, Shield, Briefcase, UserCheck, Eye, Key,
  RefreshCw, ArrowRightLeft, Undo2, Bot, Car, ChevronRight, MessageCircle,
  Send, Settings, MapPin, ChevronLeft, Bike, FileText, CalendarCheck, Info,
  Star, Calculator, Divide, BookOpen, Download, Phone, File, Cloud, Folder,
  ExternalLink, Loader2 // ✅ Icono de carga
} from "lucide-react";

// --- CONFIGURACIÓN FIREBASE ---
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
const storage = getStorage(app); 
const appId = "vacaciones-equipo-2026";

// --- CONSTANTES Y CONFIGURACIÓN ---
const LOGO_URL = "https://i.postimg.cc/d1kK6BtW/Gemini_Generated_Image_7v8i3p7v8i3p7v8i.png";
const GPT_URL = "https://chatgpt.com/g/g-690e357144cc8191bad33044e9d2b5e3-gc-trafico";
const FORM_PERMISOS_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeXJqKZW8pQqfGuJxbpAfwhqxzaBc6GGgt-sK0sgbTqZ_gqTw/viewform?embedded=true";

// FECHAS GENERALES
const PERIOD_START = "2025-11-01";
const PERIOD_END = "2027-01-31";
const LIMIT_2025_END = "2026-03-08";
const START_2026_START = "2026-02-01";

const SS_RANGE = { start: "2026-03-10", end: "2027-04-20" };
const NAV_RANGE_25 = { start: "2025-12-17", end: "2026-01-12" };
const NAV_RANGE_26 = { start: "2026-12-17", end: "2027-01-12" };
const NAVIDAD_WINDOWS = [NAV_RANGE_25, NAV_RANGE_26];

const MIN_WORKING_STAFF_FOR_AP = 2; 
const MAX_VACATION_PER_GROUP = 2;   
const MAX_SPECIAL_PER_GROUP = 2;    

const VACATION_LIMIT_2026 = 19;
const AP_LIMIT_2026 = 6;
const VACATION_LIMIT_2025_DEFAULT = 5; 
const AP_LIMIT_2025_DEFAULT = 2;

const DEFAULT_USER_PIN = "1234";
const DEFAULT_ADMIN_PIN = "9999";

const SPECIAL_SERVICES_LIST = [
  "Puertas M", "Puertas T", "Puertas N",
  "Oficina M", "Oficina T",
  "AFU", "PATIO", "DEX", "TIRO", "COMISIÓN DE SERVICIO"
];

// --- HELPER: ABRIR POPUP ---
const openPopup = (url, title) => {
  const width = 600, height = 800;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  window.open(url, title, `toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${width}, height=${height}, top=${top}, left=${left}`);
};

// --- DATOS DE LA BIBLIOTECA ---
const LIBRARY_DATA = [
  {
    id: "gpt_puertas",
    title: "El Guardia de Puertas",
    icon: "Bot",
    color: "bg-indigo-600 text-white",
    type: "popup",
    url: GPT_URL
  },
  {
    id: "permisos_conducir",
    title: "Actuaciones con Permisos de Conducir",
    icon: "Car",
    color: "bg-blue-600 text-white",
    type: "popup",
    url: FORM_PERMISOS_URL
  },
  {
    id: "codificados",
    title: "Codificados",
    icon: "FileText",
    color: "bg-blue-100 text-blue-700",
    items: [
      { name: "CODIFICADO-NETPOL_4_2015", type: "cloud", storagePath: "Codificados/CODIFICADO-NETPOL_4_2015.pdf" },
      { name: "RELACION CODIFICADA DE INFRACCIONES 2025", type: "cloud", storagePath: "Codificados/RELACION CODIFICADA DE INFRACCIONES 2025.pdf" },
      { name: "Baremo Sancionador", type: "cloud", storagePath: "Codificados/baremosancionador.pdf" },
    ]
  },
  {
    id: "diligencias",
    title: "Diligencias",
    icon: "BookOpen",
    color: "bg-emerald-100 text-emerald-700",
    items: [
      {
        name: "Alcoholemia",
        type: "folder",
        color: "bg-purple-100 text-purple-700",
        items: [
            { name: "Acta justificativa realizacion prueba...", type: "cloud", storagePath: "Diligencias/Alcoholemia/Acta justificativa realizacion prueba distinta del aire.pdf" },
            { name: "Alcoholemia", type: "cloud", storagePath: "Diligencias/Alcoholemia/Alcoholemia.pdf" },
            { name: "Incapaz de insuflar aire", type: "cloud", storagePath: "Diligencias/Alcoholemia/Incapaz de insuflar aire.pdf" },
            { name: "JRSD Alcohlemia con DETENIDO", type: "cloud", storagePath: "Diligencias/Alcoholemia/JRSD Alcohlemia con DETENIDO.pdf" },
            { name: "Metodo distinto aire", type: "cloud", storagePath: "Diligencias/Alcoholemia/Metodo distinto aire.pdf" },
            { name: "Negarse a realizar la segunda prueba", type: "cloud", storagePath: "Diligencias/Alcoholemia/Negarse a realizar la segunda prueba.pdf" },
            { name: "Negativa expresa", type: "cloud", storagePath: "Diligencias/Alcoholemia/Negativa expresa.pdf" },
        ]
      },
      {
        name: "Drogas",
        type: "folder",
        color: "bg-orange-100 text-orange-700",
        items: [
            { name: "AtestadoDROGAS", type: "cloud", storagePath: "Diligencias/Drogas/AtestadoDROGAS.pdf" },
        ]
      },
      {
        name: "Permiso de conducir",
        type: "folder",
        color: "bg-blue-100 text-blue-700",
        items: [
            { name: "JRSD PERMISO CONDUCCION-", type: "cloud", storagePath: "Diligencias/Permiso de conducir/JRSD PERMISO CONDUCCION-.pdf" },
            { name: "JRSD Permiso con DETENIDO", type: "cloud", storagePath: "Diligencias/Permiso de conducir/JRSD Permiso con DETENIDO.pdf" },
        ]
      },
      {
        name: "Velocidad",
        type: "folder",
        color: "bg-red-100 text-red-700",
        items: [
            { name: "Atestado Velocidad Invest.-detenido", type: "cloud", storagePath: "Diligencias/Velocidad/Atestado Velocidad Invest.-detenido.pdf" },
            { name: "Atestado Velocidad Investigado", type: "cloud", storagePath: "Diligencias/Velocidad/Atestado Velocidad Investigado.pdf" },
            { name: "Atestado Velocidad detenido", type: "cloud", storagePath: "Diligencias/Velocidad/Atestado Velocidad detenido.pdf" },
        ]
      },
    ]
  },
  {
    id: "interes",
    title: "Teléfonos de Interés",
    icon: "Phone",
    color: "bg-orange-100 text-orange-700",
    items: [
      { name: "COTA", type: "info", content: "965 21 99 12" },
    ]
  }
];

const CYCLE_MOTO_8H = ["M", "M", "M", "T", "T", "N", "S", "L", "L", "L", "L"];
const CYCLE_EIS_NEW = ["M", "M", "N", "S", "L", "L", "L", "L"];

const REF_MOTO_G1 = "2026-01-09";
const REF_MOTO_G2 = "2025-11-09";
const REF_MOTO_G3 = "2025-11-03";
const REF_MOTO_G4 = "2025-11-12";
const REF_MOTO_G5 = "2025-11-07";

const GROUPS = [
  { id: "G3_MOTO", name: "Grupo 1", unit: "Destacamento Benidorm", category: "motoristas", refDate: REF_MOTO_G3, cycle: CYCLE_MOTO_8H },
  { id: "G4_MOTO", name: "Grupo 2", unit: "Destacamento Benidorm", category: "motoristas", refDate: REF_MOTO_G4, cycle: CYCLE_MOTO_8H },
  { id: "G1_MOTO", name: "Grupo 3", unit: "Destacamento Benidorm", category: "motoristas", refDate: REF_MOTO_G1, cycle: CYCLE_MOTO_8H },
  { id: "G5_MOTO", name: "Grupo 4", unit: "Destacamento Benidorm", category: "motoristas", refDate: REF_MOTO_G5, cycle: CYCLE_MOTO_8H },
  { id: "G2_MOTO", name: "Grupo 5", unit: "Destacamento Benidorm", category: "motoristas", refDate: REF_MOTO_G2, cycle: CYCLE_MOTO_8H },
  // EIS BENIDORM
  { id: "EIS_BEN_G1", name: "Grupo 1", unit: "EIS Benidorm", category: "atestados", refDate: "2025-12-04", cycle: CYCLE_EIS_NEW },
  { id: "EIS_BEN_G2", name: "Grupo 2", unit: "EIS Benidorm", category: "atestados", refDate: "2025-12-06", cycle: CYCLE_EIS_NEW },
  // EIS ALICANTE
  { id: "EIS_ALC_G1", name: "Grupo 1", unit: "EIS Alicante", category: "atestados", refDate: "2025-12-05", cycle: CYCLE_EIS_NEW },
  { id: "EIS_ALC_G2", name: "Grupo 2", unit: "EIS Alicante", category: "atestados", refDate: "2025-12-08", cycle: CYCLE_EIS_NEW },
  { id: "EIS_ALC_G3", name: "Grupo 3", unit: "EIS Alicante", category: "atestados", refDate: "2025-12-10", cycle: CYCLE_EIS_NEW },
  // EIS ORIHUELA
  { id: "EIS_ORI_G1", name: "Grupo 1", unit: "EIS Orihuela", category: "atestados", refDate: "2025-12-09", cycle: CYCLE_EIS_NEW },
  { id: "EIS_ORI_G2", name: "Grupo 2", unit: "EIS Orihuela", category: "atestados", refDate: "2025-12-05", cycle: CYCLE_EIS_NEW },
  // EIS TORREVIEJA
  { id: "EIS_TOR_G1", name: "Grupo 1", unit: "EIS Torrevieja", category: "atestados", refDate: "2025-12-07", cycle: CYCLE_EIS_NEW },
  { id: "EIS_TOR_G2", name: "Grupo 2", unit: "EIS Torrevieja", category: "atestados", refDate: "2025-12-11", cycle: CYCLE_EIS_NEW },
];

const MEMBERS = [
  { id: "tello", name: "Tello", group: "G1_MOTO", active: true },
  { id: "beltran", name: "Beltrán", group: "G1_MOTO", active: true },
  { id: "dieguez", name: "Diéguez", group: "G1_MOTO", active: true },
  { id: "nando", name: "Nando", group: "G1_MOTO", active: true },
  { id: "escribano", name: "Escribano", group: "G1_MOTO", active: true },
  { id: "pena", name: "Peña", group: "G1_MOTO", active: true },
  { id: "munoz", name: "Muñoz", group: "G1_MOTO", active: false, status: "BAJA" },
  { id: "josema", name: "Josema", group: "G2_MOTO", active: false, status: "BAJA" },
  { id: "raul", name: "Raul", group: "G2_MOTO", active: true },
  { id: "castillo", name: "Castillo", group: "G2_MOTO", active: true },
  { id: "torregrosa", name: "Torregrosa", group: "G2_MOTO", active: true },
  { id: "monzon", name: "Monzon", group: "G2_MOTO", active: true },
  { id: "roman", name: "Roman", group: "G2_MOTO", active: true },
  { id: "melero", name: "Melero", group: "G2_MOTO", active: true },
  { id: "ismael", name: "Ismael", group: "G3_MOTO", active: true },
  { id: "extremera", name: "Extremera", group: "G3_MOTO", active: true },
  { id: "perojil", name: "Perojil", group: "G3_MOTO", active: true },
  { id: "gabriel", name: "Gabriel", group: "G3_MOTO", active: true },
  { id: "quintana", name: "Quintana", group: "G3_MOTO", active: true },
  { id: "otero", name: "Otero", group: "G3_MOTO", active: true }, 
  { id: "navarro", name: "Navarro", group: "G4_MOTO", active: false, status: "BAJA" },
  { id: "ruben", name: "Ruben", group: "G4_MOTO", active: false, status: "BAJA" },
  { id: "angel", name: "Angel", group: "G4_MOTO", active: false, status: "BAJA" },
  { id: "delatorre", name: "De la Torre", group: "G4_MOTO", active: true },
  { id: "gil", name: "Gil", group: "G4_MOTO", active: true },
  { id: "marcos_moto", name: "Marcos", group: "G4_MOTO", active: true },
  { id: "miriam", name: "Miriam", group: "G4_MOTO", active: true },
  { id: "quilez", name: "Quilez", group: "G4_MOTO", active: true }, 
  { id: "albero", name: "Albero", group: "G4_MOTO", active: true }, 
  { id: "sarabia", name: "Sarabia", group: "G5_MOTO", active: true },
  { id: "pedroperez", name: "Pedro Perez", group: "G5_MOTO", active: true },
  { id: "jorge", name: "Jorge", group: "G5_MOTO", active: true },
  { id: "carpi", name: "Carpi", group: "G5_MOTO", active: true },
  { id: "guillamon", name: "Guillamon", group: "G5_MOTO", active: true },
  { id: "fajardo", name: "Fajardo", group: "G5_MOTO", active: true },
  // EIS
  { id: "barrientos", name: "C1 Barrientos", group: "EIS_BEN_G1", active: true },
  { id: "alvaro", name: "GC Álvaro", group: "EIS_BEN_G1", active: true },
  { id: "valverde_b", name: "GC Valverde", group: "EIS_BEN_G1", active: true },
  { id: "ayuso", name: "GC Ayuso", group: "EIS_BEN_G1", active: true },
  { id: "rabadan", name: "C1 Rabadán", group: "EIS_BEN_G2", active: true },
  { id: "delacruz", name: "GC De la Cruz", group: "EIS_BEN_G2", active: true },
  { id: "morales", name: "GC Morales", group: "EIS_BEN_G2", active: true },
  { id: "yanez", name: "C1 Yañez", group: "EIS_ALC_G1", active: true },
  { id: "hernandez", name: "GC Hernandez", group: "EIS_ALC_G1", active: true },
  { id: "senderos", name: "GC Senderos", group: "EIS_ALC_G1", active: true },
  { id: "monedero", name: "C1 Monedero", group: "EIS_ALC_G2", active: true },
  { id: "javier_a", name: "GC Javier", group: "EIS_ALC_G2", active: true },
  { id: "marcos_a", name: "GC Marcos", group: "EIS_ALC_G2", active: true },
  { id: "sevilla", name: "GC Sevilla", group: "EIS_ALC_G2", active: true },
  { id: "almendros", name: "CB Almendros", group: "EIS_ALC_G3", active: true },
  { id: "marrodan", name: "GC Marrodan", group: "EIS_ALC_G3", active: true },
  { id: "uxio", name: "GC Uxio", group: "EIS_ALC_G3", active: true },
  { id: "maldonado", name: "C1 Maldonado", group: "EIS_ORI_G1", active: true },
  { id: "javier_o", name: "GC Javier", group: "EIS_ORI_G1", active: true },
  { id: "valverde_o", name: "GC Valverde", group: "EIS_ORI_G1", active: true },
  { id: "marcos_o", name: "GC Marcos", group: "EIS_ORI_G1", active: true },
  { id: "lopez", name: "GC Lopez", group: "EIS_ORI_G2", active: true },
  { id: "parra", name: "GC Parra", group: "EIS_ORI_G2", active: true },
  { id: "rafael", name: "GC Rafael", group: "EIS_ORI_G2", active: true },
  { id: "francisco", name: "GC Francisco", group: "EIS_ORI_G2", active: true },
  { id: "rebollo", name: "GC Rebollo", group: "EIS_TOR_G1", active: true },
  { id: "rodriguez", name: "GC Rodriguez", group: "EIS_TOR_G1", active: true },
  { id: "cabezas", name: "GC Cabezas", group: "EIS_TOR_G1", active: true },
  { id: "melani", name: "GC Melani", group: "EIS_TOR_G1", active: true },
  { id: "rivera", name: "GC Rivera", group: "EIS_TOR_G2", active: true },
  { id: "tortosa", name: "GC Tortosa", group: "EIS_TOR_G2", active: true },
  { id: "cerceda", name: "GC Cerceda", group: "EIS_TOR_G2", active: true },
  { id: "berzosa", name: "GC Berzosa", group: "EIS_TOR_G2", active: true },
];

const SHIFT_STYLES = {
  M: { label: "M", bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200", workDay: true },
  T: { label: "T", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", workDay: true },
  N: { label: "N", bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", workDay: true },
  S: { label: "S", bg: "bg-emerald-600", text: "text-white", border: "border-emerald-700", workDay: false },
  L: { label: "L", bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", workDay: false },
};

const getShiftStyle = (shiftCode) => {
    if (SHIFT_STYLES[shiftCode]) return SHIFT_STYLES[shiftCode];
    return { 
        label: shiftCode.length > 5 ? shiftCode.substring(0,3) + ".." : shiftCode,
        fullLabel: shiftCode,
        bg: "bg-indigo-100", 
        text: "text-indigo-800", 
        border: "border-indigo-200", 
        workDay: true 
    };
};

const TYPE_STYLES = {
  vacation: { color: "bg-emerald-600", label: "VAC" },
  ap: { color: "bg-purple-600", label: "AP" },
  baja: { color: "bg-slate-500", label: "BAJA" },
  ss: { color: "bg-orange-500", label: "SS" },
  nav: { color: "bg-red-500", label: "NAV" },
};

// --- HELPERS ---
const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const calculateShiftCycle = (targetDateStr, refDateStr, cycleArray) => {
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

const validateSpecialRange = (rangeDates, type) => {
  if (!rangeDates || rangeDates.length === 0) return { ok: false, reason: "Selecciona primero el rango." };

  if (type === "nav") {
    const windowMatch = NAVIDAD_WINDOWS.find((w) => isRangeWithin(rangeDates, w.start, w.end));
    if (!windowMatch) {
      return { ok: false, reason: "Navidad solo se puede pedir entre 17/12/2025-12/01/2026 o 17/12/2026-12/01/2027." };
    }
    if (rangeDates.length > 3) return { ok: false, reason: "Máximo 3 días de Navidad." };
    return { ok: true, reason: "Dentro de ventanas autorizadas." };
  }

  if (type === "ss") {
    if (!isRangeWithin(rangeDates, SS_RANGE.start, SS_RANGE.end)) {
      return { ok: false, reason: "Semana Santa solo está permitida del 10 de marzo de 2026 al 20 de abril de 2027." };
    }
    if (rangeDates.length > 3) return { ok: false, reason: "Semana Santa máximo 3 días." };
    return { ok: true, reason: "Dentro del rango autorizado." };
  }

  return { ok: true, reason: "" };
};

const getLastVacationEnd = (requests, userId) => {
  const relevant = requests
    .filter((r) => ["vacation", "nav", "ss"].includes(r.type) && r.userId === userId && r.endDate)
    .map((r) => r.endDate)
    .sort(); 
  return relevant.length > 0 ? relevant[relevant.length - 1] : "1900-01-01";
};

const getLastAPEnd = (requests, userId) => {
  const relevant = requests
    .filter((r) => r.type === "ap" && r.userId === userId && r.endDate)
    .map((r) => r.endDate)
    .sort(); 
  return relevant.length > 0 ? relevant[relevant.length - 1] : "1900-01-01";
};

// --- COMPONENTE CALCULADORA ---
const CalculatorView = ({ onBack }) => {
    const [mode, setMode] = useState("vacation"); 
    const [hours, setHours] = useState("");
    const [shiftLength, setShiftLength] = useState(8);
    const [result, setResult] = useState(null);

    const calculate = () => {
        const h = parseFloat(hours);
        if (isNaN(h)) { setResult("Error"); return; }
        let val = h / shiftLength;
        val = Math.ceil(val);
        setResult(val);
    };

    return (
        <div className="min-h-screen bg-green-50/30 flex flex-col items-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200 p-6">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-slate-800">
                    <ChevronLeft className="w-4 h-4" /> Volver
                </button>
                <h2 className="text-2xl font-black text-green-900 mb-6 flex items-center gap-2"><Calculator className="w-6 h-6" /> Calculadora</h2>
                <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
                    <button onClick={() => {setMode("vacation"); setResult(null);}} className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${mode === "vacation" ? "bg-white text-emerald-700 shadow" : "text-slate-500"}`}>Vacaciones</button>
                    <button onClick={() => {setMode("ap"); setResult(null);}} className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${mode === "ap" ? "bg-white text-purple-700 shadow" : "text-slate-500"}`}>Asuntos Propios</button>
                </div>
                <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horas de crédito</label><input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full p-3 border rounded-xl font-bold text-lg" placeholder="0" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duración Turno</label><select value={shiftLength} onChange={(e) => setShiftLength(parseFloat(e.target.value))} className="w-full p-3 border rounded-xl font-bold text-slate-700 bg-white"><option value={8}>8 horas</option><option value={8.5}>8.5 horas</option><option value={12}>12 horas</option></select></div>
                    <button onClick={calculate} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${mode === "vacation" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-purple-600 hover:bg-purple-700"}`}>Calcular Días</button>
                    {result !== null && (<div className="mt-6 text-center animate-in fade-in zoom-in"><span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Resultado</span><div className={`text-5xl font-black mt-2 ${mode === "vacation" ? "text-emerald-600" : "text-purple-600"}`}>{result} <span className="text-xl text-slate-400">días</span></div><p className="text-xs text-slate-400 mt-2 font-medium">(Redondeado hacia arriba)</p></div>)}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE BIBLIOTECA DEL GUARDIA (Soporte Subcarpetas + Feedback Carga) ---
const LibraryView = ({ onBack }) => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [loadingItem, setLoadingItem] = useState(null); 

  const handleItemClick = async (item) => {
    // 1. SI ES POPUP (GPT o Formulario)
    if (item.type === "popup") {
        openPopup(item.url, item.title);
        return;
    }

    // 2. SI ES NUBE (Storage) - SOLUCIÓN "ABRIR PRIMERO"
    if (item.storagePath) {
        setLoadingItem(item.name); 
        
        // 💡 SOLUCIÓN BLOQUEO: Abrimos la ventana ANTES de la petición (instantáneo al clic)
        // Así el navegador sabe que fue acción del usuario.
        const newWindow = window.open('', '_blank');
        
        // Si newWindow es null, es que el bloqueador es muy agresivo.
        if (!newWindow) {
             alert("⚠️ El navegador bloqueó la ventana emergente. Por favor, permite los pop-ups para esta web.");
             setLoadingItem(null);
             return;
        }

        // Ponemos un mensajito visual en la nueva pestaña mientras carga
        newWindow.document.write(`
            <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#f0fdf4;color:#166534;margin:0;}</style>
            <div style="font-size:24px;font-weight:bold;margin-bottom:10px">Cargando documento oficial...</div>
            <div>Por favor, espera un momento.</div>
        `);

        try {
            const storageRef = ref(storage, item.storagePath);
            const url = await getDownloadURL(storageRef);
            
            // ¡Bingo! Tenemos la URL, redirigimos la ventana que ya teníamos abierta
            newWindow.location.href = url;

        } catch (error) {
            // Si falla, cerramos esa ventana fea y avisamos
            newWindow.close();
            
            console.error("Error bajando de Storage:", error);
            let msg = "Error desconocido.";
            if (error.code === 'storage/object-not-found') msg = `No se encuentra el archivo en la ruta: ${item.storagePath}. Revisa las mayúsculas/minúsculas en Firebase.`;
            if (error.code === 'storage/unauthorized') msg = "No tienes permiso para ver este archivo. Verifica las Reglas de Storage en Firebase console.";
            alert(`⚠️ Error al abrir: ${msg}`);
        } finally {
            setLoadingItem(null);
        }
        return;
    }

    // 3. SI ES CARPETA
    if (item.items) {
        openFolder(item);
        return;
    }

    // 4. SI ES CONTENIDO LOCAL (Fallback)
    if (item.content) {
      const blob = new Blob([item.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openFolder = (folder) => {
    setFolderHistory([...folderHistory, currentFolder]); 
    setCurrentFolder(folder);
  };

  const goBack = () => {
    if (folderHistory.length === 0) {
      onBack(); 
    } else {
      const prev = folderHistory[folderHistory.length - 1];
      const newHistory = folderHistory.slice(0, -1);
      setFolderHistory(newHistory);
      setCurrentFolder(prev);
    }
  };

  const itemsToRender = currentFolder ? currentFolder.items : LIBRARY_DATA;
  const title = currentFolder ? currentFolder.name || currentFolder.title : "Biblioteca del Guardia";

  const FolderIcon = ({ name, className }) => {
    const Icons = { BookOpen, FileText, Phone, Bot, Car };
    const Ico = Icons[name] || FileText;
    return <Ico className={className} />;
  };

  return (
    <div className="min-h-screen bg-green-50/30 flex flex-col items-center p-4 font-sans">
      <div className="max-w-md w-full">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-slate-800">
          <ChevronLeft className="w-4 h-4" /> {folderHistory.length === 0 ? "Volver al Inicio" : "Atrás"}
        </button>
        
        <h2 className="text-2xl font-black text-green-900 mb-6 flex items-center gap-2">
          {currentFolder ? <Folder className="w-6 h-6 text-green-700"/> : <BookOpen className="w-6 h-6" />} {title}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {itemsToRender.map((item, idx) => (
            <div key={idx}>
              <button 
                onClick={() => handleItemClick(item)} 
                disabled={loadingItem === item.name} 
                className={`w-full p-4 rounded-xl shadow-sm flex items-center gap-4 transition-all hover:scale-[1.01] bg-white border border-slate-100 text-left ${loadingItem === item.name ? "opacity-70" : ""}`}
              >
                <div className={`p-3 rounded-lg ${item.color || "bg-slate-100 text-slate-600"}`}>
                    {loadingItem === item.name ? (
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    ) : (
                        item.icon ? <FolderIcon name={item.icon} className="w-6 h-6" /> : 
                        (item.items ? <Folder className="w-6 h-6" /> : 
                        (item.type === "cloud" ? <Cloud className="w-6 h-6" /> : <File className="w-6 h-6" />))
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-800">{item.title || item.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                        {item.type === "popup" ? "Herramienta Externa" : 
                        (item.items ? `${item.items.length} elementos` : 
                        (item.type === "cloud" ? "Documento Oficial" : item.type || "Archivo"))}
                    </p>
                </div>

                {item.type === "popup" ? <ExternalLink className="w-5 h-5 text-slate-300" /> : 
                 (item.items ? <ChevronRight className="w-5 h-5 text-slate-300" /> : <Download className="w-5 h-5 text-emerald-500" />)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function AppFinal() {
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

  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState("");
  const [selectedRequestToDelete, setSelectedRequestToDelete] = useState(null);
  const [selectedOverrideToDelete, setSelectedOverrideToDelete] = useState(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    ap25: AP_LIMIT_2025_DEFAULT, vac25: VACATION_LIMIT_2025_DEFAULT,
    ap26: AP_LIMIT_2026, vac26: VACATION_LIMIT_2026,
  });
  const [newPin, setNewPin] = useState("");

  const [showYearSelector, setShowYearSelector] = useState(false);
  const [pendingRequestType, setPendingRequestType] = useState(null);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceData, setServiceData] = useState({ moto: { M: [], T: [], N: [] }, eis: { M: [], T: [], N: [] } });
  const [serviceDate, setServiceDate] = useState("");

  const [showShiftChange, setShowShiftChange] = useState(false);
  const [swapTargetShift, setSwapTargetShift] = useState("M");

  const currentMonthRef = useRef(null);

  const unitsInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const units = GROUPS.filter((g) => g.category === selectedCategory).map((g) => g.unit);
    return [...new Set(units)].sort();
  }, [selectedCategory]);

  const groupsInSelectedUnit = useMemo(() => {
    if (!selectedUnit) return [];
    return GROUPS.filter((g) => g.unit === selectedUnit);
  }, [selectedUnit]);

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
          map[day][type] = (map[day][type] || 0) + 1;
          map[day].totalAbsence++;
          map[day].reqs.push(req);
        });
      }
    });
    return map;
  }, [requests, activeMembers]);

  const overrideMarkedDates = useMemo(() => {
    const set = new Set();
    overrides.forEach((o) => {
      if (currentUser && o.userId === currentUser.id && ["swap", "service"].includes(o.type)) {
        set.add(o.date);
      }
    });
    return set;
  }, [overrides, currentUser]);

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
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "artifacts", appId, "public", "data", "shift_overrides"), (snap) => {
      setOverrides(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "artifacts", appId, "public", "data", "member_settings"), (snap) => {
      const settingsMap = {}; snap.docs.forEach((d) => { settingsMap[d.id] = d.data(); }); setUserSettings(settingsMap);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedGroupId) return;
    const unsub = onSnapshot(query(collection(db, "artifacts", appId, "public", "data", "shift_chat_messages"), where("groupId", "==", selectedGroupId)), (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setMessages(msgs); setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [user, selectedGroupId]);

  useEffect(() => {
    if (showChat) { setUnreadCount(0); lastReadCount.current = messages.length; }
    else { const newMsgs = messages.length - lastReadCount.current; if (newMsgs > 0) setUnreadCount(newMsgs); }
  }, [messages, showChat]);

  useEffect(() => {
    if (showSettingsModal && currentUser) {
      const currentLimits = getUserLimits(currentUser.id);
      setTempSettings(currentLimits);
      setNewPin("");
    }
  }, [showSettingsModal, currentUser]);

  const getEffectiveShift = (dateStr, userId, groupId) => {
    const override = overrides.find((o) => o.userId === userId && o.date === dateStr);
    if (override) return override.shift;
    const groupConfig = GROUPS.find((g) => g.id === groupId);
    if (!groupConfig) return "L";
    return calculateShiftCycle(dateStr, groupConfig.refDate, groupConfig.cycle);
  };

  const selectionStats = useMemo(() => {
    if (!selectionStart) return null;
    const start = new Date(selectionStart + "T00:00:00");
    const end = selectionEnd ? new Date(selectionEnd + "T00:00:00") : start;
    const [from, to] = start <= end ? [start, end] : [end, start];
    const startStr = toDateStr(from);
    const endStr = toDateStr(to);
    const range = getDatesInRange(startStr, endStr);
    const workDays = range.reduce((acc, day) => {
      const shift = currentUser ? getEffectiveShift(day, currentUser.id, currentUser.group) : "L";
      const style = getShiftStyle(shift);
      return style.workDay ? acc + 1 : acc;
    }, 0);
    return { startStr, endStr, range, workDays };
  }, [selectionStart, selectionEnd, currentUser, overrides]);

  const openPopup = (url, title) => {
    const width = 600, height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(url, title, `toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${width}, height=${height}, top=${top}, left=${left}`);
  };

  const handleLoginAttempt = (member) => { setLoginMember(member); setPinInput(""); setLoginError(""); };
  const handleLogout = () => { setCurrentUser(null); setIsAdmin(false); setLoginMember(null); setSelectionStart(null); setSelectionEnd(null); setShowChat(false); setView("categories"); setSelectedCategory(null); setSelectedUnit(null); setSelectedGroupId(null); };

  const submitPin = (e) => {
    e.preventDefault();
    const storedSettings = userSettings[loginMember.id] || {};
    const realPin = storedSettings.pin || (loginMember.id === "admin" ? DEFAULT_ADMIN_PIN : DEFAULT_USER_PIN);
    if (pinInput === realPin) { setCurrentUser(loginMember); setIsAdmin(loginMember.id === "admin"); setLoginMember(null); setView("dashboard"); }
    else { setLoginError("PIN Incorrecto"); }
  };

  const getUserLimits = (userId) => {
    const settings = userSettings[userId] || {};
    return {
      ap25: settings.ap25 !== undefined ? settings.ap25 : AP_LIMIT_2025_DEFAULT,
      vac25: settings.vac25 !== undefined ? settings.vac25 : VACATION_LIMIT_2025_DEFAULT,
      ap26: settings.ap26 !== undefined ? settings.ap26 : AP_LIMIT_2026,
      vac26: settings.vac26 !== undefined ? settings.vac26 : VACATION_LIMIT_2026,
    };
  };

  const saveSettings = async () => {
    try {
      const updateData = { ...tempSettings }; if (newPin && newPin.length === 4) updateData.pin = newPin;
      await setDoc(doc(db, "artifacts", appId, "public", "data", "member_settings", currentUser.id), updateData, { merge: true });
      if (newPin) alert("¡PIN actualizado!"); setShowSettingsModal(false);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (e) => {
    e.preventDefault(); if (!newMessage.trim()) return;
    await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_chat_messages"), { text: newMessage, userId: currentUser.id, userName: currentUser.name, groupId: selectedGroupId, createdAt: serverTimestamp() });
    setNewMessage("");
  };

  const calculateService = (date) => {
    const shifts = { moto: { M: [], T: [], N: [] }, eis: { M: [], T: [], N: [] } };
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

  // ✅ FUNCIONALIDAD PRINCIPAL: Verificación de cupos y prioridades
  const checkPreferenceAndDisplace = async (type) => {
    // 1. BAJAS no tienen límite
    if (type === "baja") return { allowed: true };

    const displacements = new Set();
    const myLastVacation = getLastVacationEnd(requests, currentUser.id);
    const myLastAP = getLastAPEnd(requests, currentUser.id);

    // Iteramos día por día para validar cupos independientes
    for (const day of selectionStats.range) {
      // Filtrar solicitudes del mismo grupo en ese día
      const groupRequests = requests.filter((r) => {
        const member = MEMBERS.find((m) => m.id === r.userId);
        return member && member.group === currentUser.group && r.days.includes(day);
      });

      // --- LOGICA VACACIONES / NAVIDAD / SS (Cupos fijos, Independientes) ---
      if (["vacation", "nav", "ss"].includes(type)) {
        // Filtrar solo las de ESTE tipo específico (Independencia de cupos)
        const specificRequests = groupRequests.filter(r => r.type === type);
        
        // Límite fijado en constantes
        const limit = type === "vacation" ? MAX_VACATION_PER_GROUP : MAX_SPECIAL_PER_GROUP;

        if (specificRequests.length >= limit) {
          // Ordenar por prioridad (quien tiene la fecha más reciente de vacaciones = menos prioridad)
          const ranked = specificRequests
            .map((r) => ({ req: r, last: getLastVacationEnd(requests, r.userId) }))
            .sort((a, b) => b.last.localeCompare(a.last));

          const leastPreferred = ranked[0];

          // Si mi última fecha es ANTERIOR a la suya, tengo preferencia
          if (myLastVacation < leastPreferred.last) {
            displacements.add(leastPreferred.req.id);
          } else {
            return { allowed: false, msg: `Cupo de ${type.toUpperCase()} completo el día ${day} y no tienes preferencia.` };
          }
        }
      }

      // --- LOGICA ASUNTOS PROPIOS (AP) (Depende de personal disponible) ---
      if (type === "ap") {
        // Calcular cuántos miembros activos tiene el grupo
        const totalMembers = activeMembers.filter(m => m.active).length;
        // Calcular cuántos faltan ese día por CUALQUIER motivo
        const absentCount = groupRequests.length;
        // Personal disponible si se aprueba mi solicitud (+1 ausencia)
        const remainingStaff = totalMembers - (absentCount + 1);

        if (remainingStaff < MIN_WORKING_STAFF_FOR_AP) {
          // Cupo lleno por falta de personal.
          // Solo podemos desplazar a OTROS APs (Cupos no se cruzan: no puedo quitar vacaciones)
          const apRequests = groupRequests.filter(r => r.type === "ap");

          if (apRequests.length > 0) {
            // Buscar el AP con menos prioridad (fecha más reciente de disfrute)
            const rankedAPs = apRequests
              .map(r => ({ req: r, last: getLastAPEnd(requests, r.userId) }))
              .sort((a, b) => b.last.localeCompare(a.last));
            
            const leastPreferredAP = rankedAPs[0];

            if (myLastAP < leastPreferredAP.last) {
                displacements.add(leastPreferredAP.req.id);
            } else {
                return { allowed: false, msg: `No hay cupo de AP el día ${day} (faltaría personal) y no tienes preferencia sobre los APs existentes.` };
            }
          } else {
            // Si no hay APs para desplazar (las ausencias son vacaciones/bajas), no puedo hacer nada.
            return { allowed: false, msg: `No hay cupo de AP el día ${day}. Faltan efectivos por otros motivos (Vacaciones/Bajas) y no se pueden desplazar.` };
          }
        }
      }
    }

    return { allowed: true, displacements: [...displacements] };
  };

  const processRequest = async (type, yearToCharge) => {
    if (!currentUser || !selectionStats) return;

    if (type === "nav" || type === "ss") {
      const validation = validateSpecialRange(selectionStats.range, type);
      if (!validation.ok) { setModalError(validation.reason); return; }
    }

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

    const checkResult = await checkPreferenceAndDisplace(type);
    
    if (!checkResult.allowed) { 
      setModalError(checkResult.msg); 
      return; 
    }

    if (checkResult.displacements?.length) {
      const confirmDisplace = confirm("⚠️ AVISO DE PRIORIDAD\n\nEl cupo está lleno, pero tienes preferencia sobre una solicitud existente.\n\n¿Quieres DESPLAZAR al compañero con menor prioridad?");
      if (!confirmDisplace) { 
        setModalError("Solicitud cancelada."); 
        return; 
      }
      
      try {
        for (const reqId of checkResult.displacements) {
          await deleteDoc(doc(db, "artifacts", appId, "public", "data", "shift_vacations_v6", reqId));
        }
        await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_chat_messages"), { 
            text: `⚠️ SISTEMA: ${currentUser.name} ha ejercido su derecho de prioridad, desplazando una solicitud de ${type.toUpperCase()}.`, 
            userId: "system", 
            userName: "⚖️ PRIORIDAD", 
            groupId: currentUser.group, 
            createdAt: serverTimestamp() 
        });
      } catch(e) {
        console.error(e);
        setModalError("Error al procesar el desplazamiento.");
        return;
      }
    }

    try {
      await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_vacations_v6"), {
        userId: currentUser.id, userName: currentUser.name, type: type, year: yearToCharge,
        startDate: selectionStats.startStr, endDate: selectionStats.endStr, days: selectionStats.range,
        cost: selectionStats.workDays, createdAt: serverTimestamp(),
      });
      alert("✅ Solicitud guardada correctamente"); closeAllModals();
    } catch (e) { alert("❌ Error al guardar: " + e.message); setModalError("Error guardando."); }
  };

  // ✅ CORREGIDO: Delete Request con Try/Catch para evitar congelamiento
  const deleteRequest = async () => {
    if (!selectedRequestToDelete || !selectedRequestToDelete.id) return;
    
    if (confirm("¿Estás seguro de borrar esta solicitud?")) {
      try {
        await deleteDoc(doc(db, "artifacts", appId, "public", "data", "shift_vacations_v6", selectedRequestToDelete.id));
        alert("Solicitud eliminada.");
      } catch (error) {
        console.error("Error eliminando:", error);
        alert("Hubo un error al eliminar la solicitud. Inténtalo de nuevo.");
      } finally {
        closeAllModals();
      }
    }
  };

  const deleteOverride = async () => {
    if (!selectedOverrideToDelete) return;
    if (confirm("¿Restaurar turno original?")) {
      try {
        await deleteDoc(doc(db, "artifacts", appId, "public", "data", "shift_overrides", selectedOverrideToDelete.id));
        await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_chat_messages"), { text: `⚠️ AVISO: ${currentUser.name} ha anulado su cambio de servicio del día ${selectedOverrideToDelete.date}.`, userId: "system", userName: "↩️ CAMBIO ANULADO", groupId: currentUser.group, createdAt: serverTimestamp() });
      } catch (e) {
        console.error(e);
      } finally {
        closeAllModals();
      }
    }
  };

  // ✅ REGLA 2: Solicitud de cambio de turno en Chat
  const requestSwap = async (targetShift) => {
    const dateStr = selectionStart;
    if (!dateStr) return;
    
    const myGroupConfig = GROUPS.find((g) => g.id === currentUser.group);
    const targetGroups = [];
    
    GROUPS.forEach((g) => {
      if (g.unit === myGroupConfig.unit) {
        const s = calculateShiftCycle(dateStr, g.refDate, g.cycle);
        if (s === targetShift) targetGroups.push(g.id);
      }
    });

    if (targetGroups.length === 0) { 
        alert("Ningún grupo de tu unidad tiene ese turno hoy por cuadrante."); 
        return; 
    }

    const myCurrentShift = getEffectiveShift(dateStr, currentUser.id, currentUser.group);
    
    const swapData = { 
        type: "swap_request", 
        requesterId: currentUser.id, 
        requesterName: currentUser.name, 
        date: dateStr, 
        fromShift: myCurrentShift, 
        toShift: targetShift, 
        status: "pending", 
        requesterGroupId: currentUser.group 
    };

    for (const gid of targetGroups) {
      await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_chat_messages"), { 
          text: `🔄 SOLICITUD DE CAMBIO: ${currentUser.name} tiene ${myCurrentShift} el día ${dateStr} y busca ${targetShift}.`, 
          userId: "system", 
          userName: "📢 CAMBIO SERVICIO", 
          groupId: gid, 
          isSwap: true, 
          swapData: swapData, 
          createdAt: serverTimestamp() 
      });
    }

    alert("Solicitud enviada al chat de los compañeros que trabajan ese día."); 
    closeAllModals();
  };

  // ✅ CORREGIDO: Aceptar cambio con Try/Catch y mejor feedback
  const acceptSwap = async (msg) => {
    if (msg.swapData.status !== "pending") return;
    if (msg.swapData.requesterId === currentUser.id) { alert("No puedes aceptar tu propio cambio."); return; }
    
    if (!confirm(`¿Aceptas cambiar tu turno con ${msg.swapData.requesterName} el día ${msg.swapData.date}?`)) return;

    try {
      // 1. Crear overrides para AMBOS
      await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_overrides"), { 
          userId: msg.swapData.requesterId, 
          date: msg.swapData.date, 
          shift: msg.swapData.toShift,
          type: "swap", 
          createdAt: serverTimestamp() 
      });

      await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_overrides"), { 
          userId: currentUser.id, 
          date: msg.swapData.date, 
          shift: msg.swapData.fromShift,
          type: "swap", 
          createdAt: serverTimestamp() 
      });

      // 2. Actualizar estado del mensaje
      await updateDoc(doc(db, "artifacts", appId, "public", "data", "shift_chat_messages", msg.id), { 
          "swapData.status": "accepted", 
          "swapData.acceptedBy": currentUser.name 
      });

      // 3. Notificación de confirmación
      if (msg.swapData.requesterGroupId && msg.swapData.requesterGroupId !== currentUser.group) {
        await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_chat_messages"), { 
            text: `✅ CAMBIO CONFIRMADO: ${currentUser.name} ha aceptado el cambio de turno de ${msg.swapData.requesterName} para el día ${msg.swapData.date}.`, 
            userId: "system", 
            userName: "✅ CAMBIO REALIZADO", 
            groupId: msg.swapData.requesterGroupId, 
            createdAt: serverTimestamp() 
        });
      }
      
      alert("¡Cambio realizado correctamente! El cuadrante se ha actualizado.");
    } catch (error) {
      console.error("Error al aceptar cambio:", error);
      alert("Error al procesar el cambio. Inténtalo de nuevo.");
    }
  };

  const applyServiceChange = async (newShift) => {
    const dateStr = selectionStart; if (!dateStr) return;
    try {
        await addDoc(collection(db, "artifacts", appId, "public", "data", "shift_overrides"), { userId: currentUser.id, date: dateStr, shift: newShift, type: "service", createdAt: serverTimestamp() });
    } catch(e) { console.error(e); }
    finally { closeAllModals(); }
  };

  const closeAllModals = () => {
    setSelectionStart(null); setSelectionEnd(null); setShowModal(false); setShowYearSelector(false); setShowShiftChange(false); setModalError(""); setSelectedRequestToDelete(null); setSelectedOverrideToDelete(null);
  };

  const getUsed = (uid, type, year) => requests.filter((r) => r.userId === uid && r.type === type && r.year === year).reduce((acc, r) => acc + r.cost, 0);

  // --- RENDER ---
  const renderDay = useCallback((year, month, d) => {
    const date = new Date(year, month, d);
    const dateStr = toDateStr(date);
    const isToday = dateStr === toDateStr(new Date());
    const shift = getEffectiveShift(dateStr, currentUser?.id, currentUser?.group);
    
    // Usamos la nueva función helper para soportar servicios especiales
    const style = getShiftStyle(shift);
    
    const occ = occupationMap[dateStr];
    let isSelected = selectionStats && selectionStats.range.includes(dateStr);
    const isInteractive = dateStr >= PERIOD_START && dateStr <= PERIOD_END;
    
    // ✅ REGLA 2: Solo yo veo mis cambios
    const isOverrideDay = overrideMarkedDates.has(dateStr);

    let bgClass = isSelected ? "bg-green-100 ring-2 ring-green-600 z-10" : "hover:bg-green-50/30";
    if (isToday && !isSelected) bgClass = "bg-yellow-200/60 ring-2 ring-yellow-400";

    return (
      <div
        key={dateStr}
        onClick={() => isInteractive && handleDayClick(dateStr)}
        className={`relative h-auto min-h-[5.5rem] border-green-100 border-r border-b p-1 cursor-pointer select-none flex flex-col ${bgClass} ${
          !isInteractive ? "opacity-40 pointer-events-none bg-gray-50" : "bg-white/80"
        } ${isOverrideDay ? "ring-2 ring-red-500 border-red-300" : ""}`} // Borde rojo si es override
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-xs font-bold ${[0, 6].includes(date.getDay()) ? "text-red-400" : "text-green-800"}`}>{d}</span>
          <span className={`text-[9px] font-bold px-1 rounded border ${style.bg} ${style.text}`} title={style.fullLabel || style.label}>
            {style.label}
          </span>
        </div>
        
        <div className="flex flex-col gap-0.5 mt-1 w-full overflow-hidden">
          {occ && occ.reqs.map((req, i) => (
            <div key={i} className={`text-[9px] px-1 py-0.5 rounded truncate font-medium text-white shadow-sm ${TYPE_STYLES[req.type || "vacation"]?.color} ${req.userId === currentUser?.id ? "ring-1 ring-yellow-400 z-10 font-bold" : "opacity-90"}`}>{req.userName}</div>
          ))}
        </div>
      </div>
    );
  }, [currentUser, occupationMap, selectionStats, overrides, overrideMarkedDates]);

  // Calendar Grid Logic
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

  // Click Handler
  const handleDayClick = (dateStr) => {
    if (dateStr < PERIOD_START || dateStr > PERIOD_END) return;
    const myOverride = overrides.find((o) => o.userId === currentUser.id && o.date === dateStr);
    if (myOverride) { setSelectedOverrideToDelete(myOverride); setShowModal(true); setSelectionStart(dateStr); setSelectionEnd(null); return; }
    const myReq = requests.find((r) => r.userId === currentUser.id && r.days.includes(dateStr));
    if (myReq) { setSelectedRequestToDelete(myReq); setShowModal(true); setSelectionStart(null); return; }
    if (!selectionStart || (selectionStart && selectionEnd)) { setSelectionStart(dateStr); setSelectionEnd(null); setShowModal(false); }
    else { setSelectionEnd(dateStr); setShowModal(true); }
  };

  const initiateRequest = (type) => {
    if (!selectionStats) return; setModalError("");
    const isOverlap = selectionStats.range.every((d) => d >= START_2026_START && d <= LIMIT_2025_END);
    if ((type === "vacation" || type === "ap") && isOverlap) { setPendingRequestType(type); setShowYearSelector(true); }
    else {
      let yearToCharge = "2026";
      if (selectionStats.endStr <= LIMIT_2025_END && selectionStats.startStr < START_2026_START) yearToCharge = "2025";
      processRequest(type, yearToCharge);
    }
  };

  const currentDayShift = selectionStart ? getEffectiveShift(selectionStart, currentUser?.id, currentUser?.group) : null;
  const isWorkingDay = currentDayShift && getShiftStyle(currentDayShift).workDay;

  // --- VIEWS ---
  if (view === "library") return <LibraryView onBack={() => setView("categories")} />; // ✅ VIEW BIBLIOTECA
  if (view === "calculator") return <CalculatorView onBack={() => setView("categories")} />;

  if (view === "categories") return (
    <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="max-w-md w-full text-center">
        <img src={LOGO_URL} className="w-24 h-24 mx-auto mb-6 object-contain bg-white rounded-full p-2 shadow-xl border-4 border-green-100" />
        <h1 className="text-3xl font-black text-green-900 mb-2">TRÁFICO APP</h1>
        <div className="grid grid-cols-2 gap-4"> {/* ✅ Ajustado a grid de 2 columnas para que quepa todo */}
          <button onClick={() => { setSelectedCategory("motoristas"); setView("units"); }} className="col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg flex items-center gap-4"><Bike className="w-8 h-8 text-emerald-600" /><span className="font-bold text-xl text-green-900">Motoristas</span></button>
          <button onClick={() => { setSelectedCategory("atestados"); setView("units"); }} className="col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg flex items-center gap-4"><FileText className="w-8 h-8 text-blue-600" /><span className="font-bold text-xl text-blue-900">Atestados</span></button>
          
          <button onClick={() => setView("calculator")} className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg flex flex-col items-center gap-2"><Calculator className="w-8 h-8 text-purple-600" /><span className="font-bold text-sm text-purple-900">Calculadora</span></button>
          <button onClick={() => setView("library")} className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg flex flex-col items-center gap-2"><BookOpen className="w-8 h-8 text-orange-600" /><span className="font-bold text-sm text-orange-900">Biblioteca</span></button>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-[10px] font-bold text-green-800/60 uppercase tracking-widest border-t border-green-800/20 pt-2 px-4">
                Autor Gc Escribano Dto Benidorm
            </span>
        </div>
      </div>
    </div>
  );

  if (view === "units") return (
    <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-between mb-6 px-2"><button onClick={() => setView("categories")} className="p-2 bg-white rounded-full shadow-sm"><ChevronLeft /></button><h2 className="text-xl font-black text-green-900 uppercase">{selectedCategory}</h2><div className="w-10"></div></div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">{unitsInCategory.map((unitName) => (<button key={unitName} onClick={() => { setSelectedUnit(unitName); setView("groups"); }} className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-lg flex justify-between items-center"><span className="font-bold text-lg text-green-900">{unitName}</span><ChevronRight /></button>))}</div>
      </div>
    </div>
  );

  if (view === "groups") return (
    <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-between mb-6 px-2"><button onClick={() => { setSelectedUnit(null); setView("units"); }} className="p-2 bg-white rounded-full shadow-sm"><ChevronLeft /></button><h2 className="text-lg font-black text-green-900 truncate max-w-[220px]">{selectedUnit}</h2><div className="w-10"></div></div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">{groupsInSelectedUnit.map((g) => (<button key={g.id} onClick={() => { setSelectedGroupId(g.id); setView("login"); }} className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-lg flex justify-between items-center"><span className="font-bold text-xl text-green-800">{g.name}</span><ChevronRight /></button>))}</div>
      </div>
    </div>
  );

  if (view === "login" && !currentUser) return (
    <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans">
      {!loginMember ? (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200">
          <div className="bg-green-900 p-6 text-center relative"><button onClick={() => setView("groups")} className="absolute left-4 top-4 text-green-200 hover:text-white text-xs font-bold flex items-center gap-1">← Volver</button><h2 className="text-xl font-bold text-white mt-4">{selectedUnit} - {GROUPS.find((g) => g.id === selectedGroupId)?.name}</h2></div>
          <div className="p-6 grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">{activeMembers.map((m) => (<button key={m.id} disabled={!m.active} onClick={() => handleLoginAttempt(m)} className={`p-3 rounded-xl border text-left ${!m.active ? "bg-gray-50 opacity-50" : "bg-white border-green-100 hover:border-emerald-500"}`}><div className="flex flex-col"><span className="font-bold text-green-900 text-sm">{m.name}</span></div></button>))}</div>
          <div className="bg-green-50 p-3 text-center border-t border-green-100"><button onClick={() => handleLoginAttempt({ id: "admin", name: "Supervisión" })} className="text-xs text-green-600 font-bold flex items-center justify-center gap-1 mx-auto"><Shield className="w-3 h-3" /> Supervisión</button></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 text-center border border-green-100">
          <h2 className="text-xl font-bold text-green-900 mb-4">Hola, {loginMember.name}</h2>
          <form onSubmit={submitPin}><input type="password" inputMode="numeric" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full text-center text-3xl font-bold py-3 border-2 rounded-xl mb-4" placeholder="****" autoFocus /><button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg">Entrar</button></form>
          <button onClick={() => setLoginMember(null)} className="mt-4 text-green-400 text-sm">Cancelar</button>
        </div>
      )}
    </div>
  );

  // DASHBOARD
  const limits = currentUser ? getUserLimits(currentUser.id) : {};
  const myV25 = getUsed(currentUser?.id, "vacation", "2025"); const myV26 = getUsed(currentUser?.id, "vacation", "2026");
  const myAP25 = getUsed(currentUser?.id, "ap", "2025"); const myAP26 = getUsed(currentUser?.id, "ap", "2026");

  const navValidation = selectionStats ? validateSpecialRange(selectionStats.range, "nav") : { ok: false };
  const ssValidation = selectionStats ? validateSpecialRange(selectionStats.range, "ss") : { ok: false };

  return (
    <div className="min-h-screen bg-green-50/30 font-sans text-slate-900 pb-20 relative">
      {selectionStart && !selectionEnd && (<div className="fixed bottom-0 left-0 right-0 bg-emerald-600 text-white p-4 z-[150] flex justify-between"><div><div className="font-bold text-sm">📆 Inicio: {selectionStart}</div></div><button onClick={() => setSelectionStart(null)} className="bg-emerald-700 px-3 py-1 rounded text-xs font-bold">Cancelar</button></div>)}
      
      {/* MODAL CONFIG */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-green-100">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5" /> Configuración</h3>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-xl border border-green-100"><h4 className="text-xs font-bold text-green-800 uppercase mb-2">Saldos 2025</h4><div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-500 font-bold block mb-1">Vacaciones</label><input type="number" value={tempSettings.vac25} onChange={(e) => setTempSettings({...tempSettings, vac25: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded font-bold text-center" /></div><div><label className="text-[10px] text-slate-500 font-bold block mb-1">Asuntos Propios</label><input type="number" value={tempSettings.ap25} onChange={(e) => setTempSettings({...tempSettings, ap25: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded font-bold text-center" /></div></div></div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100"><h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">Saldos 2026</h4><div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-500 font-bold block mb-1">Vacaciones</label><input type="number" value={tempSettings.vac26} onChange={(e) => setTempSettings({...tempSettings, vac26: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded font-bold text-center" /></div><div><label className="text-[10px] text-slate-500 font-bold block mb-1">Asuntos Propios</label><input type="number" value={tempSettings.ap26} onChange={(e) => setTempSettings({...tempSettings, ap26: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded font-bold text-center" /></div></div></div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200"><h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1"><Key className="w-3 h-3"/> Cambiar PIN</h4><input type="password" inputMode="numeric" maxLength={4} placeholder="Nuevo PIN (4 dígitos)" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="w-full p-2 border rounded font-bold text-center tracking-widest" /></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setShowSettingsModal(false)} className="flex-1 py-3 text-slate-500 font-bold text-sm">Cancelar</button><button onClick={saveSettings} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200">Guardar</button></div>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-green-100 h-[80vh] flex flex-col">
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
              <div className="text-center"><Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="font-bold text-slate-800">¿Borrar solicitud?</h3><div className="flex gap-3 mt-4"><button onClick={closeAllModals} className="flex-1 py-2 bg-slate-100 rounded">No</button><button onClick={deleteRequest} className="flex-1 py-2 bg-red-500 text-white rounded">Sí, Borrar</button></div></div>
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
                    <div className="space-y-1"><button onClick={() => initiateRequest("ss")} disabled={!ssValidation.ok} className={`w-full p-3 border rounded-lg font-bold text-sm ${ssValidation.ok ? "bg-orange-50 border-orange-200 text-orange-900" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}>Semana Santa</button><p className="text-[10px] text-slate-500 font-medium text-center">{ssValidation.reason}</p></div>
                    <div className="space-y-1"><button onClick={() => initiateRequest("nav")} disabled={!navValidation.ok} className={`w-full p-3 border rounded-lg font-bold text-sm ${navValidation.ok ? "bg-red-50 border-red-200 text-red-900" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}>Navidad</button><p className="text-[10px] text-slate-500 font-medium text-center">{navValidation.reason}</p></div>
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
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200"><h4 className="font-bold text-slate-800 text-sm mb-2">1. Necesidades del Servicio</h4><div className="flex gap-2">{["M", "T", "N"].map((shift) => (<button key={shift} onClick={() => applyServiceChange(shift)} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${SHIFT_STYLES[shift].bg} ${SHIFT_STYLES[shift].text} hover:opacity-80`}>{shift}</button>))}</div></div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200"><h4 className="font-bold text-blue-800 text-sm mb-2">2. Cambiar con Compañero</h4><div className="flex gap-2 mb-2">{["M", "T", "N"].map((shift) => (<button key={shift} onClick={() => setSwapTargetShift(shift)} className={`flex-1 py-2 rounded-lg font-bold text-sm border transition-all ${swapTargetShift === shift ? "bg-blue-600 text-white ring-2 ring-blue-300" : "bg-white text-slate-600 hover:bg-slate-100"}`}>{shift}</button>))}</div><button onClick={() => requestSwap(swapTargetShift)} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 flex items-center justify-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Solicitar Cambio</button></div>
                  <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200"><h4 className="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><Star className="w-3 h-3"/> 3. Servicios Especiales</h4><div className="grid grid-cols-2 gap-2">{SPECIAL_SERVICES_LIST.map((svc) => (<button key={svc} onClick={() => applyServiceChange(svc)} className="py-2 px-1 bg-white border border-indigo-100 rounded text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 truncate shadow-sm">{svc}</button>))}</div></div>
                </div>
                <button onClick={() => setShowShiftChange(false)} className="mt-4 w-full text-slate-400 text-sm hover:text-slate-600">Volver</button>
              </div>
            )}
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
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowChat(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="bg-green-900 text-white p-4 flex justify-between items-center"><h3 className="font-bold">Chat</h3><button onClick={() => setShowChat(false)}><X /></button></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-50">{messages.map((msg) => (<div key={msg.id} className="border p-3 rounded bg-white text-xs shadow-sm">{msg.isSwap ? (<div className="space-y-2"><div className="flex items-center justify-between"><div className="font-bold text-blue-900">Solicitud de cambio</div><span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">Día {msg.swapData.date}</span></div><div className="text-[11px] text-slate-700 space-y-1"><div><strong>Solicitante:</strong> {msg.swapData.requesterName}</div><div><strong>Turno:</strong> {msg.swapData.fromShift} → {msg.swapData.toShift}</div></div>{msg.swapData.status === "accepted" ? (<div className="text-[11px] text-emerald-700 font-bold">✅ Cambio realizado por {msg.swapData.acceptedBy}</div>) : (msg.swapData.status === "pending" && currentUser && msg.swapData.requesterId !== currentUser.id ? (<button onClick={() => acceptSwap(msg)} className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700">ACEPTAR</button>) : (<div className="text-[11px] text-slate-500">Pendiente de aceptación...</div>))}</div>) : (<div>{msg.text}</div>)}</div>))}</div>
            <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 border rounded-full px-4 py-2 text-sm" placeholder="Mensaje..." /><button type="submit" className="text-emerald-600"><Send /></button></form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
        <div className="lg:col-span-1 space-y-4"><div className="bg-white p-5 rounded-xl shadow-sm border border-green-100"><h3 className="font-bold text-green-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Estado {GROUPS.find((g) => g.id === selectedGroupId)?.name} (2026)</h3><div className="space-y-2">{activeMembers.filter((m) => m.active).map((m) => (<div key={m.id} className="text-xs flex justify-between border-b pb-1 border-green-50 last:border-0"><span className={m.id === currentUser.id ? "text-emerald-700 font-bold" : "text-slate-600"}>{m.name}</span><div className="flex gap-2 font-medium"><span className="text-emerald-600">V:{getUsed(m.id, "vacation", "2026")}/{getUserLimits(m.id).vac26}</span><span className="text-purple-600">AP:{getUsed(m.id, "ap", "2026")}/{getUserLimits(m.id).ap26}</span></div></div>))}</div></div></div>
        <div className="lg:col-span-2">{loading ? <div className="p-10 text-center text-emerald-600 font-medium animate-pulse">Cargando...</div> : <div className="columns-1 xl:columns-2 gap-4 space-y-4">{calendarGrid}</div>}</div>
      </main>
    </div>
  );
}
