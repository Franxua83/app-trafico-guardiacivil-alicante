import React, { useState, useEffect, useMemo, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  X,
  Lock,
  LogOut,
  Trash2,
  Users,
  Shield,
  Briefcase,
  UserCheck,
  Eye,
  Key,
  RefreshCw,
  ArrowRightLeft,
  Undo2,
  Bot,
  Car,
  ChevronRight,
  MessageCircle,
  Send,
  Settings,
  MapPin,
  ChevronLeft,
  Bike,
  FileText,
  CalendarCheck,
  Info
} from "lucide-react";

// --- TUS CLAVES REALES ---
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
const LOGO_URL =
  "https://i.postimg.cc/d1kK6BtW/Gemini_Generated_Image_7v8i3p7v8i3p7v8i.png";
const GPT_URL =
  "https://chatgpt.com/g/g-690e357144cc8191bad33044e9d2b5e3-gc-trafico";
const FORM_PERMISOS_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeXJqKZW8pQqfGuJxbpAfwhqxzaBc6GGgt-sK0sgbTqZ_gqTw/viewform?embedded=true";

// FECHAS
const PERIOD_START = "2025-11-01";
const PERIOD_END = "2027-01-31";
const LIMIT_2025_END = "2026-03-08";
const START_2026_START = "2026-02-01";

const SS_RANGE = { start: "2026-03-15", end: "2026-04-15" };
const NAV_RANGE_25 = { start: "2025-12-17", end: "2026-01-10" };
const NAV_RANGE_26 = { start: "2026-12-17", end: "2027-01-10" };

const MIN_WORKING_STAFF_UNIT = 2;
const MAX_VACATION_PER_GROUP = 2;
const VACATION_LIMIT_DEFAULT = 19;
const AP_LIMIT_DEFAULT = 6;

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
  // --- MOTORISTAS ---
  {
    id: "G3_MOTO",
    name: "Grupo 1",
    unit: "Destacamento Benidorm",
    category: "motoristas",
    refDate: REF_MOTO_G3,
    cycle: CYCLE_MOTO_8H,
  },
  {
    id: "G4_MOTO",
    name: "Grupo 2",
    unit: "Destacamento Benidorm",
    category: "motoristas",
    refDate: REF_MOTO_G4,
    cycle: CYCLE_MOTO_8H,
  },
  {
    id: "G1_MOTO",
    name: "Grupo 3",
    unit: "Destacamento Benidorm",
    category: "motoristas",
    refDate: REF_MOTO_G1,
    cycle: CYCLE_MOTO_8H,
  },
  {
    id: "G5_MOTO",
    name: "Grupo 4",
    unit: "Destacamento Benidorm",
    category: "motoristas",
    refDate: REF_MOTO_G5,
    cycle: CYCLE_MOTO_8H,
  },
  {
    id: "G2_MOTO",
    name: "Grupo 5",
    unit: "Destacamento Benidorm",
    category: "motoristas",
    refDate: REF_MOTO_G2,
    cycle: CYCLE_MOTO_8H,
  },

  // --- ATESTADOS (EIS) ---
  // Benidorm
  {
    id: "EIS_BEN_G1",
    name: "Grupo 1",
    unit: "EIS Benidorm",
    category: "atestados",
    refDate: "2025-12-04",
    cycle: CYCLE_EIS_NEW,
  },
  {
    id: "EIS_BEN_G2",
    name: "Grupo 2",
    unit: "EIS Benidorm",
    category: "atestados",
    refDate: "2025-12-06",
    cycle: CYCLE_EIS_NEW,
  },
  // Alicante
  {
    id: "EIS_ALC_G1",
    name: "Grupo 1",
    unit: "EIS Alicante",
    category: "atestados",
    refDate: "2025-12-05",
    cycle: CYCLE_EIS_NEW,
  },
  {
    id: "EIS_ALC_G2",
    name: "Grupo 2",
    unit: "EIS Alicante",
    category: "atestados",
    refDate: "2025-12-08",
    cycle: CYCLE_EIS_NEW,
  },
  {
    id: "EIS_ALC_G3",
    name: "Grupo 3",
    unit: "EIS Alicante",
    category: "atestados",
    refDate: "2025-12-10",
    cycle: CYCLE_EIS_NEW,
  },
  // Orihuela
  {
    id: "EIS_ORI_G1",
    name: "Grupo 1",
    unit: "EIS Orihuela",
    category: "atestados",
    refDate: "2025-12-09",
    cycle: CYCLE_EIS_NEW,
  },
  {
    id: "EIS_ORI_G2",
    name: "Grupo 2",
    unit: "EIS Orihuela",
    category: "atestados",
    refDate: "2025-12-05",
    cycle: CYCLE_EIS_NEW,
  },
  // Torrevieja
  {
    id: "EIS_TOR_G1",
    name: "Grupo 1",
    unit: "EIS Torrevieja",
    category: "atestados",
    refDate: "2025-12-07",
    cycle: CYCLE_EIS_NEW,
  },
  {
    id: "EIS_TOR_G2",
    name: "Grupo 2",
    unit: "EIS Torrevieja",
    category: "atestados",
    refDate: "2025-12-11",
    cycle: CYCLE_EIS_NEW,
  },
];

