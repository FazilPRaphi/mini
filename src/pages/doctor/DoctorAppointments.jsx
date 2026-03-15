import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import VideoCall from "../../components/Videocall";

const STATUS_STYLES = {
    upcoming: { bg: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "UPCOMING", dot: "bg-yellow-400" },
    "checked-in": { bg: "bg-green-100 text-green-700 border-green-200", label: "IN PROGRESS", dot: "bg-green-500" },
    completed: { bg: "bg-gray-100 text-gray-500 border-gray-200", label: "COMPLETED", dot: "bg-gray-400" },
};

const DoctorAppointments = () => {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(
        new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0]
    );

    const [selected, setSelected] = useState(null);
    const [history, setHistory] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [medicines, setMedicines] = useState([]);
    const [saving, setSaving] = useState(false);

    const [callRoom, setCallRoom] = useState(null);
    const [doctorName, setDoctorName] = useState("");
    const dateStr = selectedDate;

    useEffect(() => {
        loadBookings();
    }, [selectedDate]);

    useEffect(() => {

        const channel = supabase
            .channel("doctor-appointments")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "appointment_bookings"
                },
                () => {
                    loadBookings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, []);

    /* LOAD BOOKINGS */

    const loadBookings = async () => {

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

        setDoctorName(profile?.full_name || "Doctor");

        const { data, error } = await supabase
            .from("appointment_bookings")
            .select(`
            id,
            doctor_id,
            booked_at,
            queue_position,
            consultation_started,
            consultation_completed,
            call_room,
            patient_id,
            appointment_id,
            appointments(date, time),
            profiles:patient_id(full_name, age, gender, avatar_url)
        `)
            .eq("doctor_id", user.id)
            .eq("status", "booked")
            .order("queue_position", { ascending: true });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        const filtered = (data || []).filter(
            b => b.appointments?.date === dateStr
        );

        setBookings(filtered);
        setLoading(false);
    };

    /* START CONSULTATION */

    const startConsultation = async (booking) => {

        const { data: active } = await supabase
            .from("appointment_bookings")
            .select("id")
            .eq("consultation_started", true)
            .maybeSingle();

        if (active) {
            toast.error("Another consultation is already running");
            return;
        }

        const { error } = await supabase
            .from("appointment_bookings")
            .update({ consultation_started: true })
            .eq("id", booking.id);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Consultation started");

        // Optimistically update local state so UI reflects change immediately
        setBookings(prev =>
            prev.map(b =>
                b.id === booking.id
                    ? { ...b, consultation_started: true, consultation_completed: false }
                    : b
            )
        );
    };

    /* END CONSULTATION */

    const endConsultation = async (booking) => {

        const { error } = await supabase
            .from("appointment_bookings")
            .update({
                consultation_started: false,
                consultation_completed: true
            })
            .eq("id", booking.id);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Consultation completed");

        // Optimistically update local state so UI reflects change immediately
        setBookings(prev =>
            prev.map(b =>
                b.id === booking.id
                    ? { ...b, consultation_started: false, consultation_completed: true }
                    : b
            )
        );
    };

    /* OPEN PATIENT */

    const openPatient = async (booking) => {

        setSelected(booking);
        setTitle("");
        setDescription("");
        setMedicines([]);

        const { data: recordsData } = await supabase
            .from("medical_records")
            .select(`
                id,
                title,
                description,
                created_at,
                prescriptions(medicine_name, dosage, frequency, duration)
            `)
            .eq("patient_id", booking.patient_id)
            .order("created_at", { ascending: false });

        setHistory(recordsData || []);

        // Fetch reports
        const { data: reportsData } = await supabase
            .from("patient_reports")
            .select("*")
            .eq("patient_id", booking.patient_id)
            .order("created_at", { ascending: false });
            
        // Fetch the latest profile data explicitly to ensure medical_history is up to date
        const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, age, gender, phone, medical_history, avatar_url")
            .eq("id", booking.patient_id)
            .single();

        if (profileData) {
            setSelected({ ...booking, profiles: profileData, reports: reportsData || [] });
        } else {
            setSelected({ ...booking, reports: reportsData || [] });
        }
    };

    const addMedicine = () => {
        setMedicines([
            ...medicines,
            { medicine_name: "", dosage: "", frequency: "", duration: "" }
        ]);
    };

    const removeMedicine = (i) => {
        setMedicines(medicines.filter((_, idx) => idx !== i));
    };

    const updateMedicine = (i, f, v) => {
        const copy = [...medicines];
        copy[i][f] = v;
        setMedicines(copy);
    };

    const saveConsultation = async () => {

        if (!title) return toast.error("Title is required");

        setSaving(true);

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
            setSaving(false);
            return;
        }

        if (medicines.length > 0) {
            await supabase
                .from("prescriptions")
                .insert(
                    medicines.map(m => ({
                        ...m,
                        record_id: record.id
                    }))
                );
        }

        toast.success("Consultation saved successfully");
        setSaving(false);
        openPatient(selected);
    };

    /* STATUS */

    const getStatus = (b) => {
        if (b.consultation_completed) return "completed";
        if (b.consultation_started) return "checked-in";
        return "upcoming";
    };

    /* FORMAT TIME */

    const formatTime = (timeStr) => {
        if (!timeStr) return "-";
        try {
            const [h, m] = timeStr.split(":");
            const d = new Date();
            d.setHours(+h, +m);
            return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        } catch {
            return timeStr;
        }
    };

    /* ─── VIDEO CALL SCREEN ─────────────────────────────────────────────────── */

    if (callRoom) {
        return (
            <div className="max-w-5xl mx-auto px-4 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Video Consultation</h1>
                    <p className="text-sm text-gray-500 mt-0.5">You are connected as Dr. {doctorName}</p>
                </div>
                <VideoCall
                    roomName={callRoom}
                    userName={`Dr. ${doctorName}`}
                    onLeave={() => setCallRoom(null)}
                />
            </div>
        );
    }

    /* ─── PATIENT DETAIL SCREEN ─────────────────────────────────────────────── */

    if (selected) {

        const p = selected.profiles;
        const status = getStatus(selected);

        return (
            <div className="max-w-5xl mx-auto px-4 space-y-6 animate-fadeIn">

                {/* Back + Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelected(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Patients
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left column: patient info + new consultation */}
                    <div className="lg:col-span-1 space-y-5">

                        {/* Patient Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-gray-100">
                                    {p?.avatar_url ? (
                                        <img src={p.avatar_url} alt="Patient Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{p?.full_name || "Patient"}</p>
                                    <p className="text-sm text-gray-500">{p?.gender || ""}{p?.age ? ` · ${p.age} yrs` : ""}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 mb-0.5">Queue</p>
                                    <p className="font-semibold text-gray-700">#{selected.queue_position || "—"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 mb-0.5">Time</p>
                                    <p className="font-semibold text-gray-700">{formatTime(selected.appointments?.time)}</p>
                                </div>
                            </div>

                            {/* Lab Reports & Docs */}
                            {selected.reports && selected.reports.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Lab Reports & Docs</h4>
                                    <div className="space-y-2">
                                        {selected.reports.map((r) => (
                                            <a 
                                                key={r.id} 
                                                href={r.file_url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all group no-underline"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-xl border border-gray-200 group-hover:border-blue-200">
                                                    {r.file_type.startsWith('image/') ? '🖼️' : '📄'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{r.file_name}</p>
                                                    <p className="text-[10px] text-gray-500">Added {new Date(r.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Consultation Actions */}
                            <div className="mt-4 flex flex-col gap-2">
                                {!selected.consultation_started && !selected.consultation_completed && (
                                    <button
                                        onClick={() => startConsultation(selected).then(() => openPatient({ ...selected, consultation_started: true }))}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Start Consultation
                                    </button>
                                )}

                                {selected.consultation_started && !selected.consultation_completed && (
                                    <>
                                        <button
                                            onClick={() => setCallRoom(selected.call_room || `consult-${selected.id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all text-sm shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Join Video Call
                                        </button>
                                        <button
                                            onClick={() => endConsultation(selected).then(() => setSelected(null))}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold rounded-xl transition-all text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                            </svg>
                                            End Consultation
                                        </button>
                                    </>
                                )}

                                {selected.consultation_completed && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-center text-sm text-gray-500 font-medium">
                                        ✓ Consultation Completed
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* New Consultation Form */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                New Consultation Note
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Title *</label>
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Follow-up visit"
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Notes</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Diagnosis, observations, advice..."
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                                    />
                                </div>

                                {/* Medicines */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicines</label>
                                        <button
                                            onClick={addMedicine}
                                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add
                                        </button>
                                    </div>

                                    {medicines.length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-xl">
                                            No medicines added yet
                                        </p>
                                    )}

                                    <div className="space-y-3">
                                        {medicines.map((med, i) => (
                                            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                                                <button
                                                    onClick={() => removeMedicine(i)}
                                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <input
                                                    placeholder="Medicine name"
                                                    value={med.medicine_name}
                                                    onChange={e => updateMedicine(i, "medicine_name", e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input
                                                        placeholder="Dosage"
                                                        value={med.dosage}
                                                        onChange={e => updateMedicine(i, "dosage", e.target.value)}
                                                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                    />
                                                    <input
                                                        placeholder="Frequency"
                                                        value={med.frequency}
                                                        onChange={e => updateMedicine(i, "frequency", e.target.value)}
                                                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                    />
                                                    <input
                                                        placeholder="Duration"
                                                        value={med.duration}
                                                        onChange={e => updateMedicine(i, "duration", e.target.value)}
                                                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={saveConsultation}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm shadow-sm"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save Consultation
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right column: medical history */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Medical History
                            </h3>

                            {/* Patient's Self-Reported History */}
                            <div className="mb-6 bg-red-50/50 border border-red-100 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                    <span>⚠️</span> Patient Reported History
                                </h4>
                                <p className="text-sm text-red-800 leading-relaxed font-medium">
                                    {p?.medical_history || "No personal history provided by the patient."}
                                </p>
                            </div>

                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Past Consultations</h4>

                            {history.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                                    <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm text-gray-400">No previous clinic visits recorded.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map(rec => (
                                        <div key={rec.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-100 hover:bg-blue-50/30 transition-all">

                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className="font-semibold text-gray-900">{rec.title}</p>
                                                <p className="text-xs text-gray-400 flex-shrink-0">
                                                    {new Date(rec.created_at).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </p>
                                            </div>

                                            {rec.description && (
                                                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                                            )}

                                            {rec.prescriptions?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Prescriptions</p>
                                                    <div className="space-y-1.5">
                                                        {rec.prescriptions.map((rx, rxIdx) => (
                                                            <div key={rxIdx} className="flex items-center flex-wrap gap-2 text-xs bg-white border border-gray-100 rounded-lg px-3 py-2">
                                                                <span className="font-semibold text-gray-800">{rx.medicine_name}</span>
                                                                {rx.dosage && <span className="text-gray-500">· {rx.dosage}</span>}
                                                                {rx.frequency && <span className="text-gray-500">· {rx.frequency}</span>}
                                                                {rx.duration && (
                                                                    <span className="ml-auto bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{rx.duration}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        );

    }

    /* ─── MAIN BOOKINGS LIST ─────────────────────────────────────────────────── */

    return (

        <div className="max-w-5xl mx-auto px-4 space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Booked Patients</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage today's consultations</p>
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                />
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-24" />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && bookings.length === 0 && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-base font-semibold text-gray-700">No patients for this date</p>
                    <p className="text-sm text-gray-400 mt-1">Try selecting a different date</p>
                </div>
            )}

            {/* Booking Cards */}
            {!loading && bookings.length > 0 && (
                <div className="space-y-3">
                    {bookings.map(b => {

                        const status = getStatus(b);
                        const style = STATUS_STYLES[status];
                        const name = b.profiles?.full_name || "Patient";
                        const time = formatTime(b.appointments?.time);

                        return (
                            <div
                                key={b.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 hover:shadow-md transition-all duration-200 flex flex-wrap items-center gap-4"
                            >
                                {/* Patient Avatar */}
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                                    {b.profiles?.avatar_url ? (
                                        <img src={b.profiles.avatar_url} alt="PatientAvatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{name}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {time}
                                        <span className="text-gray-300">·</span>
                                        Queue #{b.queue_position}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border flex-shrink-0 ${style.bg}`}>
                                    {style.label}
                                </span>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-wrap">

                                    {!b.consultation_started && !b.consultation_completed && (
                                        <button
                                            onClick={() => startConsultation(b)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Start
                                        </button>
                                    )}

                                    {b.consultation_started && !b.consultation_completed && (
                                        <>
                                            <button
                                                onClick={() => setCallRoom(b.call_room || `consult-${b.id}`)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Join Call
                                            </button>
                                            <button
                                                onClick={() => endConsultation(b)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-all"
                                            >
                                                End
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => openPatient(b)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Open Patient
                                    </button>

                                </div>

                            </div>
                        );

                    })}
                </div>
            )}

        </div>

    );

};

export default DoctorAppointments;