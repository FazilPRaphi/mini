import { useState, useEffect, useMemo, createElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  ShieldAlert,
  UserCircle,
  ChevronDown,
  Search,
  Stethoscope,
} from "lucide-react";
import healthsyncLogo from "../../assets/healthsync-logo.png";
import Profile from "./Profile";
import AppointmentCreator from "./AppointmentCreator";
import DoctorAppointments from "./DoctorAppointments";
import DoctorConsultation from "./DoctorConsultation";
import ChatList from "../../components/ChatList";
import DoctorComplaints from "./DoctorComplaints";
import DoctorDashboardHome from "./DoctorDashboardHome";
import NotificationBell from "../../components/NotificationBell";
import PremiumCard from "../../components/dashboard/PremiumCard";
import { supabase } from "../../supabaseClient";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "appointments", label: "Booked Patients", icon: Users },
  { key: "prescriptions", label: "Consultations", icon: Clock },
  { key: "availability", label: "Availability", icon: Calendar },
  { key: "chats", label: "Chats", icon: MessageSquare },
  { key: "complaints", label: "Complaints", icon: ShieldAlert },
  { key: "profile", label: "Profile", icon: UserCircle },
];

const hoverSpring = {
  type: "spring",
  stiffness: 260,
  damping: 23,
  mass: 0.9,
};
const MotionDiv = motion.div;

const DoctorDashboard = () => {
  const [active, setActive] = useState("dashboard");
  const [doctorProfile, setDoctorProfile] = useState({ full_name: "Doctor", speciality: "" });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initial = doctorProfile.full_name?.charAt(0)?.toUpperCase() || "D";
  const firstName = useMemo(
    () => doctorProfile.full_name?.split(" ")?.[0] || "Doctor",
    [doctorProfile.full_name]
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (!profile || profile.role !== "doctor") {
        await supabase.auth.signOut();
        window.location.href = "/login";
        return;
      }
      setDoctorProfile(profile);

      const required = ["full_name", "institution", "speciality"];
      const incomplete = required.some((f) => !profile[f] || profile[f].toString().trim() === "");
      if (incomplete) window.location.href = "/complete-profile";
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleNav = (key) => {
    setActive(key);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3F8FC] font-redhat text-slate-800">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-110px] h-[420px] w-[420px] rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute right-[-120px] top-[15%] h-[420px] w-[420px] rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[35%] h-[320px] w-[320px] rounded-full bg-sky-100/70 blur-3xl" />
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
          <span className="text-sm font-black tracking-wide text-cyan-700">Doctor Suite</span>
        </div>
        <NotificationBell />
      </div>

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
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
          className="relative flex h-full flex-col overflow-hidden rounded-[30px] border border-cyan-100/80 bg-white/72 p-5 shadow-[0_32px_52px_-36px_rgba(15,23,42,0.65)] backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-10 top-[-20px] h-24 w-24 rounded-full bg-cyan-200/35 blur-2xl" />
            <div className="absolute right-[-24px] bottom-28 h-28 w-28 rounded-full bg-blue-200/35 blur-2xl" />
          </div>

          <div className="relative z-10 flex items-center gap-3 px-1 pb-8 pt-2">
            <img src={healthsyncLogo} alt="HealthSync" className="h-10 w-auto object-contain" />
            <div>
              <p className="text-lg font-black text-slate-900">HealthSync</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600">Doctor Workspace</p>
            </div>
          </div>

          <nav className="relative z-10 flex-1 space-y-2 overflow-y-auto pr-1 no-scrollbar">
            {NAV.map(({ key, label, icon: Icon }, index) => {
              const isActive = active === key;
              return (
                <motion.button
                  key={key}
                  onClick={() => handleNav(key)}
                  whileHover={{ x: 4 }}
                  transition={hoverSpring}
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
                      layoutId="doctor-nav-active"
                      className="absolute right-3 h-2 w-2 rounded-full bg-white"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          <div className="relative z-10 mt-5 space-y-3 border-t border-cyan-100/80 pt-5">
            <PremiumCard className="rounded-[22px]" contentClassName="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-lg font-black text-white">
                    {doctorProfile.avatar_url ? (
                      <img src={doctorProfile.avatar_url} alt="Doctor avatar" className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <motion.span
                    animate={{ opacity: [0.55, 1, 0.55], scale: [0.88, 1, 0.88] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-black text-slate-900">{doctorProfile.full_name}</p>
                  <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-700">Doctor</p>
                </div>
              </div>
              <button
                onClick={() => handleNav("profile")}
                className="mt-4 w-full rounded-full border border-cyan-200 bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                Go To Profile
              </button>
            </PremiumCard>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={16} />
              Logout
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
                  placeholder="Search patients, consultations, or schedules"
                  className="w-full rounded-full border border-cyan-100 bg-white/90 py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/70"
                />
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700 md:inline-flex">
                <Stethoscope size={13} /> Medical Command Center
              </div>

              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-cyan-100 bg-white px-2.5 py-1.5 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-sm font-black text-white">
                    {doctorProfile.avatar_url ? (
                      <img src={doctorProfile.avatar_url} alt={doctorProfile.full_name} className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <span className="hidden text-sm font-bold text-slate-700 sm:block">Dr. {firstName}</span>
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
                        onClick={() => handleNav("profile")}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={handleLogout}
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
            {active === "dashboard" && <DoctorDashboardHome onNavigate={handleNav} profile={doctorProfile} />}
            {active === "profile" && (
              <Profile
                defaultEditing={false}
                initialProfile={doctorProfile}
                onUpdate={(newProfile) => setDoctorProfile(newProfile)}
              />
            )}
            {active === "availability" && <AppointmentCreator />}
            {active === "appointments" && <DoctorAppointments onNavigate={handleNav} />}
            {active === "prescriptions" && <DoctorConsultation />}
            {active === "chats" && <ChatList />}
            {active === "complaints" && <DoctorComplaints />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
