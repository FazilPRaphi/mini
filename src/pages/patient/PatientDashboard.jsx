import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import healthsyncLogo from "../../assets/healthsync-logo.png";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import ChatList from "../../components/ChatList";
import Appointments from "./Appointments";
import MyAppointments from "./MyAppointments";
import Prescriptions from "./PatientPrescriptions";
import PatientProfile from "./PatientProfile";
import PatientComplaints from "./PatientComplaints";
import MedicalRecords from "./MedicalRecords";
import NotificationBell from "../../components/NotificationBell";
import {
  Menu, X, LogOut, LayoutDashboard, CalendarPlus, CalendarCheck,
  FileText, MessageSquare, ShieldAlert, UserCircle, FileHeart, AlertTriangle, PhoneCall
} from "lucide-react";

const NAV = [
  { key: "dashboard",      label: "Dashboard",        icon: LayoutDashboard },
  { key: "appointments",   label: "Appointments",      icon: CalendarPlus },
  { key: "myappointments", label: "My Appointments",   icon: CalendarCheck },
  { key: "prescriptions",  label: "Prescriptions",     icon: FileText },
  { key: "chat",           label: "Chat",              icon: MessageSquare },
  { key: "records",        label: "Medical Records",   icon: FileHeart },
  { key: "complaints",     label: "Complaints",        icon: ShieldAlert },
  { key: "settings",       label: "Settings",          icon: UserCircle },
];

