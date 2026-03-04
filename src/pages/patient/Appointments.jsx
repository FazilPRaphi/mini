import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const DEFAULT_CAPACITY = 10;

const Appointments = () => {
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [appliedDate, setAppliedDate] = useState("");

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const today = new Date().toISOString().split("T")[0];

    const { data: slotsData, error } = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        doctor_id,
        max_patients,
        profiles:doctor_id (
          full_name,
          institution,
          speciality
        )
      `)
      .gte("date", today)
      .order("date", { ascending: true });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: bookingCounts } = await supabase
      .from("appointment_bookings")
      .select("appointment_id");

    const countMap = {};
    (bookingCounts || []).forEach((b) => {
      countMap[b.appointment_id] = (countMap[b.appointment_id] || 0) + 1;
    });

    const merged = (slotsData || []).map((slot) => ({
      ...slot,
      bookedCount: countMap[slot.id] || 0,
    }));

    const { data: myBookings } = await supabase
      .from("appointment_bookings")
      .select("appointment_id")
      .eq("patient_id", user.id);

    const bookedSet = new Set((myBookings || []).map((b) => b.appointment_id));

    const available = merged.filter((s) => !bookedSet.has(s.id));

    available.sort((a, b) => a.time.localeCompare(b.time));

    setSlots(available);
    setFilteredSlots(available);
    setLoading(false);
  };

  const applyFilter = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    const parts = selectedDate.split("-");
    const normalized =
      parts[0].length === 4
        ? selectedDate
        : `${parts[2]}-${parts[1]}-${parts[0]}`;

    const filtered = slots.filter((s) => s.date === normalized);

    setAppliedDate(selectedDate);
    setFilteredSlots(filtered);
  };

  const clearFilter = () => {
    setSelectedDate("");
    setAppliedDate("");
    setFilteredSlots(slots);
  };

  const bookSlot = async (slot) => {
    try {
      setBookingId(slot.id);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("appointment_bookings").insert({
        appointment_id: slot.id,
        patient_id: user.id,
        doctor_id: slot.doctor_id,
      });

      if (error) toast.error(error.message);
      else {
        toast.success("Appointment booked successfully");
        fetchSlots();
      }
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Available Appointments
        </h1>
        <p className="text-gray-500 mt-2">
          Choose a date and book your preferred doctor to secure your slot.
        </p>
      </div>

      {/* FILTER CARD */}
      <div className="bg-gray-100 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-end">

        <div className="flex flex-col w-full md:w-64">
          <label className="text-sm text-gray-600 mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white"
          />
        </div>

        {/* Specialty (UI only like screenshot) */}
        <div className="flex flex-col w-full md:w-64">
          <label className="text-sm text-gray-600 mb-1">
            Doctor Specialty
          </label>
          <select className="border rounded-lg px-4 py-2 bg-white">
            <option>All Specialties</option>
          </select>
        </div>

        <button
          onClick={applyFilter}
          className="bg-cyan-600 text-white px-8 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          Show Slots
        </button>

        {appliedDate && (
          <button
            onClick={clearFilter}
            className="text-gray-500 text-sm hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow animate-pulse space-y-4"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredSlots.length === 0 && (
        <div className="border-2 border-dashed rounded-2xl p-12 text-center text-gray-500">
          <p className="text-lg font-semibold">No slots found</p>
          <p className="text-sm mt-2">
            No additional slots found for this date.
          </p>
        </div>
      )}

      {/* SLOT CARDS */}
      {!loading && filteredSlots.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => {
            const booked = slot.bookedCount || 0;
            const capacity = slot.max_patients || DEFAULT_CAPACITY;
            const full = booked >= capacity;

            return (
              <div
                key={slot.id}
                className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition flex flex-col justify-between"
              >
                {/* doctor */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center text-white text-xl">
                      👨‍⚕️
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${full
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                        }`}
                    >
                      {full ? "FULL" : "AVAILABLE"}
                    </span>
                  </div>

                  <div>
                    <p className="text-lg font-semibold">
                      Dr. {slot.profiles?.full_name || "Unknown"}
                    </p>
                    <p className="text-cyan-600 text-sm">
                      {slot.profiles?.speciality || "General Physician"}
                    </p>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Date: {slot.date}</p>
                    <p>Time: {slot.time}</p>
                    <p className="text-xs">
                      Slots: {booked}/{capacity}
                    </p>
                  </div>
                </div>

                {/* button */}
                <button
                  onClick={() => bookSlot(slot)}
                  disabled={full || bookingId === slot.id}
                  className={`mt-6 border rounded-lg py-2 transition ${full
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white"
                    }`}
                >
                  {full
                    ? "Fully Booked"
                    : bookingId === slot.id
                      ? "Booking..."
                      : "Book Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Appointments;