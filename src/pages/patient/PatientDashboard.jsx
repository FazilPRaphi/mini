import { useState, useEffect, useMemo, createElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  FileText,
  MessageSquare,
  ShieldAlert,
  UserCircle,
  FileHeart,
  AlertTriangle,
  PhoneCall,
  Search,
  ChevronDown,
  Sparkles,
  Stethoscope,
  Activity,
  Brain,
  HeartPulse,
  ArrowUpRight,
  Clock3,
  BellRing,
  ClipboardCheck,
  CircleDot,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import healthsyncLogo from "../../assets/healthsync-logo.png";
import ChatList from "../../components/ChatList";
import Appointments from "./Appointments";
import MyAppointments from "./MyAppointments";
import Prescriptions from "./PatientPrescriptions";
import PatientProfile from "./PatientProfile";
import PatientComplaints from "./PatientComplaints";
import MedicalRecords from "./MedicalRecords";
import NotificationBell from "../../components/NotificationBell";
import PremiumCard from "../../components/dashboard/PremiumCard";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "appointments", label: "Appointments", icon: CalendarPlus },
  { key: "myappointments", label: "My Appointments", icon: CalendarCheck },
  { key: "prescriptions", label: "Prescriptions", icon: FileText },
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "records", label: "Medical Records", icon: FileHeart },
  { key: "complaints", label: "Complaints", icon: ShieldAlert },
  { key: "settings", label: "Settings", icon: UserCircle },
];

const EMERGENCY_CONTACTS = [
  { label: "Ambulance", number: "108", icon: AlertTriangle },
  { label: "Police", number: "100", icon: ShieldAlert },
  { label: "Fire Force", number: "101", icon: BellRing },
  { label: "National Emergency Helpline", number: "112", icon: PhoneCall },
  { label: "Health Helpline", number: "104", icon: HeartPulse },
  { label: "City Care Hospital", number: "+91 80 4567 8910", icon: Stethoscope },
  { label: "Sunrise Multispeciality Clinic", number: "+91 44 2789 1100", icon: ClipboardCheck },
  { label: "Metro Emergency Trauma Center", number: "+91 11 4300 2200", icon: Activity },
];

const emptySnapshot = {
  upcoming: [],
  recentConsultations: [],
  recordsCount: 0,
  prescriptionsCount: 0,
  notifications: [],
  appointmentTrend: [],
  activity: [],
};