// --- MIEMBROS ---
const MEMBERS = [
  // MOTORISTAS
  { id: "tello", name: "Tello", group: "G1_MOTO", active: true },
  { id: "beltran", name: "Beltrán", group: "G1_MOTO", active: true },
  { id: "dieguez", name: "Diéguez", group: "G1_MOTO", active: true },
  { id: "nando", name: "Nando", group: "G1_MOTO", active: true },
  { id: "escribano", name: "Escribano", group: "G1_MOTO", active: true },
  { id: "pena", name: "Peña", group: "G1_MOTO", active: true },
  {
    id: "munoz",
    name: "Muñoz",
    group: "G1_MOTO",
    active: false,
    status: "BAJA",
  },
  {
    id: "josema",
    name: "Josema",
    group: "G2_MOTO",
    active: false,
    status: "BAJA",
  },
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
  {
    id: "navarro",
    name: "Navarro",
    group: "G4_MOTO",
    active: false,
    status: "BAJA",
  },
  {
    id: "ruben",
    name: "Ruben",
    group: "G4_MOTO",
    active: false,
    status: "BAJA",
  },
  {
    id: "angel",
    name: "Angel",
    group: "G4_MOTO",
    active: false,
    status: "BAJA",
  },
  { id: "delatorre", name: "De la Torre", group: "G4_MOTO", active: true },
  { id: "gil", name: "Gil", group: "G4_MOTO", active: true },
  { id: "marcos_moto", name: "Marcos", group: "G4_MOTO", active: true },
  { id: "miriam", name: "Miriam", group: "G4_MOTO", active: true },
  { id: "sarabia", name: "Sarabia", group: "G5_MOTO", active: true },
  { id: "pedroperez", name: "Pedro Perez", group: "G5_MOTO", active: true },
  { id: "jorge", name: "Jorge", group: "G5_MOTO", active: true },
  { id: "carpi", name: "Carpi", group: "G5_MOTO", active: true },
  { id: "guillamon", name: "Guillamon", group: "G5_MOTO", active: true },
  { id: "fajardo", name: "Fajardo", group: "G5_MOTO", active: true },

  // EIS BENIDORM
  {
    id: "barrientos",
    name: "C1 Barrientos",
    group: "EIS_BEN_G1",
    active: true,
  },
  { id: "alvaro", name: "GC Álvaro", group: "EIS_BEN_G1", active: true },
  { id: "valverde_b", name: "GC Valverde", group: "EIS_BEN_G1", active: true },
  { id: "ayuso", name: "GC Ayuso", group: "EIS_BEN_G1", active: true },
  {
    id: "rabadan",
    name: "C1 Rabadán",
    group: "EIS_BEN_G2",
    active: true,
  },
  {
    id: "delacruz",
    name: "GC De la Cruz",
    group: "EIS_BEN_G2",
    active: true,
  },
  { id: "morales", name: "GC Morales", group: "EIS_BEN_G2", active: true },

  // EIS ALICANTE
  { id: "yanez", name: "C1 Yañez", group: "EIS_ALC_G1", active: true },
  {
    id: "hernandez",
    name: "GC Hernandez",
    group: "EIS_ALC_G1",
    active: true,
  },
  { id: "senderos", name: "GC Senderos", group: "EIS_ALC_G1", active: true },
  { id: "monedero", name: "C1 Monedero", group: "EIS_ALC_G2", active: true },
  { id: "javier_a", name: "GC Javier", group: "EIS_ALC_G2", active: true },
  { id: "marcos_a", name: "GC Marcos", group: "EIS_ALC_G2", active: true },
  { id: "sevilla", name: "GC Sevilla", group: "EIS_ALC_G2", active: true },
  {
    id: "almendros",
    name: "CB Almendros",
    group: "EIS_ALC_G3",
    active: true,
  },
  { id: "marrodan", name: "GC Marrodan", group: "EIS_ALC_G3", active: true },
  { id: "uxio", name: "GC Uxio", group: "EIS_ALC_G3", active: true },

  // EIS ORIHUELA
  {
    id: "maldonado",
    name: "C1 Maldonado",
    group: "EIS_ORI_G1",
    active: true,
  },
  { id: "javier_o", name: "GC Javier", group: "EIS_ORI_G1", active: true },
  {
    id: "valverde_o",
    name: "GC Valverde",
    group: "EIS_ORI_G1",
    active: true,
  },
  { id: "marcos_o", name: "GC Marcos", group: "EIS_ORI_G1", active: true },
  { id: "lopez", name: "GC Lopez", group: "EIS_ORI_G2", active: true },
  { id: "parra", name: "GC Parra", group: "EIS_ORI_G2", active: true },
  { id: "rafael", name: "GC Rafael", group: "EIS_ORI_G2", active: true },
  { id: "francisco", name: "GC Francisco", group: "EIS_ORI_G2", active: true },

  // EIS TORREVIEJA
  { id: "rebollo", name: "GC Rebollo", group: "EIS_TOR_G1", active: true },
  {
    id: "rodriguez",
    name: "GC Rodriguez",
    group: "EIS_TOR_G1",
    active: true,
  },
  { id: "cabezas", name: "GC Cabezas", group: "EIS_TOR_G1", active: true },
  { id: "melani", name: "GC Melani", group: "EIS_TOR_G1", active: true },
  { id: "rivera", name: "GC Rivera", group: "EIS_TOR_G2", active: true },
  { id: "tortosa", name: "GC Tortosa", group: "EIS_TOR_G2", active: true },
  { id: "cerceda", name: "GC Cerceda", group: "EIS_TOR_G2", active: true },
  { id: "berzosa", name: "GC Berzosa", group: "EIS_TOR_G2", active: true },
];

