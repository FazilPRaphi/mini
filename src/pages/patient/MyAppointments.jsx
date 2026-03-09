import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import VideoCall from "../../components/Videocall";

const MyAppointments = ({ statusFilter = "all" }) => {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelId, setCancelId] = useState(null);

    const [callRoom, setCallRoom] = useState(null);
    const [userName, setUserName] = useState("");
    const [hidePast, setHidePast] = useState(true);

    /* LOAD APPOINTMENTS ON PAGE LOAD */

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter]);

    /* REALTIME LISTENER */

    useEffect(() => {

        const channel = supabase
            .channel("appointments-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "appointment_bookings"
                },
                () => {
                    fetchAppointments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, []);

    /* FETCH APPOINTMENTS */

    const fetchAppointments = async () => {

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

        setUserName(profile?.full_name || "Patient");

        const { data, error } = await supabase
            .from("appointment_bookings")
            .select(`
        id,
        status,
        booked_at,
        call_room,
        queue_position,
        consultation_started,
        consultation_completed,
        appointments (
          date,
          time,
          doctor_id,
          profiles:doctor_id (
            full_name,
            speciality,
            institution
          )
        )
      `)
            .eq("patient_id", user.id)
            .order("booked_at", { ascending: false });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        let filtered = data || [];

        if (statusFilter && statusFilter !== "all") {
            filtered = filtered.filter(
                (item) => item.status === statusFilter
            );
        }

        setAppointments(filtered);
        setLoading(false);

    };

    /* CANCEL BOOKING */

    const cancelBooking = async (bookingId) => {

        try {

            setCancelId(bookingId);

            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("appointment_bookings")
                .update({ status: "cancelled" })
                .eq("id", bookingId)
                .eq("patient_id", user.id)
                .select();

            if (error) {
                toast.error(error.message);
                return;
            }

            if (!data || data.length === 0) {
                toast.error("Update blocked by RLS policy");
                return;
            }

            toast.success("Appointment cancelled");

            setAppointments(prev =>
                prev.map(item =>
                    item.id === bookingId
                        ? { ...item, status: "cancelled" }
                        : item
                )
            );

        } finally {
            setCancelId(null);
        }

    };

    /* STATUS BADGE */

    const getStatusBadge = (status) => {

        switch (status) {

            case "booked":
                return "bg-blue-100 text-blue-700";

            case "completed":
                return "bg-green-100 text-green-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }

    };

    /* CALL TIME WINDOW */

    const canJoinCall = (date, time) => {

        if (!date || !time) return false;

        const now = new Date();
        let appointment = new Date(`${date} ${time}`);

        if (isNaN(appointment.getTime())) {
            appointment = new Date(`${date}T${time}`);
        }

        if (isNaN(appointment.getTime())) {
            return false;
        }

        const openTime = new Date(appointment.getTime() - 10 * 60000); // 10 mins before
        const closeTime = new Date(appointment.getTime() + 90 * 60000); // 90 mins after

        return now >= openTime && now <= closeTime;

    };

    /* VIDEO CALL SCREEN */

    if (callRoom) {

        return (

            <div className="max-w-6xl mx-auto px-4 space-y-6">

                <div className="flex justify-between items-center">

                    <h1 className="text-2xl font-bold">
                        Video Consultation
                    </h1>

                </div>

                <VideoCall
                    roomName={callRoom}
                    userName={userName}
                    onLeave={() => setCallRoom(null)}
                />

            </div>

        );

    }

    /* MAIN PAGE */

    const displayAppointments = appointments.filter(item => {
        if (!hidePast) return true;
        if (item.status === "completed" || item.status === "cancelled") return false;

        const slot = item.appointments;
        if (!slot?.date || !slot?.time) return true;

        let appointmentDate = new Date(`${slot.date} ${slot.time}`);
        if (isNaN(appointmentDate.getTime())) {
            appointmentDate = new Date(`${slot.date}T${slot.time}`);
        }

        if (isNaN(appointmentDate.getTime())) return true;

        const now = new Date();
        // Hide if the appointment ended more than 2 hours ago
        return appointmentDate.getTime() + (2 * 60 * 60 * 1000) > now.getTime();
    });

    return (

        <div className="max-w-6xl mx-auto px-4 space-y-8">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Appointments
                    </h1>

                    <p className="text-sm text-gray-500">
                        View and manage your bookings
                    </p>
                </div>

                <button
                    onClick={() => setHidePast(!hidePast)}
                    className={`px-4 py-2 rounded-lg font-medium transition text-sm flex items-center gap-2 ${hidePast ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    {hidePast ? "Show All Bookings" : "Hide Passed Bookings"}
                </button>
            </div>

            {loading && (

                <div className="grid md:grid-cols-2 gap-6">

                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-2xl shadow animate-pulse h-40"
                        />
                    ))}

                </div>

            )}

            {!loading && displayAppointments.length === 0 && (

                <div className="bg-white p-10 rounded-2xl shadow text-center">

                    <p className="text-lg font-medium text-gray-700">
                        No appointments found
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        Try changing the filter or book a consultation.
                    </p>

                </div>

            )}

            {!loading && displayAppointments.length > 0 && (

                <div className="grid md:grid-cols-2 gap-6">

                    {displayAppointments.map((item) => {

                        const slot = item.appointments;
                        const doctor = slot?.profiles;

                        const appointmentDateTime =
                            new Date(`${slot?.date}T${slot?.time}`);

                        const now = new Date();

                        const canCancel = appointmentDateTime > now;

                        return (

                            <div
                                key={item.id}
                                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
                            >

                                <div className="flex justify-between items-start">

                                    <div>

                                        <p className="text-lg font-semibold">
                                            Dr. {doctor?.full_name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {doctor?.speciality}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            {doctor?.institution}
                                        </p>

                                    </div>

                                    <span
                                        className={`px-3 py-1 text-xs rounded-full ${getStatusBadge(item.status)}`}
                                    >
                                        {item.status}
                                    </span>

                                </div>

                                <div className="mt-4 text-sm text-gray-700">

                                    <p>Date: {slot?.date}</p>
                                    <p>Time: {slot?.time}</p>

                                </div>

                                {item.status === "booked" && canCancel && (

                                    <button
                                        onClick={() => cancelBooking(item.id)}
                                        disabled={cancelId === item.id}
                                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                    >

                                        {cancelId === item.id
                                            ? "Cancelling..."
                                            : "Cancel Booking"}

                                    </button>

                                )}

                                {item.status === "booked" && !canJoinCall(slot?.date, slot?.time) && (

                                    <p className="text-sm text-yellow-600 mt-2">
                                        Queue position: {item.queue_position || "-"}. Video link opens 10 mins before.
                                    </p>

                                )}

                                {item.status === "booked" &&
                                    !item.consultation_completed &&
                                    canJoinCall(slot?.date, slot?.time) && (

                                        <button
                                            onClick={() => setCallRoom(item.call_room || `consult-${item.id}`)}
                                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            Join Video Consultation
                                        </button>

                                    )}

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

};

export default MyAppointments;