const cardTransition = {
  type: "spring",
  stiffness: 250,
  damping: 24,
  mass: 0.9,
};
const MotionDiv = motion.div;

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isEmergencyVisible, setIsEmergencyVisible] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [snapshot, setSnapshot] = useState(emptySnapshot);

  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || "P";
  const firstName = useMemo(() => profile?.full_name?.split(" ")?.[0] || "Patient", [profile]);

  async function loadDashboardData(userId) {
    setDashboardLoading(true);

    const [bookingsRes, recordsRes] = await Promise.all([
      supabase
        .from("appointment_bookings")
        .select(`
          id,
          status,
          booked_at,
          appointments(date, time, profiles:doctor_id(full_name, speciality))
        `)
        .eq("patient_id", userId)
        .order("booked_at", { ascending: false })
        .limit(60),
      supabase
        .from("medical_records")
        .select(`
          id,
          title,
          created_at,
          prescriptions(id),
          doctor:profiles!medical_records_doctor_profiles_fkey(full_name, speciality)
        `)
        .eq("patient_id", userId)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const bookings = bookingsRes.data || [];
    const records = recordsRes.data || [];

    const now = new Date();
    const upcoming = bookings
      .filter((item) => {
        const status = (item.status || "").toLowerCase();
        const appointmentDate = item.appointments?.date;
        const appointmentTime = item.appointments?.time;
        if (!appointmentDate || !appointmentTime) return false;
        const slotDate = new Date(`${appointmentDate}T${appointmentTime}`);
        return ["booked", "upcoming", "active"].includes(status) && slotDate >= now;
      })
      .slice(0, 4);

    const recentConsultations = records.slice(0, 4);
    const prescriptionsCount = records.reduce((total, item) => total + (item.prescriptions?.length || 0), 0);

    const monthLabels = Array.from({ length: 6 }, (_, index) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - index));
      return d.toLocaleString("en-US", { month: "short" });
    });

    const monthMap = monthLabels.reduce((acc, month) => {
      acc[month] = { month, appointments: 0, wellness: 70 };
      return acc;
    }, {});

    bookings.forEach((item, idx) => {
      const slotDate = item.appointments?.date ? new Date(item.appointments.date) : null;
      if (!slotDate || Number.isNaN(slotDate.getTime())) return;
      const month = slotDate.toLocaleString("en-US", { month: "short" });
      if (!monthMap[month]) return;
      monthMap[month].appointments += 1;
      monthMap[month].wellness = Math.min(96, monthMap[month].wellness + (idx % 2 === 0 ? 4 : 2));
    });

    const appointmentTrend = monthLabels.map((month, idx) => ({
      month,
      appointments: monthMap[month].appointments,
      wellness: monthMap[month].wellness - (5 - idx),
    }));

    const activityFromBookings = bookings.slice(0, 4).map((item) => ({
      id: `booking-${item.id}`,
      title: `Appointment ${item.status || "updated"}`,
      detail: item.appointments?.profiles?.full_name
        ? `Dr. ${item.appointments.profiles.full_name}`
        : "Doctor updated",
      time: item.booked_at,
    }));

    const activityFromRecords = records.slice(0, 4).map((item) => ({
      id: `record-${item.id}`,
      title: item.title || "Medical record updated",
      detail: item.doctor?.full_name ? `Consulted by Dr. ${item.doctor.full_name}` : "Clinical note added",
      time: item.created_at,
    }));

    const activity = [...activityFromBookings, ...activityFromRecords]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);

    const notifications = [
      {
        id: "notif-upcoming",
        title: upcoming.length > 0 ? "Upcoming consultation" : "No upcoming consultations",
        detail:
          upcoming.length > 0
            ? `${new Date(`${upcoming[0].appointments.date}T${upcoming[0].appointments.time}`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} at ${upcoming[0].appointments.time.slice(0, 5)}`
            : "Book an appointment to stay proactive",
      },
      {
        id: "notif-record",
        title: `${records.length} medical records tracked`,
        detail: "Your clinical history is organized and accessible",
      },
      {
        id: "notif-rx",
        title: `${prescriptionsCount} active prescriptions logged`,
        detail: "Review dosage guidance in your prescription panel",
      },
    ];

    setSnapshot({
      upcoming,
      recentConsultations,
      recordsCount: records.length,
      prescriptionsCount,
      notifications,
      appointmentTrend,
      activity,
    });

    setDashboardLoading(false);
  }

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (!data || data.role !== "patient") {
        await supabase.auth.signOut();
        navigate("/login");
        return;
      }

      setProfile(data);

      const required = ["full_name", "age", "gender", "phone", "address", "blood_group", "emergency_contact"];
      const incomplete = required.some((field) => !data[field] || data[field].toString().trim() === "");
      if (incomplete) {
        navigate("/complete-profile");
        return;
      }

      await loadDashboardData(user.id);
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
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    if (!isEmergencyOpen) return;

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsEmergencyVisible(false);
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 font-redhat text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  const upcomingCount = snapshot.upcoming.length;
  const healthScore = Math.min(
    98,
    74 + snapshot.recordsCount * 2 + (snapshot.prescriptionsCount > 0 ? 6 : 0)
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3F8FC] font-redhat text-slate-800">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-[-140px] top-[20%] h-[440px] w-[440px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[30%] h-[380px] w-[380px] rounded-full bg-sky-100/60 blur-3xl" />
      </div>

      <div className="relative z-20 lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-cyan-100/80 bg-white/85 backdrop-blur-xl px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="rounded-xl border border-cyan-100 bg-white p-2 text-slate-600"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <img src={healthsyncLogo} alt="HealthSync" className="h-7 w-auto object-contain" />
          <span className="text-sm font-black tracking-wide text-cyan-700">Patient Suite</span>
        </div>
        <NotificationBell />
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform p-4 transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <MotionDiv
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-full flex-col overflow-hidden rounded-[30px] border border-cyan-100/80 bg-white/70 p-5 shadow-[0_32px_52px_-36px_rgba(15,23,42,0.65)] backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-10 top-[-20px] h-24 w-24 rounded-full bg-cyan-200/35 blur-2xl" />
            <div className="absolute right-[-26px] bottom-28 h-28 w-28 rounded-full bg-blue-200/35 blur-2xl" />
          </div>

          <div className="relative z-10 flex items-center gap-3 px-1 pb-8 pt-2">
            <img src={healthsyncLogo} alt="HealthSync" className="h-10 w-auto object-contain" />
            <div>
              <p className="text-lg font-black text-slate-900">HealthSync</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600">Patient Workspace</p>
            </div>
          </div>

          <nav className="relative z-10 flex-1 space-y-2 overflow-y-auto pr-1 no-scrollbar">
            {NAV.map(({ key, label, icon: Icon }, index) => {
              const isActive = activePage === key;
              return (
                <motion.button
                  key={key}
                  onClick={() => handleNav(key)}
                  whileHover={{ x: 4 }}
                  transition={cardTransition}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition-all ${
                    isActive
                      ? "border border-cyan-200/90 bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-[0_12px_24px_-16px_rgba(8,145,178,0.85)]"
                      : "border border-transparent text-slate-600 hover:border-cyan-100 hover:bg-white/80"
                  }`}
                  style={{ transitionDelay: `${index * 25}ms` }}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isActive ? "bg-white/20" : "bg-cyan-50 text-cyan-700"
                    }`}
                  >
                    {createElement(Icon, { size: 18 })}
                  </span>
                  <span>{label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="patient-nav-active"
                      className="absolute right-3 h-2 w-2 rounded-full bg-white"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          <div className="relative z-10 mt-5 space-y-3 border-t border-cyan-100/80 pt-5">
            <button
              onClick={openEmergencyModal}
              className="group w-full overflow-hidden rounded-2xl border border-red-300/70 bg-gradient-to-r from-red-500 to-rose-500 px-4 py-3 text-left text-sm font-black text-white shadow-[0_14px_24px_-16px_rgba(220,38,38,0.65)]"
              aria-haspopup="dialog"
              aria-expanded={isEmergencyOpen}
              aria-controls="emergency-assistance-dialog"
            >
              <span className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle size={16} /> Emergency Support
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">24/7</span>
              </span>
            </button>

            <PremiumCard className="rounded-[22px]" contentClassName="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-lg font-black text-white">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <motion.span
                    animate={{ opacity: [0.55, 1, 0.55], scale: [0.9, 1, 0.9] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-black text-slate-900">{profile.full_name}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-700">Patient</p>
                </div>
              </div>
              <button
                onClick={() => handleNav("settings")}
                className="mt-4 w-full rounded-full border border-cyan-200 bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                Go To Profile
              </button>
            </PremiumCard>

            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </MotionDiv>
      </aside>

      <main className="relative z-10 min-h-screen lg:ml-[280px]">
        <div className="px-4 pb-8 pt-20 lg:px-8 lg:pt-7 xl:px-10">
          <motion.header
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-4 z-30 mb-6 rounded-[24px] border border-cyan-100/80 bg-white/78 px-4 py-3 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] backdrop-blur-2xl lg:px-6"
          >
            <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              <div className="relative min-w-[220px] flex-1">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search appointments, records, or doctors"
                  className="w-full rounded-full border border-cyan-100 bg-white/90 py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/70"
                />
              </div>

              <div className="hidden rounded-full border border-cyan-100 bg-cyan-50/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700 md:block">
                Patient Command Center
              </div>

              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-cyan-100 bg-white px-2.5 py-1.5 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-sm font-black text-white">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <span className="hidden text-sm font-bold text-slate-700 sm:block">{firstName}</span>
                  <ChevronDown size={16} className="text-cyan-600" />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl border border-cyan-100 bg-white/96 p-2 shadow-xl"
                    >
                      <button
                        onClick={() => handleNav("settings")}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={logout}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.header>

          <div className="mx-auto w-full max-w-[1450px]">
            {activePage === "dashboard" && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-wrap items-end justify-between gap-3"
                >
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 lg:text-[2.2rem]">
                      Welcome back, {firstName}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500 lg:text-base">
                      Premium care overview with appointments, records, and AI-supported health insights.
                    </p>
                  </div>
                  <div className="rounded-full border border-cyan-100 bg-white/85 px-4 py-2 text-sm font-bold text-slate-600">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                  <div className="space-y-6 xl:col-span-8">
                    <PremiumCard contentClassName="p-7 lg:p-8">
                      <div className="relative overflow-hidden rounded-[20px] border border-cyan-100/80 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 p-6 text-white lg:p-8">
                        <div className="absolute inset-0">
                          <div className="absolute -left-12 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
                          <div className="absolute right-0 top-10 h-28 w-28 rounded-full bg-cyan-200/30 blur-2xl" />
                          <motion.div
                            className="absolute inset-0"
                            animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
                            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                              background:
                                "linear-gradient(110deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 45%, rgba(224,242,254,0.28) 100%)",
                            }}
                          />
                        </div>

                        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                          <div className="max-w-xl">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Health Performance Hub</p>
                            <h2 className="mt-2 text-2xl font-black leading-tight lg:text-[1.85rem]">
                              Keep every consultation, record, and prescription aligned.
                            </h2>
                            <p className="mt-2 text-sm font-medium text-cyan-100/95 lg:text-base">
                              {upcomingCount > 0
                                ? `${upcomingCount} appointment${upcomingCount > 1 ? "s" : ""} scheduled.`
                                : "No upcoming consultations. Book your next appointment today."}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={cardTransition}
                            onClick={() => handleNav("appointments")}
                            className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/95 px-5 py-2.5 text-sm font-bold text-cyan-700 shadow-lg"
                          >
                            Book Appointment <ArrowUpRight size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </PremiumCard>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        { label: "Upcoming Appointments", value: upcomingCount, icon: CalendarCheck },
                        { label: "Medical Records", value: snapshot.recordsCount, icon: FileHeart },
                        { label: "Prescriptions", value: snapshot.prescriptionsCount, icon: FileText },
                        { label: "Wellness Score", value: `${healthScore}%`, icon: HeartPulse },
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <PremiumCard key={item.label} delay={index * 0.04} contentClassName="p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
                              </div>
                              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-2.5 text-cyan-700">
                                {createElement(Icon, { size: 18 })}
                              </div>
                            </div>
                          </PremiumCard>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <PremiumCard contentClassName="p-6">
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-900">Upcoming Appointments</h3>
                          <button
                            onClick={() => handleNav("myappointments")}
                            className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-700"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-3">
                          {dashboardLoading
                            ? Array.from({ length: 3 }).map((_, idx) => (
                                <div key={`loading-upcoming-${idx}`} className="h-[74px] animate-pulse rounded-2xl bg-cyan-50/70" />
                              ))
                            : snapshot.upcoming.length > 0
                            ? snapshot.upcoming.map((appointment) => (
                                <motion.div
                                  key={appointment.id}
                                  whileHover={{ x: 2 }}
                                  transition={cardTransition}
                                  className="rounded-2xl border border-cyan-100 bg-white/90 p-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-black text-slate-900">
                                        Dr. {appointment.appointments?.profiles?.full_name || "Physician"}
                                      </p>
                                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
                                        {appointment.appointments?.profiles?.speciality || "General Care"}
                                      </p>
                                    </div>
                                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-700">
                                      {appointment.status || "Booked"}
                                    </span>
                                  </div>
                                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <Clock3 size={14} className="text-cyan-600" />
                                    <span>
                                      {new Date(`${appointment.appointments.date}T${appointment.appointments.time}`).toLocaleString(
                                        "en-US",
                                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                                      )}
                                    </span>
                                  </div>
                                </motion.div>
                              ))
                            : (
                              <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/30 p-6 text-center text-sm font-semibold text-slate-500">
                                No upcoming appointments.
                              </div>
                            )}
                        </div>
                      </PremiumCard>

                      <PremiumCard contentClassName="p-6">
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-900">Health Analytics</h3>
                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-700">
                            Trend
                          </span>
                        </div>
                        <div className="h-[248px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={snapshot.appointmentTrend} margin={{ top: 14, right: 8, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="wellnessGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
                                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.01} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="4 8" stroke="#dbeafe" vertical={false} />
                              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                              <Tooltip
                                contentStyle={{
                                  borderRadius: "14px",
                                  border: "1px solid #bae6fd",
                                  backgroundColor: "rgba(255,255,255,0.96)",
                                  boxShadow: "0 10px 26px -18px rgba(15,23,42,0.5)",
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="appointments"
                                stroke="#06b6d4"
                                strokeWidth={2.5}
                                fill="url(#appointmentsGradient)"
                              />
                              <Area
                                type="monotone"
                                dataKey="wellness"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="url(#wellnessGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </PremiumCard>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <PremiumCard contentClassName="p-6">
                        <div className="mb-4 flex items-center gap-2">
                          <Brain size={18} className="text-cyan-700" />
                          <h3 className="text-lg font-black text-slate-900">AI Health Insights</h3>
                        </div>
                        <div className="space-y-3">
                          {[
                            `Your consistency score improved to ${healthScore}% this cycle.`,
                            "Keep hydration and sleep logs updated for stronger diagnostics.",
                            "One preventive follow-up is recommended this month.",
                          ].map((line) => (
                            <div key={line} className="rounded-2xl border border-cyan-100 bg-cyan-50/45 p-3 text-sm font-semibold text-slate-600">
                              {line}
                            </div>
                          ))}
                        </div>
                      </PremiumCard>

                      <PremiumCard contentClassName="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-900">Recent Consultations</h3>
                          <button
                            onClick={() => handleNav("prescriptions")}
                            className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-700"
                          >
                            Open
                          </button>
                        </div>
                        <div className="space-y-3">
                          {dashboardLoading
                            ? Array.from({ length: 3 }).map((_, idx) => (
                                <div key={`loading-consultation-${idx}`} className="h-[72px] animate-pulse rounded-2xl bg-cyan-50/70" />
                              ))
                            : snapshot.recentConsultations.length > 0
                            ? snapshot.recentConsultations.map((item) => (
                                <div key={item.id} className="rounded-2xl border border-cyan-100 bg-white/95 p-4">
                                  <p className="text-sm font-black text-slate-900">{item.title || "Consultation"}</p>
                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    {item.doctor?.full_name ? `Dr. ${item.doctor.full_name}` : "Clinical team"}
                                  </p>
                                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
                                    {new Date(item.created_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              ))
                            : (
                              <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/30 p-6 text-center text-sm font-semibold text-slate-500">
                                Consultation history will appear here.
                              </div>
                            )}
                        </div>
                      </PremiumCard>
                    </div>
                  </div>

                  <div className="space-y-6 xl:col-span-4">
                    <PremiumCard contentClassName="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-cyan-200 bg-gradient-to-br from-cyan-500 to-sky-600 text-xl font-black text-white shadow-md">
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                            ) : (
                              initial
                            )}
                          </div>
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5], scale: [0.86, 1, 0.86] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-black text-slate-900">{profile.full_name}</p>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">Patient</p>
                          <button
                            onClick={() => handleNav("settings")}
                            className="mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md"
                          >
                            Go To Profile
                          </button>
                        </div>
                      </div>
                    </PremiumCard>

                    <PremiumCard contentClassName="p-6">
                      <h3 className="text-lg font-black text-slate-900">Health Summary</h3>
                      <div className="mt-4 space-y-3">
                        {[
                          { label: "Blood Group", value: profile.blood_group || "N/A" },
                          { label: "Age", value: profile.age || "N/A" },
                          { label: "Gender", value: profile.gender || "N/A" },
                          { label: "Phone", value: profile.phone || "N/A" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-xl border border-cyan-100 bg-cyan-50/35 px-3.5 py-2.5">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{item.label}</span>
                            <span className="text-sm font-black text-slate-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </PremiumCard>

                    <PremiumCard contentClassName="p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <BellRing size={17} className="text-cyan-700" />
                        <h3 className="text-lg font-black text-slate-900">Notifications</h3>
                      </div>
                      <div className="space-y-3">
                        {snapshot.notifications.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-cyan-100 bg-white/90 p-3.5">
                            <p className="text-sm font-black text-slate-900">{item.title}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </PremiumCard>

                    <PremiumCard contentClassName="p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-cyan-700" />
                        <h3 className="text-lg font-black text-slate-900">Activity Timeline</h3>
                      </div>
                      <div className="space-y-3">
                        {snapshot.activity.length > 0 ? (
                          snapshot.activity.map((item) => (
                            <div key={item.id} className="flex gap-3 rounded-2xl border border-cyan-100 bg-white/90 p-3">
                              <div className="mt-1 text-cyan-600">
                                <CircleDot size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">{item.title}</p>
                                <p className="text-xs font-semibold text-slate-500">{item.detail}</p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
                                  {new Date(item.time).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/30 p-5 text-center text-sm font-semibold text-slate-500">
                            Activity will appear here after your first interaction.
                          </p>
                        )}
                      </div>
                    </PremiumCard>
                  </div>
                </div>
              </div>
            )}

            {activePage === "appointments" && <Appointments />}
            {activePage === "myappointments" && <MyAppointments />}
            {activePage === "prescriptions" && <Prescriptions />}
            {activePage === "settings" && <PatientProfile />}
            {activePage === "chat" && <ChatList />}
            {activePage === "complaints" && <PatientComplaints />}
            {activePage === "records" && <MedicalRecords />}
          </div>
        </div>
      </main>

      {isEmergencyOpen && (
        <div
          className={`fixed inset-0 z-[80] flex items-center justify-center p-4 transition-all duration-200 ${
            isEmergencyVisible ? "bg-slate-900/45 opacity-100 backdrop-blur-sm" : "bg-slate-900/0 opacity-0"
          }`}
          onClick={closeEmergencyModal}
        >
          <div
            id="emergency-assistance-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-assistance-title"
            className={`w-full max-w-3xl overflow-hidden rounded-[30px] border border-red-200 bg-white shadow-[0_42px_80px_-38px_rgba(15,23,42,0.7)] transition-all duration-200 ${
              isEmergencyVisible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-red-500 to-rose-500 px-6 py-5 text-white">
              <div>
                <h2 id="emergency-assistance-title" className="text-2xl font-black">
                  Emergency Assistance
                </h2>
                <p className="mt-1 text-sm font-semibold text-red-100">Critical contact numbers available at all times</p>
              </div>
              <button
                onClick={closeEmergencyModal}
                className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
                aria-label="Close emergency assistance"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[68vh] space-y-3 overflow-y-auto p-6 no-scrollbar">
              {EMERGENCY_CONTACTS.map(({ label, number, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50/65 px-4 py-3.5"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-red-500">{label}</p>
                    <a href={`tel:${number.replace(/\s+/g, "")}`} className="mt-1 block text-lg font-black text-slate-900">
                      {number}
                    </a>
                  </div>
                  <a
                    href={`tel:${number.replace(/\s+/g, "")}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
                    aria-label={`Call ${label}`}
                  >
                    {createElement(Icon, { size: 18 })}
                  </a>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={closeEmergencyModal}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800"
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
