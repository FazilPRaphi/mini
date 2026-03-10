import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { Search, History, FileText, Send, User, Users, MessageSquare, Clipboard, ExternalLink, ChevronRight, CheckCircle, Clock } from "lucide-react";

const DoctorConsultation = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("appointment_bookings")
        .select(`
                    id, 
                    patient_id, 
                    booked_at, 
                    status,
                    doctor_notes,
                    appointments(date, time),
                    profiles:patient_id(full_name, age, gender, medical_history)
                `)
        .eq("doctor_id", user.id)
        .in("status", ["Upcoming", "Active", "Completed", "booked"])
        .order("booked_at", { ascending: false });

      if (!error) setBookings(data || []);
    };
    fetchBookings();
  }, []);

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    setDoctorNotes(booking.doctor_notes || "");
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    setLoading(true);
    const { error } = await supabase
      .from("appointment_bookings")
      .update({ doctor_notes: doctorNotes, status: "Completed" })
      .eq("id", selectedBooking.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Consultation finalized successfully");
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, doctor_notes: doctorNotes, status: "Completed" } : b));
      setSelectedBooking(prev => ({ ...prev, status: "Completed", doctor_notes: doctorNotes }));
    }
    setLoading(false);
  };

  const filteredBookings = bookings.filter(b =>
    b.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col font-redhat animate-fadeIn overflow-hidden">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active Consultations</h1>
        <p className="text-gray-500 font-medium">Manage clinical sessions and record patient history.</p>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        {/* Left Column: Patient List */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="seba-card flex-1 p-6 flex flex-col overflow-hidden">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none ring-0 focus:ring-2 focus:ring-cyan-500 transition-all shadow-inner"
              />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {filteredBookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBooking(b)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group ${selectedBooking?.id === b.id
                    ? "bg-cyan-50 border-cyan-200 shadow-sm"
                    : "bg-white border-gray-100 hover:border-cyan-100 hover:bg-gray-50/50"
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-transform group-hover:scale-110 ${selectedBooking?.id === b.id ? "bg-[#0BC5EA] text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                    {b.profiles?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 truncate flex items-center gap-2">
                      {b.profiles?.full_name}
                      {b.status === "Completed" && <CheckCircle size={14} className="text-[#27AE60]" />}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                      <Clock size={12} /> {b.appointments?.time || "TBD"}
                    </div>
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${selectedBooking?.id === b.id ? "translate-x-1 text-[#0BC5EA]" : "text-gray-300"}`} />
                </button>
              ))}
              {filteredBookings.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-20 text-gray-300 opacity-50">
                  <Clipboard size={48} className="mb-4" />
                  <p className="font-bold uppercase tracking-widest text-xs">No sessions found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Session / Form */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          {selectedBooking ? (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              {/* Patient Quick Info */}
              <div className="seba-card p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-[28px] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                  <User size={40} className="text-cyan-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-black tracking-tight">{selectedBooking.profiles?.full_name}</h2>
                  <p className="text-white/60 font-medium">{selectedBooking.profiles?.age} years • {selectedBooking.profiles?.gender}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest py-1.5 px-3 bg-white/5 rounded-full border border-white/10">
                      <History size={14} className="text-[#9B51E0]" /> History: {selectedBooking.profiles?.medical_history?.length || 0} Records
                    </div>
                  </div>
                </div>
                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
                  <ExternalLink size={20} className="text-cyan-400" />
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                {/* Clinical Notes */}
                <div className="seba-card flex flex-col p-8 overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 rounded-xl text-[#9B51E0]">
                      <FileText size={20} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Clinical Observations</h3>
                  </div>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Record diagnosis, prescriptions, and follow-up plans..."
                    className="flex-1 w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-[#9B51E0] transition-all resize-none shadow-inner no-scrollbar"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={loading}
                    className="mt-6 w-full py-4 bg-[#1A202C] text-white rounded-[20px] font-black text-xs uppercase tracking-[2px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <Send size={16} />
                    {loading ? "FINALIZING..." : "Save & Finalize Session"}
                  </button>
                </div>

                {/* Patient Documents / History */}
                <div className="seba-card p-8 flex flex-col overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-50 rounded-xl text-[#0BC5EA]">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Patient Description</h3>
                  </div>
                  <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 overflow-y-auto no-scrollbar border border-gray-100 italic text-gray-600 text-sm leading-relaxed">
                    {selectedBooking.profiles?.medical_history || "No specific medical history or complaint descriptions provided for this session."}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Linked Records</div>
                        <div className="text-sm font-bold text-gray-800">Prescription_772.pdf</div>
                      </div>
                    </div>
                    <button className="text-xs font-black text-[#0BC5EA] hover:underline uppercase tracking-widest">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="seba-card flex-1 flex flex-col items-center justify-center text-gray-300 gap-6 opacity-60">
              <div className="w-32 h-32 rounded-[48px] bg-gray-50 flex items-center justify-center shadow-inner">
                <Users size={56} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Initialize Consultation</h3>
                <p className="text-gray-500 font-medium max-w-xs">Select a patient from the queue to start recording clinical data.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