const EMERGENCY_CONTACTS = [
  { label: "Ambulance", number: "108", icon: "🚑" },
  { label: "Police", number: "100", icon: "🚓" },
  { label: "Fire Force", number: "101", icon: "🚒" },
  { label: "National Emergency Helpline", number: "112", icon: "☎️" },
  { label: "Health Helpline", number: "104", icon: "🏥" },
  { label: "City Care Hospital", number: "+91 80 4567 8910", icon: "👩‍⚕️" },
  { label: "Sunrise Multispeciality Clinic", number: "+91 44 2789 1100", icon: "🩺" },
  { label: "Metro Emergency Trauma Center", number: "+91 11 4300 2200", icon: "🚨" },
];
const MotionDiv = motion.div;

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isEmergencyVisible, setIsEmergencyVisible] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data || data.role !== "patient") {
        await supabase.auth.signOut();
        navigate("/login");
        return;
      }

      setProfile(data);

      const required = ["full_name", "age", "gender", "phone", "address", "blood_group", "emergency_contact"];
      const incomplete = required.some((f) => !data[f] || data[f].toString().trim() === "");
      if (incomplete) navigate("/complete-profile");
    };
    loadProfile();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleNav = (key) => {
    setActivePage(key);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!isEmergencyOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsEmergencyVisible(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isEmergencyOpen]);

  useEffect(() => {
    if (!isEmergencyOpen || isEmergencyVisible) return;
    const timeout = setTimeout(() => setIsEmergencyOpen(false), 220);
    return () => clearTimeout(timeout);
  }, [isEmergencyOpen, isEmergencyVisible]);

  const openEmergencyModal = () => {
    setIsEmergencyOpen(true);
    requestAnimationFrame(() => setIsEmergencyVisible(true));
  };

  const closeEmergencyModal = () => {
    setIsEmergencyVisible(false);
  };

  if (!profile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F7FAFC] font-redhat text-gray-400 text-lg">
        Loading dashboard…
      </div>
    );
  }

  const initial = profile.full_name?.charAt(0)?.toUpperCase() || "P";

  /* ─── health-stat cards ─── */
  const stats = [
    { label: "Blood Group", value: profile.blood_group },
    { label: "Age",         value: profile.age },
    { label: "Gender",      value: profile.gender },
    { label: "Phone",       value: profile.phone },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#F7FAFC] font-redhat text-[#333] overflow-hidden relative">

      {/* ── MOBILE HEADER ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img src={healthsyncLogo} alt="HealthSync" className="h-7 w-auto object-contain" />
          <span className="font-extrabold text-xl text-[#0BC5EA] tracking-tight">HealthSync</span>
        </div>
        <NotificationBell />
      </div>

      {/* ── OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-45"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static
      `}>

        {/* Logo */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3">
            <img src={healthsyncLogo} alt="HealthSync" className="h-10 w-auto object-contain" />
            <div>
              <div className="font-black text-lg text-gray-900 leading-none">HealthSync</div>
              <div className="text-[10px] text-[#0BC5EA] font-extrabold tracking-widest uppercase mt-1">Patient Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {NAV.map(({ key, label, icon: Icon }) => {
            const isActive = activePage === key;
            return (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200
                  ${isActive
                    ? "bg-cyan-50 text-[#0BC5EA] shadow-sm shadow-cyan-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                `}
              >
                <Icon size={20} className={isActive ? "text-[#0BC5EA]" : "text-gray-400"} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-3">
          <button
            onClick={openEmergencyModal}
            className="emergency-pulse w-full flex items-center justify-between gap-3 rounded-2xl bg-red-600 text-white px-4 py-3.5 font-black text-sm tracking-wide shadow-lg shadow-red-200 transition-transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
            aria-haspopup="dialog"
            aria-expanded={isEmergencyOpen}
            aria-controls="emergency-assistance-dialog"
          >
            <span className="flex items-center gap-2.5">
              <AlertTriangle size={19} />
              Emergency
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">24/7</span>
          </button>
        </div>

        <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0BC5EA] to-[#2B6CB0] flex items-center justify-center text-white font-black shadow-md shadow-blue-100 shrink-0 overflow-hidden">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                : initial
              }
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{profile.full_name}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase truncate">Patient</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="flex-1 h-full overflow-y-auto no-scrollbar p-6 lg:p-10 pt-20 lg:pt-10">
          <div className="max-w-[1400px] mx-auto w-full h-full">

            {/* ─── DASHBOARD HOME ─── */}
            {activePage === "dashboard" && (
              <div className="flex flex-col h-full gap-6">

                {/* Header row */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900">
                      Hi {profile.full_name} 👋,
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">Your health dashboard — stay on top of your wellbeing.</p>
                  </div>
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-500">
                      <span>📅 Today:</span>
                      <span className="text-gray-800">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <NotificationBell />
                  </div>
                </div>

                {/* Hero banner */}
                <div className="relative isolate rounded-2xl overflow-hidden bg-gradient-to-br from-[#0BC5EA] to-[#2B6CB0] p-8 flex items-center justify-between flex-shrink-0 shadow-lg shadow-cyan-100">
                  {/* Desktop-only premium depth layers */}
                  <div className="pointer-events-none absolute inset-0 hidden lg:block">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(82% 118% at 20% 26%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 54%), radial-gradient(88% 126% at 79% 58%, rgba(125,211,252,0.24) 0%, rgba(125,211,252,0) 66%), radial-gradient(116% 128% at 52% -15%, rgba(224,242,254,0.18) 0%, rgba(224,242,254,0) 50%)",
                      }}
                    />

                    <div
                      className="absolute inset-0 mix-blend-screen opacity-52"
                      style={{
                        backgroundImage:
                          "linear-gradient(106deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 34%, rgba(186,230,253,0.10) 62%, rgba(186,230,253,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 48%, rgba(30,64,175,0.15) 100%)",
                      }}
                    />

                    <div className="absolute inset-3 rounded-[18px] border border-white/12 bg-white/[0.03] backdrop-blur-[1.5px]" />
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        backgroundImage:
                          "radial-gradient(122% 142% at 50% 116%, rgba(10,35,83,0.28) 0%, rgba(10,35,83,0) 58%), radial-gradient(108% 122% at -8% 54%, rgba(13,57,120,0.20) 0%, rgba(13,57,120,0) 62%), radial-gradient(108% 122% at 108% 54%, rgba(13,57,120,0.20) 0%, rgba(13,57,120,0) 62%)",
                      }}
                    />

                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        backgroundImage:
                          "radial-gradient(70% 100% at 74% 50%, rgba(240,249,255,0.22) 0%, rgba(240,249,255,0.02) 36%, rgba(240,249,255,0) 68%)",
                      }}
                    />

                    <MotionDiv
                      className="absolute -left-24 -top-16 h-56 w-56 rounded-full bg-cyan-100/24 blur-3xl transform-gpu"
                      animate={{ x: [0, 6, 0], y: [0, 3, 0] }}
                      transition={{ duration: 34, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform" }}
                    />
                    <MotionDiv
                      className="absolute right-24 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-blue-100/15 blur-3xl transform-gpu"
                      animate={{ x: [0, -6, 0], y: [0, -4, 0] }}
                      transition={{ duration: 38, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform" }}
                    />
                    <MotionDiv
                      className="absolute right-24 bottom-5 h-24 w-60 rounded-full bg-white/10 blur-2xl transform-gpu"
                      animate={{ x: [0, 5, 0], opacity: [0.2, 0.28, 0.2] }}
                      transition={{ duration: 36, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform, opacity" }}
                    />

                    <div className="absolute right-[12%] top-[24%] h-24 w-24 rounded-full border border-cyan-100/18 bg-cyan-50/[0.04] blur-[0.2px]" />
                    <div className="absolute right-[30%] bottom-[14%] h-16 w-16 rounded-full border border-blue-100/16 bg-blue-50/[0.03] blur-[0.2px]" />

                    <MotionDiv
                      className="absolute inset-0 transform-gpu"
                      animate={{ x: [0, 6, 0], y: [0, -2, 0] }}
                      transition={{ duration: 44, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform" }}
                    >
                      <svg className="h-full w-full opacity-[0.15]" viewBox="0 0 1200 240" fill="none" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M390 54C448 30 504 35 558 56C612 77 666 81 724 58C782 35 840 36 898 62C956 88 1014 92 1072 70" stroke="rgba(240,249,255,0.52)" strokeWidth="1.05" />
                        <path d="M390 74C448 98 504 99 558 77C612 55 666 50 724 71C782 92 840 92 898 68C956 44 1014 43 1072 64" stroke="rgba(191,219,254,0.38)" strokeWidth="0.95" />
                        <path d="M426 61L426 68M454 52L454 60M482 49L482 57M510 53L510 60M538 63L538 70M566 73L566 80M594 81L594 88M622 84L622 91M650 81L650 88M678 73L678 80M706 63L706 70M734 53L734 60M762 49L762 57M790 52L790 60M818 61L818 68M846 72L846 79M874 81L874 88M902 85L902 92M930 82L930 89M958 73L958 80M986 61L986 68" stroke="rgba(224,242,254,0.28)" strokeWidth="0.8" strokeLinecap="round" />
                      </svg>
                    </MotionDiv>

                    <MotionDiv
                      className="absolute inset-0 transform-gpu"
                      animate={{ x: [0, 7, 0] }}
                      transition={{ duration: 48, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform" }}
                    >
                      <svg className="h-full w-full opacity-[0.16]" viewBox="0 0 1200 240" fill="none" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M394 164H468L490 152L504 176L524 138L546 164H584L608 156L628 172L648 164H678L700 160L720 168L744 150L766 164H1078" stroke="rgba(236,254,255,0.46)" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M394 181H450L472 174L492 188L510 168L530 181H566L590 176L612 186L636 173L658 181H1078" stroke="rgba(191,219,254,0.28)" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </MotionDiv>

                    <MotionDiv
                      className="absolute inset-0 transform-gpu"
                      animate={{ x: [0, -4, 0], y: [0, 2, 0] }}
                      transition={{ duration: 52, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform" }}
                    >
                      <svg className="h-full w-full opacity-[0.14]" viewBox="0 0 1200 240" fill="none" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M790 114L832 96L870 106L902 84L942 96L970 76L1012 86L1040 70L1086 84" stroke="rgba(224,242,254,0.4)" strokeWidth="0.9" />
                        <path d="M790 114L834 142L868 132L904 154L944 144L972 164L1012 154L1042 170L1086 160" stroke="rgba(207,250,254,0.3)" strokeWidth="0.82" />
                        <circle cx="832" cy="96" r="2.1" fill="rgba(255,255,255,0.62)" />
                        <circle cx="902" cy="84" r="1.9" fill="rgba(207,250,254,0.56)" />
                        <circle cx="970" cy="76" r="1.9" fill="rgba(224,242,254,0.52)" />
                        <circle cx="1040" cy="70" r="2.1" fill="rgba(255,255,255,0.58)" />
                        <circle cx="868" cy="132" r="1.7" fill="rgba(191,219,254,0.5)" />
                        <circle cx="944" cy="144" r="1.7" fill="rgba(191,219,254,0.5)" />
                        <circle cx="1012" cy="154" r="1.7" fill="rgba(207,250,254,0.48)" />
                      </svg>
                    </MotionDiv>

                    <MotionDiv
                      className="absolute left-[40%] top-10 h-1.5 w-1.5 rounded-full bg-white/70 blur-[1px] transform-gpu"
                      animate={{ y: [0, -3, 0], opacity: [0.22, 0.36, 0.22] }}
                      transition={{ duration: 24, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform, opacity" }}
                    />
                    <MotionDiv
                      className="absolute right-[22%] top-[28%] h-1.5 w-1.5 rounded-full bg-cyan-100/80 blur-[1px] transform-gpu"
                      animate={{ y: [0, 2, 0], opacity: [0.14, 0.28, 0.14] }}
                      transition={{ duration: 28, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform, opacity" }}
                    />
                    <MotionDiv
                      className="absolute right-[30%] bottom-[22%] h-2 w-2 rounded-full bg-blue-50/60 blur-[1px] transform-gpu"
                      animate={{ y: [0, -2, 0], opacity: [0.12, 0.24, 0.12] }}
                      transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      style={{ willChange: "transform, opacity" }}
                    />
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-white font-black text-2xl mb-2">Manage your health easily</h2>
                    <p className="text-cyan-100 text-sm mb-5">Book appointments, chat with doctors, and track your records.</p>
                    <button
                      onClick={() => handleNav("appointments")}
                      className="bg-white text-[#0BC5EA] font-bold px-6 py-2.5 rounded-xl shadow hover:shadow-md transform-gpu will-change-transform transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.995] text-sm"
                    >
                      Book Appointment
                    </button>
                  </div>
                  <div className="relative z-10 hidden lg:block opacity-28">
                    <svg width="136" height="108" viewBox="0 0 136 108" fill="none" aria-hidden="true">
                      <path d="M2 56C17 43 31 39 47 42C62 46 74 58 90 63C105 68 119 65 134 53" stroke="rgba(255,255,255,0.54)" strokeWidth="1.1" />
                      <path d="M4 76C20 66 35 63 51 67C66 71 78 82 94 86C109 89 122 87 134 79" stroke="rgba(224,242,254,0.42)" strokeWidth="0.95" />
                      <circle cx="48" cy="43" r="2.5" fill="rgba(255,255,255,0.56)" />
                      <circle cx="92" cy="63" r="2.4" fill="rgba(207,250,254,0.48)" />
                    </svg>
                  </div>
                </div>

                {/* Stats + Quick Actions row */}
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                  {/* Health Overview cards */}
                  <div className="flex-1 flex flex-col gap-4 min-h-0">
                    <h2 className="text-lg font-black text-gray-800 flex-shrink-0">Health Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {stats.map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                          <p className="text-2xl font-black text-gray-900 break-words">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                      <h3 className="font-black text-gray-800 text-base mb-5">Quick Actions</h3>
                      <div className="flex flex-col gap-3 flex-1">
                        <button
                          onClick={() => handleNav("appointments")}
                          className="w-full bg-gradient-to-r from-[#0BC5EA] to-[#00B5D8] text-white font-bold py-3 px-4 rounded-xl shadow-sm shadow-cyan-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-sm"
                        >
                          📅 Book Appointment
                        </button>
                        <button
                          onClick={() => handleNav("chat")}
                          className="w-full border-2 border-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-cyan-200 hover:text-[#0BC5EA] transition-all duration-200 text-sm"
                        >
                          💬 Message Doctor
                        </button>
                        <button
                          onClick={() => handleNav("records")}
                          className="w-full border-2 border-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-cyan-200 hover:text-[#0BC5EA] transition-all duration-200 text-sm"
                        >
                          🗂️ Medical Records
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activePage === "appointments"   && <Appointments />}
            {activePage === "myappointments" && <MyAppointments />}
            {activePage === "prescriptions"  && <Prescriptions />}
            {activePage === "settings"       && <PatientProfile />}
            {activePage === "chat"           && <ChatList />}
            {activePage === "complaints"     && <PatientComplaints />}
            {activePage === "records"        && <MedicalRecords />}

          </div>
        </div>
      </main>

      {isEmergencyOpen && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 transition-all duration-200 ${
            isEmergencyVisible ? "bg-black/45 backdrop-blur-sm opacity-100" : "bg-black/0 opacity-0"
          }`}
          onClick={closeEmergencyModal}
        >
          <div
            id="emergency-assistance-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-assistance-title"
            className={`w-full max-w-2xl rounded-3xl border border-red-100 bg-white shadow-2xl overflow-hidden transition-all duration-200 ${
              isEmergencyVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 sm:p-6 flex items-center justify-between gap-4 text-white">
              <div>
                <h2 id="emergency-assistance-title" className="text-2xl font-black tracking-tight">Emergency Assistance</h2>
                <p className="text-red-100 text-sm font-semibold mt-1">Critical contact numbers available at all times</p>
              </div>
              <button
                onClick={closeEmergencyModal}
                className="rounded-full p-2 bg-white/15 hover:bg-white/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close emergency assistance"
                autoFocus
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {EMERGENCY_CONTACTS.map(({ label, number, icon }) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-red-500 uppercase tracking-widest">{icon} {label}</p>
                      <a
                        href={`tel:${number.replace(/\s+/g, "")}`}
                        className="block mt-1 text-lg font-black text-gray-900 break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded-md"
                      >
                        {number}
                      </a>
                    </div>
                    <a
                      href={`tel:${number.replace(/\s+/g, "")}`}
                      className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
                      aria-label={`Call ${label} on ${number}`}
                    >
                      <PhoneCall size={18} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 sm:px-6 pb-6">
              <button
                onClick={closeEmergencyModal}
                className="w-full rounded-xl bg-gray-900 text-white font-bold py-3 hover:bg-black transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
