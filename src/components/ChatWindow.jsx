import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import { Send, Paperclip, X, FileText, Image, Clock } from "lucide-react";

const ChatWindow = ({ booking, currentUserId, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [expired, setExpired] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const bookedAt = new Date(booking.booked_at);
    const expiresAt = new Date(bookedAt.getTime() + 24 * 60 * 60 * 1000);

    // Calculate remaining time
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const diff = expiresAt - now;

            if (diff <= 0) {
                setExpired(true);
                setTimeLeft("Expired");
                return;
            }

            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [booking]);

    // Fetch existing messages
    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("booking_id", booking.id)
                .order("created_at", { ascending: true });

            if (error) toast.error("Failed to load messages");
            else setMessages(data || []);
            setLoading(false);
        };

        fetchMessages();
    }, [booking.id]);

    // Subscribe to realtime
    useEffect(() => {
        const channel = supabase
            .channel(`chat-${booking.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `booking_id=eq.${booking.id}`,
                },
                (payload) => {
                    setMessages((prev) => {
                        // Avoid duplicates
                        if (prev.some((m) => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [booking.id]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || expired) return;

        const { error } = await supabase.from("chat_messages").insert({
            booking_id: booking.id,
            sender_id: currentUserId,
            content: newMsg.trim(),
        });

        if (error) toast.error("Failed to send");
        else setNewMsg("");
    };

    const uploadFile = async (file) => {
        if (!file || expired) return;

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error("File too large (max 10MB)");
            return;
        }

        setUploading(true);
        const ext = file.name.split(".").pop();
        const path = `${booking.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("chat-files")
            .upload(path, file);

        if (uploadError) {
            toast.error("Upload failed");
            setUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage
            .from("chat-files")
            .getPublicUrl(path);

        const isImage = file.type.startsWith("image/");

        const { error } = await supabase.from("chat_messages").insert({
            booking_id: booking.id,
            sender_id: currentUserId,
            content: null,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: isImage ? "image" : "file",
        });

        if (error) toast.error("Failed to send file");
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString([], { day: "numeric", month: "short" });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = formatDate(msg.created_at);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-t-2xl shadow-sm border-b px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="text-gray-400 hover:text-gray-700 transition p-1"
                    >
                        ←
                    </button>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {booking.otherPartyName || "Chat"}
                        </h3>
                        <p className="text-xs text-gray-400">
                            Booked on {new Date(booking.booked_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${expired
                            ? "bg-red-50 text-red-500"
                            : "bg-orange-50 text-orange-600"
                        }`}
                >
                    <Clock size={13} />
                    {timeLeft}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                            <Send size={24} className="text-orange-400" />
                        </div>
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center mb-3">
                                <span className="text-[10px] bg-gray-200 text-gray-500 px-3 py-0.5 rounded-full">
                                    {date}
                                </span>
                            </div>
                            {msgs.map((msg) => {
                                const isMine = msg.sender_id === currentUserId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isMine
                                                    ? "bg-orange-500 text-white rounded-br-md"
                                                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                                                }`}
                                        >
                                            {/* Text content */}
                                            {msg.content && (
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                    {msg.content}
                                                </p>
                                            )}

                                            {/* Image */}
                                            {msg.file_type === "image" && msg.file_url && (
                                                <div className="mt-1">
                                                    <img
                                                        src={msg.file_url}
                                                        alt={msg.file_name}
                                                        className="rounded-xl max-w-full max-h-60 object-cover cursor-pointer hover:opacity-90 transition"
                                                        onClick={() => setPreviewFile(msg)}
                                                    />
                                                    {msg.file_name && (
                                                        <p className={`text-[10px] mt-1 ${isMine ? "text-orange-100" : "text-gray-400"}`}>
                                                            {msg.file_name}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* File */}
                                            {msg.file_type === "file" && msg.file_url && (
                                                <a
                                                    href={msg.file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={`flex items-center gap-2 mt-1 p-2 rounded-lg text-sm ${isMine
                                                            ? "bg-orange-600/30 text-white hover:bg-orange-600/50"
                                                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                        } transition`}
                                                >
                                                    <FileText size={16} />
                                                    <span className="truncate">{msg.file_name || "File"}</span>
                                                </a>
                                            )}

                                            <p
                                                className={`text-[10px] mt-1 ${isMine ? "text-orange-200" : "text-gray-400"
                                                    } text-right`}
                                            >
                                                {formatTime(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview Modal */}
            {previewFile && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setPreviewFile(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/40 transition"
                        onClick={() => setPreviewFile(null)}
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={previewFile.file_url}
                        alt={previewFile.file_name}
                        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white rounded-b-2xl shadow-sm border-t px-4 py-3">
                {expired ? (
                    <div className="text-center py-2">
                        <p className="text-sm text-red-400 font-medium">
                            ⏰ This chat window has expired (24-hour limit reached)
                        </p>
                    </div>
                ) : (
                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                        {/* File upload button */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition"
                        >
                            {uploading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full" />
                            ) : (
                                <Paperclip size={20} />
                            )}
                        </button>

                        {/* Text input */}
                        <input
                            type="text"
                            value={newMsg}
                            onChange={(e) => setNewMsg(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                        />

                        {/* Send button */}
                        <button
                            type="submit"
                            disabled={!newMsg.trim()}
                            className={`p-2.5 rounded-xl transition ${newMsg.trim()
                                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                                    : "bg-gray-100 text-gray-300"
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
