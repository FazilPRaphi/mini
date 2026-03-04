import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ChatWindow from "./ChatWindow";
import { MessageCircle, Clock, ArrowRight } from "lucide-react";

const ChatList = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;
        setCurrentUserId(user.id);

        // Fetch user profile to determine role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const role = profile?.role;

        // Fetch bookings where user is either patient or doctor
        let query = supabase
            .from("appointment_bookings")
            .select(
                `
        id,
        booked_at,
        patient_id,
        doctor_id,
        appointment_id,
        appointments (
          date,
          time
        )
      `
            )
            .order("booked_at", { ascending: false });

        if (role === "patient") {
            query = query.eq("patient_id", user.id);
        } else {
            query = query.eq("doctor_id", user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching chats:", error);
            setLoading(false);
            return;
        }

        // Now fetch the other party's name for each booking
        const enriched = await Promise.all(
            (data || []).map(async (booking) => {
                const otherPartyId =
                    role === "patient" ? booking.doctor_id : booking.patient_id;

                const { data: otherProfile } = await supabase
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", otherPartyId)
                    .single();

                const bookedAt = new Date(booking.booked_at);
                const expiresAt = new Date(bookedAt.getTime() + 24 * 60 * 60 * 1000);
                const isExpired = new Date() > expiresAt;

                return {
                    ...booking,
                    otherPartyName: otherProfile?.full_name || "Unknown",
                    otherPartyRole: otherProfile?.role || "",
                    isExpired,
                    expiresAt,
                };
            })
        );

        setBookings(enriched);
        setLoading(false);
    };

    const getTimeRemaining = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        if (diff <= 0) return "Expired";
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hrs}h ${mins}m left`;
    };

    if (selectedBooking) {
        return (
            <ChatWindow
                booking={selectedBooking}
                currentUserId={currentUserId}
                onBack={() => setSelectedBooking(null)}
            />
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Chat with your doctor/patient within 24 hours of booking
                </p>
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white p-5 rounded-2xl shadow animate-pulse"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && bookings.length === 0 && (
                <div className="bg-white rounded-2xl shadow p-12 text-center">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={32} className="text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        No conversations yet
                    </h3>
                    <p className="text-sm text-gray-400">
                        Chat windows will appear here after booking an appointment
                    </p>
                </div>
            )}

            {/* Chat list */}
            {!loading && bookings.length > 0 && (
                <div className="space-y-3">
                    {/* Active chats */}
                    {bookings.filter((b) => !b.isExpired).length > 0 && (
                        <>
                            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-1">
                                Active Chats
                            </h3>
                            {bookings
                                .filter((b) => !b.isExpired)
                                .map((booking) => (
                                    <button
                                        key={booking.id}
                                        onClick={() => setSelectedBooking(booking)}
                                        className="w-full bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 group border border-transparent hover:border-orange-100 text-left"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                                            {booking.otherPartyName?.charAt(0)?.toUpperCase() || "?"}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {booking.otherPartyRole === "doctor" ? "Dr. " : ""}
                                                {booking.otherPartyName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {booking.appointments?.date} at{" "}
                                                {booking.appointments?.time}
                                            </p>
                                        </div>

                                        {/* Time badge */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full font-medium">
                                                <Clock size={12} />
                                                {getTimeRemaining(booking.expiresAt)}
                                            </span>
                                            <ArrowRight
                                                size={16}
                                                className="text-gray-300 group-hover:text-orange-500 transition"
                                            />
                                        </div>
                                    </button>
                                ))}
                        </>
                    )}

                    {/* Expired chats */}
                    {bookings.filter((b) => b.isExpired).length > 0 && (
                        <>
                            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-1 mt-6">
                                Expired Chats
                            </h3>
                            {bookings
                                .filter((b) => b.isExpired)
                                .map((booking) => (
                                    <button
                                        key={booking.id}
                                        onClick={() => setSelectedBooking(booking)}
                                        className="w-full bg-white/70 p-5 rounded-2xl shadow-sm flex items-center gap-4 group border border-transparent hover:border-gray-200 transition text-left opacity-60 hover:opacity-80"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {booking.otherPartyName?.charAt(0)?.toUpperCase() || "?"}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-600 truncate">
                                                {booking.otherPartyRole === "doctor" ? "Dr. " : ""}
                                                {booking.otherPartyName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {booking.appointments?.date} at{" "}
                                                {booking.appointments?.time}
                                            </p>
                                        </div>

                                        {/* Expired badge */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="flex items-center gap-1 text-xs text-red-400 bg-red-50 px-2.5 py-1 rounded-full font-medium">
                                                <Clock size={12} />
                                                Expired
                                            </span>
                                            <ArrowRight
                                                size={16}
                                                className="text-gray-300 group-hover:text-gray-500 transition"
                                            />
                                        </div>
                                    </button>
                                ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatList;
