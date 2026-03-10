import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { Calendar, Clock, User, CheckCircle, ChevronRight, Users, Activity, Video } from "lucide-react";

const DoctorAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalActive: 0, pending: 0, completed: 0 });

  const loadBookings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("appointment_bookings")
      .select(`
                id,
                doctor_id,
                booked_at,
                status,
                queue_position,
                consultation_started,
                consultation_completed,
                call_room,
                patient_id,
                appointment_id,
                appointments(date, time),
                profiles:patient_id(full_name, age, gender)
            `)
      .eq("doctor_id", user.id)
      .order("booked_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setBookings(data || []);
      const active = data?.filter(b => b.status === "booked" || b.status === "Upcoming").length || 0;
      const comp = data?.filter(b => b.status === "Completed" || b.consultation_completed).length || 0;
      setStats({ totalActive: active, pending: active, completed: comp });
    }
    setLoading(false);
  };

  useEffect(() => { loadBookings(); }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <div className="h-full flex flex-col font-redhat animate-fadeIn overflow-hidden">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Clinical Registry</h1>
          <p className="text-gray-500 font-medium">Detailed log of all patient appointments and consultation history.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Load</span>
            <span className="text-sm font-black text-[#0BC5EA] uppercase tracking-tighter">{stats.totalActive} Patients in Queue</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#0BC5EA]">
            <Activity size={20} className="animate-pulse" />
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: "Pending", val: stats.pending, color: "text-orange-500", bg: "bg-orange-50", icon: Clock },
          { label: "Completed", val: stats.completed, color: "text-green-500", bg: "bg-green-50", icon: CheckCircle },
          { label: "Revenue Est.", val: `$${stats.completed * 50}`, color: "text-purple-500", bg: "bg-purple-50", icon: Activity },
        ].map((s, i) => (
          <div key={i} className="seba-card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
              <div className="text-xl font-black text-gray-900">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="seba-card flex-1 p-8 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-[#0BC5EA] shadow-inner">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Full Registry</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Registry...</div>
          ) : bookings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 py-20">
              <Calendar size={48} className="mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">No records found</p>
            </div>
          ) : (
            bookings.map(b => (
              <div key={b.id} className="group flex items-center gap-6 p-5 bg-white border border-gray-100 rounded-3xl hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-colors font-black text-lg">
                  {b.profiles?.full_name?.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-gray-900 truncate">{b.profiles?.full_name}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${b.status === "Completed" || b.consultation_completed ? "bg-green-100 text-green-700" : "bg-cyan-100 text-cyan-700"
                      }`}>
                      {b.status === "booked" ? "Upcoming" : b.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[1px]">
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-300" /> {b.appointments?.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-300" /> {formatTime(b.appointments?.time)}</span>
                    <span className="flex items-center gap-1.5"><User size={12} className="text-gray-300" /> {b.profiles?.age}y • {b.profiles?.gender}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {b.call_room && (
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 border border-green-100">
                      <Video size={18} />
                    </div>
                  )}
                  <div className="p-2 text-gray-200 group-hover:text-cyan-200 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;