const SHIFT_STYLES = {
  M: {
    label: "M",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    workDay: true,
  },
  T: {
    label: "T",
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
    workDay: true,
  },
  N: {
    label: "N",
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    workDay: true,
  },
  S: {
    label: "S",
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-700",
    workDay: false,
  },
  L: {
    label: "L",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
    workDay: false,
  },
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

export default function AppFinalV15() {
  const [user, setUser] = useState(null);
  // Vistas: 'categories' -> 'units' -> 'groups' -> 'login' -> 'dashboard'
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
  const [selectedOverrideToDelete, setSelectedOverrideToDelete] =
    useState(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    ap25: 0,
    vac25: 0,
    ap26: 6,
    vac26: 19,
  });
  const [newPin, setNewPin] = useState("");

  const [showYearSelector, setShowYearSelector] = useState(false);
  const [pendingRequestType, setPendingRequestType] = useState(null);

  // --- SERVICIO DIARIO ---
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceData, setServiceData] = useState({
    moto: { M: [], T: [], N: [] },
    eis: { M: [], T: [], N: [] },
  });
  const [serviceDate, setServiceDate] = useState("");

  const [showShiftChange, setShowShiftChange] = useState(false);
  const [swapTargetShift, setSwapTargetShift] = useState("M");

  // --- AUTO SCROLL REFERENCIAS ---
  const currentMonthRef = useRef(null);

  // --- DERIVED DATA ---
  const unitsInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const units = GROUPS.filter(
      (g) => g.category === selectedCategory
    ).map((g) => g.unit);
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

  // --- INITIAL EFFECTS ---
  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, setUser);
  }, []);

  // Scroll automático al mes actual cuando se carga el calendario
  useEffect(() => {
    if (!loading && view === "dashboard" && currentMonthRef.current) {
      currentMonthRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, view]);

  useEffect(() => {
    if (!user) return;
    const q = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "shift_vacations_v6"
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "shift_overrides"
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOverrides(data);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "member_settings"
    );
    const unsub = onSnapshot(q, (snap) => {
      const settingsMap = {};
      snap.docs.forEach((d) => {
        settingsMap[d.id] = d.data();
      });
      setUserSettings(settingsMap);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!selectedGroupId) return;
    const q = query(
      collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "shift_chat_messages"
      ),
      where("groupId", "==", selectedGroupId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      msgs.sort(
        (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      );
      setMessages(msgs);
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    });
    return () => unsub();
  }, [user, selectedGroupId]);

  useEffect(() => {
    if (showChat) {
      setUnreadCount(0);
      lastReadCount.current = messages.length;
    } else {
      const newMsgs = messages.length - lastReadCount.current;
      if (newMsgs > 0) {
        setUnreadCount(newMsgs);
      }
    }
  }, [messages, showChat]);

  // --- HELPERS APP ---
  const getEffectiveShift = (dateStr, userId, groupId) => {
    const override = overrides.find(
      (o) => o.userId === userId && o.date === dateStr
    );
    if (override) return override.shift;
    const groupConfig = GROUPS.find((g) => g.id === groupId);
    if (!groupConfig) return "L";
    return calculateShiftCycle(
      dateStr,
      groupConfig.refDate,
      groupConfig.cycle
    );
  };

  // --- POPUP HANDLER PARA PERMISOS ---
  const openPermisosPopup = () => {
    const width = 600;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      FORM_PERMISOS_URL,
      "Gestión Permisos",
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setView("units");
  };

  const handleUnitSelect = (unitName) => {
    setSelectedUnit(unitName);
    setView("groups");
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
    setView("login");
    setUnreadCount(0);
  };

  const handleLoginAttempt = (member) => {
    setLoginMember(member);
    setPinInput("");
    setLoginError("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setLoginMember(null);
    setSelectionStart(null);
    setSelectionEnd(null);
    setShowChat(false);
    setView("categories");
    setSelectedCategory(null);
    setSelectedUnit(null);
    setSelectedGroupId(null);
  };

  const submitPin = (e) => {
    e.preventDefault();
    const storedSettings = userSettings[loginMember.id] || {};
    const realPin =
      storedSettings.pin ||
      (loginMember.id === "admin" ? DEFAULT_ADMIN_PIN : DEFAULT_USER_PIN);
    if (pinInput === realPin) {
      setCurrentUser(loginMember);
      setIsAdmin(loginMember.id === "admin");
      setLoginMember(null);
      setView("dashboard");
    } else {
      setLoginError("PIN Incorrecto");
    }
  };

  const getUserLimits = (userId) => {
    const settings = userSettings[userId] || {};
    return {
      ap25: settings.ap25 !== undefined ? settings.ap25 : 0,
      vac25: settings.vac25 !== undefined ? settings.vac25 : 0,
      ap26: settings.ap26 !== undefined ? settings.ap26 : AP_LIMIT_DEFAULT,
      vac26:
        settings.vac26 !== undefined ? settings.vac26 : VACATION_LIMIT_DEFAULT,
    };
  };

  const saveSettings = async () => {
    try {
      const updateData = { ...tempSettings };
      if (newPin && newPin.length === 4) updateData.pin = newPin;
      await setDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "member_settings",
          currentUser.id
        ),
        updateData,
        { merge: true }
      );
      if (newPin) alert("¡PIN actualizado!");
      setShowSettingsModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await addDoc(
      collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "shift_chat_messages"
      ),
      {
        text: newMessage,
        userId: currentUser.id,
        userName: currentUser.name,
        groupId: selectedGroupId,
        createdAt: serverTimestamp(),
      }
    );
    setNewMessage("");
  };

  const calculateService = (date) => {
    const shifts = {
      moto: { M: [], T: [], N: [] },
      eis: { M: [], T: [], N: [] },
    };

    MEMBERS.forEach((member) => {
      if (member.active) {
        const memberGroup = GROUPS.find((g) => g.id === member.group);
        if (memberGroup) {
          const isAbsent = requests.some(
            (r) => r.userId === member.id && r.days.includes(date)
          );
          if (!isAbsent) {
            const shift = getEffectiveShift(date, member.id, member.group);
            if (["M", "T", "N"].includes(shift)) {
              const displayInfo = `${member.name} (${memberGroup.unit.replace(
                "Destacamento ",
                ""
              )})`;
              if (memberGroup.category === "motoristas") {
                shifts.moto[shift].push(displayInfo);
              } else {
                shifts.eis[shift].push(displayInfo);
              }
            }
          }
        }
      }
    });
    setServiceData(shifts);
    setServiceDate(date);
    setShowServiceModal(true);
  };

  const getLastEnjoyedDate = (userId, type) => {
    const userReqs = requests.filter(
      (r) => r.userId === userId && r.type === type
    );
    if (userReqs.length === 0) return new Date("2000-01-01").getTime();
    const maxDate = userReqs.reduce((max, r) => {
      const end = new Date(r.endDate).getTime();
      return end > max ? end : max;
    }, 0);
    return maxDate;
  };

  const checkPreferenceAndDisplace = async (
    type,
    limitPerGroup,
    checkMinStaffUnit
  ) => {
    let requestsToDisplace = [];
    const myLastEnjoyed = getLastEnjoyedDate(currentUser.id, type);

    for (const day of selectionStats.range) {
      const groupRequests = requests.filter((r) => {
        const member = MEMBERS.find((m) => m.id === r.userId);
        return (
          member &&
          member.group === currentUser.group &&
          r.days.includes(day) &&
          r.type === type
        );
      });

      let conflictFound = false;
      let potentialVictims = [];

      if (type === "vacation" || type === "nav" || type === "ss") {
        if (groupRequests.length >= MAX_VACATION_PER_GROUP) {
          conflictFound = true;
          potentialVictims = groupRequests;
        }
      }

      if (checkMinStaffUnit) {
        const myShift = getEffectiveShift(
          day,
          currentUser.id,
          currentUser.group
        );
        if (SHIFT_STYLES[myShift]?.workDay) {
          let workingCount = 0;
          const myGroupMembers = MEMBERS.filter(
            (m) => m.group === currentUser.group && m.active
          );
          myGroupMembers.forEach((m) => {
            const isAbsent = requests.some(
              (r) => r.userId === m.id && r.days.includes(day)
            );
            if (!isAbsent) {
              const s = getEffectiveShift(day, m.id, m.group);
              if (s === myShift) workingCount++;
            }
          });
          if (workingCount - 1 < MIN_WORKING_STAFF_UNIT) {
            conflictFound = true;
            potentialVictims = requests.filter((r) => {
              const m = MEMBERS.find((mem) => mem.id === r.userId);
              if (m.group !== currentUser.group) return false;
              const s = getEffectiveShift(day, r.userId, m.group);
              return r.days.includes(day) && r.type === "ap" && s === myShift;
            });
          }
        }
      }

      if (conflictFound) {
        potentialVictims.sort((a, b) => {
          const lastA = getLastEnjoyedDate(a.userId, type);
          const lastB = getLastEnjoyedDate(b.userId, type);
          return lastB - lastA;
        });

        if (potentialVictims.length === 0)
          return {
            allowed: false,
            msg: `Cupo completo el día ${day} y no hay a quién desplazar.`,
          };

        const victim = potentialVictims[0];
        const victimLastEnjoyed = getLastEnjoyedDate(victim.userId, type);

        if (myLastEnjoyed < victimLastEnjoyed) {
          if (!requestsToDisplace.find((r) => r.id === victim.id)) {
            requestsToDisplace.push(victim);
          }
        } else {
          return {
            allowed: false,
            msg: `Cupo completo sin preferencia. ${victim.userName} tiene prioridad sobre ti.`,
          };
        }
      }
    }

    if (requestsToDisplace.length > 0) {
      if (
        !confirm(
          `⚠️ CONFLICTO DE CUPO\n\nTienes preferencia sobre ${requestsToDisplace.length} solicitud(es).\n¿Quieres desplazarlos?`
        )
      ) {
        return { allowed: false, msg: "Operación cancelada." };
      }
      for (const req of requestsToDisplace) {
        await deleteDoc(
          doc(
            db,
            "artifacts",
            appId,
            "public",
            "data",
            "shift_vacations_v6",
            req.id
          )
        );
        const victimMember = MEMBERS.find((m) => m.id === req.userId);
        if (victimMember) {
          await addDoc(
            collection(
              db,
              "artifacts",
              appId,
              "public",
              "data",
              "shift_chat_messages"
            ),
            {
              text: `🚨 AVISO: ${currentUser.name} ha desplazado a ${
                req.userName
              } (${req.type.toUpperCase()}) por PREFERENCIA.`,
              userId: "system",
              userName: "⚠️ SISTEMA",
              groupId: victimMember.group,
              createdAt: serverTimestamp(),
            }
          );
        }
      }
    }
    return { allowed: true };
  };

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

    const myCurrentShift = getEffectiveShift(
      dateStr,
      currentUser.id,
      currentUser.group
    );
    const swapData = {
      type: "swap_request",
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      date: dateStr,
      fromShift: myCurrentShift,
      toShift: targetShift,
      status: "pending",
      requesterGroupId: currentUser.group,
    };

    for (const gid of targetGroups) {
      await addDoc(
        collection(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "shift_chat_messages"
        ),
        {
          text: `🔄 SOLICITUD DE CAMBIO: ${currentUser.name} tiene ${myCurrentShift} el día ${dateStr} y busca ${targetShift}.`,
          userId: "system",
          userName: "📢 CAMBIO SERVICIO",
          groupId: gid,
          isSwap: true,
          swapData: swapData,
          createdAt: serverTimestamp(),
        }
      );
    }
    alert("Solicitud enviada al chat de los compañeros que trabajan ese día.");
    closeAllModals();
  };

  const acceptSwap = async (msg) => {
    if (msg.swapData.status !== "pending") return;
    if (msg.swapData.requesterId === currentUser.id) {
      alert("No puedes aceptar tu propio cambio.");
      return;
    }
    if (
      !confirm(
        `¿Aceptas cambiar tu turno con ${msg.swapData.requesterName} el día ${msg.swapData.date}?`
      )
    )
      return;

    const date = msg.swapData.date;
    const requesterId = msg.swapData.requesterId;
    const acceptorId = currentUser.id;
    const requesterNewShift = msg.swapData.toShift;
    const acceptorNewShift = msg.swapData.fromShift;

    await addDoc(
      collection(db, "artifacts", appId, "public", "data", "shift_overrides"),
      {
        userId: requesterId,
        date,
        shift: requesterNewShift,
        type: "swap",
        createdAt: serverTimestamp(),
      }
    );
    await addDoc(
      collection(db, "artifacts", appId, "public", "data", "shift_overrides"),
      {
        userId: acceptorId,
        date,
        shift: acceptorNewShift,
        type: "swap",
        createdAt: serverTimestamp(),
      }
    );

    await updateDoc(
      doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "shift_chat_messages",
        msg.id
      ),
      {
        "swapData.status": "accepted",
        "swapData.acceptedBy": currentUser.name,
      }
    );

    const requesterGroupId = msg.swapData.requesterGroupId;
    if (requesterGroupId) {
      await addDoc(
        collection(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "shift_chat_messages"
        ),
        {
          text: `✅ CAMBIO CONFIRMADO: ${currentUser.name} ha aceptado el cambio de turno de ${msg.swapData.requesterName} para el día ${date}.`,
          userId: "system",
          userName: "✅ CAMBIO REALIZADO",
          groupId: requesterGroupId,
          createdAt: serverTimestamp(),
        }
      );
    }
    alert("¡Cambio realizado!");
  };

  const applyServiceChange = async (newShift) => {
    const dateStr = selectionStart;
    if (!dateStr) return;
    await addDoc(
      collection(db, "artifacts", appId, "public", "data", "shift_overrides"),
      {
        userId: currentUser.id,
        date: dateStr,
        shift: newShift,
        type: "service",
        createdAt: serverTimestamp(),
      }
    );
    closeAllModals();
  };

  const occupationMap = useMemo(() => {
    const map = {};
    const activeMemberIds = activeMembers.map((m) => m.id);
    requests.forEach((req) => {
      if (activeMemberIds.includes(req.userId)) {
        req.days.forEach((day) => {
          if (!map[day])
            map[day] = {
              vacation: 0,
              ap: 0,
              baja: 0,
              ss: 0,
              nav: 0,
              totalAbsence: 0,
              reqs: [],
            };
          const type = req.type || "vacation";
          map[day][type]++;
          map[day].totalAbsence++;
          map[day].reqs.push(req);
        });
      }
    });
    return map;
  }, [requests, activeMembers]);

  const selectionStats = useMemo(() => {
    if (!selectionStart) return null;
    const end = selectionEnd || hoverDate || selectionStart;
    const startStr = selectionStart < end ? selectionStart : end;
    const endStr = selectionStart < end ? end : selectionStart;
    const range = getDatesInRange(startStr, endStr);
    let workDays = 0;
    range.forEach((day) => {
      const shift = getEffectiveShift(
        day,
        currentUser?.id,
        currentUser?.group
      );
      if (SHIFT_STYLES[shift]?.workDay) workDays++;
    });
    return { workDays, range, startStr, endStr };
  }, [selectionStart, selectionEnd, hoverDate, currentUser, overrides]);

  // --- LOGICA CLICK MODIFICADA ---
  const handleDayClick = (dateStr) => {
    if (dateStr < PERIOD_START || dateStr > PERIOD_END) return;

    const myOverride = overrides.find(
      (o) => o.userId === currentUser.id && o.date === dateStr
    );
    if (myOverride) {
      setSelectedOverrideToDelete(myOverride);
      setShowModal(true);
      setSelectionStart(dateStr);
      setSelectionEnd(null);
      return;
    }

    const myExistingReq = requests.find(
      (r) => r.userId === currentUser.id && r.days.includes(dateStr)
    );
    if (myExistingReq) {
      setSelectedRequestToDelete(myExistingReq);
      setShowModal(true);
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    if (!selectionStart || (selectionStart && selectionEnd)) {
      setSelectionStart(dateStr);
      setSelectionEnd(null);
      setShowModal(false);
    } else {
      setSelectionEnd(dateStr);
      setShowModal(true);
    }
  };

  const closeAllModals = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setShowModal(false);
    setShowYearSelector(false);
    setShowShiftChange(false);
    setModalError("");
    setSelectedRequestToDelete(null);
    setSelectedOverrideToDelete(null);
  };

  const getUsed = (uid, type, year) =>
    requests
      .filter((r) => r.userId === uid && r.type === type && r.year === year)
      .reduce((acc, r) => acc + r.cost, 0);

  const renderDay = (year, month, d) => {
    const date = new Date(year, month, d);
    const dateStr = toDateStr(date);
    const todayStr = toDateStr(new Date());
    const isToday = dateStr === todayStr;

    const shift = getEffectiveShift(
      dateStr,
      currentUser?.id,
      currentUser?.group
    );
    const style = SHIFT_STYLES[shift] || SHIFT_STYLES["L"];
    const occ = occupationMap[dateStr];
    let isSelected = selectionStats && selectionStats.range.includes(dateStr);
    const isInteractive = dateStr >= PERIOD_START && dateStr <= PERIOD_END;
    let bgClass = isSelected
      ? "bg-green-100 ring-2 ring-green-600 z-10"
      : "hover:bg-green-50/30";
    
    // RESALTAR HOY
    if (isToday && !isSelected) {
      bgClass = "bg-yellow-200/60 ring-2 ring-yellow-400";
    }

    const hasOverride = overrides.some(
      (o) => o.userId === currentUser?.id && o.date === dateStr
    );
    const borderClass = hasOverride
      ? "border-orange-400 border-2"
      : "border-green-100 border-r border-b";

    return (
      <div
        key={dateStr}
        onClick={() => isInteractive && handleDayClick(dateStr)}
        onMouseEnter={() =>
          selectionStart && !selectionEnd && setHoverDate(dateStr)
        }
        className={`relative h-auto min-h-[5.5rem] ${borderClass} p-1 cursor-pointer select-none transition-all flex flex-col ${bgClass} ${
          !isInteractive
            ? "opacity-40 pointer-events-none bg-gray-50"
            : "bg-white/80"
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <span
            className={`text-xs font-bold ${
              [0, 6].includes(date.getDay()) ? "text-red-400" : "text-green-800"
            }`}
          >
            {d}
          </span>
          <span
            className={`text-[9px] font-bold px-1 rounded border ${style.bg} ${
              style.text
            } ${
              style.bg === "bg-white"
                ? "border-slate-200"
                : "border-transparent"
            }`}
          >
            {style.label}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 mt-1 w-full overflow-hidden">
          {occ &&
            occ.reqs.map((req, i) => {
              const isMe = req.userId === currentUser?.id;
              const colorClass =
                TYPE_STYLES[req.type || "vacation"]?.color || "bg-gray-500";
              return (
                <div
                  key={i}
                  className={`text-[9px] px-1 py-0.5 rounded truncate font-medium text-white shadow-sm ${colorClass} ${
                    isMe
                      ? "ring-1 ring-yellow-400 z-10 font-bold"
                      : "opacity-90"
                  }`}
                  title={req.userName}
                >
                  {req.userName}
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const calendarGrid = useMemo(() => {
    const grids = [];
    let curr = new Date(PERIOD_START);
    const end = new Date(PERIOD_END);
    curr.setDate(1);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    while (curr <= end) {
      const year = curr.getFullYear();
      const month = curr.getMonth();
      const days = [];
      const daysInMonth = new Date(
        year,
        month + 1,
        0
      ).getDate();
      const offset =
        (new Date(year, month, 1).getDay() + 6) % 7;
      for (let i = 0; i < offset; i++)
        days.push(
          <div
            key={`e-${i}`}
            className="bg-green-50/20 border-r border-b border-green-100"
          />
        );
      for (let d = 1; d <= daysInMonth; d++)
        days.push(renderDay(year, month, d));
      
      // Detectar si este es el mes actual para poner la Ref
      const isCurrentMonthGrid = year === currentYear && month === currentMonth;

      grids.push(
        <div
          key={`${year}-${month}`}
          ref={isCurrentMonthGrid ? currentMonthRef : null}
          className="break-inside-avoid mb-6 bg-white shadow-sm border border-green-200 rounded-lg overflow-hidden"
        >
          <div className="bg-green-900 text-white px-4 py-2 font-bold text-sm flex justify-between items-center">
            <span>
              {curr
                .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
                .toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-7 text-center bg-green-50 text-[10px] font-bold text-green-800 py-1 border-b border-green-200">
            <div>LUN</div>
            <div>MAR</div>
            <div>MIÉ</div>
            <div>JUE</div>
            <div>VIE</div>
            <div className="text-red-400">SÁB</div>
            <div className="text-red-400">DOM</div>
          </div>
          <div className="grid grid-cols-7">{days}</div>
        </div>
      );
      curr.setMonth(curr.getMonth() + 1);
    }
    return grids;
  }, [
    requests,
    selectionStart,
    selectionEnd,
    hoverDate,
    currentUser,
    overrides,
    selectedGroupId,
    occupationMap,
  ]);

  // --- VISTAS DE NAVEGACIÓN ---

  if (view === "categories") {
    return (
      <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans relative">
        <div className="max-w-md w-full text-center">
          <img
            src={LOGO_URL}
            alt="Logo"
            className="w-24 h-24 mx-auto mb-6 object-contain bg-white rounded-full p-2 shadow-xl border-4 border-green-100"
          />
          <h1 className="text-3xl font-black text-green-900 mb-2">
            TRÁFICO APP
          </h1>
          <p className="text-green-700 mb-8 font-medium">
            Selecciona especialidad
          </p>
          <div className="grid gap-4">
            <button
              onClick={() => handleCategorySelect("motoristas")}
              className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-green-50 hover:border-emerald-500 hover:shadow-lg transition-all flex items-center gap-4 group"
            >
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white">
                <Bike className="w-8 h-8" />
              </div>
              <div className="text-left">
                <span className="font-bold text-xl text-green-900 block">
                  Motoristas
                </span>
                <span className="text-xs text-green-600">
                  Destacamentos de Tráfico
                </span>
              </div>
              <ChevronRight className="ml-auto w-6 h-6 text-green-300" />
            </button>

            <button
              onClick={() => handleCategorySelect("atestados")}
              className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-green-50 hover:border-blue-500 hover:shadow-lg transition-all flex items-center gap-4 group"
            >
              <div className="bg-blue-100 p-3 rounded-xl text-blue-700 group-hover:bg-blue-600 group-hover:text-white">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-left">
                <span className="font-bold text-xl text-blue-900 block">
                  Atestados
                </span>
                <span className="text-xs text-blue-600">
                  Equipos de Atestados (EIS)
                </span>
              </div>
              <ChevronRight className="ml-auto w-6 h-6 text-blue-300" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 text-[10px] text-green-400 italic">
          App Gestión v1.5 Final
        </div>
      </div>
    );
  }

  if (view === "units") {
    return (
      <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans relative">
        <div className="max-w-md w-full text-center">
          <div className="flex items-center justify-between mb-6 px-2">
            <button
              onClick={() => setView("categories")}
              className="p-2 bg-white rounded-full shadow-sm text-green-700 hover:bg-green-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-black text-green-900 uppercase">
              {selectedCategory}
            </h2>
            <div className="w-10"></div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
            {unitsInCategory.map((unitName) => (
              <button
                key={unitName}
                onClick={() => handleUnitSelect(unitName)}
                className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-green-50 hover:border-emerald-500 hover:shadow-lg transition-all flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg text-green-900 text-left">
                    {unitName}
                  </span>
                </div>
                <ChevronRight className="w-6 h-6 text-green-300 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "groups") {
    return (
      <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans relative">
        <div className="max-w-md w-full text-center">
          <div className="flex items-center justify-between mb-6 px-2">
            <button
              onClick={() => {
                setSelectedUnit(null);
                setView("units");
              }}
              className="p-2 bg-white rounded-full shadow-sm text-green-700 hover:bg-green-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-black text-green-900 truncate max-w-[220px]">
              {selectedUnit}
            </h2>
            <div className="w-10"></div>
          </div>

          <p className="text-green-700 mb-8 font-medium">Selecciona Grupo</p>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
            {groupsInSelectedUnit.map((g) => (
              <button
                key={g.id}
                onClick={() => handleGroupSelect(g.id)}
                className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-green-50 hover:border-emerald-500 hover:shadow-lg transition-all flex justify-between items-center group"
              >
                <span className="font-bold text-xl text-green-800">
                  {g.name}
                </span>
                <ChevronRight className="w-6 h-6 text-green-300 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "login" && !currentUser) {
    return (
      <div className="min-h-screen bg-green-50/30 flex flex-col items-center justify-center p-4 font-sans">
        {!loginMember ? (
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200">
            <div className="bg-green-900 p-6 text-center relative">
              <button
                onClick={() => setView("groups")}
                className="absolute left-4 top-4 text-green-200 hover:text-white text-xs font-bold flex items-center gap-1"
              >
                ← Volver
              </button>
              <h2 className="text-xl font-bold text-white mt-4">
                {selectedUnit} -{" "}
                {GROUPS.find((g) => g.id === selectedGroupId)?.name}
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
              {activeMembers.map((m) => (
                <button
                  key={m.id}
                  disabled={!m.active}
                  onClick={() => handleLoginAttempt(m)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    !m.active
                      ? "bg-gray-50 opacity-50 cursor-not-allowed"
                      : "bg-white border-green-100 hover:border-emerald-500 hover:bg-green-50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm ${
                        m.active ? "bg-emerald-600" : "bg-gray-400"
                      }`}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-green-900 text-sm block">
                        {m.name}
                      </span>
                      {!m.active && (
                        <span className="text-[8px] text-red-500 font-bold uppercase">
                          {m.status || "INACTIVO"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-green-50 p-3 text-center border-t border-green-100">
              <button
                onClick={() =>
                  handleLoginAttempt({ id: "admin", name: "Supervisión" })
                }
                className="text-xs text-green-600 hover:text-green-800 font-bold flex items-center justify-center gap-1 mx-auto"
              >
                <Shield className="w-3 h-3" /> Supervisión
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 text-center border border-green-100">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-4">
              Hola, {loginMember.name}
            </h2>
            <form onSubmit={submitPin}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center text-3xl tracking-widest font-bold py-3 border-2 border-green-100 rounded-xl focus:border-emerald-500 outline-none mb-4 text-green-800"
                placeholder="****"
                autoFocus
              />
              {loginError && (
                <p className="text-red-500 text-xs font-bold mb-3">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-colors"
              >
                Entrar
              </button>
            </form>
            <button
              onClick={() => setLoginMember(null)}
              className="mt-4 text-green-400 text-sm hover:text-green-600 font-medium"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- DASHBOARD ---
  const limits = currentUser ? getUserLimits(currentUser.id) : {};
  const myV25 = getUsed(currentUser?.id, "vacation", "2025");
  const myV26 = getUsed(currentUser?.id, "vacation", "2026");
  const myAP25 = getUsed(currentUser?.id, "ap", "2025");
  const myAP26 = getUsed(currentUser?.id, "ap", "2026");

  const currentDayShift = selectionStart
    ? getEffectiveShift(selectionStart, currentUser?.id, currentUser?.group)
    : null;
  const isWorkingDay =
    currentDayShift && SHIFT_STYLES[currentDayShift]?.workDay;

  return (
    <div className="min-h-screen bg-green-50/30 font-sans text-slate-900 pb-20 relative">
      {/* --- BARRA DE AVISO DE SELECCIÓN --- */}
      {selectionStart && !selectionEnd && (
        <div className="fixed bottom-0 left-0 right-0 bg-emerald-600 text-white p-4 z-[150] shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-emerald-200" />
            <div>
              <div className="font-bold text-sm">📆 Inicio: {selectionStart}</div>
              <div className="text-xs text-emerald-100">
                Selecciona fecha fin (o toca el mismo día otra vez).
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectionStart(null)}
            className="bg-emerald-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* --- MODAL SERVICIO DIARIO (ACTUALIZADO CON SECCIONES) --- */}
      {showServiceModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-green-100 h-[80vh] flex flex-col">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> Servicio{" "}
                {new Date(serviceDate).toLocaleDateString()}
              </h3>
              <button onClick={() => setShowServiceModal(false)}>
                <X />
              </button>
            </div>
            <div className="p-4 space-y-6 overflow-y-auto flex-1 bg-slate-50">
              {/* SECCIÓN MOTORISTAS */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-200">
                  <Bike className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-blue-900 uppercase tracking-wider text-sm">
                    Fuerza Motorista
                  </h4>
                </div>
                <div className="space-y-3">
                  {["M", "T", "N"].map((shift) => (
                    <div
                      key={`moto-${shift}`}
                      className="border border-slate-200 bg-white rounded-lg overflow-hidden shadow-sm"
                    >
                      <div
                        className={`px-3 py-1.5 font-bold text-xs flex justify-between ${SHIFT_STYLES[shift].bg} ${SHIFT_STYLES[shift].text}`}
                      >
                        <span>
                          TURNO{" "}
                          {shift === "M"
                            ? "MAÑANA"
                            : shift === "T"
                            ? "TARDE"
                            : "NOCHE"}
                        </span>
                        <span className="opacity-60">8H</span>
                      </div>
                      <div className="p-2 text-xs min-h-[2rem]">
                        {serviceData.moto[shift].length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {serviceData.moto[shift].map((name, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 font-medium"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            Sin efectivos
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN ATESTADOS */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-200">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-indigo-900 uppercase tracking-wider text-sm">
                    Equipo Atestados (EIS)
                  </h4>
                </div>
                <div className="space-y-3">
                  {["M", "N"].map((shift) => (
                    <div
                      key={`eis-${shift}`}
                      className="border border-slate-200 bg-white rounded-lg overflow-hidden shadow-sm"
                    >
                      <div
                        className={`px-3 py-1.5 font-bold text-xs flex justify-between ${SHIFT_STYLES[shift].bg} ${SHIFT_STYLES[shift].text}`}
                      >
                        <span>
                          TURNO {shift === "M" ? "MAÑANA/DÍA" : "NOCHE"}
                        </span>
                        <span className="opacity-60">12H</span>
                      </div>
                      <div className="p-2 text-xs min-h-[2rem]">
                        {serviceData.eis[shift].length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {serviceData.eis[shift].map((name, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 font-medium"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            Sin efectivos
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESTO DE MODALES */}
      {showModal && !showYearSelector && !showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-green-100 overflow-y-auto max-h-[90vh]">
            {selectedRequestToDelete ? (
              <div className="text-center">
                <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800">¿Borrar solicitud?</h3>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={closeAllModals}
                    className="flex-1 py-2 bg-slate-100 rounded text-slate-600 hover:bg-slate-200"
                  >
                    No
                  </button>
                  <button
                    onClick={deleteRequest}
                    className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 shadow"
                  >
                    Sí, Borrar
                  </button>
                </div>
              </div>
            ) : selectedOverrideToDelete ? (
              <div className="text-center">
                <Undo2 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800">¿Restaurar turno?</h3>
                <p className="text-xs text-slate-500 mt-2 mb-4">
                  Se anulará el cambio de servicio y volverás a tu turno
                  original.
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={closeAllModals}
                    className="flex-1 py-2 bg-slate-100 rounded text-slate-600 hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteOverride}
                    className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 shadow"
                  >
                    Sí, Restaurar
                  </button>
                </div>
              </div>
            ) : !showShiftChange ? (
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  Gestión de Día
                </h3>
                <button
                  onClick={() => {
                    calculateService(selectionStats.range[0]);
                  }}
                  className="w-full mb-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <CalendarCheck className="w-4 h-4" /> 👮‍♂️ Ver Servicio Diario
                </button>

                {isWorkingDay ? (
                  <div className="space-y-2 mb-6">
                    <div className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">
                      Permisos
                    </div>
                    <button
                      onClick={() => initiateRequest("vacation")}
                      className="w-full flex justify-between p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    >
                      <div className="flex gap-2 items-center">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-900">
                          Vacaciones
                        </span>
                      </div>
                      <div className="text-[10px] text-right text-emerald-700">
                        <div>'25: {limits.vac25 - myV25}</div>
                        <div>'26: {limits.vac26 - myV26}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => initiateRequest("ap")}
                      className="w-full flex justify-between p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                    >
                      <div className="flex gap-2 items-center">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-purple-900">
                          Asuntos Propios
                        </span>
                      </div>
                      <div className="text-[10px] text-right text-purple-700">
                        <div>'25: {limits.ap25 - myAP25}</div>
                        <div>'26: {limits.ap26 - myAP26}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => initiateRequest("ss")}
                      className="w-full flex justify-between p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-orange-900 font-bold text-sm transition-colors"
                    >
                      Semana Santa
                    </button>
                    <button
                      onClick={() => initiateRequest("nav")}
                      className="w-full flex justify-between p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-900 font-bold text-sm transition-colors"
                    >
                      Navidad
                    </button>
                    <button
                      onClick={() => processRequest("baja", "2026")}
                      className="w-full p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm transition-colors"
                    >
                      Baja Médica
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800 mb-4 text-center">
                    Hoy libras, solo puedes cambiar servicio.
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">
                    Operativa
                  </div>
                  <button
                    onClick={() => setShowShiftChange(true)}
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 font-bold text-sm flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> 🔄 Cambio de Servicio
                  </button>
                </div>
                <button
                  onClick={closeAllModals}
                  className="mt-4 w-full text-slate-400 text-sm hover:text-slate-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Cambio de Turno
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Día seleccionado: {selectionStart}
                </p>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">
                      1. Necesidades del Servicio
                    </h4>
                    <div className="flex gap-2">
                      {["M", "T", "N"].map((shift) => (
                        <button
                          key={shift}
                          onClick={() => applyServiceChange(shift)}
                          className={`flex-1 py-2 rounded-lg font-bold text-sm border ${SHIFT_STYLES[shift].bg} ${SHIFT_STYLES[shift].text} hover:opacity-80`}
                        >
                          {shift}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">
                      Cambia tu turno directamente en el cuadrante.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 text-sm mb-2">
                      2. Cambiar con Compañero
                    </h4>
                    <div className="flex gap-2 mb-2">
                      {["M", "T", "N"].map((shift) => (
                        <button
                          key={shift}
                          onClick={() => setSwapTargetShift(shift)}
                          className={`flex-1 py-2 rounded-lg font-bold text-sm border transition-all ${
                            swapTargetShift === shift
                              ? "bg-blue-600 text-white ring-2 ring-blue-300"
                              : "bg-white text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {shift}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => requestSwap(swapTargetShift)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft className="w-4 h-4" /> Solicitar Cambio
                    </button>
                    <p className="text-[9px] text-blue-400 mt-1">
                      Se enviará una petición al chat de los grupos de tu misma
                      unidad.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShiftChange(false)}
                  className="mt-4 w-full text-slate-400 text-sm hover:text-slate-600"
                >
                  Volver
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-green-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" /> Ver/Editar
              Saldos
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <h4 className="text-xs font-bold text-orange-800 uppercase mb-2">
                  Cupo 2025 (Hasta Mar 26)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 block">
                      Vacaciones 25
                    </label>
                    <input
                      type="number"
                      value={tempSettings.vac25}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          vac25: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded p-1 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">
                      AP 2025
                    </label>
                    <input
                      type="number"
                      value={tempSettings.ap25}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          ap25: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded p-1 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">
                  Cupo 2026 (Año actual)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 block">
                      Vacaciones 26
                    </label>
                    <input
                      type="number"
                      value={tempSettings.vac26}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          vac26: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded p-1 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">
                      AP 2026
                    </label>
                    <input
                      type="number"
                      value={tempSettings.ap26}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          ap26: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded p-1 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1">
                  <Key className="w-3 h-3" /> Seguridad
                </h4>
                <div>
                  <label className="text-[10px] text-slate-500 block">
                    Cambiar PIN (4 dígitos)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Nuevo PIN..."
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="w-full border rounded p-2 text-sm font-bold tracking-widest text-center"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    Déjalo vacío si no quieres cambiarlo.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2 text-slate-500 font-bold text-sm hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm shadow hover:bg-emerald-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {showYearSelector && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-green-100">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              📅 Periodo de Solapamiento
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Estas fechas permiten gastar días de 2025 (caducan en marzo) o de
              2026. ¿Cuál usas?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => processRequest(pendingRequestType, "2025")}
                className="w-full p-4 bg-orange-100 hover:bg-orange-200 rounded-xl border border-orange-200 flex justify-between items-center transition-colors"
              >
                <span className="font-bold text-orange-900">Cupo 2025</span>
                <span className="text-xs text-orange-700 font-mono">
                  Quedan:{" "}
                  {pendingRequestType === "vacation"
                    ? limits.vac25 - myV25
                    : limits.ap25 - myAP25}
                </span>
              </button>
              <button
                onClick={() => processRequest(pendingRequestType, "2026")}
                className="w-full p-4 bg-emerald-100 hover:bg-emerald-200 rounded-xl border border-emerald-200 flex justify-between items-center transition-colors"
              >
                <span className="font-bold text-emerald-900">Cupo 2026</span>
                <span className="text-xs text-emerald-700 font-mono">
                  Quedan:{" "}
                  {pendingRequestType === "vacation"
                    ? limits.vac26 - myV26
                    : limits.ap26 - myAP26}
                </span>
              </button>
            </div>
            <button
              onClick={closeAllModals}
              className="mt-4 text-slate-400 text-sm hover:text-slate-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <nav className="bg-green-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Logo"
              className="w-8 h-8 bg-white rounded-full p-0.5"
            />
            <div>
              <div className="font-bold text-sm">{currentUser.name}</div>
              <button
                onClick={() => {
                  const lims = getUserLimits(currentUser.id);
                  setTempSettings(lims);
                  setNewPin("");
                  setShowSettingsModal(true);
                }}
                className="text-[10px] text-emerald-300 flex items-center gap-1 hover:text-white transition-colors"
              >
                <Settings className="w-3 h-3" /> Ver/Editar Saldos
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(GPT_URL, "_blank")}
              className="relative p-2 text-emerald-300 hover:text-white transition-colors"
            >
              <Bot className="w-6 h-6" />
            </button>
            <button
              onClick={openPermisosPopup}
              className="relative p-2 text-emerald-300 hover:text-white transition-colors"
            >
              <Car className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="relative p-2 text-green-300 hover:text-white transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-green-900" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-green-300 hover:text-white transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {showChat && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowChat(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="bg-green-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                Chat {GROUPS.find((g) => g.id === selectedGroupId)?.name}
              </h3>
              <button onClick={() => setShowChat(false)}>
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-50">
              {messages.map((msg) => {
                const isSystem = msg.userId === "system";
                const isSwap = msg.isSwap;
                const isMe = msg.userId === currentUser.id;

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div
                        className={`border text-xs px-3 py-2 rounded-lg max-w-[90%] shadow-sm ${
                          isSwap
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : "bg-red-50 border-red-100 text-red-800"
                        }`}
                      >
                        <div className="font-bold mb-1 flex items-center gap-1">
                          {isSwap ? "🔄" : "⚠️"} {msg.userName}
                        </div>
                        <p className="mb-2">{msg.text}</p>
                        {isSwap && msg.swapData?.status === "pending" && (
                          <button
                            onClick={() => acceptSwap(msg)}
                            className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition-colors"
                          >
                            ✅ ACEPTAR CAMBIO
                          </button>
                        )}
                        {isSwap && msg.swapData?.status === "accepted" && (
                          <div className="w-full py-1 bg-green-100 text-green-800 rounded font-bold text-center">
                            ✅ Aceptado por {msg.swapData.acceptedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 text-sm shadow-sm ${
                        isMe
                          ? "bg-emerald-100 text-emerald-900 rounded-br-none"
                          : "bg-white text-slate-800 rounded-bl-none"
                      }`}
                    >
                      {!isMe && (
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">
                          {msg.userName}
                        </span>
                      )}
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={sendMessage}
              className="p-3 bg-white border-t flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Mensaje..."
              />
              <button
                type="submit"
                className="text-emerald-600 hover:text-emerald-800"
              >
                <Send />
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Estado{" "}
              {GROUPS.find((g) => g.id === selectedGroupId)?.name} (2026)
            </h3>
            <div className="space-y-2">
              {activeMembers
                .filter((m) => m.active)
                .map((m) => {
                  const v = getUsed(m.id, "vacation", "2026");
                  const a = getUsed(m.id, "ap", "2026");
                  const lims = getUserLimits(m.id);
                  return (
                    <div
                      key={m.id}
                      className="text-xs flex justify-between border-b pb-1 border-green-50 last:border-0"
                    >
                      <span
                        className={
                          m.id === currentUser.id
                            ? "text-emerald-700 font-bold"
                            : "text-slate-600"
                        }
                      >
                        {m.name}
                      </span>
                      <div className="flex gap-2 font-medium">
                        <span className="text-emerald-600">
                          V:{v}/{lims.vac26}
                        </span>
                        <span className="text-purple-600">
                          AP:{a}/{lims.ap26}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          {loading ? (
            <div className="p-10 text-center text-emerald-600 font-medium animate-pulse">
              Cargando...
            </div>
          ) : (
            <div className="columns-1 xl:columns-2 gap-4 space-y-4">
              {calendarGrid}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}