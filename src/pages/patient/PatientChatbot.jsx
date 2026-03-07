import { useState } from "react";
import { supabase } from "../../supabaseClient";

const PatientChatbot = () => {

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hello! I'm your HealthSync assistant. I can help with common medical questions, symptoms, medicines, and appointment guidance. How can I help today?",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {

        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {

            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                }),
            });

            const data = await res.json();

            const botMessage = {
                role: "assistant",
                content: data.reply,
            };

            setMessages((prev) => [...prev, botMessage]);

        } catch (err) {

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, something went wrong. Please try again later.",
                },
            ]);

        }

        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (

        <div className="max-w-4xl mx-auto flex flex-col h-[80vh]">

            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Health Assistant
                </h1>

                <p className="text-gray-500 text-sm">
                    Ask basic medical questions or get guidance. This is not a substitute for professional medical advice.
                </p>
            </div>

            {/* CHAT WINDOW */}

            <div className="flex-1 bg-white rounded-xl shadow p-6 overflow-y-auto space-y-4">

                {messages.map((msg, i) => (

                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >

                        <div
                            className={`px-4 py-3 rounded-lg max-w-[70%] text-sm ${msg.role === "user"
                                    ? "bg-cyan-500 text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {msg.content}
                        </div>

                    </div>

                ))}

                {loading && (
                    <div className="text-gray-400 text-sm">
                        Assistant is typing...
                    </div>
                )}

            </div>

            {/* INPUT */}

            <div className="flex gap-3 mt-4">

                <input
                    type="text"
                    placeholder="Ask about symptoms, medicines, diet..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 border rounded-lg px-4 py-3"
                />

                <button
                    onClick={sendMessage}
                    className="bg-cyan-600 text-white px-6 rounded-lg hover:bg-cyan-700"
                >
                    Send
                </button>

            </div>

        </div>

    );
};

export default PatientChatbot;