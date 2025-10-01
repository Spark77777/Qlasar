import React, { useState } from "react";

export default function ChatWindow({ session }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages([...messages, { type: "user", content: userMsg }]);
    setInput("");

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `message=${encodeURIComponent(userMsg)}`
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: "bot", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { type: "bot", content: "❌ Error: Could not reach server" }]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="p-4 border-b font-semibold">{session.title}</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-md max-w-xs ${
              m.type === "user" ? "bg-teal-200 self-end" : "bg-white self-start"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded-md p-2"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="bg-teal-500 text-white px-4 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
