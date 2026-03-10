import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  ChevronRight,
  Users,
  Activity,
  Video,
  PlusCircle,
  Trash2
} from "lucide-react";

const DoctorAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [maxPatients, setMaxPatients] = useState(5);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [stats, setStats] = useState({
    totalActive: 0,
    pending: 0,
    completed: 0
  });

  const loadBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("appointment_bookings")
      .select(`
        id,
        doctor_id,
        booked_at,
        status,
        consultation_completed,
        call_room,
        patient_id,
        appointments(date,time),
        profiles:patient_id(full_name,age,gender)
      `)
      .eq("doctor_id", user.id)
      .order("booked_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    setBookings(data || []);

    const active =
      data?.filter(
        b => b.status === "booked" || b.status === "Upcoming"
      ).length || 0;

    const comp =
      data?.filter(
        b => b.status === "Completed" || b.consultation_completed
      ).length || 0;

    setStats({
      totalActive: active,
      pending: active,
      completed: comp
    });
  };

  const loadSlots = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("appointments")
      .select("*, appointment_bookings(id)")
      .eq("doctor_id", user.id)
      .gte("date", today)
      .order("date", { ascending: true });

    setSlots(data || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadBookings();
      await loadSlots();
      setLoading(false);
    };

    init();
  }, []);

  const createSlot = async () => {
    if (!date) return toast.error("Select a date");
    if (!startTime) return toast.error("Enter start time");

    setCreating(true);

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
      setCreating(false);
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
      toast.success("Slot created");
      loadSlots();
    }

    setCreating(false);
  };

  const deleteSlot = async id => {
    if (!confirm("Delete slot?")) return;

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

  const formatTime = time => {
    if (!time) return "";

    const [h, m] = time.split(":");
    const hour = parseInt(h);

    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;

    return `${h12}:${m} ${ampm}`;
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn overflow-hidden">

      {/* HEADER */}

      <header className="mb-8 flex justify-between items-end">

        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Clinical Registry
          </h1>

          <p className="text-gray-500">
            Detailed log of patient consultations.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow border">

          <div>
            <div className="text-xs text-gray-400 uppercase font-bold">
              Live Load
            </div>

            <div className="text-sm font-black text-cyan-600">
              {stats.totalActive} Patients in Queue
            </div>
          </div>

          <Activity size={20} className="text-cyan-500 animate-pulse" />

        </div>

      </header>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="seba-card p-4 flex gap-4 items-center">
          <Clock className="text-orange-500" />
          <div>
            <div className="text-xs text-gray-400">Pending</div>
            <div className="text-xl font-bold">{stats.pending}</div>
          </div>
        </div>

        <div className="seba-card p-4 flex gap-4 items-center">
          <CheckCircle className="text-green-500" />
          <div>
            <div className="text-xs text-gray-400">Completed</div>
            <div className="text-xl font-bold">{stats.completed}</div>
          </div>
        </div>

        <div className="seba-card p-4 flex gap-4 items-center">
          <Activity className="text-purple-500" />
          <div>
            <div className="text-xs text-gray-400">Revenue</div>
            <div className="text-xl font-bold">
              ${stats.completed * 50}
            </div>
          </div>
        </div>

      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-2 gap-8 flex-1 overflow-hidden">

        {/* SLOT CREATOR */}

        <div className="seba-card p-8 flex flex-col gap-6">

          <h2 className="font-black text-lg flex items-center gap-2">
            <PlusCircle size={20} /> Create Slot
          </h2>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded-xl p-3"
          />

          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="border rounded-xl p-3"
          />

          <input
            type="number"
            value={maxPatients}
            min={1}
            onChange={e => setMaxPatients(Number(e.target.value))}
            className="border rounded-xl p-3"
          />

          <button
            onClick={createSlot}
            disabled={creating}
            className="bg-cyan-500 text-white py-3 rounded-xl font-bold"
          >
            {creating ? "Creating..." : "Add Slot"}
          </button>

          <div className="space-y-3 overflow-y-auto">

            {slots.map(slot => {

              const booked =
                slot.appointment_bookings?.length || 0;

              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between border rounded-xl p-3"
                >

                  <div>
                    <div className="font-bold">
                      {slot.date}
                    </div>

                    <div className="text-sm text-gray-500">
                      {formatTime(slot.time)}
                    </div>

                    <div className="text-xs text-gray-400">
                      {booked}/{slot.max_patients} booked
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSlot(slot.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              );
            })}

          </div>

        </div>

        {/* BOOKING REGISTRY */}

        <div className="seba-card p-8 flex flex-col overflow-hidden">

          <h2 className="font-black text-lg mb-6 flex gap-2 items-center">
            <Users size={20} /> Patient Registry
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4">

            {loading ? (
              <div className="text-center text-gray-400">
                Loading...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center text-gray-400">
                No bookings
              </div>
            ) : (
              bookings.map(b => (
                <div
                  key={b.id}
                  className="flex items-center gap-6 p-4 border rounded-xl hover:shadow"
                >

                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    {b.profiles?.full_name?.charAt(0)}
                  </div>

                  <div className="flex-1">

                    <div className="font-bold">
                      {b.profiles?.full_name}
                    </div>

                    <div className="text-sm text-gray-400 flex gap-4">

                      <span>
                        {b.appointments?.date}
                      </span>

                      <span>
                        {formatTime(b.appointments?.time)}
                      </span>

                      <span>
                        {b.profiles?.age}y
                      </span>

                    </div>

                  </div>

                  {b.call_room && (
                    <Video className="text-green-500" />
                  )}

                  <ChevronRight className="text-gray-300" />

                </div>
              ))
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default DoctorAppointments;