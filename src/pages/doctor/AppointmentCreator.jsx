import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { Plus, Calendar, Clock, Users, Trash2, ChevronRight, Activity } from "lucide-react";

const AppointmentCreator = () => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxPatients, setMaxPatients] = useState(5);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);

  const loadSlots = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("appointments")
      .select("*, appointment_bookings(id)")
      .eq("doctor_id", user.id)
      .gte("date", today)
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    if (!error) setSlots(data || []);
  };

  useEffect(() => { loadSlots(); }, []);

  const createSlot = async () => {
    if (!date) return toast.error("Please select a date");
    if (!startTime) return toast.error("Please enter start time");
    if (!endTime) return toast.error("Please enter end time");

    const selectedDate = new Date(date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return toast.error("Cannot create slots in the past");

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const formattedStartTime = startTime.includes(":") && startTime.split(":").length === 2 ? startTime + ":00" : startTime;
    const formattedEndTime = endTime.includes(":") && endTime.split(":").length === 2 ? endTime + ":00" : endTime;

    const { data: existing } = await supabase.from("appointments").select("id")
      .eq("doctor_id", user.id).eq("date", date).eq("time", formattedStartTime).maybeSingle();
    if (existing) { setLoading(false); return toast.error("Slot already exists"); }

    const { error } = await supabase.from("appointments").insert({
      doctor_id: user.id,
      date,
      time: formattedStartTime,
      end_time: formattedEndTime,
      max_patients: maxPatients
    });

    if (error) toast.error(error.message);
    else { toast.success("Slot established!"); loadSlots(); resetForm(); }
    setLoading(false);
  };

  const resetForm = () => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setMaxPatients(5);
  };

  const deleteSlot = async (id) => {
    if (!confirm("Remove this clinical slot?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Slot removed"); loadSlots(); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      month: d.toLocaleString("en", { month: "short" }).toUpperCase(),
      day: d.getDate(),
      weekday: d.toLocaleString("en", { weekday: "long" })
    };
  };

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
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Availability Management</h1>
          <p className="text-gray-500 font-medium mt-1">Configure and manage your clinical consultation hours.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <Activity size={18} className="text-[#0BC5EA]" />
          <span className="text-sm font-black text-gray-700 uppercase tracking-widest">{slots.length} Active Slots</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        {/* Control Panel */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
          <div className="seba-card p-8 flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-[#0BC5EA] shadow-inner">
                <Plus size={24} />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Create New Slot</h2>
            </div>

            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Date</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0BC5EA] transition-colors">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none ring-0 focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Start Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold outline-none ring-0 focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">End Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold outline-none ring-0 focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Max Patients</label>
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                  <button
                    onClick={() => setMaxPatients(p => Math.max(1, p - 1))}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:shadow-md transition-all shadow-sm"
                  >–</button>
                  <div className="flex-1 text-center font-black text-lg text-gray-700">{maxPatients}</div>
                  <button
                    onClick={() => setMaxPatients(p => p + 1)}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-green-500 hover:shadow-md transition-all shadow-sm"
                  >+</button>
                </div>
              </div>

              <button
                onClick={createSlot}
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-[#0BC5EA] to-[#00B5D8] text-white rounded-[20px] font-black text-sm uppercase tracking-[2px] shadow-xl shadow-cyan-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
              >
                <Plus size={20} strokeWidth={3} />
                {loading ? "ESTABLISHING..." : "Add Consultation Slot"}
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Panel */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 overflow-hidden">
          <div className="seba-card flex-1 p-8 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#9B51E0] shadow-inner">
                  <Clock size={24} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Upcoming Slots</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
              {slots.map(slot => {
                const { month, day, weekday } = formatDate(slot.date);
                const booked = slot.appointment_bookings?.length || 0;
                const isFull = booked >= slot.max_patients;

                return (
                  <div key={slot.id} className="group flex items-center gap-6 p-5 bg-white border border-gray-100 rounded-3xl hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/20 transition-all animate-fadeIn">
                    <div className="w-16 h-20 rounded-2xl flex flex-col bg-gray-50 group-hover:bg-cyan-50 items-center justify-center border border-gray-100 group-hover:border-cyan-100 transition-colors shrink-0">
                      <span className="text-[10px] font-black text-gray-400 group-hover:text-cyan-400 uppercase tracking-tighter">{month}</span>
                      <span className="text-2xl font-black text-gray-900 leading-none">{day}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                          {formatTime(slot.time)} {slot.end_time ? `– ${formatTime(slot.end_time)}` : ""}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${isFull ? "bg-red-400" : "bg-green-400 animate-pulse"}`}></div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[1px]">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-300" /> {weekday}</span>
                        <span className="flex items-center gap-1.5"><Users size={12} className="text-gray-300" /> {booked}/{slot.max_patients} Patients</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100"
                    >
                      REvoke
                    </button>
                    <div className="p-2 text-gray-200 group-hover:text-cyan-200 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                );
              })}

              {slots.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 opacity-50">
                  <div className="w-20 h-20 rounded-[32px] bg-gray-50 flex items-center justify-center">
                    <Clock size={40} />
                  </div>
                  <p className="font-bold uppercase tracking-widest text-xs">No established slots</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCreator;

