import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMsg = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Error sending message" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col h-[80vh]">
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl ${
                msg.role === "user"
                  ? "bg-blue-600 self-end text-right"
                  : "bg-gray-700 self-start text-left"
              }`}
              dangerouslySetInnerHTML={{ __html: msg.content }}
            />
          ))}
          {loading && <div className="text-gray-400 italic">Qlasar is thinking...</div>}
        </div>

        <div className="flex">
          <input
            className="flex-1 p-3 rounded-xl bg-gray-700 outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
