import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { Plus, Calendar, Clock, Users, ChevronRight, Activity } from "lucide-react";

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
      .order("date", { ascending: true });

    if (!error) setSlots(data || []);

  };

  useEffect(() => {
    loadSlots();
  }, []);

  const createSlot = async () => {

    if (!date) return toast.error("Please select a date");
    if (!startTime) return toast.error("Please enter start time");

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return toast.error("Cannot create slots in the past");
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const formattedTime = startTime + ":00";

    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("date", date)
      .eq("time", formattedTime)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      return toast.error("Slot already exists");
    }

    const { error } = await supabase
      .from("appointments")
      .insert({
        doctor_id: user.id,
        date,
        time: formattedTime,
        max_patients: maxPatients
      });

    if (error) toast.error(error.message);
    else {
      toast.success("Slot created!");
      loadSlots();
    }

    setLoading(false);

  };

  const deleteSlot = async (id) => {

    if (!confirm("Delete this slot?")) return;

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Slot deleted");
      loadSlots();
    }

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

      {/* HEADER */}

      <div className="mb-8 flex justify-between items-end">

        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Availability Management
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Configure and manage your clinical consultation hours.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <Activity size={18} className="text-[#0BC5EA]" />
          <span className="text-sm font-black text-gray-700 uppercase tracking-widest">
            {slots.length} Active Slots
          </span>
        </div>

      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">

        {/* CREATE SLOT PANEL */}

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">

          <div className="seba-card p-8 flex flex-col gap-8">

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-[#0BC5EA] shadow-inner">
                <Plus size={24} />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                Create New Slot
              </h2>
            </div>

            <div className="space-y-6 text-left">

              {/* DATE */}

              <div className="space-y-2">

                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Select Date
                </label>

                <div className="relative">

                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar size={18} />
                  </div>

                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                </div>

              </div>

              {/* START TIME */}

              <div className="space-y-2">

                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500"
                />

              </div>

              {/* MAX PATIENTS */}

              <div className="space-y-2">

                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Max Patients
                </label>

                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">

                  <button
                    onClick={() => setMaxPatients(p => Math.max(1, p - 1))}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
                  >
                    –
                  </button>

                  <div className="flex-1 text-center font-black text-lg text-gray-700">
                    {maxPatients}
                  </div>

                  <button
                    onClick={() => setMaxPatients(p => p + 1)}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
                  >
                    +
                  </button>

                </div>

              </div>

              <button
                onClick={createSlot}
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-[#0BC5EA] to-[#00B5D8] text-white rounded-[20px] font-black text-sm uppercase tracking-[2px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
              >
                <Plus size={20} strokeWidth={3} />
                {loading ? "CREATING..." : "Add Consultation Slot"}
              </button>

            </div>

          </div>

        </div>

        {/* UPCOMING SLOTS */}

        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 overflow-hidden">

          <div className="seba-card flex-1 p-8 flex flex-col overflow-hidden">

            <div className="flex items-center justify-between mb-8">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#9B51E0] shadow-inner">
                  <Clock size={24} />
                </div>

                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Upcoming Slots
                </h2>

              </div>

            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">

              {slots.map(slot => {

                const { month, day, weekday } = formatDate(slot.date);
                const booked = slot.appointment_bookings?.length || 0;

                return (

                  <div
                    key={slot.id}
                    className="group flex items-center gap-6 p-5 bg-white border border-gray-100 rounded-3xl hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/20 transition-all"
                  >

                    <div className="w-16 h-20 rounded-2xl flex flex-col bg-gray-50 items-center justify-center border">

                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                        {month}
                      </span>

                      <span className="text-2xl font-black text-gray-900 leading-none">
                        {day}
                      </span>

                    </div>

                    <div className="flex-1">

                      <div className="flex items-center gap-2 mb-1">

                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                          {formatTime(slot.time)}
                        </span>

                      </div>

                      <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[1px]">

                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {weekday}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Users size={12} />
                          {booked}/{slot.max_patients} Patients
                        </span>

                      </div>

                    </div>

                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="px-5 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold uppercase"
                    >
                      Delete
                    </button>

                    <ChevronRight size={18} className="text-gray-200" />

                  </div>

                );

              })}

              {slots.length === 0 && (

                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 opacity-50">

                  <Clock size={40} />

                  <p className="font-bold uppercase tracking-widest text-xs">
                    No established slots
                  </p>

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