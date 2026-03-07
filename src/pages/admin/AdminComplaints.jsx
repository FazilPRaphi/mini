import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | open | resolved
    const [updatingId, setUpdatingId] = useState(null);

    const fetchComplaints = async () => {
        setLoading(true);

        // Step 1: fetch all complaints without a join
        const { data: complaintsData, error: cError } = await supabase
            .from("complaints")
            .select("*")
            .order("created_at", { ascending: false });

        if (cError) {
            toast.error(cError.message);
            setLoading(false);
            return;
        }

        // Step 2: get unique user IDs, then fetch their profiles
        const userIds = [...new Set((complaintsData || []).map(c => c.user_id))];

        let profileMap = {};
        if (userIds.length > 0) {
            const { data: profilesData } = await supabase
                .from("profiles")
                .select("id, full_name, role")
                .in("id", userIds);

            (profilesData || []).forEach(p => { profileMap[p.id] = p; });
        }

        // Step 3: merge profile info into each complaint
        const merged = (complaintsData || []).map(c => ({
            ...c,
            profiles: profileMap[c.user_id] || null,
        }));

        setComplaints(merged);
        setLoading(false);
    };

    useEffect(() => { fetchComplaints(); }, []);

    const toggleStatus = async (id, currentStatus, complaint) => {
        const newStatus = currentStatus === "open" ? "resolved" : "open";
        setUpdatingId(id);

        const { error } = await supabase
            .from("complaints")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success(`Marked as ${newStatus}`);
            setComplaints(prev =>
                prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
            );

            // Send a notification to the user when their complaint is resolved
            if (newStatus === "resolved") {
                const { error: notifError } = await supabase.from("notifications").insert({
                    user_id: complaint.user_id,
                    title: "✅ Complaint Resolved",
                    message: `Your complaint "${complaint.subject}" has been reviewed and marked as resolved by the admin.`,
                    read: false,
                });
                if (notifError) {
                    toast.error(`Notification failed: ${notifError.message}`);
                } else {
                    toast.success("User notified!");
                }
            }
        }
        setUpdatingId(null);
    };

    const filtered = complaints.filter(c => {
        if (filter === "all") return true;
        return c.status === filter;
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Complaints</h2>
                <p className="text-gray-500 mt-1 text-sm">Review and manage all submitted complaints from patients and doctors.</p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Total</p>
                    <p className="text-3xl font-bold text-gray-800">{complaints.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-yellow-500 uppercase mb-1">Open</p>
                    <p className="text-3xl font-bold text-yellow-600">{complaints.filter(c => c.status === "open").length}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-green-500 uppercase mb-1">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{complaints.filter(c => c.status === "resolved").length}</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2">
                {["all", "open", "resolved"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${filter === f
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-500 hover:text-gray-800 border border-gray-200"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* TABLE */}
            {loading ? (
                <p className="text-gray-400">Loading complaints...</p>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100 shadow-sm">
                    No complaints found.
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((c) => (
                        <div key={c.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <span className="font-bold text-gray-800">{c.profiles?.full_name || "Unknown"}</span>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.profiles?.role === "doctor"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-cyan-100 text-cyan-700"
                                            }`}>
                                            {c.profiles?.role || c.user_role}
                                        </span>
                                        <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${c.status === "open"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-green-100 text-green-700"
                                            }`}>
                                            {c.status?.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-gray-700 text-sm mb-1">{c.subject}</p>
                                    <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">{c.message}</p>
                                    <p className="text-xs text-gray-400 mt-3">{new Date(c.created_at).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => toggleStatus(c.id, c.status, c)}
                                    disabled={updatingId === c.id}
                                    className={`shrink-0 text-sm font-semibold px-5 py-2 rounded-xl border transition ${c.status === "open"
                                        ? "border-green-500 text-green-600 hover:bg-green-50"
                                        : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                        } disabled:opacity-50`}
                                >
                                    {updatingId === c.id
                                        ? "Updating..."
                                        : c.status === "open"
                                            ? "Mark Resolved"
                                            : "Reopen"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminComplaints;
