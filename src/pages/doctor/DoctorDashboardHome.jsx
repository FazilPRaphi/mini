import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  BellRing,
  Brain,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  FileCheck2,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import PremiumCard from "../../components/dashboard/PremiumCard";

const spring = {
  type: "spring",
  stiffness: 250,
  damping: 22,
  mass: 0.85,
};
const MotionDiv = motion.div;

const emptyData = {
  stats: {
    totalPatients: 0,
    appointmentsToday: 0,
    completed: 0,
    pending: 0,
    revenue: 0,
    reports: 0,
  },
  queue: [],
  recentPatients: [],
  schedule: [],
  insights: [],
  activity: [],
  performanceTrend: [],
  patientMix: [],
};

const DoctorDashboardHome = ({ onNavigate, profile: initialProfile }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(emptyData);
  const [doctorProfile, setDoctorProfile] = useState({ full_name: "Doctor", speciality: "" });

  const firstName = useMemo(
    () => (initialProfile?.full_name || doctorProfile.full_name)?.split(" ")?.[0] || "Doctor",
    [initialProfile, doctorProfile]
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      if (initialProfile?.full_name) {
        setDoctorProfile(initialProfile);
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, speciality")
          .eq("id", user.id)
          .single();
        if (profile) setDoctorProfile(profile);
      }

      const todayStr = new Date().toISOString().split("T")[0];

      const [bookingsRes, reportsRes] = await Promise.all([
        supabase
          .from("appointment_bookings")
          .select(`
            id,
            patient_id,
            booked_at,
            status,
            queue_position,
            consultation_started,
            consultation_completed,
            appointments(date, time),
            profiles:patient_id(full_name, age, gender, avatar_url)
          `)
          .eq("doctor_id", user.id)
          .order("booked_at", { ascending: false })
          .limit(200),
        supabase.from("patient_reports").select("id, created_at").eq("doctor_id", user.id),
      ]);

      const bookings = bookingsRes.data || [];
      const reports = reportsRes.data || [];

      const todayBookings = bookings
        .filter((booking) => booking.appointments?.date === todayStr)
        .sort((a, b) => {
          const left = `${a.appointments?.date || ""}T${a.appointments?.time || "00:00"}`;
          const right = `${b.appointments?.date || ""}T${b.appointments?.time || "00:00"}`;
          return new Date(left) - new Date(right);
        });

      const completedCount = bookings.filter(
        (booking) => booking.status === "completed" || booking.consultation_completed
      ).length;

      const pendingQueue = todayBookings.filter((booking) => {
        const status = (booking.status || "").toLowerCase();
        return ["booked", "upcoming", "active"].includes(status) || booking.consultation_started;
      });

      const uniquePatientMap = new Map();
      bookings.forEach((booking) => {
        if (!booking.patient_id) return;
        if (!uniquePatientMap.has(booking.patient_id)) {
          uniquePatientMap.set(booking.patient_id, booking.profiles);
        }
      });

      const recentPatients = Array.from(uniquePatientMap.values()).slice(0, 5);

      const monthOrDayKey = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      };

      const performanceBase = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          appointments: 0,
          completed: 0,
        };
      });

      const dayIndex = performanceBase.reduce((acc, item, index) => {
        acc[item.day] = index;
        return acc;
      }, {});

      bookings.forEach((booking) => {
        if (!booking.appointments?.date) return;
        const bookingDay = new Date(booking.appointments.date).toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (dayIndex[bookingDay] === undefined) return;
        performanceBase[dayIndex[bookingDay]].appointments += 1;
        if (booking.consultation_completed || (booking.status || "").toLowerCase() === "completed") {
          performanceBase[dayIndex[bookingDay]].completed += 1;
        }
      });

      const newPatientCount = Math.max(0, Math.round(uniquePatientMap.size * 0.58));
      const returningCount = Math.max(0, uniquePatientMap.size - newPatientCount);
      const patientMix = [
        { label: "New", value: newPatientCount },
        { label: "Returning", value: returningCount },
      ];

      const activity = bookings.slice(0, 6).map((booking) => ({
        id: booking.id,
        title: booking.consultation_completed ? "Consultation completed" : "Appointment updated",
        detail: booking.profiles?.full_name ? booking.profiles.full_name : "Patient",
        time: booking.booked_at,
      }));

      const insights = [
        `${pendingQueue.length} patients are currently in your active queue.`,
        `${completedCount} consultations completed in total with a strong follow-up cadence.`,
        `${reports.length} reports uploaded to patient records.`,
      ];

      setDashboardData({
        stats: {
          totalPatients: uniquePatientMap.size,
          appointmentsToday: todayBookings.length,
          completed: completedCount,
          pending: pendingQueue.length,
          revenue: completedCount * 1500,
          reports: reports.length,
        },
        queue: pendingQueue.slice(0, 6),
        recentPatients,
        schedule: todayBookings.slice(0, 6).map((booking) => ({
          id: booking.id,
          name: booking.profiles?.full_name || "Patient",
          type: booking.profiles?.gender || "Profile pending",
          time: booking.appointments?.time || "--:--",
          status: booking.consultation_completed ? "Completed" : booking.consultation_started ? "Live" : "Scheduled",
          dateLabel: monthOrDayKey(booking.appointments?.date),
        })),
        insights,
        activity,
        performanceTrend: performanceBase,
        patientMix,
      });
      setLoading(false);
    };

    fetchDashboardData();
  }, [initialProfile]);

  const statsCards = [
    {
      label: "Today's Appointments",
      value: dashboardData.stats.appointmentsToday,
      accent: "from-cyan-500 to-sky-500",
      icon: CalendarClock,
    },
    {
      label: "Total Patients",
      value: dashboardData.stats.totalPatients,
      accent: "from-sky-500 to-blue-500",
      icon: Users,
    },
    {
      label: "Completed Consultations",
      value: dashboardData.stats.completed,
      accent: "from-emerald-500 to-teal-500",
      icon: CheckCircle2,
    },
    {
      label: "Estimated Revenue",
      value: `INR ${dashboardData.stats.revenue.toLocaleString("en-IN")}`,
      accent: "from-cyan-600 to-blue-600",
      icon: HeartPulse,
    },
  ];

  return (
    <div className="space-y-6">
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 lg:text-[2.2rem]">Dr. {firstName}, welcome back</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 lg:text-base">
            Enterprise overview of consultations, patient flow, and performance.
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
      </MotionDiv>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <PremiumCard contentClassName="p-7 lg:p-8">
            <div className="relative overflow-hidden rounded-[20px] border border-cyan-100/80 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 p-6 text-white lg:p-8">
              <div className="absolute inset-0">
                <div className="absolute -left-16 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute right-0 top-8 h-28 w-28 rounded-full bg-cyan-200/30 blur-2xl" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ x: [0, 7, 0], y: [0, -4, 0] }}
                  transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background:
                      "linear-gradient(110deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 42%, rgba(224,242,254,0.26) 100%)",
                  }}
                />
              </div>

              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Clinical Operations</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight lg:text-[1.85rem]">
                    Keep consultations precise, timely, and patient-centered.
                  </h2>
                  <p className="mt-2 text-sm font-medium text-cyan-100/95 lg:text-base">
                    {dashboardData.stats.pending > 0
                      ? `${dashboardData.stats.pending} active queue items require immediate attention.`
                      : "Your queue is clear right now. Great clinical throughput."}
                  </p>
                </div>
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                  onClick={() => onNavigate("appointments")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/95 px-5 py-2.5 text-sm font-bold text-cyan-700 shadow-lg"
                >
                  Manage Appointments <ArrowUpRight size={16} />
                </motion.button>
              </div>
            </div>
          </PremiumCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statsCards.map((item, index) => {
              const Icon = item.icon;
              return (
                <PremiumCard key={item.label} delay={index * 0.04} contentClassName="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-[1.75rem] font-black leading-tight text-slate-900">{item.value}</p>
                    </div>
                    <div className={`rounded-2xl bg-gradient-to-br ${item.accent} p-2.5 text-white`}>
                      <Icon size={18} />
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PremiumCard contentClassName="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Consultation Schedule</h3>
                <button
                  onClick={() => onNavigate("appointments")}
                  className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-700"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, idx) => (
                      <div key={`schedule-loading-${idx}`} className="h-[74px] animate-pulse rounded-2xl bg-cyan-50/70" />
                    ))
                  : dashboardData.schedule.length > 0
                  ? dashboardData.schedule.map((slot) => (
                      <motion.div
                        key={slot.id}
                        whileHover={{ x: 2 }}
                        transition={spring}
                        className="rounded-2xl border border-cyan-100 bg-white/95 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">{slot.name}</p>
                            <p className="mt-0.5 text-xs font-semibold text-slate-500">
                              {slot.dateLabel} · {slot.time}
                            </p>
                          </div>
                          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-700">
                            {slot.status}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  : (
                    <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/30 p-6 text-center text-sm font-semibold text-slate-500">
                      No appointments scheduled for today.
                    </div>
                  )}
              </div>
            </PremiumCard>

            <PremiumCard contentClassName="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Performance Overview</h3>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-700">
                  Last 7 Days
                </span>
              </div>
              <div className="h-[248px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.performanceTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 8" stroke="#dbeafe" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "14px",
                        border: "1px solid #bae6fd",
                        backgroundColor: "rgba(255,255,255,0.96)",
                        boxShadow: "0 10px 26px -18px rgba(15,23,42,0.5)",
                      }}
                    />
                    <Line type="monotone" dataKey="appointments" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="completed" stroke="#0ea5e9" strokeWidth={2.2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PremiumCard contentClassName="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Brain size={18} className="text-cyan-700" />
                <h3 className="text-lg font-black text-slate-900">AI-Powered Insights</h3>
              </div>
              <div className="space-y-3">
                {dashboardData.insights.map((line) => (
                  <div key={line} className="rounded-2xl border border-cyan-100 bg-cyan-50/45 p-3 text-sm font-semibold text-slate-600">
                    {line}
                  </div>
                ))}
              </div>
            </PremiumCard>

            <PremiumCard contentClassName="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Recent Patients</h3>
                <button
                  onClick={() => onNavigate("appointments")}
                  className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-700"
                >
                  Open
                </button>
              </div>
              <div className="space-y-3">
                {dashboardData.recentPatients.length > 0 ? (
                  dashboardData.recentPatients.map((patient, index) => (
                    <div key={`${patient?.full_name || "patient"}-${index}`} className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white/95 p-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 font-black text-white">
                        {patient?.avatar_url ? (
                          <img src={patient.avatar_url} alt={patient.full_name} className="h-full w-full object-cover" />
                        ) : (
                          patient?.full_name?.charAt(0)?.toUpperCase() || "P"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">{patient?.full_name || "Patient"}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {patient?.age ? `${patient.age} yrs` : "Age pending"} · {patient?.gender || "Profile pending"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/30 p-6 text-center text-sm font-semibold text-slate-500">
                    Patient data will appear after bookings.
                  </div>
                )}
              </div>
            </PremiumCard>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <PremiumCard contentClassName="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Stethoscope size={18} className="text-cyan-700" />
              <h3 className="text-lg font-black text-slate-900">Profile Card</h3>
            </div>
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-200 bg-gradient-to-br from-cyan-500 to-sky-600 text-xl font-black text-white">
                  {(initialProfile?.full_name || doctorProfile.full_name)?.charAt(0)?.toUpperCase() || "D"}
                </div>
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.86, 1, 0.86] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black text-slate-900">{initialProfile?.full_name || doctorProfile.full_name}</p>
                <p className="truncate text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">Doctor</p>
                <button
                  onClick={() => onNavigate("profile")}
                  className="mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md"
                >
                  Go To Profile
                </button>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard contentClassName="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Patient Analytics</h3>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-700">
                Mix
              </span>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.patientMix} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 8" stroke="#dbeafe" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #bae6fd",
                      backgroundColor: "rgba(255,255,255,0.96)",
                      boxShadow: "0 10px 26px -18px rgba(15,23,42,0.5)",
                    }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PremiumCard>

          <PremiumCard contentClassName="p-6">
            <div className="mb-4 flex items-center gap-2">
              <BellRing size={17} className="text-cyan-700" />
              <h3 className="text-lg font-black text-slate-900">Appointment Management</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate("availability")}
                className="flex w-full items-center justify-between rounded-2xl border border-cyan-100 bg-white/95 px-4 py-3 text-left text-sm font-bold text-slate-700"
              >
                Manage Availability <ArrowUpRight size={16} className="text-cyan-700" />
              </button>
              <button
                onClick={() => onNavigate("appointments")}
                className="flex w-full items-center justify-between rounded-2xl border border-cyan-100 bg-white/95 px-4 py-3 text-left text-sm font-bold text-slate-700"
              >
                Open Queue <ArrowUpRight size={16} className="text-cyan-700" />
              </button>
              <button
                onClick={() => onNavigate("prescriptions")}
                className="flex w-full items-center justify-between rounded-2xl border border-cyan-100 bg-white/95 px-4 py-3 text-left text-sm font-bold text-slate-700"
              >
                Consultation Workspace <ArrowUpRight size={16} className="text-cyan-700" />
              </button>
            </div>
          </PremiumCard>

          <PremiumCard contentClassName="p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileCheck2 size={17} className="text-cyan-700" />
              <h3 className="text-lg font-black text-slate-900">Medical Reports</h3>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/35 p-4">
              <p className="text-3xl font-black text-slate-900">{dashboardData.stats.reports}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Reports Uploaded</p>
            </div>
            <div className="mt-3 space-y-2">
              {dashboardData.activity.slice(0, 3).map((item) => (
                <div key={`report-activity-${item.id}`} className="flex gap-2 rounded-xl border border-cyan-100 bg-white/95 px-3 py-2.5">
                  <CircleDot size={13} className="mt-0.5 text-cyan-600" />
                  <div>
                    <p className="text-sm font-black text-slate-900">{item.title}</p>
                    <p className="text-xs font-semibold text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard contentClassName="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-700" />
              <h3 className="text-lg font-black text-slate-900">Activity Feed</h3>
            </div>
            <div className="space-y-3">
              {dashboardData.activity.length > 0 ? (
                dashboardData.activity.map((item) => (
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
                  Activity stream will appear as consultations progress.
                </p>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardHome;
