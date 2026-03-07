import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Bell } from "lucide-react";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);

        setNotifications(data || []);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => { fetchNotifications(); }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        await supabase
            .from("notifications")
            .update({ read: true })
            .in("id", unreadIds);

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markOneRead = async (id) => {
        await supabase.from("notifications").update({ read: true }).eq("id", id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
                style={{
                    position: "relative", background: "none", border: "1px solid #E2E8F0",
                    borderRadius: 10, padding: "8px 10px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#4A5568", transition: "background 0.15s",
                }}
                title="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute", top: -6, right: -6,
                        background: "#E53E3E", color: "#fff",
                        fontSize: 10, fontWeight: 700,
                        minWidth: 18, height: 18, borderRadius: 9,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "0 4px", lineHeight: 1,
                    }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "fixed",
                    top: dropdownRef.current
                        ? dropdownRef.current.getBoundingClientRect().bottom + 8
                        : 60,
                    left: dropdownRef.current
                        ? Math.min(
                            dropdownRef.current.getBoundingClientRect().left,
                            window.innerWidth - 330
                        )
                        : 16,
                    width: 320, background: "#fff", borderRadius: 14,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #E2E8F0",
                    zIndex: 99999, overflow: "hidden",
                }}>
                    {/* Header */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", borderBottom: "1px solid #EDF2F7",
                    }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1A202C" }}>
                            Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                style={{ fontSize: 12, color: "#0BC5EA", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "24px 16px", textAlign: "center", color: "#A0AEC0", fontSize: 13 }}>
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => markOneRead(n.id)}
                                    style={{
                                        padding: "12px 16px",
                                        background: n.read ? "#fff" : "#EBF8FF",
                                        borderBottom: "1px solid #F7FAFC",
                                        cursor: "pointer",
                                        transition: "background 0.15s",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: "#1A202C" }}>{n.title}</span>
                                        {!n.read && (
                                            <span style={{
                                                width: 8, height: 8, borderRadius: "50%",
                                                background: "#0BC5EA", flexShrink: 0, marginLeft: 8,
                                            }} />
                                        )}
                                    </div>
                                    <p style={{ fontSize: 12, color: "#4A5568", margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                                    <p style={{ fontSize: 11, color: "#A0AEC0", margin: "4px 0 0" }}>
                                        {new Date(n.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
