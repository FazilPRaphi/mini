import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { ShieldAlert, ChevronDown, ChevronUp, Clock, User, CheckCircle, AlertCircle, Search } from "lucide-react";

const DoctorComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchComplaints = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setPageLoading(false); return; }
            const { data, error } = await supabase
                .from("complaints")
                .select("*, profiles!complaints_patient_id_fkey(full_name)")
                .eq("doctor_id", user.id)
                .order("created_at", { ascending: false });

            if (!error) setComplaints(data || []);
            setPageLoading(false);
        };
        fetchComplaints();
    }, []);

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    const filteredComplaints = complaints.filter(c =>
        c.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (pageLoading) return <div className="p-10 text-gray-400 font-bold animate-pulse">Scanning incident reports...</div>;

    return (
        <div className="h-full flex flex-col font-redhat animate-fadeIn overflow-hidden">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Incident Management</h1>
                    <p className="text-gray-500 font-medium">Review and resolve patient feedback and complaints.</p>
                </div>
                <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-2xl border border-red-100">
                    <ShieldAlert size={18} className="text-red-500" />
                    <span className="text-sm font-black text-red-700 uppercase tracking-widest">{complaints.length} Reported Events</span>
                </div>
            </header>

            <div className="seba-card flex-1 p-8 flex flex-col overflow-hidden">
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Filter incidents by patient or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none ring-0 focus:ring-2 focus:ring-[#9B51E0] transition-all shadow-inner"
                    />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                    {filteredComplaints.map(c => (
                        <div key={c.id} className="group border border-gray-100 rounded-3xl overflow-hidden transition-all hover:border-[#9B51E0]/30 hover:shadow-xl hover:shadow-purple-100/20">
                            <button
                                onClick={() => toggleExpand(c.id)}
                                className={`w-full flex items-center justify-between p-6 transition-colors ${expandedId === c.id ? "bg-purple-50/50" : "bg-white"}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 ${c.status === "Resolved" ? "bg-green-50 border-green-100 text-green-500" : "bg-orange-50 border-orange-100 text-orange-500"
                                        }`}>
                                        {c.status === "Resolved" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-black text-gray-900 truncate max-w-xs">{c.subject}</h3>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${c.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                                }`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><User size={12} className="text-gray-300" /> {c.profiles?.full_name}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-300" /> {new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-xl border transition-all ${expandedId === c.id ? "bg-[#1A202C] text-white border-transparent" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                                    {expandedId === c.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </button>

                            {expandedId === c.id && (
                                <div className="p-8 bg-gray-50/50 border-t border-gray-100 animate-fadeIn">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Detailed Description</h4>
                                            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-sm font-medium text-gray-700 leading-relaxed shadow-sm">
                                                {c.description}
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-end gap-3">
                                            <button className="w-full py-4 bg-[#1A202C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                                                Mark as Refined
                                            </button>
                                            <button className="w-full py-4 bg-white border border-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                                                Discuss with Patient
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredComplaints.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-gray-300 opacity-50">
                            <ShieldAlert size={64} className="mb-4" />
                            <p className="font-bold uppercase tracking-widest text-xs">Clear history. No incidents to report.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorComplaints;
