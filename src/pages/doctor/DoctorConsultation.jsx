import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const card = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 6px rgba(0,0,0,.07)",
  padding: 24,
};

const inputStyle = {
  width: "100%",
  border: "1px solid #E2E8F0",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const btnCyan = {
  background: "linear-gradient(90deg,#0BC5EA,#00B5D8)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 24px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const btnGray = {
  background: "#EDF2F7",
  color: "#4A5568",
  border: "none",
  borderRadius: 10,
  padding: "12px 24px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const DoctorConsultation = () => {

  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [meds, setMeds] = useState([
    { medicine_name: "", dosage: "", frequency: "Twice a day", duration: "7 Days" }
  ]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [docProfile, setDocProfile] = useState(null);

  const [stats, setStats] = useState({
    capacity: 0,
    slots: 0,
    completed: 0,
    inQueue: 0,
    nextPatient: ""
  });

  useEffect(() => {
    loadDashboard();
  }, [selectedDate]);

  const loadDashboard = async () => {

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name,speciality")
      .eq("id", user.id)
      .single();

    setDocProfile(prof);

    const { data: allBookings } = await supabase
      .from("appointment_bookings")
      .select(`
        id,
        patient_id,
        booked_at,
        appointment_id,
        appointments(id,date,max_patients),
        profiles:patient_id(full_name,age,gender,phone,medical_history)
      `)
      .eq("doctor_id", user.id)
      .order("booked_at", { ascending: true });

    const bookingList = (allBookings || []).filter(
      b => b.appointments?.date === selectedDate
    );

    setBookings(bookingList);
    setSelected(null);
    setHistory([]);

    const today = new Date().toISOString().split("T")[0];

    const { data: upcomingSlots } = await supabase
      .from("appointments")
      .select("id,max_patients")
      .eq("doctor_id", user.id)
      .gte("date", today);

    const totalCap = (upcomingSlots || []).reduce(
      (s, x) => s + (x.max_patients || 0),
      0
    );

    const upcomingSlotIds = (upcomingSlots || []).map(s => s.id);

    let totalBooked = 0;

    if (upcomingSlotIds.length > 0) {
      const { data: bookedData } = await supabase
        .from("appointment_bookings")
        .select("id")
        .eq("doctor_id", user.id)
        .in("appointment_id", upcomingSlotIds);

      totalBooked = (bookedData || []).length;
    }

    const { data: recs } = await supabase
      .from("medical_records")
      .select("id")
      .eq("doctor_id", user.id);

    setStats({
      capacity: totalCap,
      slots: totalBooked,
      completed: (recs || []).length,
      inQueue: bookingList.length,
      nextPatient: bookingList[0]?.profiles?.full_name || "—"
    });
  };

  const loadHistory = async (patientId, bookingData) => {

    const { data } = await supabase
      .from("medical_records")
      .select(`*, prescriptions(*)`)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    setHistory(data || []);

    const { data: reportsData } = await supabase
      .from("patient_reports")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    setReports(reportsData || []);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name,age,gender,phone,medical_history")
      .eq("id", patientId)
      .single();

    if (bookingData && profileData) {
      setSelected({ ...bookingData, profiles: profileData });
    } else {
      setSelected(bookingData);
    }
  };

  const handleSelect = (b) => {
    loadHistory(b.patient_id, b);
  };

  const addRow = () => {
    setMeds([
      ...meds,
      { medicine_name: "", dosage: "", frequency: "Once a day", duration: "5 Days" }
    ]);
  };

  const deleteRow = (i) => {
    const copy = meds.filter((_, index) => index !== i);

    setMeds(copy.length ? copy : [
      { medicine_name: "", dosage: "", frequency: "Twice a day", duration: "7 Days" }
    ]);
  };

  const updateMed = (i, field, value) => {

    const copy = [...meds];
    copy[i][field] = value;
    setMeds(copy);
  };

  const saveRecord = async (draft = false) => {

    if (!selected) return toast.error("Select a patient first");
    if (!title) return toast.error("Title required");

    const { data: { user } } = await supabase.auth.getUser();

    const { data: record, error } = await supabase
      .from("medical_records")
      .insert({
        patient_id: selected.patient_id,
        doctor_id: user.id,
        appointment_booking_id: selected.id,
        title,
        description
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    const medsPayload = meds.filter(
      m => m.medicine_name.trim() !== ""
    );

    if (medsPayload.length > 0) {

      await supabase.from("prescriptions").insert(
        medsPayload.map(m => ({
          ...m,
          record_id: record.id
        }))
      );
    }

    toast.success(draft ? "Draft saved!" : "Consultation finalized!");

    setTitle("");
    setDescription("");

    setMeds([
      { medicine_name: "", dosage: "", frequency: "Twice a day", duration: "7 Days" }
    ]);

    loadHistory(selected.patient_id);
  };

  return (
    <div className="max-w-[1200px] w-full px-4 md:px-0">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Doctor Dashboard
        </h1>

        <p className="text-gray-500 text-sm">
          Welcome back, {docProfile?.full_name}. Check your daily queue.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">

        <div style={card}>
          <p className="text-sm text-gray-500">Capacity Used</p>
          <p className="text-2xl font-bold text-cyan-600">
            {stats.slots}/{stats.capacity}
          </p>
        </div>

        <div style={card}>
          <p className="text-sm text-gray-500">In Queue</p>
          <p className="text-2xl font-bold">{stats.inQueue}</p>
          <p className="text-xs text-gray-500">Next: {stats.nextPatient}</p>
        </div>

        <div style={card}>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>

      </div>

      {/* rest of UI unchanged */}

    </div>
  );
};

export default DoctorConsultation;